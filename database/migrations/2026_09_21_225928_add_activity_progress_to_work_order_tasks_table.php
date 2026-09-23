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
            $table->text('activity_progress')->nullable()->after('problem');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_order_tasks', function (Blueprint $table) {
            $table->dropColumn('activity_progress');
        });
    }
};
