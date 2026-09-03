<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class RosterController extends Controller
{
    public function index()
    {
        // KPI Stats
        $stats = [
            'total_mekanik' => 156,
            'shift_siang' => 78,
            'shift_siang_pct' => '50,0%',
            'shift_malam' => 72,
            'shift_malam_pct' => '46,2%',
            'day_off' => 6,
            'day_off_pct' => '3,8%',
            'total_hari' => 31,
            'bulan_tahun' => 'Agustus 2024',
        ];

        // Table Data for Roster (Dummy 1-16 dates)
        $data = [
            ['id' => 1, 'nrp' => 'MEK-001', 'nama' => 'Budi Santoso', 'posisi' => 'Mekanik I', 'shifts' => ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], 'total_shift' => 26],
            ['id' => 2, 'nrp' => 'MEK-002', 'nama' => 'Andi Pratama', 'posisi' => 'Mekanik I', 'shifts' => ['S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S'], 'total_shift' => 26],
            ['id' => 3, 'nrp' => 'MEK-003', 'nama' => 'Candra Wijaya', 'posisi' => 'Mekanik II', 'shifts' => ['S', 'S', 'S', 'S', 'S', 'S', 'O', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'O', 'S'], 'total_shift' => 26],
            ['id' => 4, 'nrp' => 'MEK-004', 'nama' => 'Dedi Kurniawan', 'posisi' => 'Mekanik II', 'shifts' => ['S', 'S', 'S', 'S', 'S', 'O', 'S', 'O', 'S', 'O', 'S', 'S', 'O', 'S', 'S', 'S'], 'total_shift' => 26],
            ['id' => 5, 'nrp' => 'MEK-005', 'nama' => 'Eko Setiawan', 'posisi' => 'Mekanik II', 'shifts' => ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M'], 'total_shift' => 26],
            ['id' => 6, 'nrp' => 'MEK-006', 'nama' => 'Fajar Nugroho', 'posisi' => 'Mekanik II', 'shifts' => ['O', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M'], 'total_shift' => 26],
            ['id' => 7, 'nrp' => 'ELC-001', 'nama' => 'Gilang Ramadhan', 'posisi' => 'Elektrikal I', 'shifts' => ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M'], 'total_shift' => 26],
            ['id' => 8, 'nrp' => 'ELC-002', 'nama' => 'Heri Susanto', 'posisi' => 'Elektrikal II', 'shifts' => ['M', 'M', 'M', 'O', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'M', 'M', 'M', 'M'], 'total_shift' => 26],
        ];

        // Distribution Job Position
        $distribution = [
            ['name' => 'Mekanik I', 'count' => 42, 'color' => 'bg-green-600'],
            ['name' => 'Mekanik II', 'count' => 38, 'color' => 'bg-blue-500'],
            ['name' => 'Mekanik III', 'count' => 28, 'color' => 'bg-yellow-500'],
            ['name' => 'Elektrikal', 'count' => 24, 'color' => 'bg-purple-500'],
            ['name' => 'Tyreman', 'count' => 12, 'color' => 'bg-red-500'],
            ['name' => 'Helper', 'count' => 12, 'color' => 'bg-teal-500'],
        ];

        // Recent Activities
        $activities = [
            ['title' => 'Roster Agustus 2024 berhasil dibuat', 'user' => 'Planner (PLN-001)', 'date' => '30/07/2024 10:20', 'icon' => 'calendar'],
            ['title' => 'Update roster Mekanik I', 'user' => 'Planner (PLN-001)', 'date' => '29/07/2024 16:45', 'icon' => 'edit'],
            ['title' => 'Tambah anggota baru: Rudi Hermawan', 'user' => 'Mekanik II (NRP: MEK-157)', 'date' => '28/07/2024 09:15', 'icon' => 'user-plus'],
            ['title' => 'Export roster Juli 2024', 'user' => 'Admin', 'date' => '25/07/2024 14:30', 'icon' => 'download'],
        ];

        return Inertia::render('Roster/Index', [
            'stats' => $stats,
            'data' => $data,
            'distribution' => $distribution,
            'activities' => $activities,
        ]);
    }
}
