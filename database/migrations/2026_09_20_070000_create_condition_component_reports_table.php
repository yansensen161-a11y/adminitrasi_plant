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
        Schema::dropIfExists('condition_component_report_items');
        Schema::dropIfExists('condition_component_reports');

        Schema::create('condition_component_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_no')->nullable()->unique();

            // Header Left Side
            $table->string('project')->nullable(); // Proyek
            $table->string('location')->nullable(); // Lokasi
            $table->date('date_reported')->nullable(); // Tanggal dilaporkan
            $table->string('reported_by')->nullable(); // Dilaporkan oleh
            $table->string('company_name')->default('PT. MITRA ABADI MAHAKAM'); // Nama perusahaan

            // Header Right Side
            $table->char('unit_id', 36)->nullable(); // Reference to units table if applicable
            $table->string('unit_code')->nullable(); // UNIT ID / No. Unit
            $table->string('model')->nullable(); // MODEL / Model
            $table->string('serial_no')->nullable(); // SERIAL NO. / Serial No.

            $table->date('date_install')->nullable(); // DATE INSTALL / Tanggal saat kejadian
            $table->decimal('hm_install', 10, 2)->nullable(); // HM Install / SMU saat kejadian

            $table->date('date_failure')->nullable(); // DATE OF FAILURE / Tanggal saat kejadian
            $table->decimal('hm_failure', 10, 2)->nullable(); // Hm Failure / SMU saat kejadian (Hrs)

            // Highlighted Metrics
            $table->integer('life_time_days')->nullable(); // Life time (Days)
            $table->decimal('hm_life', 10, 2)->nullable(); // HM Life (Hrs)

            // Signatures
            $table->string('dibuat_oleh')->nullable();
            $table->string('disetujui_oleh')->nullable(); // Spv/Fm
            $table->string('diketahui_oleh')->nullable(); // Superintendant

            $table->string('status')->default('DRAFT'); // DRAFT, APPROVED, CLOSED
            $table->timestamps();
        });

        Schema::create('condition_component_report_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('report_id');
            $table->foreign('report_id', 'ccr_item_report_fk')
                ->references('id')
                ->on('condition_component_reports')
                ->cascadeOnDelete();
            $table->integer('item_no')->default(1);
            $table->text('remarks')->nullable();
            $table->string('picture_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('condition_component_report_items');
        Schema::dropIfExists('condition_component_reports');
    }
};
