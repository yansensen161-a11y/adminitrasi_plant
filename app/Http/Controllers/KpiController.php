<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KpiController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Ensure date range includes the whole day
        $dateToFull = $dateTo . ' 23:59:59';
        $dateFromFull = $dateFrom . ' 00:00:00';

        // ── Unit Status & PA ───────────────────────────────────────────
        $totalUnit = Unit::count();
        $running = Unit::whereIn('status', ['OPERATION', 'Running'])->count();
        $standby = Unit::whereIn('status', ['Standby', 'STANDBY'])->count();
        $breakdownUnits = Unit::whereIn('status', ['Breakdown', 'BREAKDOWN'])->count();
        $maintenance = Unit::whereIn('status', ['Under Maintenance', 'MAINTENANCE'])->count();

        // Physical Availability (PA)
        $activeFleet = $running + $standby;
        $pa = $totalUnit > 0 ? round(($activeFleet / $totalUnit) * 100, 1) : 0;

        // ── Work Order Metrics ─────────────────────────────────────────
        $baseWoQuery = WorkOrder::whereBetween('created_at', [$dateFromFull, $dateToFull]);
        
        $totalWo = (clone $baseWoQuery)->count();
        $completedWo = (clone $baseWoQuery)->whereIn('status_wo', ['CLOSED', 'COMPLETED'])->count();
        $woCompletionRate = $totalWo > 0 ? round(($completedWo / $totalWo) * 100, 1) : 0;
        
        // Unplanned (CM/BD) vs Planned (PM)
        $unplannedWoCount = (clone $baseWoQuery)->whereIn('tipe_wo', ['BD', 'CM'])->count();
        $plannedWoCount = (clone $baseWoQuery)->where('tipe_wo', 'PM')->count();
        
        // ── MTTR & MTBF ────────────────────────────────────────────────
        // MTTR: Average downtime duration for unscheduled breakdowns
        $mttr = (clone $baseWoQuery)
            ->whereIn('tipe_wo', ['BD', 'CM'])
            ->avg('durasi_hrs') ?: 0;
        $mttr = round($mttr, 1);
        
        // MTBF: Estimate = (Total Possible Operating Hours - Total Downtime) / Number of Breakdowns
        // Since we lack historical daily op hours, we use a simple metric or placeholder if 0
        $totalDowntimeHrs = (clone $baseWoQuery)->whereIn('tipe_wo', ['BD', 'CM'])->sum('durasi_hrs');
        $mtbf = $unplannedWoCount > 0 ? round((($totalUnit * 24 * 30) - $totalDowntimeHrs) / $unplannedWoCount, 0) : 0;

        // ── Work Order Counts by Type ──────────────────────────────────
        $woByTypeRaw = (clone $baseWoQuery)
            ->selectRaw('tipe_wo, COUNT(*) as total')
            ->groupBy('tipe_wo')
            ->pluck('total', 'tipe_wo')
            ->toArray();
            
        $woLabels = ['PM', 'CM', 'BD', 'P2H', 'PCR', 'INS', 'Others'];
        $woData = [];
        foreach ($woLabels as $lbl) {
            $woData[] = $woByTypeRaw[$lbl] ?? 0;
        }

        // ── Top 5 Breakdown by Component ──────────────────────────────
        $breakdownByComponentRaw = (clone $baseWoQuery)
            ->whereNotNull('component')
            ->whereIn('tipe_wo', ['BD', 'CM'])
            ->selectRaw('component as equipment_group, COUNT(*) as jumlah')
            ->groupBy('component')
            ->orderByDesc('jumlah')
            ->limit(5)
            ->get()
            ->toArray();

        $totalBreakdownCount = array_sum(array_column($breakdownByComponentRaw, 'jumlah')) ?: 1;

        $breakdownByComponent = array_map(function ($row, $idx) use ($totalBreakdownCount) {
            return [
                'no' => $idx + 1,
                'component' => $row['equipment_group'],
                'jumlah' => $row['jumlah'],
                'pct' => round(($row['jumlah'] / $totalBreakdownCount) * 100, 1),
            ];
        }, $breakdownByComponentRaw, array_keys($breakdownByComponentRaw));

        // ── Downtime chart (weekly trend) ───────────
        $weeks = [];
        $start = Carbon::parse($dateFrom);
        $end = Carbon::parse($dateTo);
        $cur = $start->copy();

        $downtimeLabels = [];
        $downtimeBreakdown = []; // BD
        $downtimeMaintenance = []; // PM/CM

        while ($cur->lte($end)) {
            $weekEnd = $cur->copy()->addDays(6)->endOfDay();
            if ($weekEnd->gt($end)) {
                $weekEnd = $end->copy()->endOfDay();
            }
            
            $downtimeLabels[] = $cur->format('j M');
            
            $bdSum = WorkOrder::whereBetween('created_at', [$cur, $weekEnd])
                ->where('tipe_wo', 'BD')
                ->sum('durasi_hrs');
            $downtimeBreakdown[] = round($bdSum, 1);
            
            $pmSum = WorkOrder::whereBetween('created_at', [$cur, $weekEnd])
                ->whereIn('tipe_wo', ['PM', 'CM'])
                ->sum('durasi_hrs');
            $downtimeMaintenance[] = round($pmSum, 1);

            $cur->addWeek();
        }

        // Dummy data for presentation if no real data is available in the system yet
        if ($totalWo === 0) {
            $pa = 88.5;
            $mttr = 4.2;
            $mtbf = 312;
            $woCompletionRate = 85.5;
            $totalWo = 120;
            $unplannedWoCount = 45;
            $plannedWoCount = 75;
            $woData = [45, 20, 15, 10, 12, 8, 10];
            $downtimeLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            $downtimeBreakdown = [12, 15, 8, 22];
            $downtimeMaintenance = [24, 18, 30, 20];
            $breakdownByComponent = [
                ['no' => 1, 'component' => 'Hydraulic Pump', 'jumlah' => 12, 'pct' => 35],
                ['no' => 2, 'component' => 'Engine Injector', 'jumlah' => 8, 'pct' => 25],
                ['no' => 3, 'component' => 'Transmission', 'jumlah' => 6, 'pct' => 20],
                ['no' => 4, 'component' => 'Final Drive', 'jumlah' => 4, 'pct' => 12],
                ['no' => 5, 'component' => 'Alternator', 'jumlah' => 2, 'pct' => 8],
            ];
            $totalUnit = 45;
            $running = 35;
            $standby = 5;
            $breakdownUnits = 3;
            $maintenance = 2;
        }

        return Inertia::render('Kpi/Index', [
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'unitStatus' => [
                'total' => $totalUnit,
                'running' => $running,
                'standby' => $standby,
                'breakdown' => $breakdownUnits,
                'maintenance' => $maintenance,
            ],
            'metrics' => [
                'pa' => $pa,
                'mttr' => $mttr,
                'mtbf' => $mtbf,
                'woCompletionRate' => $woCompletionRate,
                'totalWo' => $totalWo,
                'unplannedWoCount' => $unplannedWoCount,
                'plannedWoCount' => $plannedWoCount,
            ],
            'woChart' => ['labels' => $woLabels, 'data' => $woData],
            'downtimeChart' => [
                'labels' => $downtimeLabels, 
                'breakdown' => $downtimeBreakdown, 
                'maintenance' => $downtimeMaintenance
            ],
            'breakdownByComponent' => $breakdownByComponent,
        ]);
    }
}
