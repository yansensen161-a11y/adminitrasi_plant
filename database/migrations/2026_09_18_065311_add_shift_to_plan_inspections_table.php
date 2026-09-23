<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('plan_inspections', 'shift')) {
            Schema::table('plan_inspections', function (Blueprint $table) {
                $table->string('shift', 20)->default('all')->after('category');
            });
        }

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            $indexes = collect(DB::select('SHOW INDEX FROM plan_inspections'))->pluck('Key_name')->unique();

            if ($indexes->contains('plan_inspections_unit_id_inspection_date_category_unique')) {
                Schema::table('plan_inspections', function (Blueprint $table) {
                    $table->index('unit_id', 'temp_fk_unit_id_idx');
                });
                Schema::table('plan_inspections', function (Blueprint $table) {
                    $table->dropUnique('plan_inspections_unit_id_inspection_date_category_unique');
                });
                Schema::table('plan_inspections', function (Blueprint $table) {
                    $table->unique(['unit_id', 'inspection_date', 'category', 'shift'], 'plan_inspections_unique_shift');
                });
                Schema::table('plan_inspections', function (Blueprint $table) {
                    $table->dropIndex('temp_fk_unit_id_idx');
                });
            } elseif (! $indexes->contains('plan_inspections_unique_shift')) {
                Schema::table('plan_inspections', function (Blueprint $table) {
                    $table->unique(['unit_id', 'inspection_date', 'category', 'shift'], 'plan_inspections_unique_shift');
                });
            }
        } elseif ($driver === 'sqlite') {
            try {
                Schema::table('plan_inspections', function (Blueprint $table) {
                    $table->dropUnique(['unit_id', 'inspection_date', 'category']);
                });
            } catch (Throwable $e) {
            }

            try {
                Schema::table('plan_inspections', function (Blueprint $table) {
                    $table->unique(['unit_id', 'inspection_date', 'category', 'shift'], 'plan_inspections_unique_shift');
                });
            } catch (Throwable $e) {
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('plan_inspections', 'shift')) {
            Schema::table('plan_inspections', function (Blueprint $table) {
                $table->dropColumn('shift');
            });
        }
    }
};
