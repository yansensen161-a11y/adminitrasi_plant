<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('maintenance_orders', function (Blueprint $table) {
            $table->string('wo_type')->nullable()->after('id')->comment('Type of Work Order');
            $table->dateTime('downtime_start')->nullable()->after('pic');
            $table->dateTime('downtime_end')->nullable()->after('downtime_start');
            $table->dateTime('actual_start')->nullable()->after('downtime_end');
            $table->dateTime('actual_end')->nullable()->after('actual_start');
            $table->string('failure_code')->nullable()->after('actual_end');
            $table->text('root_cause')->nullable()->after('failure_code');
            $table->text('action_taken')->nullable()->after('root_cause');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_orders', function (Blueprint $table) {
            $table->dropColumn([
                'wo_type',
                'downtime_start',
                'downtime_end',
                'actual_start',
                'actual_end',
                'failure_code',
                'root_cause',
                'action_taken',
            ]);
        });
    }
};
