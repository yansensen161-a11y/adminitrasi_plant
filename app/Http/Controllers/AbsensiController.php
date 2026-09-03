<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class AbsensiController extends Controller
{
    public function index()
    {
        // KPI Stats
        $stats = [
            'total_karyawan' => 156,
            'hadir' => 128,
            'hadir_pct' => '82,05%',
            'telat' => 12,
            'telat_pct' => '7,69%',
            'tidak_hadir' => 14,
            'tidak_hadir_pct' => '8,97%',
            'izin_sakit' => 2,
            'izin_sakit_pct' => '1,28%',
        ];

        // Table Data (Absensi)
        $data = [
            ['id' => 1, 'nrp' => 'MEK-001', 'nama' => 'Budi Santoso', 'departement' => 'Maintenance', 'posisi' => 'Mekanik I', 'jam_masuk' => '07:02', 'jam_pulang' => '16:31', 'status' => 'HADIR', 'keterangan' => '-'],
            ['id' => 2, 'nrp' => 'MEK-002', 'nama' => 'Andi Pratama', 'departement' => 'Maintenance', 'posisi' => 'Mekanik I', 'jam_masuk' => '07:45', 'jam_pulang' => '16:40', 'status' => 'TELAT', 'keterangan' => 'Telat 45 menit'],
            ['id' => 3, 'nrp' => 'MEK-003', 'nama' => 'Candra Wijaya', 'departement' => 'Maintenance', 'posisi' => 'Mekanik II', 'jam_masuk' => '06:55', 'jam_pulang' => '16:28', 'status' => 'HADIR', 'keterangan' => '-'],
            ['id' => 4, 'nrp' => 'MEK-004', 'nama' => 'Dedi Kurniawan', 'departement' => 'Maintenance', 'posisi' => 'Mekanik II', 'jam_masuk' => '-', 'jam_pulang' => '-', 'status' => 'TIDAK HADIR', 'keterangan' => 'Tanpa Keterangan'],
            ['id' => 5, 'nrp' => 'MEK-005', 'nama' => 'Eko Setiawan', 'departement' => 'Maintenance', 'posisi' => 'Mekanik III', 'jam_masuk' => '07:10', 'jam_pulang' => '16:20', 'status' => 'HADIR', 'keterangan' => '-'],
            ['id' => 6, 'nrp' => 'ELC-001', 'nama' => 'Gilang Ramadhan', 'departement' => 'Electrical', 'posisi' => 'Elektrikal I', 'jam_masuk' => '06:48', 'jam_pulang' => '16:15', 'status' => 'HADIR', 'keterangan' => '-'],
            ['id' => 7, 'nrp' => 'ELC-002', 'nama' => 'Heri Susanto', 'departement' => 'Electrical', 'posisi' => 'Elektrikal II', 'jam_masuk' => '07:30', 'jam_pulang' => '16:25', 'status' => 'TELAT', 'keterangan' => 'Telat 30 menit'],
            ['id' => 8, 'nrp' => 'TYR-001', 'nama' => 'Rudi Hermawan', 'departement' => 'Tyre', 'posisi' => 'Tyreman I', 'jam_masuk' => '07:00', 'jam_pulang' => '16:35', 'status' => 'HADIR', 'keterangan' => '-'],
            ['id' => 9, 'nrp' => 'HLR-001', 'nama' => 'Fajar Nugroho', 'departement' => 'Support', 'posisi' => 'Helper', 'jam_masuk' => '-', 'jam_pulang' => '-', 'status' => 'IZIN', 'keterangan' => 'Izin Pribadi'],
            ['id' => 10, 'nrp' => 'ADM-001', 'nama' => 'Siti Aisyah', 'departement' => 'Administration', 'posisi' => 'Admin Plant', 'jam_masuk' => '07:05', 'jam_pulang' => '16:30', 'status' => 'HADIR', 'keterangan' => '-'],
        ];

        // Bulan Ini Stats
        $bulanIni = [
            'hadir' => '2.560',
            'hadir_pct' => '82,05%',
            'telat' => '240',
            'telat_pct' => '7,69%',
            'tidak_hadir' => '280',
            'tidak_hadir_pct' => '8,97%',
            'izin_sakit' => '40',
            'izin_sakit_pct' => '1,28%',
            'total_hari' => '3.120',
        ];

        // Top Telat
        $topTelat = [
            ['nrp' => 'MEK-002', 'nama' => 'Andi Pratama', 'total' => '8 Kali'],
            ['nrp' => 'TRK-003', 'nama' => 'Agus Setiawan', 'total' => '6 Kali'],
            ['nrp' => 'MEK-007', 'nama' => 'Bambang Hidayat', 'total' => '5 Kali'],
            ['nrp' => 'ELC-002', 'nama' => 'Heri Susanto', 'total' => '4 Kali'],
            ['nrp' => 'TYR-002', 'nama' => 'Wahyu Saputra', 'total' => '4 Kali'],
        ];

        // Recent Activities
        $activities = [
            ['title' => 'Absensi 30/08/2024 berhasil disimpan', 'user' => 'Admin Plant', 'time' => '08:15'],
            ['title' => 'Update absensi MEK-002 (Andi Pratama)', 'user' => 'Admin Plant', 'time' => '07:50'],
            ['title' => 'Import absensi dari file Excel', 'user' => 'Admin Plant', 'time' => '07:30'],
            ['title' => 'Tambah keterangan Izin - HLR-001 (Fajar Nugroho)', 'user' => 'Admin Plant', 'time' => '07:10'],
        ];

        return Inertia::render('Absensi/Index', [
            'stats' => $stats,
            'data' => $data,
            'bulanIni' => $bulanIni,
            'topTelat' => $topTelat,
            'activities' => $activities,
        ]);
    }
}
