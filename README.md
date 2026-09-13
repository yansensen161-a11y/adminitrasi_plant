# 🏗️ Plant Maintenance System (PLANNER)

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-9553E9?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

**Sistem Manajemen Perawatan Alat Berat — Mining Operation**

</div>

---

## 📋 Tentang Proyek

**PLANNER** adalah sistem informasi manajemen perawatan alat berat (Plant Maintenance System) yang dirancang khusus untuk operasional pertambangan. Sistem ini memungkinkan tim planner, mekanik, dan manajemen untuk memantau, merencanakan, dan mendokumentasikan seluruh kegiatan maintenance secara digital dan real-time.

---

## ✨ Fitur Utama

### 🔧 Manajemen Unit & Populasi
- Data populasi unit alat berat lengkap
- Monitoring Hour Meter (HM) harian
- Histori perawatan per unit (Work Order, Breakdown, Magnetic Plug, Tyre, Budget)
- Export PDF & Excel

### 📋 Work Order & CMMS
- Pembuatan Work Order (Breakdown & Schedule)
- Tracking status WO: Open → Process → Completed
- Monitoring breakdown real-time
- Plan schedule unit

### 🔍 Preventive Maintenance
- Plan Inspection Board
- Plan Service & PM
- Master PM & KPI tracking
- Failure Analysis Report (FAR) dengan foto

### ⚙️ Component & Condition Monitoring
- Monitoring Part Canibal
- Tyre Management (6–10 posisi sesuai jenis unit)
- Magnetic Plug Monitoring
- Oil Consumption Tracking
- PCR U/C Component

### 🛠️ Toolroom
- Inventory Tool
- Peminjaman & Pengembalian Tool
- Inspeksi Tool berkala
- Gate Pass & Scrap

### 👷 Manpower & Organisasi
- Data Manpower Plant
- Struktur Organisasi interaktif
- Perhitungan Manpower
- Roster & Cuti

### 🔐 System & Security
- Role-Based Access Control (RBAC) via Spatie Permission
- User Management (Admin only)
- Activity Log
- Database Schema 3D Visualizer
- Security hardened (no public register, admin-gated routes)

---

## 🎨 Desain & UI

- **Dark Mode & Light Mode** dengan switcher
- Glassmorphism design
- Efek neon pada ikon sidebar (tiap kategori warna berbeda)
- Animasi smooth dengan Framer Motion
- Tipografi premium: Inter + Orbitron
- Favicon & logo custom "PLANNER"

---

## 🚀 Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12, PHP 8.3 |
| Frontend | React 19, Inertia.js 2.x |
| Styling | TailwindCSS 4, Framer Motion |
| Database | MySQL 8 |
| Auth | Laravel Breeze + Spatie Permission |
| Export | Maatwebsite Excel, DomPDF |
| Logging | Spatie Activity Log |

---

## 🔐 Keamanan

- ✅ Registrasi publik dinonaktifkan — user hanya bisa dibuat oleh admin
- ✅ Role middleware pada semua route sensitif (`super-admin|admin`)
- ✅ CSRF Protection aktif global
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Rate limiting login (5 attempt per IP)
- ✅ File upload validasi MIME type (`jpg, jpeg, png, webp`)
- ✅ Mass assignment protection eksplisit di semua model

---

## ⚙️ Instalasi

```bash
# 1. Clone repository
git clone https://github.com/yansension161-a11y/adminitrasi_plant.git
cd adminitrasi_plant

# 2. Install dependencies
composer install
npm install

# 3. Setup environment
cp .env.example .env
php artisan key:generate

# 4. Konfigurasi .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=plant_maintenance
DB_USERNAME=root
DB_PASSWORD=

# 5. Migrate & storage
php artisan migrate
php artisan storage:link

# 6. Build & run
npm run build
php artisan serve
```

### Buat Admin Pertama

```bash
php artisan tinker
```
```php
$user = App\Models\User::create([
    'name'     => 'Admin',
    'email'    => 'admin@planner.com',
    'password' => bcrypt('password123'),
]);
$user->assignRole('super-admin');
```

---

## 🗂️ Struktur Database Utama

| Tabel | Keterangan |
|---|---|
| `units` | Data populasi unit alat berat |
| `hour_meter_logs` | Log HM harian |
| `work_orders` | Work Order Breakdown & Schedule |
| `maintenance_orders` | Monitoring Order List |
| `failure_analyses` | Failure Analysis Report (FAR) |
| `tyres` + `tyre_histories` | Manajemen tyre per unit |
| `tools` | Inventory toolroom |
| `magnetic_plugs` | Data magnetic plug |
| `pcr_ucs` | PCR U/C Component |
| `plan_inspections` | Plan Inspection Board |

---

<div align="center">
Made with ❤️ by <strong>PLANNER Team — Mining Operation</strong>
</div>
