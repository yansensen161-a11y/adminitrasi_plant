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
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('no_wo')->unique();
            $table->string('tipe_wo'); // BREAKDOWN, SCHEDULE
            $table->string('downtime_code'); // Unschedule, Schedule, Accident, Opportunity
            $table->string('site');
            $table->foreignUuid('unit_id')->constrained('units')->onDelete('cascade');
            $table->dateTime('waktu_breakdown')->nullable();
            $table->dateTime('waktu_rfu')->nullable();
            $table->decimal('durasi_hrs', 8, 2)->nullable();
            $table->integer('hm_unit')->nullable();
            $table->string('status_wo'); // OPEN, PROCESS, WAITING PART, COMPLETED
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
