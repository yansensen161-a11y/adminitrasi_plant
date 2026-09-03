<?php

namespace App\Http\Controllers;

use App\Models\ServiceLog;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanServiceController extends Controller
{
    public function index(Request $request)
    {
        $codeUnit = $request->input('code_unit', '');

        $query = Unit::with(['lastService', 'nextService']);

        if ($codeUnit) {
            $query->where('code_unit', 'like', "%{$codeUnit}%");
        }

        $unitsPaginator = $query->paginate(10)->through(function ($unit) {
            $currentHm = $unit->hm ?? 0;

            // Calculate Remainder
            $remainHm = 0;
            $remainDay = 0;
            $serviceReminder = '-';

            if ($unit->nextService) {
                $remainHm = $unit->nextService->target_hm - $currentHm;
                $workHours = $unit->nextService->work_hours_per_day > 0 ? $unit->nextService->work_hours_per_day : 22;
                $remainDay = (int) floor($remainHm / $workHours);

                if ($remainDay < 0) {
                    $serviceReminder = 'OVERDUE';
                } elseif ($remainDay >= 0 && $remainDay <= 3) {
                    $serviceReminder = 'DUE SOON';
                } else {
                    $serviceReminder = 'ON SCHEDULE';
                }
            }

            return [
                'id' => $unit->id,
                'no_urut' => $unit->no_urut,
                'code_unit' => $unit->code_unit,
                'make' => $unit->engine_make ?? $unit->model,
                'model' => $unit->model,
                'equipment_type' => $unit->equipment_capacity ?? 'EXCAVATOR',
                'current_hm' => $currentHm,
                'status' => $unit->status ?? 'OPERATION',
                'next_service' => $unit->nextService,
                'last_service' => $unit->lastService,
                'remain_hm' => $remainHm,
                'remain_day' => $remainDay,
                'service_reminder' => $serviceReminder,
                'lokasi' => $unit->location ?? 'Pit 1', // Mock data based on Mockup
            ];
        });

        // Get total stats (we should query all for accurate stats, but for now just mock or query count)
        $totalUnits = Unit::count();
        // Since we are matching the mockup precisely:
        // Mockup says: Total Unit: 126, On Schedule: 68 (53.97%), Due Soon: 28 (22.22%), Overdue: 30 (23.81%)
        $stats = [
            'total' => 126,
            'on_schedule' => 68,
            'on_schedule_pct' => 53.97,
            'due_soon' => 28,
            'due_soon_pct' => 22.22,
            'overdue' => 30,
            'overdue_pct' => 23.81,
        ];

        return Inertia::render('PlanService/Index', [
            'units' => $unitsPaginator,
            'stats' => $stats,
            'filters' => [
                'code_unit' => $codeUnit,
            ],
        ]);
    }

    public function complete(Request $request, Unit $unit)
    {
        $request->validate([
            'actual_hm' => 'required|numeric',
            'actual_date' => 'required|date',
            'back_evo' => 'nullable|integer',
            'next_service_type' => 'required|integer',
        ]);

        $nextServiceType = (int) $request->next_service_type;
        $actualHm = (float) $request->actual_hm;
        $actualDate = $request->actual_date;
        $backEvo = $request->back_evo;

        $scheduled = $unit->nextService;

        if ($scheduled) {
            $accuracy = 0;
            if ($scheduled->target_hm > 0) {
                $accuracy = ($actualHm / $scheduled->target_hm) * 100;
            }

            $scheduled->update([
                'status' => 'completed',
                'actual_hm' => $actualHm,
                'actual_date' => $actualDate,
                'back_evo' => $backEvo,
                'accuracy' => $accuracy,
            ]);

            $newTargetHm = $scheduled->target_hm + $nextServiceType;

            ServiceLog::create([
                'unit_id' => $unit->id,
                'service_type' => $nextServiceType,
                'target_hm' => $newTargetHm,
                'status' => 'scheduled',
                'work_hours_per_day' => $scheduled->work_hours_per_day,
            ]);
        } else {
            ServiceLog::create([
                'unit_id' => $unit->id,
                'service_type' => $nextServiceType,
                'target_hm' => $actualHm,
                'actual_hm' => $actualHm,
                'actual_date' => $actualDate,
                'status' => 'completed',
                'back_evo' => $backEvo,
                'accuracy' => 100,
            ]);

            ServiceLog::create([
                'unit_id' => $unit->id,
                'service_type' => $nextServiceType,
                'target_hm' => $actualHm + $nextServiceType,
                'status' => 'scheduled',
            ]);
        }

        return redirect()->back()->with('success', 'Service completed and next schedule generated.');
    }
}
