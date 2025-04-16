const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema(
    {
        user: {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            name: { type: String, required: true } // Menyimpan nama pengguna
        },
        assets: [
            {
                id: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
                name: { type: String, required: true },
                rfidTag: {
                    uid: { type: String, required: true },
                    epc: { type: String, required: true }
                }
            }
        ],
        status: {
            type: String,
            enum: ['borrowed', 'returned'],
            default: 'borrowed'
        },
        borrowDate: {
            type: Date,
            default: Date.now
        },
        returnDate: {
            type: Date,
            default: null
        }
    },
    { timestamps: true } // Menambahkan createdAt dan updatedAt secara otomatis
);

module.exports = mongoose.model('Borrowing', borrowingSchema);