const mongoose = require('mongoose');

// Skema untuk aset
const assetSchema = new mongoose.Schema({
    rfidTag: {
        uid: {
            type: String,
            required: true,
            unique: true
        },
        epc: {
            type: String,
            required: true,
            unique: true
        }
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    location: {
        type: String,
        required: true
    },
    kategori: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'borrowed', 'broken', 'sold out', 'lost', 'maintenance'],
        default: 'available'
    },
    jumlah: {
        type: Number,
        required: true,
        min: 1
    },
    unit: {
        type: String,
        enum: ['pcs', 'pack'],
        required: true
    },
    product: {
        type: [String], // Array of product names, only required if unit is 'pack'
        required: function () {
            return this.unit === 'pack';
        }
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    tanggalPembelian: {
        type: Date,
        required: true
    },
    tanggalPendataan: {
        type: Date,
        default: Date.now
    },
    masaGaransi: {
        from: {
            type: Date,
            required: false
        },
        to: {
            type: Date,
            required: false
        }
    }
});

// Buat model dari skema
const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;