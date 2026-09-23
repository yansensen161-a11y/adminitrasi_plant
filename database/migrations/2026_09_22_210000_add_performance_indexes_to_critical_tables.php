<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * High-impact performance composite indexes for enterprise scalability.
     */
    public function up(): void
    {
        // 1. Work Orders
        Schema::table('work_orders', function (Blueprint $table) {
            $table->index(['tipe_wo', 'status_wo', 'created_at'], 'idx_wo_type_status_created');
            $table->index(['status_pengerjaan', 'priority'], 'idx_wo_prog_prio');
            $table->index('created_at', 'idx_wo_created_at');
        });

        // 2. Maintenance Orders
        Schema::table('maintenance_orders', function (Blueprint $table) {
            $table->index(['status', 'tanggal'], 'idx_mo_status_tanggal');
            $table->index(['unit_id', 'tanggal'], 'idx_mo_unit_tanggal');
        });

        // 3. Breakdowns
        Schema::table('breakdowns', function (Blueprint $table) {
            $table->index(['status', 'date'], 'idx_bd_status_date');
            $table->index(['unit_id', 'date'], 'idx_bd_unit_date');
        });

        // 4. Hour Meter Logs (Covering Index for Multi-Year Fleet Aggregates)
        Schema::table('hour_meter_logs', function (Blueprint $table) {
            $table->index(['log_date', 'unit_id', 'hm_total'], 'idx_hml_date_unit_hm');
        });

        // 5. Maintenance Order Parts
        Schema::table('maintenance_order_parts', function (Blueprint $table) {
            $table->index('department', 'idx_mop_department');
            $table->index('part_number', 'idx_mop_part_number');
            $table->index('due_date_part', 'idx_mop_due_date_part');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropIndex('idx_wo_type_status_created');
            $table->dropIndex('idx_wo_prog_prio');
            $table->dropIndex('idx_wo_created_at');
        });

        Schema::table('maintenance_orders', function (Blueprint $table) {
            $table->dropIndex('idx_mo_status_tanggal');
            $table->dropIndex('idx_mo_unit_tanggal');
        });

        Schema::table('breakdowns', function (Blueprint $table) {
            $table->dropIndex('idx_bd_status_date');
            $table->dropIndex('idx_bd_unit_date');
        });

        Schema::table('hour_meter_logs', function (Blueprint $table) {
            $table->dropIndex('idx_hml_date_unit_hm');
        });

        Schema::table('maintenance_order_parts', function (Blueprint $table) {
            $table->dropIndex('idx_mop_department');
            $table->dropIndex('idx_mop_part_number');
            $table->dropIndex('idx_mop_due_date_part');
        });
    }
};
