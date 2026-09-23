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
        Schema::table('tyres', function (Blueprint $table) {
            // Change position from enum to string
            $table->string('position')->nullable()->change();
        });

        Schema::table('tyre_histories', function (Blueprint $table) {
            // Change position from enum to string
            $table->string('from_position')->nullable()->change();
            $table->string('to_position')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting back to enum is risky and data loss might occur if values don't match,
        // so leaving it as string in down is safer, but typically we'd recreate enum.
        // For simplicity, we just leave it.
    }
};
