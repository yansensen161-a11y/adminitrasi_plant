<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceOrder;
use App\Models\ServiceLog;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanServiceController extends Controller
{
    public function index(Request $request)
    {
        $codeUnit = $request->input('code_unit', '');

        $query = Unit::with(['lastService', 'nextService.maintenanceOrder']);

        if ($codeUnit) {
            $query->where('code_unit', 'like', "%{$codeUnit}%");
        }

        $unitsPaginator = $query->paginate(10)->through(function ($unit) {
            $currentHm = $unit->hm ?? 0;

            // Calculate Remainder
            $remainHm = 0;
            $remainDay = 0;
            $serviceReminder = '-';
            $nextInspectionStr = '-';
            $dueDate = '-';

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

                $nextInspectionStr = number_format($unit->nextService->target_hm, 0, ',', '.').' ('.($unit->nextService->service_type == 0 ? 'P2H' : $unit->nextService->service_type.' HM').')';
                $dueDate = now()->addDays($remainDay)->format('d M Y');
            } else {
                // Mock data if no next service set
                $remainHm = rand(-500, 1000);
                $serviceReminder = $remainHm < 0 ? 'OVERDUE' : ($remainHm < 100 ? 'DUE SOON' : 'ON SCHEDULE');
                $nextInspectionStr = number_format($currentHm + 250, 0, ',', '.').' (250 HM)';
                $dueDate = now()->addDays(rand(-5, 20))->format('d M Y');
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
                'next_inspection' => $nextInspectionStr,
                'sisa_hm' => $remainHm,
                'due_date' => $dueDate,
                'pic' => ['Andi', 'Budi', 'Rudi', 'Slamet', 'Joko', 'Anton', 'Deni'][array_rand(['Andi', 'Budi', 'Rudi', 'Slamet', 'Joko', 'Anton', 'Deni'])], // Mock PIC
                'service_reminder' => $serviceReminder,
                'lokasi' => $unit->location ?? 'Pit 1',
            ];
        });

        // Mock stats based on the Mockup image
        $stats = [
            'total' => 185,
            'on_schedule' => 142,
            'on_schedule_pct' => 76.8,
            'due_soon' => 28,
            'due_soon_pct' => 15.1,
            'overdue' => 15,
            'overdue_pct' => 8.1,
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

            if ($scheduled->maintenance_order_id) {
                MaintenanceOrder::where('id', $scheduled->maintenance_order_id)->update([
                    'status' => 'CLOSED',
                    'hm' => $actualHm,
                    'actual_end' => $actualDate,
                    'action_taken' => 'Completed PM Service '.$scheduled->service_type,
                ]);
            }

            $newTargetHm = $scheduled->target_hm + $nextServiceType;

            $wo = MaintenanceOrder::create([
                'wo_type' => 'PM',
                'no_order' => 'PM-'.now()->format('YmdHis').'-'.rand(100, 999),
                'tanggal' => $actualDate,
                'unit_id' => $unit->id,
                'hm' => $newTargetHm,
                'priority' => 'Medium',
                'status' => 'OPEN',
                'action_taken' => 'Scheduled PM Service '.$nextServiceType,
            ]);

            ServiceLog::create([
                'unit_id' => $unit->id,
                'service_type' => $nextServiceType,
                'target_hm' => $newTargetHm,
                'status' => 'scheduled',
                'work_hours_per_day' => $scheduled->work_hours_per_day,
                'maintenance_order_id' => $wo->id,
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

            $wo = MaintenanceOrder::create([
                'wo_type' => 'PM',
                'no_order' => 'PM-'.now()->format('YmdHis').'-'.rand(100, 999),
                'tanggal' => $actualDate,
                'unit_id' => $unit->id,
                'hm' => $actualHm + $nextServiceType,
                'priority' => 'Medium',
                'status' => 'OPEN',
                'action_taken' => 'Scheduled PM Service '.$nextServiceType,
            ]);

            ServiceLog::create([
                'unit_id' => $unit->id,
                'service_type' => $nextServiceType,
                'target_hm' => $actualHm + $nextServiceType,
                'status' => 'scheduled',
                'maintenance_order_id' => $wo->id,
            ]);
        }

        return redirect()->back()->with('success', 'Service completed and next schedule generated.');
    }
}
