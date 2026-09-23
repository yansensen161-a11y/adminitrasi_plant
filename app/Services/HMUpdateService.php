<?php

namespace App\Services;

use App\Models\HourMeterLog;
use App\Models\PcrUc;
use App\Models\PmService;
use App\Models\Tyre;
use App\Models\Unit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class HMUpdateService
{
    /**
     * Process HM update for a unit and trigger PM rules if applicable.
     *
     * @param  float  $newHm
     * @param  string|null  $logDate
     * @return void
     */
    public static function processHmUpdate(Unit $unit, $newHm, $logDate = null, bool $force = false)
    {
        $logDate = $logDate ? Carbon::parse($logDate) : Carbon::now();
        $newHm = (float) $newHm;

        // 1. Update Unit HM atomically to prevent Lost Updates
        // Only update if the new HM is greater than the current HM in the database (or if forced)
        if ($force) {
            $updated = DB::table('units')
                ->where('id', $unit->id)
                ->update(['hm' => $newHm]);
        } else {
            $updated = DB::table('units')
                ->where('id', $unit->id)
                ->where('hm', '<', $newHm)
                ->update(['hm' => $newHm]);
        }

        if ($updated || $force) {
            // Re-fetch unit to get latest data
            $unit->refresh();

            // Sync current HM to PcrUc to keep Undercarriage lifetime auto-updated
            $pcrUcs = PcrUc::where('unit_id', $unit->id)->get();
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
                    'status' => $statusStr,
                ]);
            }

            // Sync current HM to active Tyres to keep Tyre running lifetime auto-updated
            $activeTyres = Tyre::where('unit_id', $unit->id)->where('condition', 'ACTIVE')->get();
            foreach ($activeTyres as $tyre) {
                $installedHm = (float) ($tyre->installed_hm ?? 0);
                $isOriginal = str_contains(strtoupper((string) $tyre->notes), 'ORIGINAL BY UNIT');
                $runningHm = ($isOriginal || $installedHm <= 0) ? $newHm : max(0, $newHm - $installedHm);
                $tyre->update([
                    'total_hm' => round($runningHm, 1),
                ]);
            }
        }

        // 2. Check PM Due (Simple logic: if current HM modulo PM interval is close to 0 or crossed)
        // Note: A robust CMMS usually tracks "last_pm_hm" per service type.
        // For this MVP adaptation, we check if any active PM service rule is triggered.
        $pmServices = PmService::where('is_active', true)->get();

        foreach ($pmServices as $pm) {
            $interval = $pm->interval_hm;
            if ($interval <= 0) {
                continue;
            }

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
     * @param  float  $currentHm
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
            'job_instruction' => 'Perform standard '.$pm->nama_pm.' service. Inspect components and replace filters as per schedule.',
            'request_by' => 'System (Auto-Generated)',
            'request_date' => $date,
        ]);
    }

    /**
     * Synchronize unit HM with its latest HourMeterLog and update connected components (PcrUc, Tyres).
     */
    public static function syncUnitFromLatestLog(Unit $unit, bool $force = true): void
    {
        $latestLog = HourMeterLog::where('unit_id', $unit->id)
            ->orWhere('code_unit', $unit->code_unit)
            ->whereDate('log_date', '<=', Carbon::now()->toDateString())
            ->orderByDesc('log_date')
            ->orderByDesc('id')
            ->first();

        if ($latestLog && $latestLog->hm_end !== null) {
            $newHm = (float) $latestLog->hm_end;
            if ($force || $newHm > (float) $unit->hm) {
                self::processHmUpdate($unit, $newHm, $latestLog->log_date, $force);
            }
        }
    }

    /**
     * Synchronize all units with their latest HourMeterLog up to today.
     */
    public static function syncAllUnits(): int
    {
        $latestLogs = HourMeterLog::select('unit_id', 'code_unit', 'hm_end', 'log_date')
            ->whereDate('log_date', '<=', Carbon::now()->toDateString())
            ->orderBy('log_date', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->unique(function ($item) {
                return $item->unit_id ?: strtoupper(trim((string) $item->code_unit));
            });

        $count = 0;
        foreach ($latestLogs as $log) {
            if ($log->hm_end !== null) {
                $affected = DB::table('units')
                    ->where(function ($q) use ($log) {
                        if ($log->unit_id) {
                            $q->where('id', $log->unit_id);
                        } else {
                            $q->where('code_unit', $log->code_unit);
                        }
                    })
                    ->update(['hm' => (float) $log->hm_end]);

                if ($affected) {
                    $count++;
                }
            }
        }

        return $count;
    }
}
