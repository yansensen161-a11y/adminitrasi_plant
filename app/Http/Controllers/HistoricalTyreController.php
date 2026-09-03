<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class HistoricalTyreController extends Controller
{
    public function index()
    {
        // KPI Stats
        $stats = [
            'total_tyre' => 542,
            'completed' => 487,
            'completed_pct' => '89,8%',
            'total_usage_km' => '1.265.430',
            'total_usage_hour' => '8.742',
            'total_cost' => '2.145.870.000',
        ];

        // Bottom Stats
        $bottomStats = [
            'rata_usage_km' => '9.412',
            'rata_usage_hour' => '1.351',
            'total_biaya' => '2.145.870.000',
            'rata_biaya_per_tyre' => '3.957.823',
        ];

        // Table Data (Historical Tyre)
        $data = [
            ['id' => 1, 'tanggal' => '28/08/2024', 'unit' => 'EXC-001', 'lokasi' => 'Pit 1', 'posisi' => 'Front Left', 'serial' => 'BRI23040123', 'tipe' => 'Radial', 'merk' => 'Bridgestone', 'ukuran' => '29.5R25', 'usage_km' => '8.450', 'usage_jam' => '1.245', 'alasan' => 'Tread Aus', 'biaya' => '42.500.000'],
            ['id' => 2, 'tanggal' => '26/08/2024', 'unit' => 'TRK-015', 'lokasi' => 'Pit 2', 'posisi' => 'Rear Right', 'serial' => 'MIT23031211', 'tipe' => 'Radial', 'merk' => 'Michelin', 'ukuran' => '11.00R20', 'usage_km' => '12.360', 'usage_jam' => '1.820', 'alasan' => 'Sidewall Cut', 'biaya' => '18.900.000'],
            ['id' => 3, 'tanggal' => '25/08/2024', 'unit' => 'BDZ-002', 'lokasi' => 'Pit 1', 'posisi' => 'Front Left', 'serial' => 'BRI23021045', 'tipe' => 'Bias', 'merk' => 'Bridgestone', 'ukuran' => '14.00-24', 'usage_km' => '6.210', 'usage_jam' => '980', 'alasan' => 'Tread Aus', 'biaya' => '9.800.000'],
            ['id' => 4, 'tanggal' => '23/08/2024', 'unit' => 'TRK-008', 'lokasi' => 'Pit 3', 'posisi' => 'Rear Left', 'serial' => 'MIT23011567', 'tipe' => 'Radial', 'merk' => 'Michelin', 'ukuran' => '11.00R20', 'usage_km' => '11.780', 'usage_jam' => '1.715', 'alasan' => 'Tread Aus', 'biaya' => '18.900.000'],
            ['id' => 5, 'tanggal' => '22/08/2024', 'unit' => 'HD-785-01', 'lokasi' => 'Mainroad', 'posisi' => 'Front Right', 'serial' => 'YOK23019765', 'tipe' => 'Radial', 'merk' => 'Yokohama', 'ukuran' => '27.00R49', 'usage_km' => '9.850', 'usage_jam' => '1.420', 'alasan' => 'Tread Aus', 'biaya' => '135.000.000'],
            ['id' => 6, 'tanggal' => '20/08/2024', 'unit' => 'GD-705A-01', 'lokasi' => 'Mainroad', 'posisi' => 'Rear Left', 'serial' => 'BRI23015522', 'tipe' => 'Bias', 'merk' => 'Bridgestone', 'ukuran' => '17.5-25', 'usage_km' => '5.620', 'usage_jam' => '750', 'alasan' => 'Tread Aus', 'biaya' => '11.800.000'],
            ['id' => 7, 'tanggal' => '18/08/2024', 'unit' => 'WTK-003', 'lokasi' => 'Workshop', 'posisi' => 'Front Left', 'serial' => 'MIT23017799', 'tipe' => 'Radial', 'merk' => 'Michelin', 'ukuran' => '13R22.5', 'usage_km' => '18.450', 'usage_jam' => '2.360', 'alasan' => 'Irregular Wear', 'biaya' => '24.500.000'],
            ['id' => 8, 'tanggal' => '17/08/2024', 'unit' => 'FTR-006', 'lokasi' => 'Jetty', 'posisi' => 'Rear Right', 'serial' => 'YOK23014533', 'tipe' => 'Radial', 'merk' => 'Yokohama', 'ukuran' => '11.00R20', 'usage_km' => '10.300', 'usage_jam' => '1.480', 'alasan' => 'Sidewall Cut', 'biaya' => '18.900.000'],
            ['id' => 9, 'tanggal' => '15/08/2024', 'unit' => 'CMP-002', 'lokasi' => 'Workshop', 'posisi' => 'Front Right', 'serial' => 'BRI23013144', 'tipe' => 'Bias', 'merk' => 'Bridgestone', 'ukuran' => '10.00-20', 'usage_km' => '4.120', 'usage_jam' => '620', 'alasan' => 'Tread Aus', 'biaya' => '7.200.000'],
            ['id' => 10, 'tanggal' => '12/08/2024', 'unit' => 'GEN-001', 'lokasi' => 'Workshop', 'posisi' => '-', 'serial' => 'MIT23018876', 'tipe' => 'Bias', 'merk' => 'Michelin', 'ukuran' => '7.50-16', 'usage_km' => '2.850', 'usage_jam' => '410', 'alasan' => 'Crack', 'biaya' => '3.400.000'],
        ];

        // Reasons Data
        $reasons = [
            ['name' => 'Tread Aus', 'count' => 321, 'pct' => 58.9],
            ['name' => 'Sidewall Cut', 'count' => 86, 'pct' => 15.8],
            ['name' => 'Irregular Wear', 'count' => 52, 'pct' => 9.5],
            ['name' => 'Crack', 'count' => 38, 'pct' => 7.0],
            ['name' => 'Other', 'count' => 30, 'pct' => 5.5],
        ];

        return Inertia::render('HistoricalTyre/Index', [
            'stats' => $stats,
            'bottomStats' => $bottomStats,
            'data' => $data,
            'reasons' => $reasons,
        ]);
    }
}
