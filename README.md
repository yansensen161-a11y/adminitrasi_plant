# Administrasi Plant

Sistem informasi berbasis web yang dikembangkan untuk mempermudah dan mengotomatisasi proses pengelolaan data administrasi dan operasional (khususnya untuk alat berat/unit plant).

## 🚀 Fitur Utama yang Telah Dibangun

1. **Manajemen ABR (Analisa / Pengajuan Anggaran)**
   - Fitur untuk membuat (Create), mengedit (Edit), melihat daftar (Index), dan mencetak (Print) dokumen ABR.
   - Dilengkapi dengan sistem manajemen item ABR dan lampiran gambar (*ABR Images*) untuk bukti pendukung.

2. **Manajemen Anggaran Tenaga Kerja (Manpower Budget)**
   - Pendataan dan pemantauan alokasi tenaga kerja (Manpower) beserta perencanaannya.

3. **Struktur Organisasi (Organization Node)**
   - Pemetaan hierarki dan struktur organisasi untuk kejelasan garis koordinasi di dalam sistem.

4. **Sistem Pelaporan (PDF Reporting)**
   - Pembuatan laporan otomatis (dapat diunduh dalam format PDF) untuk berbagai kebutuhan operasional, antara lain:
     - **Hour Meter Report:** Laporan pemakaian jam operasi unit/alat.
     - **Units Report:** Laporan daftar dan status unit operasional.
     - **Users Report:** Laporan manajemen pengguna aplikasi.

5. **Antarmuka Dashboard yang Modern**
   - Diimplementasikan menggunakan template desain *Mosaic* untuk memberikan antarmuka pengguna (UI) yang interaktif, profesional, dan responsif.

## 📸 Tampilan Antarmuka (Screenshots)

*Catatan: Gambar di bawah ini akan muncul setelah Anda menyimpan file screenshot ke dalam folder aplikasi Anda (misalnya di folder `public/screenshots/`).*

### 1. Halaman Utama (Dashboard)
![Tampilan Dashboard](public/screenshots/dashboard.png)

### 2. Halaman Manajemen ABR
![Tampilan ABR](public/screenshots/abr-index.png)

### 3. Halaman Laporan (Report)
![Tampilan Laporan](public/screenshots/report-pdf.png)

## 🛠️ Teknologi yang Digunakan

- **Backend / Framework Utama:** Laravel (PHP)
- **Frontend:** React.js terintegrasi menggunakan Inertia.js
- **Desain UI:** Tailwind CSS (dengan komponen Mosaic)
- **Build Tool:** Vite

## 📌 Kegunaan Sistem

Aplikasi ini dirancang khusus untuk memenuhi kebutuhan:
- **Digitalisasi Dokumen:** Mengubah pencatatan manual menjadi sistem digital yang terpusat sehingga data lebih aman dan mudah dicari.
- **Transparansi & Akuntabilitas:** Seluruh pengajuan (*ABR*), pencatatan item, dan *Manpower budget* terekam dengan jelas.
- **Kemudahan Monitoring:** Tim manajemen dapat dengan mudah mencetak dan meninjau laporan jam operasi unit (*Hour Meter*) dan kondisi alat kapan saja.

---
*Di-generate pada inisialisasi awal ke repository GitHub (`adminitrasi_plant`).*