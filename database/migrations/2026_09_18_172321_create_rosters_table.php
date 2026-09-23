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
        Schema::create('rosters', function (Blueprint $table) {
            $table->id();
            $table->string('nrp')->nullable();
            $table->string('nama');
            $table->string('posisi')->nullable();
            $table->string('departemen')->nullable();
            $table->string('periode')->default('September 2026');
            $table->json('shifts')->nullable();
            $table->integer('total_s')->default(0);
            $table->integer('total_m')->default(0);
            $table->integer('total_o')->default(0);
            $table->integer('total_c')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rosters');
    }
};
