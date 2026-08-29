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
        Schema::create('hour_meter_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('unit_id')->nullable()->index();
            $table->string('code_unit')->index();
            $table->date('log_date')->index(); // Tanggal Operasional (e.g. 2026-08-10)
            $table->decimal('hm_start', 10, 1)->default(0); // HM Awal
            $table->decimal('hm_end', 10, 1)->default(0); // HM Akhir
            $table->decimal('hm_total', 10, 1)->default(0); // Jam Operasi (hm_end - hm_start)
            $table->string('shift')->nullable(); // Shift 1 / Shift 2 / Day / Night
            $table->string('operator_name')->nullable();
            $table->string('location')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hour_meter_logs');
    }
};
