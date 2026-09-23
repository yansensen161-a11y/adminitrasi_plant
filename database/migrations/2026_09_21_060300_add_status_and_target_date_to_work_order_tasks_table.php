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
        Schema::table('work_order_tasks', function (Blueprint $table) {
            $table->dateTime('target_date')->nullable()->after('tools');
            $table->string('status', 100)->nullable()->default('B0 ( On progress )')->after('target_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_order_tasks', function (Blueprint $table) {
            $table->dropColumn(['target_date', 'status']);
        });
    }
};
