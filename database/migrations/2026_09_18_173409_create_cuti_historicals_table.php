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
        Schema::create('cuti_historicals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('manpower_id')->nullable()->index();
            $table->string('nrp')->index();
            $table->string('nama');
            $table->string('periode')->default('Periode 1 - 2026');
            $table->string('tgl_mulai')->nullable();
            $table->string('tgl_selesai')->nullable();
            $table->integer('durasi')->default(14);
            $table->string('jenis_cuti')->default('Cuti Periodik (Roster)');
            $table->string('tujuan')->nullable();
            $table->string('transportasi')->nullable();
            $table->string('status')->default('SELESAI');
            $table->string('no_dokumen')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cuti_historicals');
    }
};
