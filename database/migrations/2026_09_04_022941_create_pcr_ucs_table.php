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
        Schema::create('pcr_ucs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('unit_id')->constrained('units')->onDelete('cascade');
            $table->string('part_number');
            $table->string('description')->nullable();
            $table->string('component')->nullable();
            $table->double('target_life_time')->nullable();
            $table->double('hm_replace')->nullable();
            $table->date('date_replace')->nullable();
            $table->string('brand_produk')->nullable();
            $table->double('hm_current')->nullable();
            $table->double('life_time_pct')->nullable();
            $table->string('status')->nullable();
            $table->double('next_plant')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pcr_ucs');
    }
};
