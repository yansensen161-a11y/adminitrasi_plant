<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class SosPapController extends Controller
{
    public function index()
    {
        // KPI Stats
        $stats = [
            'total_temuan' => 356,
            'closed' => 214,
            'closed_pct' => '60,1%',
            'open_in_progress' => 102,
            'open_in_progress_pct' => '28,7%',
            'over_due' => 40,
            'over_due_pct' => '11,2%',
            'estimasi_biaya' => '1.856.250.000',
        ];

        // Summary by Source
        $sumberTemuan = [
            ['id' => 1, 'sumber' => 'PM Service', 'total' => 188, 'closed' => '115 (61,2%)', 'open' => '53 (28,2%)', 'overdue' => '20 (10,6%)'],
            ['id' => 2, 'sumber' => 'Repair', 'total' => 112, 'closed' => '62 (55,4%)', 'open' => '35 (31,3%)', 'overdue' => '15 (13,4%)'],
            ['id' => 3, 'sumber' => 'Breakdown', 'total' => 56, 'closed' => '37 (66,1%)', 'open' => '14 (25,0%)', 'overdue' => '5 (8,9%)'],
        ];

        // Summary Categories
        $kategoriTemuan = [
            ['name' => 'Hydraulic', 'total' => 96, 'pct' => 27.0],
            ['name' => 'Engine', 'total' => 84, 'pct' => 23.6],
            ['name' => 'Electrical', 'total' => 58, 'pct' => 16.3],
            ['name' => 'Undercarriage', 'total' => 46, 'pct' => 12.9],
            ['name' => 'Brake', 'total' => 38, 'pct' => 10.7],
        ];

        // Table Data
        $data = [
            ['id' => 1, 'tanggal' => '15/06/2024', 'unit' => 'EXC-001', 'lokasi' => 'Pit 1', 'tipe_service' => 'PM 1000', 'sumber' => 'PM Service', 'kategori' => 'Hydraulic', 'deskripsi' => 'Seal hydraulic bocor pada cylinder arm', 'prioritas' => 'High', 'status' => 'OPEN', 'target_close' => '22/06/2024', 'tanggal_closed' => '-', 'est_biaya' => '12.500.000', 'pic' => 'Andi'],
            ['id' => 2, 'tanggal' => '15/06/2024', 'unit' => 'TRK-015', 'lokasi' => 'Pit 2', 'tipe_service' => 'PM 500', 'sumber' => 'PM Service', 'kategori' => 'Engine', 'deskripsi' => 'Kebocoran oli pada oil pan', 'prioritas' => 'Medium', 'status' => 'IN PROGRESS', 'target_close' => '25/06/2024', 'tanggal_closed' => '-', 'est_biaya' => '7.800.000', 'pic' => 'Budi'],
            ['id' => 3, 'tanggal' => '16/06/2024', 'unit' => 'BDZ-002', 'lokasi' => 'Pit 1', 'tipe_service' => 'PM 2000', 'sumber' => 'PM Service', 'kategori' => 'Undercarriage', 'deskripsi' => 'Wear pada track link assy', 'prioritas' => 'Medium', 'status' => 'CLOSED', 'target_close' => '20/06/2024', 'tanggal_closed' => '19/06/2024', 'est_biaya' => '18.600.000', 'pic' => 'Candra'],
            ['id' => 4, 'tanggal' => '17/06/2024', 'unit' => 'EXC-001', 'lokasi' => 'Pit 1', 'tipe_service' => 'REPAIR', 'sumber' => 'Repair', 'kategori' => 'Electrical', 'deskripsi' => 'Lampu work light tidak berfungsi', 'prioritas' => 'Low', 'status' => 'CLOSED', 'target_close' => '20/06/2024', 'tanggal_closed' => '18/06/2024', 'est_biaya' => '450.000', 'pic' => 'Andi'],
            ['id' => 5, 'tanggal' => '18/06/2024', 'unit' => 'TRK-008', 'lokasi' => 'Pit 3', 'tipe_service' => 'REPAIR', 'sumber' => 'Repair', 'kategori' => 'Brake', 'deskripsi' => 'Kampas rem aus', 'prioritas' => 'Medium', 'status' => 'OPEN', 'target_close' => '28/06/2024', 'tanggal_closed' => '-', 'est_biaya' => '6.200.000', 'pic' => 'Dedi'],
            ['id' => 6, 'tanggal' => '19/06/2024', 'unit' => 'WTK-003', 'lokasi' => 'Workshop', 'tipe_service' => 'PM 1000', 'sumber' => 'PM Service', 'kategori' => 'Tyre', 'deskripsi' => 'Tekanan ban belakang tidak normal', 'prioritas' => 'Low', 'status' => 'CLOSED', 'target_close' => '22/06/2024', 'tanggal_closed' => '21/06/2024', 'est_biaya' => '250.000', 'pic' => 'Eko'],
            ['id' => 7, 'tanggal' => '20/06/2024', 'unit' => 'HD-785-01', 'lokasi' => 'Pit 2', 'tipe_service' => 'BREAKDOWN', 'sumber' => 'Breakdown', 'kategori' => 'Engine', 'deskripsi' => 'Overheat, radiator bocor', 'prioritas' => 'High', 'status' => 'IN PROGRESS', 'target_close' => '27/06/2024', 'tanggal_closed' => '-', 'est_biaya' => '25.700.000', 'pic' => 'Budi'],
            ['id' => 8, 'tanggal' => '21/06/2024', 'unit' => 'GD-705A-01', 'lokasi' => 'Mainroad', 'tipe_service' => 'PM 1000', 'sumber' => 'PM Service', 'kategori' => 'Hydraulic', 'deskripsi' => 'Selang hydraulic crack', 'prioritas' => 'Medium', 'status' => 'OVER DUE', 'target_close' => '26/06/2024', 'tanggal_closed' => '-', 'est_biaya' => '3.200.000', 'pic' => 'Fajar'],
            ['id' => 9, 'tanggal' => '22/06/2024', 'unit' => 'CMP-002', 'lokasi' => 'Workshop', 'tipe_service' => 'REPAIR', 'sumber' => 'Repair', 'kategori' => 'Pneumatic', 'deskripsi' => 'Kebocoran pada air tank', 'prioritas' => 'Low', 'status' => 'CLOSED', 'target_close' => '26/06/2024', 'tanggal_closed' => '24/06/2024', 'est_biaya' => '1.150.000', 'pic' => 'Rudi'],
            ['id' => 10, 'tanggal' => '23/06/2024', 'unit' => 'EXC-003', 'lokasi' => 'Pit 1', 'tipe_service' => 'PM 2000', 'sumber' => 'PM Service', 'kategori' => 'Structure', 'deskripsi' => 'Guard radiator longgar', 'prioritas' => 'Low', 'status' => 'OPEN', 'target_close' => '28/06/2024', 'tanggal_closed' => '-', 'est_biaya' => '800.000', 'pic' => 'Andi'],
        ];

        return Inertia::render('SosPap/Index', [
            'stats' => $stats,
            'sumberTemuan' => $sumberTemuan,
            'kategoriTemuan' => $kategoriTemuan,
            'data' => $data,
        ]);
    }
}
