# 📦 Asset Management System API

Sebuah RESTful API sederhana untuk sistem manajemen aset, dibuat menggunakan Node.js, Express, dan MongoDB. Proyek ini cocok untuk digunakan dalam pengelolaan aset internal, peminjaman barang, dan pelacakan pengembalian.

---

## 🚀 Fitur Utama

- 🔐 Autentikasi menggunakan JWT (Login & Register)
- 🧾 CRUD Data Aset
- 📦 Peminjaman & Pengembalian Aset
- ✅ Middleware untuk otorisasi pengguna
- 🛡️ Validasi input dan penanganan error

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB + Mongoose
- **Authentication:** JSON Web Token (JWT)
- **Lainnya:** dotenv, bcryptjs, express-validator, nodemon

---

## 📂 Struktur Folder

```
project-root/
│
├── routes/              # Routing API
│   ├── assetRoutes.js
│   ├── authRoutes.js
│   ├── borrowingRoutes.js
│   └── checkoutRoutes.js
│
├── models/              # Skema MongoDB
│   └── Asset.js
│
├── controllers/         # Logic controller
│
├── middleware/          # Middleware auth dsb.
│
├── .env                 # Konfigurasi lingkungan
├── server.js            # Entry point
└── README.md            # Dokumentasi proyek ini
```

---

## ⚙️ Instalasi

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/username/asset-management-api.git
   cd asset-management-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Buat file `.env`:**
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. **Jalankan server:**
   ```bash
   npm run dev
   ```

---

## 📢 Endpoint API

### Auth
- `POST /api/auth/register` – Register user
- `POST /api/auth/login` – Login user

### Assets
- `GET /api/assets` – Ambil semua aset
- `POST /api/assets` – Tambah aset baru
- `PUT /api/assets/:id` – Update aset
- `DELETE /api/assets/:id` – Hapus aset

### Borrowing
- `POST /api/borrow` – Peminjaman aset
- `PUT /api/return/:id` – Pengembalian aset

---

## 👨‍💻 Kontribusi

Pull request sangat terbuka! Pastikan branch kamu up to date dan telah dites dengan baik sebelum mengajukan PR.

---

## 📄 Lisensi

MajoreIT License © 2025

