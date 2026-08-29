<?php

namespace App\Http\Controllers;

use App\Models\ServiceLog;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanServiceController extends Controller
{
    public function index()
    {
        $units = Unit::with(['lastService', 'nextService'])->get()->map(function ($unit) {
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
                } elseif ($remainDay == 0) {
                    $serviceReminder = 'DUE TODAY';
                } elseif ($remainDay == 1) {
                    $serviceReminder = 'TOMORROW';
                } else {
                    $serviceReminder = 'NEXT SCHEDULE';
                }
            }
            
            return [
                'id' => $unit->id,
                'no_urut' => $unit->no_urut,
                'code_unit' => $unit->code_unit,
                'make' => $unit->engine_make ?? $unit->model, // fallback if engine_make is empty
                'model' => $unit->model,
                'equipment_type' => $unit->equipment_capacity ?? 'EXCAVATOR',
                'current_hm' => $currentHm,
                'status' => $unit->status ?? 'OPERATION',
                'next_service' => $unit->nextService,
                'last_service' => $unit->lastService,
                'remain_hm' => $remainHm,
                'remain_day' => $remainDay,
                'service_reminder' => $serviceReminder,
            ];
        });

        return Inertia::render('PlanService/Index', [
            'units' => $units
        ]);
    }

    public function complete(Request $request, Unit $unit)
    {
        $request->validate([
            'actual_hm' => 'required|numeric',
            'actual_date' => 'required|date',
            'back_evo' => 'nullable|integer',
            'next_service_type' => 'required|integer', // e.g., 250
        ]);

        $nextServiceType = (int) $request->next_service_type;
        $actualHm = (float) $request->actual_hm;
        $actualDate = $request->actual_date;
        $backEvo = $request->back_evo;

        // Find the scheduled service
        $scheduled = $unit->nextService;
        
        if ($scheduled) {
            // Update scheduled to completed
            $accuracy = 0;
            if ($scheduled->target_hm > 0) {
                // Simple accuracy calculation: closer to 100% is better
                $accuracy = ($actualHm / $scheduled->target_hm) * 100; 
            }
            
            $scheduled->update([
                'status' => 'completed',
                'actual_hm' => $actualHm,
                'actual_date' => $actualDate,
                'back_evo' => $backEvo,
                'accuracy' => $accuracy
            ]);
            
            // Create the NEW next service based on the OLD TARGET
            $newTargetHm = $scheduled->target_hm + $nextServiceType;
            
            ServiceLog::create([
                'unit_id' => $unit->id,
                'service_type' => $nextServiceType,
                'target_hm' => $newTargetHm,
                'status' => 'scheduled',
                'work_hours_per_day' => $scheduled->work_hours_per_day,
            ]);
        } else {
            // If no scheduled service exists, create a completed one and then a new scheduled one
            ServiceLog::create([
                'unit_id' => $unit->id,
                'service_type' => $nextServiceType,
                'target_hm' => $actualHm, // Fallback
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
