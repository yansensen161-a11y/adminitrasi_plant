<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PerhitunganManpowerController extends Controller
{
    public function index()
    {
        // Table 1 Data: PERHITUNGAN MP UNIT (NON STAFF)
        $calculations = [
            ['id' => 1, 'unit' => 'Excavator', 'unit_mp' => 13, 'mp_unit' => 13, 'fleet' => 11, 'mainroad' => 2, 'sub_total' => 13, 'ratio' => 9, 'staff' => 2, 'remarks' => '0 - 4000 hrs (0,6)'],
            ['id' => 2, 'unit' => 'Truck Articulated', 'unit_mp' => 2, 'mp_unit' => 2, 'fleet' => 2, 'mainroad' => '-', 'sub_total' => 2, 'ratio' => 1, 'staff' => 1, 'remarks' => '4000 - 8.000 hrs (0,7)'],
            ['id' => 3, 'unit' => 'Truck Heavy Duty', 'unit_mp' => 16, 'mp_unit' => 16, 'fleet' => 13, 'mainroad' => 3, 'sub_total' => 16, 'ratio' => 11, 'staff' => 3, 'remarks' => '8000 - 12.000 hrs (0,8)'],
            ['id' => 4, 'unit' => 'Truck Dump', 'unit_mp' => 27, 'mp_unit' => 24, 'fleet' => 24, 'mainroad' => 3, 'sub_total' => 27, 'ratio' => 19, 'staff' => 5, 'remarks' => '12.000 hrs Up (0,9)'],
            ['id' => 5, 'unit' => 'Motor Grader', 'unit_mp' => 3, 'mp_unit' => 2, 'fleet' => 2, 'mainroad' => 1, 'sub_total' => 3, 'ratio' => 2, 'staff' => 1, 'remarks' => ''],
            ['id' => 6, 'unit' => 'Bulldozer', 'unit_mp' => 9, 'mp_unit' => 8, 'fleet' => 8, 'mainroad' => 1, 'sub_total' => 9, 'ratio' => 6, 'staff' => 2, 'remarks' => ''],
            ['id' => 7, 'unit' => 'MainHaul', 'unit_mp' => 3, 'mp_unit' => 3, 'fleet' => 3, 'mainroad' => '-', 'sub_total' => 3, 'ratio' => 2, 'staff' => 1, 'remarks' => ''],
            ['id' => 8, 'unit' => 'Fuel Truck', 'unit_mp' => 2, 'mp_unit' => 1, 'fleet' => 1, 'mainroad' => 1, 'sub_total' => 2, 'ratio' => 1, 'staff' => 1, 'remarks' => ''],
            ['id' => 9, 'unit' => 'Service Truck', 'unit_mp' => 2, 'mp_unit' => 1, 'fleet' => 1, 'mainroad' => 1, 'sub_total' => 2, 'ratio' => 1, 'staff' => 1, 'remarks' => ''],
            ['id' => 10, 'unit' => 'Water Truck', 'unit_mp' => 2, 'mp_unit' => 1, 'fleet' => 1, 'mainroad' => 1, 'sub_total' => 2, 'ratio' => 1, 'staff' => 1, 'remarks' => ''],
            ['id' => 11, 'unit' => 'Dewatering', 'unit_mp' => 2, 'mp_unit' => 1, 'fleet' => 1, 'mainroad' => 1, 'sub_total' => 2, 'ratio' => 1, 'staff' => 1, 'remarks' => ''],
            ['id' => 12, 'unit' => 'Waterfill', 'unit_mp' => 1, 'mp_unit' => 1, 'fleet' => 1, 'mainroad' => '-', 'sub_total' => 1, 'ratio' => 1, 'staff' => '-', 'remarks' => ''],
            ['id' => 13, 'unit' => 'Crane Truck', 'unit_mp' => 1, 'mp_unit' => 1, 'fleet' => 1, 'mainroad' => '-', 'sub_total' => 1, 'ratio' => 1, 'staff' => '-', 'remarks' => ''],
            ['id' => 14, 'unit' => 'Manitou', 'unit_mp' => 2, 'mp_unit' => '-', 'fleet' => '-', 'mainroad' => 2, 'sub_total' => 2, 'ratio' => 1, 'staff' => 1, 'remarks' => ''],
            ['id' => 15, 'unit' => 'LV', 'unit_mp' => 14, 'mp_unit' => 14, 'fleet' => 14, 'mainroad' => '-', 'sub_total' => 14, 'ratio' => 10, 'staff' => 4, 'remarks' => ''],
        ];

        return Inertia::render('Manpower/Perhitungan', [
            'calculations' => $calculations,
        ]);
    }
}
