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
        Schema::create('wo_outside_repairs', function (Blueprint $table) {
            $table->id();
            $table->string('wo_no')->unique();
            $table->date('date');
            $table->string('nama_bengkel');
            $table->date('tanggal_kirim')->nullable();
            $table->date('estimasi_finish')->nullable();
            $table->date('tanggal_kembali')->nullable();
            $table->string('pic')->nullable();
            $table->string('lokasi')->nullable();
            $table->date('tanggal_kerusakan')->nullable();

            // Machine / Unit Info
            $table->foreignUuid('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kode_unit')->nullable();
            $table->string('model_mesin')->nullable();
            $table->string('serial_no_unit')->nullable();

            // Component Info
            $table->string('nama_komponen');
            $table->string('model_komponen')->nullable();
            $table->string('sn_komponen')->nullable();
            $table->decimal('smr_hours', 10, 2)->default(0);
            $table->decimal('prev_smr_hours', 10, 2)->default(0);
            $table->decimal('lifetime_hours', 10, 2)->default(0);
            $table->decimal('target_lifetime', 10, 2)->default(5000);
            $table->integer('qty')->default(1);

            // Instructions & Problem
            $table->text('problem')->nullable();
            $table->text('job_instruction')->nullable();
            $table->string('photo_path')->nullable();

            // Workflow status & Costs
            $table->string('status')->default('DIKIRIM'); // DIKIRIM, PROSES REPAIR, SELESAI, TERPASANG
            $table->decimal('estimasi_biaya', 15, 2)->default(0);
            $table->decimal('aktual_biaya', 15, 2)->default(0);
            $table->integer('garansi_bulan')->default(1);

            // Signatures metadata
            $table->string('dibuat_oleh')->default('Admin Plant');
            $table->string('diketahui_oleh')->default('Planner');
            $table->string('disetujui_oleh')->default('Superintendent Plant');
            $table->string('dikirim_oleh')->default('Logistic');
            $table->string('diterima_oleh')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wo_outside_repairs');
    }
};
