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
        Schema::create('battery_monitorings', function (Blueprint $table) {
            $table->id();

            // Unit association
            $table->uuid('unit_id')->nullable()->index();
            $table->foreign('unit_id')->references('id')->on('units')->nullOnDelete();
            $table->string('code_unit')->index();

            // Battery specs requested: Brand Battery, Part Number Description, Qty
            $table->string('brand_battery')->index(); // e.g. GS ASTRA, YUASA, INCOE, G-FORCE, DELKOR, OPTIMA, BOSCH
            $table->string('part_number')->index(); // e.g. N100, N120, N150, N200, 115D31R
            $table->text('part_number_description')->nullable(); // e.g. BATTERY 12V 150AH HEAVY DUTY
            $table->unsignedInteger('qty')->default(1); // Jumlah battery

            // Installation and hour meters requested: HM instal, HM Rusak, Life time
            $table->decimal('hm_instal', 10, 1)->default(0); // HM instal
            $table->decimal('hm_rusak', 10, 1)->nullable(); // HM Rusak
            $table->decimal('lifetime_hours', 10, 1)->default(0); // Life time = hm_rusak - hm_instal
            $table->decimal('target_lifetime_hours', 10, 1)->default(4000.0); // Target umur pakai battery (jam)

            // Date tracking
            $table->date('tanggal_instal')->nullable();
            $table->date('tanggal_rusak')->nullable();

            // Status and placement
            $table->string('status')->default('TERPASANG')->index(); // TERPASANG, RUSAK, SCRAP, CLAIM_GARANSI
            $table->string('posisi')->nullable(); // SERI 1, SERI 2, STARTING, AUXILIARY, LEFT, RIGHT
            $table->string('voltage')->default('12V'); // 12V, 24V

            // Detail & diagnosis
            $table->text('penyebab_rusak')->nullable(); // Drop sel, overcharge, pecah, dll
            $table->string('pic_instal')->nullable(); // Mekanik pemasangan
            $table->string('pic_rusak')->nullable(); // Pengawas pelapor
            $table->string('serial_number_battery')->nullable();
            $table->string('photo_path')->nullable();
            $table->decimal('cost', 15, 2)->nullable(); // Biaya / harga aki
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('battery_monitorings');
    }
};
