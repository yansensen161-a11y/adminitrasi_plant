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
            $table->string('status_penggantian')->nullable()->default('Belum Diganti')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pcr_ucs', function (Blueprint $table) {
            $table->dropColumn('status_penggantian');
        });
    }
};
