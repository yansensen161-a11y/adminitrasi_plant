<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_order_tasks', function (Blueprint $table) {
            $table->dateTime('est_finish')->nullable()->after('activity_progress');
        });
    }

    public function down(): void
    {
        Schema::table('work_order_tasks', function (Blueprint $table) {
            $table->dropColumn('est_finish');
        });
    }
};
