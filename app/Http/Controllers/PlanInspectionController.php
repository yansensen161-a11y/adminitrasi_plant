<?php

namespace App\Http\Controllers;

use App\Models\PlanInspection;
use App\Models\PlanInspectionTarget;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanInspectionController extends Controller
{
    public function index(Request $request)
    {
        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);
        $dateStr = sprintf('%04d-%02d-01', $year, $month);
        $date = Carbon::parse($dateStr);
        $daysInMonth = $date->daysInMonth;

        // Fetch all units
        $units = Unit::orderBy('type_unit', 'asc')
            ->orderBy('code_unit', 'asc')
            ->get();

        // Group by type_unit
        $groupedUnits = [];
        foreach ($units as $unit) {
            $type = strtoupper($unit->type_unit ?: 'UNSPECIFIED');
            if (! isset($groupedUnits[$type])) {
                $groupedUnits[$type] = [];
            }
            $groupedUnits[$type][] = $unit;
        }

        // Fetch inspections for the selected month
        $inspections = PlanInspection::whereYear('inspection_date', $year)
            ->whereMonth('inspection_date', $month)
            ->get();

        // Organize into a fast lookup array [unit_id][category][day] = true
        $planData = [];
        foreach ($inspections as $inspection) {
            $day = Carbon::parse($inspection->inspection_date)->day;
            $cat = $inspection->category;
            $planData[$inspection->unit_id][$cat][$day] = true;
        }

        // Fetch saved target values for this month [unit_id][category] = target
        $targets = PlanInspectionTarget::where('month', $month)->where('year', $year)->get();
        $targetData = [];
        foreach ($targets as $t) {
            $targetData[$t->unit_id][$t->category] = $t->target_value;
        }

        // Distinct unit types for filter dropdown
        $unitTypes = Unit::select('type_unit')->distinct()->orderBy('type_unit')->pluck('type_unit');

        return Inertia::render('PlanInspection/Index', [
            'groupedUnits' => $groupedUnits,
            'planData' => $planData,
            'targetData' => $targetData,
            'currentMonth' => $month,
            'currentYear' => $year,
            'daysInMonth' => $daysInMonth,
            'unitTypes' => $unitTypes,
        ]);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'unit_id' => 'required|exists:units,id',
            'day' => 'required|integer|min:1|max:31',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
            'category' => 'required|string|in:washing,inspection,greasing',
        ]);

        $dateStr = sprintf('%04d-%02d-%02d', $request->year, $request->month, $request->day);

        $existing = PlanInspection::where('unit_id', $request->unit_id)
            ->whereDate('inspection_date', $dateStr)
            ->where('category', $request->category)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['status' => 'removed']);
        } else {
            PlanInspection::create([
                'unit_id' => $request->unit_id,
                'inspection_date' => $dateStr,
                'category' => $request->category,
            ]);

            return response()->json(['status' => 'added']);
        }
    }

    public function dashboard(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $unitTypeFilter = $request->input('unit_type', 'all');

        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        // --- Fetch units ---
        $unitQuery = Unit::query();
        if ($unitTypeFilter !== 'all') {
            $unitQuery->where('type_unit', $unitTypeFilter);
        }
        $units = $unitQuery->orderBy('type_unit')->get();

        // Build grouped list: [type => [unit, ...]]
        $groupedByType = [];
        foreach ($units as $unit) {
            $type = strtoupper($unit->type_unit ?: 'UNSPECIFIED');
            $groupedByType[$type][] = $unit;
        }

        // --- Fetch actuals (centang) in date range ---
        $inspectionsQuery = PlanInspection::whereBetween('inspection_date', [$startDate, $endDate])
            ->with('unit');
        if ($unitTypeFilter !== 'all') {
            $inspectionsQuery->whereHas('unit', fn ($q) => $q->where('type_unit', $unitTypeFilter));
        }
        $inspections = $inspectionsQuery->get();

        // Count actuals per [type][category]
        $actualByTypeCat = [];
        foreach ($inspections as $ins) {
            $type = strtoupper($ins->unit->type_unit ?: 'UNSPECIFIED');
            $cat = strtolower($ins->category);
            if (! isset($actualByTypeCat[$type][$cat])) {
                $actualByTypeCat[$type][$cat] = 0;
            }
            $actualByTypeCat[$type][$cat]++;
        }

        // --- Fetch saved plan targets from DB for the date range's months ---
        // Sum targets for each month in range that falls between start and end
        $targetQuery = PlanInspectionTarget::whereIn(
            'unit_id',
            $units->pluck('id')->toArray()
        );

        // Collect month/year combos in range
        $monthsInRange = [];
        $cursor = $start->copy()->startOfMonth();
        while ($cursor->lte($end)) {
            $monthsInRange[] = ['month' => $cursor->month, 'year' => $cursor->year];
            $cursor->addMonth();
        }

        // Build target lookup per [type][category] summed across all months in range
        $planByTypeCat = [];
        foreach ($monthsInRange as $my) {
            $monthTargets = PlanInspectionTarget::whereIn('unit_id', $units->pluck('id')->toArray())
                ->where('month', $my['month'])
                ->where('year', $my['year'])
                ->get();

            foreach ($monthTargets as $t) {
                $unit = $units->firstWhere('id', $t->unit_id);
                if (! $unit) {
                    continue;
                }
                $type = strtoupper($unit->type_unit ?: 'UNSPECIFIED');
                $cat = strtolower($t->category);
                if (! isset($planByTypeCat[$type][$cat])) {
                    $planByTypeCat[$type][$cat] = 0;
                }
                $planByTypeCat[$type][$cat] += $t->target_value;
            }
        }

        // --- Build rekap rows ---
        $categories = ['inspection', 'washing', 'greasing'];
        $rekap = [];
        $totalPlanAll = 0;
        $totalActualAll = 0;

        foreach ($groupedByType as $type => $typeUnits) {
            $row = ['type' => $type];
            foreach ($categories as $cat) {
                $plan = $planByTypeCat[$type][$cat] ?? 0;
                $actual = $actualByTypeCat[$type][$cat] ?? 0;
                $row[$cat] = ['plan' => $plan, 'actual' => $actual];
                $totalPlanAll += $plan;
                $totalActualAll += $actual;
            }
            $rekap[] = $row;
        }

        $remaining = max(0, $totalPlanAll - $totalActualAll);
        $compliance = $totalPlanAll > 0 ? round(($totalActualAll / $totalPlanAll) * 100, 1) : 0;

        // --- Trend: monthly compliance for each category over the year ---
        $trendMonthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $trendYear = $end->year;
        $trendData = ['inspection' => [], 'washing' => [], 'greasing' => []];

        for ($m = 1; $m <= 12; $m++) {
            foreach ($categories as $cat) {
                // Sum plan targets for all units in this month
                $mPlan = PlanInspectionTarget::whereIn('unit_id', $units->pluck('id')->toArray())
                    ->where('month', $m)->where('year', $trendYear)->sum('target_value');

                // Actually only count the right category
                $mPlanCat = PlanInspectionTarget::whereIn('unit_id', $units->pluck('id')->toArray())
                    ->where('month', $m)->where('year', $trendYear)
                    ->where('category', $cat)->sum('target_value');

                $mActCat = PlanInspection::whereYear('inspection_date', $trendYear)
                    ->whereMonth('inspection_date', $m)
                    ->where('category', $cat)
                    ->whereIn('unit_id', $units->pluck('id')->toArray())
                    ->count();

                $trendData[$cat][] = $mPlanCat > 0 ? round(($mActCat / $mPlanCat) * 100, 1) : 0;
            }
        }

        // Previous month compliance for growth arrow
        $prevMonth = $end->copy()->subMonth();
        $prevPlan = PlanInspectionTarget::whereIn('unit_id', $units->pluck('id')->toArray())
            ->where('month', $prevMonth->month)->where('year', $prevMonth->year)->sum('target_value');
        $prevAct = PlanInspection::whereBetween('inspection_date', [
            $prevMonth->startOfMonth()->format('Y-m-d'),
            $prevMonth->copy()->endOfMonth()->format('Y-m-d'),
        ])->whereIn('unit_id', $units->pluck('id')->toArray())->count();
        $prevCompliance = $prevPlan > 0 ? round(($prevAct / $prevPlan) * 100, 1) : 0;
        $growth = round($compliance - $prevCompliance, 1);

        // Unit types for dropdown
        $unitTypes = Unit::select('type_unit')->distinct()->orderBy('type_unit')->pluck('type_unit');

        return response()->json([
            'kpi' => [
                'totalPlan' => $totalPlanAll,
                'totalActual' => $totalActualAll,
                'remaining' => $remaining,
                'compliance' => $compliance,
                'growth' => $growth,
            ],
            'rekap' => $rekap,
            'trend' => [
                'labels' => $trendMonthLabels,
                'datasets' => $trendData,
            ],
            'unitTypes' => $unitTypes,
        ]);
    }

    /**
     * Upsert a plan target value for a unit/category/month/year.
     */
    public function updateTarget(Request $request)
    {
        $request->validate([
            'unit_id' => 'required|exists:units,id',
            'category' => 'required|string|in:washing,inspection,greasing',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
            'target_value' => 'required|integer|min:0',
        ]);

        PlanInspectionTarget::updateOrCreate(
            [
                'unit_id' => $request->unit_id,
                'category' => $request->category,
                'month' => $request->month,
                'year' => $request->year,
            ],
            ['target_value' => $request->target_value]
        );

        return response()->json(['status' => 'ok']);
    }
}
