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
            $table->decimal('hm_bd', 10, 1)->nullable()->after('waktu_breakdown');
            $table->decimal('hm_rfu', 10, 1)->nullable()->after('waktu_rfu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn(['hm_bd', 'hm_rfu']);
        });
    }
};
