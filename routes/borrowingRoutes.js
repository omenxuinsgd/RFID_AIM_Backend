const express = require('express');
const router = express.Router();
const Borrowing = require('../models/Borrowing');
const Asset = require('../models/Asset');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Endpoint untuk meminjam aset
router.post('/borrow', authenticate, authorize(['user']), async (req, res) => {
    try {
        const { rfidTags } = req.body;

        // Validasi input
        if (!rfidTags || !Array.isArray(rfidTags) || rfidTags.length === 0) {
            return res.status(400).json({ message: 'RFID tags are required and must be an array' });
        }

        // Cari aset berdasarkan UID/EPC
        const assets = await Asset.find({
            $or: rfidTags.map(tag => ({
                $or: [
                    { 'rfidTag.uid': tag.uid || '' },
                    { 'rfidTag.epc': tag.epc || '' }
                ]
            }))
        });

        // Validasi status aset
        const unavailableAssets = assets.filter(asset => asset.status !== 'available');
        if (unavailableAssets.length > 0) {
            return res.status(400).json({
                message: 'One or more assets are not available for borrowing',
                unavailableAssets: unavailableAssets.map(asset => ({
                    id: asset._id,
                    name: asset.name,
                    status: asset.status
                }))
            });
        }

        // Ambil detail pengguna dari token JWT
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format data peminjaman
        const borrowedAssets = assets.map(asset => ({
            id: asset._id,
            name: asset.name,
            rfidTag: asset.rfidTag
        }));

        // Buat entri peminjaman baru
        const borrowing = new Borrowing({
            user: {
                _id: user._id,
                name: user.name // Pastikan nama pengguna disertakan
            },
            assets: borrowedAssets,
            status: 'borrowed'
        });

        // Simpan peminjaman
        await borrowing.save();

        // Update status aset menjadi "borrowed"
        await Promise.all(assets.map(asset => {
            asset.status = 'borrowed'; // Pastikan status diubah ke "dipinjam"
            return asset.save();
        }));

        res.status(201).json({
            message: 'Assets borrowed successfully',
            borrowing: {
                _id: borrowing._id,
                borrowerId: user._id,
                borrowerName: user.name,
                borrowedAssets,
                borrowDate: borrowing.borrowDate,
                status: borrowing.status
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint untuk mengembalikan asset
router.post('/return', authenticate, authorize(['user']), async (req, res) => {
    console.log('\n=== START DEBUGGING ===');
    try {
        const { rfidTags } = req.body;
        const userId = req.user.userId;
        console.log('User ID:', userId);
        console.log('RFID Tags:', rfidTags);

        // Validasi input
        if (!rfidTags || !Array.isArray(rfidTags) || rfidTags.length === 0) {
            return res.status(400).json({ message: 'Minimal 1 RFID tag diperlukan' });
        }

        // 1. Temukan aset berdasarkan RFID
        const assetQuery = {
            $or: rfidTags.map(tag => ({
                $or: [
                    { 'rfidTag.uid': tag.uid?.trim() },
                    { 'rfidTag.epc': tag.epc?.trim() }
                ].filter(cond => Object.values(cond)[0])
            })).flat()
        };
        console.log('Asset Query:', JSON.stringify(assetQuery, null, 2));

        const assets = await Asset.find(assetQuery);
        console.log('Found Assets:', assets.length);

        if (assets.length === 0) {
            return res.status(404).json({ message: 'Tidak ada aset ditemukan dengan RFID tersebut' });
        }

        // 2. Temukan peminjaman aktif
        const borrowingQuery = {
            'user._id': userId,
            'status': 'borrowed',
            'assets.id': { $in: assets.map(a => a._id) }
        };
        console.log('Borrowing Query:', JSON.stringify(borrowingQuery, null, 2));

        const borrowings = await Borrowing.find(borrowingQuery);
        console.log('Found Borrowings:', borrowings.length);

        if (borrowings.length === 0) {
            return res.status(404).json({ 
                message: 'Tidak ada peminjaman aktif ditemukan',
                suggestion: 'Pastikan: 1. RFID benar 2. Aset sedang dipinjam 3. Anda adalah peminjamnya'
            });
        }

        // 3. Update data
        const assetIds = assets.map(a => a._id);
        
        // Update Borrowing
        const borrowingUpdate = await Borrowing.updateMany(
            { _id: { $in: borrowings.map(b => b._id) } },
            { 
                $set: { 
                    'assets.$[elem].status': 'returned',
                    status: 'returned',
                    returnDate: new Date()
                }
            },
            { arrayFilters: [{ 'elem.id': { $in: assetIds } }] }
        );
        console.log('Borrowing Update Result:', borrowingUpdate);

        // Update Asset
        const assetUpdate = await Asset.updateMany(
            { _id: { $in: assetIds } },
            { $set: { status: 'available' } }
        );
        console.log('Asset Update Result:', assetUpdate);

        return res.status(200).json({ 
            message: 'Pengembalian berhasil',
            returnedAssets: assets.map(a => a.name),
            returnedAt: new Date()
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            message: 'Gagal memproses pengembalian',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        console.log('\n=== END DEBUGGING ===');
    }
});


module.exports = router;