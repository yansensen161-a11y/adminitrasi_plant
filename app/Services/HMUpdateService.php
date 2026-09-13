<?php

namespace App\Services;

use App\Models\Unit;
use App\Models\PmService;
use App\Models\WorkOrder;
use Carbon\Carbon;

class HMUpdateService
{
    /**
     * Process HM update for a unit and trigger PM rules if applicable.
     *
     * @param Unit $unit
     * @param float $newHm
     * @param string $logDate
     * @return void
     */
    public static function processHmUpdate(Unit $unit, $newHm, $logDate = null)
    {
        $logDate = $logDate ? Carbon::parse($logDate) : Carbon::now();

        // 1. Update Unit HM
        if ($newHm > $unit->hm) {
            $unit->update(['hm' => $newHm]);
            
            // Sync current HM to PcrUc to keep Undercarriage lifetime auto-updated
            $pcrUcs = \App\Models\PcrUc::where('unit_id', $unit->id)->get();
            foreach ($pcrUcs as $pcr) {
                $targetLifeTime = $pcr->target_life_time ?: 8000;
                $hmReplace = $pcr->hm_replace !== null ? (float) $pcr->hm_replace : 0;
                $usageHm = max(0, $newHm - $hmReplace);
                $sisaHm = $targetLifeTime - $usageHm;
                $lifeTimePct = $targetLifeTime > 0 ? ($usageHm / $targetLifeTime) * 100 : 0;
                
                $statusStr = 'ON SCHEDULE';
                if ($sisaHm < 0) {
                    $statusStr = 'OVERDUE';
                } elseif ($sisaHm < 250) {
                    $statusStr = 'DUE SOON';
                }
                
                $pcr->update([
                    'hm_current' => $newHm,
                    'life_time_pct' => $lifeTimePct,
                    'status' => $statusStr
                ]);
            }
        }

        // 2. Check PM Due (Simple logic: if current HM modulo PM interval is close to 0 or crossed)
        // Note: A robust CMMS usually tracks "last_pm_hm" per service type.
        // For this MVP adaptation, we check if any active PM service rule is triggered.
        $pmServices = PmService::where('is_active', true)->get();

        foreach ($pmServices as $pm) {
            $interval = $pm->interval_hm;
            if ($interval <= 0) continue;

            // Determine if the new HM has crossed a multiple of the interval
            $previousMultiple = floor(($unit->hm - 0.1) / $interval) * $interval;
            $currentMultiple = floor($newHm / $interval) * $interval;

            if ($currentMultiple > $previousMultiple && $currentMultiple > 0) {
                // PM threshold crossed, generate WO
                self::generatePmWorkOrder($unit, $pm, $newHm, $logDate);
            }
        }
    }

    /**
     * Auto generate a Preventive Maintenance Work Order.
     *
     * @param Unit $unit
     * @param PmService $pm
     * @param float $currentHm
     * @param Carbon $date
     * @return void
     */
    private static function generatePmWorkOrder(Unit $unit, PmService $pm, $currentHm, Carbon $date)
    {
        // 1. Prevent Duplicate: Check if an OPEN or PLANNED WO already exists for this unit and maintenance type
        $existingWo = WorkOrder::where('unit_id', $unit->id)
                               ->where('tipe_wo', 'PREVENTIVE MAINTENANCE')
                               ->where('maintenance_type', $pm->nama_pm)
                               ->whereIn('status_wo', ['DRAFT', 'OPEN', 'PLANNED', 'ASSIGNED', 'IN PROGRESS'])
                               ->first();

        if ($existingWo) {
            return; // Active WO already exists, prevent duplicate
        }

        // 2. Create CMMS Work Order
        WorkOrderService::createWorkOrder([
            'tipe_wo' => 'PREVENTIVE MAINTENANCE',
            'unit_id' => $unit->id,
            'hm_unit' => $currentHm,
            'priority' => 'MEDIUM',
            'status_wo' => 'OPEN',
            'maintenance_type' => $pm->nama_pm,
            'job_instruction' => 'Perform standard ' . $pm->nama_pm . ' service. Inspect components and replace filters as per schedule.',
            'request_by' => 'System (Auto-Generated)',
            'request_date' => $date,
        ]);
    }
}
