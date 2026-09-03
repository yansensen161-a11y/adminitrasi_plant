<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ForecastPaController extends Controller
{
    public function index()
    {
        // KPI Stats
        $stats = [
            'total_qty' => '1.256',
            'estimasi_nilai' => '2.745.890.000',
            'unit_akan_service' => 86,
            'backlog_open' => 142,
            'urgent' => 37,
        ];

        // Table Data (Forecast PA)
        $data = [
            ['id' => 1, 'code_unit' => 'EXC-001', 'equipment' => 'Excavator CAT 320D2', 'lokasi' => 'Pit 1', 'tipe_service_next' => 'PM 2000', 'hm_target' => '14.000', 'tanggal_estimasi' => '15/06/2024', 'sumber' => 'Next Service', 'item_pa' => 8, 'total_qty' => 22, 'estimasi_nilai' => '48.750.000', 'urgent' => true],
            ['id' => 2, 'code_unit' => 'TRK-015', 'equipment' => 'Dump Truck HD 785-7', 'lokasi' => 'Pit 2', 'tipe_service_next' => 'PM 2000', 'hm_target' => '16.000', 'tanggal_estimasi' => '18/06/2024', 'sumber' => 'Next Service', 'item_pa' => 10, 'total_qty' => 30, 'estimasi_nilai' => '76.250.000', 'urgent' => true],
            ['id' => 3, 'code_unit' => 'BDZ-002', 'equipment' => 'Bulldozer D85ESS-2', 'lokasi' => 'Pit 1', 'tipe_service_next' => 'PM 2000', 'hm_target' => '14.000', 'tanggal_estimasi' => '20/06/2024', 'sumber' => 'Backlog', 'item_pa' => 6, 'total_qty' => 18, 'estimasi_nilai' => '32.400.000', 'urgent' => false],
            ['id' => 4, 'code_unit' => 'GRD-007', 'equipment' => 'Motor Grader GD 705A-4', 'lokasi' => 'Mainroad', 'tipe_service_next' => 'PM 1000', 'hm_target' => '10.000', 'tanggal_estimasi' => '22/06/2024', 'sumber' => 'Next Service', 'item_pa' => 7, 'total_qty' => 15, 'estimasi_nilai' => '28.975.000', 'urgent' => false],
            ['id' => 5, 'code_unit' => 'FTR-006', 'equipment' => 'Fuel Truck FT 2000', 'lokasi' => 'Jetty', 'tipe_service_next' => 'PM 1000', 'hm_target' => '6.000', 'tanggal_estimasi' => '25/06/2024', 'sumber' => 'Backlog', 'item_pa' => 5, 'total_qty' => 12, 'estimasi_nilai' => '15.480.000', 'urgent' => true],
            ['id' => 6, 'code_unit' => 'WTR-003', 'equipment' => 'Water Truck HM 4000', 'lokasi' => 'Pit 3', 'tipe_service_next' => 'PM 2000', 'hm_target' => '6.000', 'tanggal_estimasi' => '28/06/2024', 'sumber' => 'Next Service', 'item_pa' => 6, 'total_qty' => 16, 'estimasi_nilai' => '24.800.000', 'urgent' => false],
            ['id' => 7, 'code_unit' => 'CMP-002', 'equipment' => 'Compactor CS-563E', 'lokasi' => 'Pit 2', 'tipe_service_next' => 'PM 250', 'hm_target' => '2.500', 'tanggal_estimasi' => '30/06/2024', 'sumber' => 'Backlog', 'item_pa' => 4, 'total_qty' => 8, 'estimasi_nilai' => '8.650.000', 'urgent' => false],
            ['id' => 8, 'code_unit' => 'GEN-001', 'equipment' => 'Genset CAT 3512', 'lokasi' => 'Workshop', 'tipe_service_next' => 'PM 500', 'hm_target' => '4.000', 'tanggal_estimasi' => '02/07/2024', 'sumber' => 'Backlog', 'item_pa' => 6, 'total_qty' => 10, 'estimasi_nilai' => '12.600.000', 'urgent' => false],
            ['id' => 9, 'code_unit' => 'TRK-021', 'equipment' => 'Dump Truck HD 785-7', 'lokasi' => 'Pit 2', 'tipe_service_next' => 'PM 2000', 'hm_target' => '12.000', 'tanggal_estimasi' => '05/07/2024', 'sumber' => 'Next Service', 'item_pa' => 9, 'total_qty' => 25, 'estimasi_nilai' => '63.100.000', 'urgent' => true],
            ['id' => 10, 'code_unit' => 'EXC-003', 'equipment' => 'Excavator CAT 336D', 'lokasi' => 'Pit 1', 'tipe_service_next' => 'PM 2000', 'hm_target' => '12.000', 'tanggal_estimasi' => '07/07/2024', 'sumber' => 'Backlog', 'item_pa' => 7, 'total_qty' => 18, 'estimasi_nilai' => '27.030.000', 'urgent' => false],
        ];

        // Categories Table Data
        $categories = [
            ['id' => 1, 'name' => 'Hydraulic System', 'total_item' => 28, 'total_qty' => 188, 'estimasi_nilai' => '621.450.000', 'persen' => '22.6%'],
            ['id' => 2, 'name' => 'Engine System', 'total_item' => 23, 'total_qty' => 204, 'estimasi_nilai' => '558.700.000', 'persen' => '20.3%'],
            ['id' => 3, 'name' => 'Undercarriage', 'total_item' => 19, 'total_qty' => 168, 'estimasi_nilai' => '422.750.000', 'persen' => '15.4%'],
            ['id' => 4, 'name' => 'Electrical System', 'total_item' => 16, 'total_qty' => 120, 'estimasi_nilai' => '315.600.000', 'persen' => '11.5%'],
            ['id' => 5, 'name' => 'Brake System', 'total_item' => 14, 'total_qty' => 96, 'estimasi_nilai' => '208.900.000', 'persen' => '7.6%'],
        ];

        return Inertia::render('ForecastPa/Index', [
            'stats' => $stats,
            'data' => $data,
            'categories' => $categories,
        ]);
    }
}
