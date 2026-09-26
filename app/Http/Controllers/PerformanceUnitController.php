<?php

namespace App\Http\Controllers;

use App\Models\HourMeterLog;
use App\Models\Unit;
use App\Models\WorkOrder;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PerformanceUnitController extends Controller
{
    /**
     * Map default Budget PA per unit or type.
     */
    private function getBudgetPa(string $codeUnit, ?string $typeUnit): float
    {
        $overrides = [
            'ME023' => 89.0,
            'ME048' => 92.0,
            'ME052' => 80.0,
            'ME053' => 90.0,
            'ME049' => 90.0,
        ];

        if (isset($overrides[strtoupper(trim($codeUnit))])) {
            return $overrides[strtoupper(trim($codeUnit))];
        }

        $type = strtoupper(trim((string) $typeUnit));
        if (str_contains($type, 'EXCAVATOR')) {
            return 90.0;
        }
        if (str_contains($type, 'DUMP TRUCK') || str_contains($type, 'OHT')) {
            return 90.0;
        }
        if (str_contains($type, 'DOZER') || str_contains($type, 'BULLDOZER')) {
            return 90.0;
        }
        if (str_contains($type, 'GRADER')) {
            return 90.0;
        }

        return 90.0;
    }

    /**
     * Generate all ISO weeks for a given year.
     *
     * @return array<int, array{week: int, label: string, short_label: string, date_from: string, date_to: string, year: int}>
     */
    private function getIsoWeeksForYear(int $year): array
    {
        $weeks = [];
        $dec28 = Carbon::createFromDate($year, 12, 28);
        $weeksCount = (int) $dec28->isoWeeksInYear();

        for ($w = 1; $w <= $weeksCount; $w++) {
            $startOfWeek = Carbon::now()->setISODate($year, $w, 1); // Monday
            $endOfWeek = Carbon::now()->setISODate($year, $w, 7);   // Sunday

            $startStr = $startOfWeek->format('d M');
            $endStr = $endOfWeek->format('d M Y');

            $weeks[] = [
                'week' => $w,
                'label' => "W{$w} ({$startStr} - {$endStr})",
                'short_label' => "W{$w}",
                'date_from' => $startOfWeek->format('Y-m-d'),
                'date_to' => $endOfWeek->format('Y-m-d'),
                'year' => $year,
            ];
        }

        return $weeks;
    }

    /**
     * Generate all months for a given year formatted like ISO weeks.
     * e.g. "Januari (01 Jan - 31 Jan 2026)", "September (01 Sep - 30 Sep 2026)"
     *
     * @return array<int, array{month: string, month_num: int, label: string, short_label: string, date_from: string, date_to: string, year: int}>
     */
    private function getMonthsForYear(int $year): array
    {
        $months = [];
        $indonesianMonths = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        for ($m = 1; $m <= 12; $m++) {
            $date = Carbon::createFromDate($year, $m, 1);
            $startStr = $date->copy()->startOfMonth()->format('d M');
            $endStr = $date->copy()->endOfMonth()->format('d M Y');
            $monthCode = $date->format('Y-m');
            $name = $indonesianMonths[$m];

            $months[] = [
                'month' => $monthCode,
                'month_num' => $m,
                'label' => "{$name} ({$startStr} - {$endStr})",
                'short_label' => $name,
                'date_from' => $date->copy()->startOfMonth()->format('Y-m-d'),
                'date_to' => $date->copy()->endOfMonth()->format('Y-m-d'),
                'year' => $year,
            ];
        }

        return $months;
    }

    /**
     * Base query for operational units matching PM Monitoring board.
     * Excludes non-equipment inventory (containers, chainsaws, pipes, welding machines).
     */
    private function getPmMonitoringUnitQuery()
    {
        return Unit::query()
            ->where('code_unit', 'not like', 'BOX KONTAINER%')
            ->where('code_unit', 'not like', 'BOX %')
            ->where('code_unit', 'not like', 'Chainsaw%')
            ->whereNotIn('code_unit', [
                'GORONG2 BESI',
                'MACHINE WELDING +PEMANAS hdpe',
                'MFS001',
                'MFS009',
                'MFS010',
                'MFS011',
                'MFS012',
                'PIPE HDPE',
            ]);
    }

    /**
     * Aggregate performance metrics for all matching units.
     *
     * @return array<string, mixed>
     */
    private function calculatePerformanceData(Request $request): array
    {
        $periodMode = $request->input('period_mode', 'monthly');
        $year = (int) $request->input('year', Carbon::now()->year);
        if ($year < 2000 || $year > 2100) {
            $year = Carbon::now()->year;
        }

        $allIsoWeeks = $this->getIsoWeeksForYear($year);
        $allMonths = $this->getMonthsForYear($year);

        if ($periodMode === 'yearly') {
            $yearDate = Carbon::createFromDate($year, 1, 1);
            $startDateStr = $yearDate->copy()->startOfYear()->format('Y-m-d');
            $endDateStr = $yearDate->copy()->endOfYear()->format('Y-m-d');
            $startDateTime = $yearDate->copy()->startOfYear()->startOfDay();
            $endDateTime = $yearDate->copy()->endOfYear()->endOfDay();
            $daysInPeriod = $yearDate->daysInYear;
            $mohh = $daysInPeriod * 24;
            $periodLabel = "Tahun {$year} (01 Jan - 31 Des {$year})";
            $targetDownHeader = "Yearly ({$year})";
            $selectedIsoWeek = Carbon::now()->isoWeek();
            $selectedMonth = Carbon::now()->format('Y-m');
        } elseif ($periodMode === 'iso_week') {
            $isoWeekNum = (int) $request->input('iso_week', Carbon::now()->isoWeek());
            if ($isoWeekNum < 1 || $isoWeekNum > count($allIsoWeeks)) {
                $isoWeekNum = 1;
            }

            $currentWeekInfo = $allIsoWeeks[$isoWeekNum - 1];
            $startDateStr = $currentWeekInfo['date_from'];
            $endDateStr = $currentWeekInfo['date_to'];
            $startDateTime = Carbon::parse($startDateStr)->startOfDay();
            $endDateTime = Carbon::parse($endDateStr)->endOfDay();
            $daysInPeriod = 7;
            $mohh = 7 * 24; // 168 hours
            $periodLabel = $currentWeekInfo['label'];
            $targetDownHeader = "Weekly (W{$isoWeekNum})";
            $selectedIsoWeek = $isoWeekNum;
            $selectedMonth = Carbon::parse($startDateStr)->format('Y-m');
        } else {
            // Default: 1 Bulan Full (Monthly)
            $periodMode = 'monthly';
            $selectedMonth = $request->input('month', Carbon::now()->format('Y-m'));
            try {
                $monthDate = Carbon::createFromFormat('Y-m', $selectedMonth);
            } catch (\Throwable) {
                $selectedMonth = Carbon::now()->format('Y-m');
                $monthDate = Carbon::createFromFormat('Y-m', $selectedMonth);
            }

            $year = $monthDate->year;
            $allIsoWeeks = $this->getIsoWeeksForYear($year);
            $allMonths = $this->getMonthsForYear($year);

            $startDateStr = $monthDate->copy()->startOfMonth()->format('Y-m-d');
            $endDateStr = $monthDate->copy()->endOfMonth()->format('Y-m-d');
            $startDateTime = $monthDate->copy()->startOfMonth()->startOfDay();
            $endDateTime = $monthDate->copy()->endOfMonth()->endOfDay();
            $daysInPeriod = $monthDate->daysInMonth;
            $mohh = $daysInPeriod * 24;

            $foundMonth = collect($allMonths)->firstWhere('month', $selectedMonth);
            $periodLabel = $foundMonth ? $foundMonth['label'] : $monthDate->translatedFormat('F Y');
            $targetDownHeader = 'Monthly';
            $selectedIsoWeek = Carbon::now()->isoWeek();
        }

        // 1. Build Units Query strictly from PM Monitoring scope
        $unitQuery = $this->getPmMonitoringUnitQuery();

        if ($request->filled('location')) {
            $unitQuery->where('location', $request->location);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $unitQuery->where(function ($q) use ($search) {
                $q->where('code_unit', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('type_unit', 'like', "%{$search}%");
            });
        }

        $allPmUnits = $unitQuery->orderBy('code_unit')->get();

        // Filter by type_unit using resolved standard unit type (e.g. EXCAVATOR BIG DIGGER, etc.)
        if ($request->filled('type_unit')) {
            $selectedType = trim((string) $request->type_unit);
            $units = $allPmUnits->filter(function ($u) use ($selectedType) {
                $standardType = UnitController::resolveStandardUnitType($u->code_unit, $u->model, $u->type_unit);

                return strcasecmp($standardType, $selectedType) === 0 || strcasecmp((string) $u->type_unit, $selectedType) === 0;
            })->values();
        } else {
            $units = $allPmUnits;
        }

        // Distinct types and locations strictly from PM Monitoring units
        $allUnitTypes = $this->getPmMonitoringUnitQuery()
            ->get()
            ->map(fn ($u) => UnitController::resolveStandardUnitType($u->code_unit, $u->model, $u->type_unit))
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->toArray();

        $allLocations = $this->getPmMonitoringUnitQuery()
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->distinct()
            ->orderBy('location')
            ->pluck('location')
            ->values()
            ->toArray();

        if ($units->isEmpty()) {
            return [
                'period_mode' => $periodMode,
                'month' => $selectedMonth,
                'year' => $year,
                'iso_week' => $selectedIsoWeek,
                'date_from' => $startDateStr,
                'date_to' => $endDateStr,
                'days_in_period' => $daysInPeriod,
                'mohh_per_unit' => $mohh,
                'period_label' => $periodLabel,
                'target_down_header' => $targetDownHeader,
                'iso_weeks' => $allIsoWeeks,
                'months' => $allMonths,
                'available_years' => [Carbon::now()->year - 2, Carbon::now()->year - 1, Carbon::now()->year, Carbon::now()->year + 1],
                'presets' => [
                    'current_iso_week' => Carbon::now()->isoWeek(),
                    'current_iso_year' => Carbon::now()->isoWeekYear(),
                    'prev_iso_week' => Carbon::now()->subWeek()->isoWeek(),
                    'prev_iso_year' => Carbon::now()->subWeek()->isoWeekYear(),
                    'current_month' => Carbon::now()->format('Y-m'),
                    'prev_month' => Carbon::now()->subMonth()->format('Y-m'),
                    'current_year' => Carbon::now()->year,
                    'prev_year' => Carbon::now()->subYear()->year,
                ],
                'units' => [],
                'totals' => $this->getEmptyTotals(),
                'unit_types' => $allUnitTypes,
                'locations' => $allLocations,
                'pareto_data' => [],
            ];
        }

        $unitCodes = $units->pluck('code_unit')->filter()->values()->toArray();
        $unitIds = $units->pluck('id')->filter()->values()->toArray();

        // 2. Fetch Hour Meter Logs for the period
        $hmLogs = HourMeterLog::whereBetween('log_date', [$startDateStr, $endDateStr])
            ->where(function ($q) use ($unitCodes, $unitIds) {
                $q->whereIn('code_unit', $unitCodes)
                    ->orWhereIn('unit_id', $unitIds);
            })
            ->get();

        $hmLogsByUnitId = $hmLogs->groupBy('unit_id');
        $hmLogsByCode = $hmLogs->groupBy('code_unit');

        // 3. Fetch Work Orders for the period with tasks
        $workOrders = WorkOrder::with('tasks')
            ->where(function ($q) use ($startDateTime, $endDateTime, $startDateStr, $endDateStr) {
                $q->whereBetween('waktu_breakdown', [$startDateTime, $endDateTime])
                    ->orWhereBetween('request_date', [$startDateStr, $endDateStr])
                    ->orWhereBetween('created_at', [$startDateTime, $endDateTime]);
            })
            ->where(function ($q) use ($unitIds) {
                $q->whereIn('unit_id', $unitIds);
            })
            ->get();

        $workOrdersByUnitId = $workOrders->groupBy('unit_id');

        // 4. Calculate for each unit
        $calculatedUnits = [];
        $totalUnitsCount = 0;
        $sumBudgetPa = 0.0;
        $totalMohh = 0.0;
        $totalTargetDown = 0.0;
        $totalWh = 0.0;
        $totalStb = 0.0;
        $totalSch = 0.0;
        $totalUns = 0.0;
        $totalAcc = 0.0;
        $totalLd = 0.0;
        $totalB = [
            'B0' => 0.0,
            'B1' => 0.0,
            'B2' => 0.0,
            'B3' => 0.0,
            'B4' => 0.0,
            'B5' => 0.0,
            'B6' => 0.0,
            'B7' => 0.0,
            'B8' => 0.0,
        ];
        $totalBdAll = 0.0;
        $totalEventsAll = 0;

        foreach ($units as $unit) {
            $totalUnitsCount++;
            $uId = $unit->id;
            $code = $unit->code_unit;
            $standardType = UnitController::resolveStandardUnitType($code, $unit->model, $unit->type_unit);

            // Budget PA
            $budgetPa = $this->getBudgetPa($code, $standardType);
            $sumBudgetPa += $budgetPa;

            // Target Down = (1 - Budget_PA / 100) * MOHH
            $targetDown = round((1 - ($budgetPa / 100)) * $mohh, 1);
            $totalTargetDown += $targetDown;
            $totalMohh += $mohh;

            // HM Reading Start & End
            $uLogs = $hmLogsByUnitId->get($uId) ?? $hmLogsByCode->get($code) ?? collect();

            $minStart = null;
            $maxEnd = null;

            if ($uLogs->isNotEmpty()) {
                $validStarts = $uLogs->filter(fn ($l) => $l->hm_start !== null && (float) $l->hm_start > 0);
                if ($validStarts->isNotEmpty()) {
                    $minStart = (float) $validStarts->min('hm_start');
                }

                $validEnds = $uLogs->filter(fn ($l) => $l->hm_end !== null && (float) $l->hm_end > 0);
                if ($validEnds->isNotEmpty()) {
                    $maxEnd = (float) $validEnds->max('hm_end');
                }
            }

            if ($minStart === null) {
                $minStart = $unit->hm ? (float) $unit->hm : 0.0;
            }
            if ($maxEnd === null) {
                $maxEnd = $unit->hm ? (float) $unit->hm : 0.0;
            }

            // WH (Working Hours)
            $wh = 0.0;
            if ($maxEnd > $minStart) {
                $wh = round($maxEnd - $minStart, 1);
            } elseif ($uLogs->isNotEmpty()) {
                $wh = round((float) $uLogs->sum('hm_total'), 1);
            }

            // Work Orders & Breakdown Hours
            $uWos = $workOrdersByUnitId->get($uId) ?? collect();

            $schHours = 0.0;
            $unsHours = 0.0;
            $accHours = 0.0;
            $ldHours = 0.0;

            $bHours = [
                'B0' => 0.0,
                'B1' => 0.0,
                'B2' => 0.0,
                'B3' => 0.0,
                'B4' => 0.0,
                'B5' => 0.0,
                'B6' => 0.0,
                'B7' => 0.0,
                'B8' => 0.0,
            ];

            $eventBdCount = $uWos->count();

            foreach ($uWos as $wo) {
                $woDuration = (float) ($wo->durasi_hrs ?: 0);
                $dtCode = strtoupper(trim((string) $wo->downtime_code));
                $woType = strtoupper(trim((string) $wo->tipe_wo));

                // Categorize SCH / UNS / ACC / LD
                if ($dtCode === 'SCHEDULE' || str_contains($woType, 'PM') || str_contains($woType, 'INSPECTION') || str_contains($woType, 'SERVICE') || str_contains($woType, 'OVERHAUL')) {
                    $schHours += $woDuration;
                } elseif ($dtCode === 'ACCIDENT') {
                    $accHours += $woDuration;
                } elseif ($dtCode === 'OPPORTUNITY' || $dtCode === 'LACK OF DEMAND' || $dtCode === 'LD') {
                    $ldHours += $woDuration;
                } else {
                    // Default to Unscheduled
                    $unsHours += $woDuration;
                }

                // Breakdown into B0 - B8
                $hasTaskB = false;
                if ($wo->tasks && $wo->tasks->isNotEmpty()) {
                    foreach ($wo->tasks as $task) {
                        $taskStatus = strtoupper(trim((string) $task->status));
                        if (isset($bHours[$taskStatus])) {
                            $taskHrs = (float) ($task->downtime_hrs ?: 0);
                            $bHours[$taskStatus] += $taskHrs > 0 ? $taskHrs : $woDuration;
                            $hasTaskB = true;
                        }
                    }
                }

                if (! $hasTaskB) {
                    // Fallback to B0 (On Progress)
                    $bHours['B0'] += $woDuration;
                }
            }

            $schHours = round($schHours, 1);
            $unsHours = round($unsHours, 1);
            $accHours = round($accHours, 1);
            $ldHours = round($ldHours, 1);

            $totalBdCategory = round($schHours + $unsHours + $accHours + $ldHours, 1);
            $totalBdB = round(array_sum($bHours), 1);

            // Reconcile total breakdown between categories and B-codes
            $totalBd = max($totalBdCategory, $totalBdB);
            if ($totalBdCategory > $totalBdB) {
                $bHours['B0'] += round($totalBdCategory - $totalBdB, 1);
            }

            // Standby Plant = MOHH - WH - Total_BD
            $stbPla = max(0.0, round($mohh - $wh - $totalBd, 1));

            // PA % = ((MOHH - Total_BD) / MOHH) * 100
            $pa = $mohh > 0 ? round((($mohh - $totalBd) / $mohh) * 100, 1) : 0.0;
            $pa = max(0.0, min(100.0, $pa));

            // EU % = (WH / MOHH) * 100
            $eu = $mohh > 0 ? round(($wh / $mohh) * 100, 1) : 0.0;
            $eu = max(0.0, min(100.0, $eu));

            // MA % = (WH / (WH + Total_BD)) * 100
            $ma = ($wh + $totalBd) > 0 ? round(($wh / ($wh + $totalBd)) * 100, 1) : ($totalBd > 0 ? 0.0 : 100.0);
            $ma = max(0.0, min(100.0, $ma));

            // BD Ratios
            $bdRatioSch = $totalBd > 0 ? round(($schHours / $totalBd) * 100, 1) : 0.0;
            $bdRatioUns = $totalBd > 0 ? round(($unsHours / $totalBd) * 100, 1) : 0.0;

            // MTBF & MTTR
            $mtbf = $eventBdCount > 0 ? round($wh / $eventBdCount, 1) : $wh;
            $mttr = $eventBdCount > 0 ? round($totalBd / $eventBdCount, 1) : 0.0;

            // Accumulate to totals
            $totalWh += $wh;
            $totalStb += $stbPla;
            $totalSch += $schHours;
            $totalUns += $unsHours;
            $totalAcc += $accHours;
            $totalLd += $ldHours;
            foreach ($bHours as $bk => $bv) {
                $totalB[$bk] += $bv;
            }
            $totalBdAll += $totalBd;
            $totalEventsAll += $eventBdCount;

            $calculatedUnits[] = [
                'id' => $unit->id,
                'code_unit' => $code,
                'type_unit' => $standardType ?: ($unit->type_unit ?: '-'),
                'model' => $unit->model ?: '-',
                'location' => $unit->location ?: '-',
                'total_unit' => 1,
                'budget_pa' => $budgetPa,
                'mohh' => $mohh,
                'target_down' => $targetDown,
                'hm_start' => round($minStart, 0),
                'hm_end' => round($maxEnd, 0),
                'wh' => $wh,
                'wh_is_zero' => ($wh == 0),
                'stb_pla' => $stbPla,
                'stb_is_zero' => ($stbPla == 0),
                'sch' => $schHours,
                'uns' => $unsHours,
                'acc' => $accHours,
                'ld' => $ldHours,
                'total_event_uns' => round($unsHours + $accHours + $ldHours, 1),
                'b0' => round($bHours['B0'], 1),
                'b1' => round($bHours['B1'], 1),
                'b2' => round($bHours['B2'], 1),
                'b3' => round($bHours['B3'], 1),
                'b4' => round($bHours['B4'], 1),
                'b5' => round($bHours['B5'], 1),
                'b6' => round($bHours['B6'], 1),
                'b7' => round($bHours['B7'], 1),
                'b8' => round($bHours['B8'], 1),
                'total_bd' => $totalBd,
                'pa' => $pa,
                'pa_below_budget' => ($pa < $budgetPa),
                'eu' => $eu,
                'ma' => $ma,
                'ma_below_budget' => ($ma < $budgetPa),
                'bd_ratio_sch' => $bdRatioSch,
                'bd_ratio_uns' => $bdRatioUns,
                'mtbf' => $mtbf,
                'mttr' => $mttr,
                'target_mtbf' => 80,
                'target_mttr' => 15,
                'events_bd' => $eventBdCount,
            ];
        }

        // Fleet Totals
        $avgBudgetPa = $totalUnitsCount > 0 ? round($sumBudgetPa / $totalUnitsCount, 1) : 90.0;
        $fleetPa = $totalMohh > 0 ? round((($totalMohh - $totalBdAll) / $totalMohh) * 100, 1) : 0.0;
        $fleetEu = $totalMohh > 0 ? round(($totalWh / $totalMohh) * 100, 1) : 0.0;
        $fleetMa = ($totalWh + $totalBdAll) > 0 ? round(($totalWh / ($totalWh + $totalBdAll)) * 100, 1) : 100.0;
        $fleetBdRatioSch = $totalBdAll > 0 ? round(($totalSch / $totalBdAll) * 100, 1) : 0.0;
        $fleetBdRatioUns = $totalBdAll > 0 ? round(($totalUns / $totalBdAll) * 100, 1) : 0.0;
        $fleetMtbf = $totalEventsAll > 0 ? round($totalWh / $totalEventsAll, 1) : round($totalWh, 1);
        $fleetMttr = $totalEventsAll > 0 ? round($totalBdAll / $totalEventsAll, 1) : 0.0;

        $totals = [
            'total_units' => $totalUnitsCount,
            'budget_pa' => $avgBudgetPa,
            'mohh' => round($totalMohh, 0),
            'target_down' => round($totalTargetDown, 1),
            'wh' => round($totalWh, 1),
            'stb_pla' => round($totalStb, 1),
            'sch' => round($totalSch, 1),
            'uns' => round($totalUns, 1),
            'acc' => round($totalAcc, 1),
            'ld' => round($totalLd, 1),
            'total_event_uns' => round($totalUns + $totalAcc + $totalLd, 1),
            'b0' => round($totalB['B0'], 1),
            'b1' => round($totalB['B1'], 1),
            'b2' => round($totalB['B2'], 1),
            'b3' => round($totalB['B3'], 1),
            'b4' => round($totalB['B4'], 1),
            'b5' => round($totalB['B5'], 1),
            'b6' => round($totalB['B6'], 1),
            'b7' => round($totalB['B7'], 1),
            'b8' => round($totalB['B8'], 1),
            'total_bd' => round($totalBdAll, 1),
            'pa' => $fleetPa,
            'pa_below_budget' => ($fleetPa < $avgBudgetPa),
            'eu' => $fleetEu,
            'ma' => $fleetMa,
            'ma_below_budget' => ($fleetMa < $avgBudgetPa),
            'bd_ratio_sch' => $fleetBdRatioSch,
            'bd_ratio_uns' => $fleetBdRatioUns,
            'mtbf' => $fleetMtbf,
            'mttr' => $fleetMttr,
            'target_mtbf' => 80,
            'target_mttr' => 15,
            'events_bd' => $totalEventsAll,
        ];

        $paretoData = $this->calculateParetoData($startDateTime, $endDateTime, $unitIds);

        return [
            'period_mode' => $periodMode,
            'month' => $selectedMonth,
            'year' => $year,
            'iso_week' => $selectedIsoWeek,
            'date_from' => $startDateStr,
            'date_to' => $endDateStr,
            'days_in_period' => $daysInPeriod,
            'mohh_per_unit' => $mohh,
            'period_label' => $periodLabel,
            'target_down_header' => $targetDownHeader,
            'iso_weeks' => $allIsoWeeks,
            'months' => $allMonths,
            'available_years' => [Carbon::now()->year - 2, Carbon::now()->year - 1, Carbon::now()->year, Carbon::now()->year + 1],
            'presets' => [
                'current_iso_week' => Carbon::now()->isoWeek(),
                'current_iso_year' => Carbon::now()->isoWeekYear(),
                'prev_iso_week' => Carbon::now()->subWeek()->isoWeek(),
                'prev_iso_year' => Carbon::now()->subWeek()->isoWeekYear(),
                'current_month' => Carbon::now()->format('Y-m'),
                'prev_month' => Carbon::now()->subMonth()->format('Y-m'),
                'current_year' => Carbon::now()->year,
                'prev_year' => Carbon::now()->subYear()->year,
            ],
            'units' => $calculatedUnits,
            'totals' => $totals,
            'unit_types' => $allUnitTypes,
            'locations' => $allLocations,
            'pareto_data' => $paretoData,
        ];
    }

    /**
     * Canonical ordered list of component groups shown in the Pareto Problem table.
     * Matches the 44 categories from the reference image.
     *
     * @return string[]
     */
    private function getParetoComponentList(): array
    {
        return [
            'AC SYSTEM',
            'ACCESSORIES',
            'ACCIDENT',
            'AIR SYSTEM',
            'ATTACHMENT',
            'AUTOLUBE',
            'BATTERY',
            'BLADE',
            'BRAKE SYSTEM',
            'BUCKET',
            'CABIN',
            'CLUTCH',
            'COOLING SYSTEM',
            'DAMPER',
            'DIFFERENTIAL',
            'ELECTRIC SYSTEM',
            'ENGINE',
            'FINAL DRIVE',
            'FRAME/BODY/GUARD/CHASSIS',
            'FRONT AXLE',
            'FUEL SYSTEM',
            'GET',
            'GREASING',
            'HOSES',
            'HYDRAULIC SYSTEM',
            'INTAKE & EXHAUST SYSTEM',
            'LEVEL OIL/COOLANT',
            'MAINTENANCE/SERVICE',
            'PROPELLER SHAFT',
            'PTO',
            'RADIATOR',
            'RADIO',
            'REAR AXLE',
            'STEERING SYSTEM',
            'SUSPENSION',
            'SWING',
            'TAIL GATE',
            'TRANSMISSION',
            'TYRE',
            'UNDERCARRIAGE',
            'VESSEL',
            'WASHING',
            'WATER CANON/SPRAYER',
            'WHEEL & HUB',
        ];
    }

    /**
     * Aggregate Work Orders in the given period by component for the Pareto Problem table.
     *
     * @param  int[]  $unitIds
     * @return array<int, array{no: int, comp: string, freq: int, total_d: float, pct: float}>
     */
    private function calculateParetoData(Carbon $startDateTime, Carbon $endDateTime, array $unitIds): array
    {
        // Query WOs in the period, group by component
        $rawRows = WorkOrder::whereBetween('waktu_breakdown', [$startDateTime, $endDateTime])
            ->when(! empty($unitIds), fn ($q) => $q->whereIn('unit_id', $unitIds))
            ->selectRaw("UPPER(TRIM(COALESCE(NULLIF(component,''),''))) as comp_key, COUNT(*) as freq, ROUND(SUM(COALESCE(durasi_hrs,0)),1) as total_d")
            ->groupBy('comp_key')
            ->get()
            ->keyBy('comp_key');

        $canonicalList = $this->getParetoComponentList();

        // Build result: all canonical components (including zeroes)
        $rows = [];
        foreach ($canonicalList as $comp) {
            $match = $rawRows->get(strtoupper(trim($comp)));
            $rows[$comp] = [
                'comp' => $comp,
                'freq' => $match ? (int) $match->freq : 0,
                'total_d' => $match ? (float) $match->total_d : 0.0,
            ];
        }

        // Also add any component in DB that is NOT in the canonical list
        foreach ($rawRows as $key => $row) {
            if ($key === '') {
                continue;
            }
            $found = false;
            foreach ($canonicalList as $comp) {
                if (strtoupper(trim($comp)) === $key) {
                    $found = true;
                    break;
                }
            }
            if (! $found) {
                $rows[$key] = [
                    'comp' => ucwords(strtolower($key)),
                    'freq' => (int) $row->freq,
                    'total_d' => (float) $row->total_d,
                ];
            }
        }

        // Calculate grand total downtime for percentage
        $grandTotal = array_sum(array_column($rows, 'total_d'));

        // Sort by total_d descending
        usort($rows, fn ($a, $b) => $b['total_d'] <=> $a['total_d']);

        // Assign sequential NO and percentage
        $result = [];
        foreach ($rows as $i => $row) {
            $result[] = [
                'no' => $i + 1,
                'comp' => $row['comp'],
                'freq' => $row['freq'],
                'total_d' => $row['total_d'],
                'pct' => $grandTotal > 0 ? round(($row['total_d'] / $grandTotal) * 100, 1) : 0.0,
            ];
        }

        return $result;
    }

    private function getEmptyTotals(): array
    {
        return [
            'total_units' => 0,
            'budget_pa' => 90.0,
            'mohh' => 0,
            'target_down' => 0,
            'wh' => 0,
            'stb_pla' => 0,
            'sch' => 0,
            'uns' => 0,
            'acc' => 0,
            'ld' => 0,
            'total_event_uns' => 0,
            'b0' => 0,
            'b1' => 0,
            'b2' => 0,
            'b3' => 0,
            'b4' => 0,
            'b5' => 0,
            'b6' => 0,
            'b7' => 0,
            'b8' => 0,
            'total_bd' => 0,
            'pa' => 0,
            'pa_below_budget' => false,
            'eu' => 0,
            'ma' => 0,
            'ma_below_budget' => false,
            'bd_ratio_sch' => 0,
            'bd_ratio_uns' => 0,
            'mtbf' => 0,
            'mttr' => 0,
            'target_mtbf' => 80,
            'target_mttr' => 15,
            'events_bd' => 0,
        ];
    }

    public function index(Request $request)
    {
        $data = $this->calculatePerformanceData($request);

        return Inertia::render('PerformanceUnit/Index', [
            'data' => $data,
            'filters' => [
                'period_mode' => $data['period_mode'],
                'month' => $data['month'],
                'year' => $data['year'],
                'iso_week' => $data['iso_week'],
                'type_unit' => $request->input('type_unit', ''),
                'location' => $request->input('location', ''),
                'search' => $request->input('search', ''),
            ],
            'unitTypes' => $data['unit_types'],
            'locations' => $data['locations'],
        ]);
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $data = $this->calculatePerformanceData($request);
        $units = $data['units'];
        $totals = $data['totals'];

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Performance Unit');
        $sheet->setShowGridLines(true);

        // Title Header Block
        $sheet->mergeCells('A1:AG1');
        $sheet->setCellValue('A1', 'EQUIPMENT PERFORMANCE REPORT (PERFORMANCE UNIT)');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('FFFFFF');
        $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0F172A');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension(1)->setRowHeight(32);

        $sheet->mergeCells('A2:AG2');
        $sheet->setCellValue('A2', "PERIODE: {$data['period_label']} | TOTAL POPULASI: {$totals['total_units']} UNIT | MOHH: {$data['mohh_per_unit']} JAM ({$data['days_in_period']} HARI)");
        $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(10)->getColor()->setRGB('334155');
        $sheet->getStyle('A2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F1F5F9');
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension(2)->setRowHeight(20);

        // Header Row 3 & 4 (Separating FREKUENSI EVENT and DOWN STATUS)
        // Main headers
        $sheet->mergeCells('A3:A4');
        $sheet->setCellValue('A3', 'CODE UNIT (NEW)');

        $sheet->mergeCells('B3:B4');
        $sheet->setCellValue('B3', 'Total unit');

        $sheet->mergeCells('C3:C4');
        $sheet->setCellValue('C3', 'Budget PA');

        $sheet->mergeCells('D3:D4');
        $sheet->setCellValue('D3', 'MOHH');

        $sheet->mergeCells('E3:E4');
        $sheet->setCellValue('E3', 'Target');

        $sheet->mergeCells('F3:G3');
        $sheet->setCellValue('F3', 'HM Reading');
        $sheet->setCellValue('F4', 'Start');
        $sheet->setCellValue('G4', 'End');

        $sheet->mergeCells('H3:H4');
        $sheet->setCellValue('H3', 'WH');

        $sheet->mergeCells('I3:I4');
        $sheet->setCellValue('I3', "STB\nPLA");

        // 1. FREKUENSI EVENT (5 columns: SCH, UNS, ACD, LB, TOTAL)
        $sheet->mergeCells('J3:N3');
        $sheet->setCellValue('J3', 'FREKUENSI EVENT');
        $sheet->setCellValue('J4', 'SCH');
        $sheet->setCellValue('K4', 'UNS');
        $sheet->setCellValue('L4', 'ACD');
        $sheet->setCellValue('M4', 'LB');
        $sheet->setCellValue('N4', 'TOTAL');

        // 2. DOWN STATUS (10 columns: B0 - B8, Total)
        $sheet->mergeCells('O3:X3');
        $sheet->setCellValue('O3', 'DOWN STATUS');
        $sheet->setCellValue('O4', 'B0');
        $sheet->setCellValue('P4', 'B1');
        $sheet->setCellValue('Q4', 'B2');
        $sheet->setCellValue('R4', 'B3');
        $sheet->setCellValue('S4', 'B4');
        $sheet->setCellValue('T4', 'B5');
        $sheet->setCellValue('U4', 'B6');
        $sheet->setCellValue('V4', 'B7');
        $sheet->setCellValue('W4', 'B8');
        $sheet->setCellValue('X4', 'Total');

        // Post-breakdown metrics
        $sheet->mergeCells('Y3:Y4');
        $sheet->setCellValue('Y3', 'PA %');

        $sheet->mergeCells('Z3:Z4');
        $sheet->setCellValue('Z3', 'EU');

        $sheet->mergeCells('AA3:AA4');
        $sheet->setCellValue('AA3', 'MA %');

        $sheet->mergeCells('AB3:AB3');
        $sheet->setCellValue('AB3', 'BD Ratio');
        $sheet->setCellValue('AB4', '(SCH)');

        $sheet->mergeCells('AC3:AC3');
        $sheet->setCellValue('AC3', 'BD Ratio');
        $sheet->setCellValue('AC4', '(UNS)');

        $sheet->mergeCells('AD3:AD4');
        $sheet->setCellValue('AD3', 'MTBF');

        $sheet->mergeCells('AE3:AE4');
        $sheet->setCellValue('AE3', 'MTTR');

        $sheet->mergeCells('AF3:AF4');
        $sheet->setCellValue('AF3', 'Target MTBF');

        $sheet->mergeCells('AG3:AG4');
        $sheet->setCellValue('AG3', 'Target MTTR');

        // Base Header Styling (Black background, white text)
        $sheet->getStyle('A3:AG4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 9],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '000000']],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '475569'],
                ],
            ],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(24);
        $sheet->getRowDimension(4)->setRowHeight(22);

        // FREKUENSI EVENT Master Header (Khaki / Tan #C2BBA8, text black bold)
        $sheet->getStyle('J3:N3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('C2BBA8');
        $sheet->getStyle('J3:N3')->getFont()->getColor()->setRGB('000000');

        // DOWN STATUS Master Header (Dark Slate / Charcoal #525252, text white bold)
        $sheet->getStyle('O3:X3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('525252');
        $sheet->getStyle('O3:X3')->getFont()->getColor()->setRGB('FFFFFF');

        // Subheaders special colors matching the image
        // SCH: Soft Blue
        $sheet->getStyle('J4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('C6D9F1');
        $sheet->getStyle('J4')->getFont()->getColor()->setRGB('000000');

        // UNS: Soft Yellow
        $sheet->getStyle('K4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FFFF00');
        $sheet->getStyle('K4')->getFont()->getColor()->setRGB('000000');

        // ACD & LB: Soft Orange
        $sheet->getStyle('L4:M4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FFC000');
        $sheet->getStyle('L4:M4')->getFont()->getColor()->setRGB('000000');

        // TOTAL Event: Soft Mint Green
        $sheet->getStyle('N4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('D9EAD3');
        $sheet->getStyle('N4')->getFont()->getColor()->setRGB('000000');

        // Data Rows
        $currentRow = 5;
        foreach ($units as $u) {
            $sheet->setCellValue("A{$currentRow}", $u['code_unit']);
            $sheet->setCellValue("B{$currentRow}", $u['total_unit']);
            $sheet->setCellValue("C{$currentRow}", number_format($u['budget_pa'], 0).'%');
            $sheet->setCellValue("D{$currentRow}", $u['mohh']);
            $sheet->setCellValue("E{$currentRow}", number_format($u['target_down'], 1, ',', '.'));
            $sheet->setCellValue("F{$currentRow}", $u['hm_start']);
            $sheet->setCellValue("G{$currentRow}", $u['hm_end']);
            $sheet->setCellValue("H{$currentRow}", $u['wh']);
            $sheet->setCellValue("I{$currentRow}", $u['stb_pla']);
            // Frekuensi Event
            $sheet->setCellValue("J{$currentRow}", $u['sch']);
            $sheet->setCellValue("K{$currentRow}", $u['uns']);
            $sheet->setCellValue("L{$currentRow}", $u['acc']);
            $sheet->setCellValue("M{$currentRow}", $u['ld']);
            $sheet->setCellValue("N{$currentRow}", $u['total_event_uns']);
            // Down Status
            $sheet->setCellValue("O{$currentRow}", $u['b0']);
            $sheet->setCellValue("P{$currentRow}", $u['b1']);
            $sheet->setCellValue("Q{$currentRow}", $u['b2']);
            $sheet->setCellValue("R{$currentRow}", $u['b3']);
            $sheet->setCellValue("S{$currentRow}", $u['b4']);
            $sheet->setCellValue("T{$currentRow}", $u['b5']);
            $sheet->setCellValue("U{$currentRow}", $u['b6']);
            $sheet->setCellValue("V{$currentRow}", $u['b7']);
            $sheet->setCellValue("W{$currentRow}", $u['b8']);
            $sheet->setCellValue("X{$currentRow}", $u['total_bd']);
            // Post Breakdown
            $sheet->setCellValue("Y{$currentRow}", number_format($u['pa'], 0).'%');
            $sheet->setCellValue("Z{$currentRow}", number_format($u['eu'], 0).'%');
            $sheet->setCellValue("AA{$currentRow}", number_format($u['ma'], 0).'%');
            $sheet->setCellValue("AB{$currentRow}", number_format($u['bd_ratio_sch'], 0).'%');
            $sheet->setCellValue("AC{$currentRow}", number_format($u['bd_ratio_uns'], 0).'%');
            $sheet->setCellValue("AD{$currentRow}", $u['mtbf']);
            $sheet->setCellValue("AE{$currentRow}", $u['mttr']);
            $sheet->setCellValue("AF{$currentRow}", $u['target_mtbf']);
            $sheet->setCellValue("AG{$currentRow}", $u['target_mttr']);

            // Row styling
            $sheet->getStyle("A{$currentRow}:AG{$currentRow}")->applyFromArray([
                'font' => ['size' => 9],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER, 'horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'D1D5DB'],
                    ],
                ],
            ]);
            $sheet->getStyle("A{$currentRow}")->getFont()->setBold(true);

            // Red font for 0 WH or 0 STB
            if ($u['wh'] == 0) {
                $sheet->getStyle("H{$currentRow}")->getFont()->getColor()->setRGB('DC2626');
                $sheet->getStyle("H{$currentRow}")->getFont()->setBold(true);
            }
            if ($u['stb_pla'] == 0) {
                $sheet->getStyle("I{$currentRow}")->getFont()->getColor()->setRGB('DC2626');
                $sheet->getStyle("I{$currentRow}")->getFont()->setBold(true);
            }

            // Cell colors for breakdown columns matching image 2
            // SCH: Soft Blue
            $sheet->getStyle("J{$currentRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('C6D9F1');
            $sheet->getStyle("J{$currentRow}")->getFont()->setBold(true);

            // UNS: Soft Yellow
            $sheet->getStyle("K{$currentRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FFFF00');
            $sheet->getStyle("K{$currentRow}")->getFont()->setBold(true);

            // ACD & LB: Soft Orange
            $sheet->getStyle("L{$currentRow}:M{$currentRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FFC000');
            $sheet->getStyle("L{$currentRow}:M{$currentRow}")->getFont()->setBold(true);

            // TOTAL Event: Soft Mint Green
            $sheet->getStyle("N{$currentRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('D9EAD3');
            $sheet->getStyle("N{$currentRow}")->getFont()->setBold(true);

            // Total BD: Bold
            $sheet->getStyle("X{$currentRow}")->getFont()->setBold(true);

            // PA % warning if below budget
            if ($u['pa_below_budget']) {
                $sheet->getStyle("Y{$currentRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FCE7F3');
                $sheet->getStyle("Y{$currentRow}")->getFont()->getColor()->setRGB('BE185D');
                $sheet->getStyle("Y{$currentRow}")->getFont()->setBold(true);
            }

            // EU column soft pink cell (like screenshot)
            $sheet->getStyle("Z{$currentRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FCE7F3');
            $sheet->getStyle("Z{$currentRow}")->getFont()->getColor()->setRGB('BE185D');

            // MA % warning if below budget
            if ($u['ma_below_budget']) {
                $sheet->getStyle("AA{$currentRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FCE7F3');
                $sheet->getStyle("AA{$currentRow}")->getFont()->getColor()->setRGB('BE185D');
                $sheet->getStyle("AA{$currentRow}")->getFont()->setBold(true);
            }

            $sheet->getRowDimension($currentRow)->setRowHeight(20);
            $currentRow++;
        }

        // Summary Total / Average Row
        $sheet->setCellValue("A{$currentRow}", 'TOTAL / AVERAGE');
        $sheet->setCellValue("B{$currentRow}", $totals['total_units']);
        $sheet->setCellValue("C{$currentRow}", number_format($totals['budget_pa'], 1).'%');
        $sheet->setCellValue("D{$currentRow}", $totals['mohh']);
        $sheet->setCellValue("E{$currentRow}", number_format($totals['target_down'], 1, ',', '.'));
        $sheet->setCellValue("F{$currentRow}", '-');
        $sheet->setCellValue("G{$currentRow}", '-');
        $sheet->setCellValue("H{$currentRow}", $totals['wh']);
        $sheet->setCellValue("I{$currentRow}", $totals['stb_pla']);
        // Frekuensi Event Totals
        $sheet->setCellValue("J{$currentRow}", $totals['sch']);
        $sheet->setCellValue("K{$currentRow}", $totals['uns']);
        $sheet->setCellValue("L{$currentRow}", $totals['acc']);
        $sheet->setCellValue("M{$currentRow}", $totals['ld']);
        $sheet->setCellValue("N{$currentRow}", $totals['total_event_uns']);
        // Down Status Totals
        $sheet->setCellValue("O{$currentRow}", $totals['b0']);
        $sheet->setCellValue("P{$currentRow}", $totals['b1']);
        $sheet->setCellValue("Q{$currentRow}", $totals['b2']);
        $sheet->setCellValue("R{$currentRow}", $totals['b3']);
        $sheet->setCellValue("S{$currentRow}", $totals['b4']);
        $sheet->setCellValue("T{$currentRow}", $totals['b5']);
        $sheet->setCellValue("U{$currentRow}", $totals['b6']);
        $sheet->setCellValue("V{$currentRow}", $totals['b7']);
        $sheet->setCellValue("W{$currentRow}", $totals['b8']);
        $sheet->setCellValue("X{$currentRow}", $totals['total_bd']);
        // Post Breakdown Totals
        $sheet->setCellValue("Y{$currentRow}", number_format($totals['pa'], 1).'%');
        $sheet->setCellValue("Z{$currentRow}", number_format($totals['eu'], 1).'%');
        $sheet->setCellValue("AA{$currentRow}", number_format($totals['ma'], 1).'%');
        $sheet->setCellValue("AB{$currentRow}", number_format($totals['bd_ratio_sch'], 1).'%');
        $sheet->setCellValue("AC{$currentRow}", number_format($totals['bd_ratio_uns'], 1).'%');
        $sheet->setCellValue("AD{$currentRow}", $totals['mtbf']);
        $sheet->setCellValue("AE{$currentRow}", $totals['mttr']);
        $sheet->setCellValue("AF{$currentRow}", $totals['target_mtbf']);
        $sheet->setCellValue("AG{$currentRow}", $totals['target_mttr']);

        $sheet->getStyle("A{$currentRow}:AG{$currentRow}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 9, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER, 'horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_MEDIUM,
                    'color' => ['rgb' => '0F172A'],
                ],
            ],
        ]);
        $sheet->getRowDimension($currentRow)->setRowHeight(24);

        // Auto size columns
        foreach (range('A', 'Z') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        foreach (['AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG'] as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $cleanPeriod = preg_replace('/[^A-Za-z0-9_\-]/', '_', $data['period_label']);
        $filename = "Performance_Unit_{$cleanPeriod}_".now()->format('Ymd_His').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $data = $this->calculatePerformanceData($request);

        $pdf = Pdf::loadView('pdf.performance-unit-report', [
            'data' => $data,
            'periodLabel' => $data['period_label'],
            'targetDownHeader' => $data['target_down_header'],
        ])->setPaper('a3', 'landscape');

        $cleanPeriod = preg_replace('/[^A-Za-z0-9_\-]/', '_', $data['period_label']);
        $filename = "Performance_Unit_{$cleanPeriod}_".now()->format('Ymd_His').'.pdf';

        return $pdf->stream($filename);
    }
}
