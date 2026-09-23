<?php

namespace App\Http\Controllers;

use App\Models\ManpowerBudget;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PerhitunganManpowerController extends Controller
{
    public function index()
    {
        $budgets = ManpowerBudget::orderBy('id', 'asc')->get();

        // If empty, auto-seed defaults
        if ($budgets->isEmpty()) {
            $this->seedDefaults();
            $budgets = ManpowerBudget::orderBy('id', 'asc')->get();
        }

        $staffBudgets = $budgets->where('category', 'PLANT STAFF')->values();
        $nonStaffBudgets = $budgets->where('category', 'PLANT NON STAFF')->values();

        // Data Tabel 2: Perhitungan Populasi Unit & Rasio Manpower
        $unitPopulations = [
            ['unit' => 'Exavator', 'fleet' => 13, 'mainroad' => 2],
            ['unit' => 'Truck Articulated', 'fleet' => null, 'mainroad' => null],
            ['unit' => 'Truck Heavy Duty', 'fleet' => 16, 'mainroad' => null],
            ['unit' => 'Truck Dump', 'fleet' => 27, 'mainroad' => 3],
            ['unit' => 'Motor Grader', 'fleet' => 3, 'mainroad' => null],
            ['unit' => 'Bulldozer', 'fleet' => 9, 'mainroad' => null],
            ['unit' => 'MainHaul', 'fleet' => 3, 'mainroad' => null],
            ['unit' => 'Fuel Truck', 'fleet' => 1, 'mainroad' => 1],
            ['unit' => 'Service Truck', 'fleet' => 2, 'mainroad' => null],
            ['unit' => 'Water Truck', 'fleet' => 1, 'mainroad' => 1],
            ['unit' => 'Dewatering', 'fleet' => 3, 'mainroad' => null],
            ['unit' => 'Waterfill', 'fleet' => 2, 'mainroad' => 1],
            ['unit' => 'Crane Truck', 'fleet' => 1, 'mainroad' => null],
            ['unit' => 'Manitou', 'fleet' => null, 'mainroad' => null],
            ['unit' => 'LV', 'fleet' => 14, 'mainroad' => null, 'is_support' => true],
            ['unit' => 'Compact', 'fleet' => 2, 'mainroad' => null, 'is_support' => true],
            ['unit' => 'Tower Lamp', 'fleet' => 10, 'mainroad' => null, 'is_support' => true],
            ['unit' => 'Welding Machine', 'fleet' => 3, 'mainroad' => null, 'is_support' => true],
            ['unit' => 'Air Compressor', 'fleet' => 2, 'mainroad' => null, 'is_support' => true],
            ['unit' => 'Genset', 'fleet' => 3, 'mainroad' => 1, 'is_support' => true],
        ];

        $nonStaffHoursRatios = [
            ['hours' => '0 - 4000 hrs', 'ratio' => '0,6'],
            ['hours' => '4000 - 8.000 hrs', 'ratio' => '0,7'],
            ['hours' => '8000 - 12.000 hrs', 'ratio' => '0,8'],
            ['hours' => '12.000 hrs Up', 'ratio' => '0,9'],
        ];

        return Inertia::render('Manpower/Perhitungan', [
            'staffBudgets' => $staffBudgets,
            'nonStaffBudgets' => $nonStaffBudgets,
            'unitPopulations' => $unitPopulations,
            'nonStaffHoursRatios' => $nonStaffHoursRatios,
            'staffRatio' => '25%',
        ]);
    }

    public function update(Request $request, ManpowerBudget $budget)
    {
        $validated = $request->validate([
            'job_position' => 'required|string|max:255',
            'plan_mp' => 'required|integer|min:0',
            'tersedia' => 'required|integer|min:0',
            'remarks' => 'nullable|string|max:255',
        ]);

        $budget->update($validated);

        return redirect()->back()->with('success', 'Data posisi berhasil diperbarui.');
    }

    public function resetToDefault()
    {
        $this->seedDefaults();

        return redirect()->back()->with('success', 'Data manpower berhasil direset ke standar dokumen.');
    }

    private function seedDefaults()
    {
        ManpowerBudget::truncate();

        $staffData = [
            ['Superintendent Plant', 1, 1],
            ['Maintenance Planner', 2, 2],
            ['Supervisor Plant', 4, 3],
            ['Supervisor Tyre', 1, 1],
            ['Supervisor Electric', 1, 0],
            ['Foreman Mechanic', 6, 5],
            ['Foreman Service', 2, 1],
            ['Foreman Welder', 2, 1],
            ['Foreman Electric', 2, 1],
            ['Foreman Tyre', 1, 1],
        ];

        foreach ($staffData as $item) {
            ManpowerBudget::create([
                'category' => 'PLANT STAFF',
                'job_position' => $item[0],
                'plan_mp' => $item[1],
                'tersedia' => $item[2],
                'remarks' => '',
            ]);
        }

        $nonStaffData = [
            ['Inspection', 2, 0],
            ['Operator Lubecar', 2, 2],
            ['Greasing & Autolube', 4, 0],
            ['Operator Washing Truck', 2, 1],
            ['Washing Man', 4, 4],
            ['Serviceman I', 2, 0],
            ['Serviceman II', 3, 2],
            ['Serviceman III', 5, 4],
            ['Helper Service', 3, 3],
            ['Mechanic I', 4, 3],
            ['Mechanic II', 8, 6],
            ['Mechanic III', 10, 8],
            ['Helper Mekanik', 3, 2],
            ['Welder I', 2, 0],
            ['Welder II', 3, 3],
            ['Welder III', 3, 0],
            ['Helper Welder', 1, 0],
            ['Electrician I', 4, 4],
            ['Electrician II', 2, 0],
            ['Electrician III', 2, 0],
            ['Tyreman I', 2, 0],
            ['Tyreman II', 2, 1],
            ['Tyreman III', 3, 2],
            ['Helper Tyreman', 2, 0],
            ['Operator Crane', 2, 0],
            ['Rigger', 2, 0],
            ['Toolskeeper & Dispacher', 3, 2],
            ['Officer Plant', 1, 1],
            ['Administrasi', 1, 1],
        ];

        foreach ($nonStaffData as $item) {
            ManpowerBudget::create([
                'category' => 'PLANT NON STAFF',
                'job_position' => $item[0],
                'plan_mp' => $item[1],
                'tersedia' => $item[2],
                'remarks' => '',
            ]);
        }
    }
}
