# Walkthrough - Menu & Modul Baru: Form Service Genset & Form Service Dump Truck

Sistem telah dilengkapi dengan modul digitalisasi lembar servis preventif baru sesuai kebutuhan operasional dan dokumen fisik dari pengguna:
1. **Form Service Genset** (2 Halaman - PM Service Sheet Generator Set)
2. **Form Service Dump Truck** (3 Halaman - PM Service Sheet Dump Truck)

---

## 1. Modul Baru: Form Service Genset

### A. Fitur & Karakteristik Utama
- **Dokumen Acuan**: 2 Halaman fisik **PM SERVICE SHEET GENERATOR SET**.
- **Tipe PM Service**:
  - `A` : PM 250 HRS
  - `B` : PM 500 HRS
  - `C` : PM 1000 HRS
  - `D` : PM 2000 HRS
- **Header & Meta Khusus**:
  - `PROJECT ID`, `UNIT ID`, `DATE`, `SHIFT (DS/NS)`
  - `S.M.U / K.M` (mencakup jam kerja dan kilometer)
  - `Name Inspector`
  - Kotak *Perhatian / Caution* (Cuci genset, Tempatkan rata, Danger/Service Tag)
- **Struktur 27 Item Pemeriksaan (Bilingual)**:
  - **ENGINE (18 Item, Halaman 1)**: Dari *Check Engine Oil Level*, *Change Engine Oil & Filters*, *Fuel Filters*, *Air Filters Primary & Secondary*, *Water Separator*, *Day Tank Fuel*, *Drain Water Tank*, *Coolant Level & Replacement*, *Engine Mounts*, *Valve Lash & Valve Rotator*, *Radiator Cap & Core*, hingga *Alternator & Fan Belts*.
  - **MISCELLANEOUS (9 Item, Halaman 2)**: *Indicator & Gauge*, *Battery Level & Terminal*, *Generator Bearing*, *Fan Drive Bearing*, *Shutoff Controls*, *Battery Electrolyte (Tool 1U7298)*, *Hoses & Clamps*, *Oil & Fuel Leakage*, dan *Walk Around Inspection*.
- **Penandatangan Dokumen**:
  - **Inspected by**: *Mechanic / Serviceman*
  - **Acknowledged by**: *Section Head*

### B. Komponen Teknis yang Dibuat & Dimodifikasi
1. **Model**:
   - [`app/Models/PlantForm.php`](file:///d:/Project%205%20m/Project_System_Plant/app/Models/PlantForm.php): Method `getGensetChecklistItems()` dengan 27 item bawaan.
2. **Controller**:
   - [`app/Http/Controllers/GensetServiceController.php`](file:///d:/Project%205%20m/Project_System_Plant/app/Http/Controllers/GensetServiceController.php): Penanganan form `form_type = 'PM-GENSET'`, nomor otomatis `PLT/FRM/PM-GEN/xxx`, print browser, blank print, dan unduh PDF.
3. **Routing**:
   - [`routes/web.php`](file:///d:/Project%205%20m/Project_System_Plant/routes/web.php): Resource routes `/form-service-genset` dan endpoint unduh PDF.
4. **Template PDF**:
   - [`resources/views/pdf/pm-service-sheet-genset.blade.php`](file:///d:/Project%205%20m/Project_System_Plant/resources/views/pdf/pm-service-sheet-genset.blade.php): Template A4 portrait 2 halaman dengan `page-break` presisi 1:1.
5. **Frontend React**:
   - [`resources/js/Pages/GensetService/Index.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/GensetService/Index.jsx): Workspace formulir interaktif lengkap dengan filter interval A-D, progress bar, aksi cepat centang OK, modal riwayat, dan tombol cetak/unduh PDF.
   - [`resources/js/Pages/GensetService/Print.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/GensetService/Print.jsx): Pratinjau cetak browser CSS `@media print` 2 halaman.
6. **Navigasi & Search**:
   - [`resources/js/Partials/Sidebar.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Partials/Sidebar.jsx): Ditambahkan pada menu utama atas, grup **PREVENTIVE MAINTENANCE**, dan sub-menu **Work Order**.
   - [`resources/js/Components/Mosaic/ModalSearch.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Components/Mosaic/ModalSearch.jsx): Ditambahkan pada pencarian global (`Ctrl+K`).

---

## 2. Hasil Verifikasi

1. **Format Kode PHP**:
   - `vendor/bin/pint --format agent` dijalankan: **Passed (Exit code 0)**.
2. **Registrasi Routes**:
   - `php artisan route:list --name=form-service-genset` mengonfirmasi seluruh 10 endpoint aktif.
3. **Kompilasi Frontend**:
   - `npm run build` dijalankan: **Success (Exit code 0)** dengan dukungan otomatis Vite 8 manifest fixer.

---

## 3. Penyesuaian Kolom Indikator Tipe Servis (Bulat ke Centang)
Sesuai permintaan terbaru, seluruh kolom penanda interval tipe servis (A, B, C, D, E) yang sebelumnya menggunakan simbol lingkaran/bulat (`●`) telah diganti secara menyeluruh menjadi simbol centang (`✓`):
- **Form Service Dump Truck**: [`Index.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/DumpTruckService/Index.jsx), [`Print.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/DumpTruckService/Print.jsx), dan template PDF [`pm-service-sheet-dump-truck.blade.php`](file:///d:/Project%205%20m/Project_System_Plant/resources/views/pdf/pm-service-sheet-dump-truck.blade.php).
- **Form Service Genset**: [`Index.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/GensetService/Index.jsx), [`Print.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/GensetService/Print.jsx), dan template PDF [`pm-service-sheet-genset.blade.php`](file:///d:/Project%205%20m/Project_System_Plant/resources/views/pdf/pm-service-sheet-genset.blade.php).
- **Form OHT 773 / Plant Form**: [`Print.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/PlantForm/Print.jsx), [`Create.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/PlantForm/Create.jsx), dan [`Show.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/PlantForm/Show.jsx).

---

## 4. Penyesuaian Kolom Interval Check Sheet Master Form (Bulat ke Centang `✓`, Kotak Tetap Polos)
Sesuai arahan terbaru, seluruh kolom interval servis (`250/750`, `500`, `1000`, `2000`) pada sub-menu **Master Form** telah distandarisasi:
- **Kolom Bulat / Berlaku (`applies = true`)**: Selalu menampilkan tanda centang (`✓`) untuk memperjelas item yang berlaku pada interval tersebut. Pada mode pengisian form aktif, tombol centang dapat diklik untuk toggle status `OK` (berubah menjadi badge hijau zamrud berkilau).
- **Kolom Kotak / Tidak Berlaku (`applies = false`)**: Tetap berupa kotak sel hitam polos (`bg-slate-900 border-slate-800 rounded` / `black-cell`) **tanpa** diberi centang.
- **Sub-Menu Master Form yang Diperbarui**:
  1. **Check Sheet Service** (`/form-check-sheet-service`):
     - Workspace: [`resources/js/Pages/CheckSheetService/Index.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/CheckSheetService/Index.jsx)
     - Print: [`resources/js/Pages/CheckSheetService/Print.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/CheckSheetService/Print.jsx)
     - Template PDF: [`resources/views/pdf/check-sheet-service.blade.php`](file:///d:/Project%205%20m/Project_System_Plant/resources/views/pdf/check-sheet-service.blade.php)
  2. **Check Sheet Service Dozer** (`/form-check-sheet-dozer`):
     - Workspace: [`resources/js/Pages/CheckSheetDozer/Index.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/CheckSheetDozer/Index.jsx)
     - Print: [`resources/js/Pages/CheckSheetDozer/Print.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/CheckSheetDozer/Print.jsx)
     - Template PDF: [`resources/views/pdf/check-sheet-dozer.blade.php`](file:///d:/Project%205%20m/Project_System_Plant/resources/views/pdf/check-sheet-dozer.blade.php)
  3. **Check Sheet Service Motorgrader** (`/form-check-sheet-motorgrader`):
     - Workspace: [`resources/js/Pages/CheckSheetMotorgrader/Index.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/CheckSheetMotorgrader/Index.jsx)
     - Print: [`resources/js/Pages/CheckSheetMotorgrader/Print.jsx`](file:///d:/Project%205%20m/Project_System_Plant/resources/js/Pages/CheckSheetMotorgrader/Print.jsx)
     - Template PDF: [`resources/views/pdf/check-sheet-motorgrader.blade.php`](file:///d:/Project%205%20m/Project_System_Plant/resources/views/pdf/check-sheet-motorgrader.blade.php)


