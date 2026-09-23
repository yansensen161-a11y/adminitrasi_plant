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
        Schema::create('manpowers', function (Blueprint $table) {
            $table->id();
            $table->string('nrp')->nullable()->index();
            $table->string('nama');
            $table->string('departemen')->nullable()->default('Plant')->index();
            $table->string('bagian')->nullable()->default('Mekanik'); // Job position
            $table->string('jenis_karyawan')->nullable()->default('Non Staff'); // Staff, Non Staff, Kontrak
            $table->string('jenis_kelamin', 10)->nullable()->default('L'); // L, P
            $table->string('lokasi')->nullable()->default('Lokal'); // Lokal, Non Lokal
            $table->string('doh')->nullable(); // Tanggal Masuk
            $table->string('kontak')->nullable();
            $table->string('ktp')->nullable();
            $table->string('bpjs_kes')->nullable();
            $table->string('bpjs_ket')->nullable();
            $table->string('rekening')->nullable();
            $table->text('alamat')->nullable();
            $table->string('status')->default('Aktif')->index(); // Aktif, Non Aktif, Cuti
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manpowers');
    }
};
