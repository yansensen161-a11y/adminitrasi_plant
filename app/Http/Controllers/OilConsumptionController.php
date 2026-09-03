<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OilConsumptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Dummy data for the line chart (1 to 31 days)
        $chartData = [
            2.5, 3.2, 2.0, 2.9, 3.3, 3.1, 2.0, 1.9, 2.2, 3.2, 2.5, 2.6, 2.0, 3.3, 2.9,
            3.3, 4.1, 4.2, 6.9, 3.9, 2.6, 4.0, 2.8, 2.9, 4.0, 2.9, 2.9, 3.9, 3.9, 3.4, 2.5,
        ];

        // Dummy Data corresponding to the Mockup Table
        $tableData = [
            [
                'id' => 1,
                'date' => '31-May-2025',
                'code_unit' => 'ME052',
                'model' => 'Mitsubishi Triton',
                'department' => 'Mining',
                'hm' => '125,200',
                'hm_prev' => '124,300',
                'hm_diff' => '900',
                'type_oli' => 'Shell Rimula R4 15W-40',
                'pengisian' => '18.0',
                'konsumsi' => '3.60',
                'l_per_1000' => '4.00',
                'remarks' => 'Normal',
            ],
            [
                'id' => 2,
                'date' => '31-May-2025',
                'code_unit' => 'ME067',
                'model' => 'Mitsubishi Triton',
                'department' => 'Mining',
                'hm' => '64,770',
                'hm_prev' => '63,870',
                'hm_diff' => '900',
                'type_oli' => 'Shell Rimula R4 15W-40',
                'pengisian' => '18.0',
                'konsumsi' => '2.70',
                'l_per_1000' => '3.00',
                'remarks' => 'Normal',
            ],
            [
                'id' => 3,
                'date' => '30-May-2025',
                'code_unit' => 'OHT070',
                'model' => 'Hitachi ZX470',
                'department' => 'Overburden',
                'hm' => '16,796',
                'hm_prev' => '15,795',
                'hm_diff' => '1,000',
                'type_oli' => 'Shell Rimula R6 10W-40',
                'pengisian' => '20.0',
                'konsumsi' => '5.00',
                'l_per_1000' => '5.00',
                'remarks' => 'Perlu Monitoring',
            ],
            [
                'id' => 4,
                'date' => '30-May-2025',
                'code_unit' => 'OHT072',
                'model' => 'Hitachi ZX350',
                'department' => 'Overburden',
                'hm' => '16,638',
                'hm_prev' => '15,638',
                'hm_diff' => '1,000',
                'type_oli' => 'Shell Rimula R6 10W-40',
                'pengisian' => '20.0',
                'konsumsi' => '6.00',
                'l_per_1000' => '6.00',
                'remarks' => 'Perlu Monitoring',
            ],
            [
                'id' => 5,
                'date' => '29-May-2025',
                'code_unit' => 'MDT030',
                'model' => 'Komatsu D85E',
                'department' => 'Overburden',
                'hm' => '10,005',
                'hm_prev' => '9,005',
                'hm_diff' => '1,000',
                'type_oli' => 'Shell Rimula R4 15W-40',
                'pengisian' => '18.0',
                'konsumsi' => '4.50',
                'l_per_1000' => '4.50',
                'remarks' => 'Normal',
            ],
            [
                'id' => 6,
                'date' => '29-May-2025',
                'code_unit' => 'MD037',
                'model' => 'Komatsu WA500',
                'department' => 'Support',
                'hm' => '14,991',
                'hm_prev' => '13,991',
                'hm_diff' => '1,000',
                'type_oli' => 'Shell Rimula R4 15W-40',
                'pengisian' => '18.0',
                'konsumsi' => '5.40',
                'l_per_1000' => '5.40',
                'remarks' => 'Normal',
            ],
        ];

        $dateFrom = $request->input('dateFrom');
        $dateTo = $request->input('dateTo');
        $codeUnitFilter = $request->input('codeUnitFilter');
        $modelFilter = $request->input('modelFilter');
        $typeOliFilter = $request->input('typeOliFilter');
        $departmentFilter = $request->input('departmentFilter');
        $hmFromFilter = $request->input('hmFromFilter');
        $hmToFilter = $request->input('hmToFilter');

        $filteredTableData = collect($tableData)->filter(function ($item) use ($dateFrom, $dateTo, $codeUnitFilter, $modelFilter, $typeOliFilter, $departmentFilter, $hmFromFilter, $hmToFilter) {
            if ($codeUnitFilter && $item['code_unit'] !== $codeUnitFilter) {
                return false;
            }
            if ($modelFilter && $item['model'] !== $modelFilter) {
                return false;
            }
            if ($typeOliFilter && $item['type_oli'] !== $typeOliFilter) {
                return false;
            }
            if ($departmentFilter && $item['department'] !== $departmentFilter) {
                return false;
            }

            if ($hmFromFilter && (float) str_replace(',', '', $item['hm']) < (float) $hmFromFilter) {
                return false;
            }
            if ($hmToFilter && (float) str_replace(',', '', $item['hm']) > (float) $hmToFilter) {
                return false;
            }

            if ($dateFrom || $dateTo) {
                try {
                    $date = Carbon::createFromFormat('d-M-Y', $item['date']);
                    if ($dateFrom && $date->lt(Carbon::parse($dateFrom))) {
                        return false;
                    }
                    if ($dateTo && $date->gt(Carbon::parse($dateTo))) {
                        return false;
                    }
                } catch (\Exception $e) {
                    // Ignore parsing error for dummy data
                }
            }

            return true;
        })->values()->all();

        return Inertia::render('Repair/OilConsumption', [
            'chartData' => $chartData,
            'tableData' => $filteredTableData,
            'summary' => [
                'total_konsumsi' => collect($filteredTableData)->sum(fn ($i) => (float) $i['konsumsi']),
                'avg_1000' => count($filteredTableData) > 0 ? number_format(collect($filteredTableData)->average(fn ($i) => (float) $i['l_per_1000']), 2) : '0.00',
                'target_1000' => '5.00',
                'ok_count' => count($filteredTableData), // Dummy logic
                'high_count' => 0, // Dummy logic
            ],
            'filters' => [
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
                'codeUnitFilter' => $codeUnitFilter,
                'modelFilter' => $modelFilter,
                'typeOliFilter' => $typeOliFilter,
                'departmentFilter' => $departmentFilter,
                'hmFromFilter' => $hmFromFilter,
                'hmToFilter' => $hmToFilter,
            ],
        ]);
    }
}
