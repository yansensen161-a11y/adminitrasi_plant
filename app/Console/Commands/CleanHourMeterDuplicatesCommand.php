<?php

namespace App\Console\Commands;

use App\Models\HourMeterLog;
use App\Models\Unit;
use App\Services\HMUpdateService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('hm:clean-duplicates {--dry-run : Only preview what will be deleted without actually deleting}')]
#[Description('Clean up corrupt imports and duplicate hour meter logs, then resync master unit HMs')]
class CleanHourMeterDuplicatesCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->info($dryRun ? '=== PREVIEW: Cleaning Hour Meter Logs ===' : '=== START: Cleaning Hour Meter Logs ===');

        // Step 1: Count & delete corrupt bogus imports from Sept 12-13
        $bogusQuery = HourMeterLog::where(function ($q) {
            $q->where('id', 'like', '01a09871%')
                ->orWhere('id', 'like', '01a09876%')
                ->orWhere('id', 'like', '01a09882%');
        });

        $bogusCount = (clone $bogusQuery)->count();
        $this->info("1. Corrupt bogus records identified: {$bogusCount}");

        if (! $dryRun && $bogusCount > 0) {
            $deletedBogus = $bogusQuery->delete();
            $this->info("   -> Deleted {$deletedBogus} corrupt bogus records.");
        }

        // Step 2: Deduplicate identical records per unit, date, and shift
        $unitIds = Unit::pluck('id');
        $allDupIdsToDelete = [];

        foreach ($unitIds as $uid) {
            $logs = HourMeterLog::where('unit_id', $uid)
                ->orderBy('log_date', 'asc')
                ->orderBy('shift', 'asc')
                ->orderByDesc('id')
                ->get(['id', 'log_date', 'shift', 'hm_end']);

            $seen = [];
            foreach ($logs as $log) {
                $key = $log->log_date.'|'.($log->shift ?? '');
                if (isset($seen[$key])) {
                    $allDupIdsToDelete[] = $log->id;
                } else {
                    $seen[$key] = true;
                }
            }
        }

        $dupCount = count($allDupIdsToDelete);
        $this->info("2. Excess duplicate records identified: {$dupCount}");

        if (! $dryRun && $dupCount > 0) {
            // Delete in chunks of 500
            $chunks = array_chunk($allDupIdsToDelete, 500);
            $deletedDupCount = 0;
            foreach ($chunks as $chunk) {
                $deletedDupCount += HourMeterLog::whereIn('id', $chunk)->delete();
            }
            $this->info("   -> Deleted {$deletedDupCount} duplicate records.");
        }

        // Step 3: Resync master HM on units
        if (! $dryRun) {
            $this->info('3. Resynchronizing master HM for all units from latest logs...');
            HMUpdateService::syncAllUnits();
            $this->info('   -> All units master HM resynced successfully.');
        }

        $remainingTotal = HourMeterLog::count();
        $this->info("Finished! Remaining total clean logs in database: {$remainingTotal}");

        return self::SUCCESS;
    }
}
