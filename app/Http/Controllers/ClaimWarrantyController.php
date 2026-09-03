<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ClaimWarrantyController extends Controller
{
    public function index()
    {
        // KPI Stats
        $stats = [
            'total_claim' => 86,
            'approved' => 56,
            'approved_pct' => '65,1%',
            'pending' => 18,
            'pending_pct' => '20,9%',
            'rejected' => 12,
            'rejected_pct' => '14,0%',
            'total_value' => '1.245.630.000',
        ];

        // Table Data
        $data = [
            ['id' => 1, 'tanggal' => '28/08/2024', 'no_claim' => 'CLM-2408-001', 'unit' => 'EXC-001', 'part' => 'Hydraulic Pump', 'serial' => 'HP-EXC-001-001', 'supplier' => 'PT. Hydraulic Indo', 'kerusakan' => 'Seal bocor', 'status' => 'APPROVED', 'value' => '125.600.000'],
            ['id' => 2, 'tanggal' => '26/08/2024', 'no_claim' => 'CLM-2408-002', 'unit' => 'TRK-015', 'part' => 'Fuel Injection Pump', 'serial' => 'FIP-TRK-015-01', 'supplier' => 'PT. Diesel Parts', 'kerusakan' => 'Tekanan tidak stabil', 'status' => 'APPROVED', 'value' => '98.750.000'],
            ['id' => 3, 'tanggal' => '24/08/2024', 'no_claim' => 'CLM-2408-003', 'unit' => 'BDZ-002', 'part' => 'Track Link Assy', 'serial' => 'TL-BDZ-002-02', 'supplier' => 'PT. Undercarriage', 'kerusakan' => 'Pin aus', 'status' => 'PENDING', 'value' => '56.300.000'],
            ['id' => 4, 'tanggal' => '20/08/2024', 'no_claim' => 'CLM-2408-004', 'unit' => 'HD-785-01', 'part' => 'Transmission Assy', 'serial' => 'TR-HD-785-01', 'supplier' => 'PT. Komatsu Parts', 'kerusakan' => 'Suara abnormal', 'status' => 'APPROVED', 'value' => '210.450.000'],
            ['id' => 5, 'tanggal' => '18/08/2024', 'no_claim' => 'CLM-2408-005', 'unit' => 'CMP-002', 'part' => 'Air Compressor', 'serial' => 'AC-CMP-002-01', 'supplier' => 'PT. Air Comp Indo', 'kerusakan' => 'Tidak berfungsi', 'status' => 'REJECTED', 'value' => '24.800.000'],
            ['id' => 6, 'tanggal' => '15/08/2024', 'no_claim' => 'CLM-2408-006', 'unit' => 'WTR-003', 'part' => 'Final Drive (Left)', 'serial' => 'FDL-WTR-003-01', 'supplier' => 'PT. Komatsu Parts', 'kerusakan' => 'Oli rembes', 'status' => 'APPROVED', 'value' => '187.900.000'],
            ['id' => 7, 'tanggal' => '13/08/2024', 'no_claim' => 'CLM-2408-007', 'unit' => 'TRK-008', 'part' => 'Brake Chamber', 'serial' => 'BC-TRK-008-01', 'supplier' => 'PT. Brake System', 'kerusakan' => 'Angin bocor', 'status' => 'PENDING', 'value' => '18.650.000'],
            ['id' => 8, 'tanggal' => '10/08/2024', 'no_claim' => 'CLM-2408-008', 'unit' => 'EXC-003', 'part' => 'Main Control Valve', 'serial' => 'MCV-EXC-003-01', 'supplier' => 'PT. Hydraulic Indo', 'kerusakan' => 'Valve macet', 'status' => 'PENDING', 'value' => '153.000.000'],
            ['id' => 9, 'tanggal' => '08/08/2024', 'no_claim' => 'CLM-2408-009', 'unit' => 'GD-705A-01', 'part' => 'Blade Cylinder', 'serial' => 'CYL-GD705A-01', 'supplier' => 'PT. Hydraulic Indo', 'kerusakan' => 'Seal bocor', 'status' => 'APPROVED', 'value' => '42.900.000'],
            ['id' => 10, 'tanggal' => '05/08/2024', 'no_claim' => 'CLM-2408-010', 'unit' => 'GEN-001', 'part' => 'Alternator', 'serial' => 'ALT-GEN-001-01', 'supplier' => 'PT. Electrical Part', 'kerusakan' => 'Charging rendah', 'status' => 'REJECTED', 'value' => '12.380.000'],
        ];

        // Top 5 Parts
        $topParts = [
            ['name' => 'Hydraulic Pump', 'value' => 'Rp 288.050.000', 'pct' => '22,9%'],
            ['name' => 'Transmission Assy', 'value' => 'Rp 210.450.000', 'pct' => '16,9%'],
            ['name' => 'Final Drive Assy', 'value' => 'Rp 187.900.000', 'pct' => '15,1%'],
            ['name' => 'Main Control Valve', 'value' => 'Rp 153.000.000', 'pct' => '12,3%'],
            ['name' => 'Track Link Assy', 'value' => 'Rp 109.200.000', 'pct' => '8,8%'],
        ];

        return Inertia::render('ClaimWarranty/Index', [
            'stats' => $stats,
            'data' => $data,
            'topParts' => $topParts,
        ]);
    }
}
