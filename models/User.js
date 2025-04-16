const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Menggunakan bcryptjs

// Skema untuk user
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'auditor', 'user'],
        default: 'user'
    }
});

// Middleware untuk hashing password sebelum menyimpan ke database
userSchema.pre('save', async function (next) {
    // Jika password tidak dimodifikasi, lanjutkan tanpa hashing
    if (!this.isModified('password')) return next();

    try {
        // Hash password menggunakan bcryptjs
        const salt = await bcrypt.genSalt(10); // Generate salt dengan 10 rounds
        this.password = await bcrypt.hash(this.password, salt); // Hash password
        next();
    } catch (error) {
        next(error); // Tangani kesalahan jika terjadi
    }
});

// Metode untuk membandingkan password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        // Bandingkan password input dengan password yang sudah di-hash
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error; // Tangani kesalahan jika terjadi
    }
};

// Buat model dari skema
const User = mongoose.model('User', userSchema);

module.exports = User;