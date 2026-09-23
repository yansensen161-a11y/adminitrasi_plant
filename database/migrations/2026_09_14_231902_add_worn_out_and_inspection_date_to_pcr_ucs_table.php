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
        Schema::table('pcr_ucs', function (Blueprint $table) {
            $table->decimal('worn_out', 5, 2)->nullable()->after('life_time_pct');
            $table->date('inspection_date')->nullable()->after('worn_out');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pcr_ucs', function (Blueprint $table) {
            $table->dropColumn(['worn_out', 'inspection_date']);
        });
    }
};
