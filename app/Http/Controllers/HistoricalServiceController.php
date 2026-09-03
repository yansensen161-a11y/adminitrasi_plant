<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoricalServiceController extends Controller
{
    public function index(Request $request)
    {
        // Stats matching the mockup precisely
        $stats = [
            'total_service' => 248,
            'completed' => 192,
            'completed_pct' => 77.42,
            'overdue_selesai' => 36,
            'overdue_selesai_pct' => 14.52,
            'cancelled' => 20,
            'cancelled_pct' => 8.06,
        ];

        // Dummy data for table to match the mockup
        $dummyData = [
            ['id' => 1, 'tanggal_service' => '15/06/2024', 'code_unit' => 'EXC-001', 'equipment' => 'Excavator CAT 320D2', 'lokasi' => 'Pit 1', 'tipe_service_plan' => 'PM 1000', 'hm_target' => '9.000', 'hm_actual' => '9.125', 'selisih_hm' => '+125', 'type_service_actual' => 'PM', 'backlog' => 2, 'finding_open' => 1, 'sospap_open' => 0, 'mekanik' => 'Ahmad Firdaus', 'status_service' => 'COMPLETED', 'keterangan' => '-'],
            ['id' => 2, 'tanggal_service' => '20/06/2024', 'code_unit' => 'TRK-015', 'equipment' => 'Dump Truck HD 785-7', 'lokasi' => 'Pit 2', 'tipe_service_plan' => 'PM 2000', 'hm_target' => '16.000', 'hm_actual' => '15.870', 'selisih_hm' => '-130', 'type_service_actual' => 'PM', 'backlog' => 1, 'finding_open' => 0, 'sospap_open' => 1, 'mekanik' => 'Budi Santoso', 'status_service' => 'COMPLETED', 'keterangan' => '-'],
            ['id' => 3, 'tanggal_service' => '25/06/2024', 'code_unit' => 'BDZ-002', 'equipment' => 'Bulldozer D85ESS-2', 'lokasi' => 'Pit 1', 'tipe_service_plan' => 'PM 2000', 'hm_target' => '14.000', 'hm_actual' => '13.950', 'selisih_hm' => '-50', 'type_service_actual' => 'PM', 'backlog' => 3, 'finding_open' => 2, 'sospap_open' => 0, 'mekanik' => 'Ahmad Firdaus', 'status_service' => 'COMPLETED', 'keterangan' => '-'],
            ['id' => 4, 'tanggal_service' => '28/06/2024', 'code_unit' => 'GRD-007', 'equipment' => 'Motor Grader GD 705A-4', 'lokasi' => 'Mainroad', 'tipe_service_plan' => 'PM 1000', 'hm_target' => '10.000', 'hm_actual' => '10.210', 'selisih_hm' => '+210', 'type_service_actual' => 'PM', 'backlog' => 1, 'finding_open' => 1, 'sospap_open' => 0, 'mekanik' => 'Rizky Maulana', 'status_service' => 'COMPLETED', 'keterangan' => '-'],
            ['id' => 5, 'tanggal_service' => '10/05/2024', 'code_unit' => 'FTR-006', 'equipment' => 'Fuel Truck FT 2000', 'lokasi' => 'Jetty', 'tipe_service_plan' => 'PM 1000', 'hm_target' => '6.000', 'hm_actual' => '6.015', 'selisih_hm' => '+15', 'type_service_actual' => 'PM', 'backlog' => 0, 'finding_open' => 0, 'sospap_open' => 0, 'mekanik' => 'Dedi Kurniawan', 'status_service' => 'COMPLETED', 'keterangan' => '-'],
            ['id' => 6, 'tanggal_service' => '15/05/2024', 'code_unit' => 'WTR-003', 'equipment' => 'Water Truck HM 4000', 'lokasi' => 'Pit 3', 'tipe_service_plan' => 'PM 2000', 'hm_target' => '6.000', 'hm_actual' => '6.100', 'selisih_hm' => '+100', 'type_service_actual' => 'PM', 'backlog' => 1, 'finding_open' => 0, 'sospap_open' => 0, 'mekanik' => 'Ahmad Firdaus', 'status_service' => 'COMPLETED', 'keterangan' => '-'],
            ['id' => 7, 'tanggal_service' => '02/06/2024', 'code_unit' => 'CMP-002', 'equipment' => 'Compactor CS-563E', 'lokasi' => 'Pit 2', 'tipe_service_plan' => 'PM 250', 'hm_target' => '2.500', 'hm_actual' => '2.510', 'selisih_hm' => '+10', 'type_service_actual' => 'PM', 'backlog' => 0, 'finding_open' => 0, 'sospap_open' => 0, 'mekanik' => 'Budi Santoso', 'status_service' => 'COMPLETED', 'keterangan' => '-'],
            ['id' => 8, 'tanggal_service' => '01/05/2024', 'code_unit' => 'GEN-001', 'equipment' => 'Genset CAT 3512', 'lokasi' => 'Workshop', 'tipe_service_plan' => 'PM 500', 'hm_target' => '4.000', 'hm_actual' => '3.980', 'selisih_hm' => '-20', 'type_service_actual' => 'PM', 'backlog' => 0, 'finding_open' => 0, 'sospap_open' => 0, 'mekanik' => 'Dedi Kurniawan', 'status_service' => 'COMPLETED', 'keterangan' => '-'],
            ['id' => 9, 'tanggal_service' => '05/04/2024', 'code_unit' => 'TRK-021', 'equipment' => 'Dump Truck HD 785-7', 'lokasi' => 'Pit 2', 'tipe_service_plan' => 'PM 2000', 'hm_target' => '12.000', 'hm_actual' => '11.450', 'selisih_hm' => '-550', 'type_service_actual' => 'PM', 'backlog' => 2, 'finding_open' => 1, 'sospap_open' => 1, 'mekanik' => 'Rizky Maulana', 'status_service' => 'COMPLETED', 'keterangan' => '-'],
            ['id' => 10, 'tanggal_service' => '20/03/2024', 'code_unit' => 'EXC-003', 'equipment' => 'Excavator CAT 336D', 'lokasi' => 'Pit 1', 'tipe_service_plan' => 'PM 2000', 'hm_target' => '12.000', 'hm_actual' => '12.050', 'selisih_hm' => '+50', 'type_service_actual' => 'PM', 'backlog' => 0, 'finding_open' => 0, 'sospap_open' => 0, 'mekanik' => 'Ahmad Firdaus', 'status_service' => 'COMPLETED', 'keterangan' => '-'],
        ];

        $services = [
            'data' => $dummyData,
            'from' => 1,
            'to' => 10,
            'total' => 248,
            'links' => [
                ['url' => null, 'label' => '&laquo; Previous', 'active' => false],
                ['url' => '/historical-services', 'label' => '1', 'active' => true],
                ['url' => '/historical-services?page=2', 'label' => '2', 'active' => false],
                ['url' => '/historical-services?page=3', 'label' => '3', 'active' => false],
                ['url' => '/historical-services?page=4', 'label' => '4', 'active' => false],
                ['url' => '/historical-services?page=5', 'label' => '5', 'active' => false],
                ['url' => '/historical-services?page=2', 'label' => 'Next &raquo;', 'active' => false],
            ],
        ];

        return Inertia::render('HistoricalService/Index', [
            'services' => $services,
            'stats' => $stats,
        ]);
    }
}
