<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class P2hController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Dummy Data corresponding to the Mockup
        $p2hData = [
            [
                'id' => 1,
                'date' => '31-Aug-2026',
                'code_unit' => 'ME052',
                'hm' => '12,563.7',
                'hour_meter' => '12,563',
                'total_item_ok' => 24,
                'total_item_caution' => 3,
                'total_item_abnormal' => 1,
                'total_item_total' => 28,
                'pct_ok' => '85.7%',
                'pct_caution' => '10.7%',
                'pct_abnormal' => '3.6%',
                'status' => 'CAUTION',
            ],
            [
                'id' => 2,
                'date' => '30-Aug-2026',
                'code_unit' => 'ME067',
                'hm' => '6,477',
                'hour_meter' => '6,477',
                'total_item_ok' => 23,
                'total_item_caution' => 4,
                'total_item_abnormal' => 1,
                'total_item_total' => 28,
                'pct_ok' => '82.1%',
                'pct_caution' => '14.3%',
                'pct_abnormal' => '3.6%',
                'status' => 'CAUTION',
            ],
            [
                'id' => 3,
                'date' => '29-Aug-2026',
                'code_unit' => 'OHT070',
                'hm' => '16,796.5',
                'hour_meter' => '16,796',
                'total_item_ok' => 21,
                'total_item_caution' => 5,
                'total_item_abnormal' => 2,
                'total_item_total' => 28,
                'pct_ok' => '75.0%',
                'pct_caution' => '17.9%',
                'pct_abnormal' => '7.1%',
                'status' => 'CAUTION',
            ],
            [
                'id' => 4,
                'date' => '28-Aug-2026',
                'code_unit' => 'OHT072',
                'hm' => '16,638.4',
                'hour_meter' => '16,638',
                'total_item_ok' => 25,
                'total_item_caution' => 2,
                'total_item_abnormal' => 1,
                'total_item_total' => 28,
                'pct_ok' => '89.3%',
                'pct_caution' => '7.1%',
                'pct_abnormal' => '3.6%',
                'status' => 'OK',
            ],
            [
                'id' => 5,
                'date' => '27-Aug-2026',
                'code_unit' => 'MDT030',
                'hm' => '10,005',
                'hour_meter' => '10,005',
                'total_item_ok' => 20,
                'total_item_caution' => 5,
                'total_item_abnormal' => 3,
                'total_item_total' => 28,
                'pct_ok' => '71.4%',
                'pct_caution' => '17.9%',
                'pct_abnormal' => '10.7%',
                'status' => 'CAUTION',
            ],
            [
                'id' => 6,
                'date' => '26-Aug-2026',
                'code_unit' => 'MD037',
                'hm' => '14,991',
                'hour_meter' => '14,991',
                'total_item_ok' => 19,
                'total_item_caution' => 6,
                'total_item_abnormal' => 3,
                'total_item_total' => 28,
                'pct_ok' => '67.9%',
                'pct_caution' => '21.4%',
                'pct_abnormal' => '10.7%',
                'status' => 'CAUTION',
            ],
        ];

        $dateFrom = $request->input('dateFrom');
        $dateTo = $request->input('dateTo');
        $codeUnitFilter = $request->input('codeUnitFilter');
        $statusFilter = $request->input('statusFilter');

        $filteredData = collect($p2hData)->filter(function ($item) use ($dateFrom, $dateTo, $codeUnitFilter, $statusFilter) {
            $date = Carbon::createFromFormat('d-M-Y', $item['date']);
            if ($dateFrom && $date->lt(Carbon::parse($dateFrom))) {
                return false;
            }
            if ($dateTo && $date->gt(Carbon::parse($dateTo))) {
                return false;
            }
            if ($codeUnitFilter && $item['code_unit'] !== $codeUnitFilter) {
                return false;
            }
            if ($statusFilter && $item['status'] !== $statusFilter) {
                return false;
            }

            return true;
        })->values()->all();

        return Inertia::render('Planner/P2hMonitoring', [
            'p2hData' => $filteredData,
            'summary' => [
                'total_unit' => count($filteredData),
                'total_item_check' => 28,
                'ok' => ['count' => 72, 'percentage' => '72.0%'],
                'caution' => ['count' => 18, 'percentage' => '18.0%'],
                'abnormal' => ['count' => 10, 'percentage' => '10.0%'],
            ],
            'filters' => [
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
                'codeUnitFilter' => $codeUnitFilter,
                'statusFilter' => $statusFilter,
            ],
        ]);
    }
}
