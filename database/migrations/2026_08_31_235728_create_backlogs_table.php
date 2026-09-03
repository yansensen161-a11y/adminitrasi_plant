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
        Schema::create('backlogs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('unit_id')->nullable()->index();
            $table->string('lokasi')->nullable();
            $table->string('tipe_service')->nullable();
            $table->text('temuan')->nullable();
            $table->text('part_diperlukan')->nullable();
            $table->string('tindakan_mekanik')->nullable();
            $table->string('tingkat_backlog')->nullable(); // RINGAN, SEDANG, BERAT
            $table->string('target_pasang')->nullable();
            $table->date('tanggal_temuan')->nullable();
            $table->string('status')->default('OPEN'); // OPEN, PROCUREMENT, ORDERED
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backlogs');
    }
};
