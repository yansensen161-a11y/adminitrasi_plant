<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Buku Panduan & Petunjuk Penggunaan Sistem Plant Maintenance</title>
    <style>
        @page {
            margin: 15mm;
            size: a4 portrait;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1f2937;
            font-size: 9pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .header-box {
            text-align: center;
            border-bottom: 2px solid #065f46;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .doc-title {
            font-size: 16pt;
            font-weight: 900;
            color: #065f46;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 4px 0;
        }
        .doc-subtitle {
            font-size: 10pt;
            font-weight: bold;
            color: #374151;
            margin: 0 0 4px 0;
        }
        .doc-meta {
            font-size: 8pt;
            color: #6b7280;
        }

        .chapter-card {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-bottom: 14px;
            page-break-inside: avoid;
            background-color: #fafafa;
        }
        .chapter-header {
            background-color: #f3f4f6;
            border-bottom: 1px solid #e5e7eb;
            padding: 6px 10px;
            font-size: 9.5pt;
            font-weight: bold;
            color: #111827;
        }
        .chapter-body {
            padding: 10px;
            font-size: 8.5pt;
        }
        .chapter-body p {
            margin: 0 0 6px 0;
            text-align: justify;
        }
        .feature-list {
            margin: 4px 0 0 0;
            padding-left: 18px;
            font-size: 8pt;
            color: #374151;
        }
        .feature-list li {
            margin-bottom: 3px;
        }
        .badge {
            display: inline-block;
            background-color: #065f46;
            color: white;
            padding: 1px 5px;
            border-radius: 3px;
            font-size: 7pt;
            font-weight: bold;
            margin-right: 4px;
        }
        .route-code {
            font-family: monospace;
            background-color: #e5e7eb;
            padding: 1px 4px;
            border-radius: 3px;
            font-size: 7.5pt;
            color: #0369a1;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>

    <div class="header-box">
        <div class="doc-title">BUKU PANDUAN PENGGUNA SISTEM PLANT MAINTENANCE</div>
        <div class="doc-subtitle">Standard Operating Procedure & Manual Panduan Terintegrasi (10 Bab)</div>
        <div class="doc-meta">Edisi I / 2026 • Mining Operation Site • Terintegrasi dengan Video Panduan</div>
    </div>

    @php
    $guideChapters = [
        [
            'id' => 1,
            'title' => 'Halaman Login & Keamanan Akses (Authentication)',
            'route' => '/login',
            'desc' => 'Alur autentikasi dan otorisasi aman sebelum mengakses dashboard. Dilengkapi enkripsi kata sandi standar Bcrypt, proteksi CSRF, fitur Session Keep-Alive otomatis, dan sistem Role-Based Access Control (RBAC).',
            'steps' => [
                'Buka peramban (browser) dan akses alamat web sistem.',
                'Masukkan alamat Email dan Password yang telah didaftarkan administrator.',
                'Klik tombol "Log In" untuk masuk. Sistem otomatis mengenali Role Anda dan mengarahkan ke dashboard yang sesuai.',
                'Sesi aktif dilengkapi heartbeat otomatis untuk mencegah hilangnya data saat pengisian form panjang.'
            ]
        ],
        [
            'id' => 2,
            'title' => 'Maintenance Control & Work Orders (Monitoring Breakdown)',
            'route' => '/work-orders',
            'desc' => 'Pusat operasional pencatatan dan pelacakan seluruh tiket perbaikan armada alat berat di workshop maupun lapangan.',
            'steps' => [
                'Tinjau tab "Monitoring Breakdown" untuk melihat daftar unit Breakdown aktif, Waiting Part, Waiting Manpower, dan In Progress.',
                'Gunakan tombol "Create Work Order" untuk menerbitkan tiket perbaikan baru.',
                'Unggah/unduh data massal menggunakan fitur "Download Template" dan "Import Excel".',
                'Status tiket yang telah tuntas dapat ditutup dan tersimpan rapi pada tab "Historical WO Closed".'
            ]
        ],
        [
            'id' => 3,
            'title' => 'Monitoring Orderan & Part Order Lifetime',
            'route' => '/monitoring-orderan',
            'desc' => 'Modul pemantauan pengadaan suku cadang, pelacakan siklus hidup komponen, serta evaluasi konsumsi pelumas dan kanibal suku cadang.',
            'steps' => [
                'Lacak progres Purchase Requisition (PR) dan Purchase Order (PO) per nomor unit.',
                'Pantau persentase sisa usia pakai komponen (hours/KM) untuk melakukan pemesanan suku cadang sebelum batas kritis.',
                'Catat riwayat pelepasan dan pemasangan suku cadang antar unit pada modul Part Canibal.',
                'Monitor konsumsi oli bulanan pada modul Oil Consumption.'
            ]
        ],
        [
            'id' => 4,
            'title' => 'Preventive Maintenance (PM Monitoring, Forecast & P2H)',
            'route' => '/pm-monitoring',
            'desc' => 'Manajemen servis preventif terprogram untuk memastikan keandalan unit dan mencegah breakdown tak terduga.',
            'steps' => [
                'Perbarui input Hour Meter (HM) harian unit untuk mengkalkulasi tanggal proyeksi jatuh tempo servis berkala.',
                'Periksa matriks Plan Inspeksi mingguan armada hauler dan dump truck.',
                'Tinjau laporan digital P2H (Pemeriksaan dan Perawatan Harian) yang diinput operator lapangan.',
                'Catat kondisi keausan rantai/track dan komponen pada modul PCR Undercarriage & PCR Component.'
            ]
        ],
        [
            'id' => 5,
            'title' => 'Tire Operations & TyreVault 3D Dashboard',
            'route' => '/tyres',
            'desc' => 'Manajemen siklus hidup ban armada tambang terintegrasi dengan visualisasi 3D sasis alat berat.',
            'steps' => [
                'Buka visual sasis 3D untuk melihat nomor seri ban yang terpasang pada Posisi 1 hingga Posisi 6.',
                'Input hasil pengecekan tekanan angin (PSI) lapangan pada tab Monitoring Tekanan Ban.',
                'Catat hasil pengukuran ketebalan alur tapak (Remaining Tread Depth) pada tab Inspeksi Ban.',
                'Gunakan fitur rotasi ban untuk mencatat pemindahan posisi ban antar sasis/roda.'
            ]
        ],
        [
            'id' => 6,
            'title' => 'Operational Forms & Standar Keselamatan HSE',
            'route' => '/form-jsa/portal',
            'desc' => 'Pusat dokumen digital check sheet dan form keselamatan kerja standar MAM-HSE-FORM-028.',
            'steps' => [
                'Buka Portal Form JSA untuk membuat analisa keselamatan kerja sebelum pekerjaan maintenance dimulai.',
                'Pilih form servis sesuai tipe alat: Form OHT 773, Service Dump Truck, Dozer, Grader, atau Genset.',
                'Gunakan tombol "Blank Print" untuk mencetak formulir kosong siap bawa ke area workshop lapangan.',
                'Terbitkan Surat Permintaan Komponen (SPK) saat membutuhkan suku cadang resmi dari gudang.'
            ]
        ],
        [
            'id' => 7,
            'title' => 'Toolroom & Special Service Tools (SST) Management',
            'route' => '/toolroom',
            'desc' => 'Tata kelola aset perkakas mekanik, alat ukur presisi, dan instrumen khusus penanganan servis.',
            'steps' => [
                'Cari ketersediaan alat pada master inventaris toolroom.',
                'Catat peminjaman alat dengan menginput NRP mekanik dan waktu pengembalian yang direncanakan.',
                'Pantau jadwal kalibrasi alat ukur agar tidak melewati batas tanggal expired sertifikasi.',
                'Terbitkan Gate Pass Tool jika perkakas perlu dibawa keluar area workshop atau site luar.'
            ]
        ],
        [
            'id' => 8,
            'title' => 'Master Data, Populasi Unit & Gatepass Unit',
            'route' => '/units',
            'desc' => 'Database seluruh aset armada alat berat tambang dan pengendalian mobilisasi unit.',
            'steps' => [
                'Kelola nomor lambung/kode unit, nomor model, serial number mesin, dan spesifikasi pabrikan.',
                'Gunakan fitur "Quick Save HM" untuk menginput jam kerja harian puluhan unit sekaligus dalam satu layar.',
                'Terbitkan surat jalan resmi "Gatepass Unit" ketika unit dimobilisasi ke luar site.',
                'Tandai status kembali (Received) saat unit telah masuk kembali ke area workshop.'
            ]
        ],
        [
            'id' => 9,
            'title' => 'HR, Manpower, Roster Kerja & Cuti Karyawan',
            'route' => '/manpower',
            'desc' => 'Pengelolaan data personel mekanik, giliran kerja tim lapangan, dan administrasi ketenagakerjaan.',
            'steps' => [
                'Kelola biodata personil mekanik, posisi, nomor NRP, departemen, dan kontak darurat.',
                'Tinjau bagan Struktur Organisasi hierarkis plant untuk melihat alur komando workshop.',
                'Atur kalender Roster Kerja giliran shift (sistem 6:2, 5:2, 10:2).',
                'Karyawan mengajukan permohonan cuti periodik dan pencatatan kompensasi transportasi pada modul Cuti.'
            ]
        ],
        [
            'id' => 10,
            'title' => 'Web Settings, Menu Builder & Security Administration',
            'route' => '/settings/menus',
            'desc' => 'Konfigurasi teknis navigasi, hak akses keamanan, dan audit log sistem.',
            'steps' => [
                'Gunakan Menu Builder untuk menyusun urutan menu atau menambah menu baru via drag-and-drop.',
                'Kelola izin dan hak akses tiap role pada modul Role & Permission.',
                'Periksa riwayat perubahan data pada modul Activity Logs untuk keperluan audit kepatuhan.',
                'Pantau relasi struktur tabel database pada modul Database Relasi 3D.'
            ]
        ],
    ];
    @endphp

    @foreach($guideChapters as $index => $ch)
    <div class="chapter-card">
        <div class="chapter-header">
            <span class="badge">BAB {{ $ch['id'] }}</span>
            {{ $ch['title'] }}
            <span style="float: right;" class="route-code">{{ $ch['route'] }}</span>
        </div>
        <div class="chapter-body">
            <p>{{ $ch['desc'] }}</p>
            <strong style="font-size: 8pt; color: #111;">Panduan Langkah Operasional:</strong>
            <ol class="feature-list">
                @foreach($ch['steps'] as $st)
                <li>{{ $st }}</li>
                @endforeach
            </ol>
        </div>
    </div>
    @if($index == 4)
    <div class="page-break"></div>
    @endif
    @endforeach

</body>
</html>
