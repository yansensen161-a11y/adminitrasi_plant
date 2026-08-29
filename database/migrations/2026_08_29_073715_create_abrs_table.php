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
        Schema::create('abrs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('no_abr')->unique();
            $table->date('tanggal');
            $table->foreignUuid('unit_id')->constrained()->onDelete('cascade');
            
            $table->string('lokasi_site')->nullable();
            $table->string('lokasi_perbaikan')->nullable();
            $table->decimal('hm', 10, 1)->nullable();
            $table->string('inspected_by')->nullable();
            
            $table->text('incident_description')->nullable();
            
            // Totals
            $table->decimal('total_biaya', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            
            // Signatures
            $table->string('dibuat_oleh')->nullable();
            $table->string('dibuat_jabatan')->nullable();
            $table->string('checked_by')->nullable();
            $table->string('checked_jabatan')->nullable();
            $table->string('disetujui_oleh')->nullable();
            $table->string('disetujui_jabatan')->nullable();
            $table->string('diketahui_oleh')->nullable();
            $table->string('diketahui_jabatan')->nullable();
            
            $table->enum('status', ['Open', 'Close'])->default('Open');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('abrs');
    }
};
