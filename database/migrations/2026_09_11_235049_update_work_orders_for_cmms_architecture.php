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
        Schema::table('work_orders', function (Blueprint $table) {
            // Priority
            $table->string('priority')->default('LOW')->after('tipe_wo'); // CRITICAL, HIGH, MEDIUM, LOW

            // CMMS Details
            $table->dateTime('request_date')->nullable()->after('keterangan');
            $table->string('request_by')->nullable();
            $table->string('department')->nullable();
            $table->string('location')->nullable();

            $table->text('problem')->nullable();
            $table->text('failure_description')->nullable();
            $table->text('job_instruction')->nullable();

            // Components
            $table->string('component')->nullable();
            $table->string('component_model')->nullable();
            $table->string('component_sn')->nullable();

            // Planners & Scheduling
            $table->string('maintenance_type')->nullable(); // Breakdown, PM 500, Inspection, etc
            $table->string('planner')->nullable();
            $table->string('supervisor')->nullable();
            $table->string('pic')->nullable();
            $table->string('vendor')->nullable();

            // Times & Dates
            $table->date('schedule_date')->nullable();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('finish_date')->nullable();
            $table->dateTime('close_date')->nullable();

            $table->decimal('estimated_job', 8, 2)->nullable();
            $table->decimal('actual_job', 8, 2)->nullable();

            // Findings
            $table->text('root_cause')->nullable();
            $table->text('corrective_action')->nullable();
            $table->text('remark')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn([
                'priority', 'request_date', 'request_by', 'department', 'location',
                'problem', 'failure_description', 'job_instruction',
                'component', 'component_model', 'component_sn',
                'maintenance_type', 'planner', 'supervisor', 'pic', 'vendor',
                'schedule_date', 'start_date', 'finish_date', 'close_date',
                'estimated_job', 'actual_job', 'root_cause', 'corrective_action', 'remark',
            ]);
        });
    }
};
