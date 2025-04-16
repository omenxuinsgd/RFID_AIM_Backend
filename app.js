require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const assetRoutes = require('./routes/assetRoutes');
const authRoutes = require('./routes/authRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rute API
app.use('/api/assets', assetRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/borrowing', borrowingRoutes);
app.use('/api/checkout', checkoutRoutes);

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Terhubung ke MongoDB');
}).catch((error) => {
    console.error('Kesalahan koneksi MongoDB:', error);
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});