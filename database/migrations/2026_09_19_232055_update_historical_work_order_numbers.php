<?php

use App\Models\WorkOrder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::transaction(function () {
            // 1. Assign temporary unique strings to avoid any unique constraint collision
            DB::table('work_orders')->update([
                'no_wo' => DB::raw("CONCAT('TEMP_WO_', id)"),
            ]);

            // 2. Renumber SCHEDULE / PREVENTIVE work orders ordered from oldest date to newest date
            $scheduleWos = WorkOrder::where(function ($q) {
                $q->where('tipe_wo', 'SCHEDULE')
                    ->orWhere('tipe_wo', 'like', '%PREVENTIVE%');
            })
                ->orderByRaw('COALESCE(schedule_date, DATE(request_date), DATE(start_date), DATE(created_at)) ASC, id ASC')
                ->get();

            $seqSchedule = 1;
            foreach ($scheduleWos as $wo) {
                $newNo = 'PLT/WO/PM/'.str_pad($seqSchedule, 3, '0', STR_PAD_LEFT);
                DB::table('work_orders')->where('id', $wo->id)->update(['no_wo' => $newNo]);
                $seqSchedule++;
            }

            // 3. Renumber BREAKDOWN / CORRECTIVE work orders ordered from oldest date to newest date (if any)
            $breakdownWos = WorkOrder::where(function ($q) {
                $q->where('tipe_wo', 'BREAKDOWN')
                    ->orWhere('tipe_wo', 'like', '%CORRECTIVE%')
                    ->orWhere('tipe_wo', 'like', '%UNSCHEDULE%');
            })
                ->orderByRaw('COALESCE(schedule_date, DATE(request_date), DATE(waktu_breakdown), DATE(start_date), DATE(created_at)) ASC, id ASC')
                ->get();

            $seqBreakdown = 1;
            foreach ($breakdownWos as $wo) {
                $newNo = 'PLT/WO/CM/'.str_pad($seqBreakdown, 3, '0', STR_PAD_LEFT);
                DB::table('work_orders')->where('id', $wo->id)->update(['no_wo' => $newNo]);
                $seqBreakdown++;
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No automatic rollback needed for historical data standardization
    }
};
