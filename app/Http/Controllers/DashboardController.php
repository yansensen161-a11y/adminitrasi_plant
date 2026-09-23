<?php

namespace App\Http\Controllers;

use App\Models\Backlog;
use App\Models\Breakdown;
use App\Models\MaintenanceOrder;
use App\Models\ManpowerBudget;
use App\Models\PlanInspection;
use App\Models\Unit;
use Inertia\Inertia;

// Assuming this exists or falls back to count

class DashboardController extends Controller
{
    public function index()
    {
        $kpi = [
            'total_unit' => 0,
            'total_mekanik' => 0,
            'breakdown' => 0,
            'open_wo' => 0,
            'on_process_wo' => 0,
            'closed_wo' => 0,
            'backlog' => 0,
            'pm_due' => 0,
        ];

        try {
            $kpi['total_unit'] = Unit::count();
        } catch (\Exception $e) {
        }
        try {
            $kpi['total_mekanik'] = ManpowerBudget::count();
        } catch (\Exception $e) {
        }
        try {
            $kpi['backlog'] = Backlog::count();
        } catch (\Exception $e) {
        }
        try {
            $kpi['breakdown'] = Breakdown::where('status_bd', 'Open')->count() + Breakdown::where('status_bd', 'Waiting Part')->count();
        } catch (\Exception $e) {
            $kpi['breakdown'] = Breakdown::count();
        }

        try {
            $kpi['open_wo'] = MaintenanceOrder::where('status', 'OPEN')->orWhere('status', 'WAITING')->count();
            $kpi['on_process_wo'] = MaintenanceOrder::where('status', 'ON PROCESS')->count();
            $kpi['closed_wo'] = MaintenanceOrder::where('status', 'CLOSED')->count();
        } catch (\Exception $e) {
            $kpi['open_wo'] = MaintenanceOrder::count();
            $kpi['on_process_wo'] = 0;
            $kpi['closed_wo'] = 0;
        }

        try {
            $kpi['pm_due'] = PlanInspection::count();
        } catch (\Exception $e) {
            $kpi['pm_due'] = 0;
        }

        return Inertia::render('Dashboard', [
            'kpi' => $kpi,
        ]);
    }
}
