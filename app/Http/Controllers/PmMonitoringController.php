<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Services\HMUpdateService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PmMonitoringController extends Controller
{
    /**
     * Display the PM Monitoring Board (Jatuh Tempo Service Unit).
     */
    public function index(Request $request)
    {
        $units = Unit::with(['lastService', 'nextService'])
            ->withCount('backlogOrders')
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
            ])
            ->orderBy('code_unit', 'asc')
            ->get();

        return Inertia::render('PmMonitoring/Index', [
            'units' => $units,
        ]);
    }

    /**
     * Sinkronkan Hour Meter (HM) semua unit dari data HourMeterLog dan ServiceLog terbaru.
     */
    public function syncHm(Request $request)
    {
        $updatedCount = HMUpdateService::syncAllUnits();

        return redirect()->route('pm-monitoring.index')->with('success', "Berhasil mensinkronkan Hour Meter (HM) untuk {$updatedCount} unit dari log operasional & service terbaru.");
    }
}
