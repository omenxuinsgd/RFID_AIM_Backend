const express = require('express');
const router = express.Router();
const Checkout = require('../models/Checkout'); // Model Checkout
const Asset = require('../models/Asset'); // Model Asset
const User = require('../models/User'); // Model User
const PaymentService = require('../services/PaymentService'); // Service untuk generate QR Code
const { authenticate } = require('../middleware/authMiddleware');

// Endpoint untuk checkout
router.post('/checkout', authenticate, async (req, res) => {
    try {
        const { rfidTags } = req.body;
        const userId = req.user.userId; // Ambil userId dari token JWT

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

        // Validasi apakah semua aset ditemukan
        if (assets.length !== rfidTags.length) {
            const foundUIDs = assets.map(asset => asset.rfidTag.uid);
            const missingTags = rfidTags.filter(tag => !foundUIDs.includes(tag.uid));
            return res.status(400).json({
                message: 'One or more assets not found',
                missingAssets: missingTags
            });
        }

        // Hitung total harga
        const items = assets.map(asset => ({
            assetId: asset._id,
            name: asset.name,
            price: asset.price
        }));
        const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

        // Generate QR Code untuk pembayaran
        const paymentReference = `REF${Date.now()}`; // Contoh referensi unik
        const paymentQRCode = await PaymentService.generatePaymentQR(totalAmount, paymentReference);

        // Ambil data pengguna (termasuk username)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Simpan data checkout ke database
        const checkoutData = new Checkout({
            user: userId, // ID pengguna
            username: user.name, // Nama pengguna
            items,
            totalAmount,
            paymentStatus: 'pending', // Default status adalah pending
            paymentQRCode
        });

        await checkoutData.save();

        // Kirim respons sukses
        res.status(200).json({
            message: 'Checkout successful',
            totalAmount,
            paymentQRCode,
            items,
            username: user.name // Sertakan nama pengguna di respons
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;