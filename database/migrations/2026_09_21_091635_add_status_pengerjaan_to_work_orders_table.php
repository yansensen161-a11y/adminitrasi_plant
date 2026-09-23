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
            $table->string('status_pengerjaan', 20)->default('OPEN')->after('status_wo');
        });

        // Backfill existing records
        DB::table('work_orders')->whereIn('status_wo', ['COMPLETED', 'CLOSED'])->update(['status_pengerjaan' => 'CLOSED']);
        DB::table('work_orders')->whereNotIn('status_wo', ['COMPLETED', 'CLOSED'])->update(['status_pengerjaan' => 'OPEN']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn('status_pengerjaan');
        });
    }
};
