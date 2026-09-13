<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('failure_analyses', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // IDENTITAS FAR
            $table->string('no_far')->unique();
            $table->string('status')->default('Draft'); // Draft or Final
            $table->date('tgl_kejadian');
            $table->date('tgl_lapor');
            $table->uuid('pelapor_id')->nullable(); // relates to users

            // IDENTITAS UNIT
            $table->uuid('unit_id'); // relates to units
            $table->string('site_project')->nullable();
            $table->string('smu_failure')->nullable(); // e.g., 4,445 HM

            // COMPONENT FAILURE
            $table->string('part_no')->nullable();
            $table->string('nama_komp')->nullable();
            $table->string('pn')->nullable();
            $table->string('penyebab')->nullable();
            $table->string('engine_model')->nullable();
            $table->string('engine_sn')->nullable();

            // LAST COMP & OIL
            $table->string('comp_installed')->nullable();
            $table->string('comp_hours')->nullable();
            $table->string('oil_sampled')->nullable();
            $table->string('oil_eval')->nullable();

            // ANALYSIS DETAILS
            $table->text('failure_outline')->nullable();
            $table->text('background')->nullable();
            $table->text('failure_analysis')->nullable();
            $table->text('conclusion')->nullable();

            // SIGNATURES
            $table->string('prepared_by')->nullable();
            $table->string('reviewed_by')->nullable();
            $table->string('approved_by')->nullable();

            $table->timestamps();

            $table->foreign('pelapor_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('unit_id')->references('id')->on('units')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failure_analyses');
    }
};
