<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KpiController extends Controller
{
    public function index(Request $request)
    {
        // Default to current month if not provided
        $month = $request->input('month', Carbon::now()->format('Y-m'));
        $paPlan = (float) $request->input('target_pa', 90);
        $date = Carbon::createFromFormat('Y-m', $month);

        $dateFromFull = $date->copy()->startOfMonth()->format('Y-m-d 00:00:00');
        $dateToFull = $date->copy()->endOfMonth()->format('Y-m-d 23:59:59');
        $daysInMonth = $date->daysInMonth;

        // 1. Get all units and group them by type_unit
        $units = Unit::orderBy('type_unit')->orderBy('code_unit')->get();
        $groupedUnits = $units->groupBy('type_unit');

        $kpiData = [];
        $index = 1;

        // B-codes mapping (dummy logic since DB doesn't have it fully yet)
        $bCodes = ['B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'];

        foreach ($groupedUnits as $typeUnit => $unitList) {
            if (! $typeUnit) {
                continue;
            } // Skip if type_unit is null

            $typeData = [
                'id' => $index,
                'title' => "1.{$index} ".ucfirst(strtolower($typeUnit)),
                'type_unit' => $typeUnit,
                'breakdown_table' => [],
                'kpi_table' => [],
                'summary_bd' => [],
                'trends' => [
                    'labels' => ['W1', 'W2', 'W3', 'W4'],
                    'pa' => [],
                    'dev_pa' => [],
                    'mtbf' => [],
                    'mttr' => [],
                    'ma' => [],
                ],
            ];

            $summaryBdCounts = array_fill_keys($bCodes, 0);
            $totalBdHoursType = 0;

            // For calculating trend averages for the type
            $trendAverages = [
                'pa' => [75.5, 82.1, 78.4, 85.0],
                'dev_pa' => [80.2, 85.3, 81.5, 88.0],
                'mtbf' => [35, 42, 38, 45],
                'mttr' => [30, 25, 45, 20],
                'ma' => [65, 70, 68, 75],
            ];

            // Randomize trends slightly based on index
            $typeData['trends']['pa'] = array_map(fn ($v) => $v + ($index * 2), $trendAverages['pa']);
            $typeData['trends']['dev_pa'] = array_map(fn ($v) => $v + ($index * 1.5), $trendAverages['dev_pa']);
            $typeData['trends']['mtbf'] = array_map(fn ($v) => $v + ($index * 5), $trendAverages['mtbf']);
            $typeData['trends']['mttr'] = array_map(fn ($v) => $v - ($index * 2), $trendAverages['mttr']);
            $typeData['trends']['ma'] = array_map(fn ($v) => $v + ($index * 2), $trendAverages['ma']);

            $groupTotals = array_fill_keys($bCodes, 0);
            $groupTotalAll = 0;

            // Generate Equipment Groups (dummy categorization based on model/capacity)
            $equipmentGroups = [];
            foreach ($unitList as $u) {
                // Determine group arbitrarily for demo
                $groupName = '01 - GENERAL';
                if (str_contains(strtolower($u->model ?? ''), 'komatsu') || str_contains(strtolower($u->model ?? ''), 'hitachi')) {
                    $groupName = '02 - SMALL DIGGER';
                } elseif (str_contains(strtolower($u->model ?? ''), 'cat') || str_contains(strtolower($u->model ?? ''), 'faw')) {
                    $groupName = '03 - BIG UNIT';
                }

                if (! isset($equipmentGroups[$groupName])) {
                    $equipmentGroups[$groupName] = [];
                }
                $equipmentGroups[$groupName][] = $u;
            }

            ksort($equipmentGroups);

            // Setup 4-week date boundaries
            $wDates = [
                0 => [$date->copy()->startOfMonth(), $date->copy()->startOfMonth()->addDays(6)->endOfDay(), 7 * 24],
                1 => [$date->copy()->startOfMonth()->addDays(7), $date->copy()->startOfMonth()->addDays(13)->endOfDay(), 7 * 24],
                2 => [$date->copy()->startOfMonth()->addDays(14), $date->copy()->startOfMonth()->addDays(20)->endOfDay(), 7 * 24],
                3 => [$date->copy()->startOfMonth()->addDays(21), $date->copy()->endOfMonth(), max(1, ($daysInMonth - 21)) * 24],
            ];

            // Pre-fetch all work orders for this period in a single query to eliminate N+1 queries
            $allUnitIds = $units->pluck('id')->toArray();
            $groupedWos = WorkOrder::whereIn('unit_id', $allUnitIds)
                ->whereBetween('created_at', [$dateFromFull, $dateToFull])
                ->get()
                ->groupBy('unit_id');

            foreach ($equipmentGroups as $groupName => $groupUnits) {
                $groupRow = [
                    'group_name' => $groupName,
                    'units' => [],
                    'group_totals' => array_fill_keys($bCodes, 0),
                    'group_total_all' => 0,
                ];

                foreach ($groupUnits as $unit) {
                    // Fetch actual work orders for this unit from pre-fetched group
                    $wos = $groupedWos->get($unit->id, collect());

                    $totalBdUnit = (float) $wos->whereIn('tipe_wo', ['BD', 'CM'])->sum('durasi_hrs');
                    $eventBd = $wos->whereIn('tipe_wo', ['BD', 'CM'])->count();

                    // Generate B0-B8 breakdown (dummy logic + actual BD hours)
                    $bBreakdown = array_fill_keys($bCodes, 0);
                    if ($totalBdUnit > 0) {
                        // Spread actual hours arbitrarily for visualization
                        $bBreakdown['B0'] = round($totalBdUnit * 0.2, 1);
                        $bBreakdown['B1'] = round($totalBdUnit * 0.5, 1);
                        $bBreakdown['B6'] = round($totalBdUnit * 0.3, 1);
                    } else {
                        // Consistent pseudo-random demo data based on unit code hash
                        $hash = crc32($unit->code_unit.$month) % 100;
                        if ($hash > 70) {
                            $bBreakdown['B0'] = round(2 + ($hash % 8), 1);
                            $bBreakdown['B1'] = round(15 + ($hash % 30), 1);
                            $totalBdUnit = array_sum($bBreakdown);
                            $eventBd = ($hash % 3) + 1;
                        }
                    }

                    $unitRow = [
                        'code_unit' => $unit->code_unit,
                        'b_codes' => $bBreakdown,
                        'total' => round($totalBdUnit, 1),
                    ];
                    $groupRow['units'][] = $unitRow;

                    // Add to group totals
                    foreach ($bCodes as $b) {
                        $groupRow['group_totals'][$b] += $bBreakdown[$b];
                        $groupTotals[$b] += $bBreakdown[$b];
                        $summaryBdCounts[$b] += $bBreakdown[$b];
                    }
                    $groupRow['group_total_all'] += $totalBdUnit;
                    $groupTotalAll += $totalBdUnit;
                    $totalBdHoursType += $totalBdUnit;

                    // KPI Metrics calculation
                    $ewh = $daysInMonth * 24; // Calendar hours
                    $hashOp = abs(crc32($unit->code_unit.'_op_'.$month)) % 350;
                    $opHrs = 150 + $hashOp;
                    $stb = 10 + ($hashOp % 30);
                    $maActual = min(100, max(65, 85 + (($hashOp % 25) - 10)));

                    $paActual = $ewh > 0 ? round((($ewh - $totalBdUnit) / $ewh) * 100, 1) : 0;
                    $paAchv = $paPlan > 0 ? round(($paActual / $paPlan) * 100, 1) : 0;

                    $mtbf = $eventBd > 0 ? round((($opHrs + $stb) / $eventBd), 1) : round($opHrs + $stb, 1);
                    $mttr = $eventBd > 0 ? round(($totalBdUnit / $eventBd), 1) : 0;

                    // Calculate 4 weekly trends for this specific unit
                    $unitWeeklyTrends = [
                        'labels' => ['W1', 'W2', 'W3', 'W4'],
                        'pa' => [],
                        'dev_pa' => [],
                        'mtbf' => [],
                        'mttr' => [],
                        'ma' => [],
                        'bd_hrs' => [],
                    ];

                    for ($w = 0; $w < 4; $w++) {
                        [$wStart, $wEnd, $wHours] = $wDates[$w];
                        $wWos = $wos->filter(fn ($wo) => $wo->created_at >= $wStart && $wo->created_at <= $wEnd);
                        $wBd = (float) $wWos->whereIn('tipe_wo', ['BD', 'CM'])->sum('durasi_hrs');
                        $wEv = $wWos->whereIn('tipe_wo', ['BD', 'CM'])->count();

                        // If no direct WOs but unit has total BD, distribute consistently across weeks
                        if ($totalBdUnit > 0 && $wBd == 0) {
                            $weight = [0.15, 0.40, 0.25, 0.20][$w];
                            $wBd = round($totalBdUnit * $weight, 1);
                            $wEv = $wBd > 0 ? max(1, (int) round($eventBd * $weight)) : 0;
                        }

                        $wPa = $wHours > 0 ? round((($wHours - $wBd) / $wHours) * 100, 1) : 100;
                        $wDev = round($wPa - $paPlan, 1);
                        $wOp = round($opHrs / 4, 1);
                        $wMtbf = $wEv > 0 ? round(($wOp + ($stb / 4)) / $wEv, 1) : round($wOp + ($stb / 4), 1);
                        $wMttr = $wEv > 0 ? round($wBd / $wEv, 1) : 0;
                        $wMa = round(min(100, max(50, $maActual + (($w - 1.5) * 1.8))), 1);

                        $unitWeeklyTrends['pa'][] = max(0, min(100, $wPa));
                        $unitWeeklyTrends['dev_pa'][] = $wDev;
                        $unitWeeklyTrends['mtbf'][] = max(0, $wMtbf);
                        $unitWeeklyTrends['mttr'][] = max(0, $wMttr);
                        $unitWeeklyTrends['ma'][] = max(0, min(100, $wMa));
                        $unitWeeklyTrends['bd_hrs'][] = max(0, $wBd);
                    }

                    $typeData['kpi_table'][] = [
                        'unit' => $unit->code_unit,
                        'model' => $unit->model ?? '-',
                        'start_hm' => $unit->hm,
                        'max_hm' => $unit->hm + $opHrs,
                        'op_hrs' => $opHrs,
                        'ewh' => $ewh,
                        'bd_hrs' => round($totalBdUnit, 1),
                        'event_bd' => $eventBd,
                        'stb' => $stb,
                        'pa_actual' => $paActual,
                        'plan_pa' => $paPlan,
                        'pa_achv' => $paAchv > 100 ? 100 : $paAchv,
                        'ma' => $maActual,
                        'mtbf' => $mtbf,
                        'mtbf_achv' => min(100, round(($mtbf / 50) * 100, 1)),
                        'mttr' => $mttr,
                        'mttr_achv' => $mttr <= 8 ? 100 : round((8 / max(0.1, $mttr)) * 100, 1),
                        'ua' => round(($opHrs / max(1, ($ewh - $totalBdUnit))) * 100, 1),
                        'eu' => round(($opHrs / $ewh) * 100, 1),
                        'trends' => $unitWeeklyTrends,
                    ];
                }
                $typeData['breakdown_table'][] = $groupRow;
            }

            // Overall totals for Breakdown Table
            $typeData['breakdown_totals'] = $groupTotals;
            $typeData['breakdown_total_all'] = round($groupTotalAll, 1);

            // Compute Fleet Trend Averages across all units in this type
            $allUnitsCount = count($typeData['kpi_table']);
            if ($allUnitsCount > 0) {
                $fleetPa = [0, 0, 0, 0];
                $fleetDev = [0, 0, 0, 0];
                $fleetMtbf = [0, 0, 0, 0];
                $fleetMttr = [0, 0, 0, 0];
                $fleetMa = [0, 0, 0, 0];
                $fleetBd = [0, 0, 0, 0];

                foreach ($typeData['kpi_table'] as $kRow) {
                    for ($w = 0; $w < 4; $w++) {
                        $fleetPa[$w] += $kRow['trends']['pa'][$w];
                        $fleetDev[$w] += $kRow['trends']['dev_pa'][$w];
                        $fleetMtbf[$w] += $kRow['trends']['mtbf'][$w];
                        $fleetMttr[$w] += $kRow['trends']['mttr'][$w];
                        $fleetMa[$w] += $kRow['trends']['ma'][$w];
                        $fleetBd[$w] += $kRow['trends']['bd_hrs'][$w];
                    }
                }

                $typeData['trends'] = [
                    'labels' => ['W1', 'W2', 'W3', 'W4'],
                    'pa' => array_map(fn ($sum) => round($sum / $allUnitsCount, 1), $fleetPa),
                    'dev_pa' => array_map(fn ($sum) => round($sum / $allUnitsCount, 1), $fleetDev),
                    'mtbf' => array_map(fn ($sum) => round($sum / $allUnitsCount, 1), $fleetMtbf),
                    'mttr' => array_map(fn ($sum) => round($sum / $allUnitsCount, 1), $fleetMttr),
                    'ma' => array_map(fn ($sum) => round($sum / $allUnitsCount, 1), $fleetMa),
                    'bd_hrs' => array_map(fn ($sum) => round($sum / $allUnitsCount, 1), $fleetBd),
                ];

                // Fleet Highlights (Best / Worst / Averages)
                $paValues = array_column($typeData['kpi_table'], 'pa_actual');
                $bdValues = array_column($typeData['kpi_table'], 'bd_hrs');
                $mtbfValues = array_column($typeData['kpi_table'], 'mtbf');
                $mttrValues = array_column($typeData['kpi_table'], 'mttr');

                $maxPaIdx = array_keys($paValues, max($paValues))[0] ?? 0;
                $minPaIdx = array_keys($paValues, min($paValues))[0] ?? 0;

                $typeData['highlights'] = [
                    'total_units' => $allUnitsCount,
                    'avg_pa' => round(array_sum($paValues) / $allUnitsCount, 1),
                    'target_pa' => 90,
                    'total_bd_hours' => round(array_sum($bdValues), 1),
                    'avg_mtbf' => round(array_sum($mtbfValues) / $allUnitsCount, 1),
                    'avg_mttr' => round(array_sum($mttrValues) / $allUnitsCount, 1),
                    'best_unit' => [
                        'unit' => $typeData['kpi_table'][$maxPaIdx]['unit'],
                        'pa' => $typeData['kpi_table'][$maxPaIdx]['pa_actual'],
                    ],
                    'worst_unit' => [
                        'unit' => $typeData['kpi_table'][$minPaIdx]['unit'],
                        'pa' => $typeData['kpi_table'][$minPaIdx]['pa_actual'],
                        'bd_hrs' => $typeData['kpi_table'][$minPaIdx]['bd_hrs'],
                    ],
                ];
            } else {
                $typeData['highlights'] = [
                    'total_units' => 0,
                    'avg_pa' => 0,
                    'target_pa' => 90,
                    'total_bd_hours' => 0,
                    'avg_mtbf' => 0,
                    'avg_mttr' => 0,
                    'best_unit' => null,
                    'worst_unit' => null,
                ];
            }

            // Summary BD for Pie Chart and Table
            $bdDescriptions = [
                'B0' => 'On progress',
                'B1' => 'W/parts',
                'B2' => 'W/sarana',
                'B3' => 'W/Tools',
                'B4' => 'W/Man Power',
                'B5' => 'Out Site Repair',
                'B6' => 'Production/ abiuse',
                'B7' => 'W/decision Plant',
                'B8' => 'W/decision HO',
            ];

            foreach ($bCodes as $b) {
                $hrs = $summaryBdCounts[$b];
                $pct = $totalBdHoursType > 0 ? round(($hrs / $totalBdHoursType) * 100, 1) : 0;
                if ($hrs > 0) {
                    $typeData['summary_bd'][] = [
                        'type_bd' => $b,
                        'description' => $bdDescriptions[$b],
                        'total_jam' => round($hrs, 1),
                        'pct' => $pct,
                    ];
                }
            }

            $kpiData[] = $typeData;
            $index++;
        }

        return Inertia::render('Kpi/Index', [
            'month' => $month,
            'targetPa' => $paPlan,
            'kpiData' => $kpiData,
        ]);
    }
}
