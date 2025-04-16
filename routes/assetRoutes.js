const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Tambahkan aset baru
// router.post('/', async (req, res) => {
//     try {
//         const { rfidTag, name, description, location, kategori, status, jumlah, unit, product, price, tanggalPembelian, masaGaransi } = req.body;

//         // Validasi jika unit adalah 'pack', maka product harus ada
//         if (unit === 'pack' && (!product || !Array.isArray(product) || product.length === 0)) {
//             return res.status(400).json({ message: 'Product harus diisi jika unit adalah pack' });
//         }

//         // Validasi masa garansi
//         if (masaGaransi && (!masaGaransi.from || !masaGaransi.to)) {
//             return res.status(400).json({ message: 'Masa garansi harus memiliki nilai from dan to' });
//         }

//         const newAsset = new Asset({
//             rfidTag,
//             name,
//             description,
//             location,
//             kategori,
//             status,
//             jumlah,
//             unit,
//             product,
//             price,
//             tanggalPembelian,
//             masaGaransi
//         });

//         await newAsset.save();
//         res.status(201).json(newAsset);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// Contoh endpoint yang hanya bisa diakses oleh admin
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { rfidTag, name, description, location, kategori, status, jumlah, unit, price, tanggalPembelian } = req.body;

        const newAsset = new Asset({
            rfidTag,
            name,
            description,
            location,
            kategori,
            status,
            jumlah,
            unit,
            price,
            tanggalPembelian
        });

        await newAsset.save();
        res.status(201).json(newAsset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Dapatkan semua aset
router.get('/', async (req, res) => {
    try {
        const assets = await Asset.find();
        res.status(200).json(assets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dapatkan aset berdasarkan UID atau EPC
router.get('/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const asset = await Asset.findOne({
            $or: [
                { 'rfidTag.uid': identifier },
                { 'rfidTag.epc': identifier }
            ]
        });

        if (!asset) return res.status(404).json({ message: 'Aset tidak ditemukan' });
        res.status(200).json(asset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Perbarui aset berdasarkan UID atau EPC
router.put('/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const updateData = req.body;

        // Validasi jika unit adalah 'pack', maka product harus ada
        if (updateData.unit === 'pack' && (!updateData.product || !Array.isArray(updateData.product) || updateData.product.length === 0)) {
            return res.status(400).json({ message: 'Product harus diisi jika unit adalah pack' });
        }

        const updatedAsset = await Asset.findOneAndUpdate(
            {
                $or: [
                    { 'rfidTag.uid': identifier },
                    { 'rfidTag.epc': identifier }
                ]
            },
            updateData,
            { new: true }
        );

        if (!updatedAsset) return res.status(404).json({ message: 'Aset tidak ditemukan' });
        res.status(200).json(updatedAsset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Hapus aset berdasarkan UID atau EPC
router.delete('/:identifier', async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const deletedAsset = await Asset.findOneAndDelete({
            $or: [
                { 'rfidTag.uid': identifier },
                { 'rfidTag.epc': identifier }
            ]
        });

        if (!deletedAsset) return res.status(404).json({ message: 'Aset tidak ditemukan' });
        res.status(200).json({ message: 'Aset berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint untuk tracking asset berdasarkan filter
router.get('/track/tags', async (req, res) => {
    try {
        const { name, category, status, location } = req.query;

        // Membuat objek filter berdasarkan query params
        const filter = {};
        if (name) filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search
        if (category) filter.kategori = category;
        if (status) filter.status = status;
        if (location) filter.location = location;

        // Query database dengan filter
        const assets = await Asset.find(filter);

        // Mengembalikan hasil
        res.status(200).json(assets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;