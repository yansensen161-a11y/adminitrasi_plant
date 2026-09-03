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
        Schema::create('breakdowns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('unit_id')->nullable();
            $table->string('equipment_group')->nullable();
            $table->date('date')->nullable();
            $table->string('loc')->nullable();
            $table->string('hm')->nullable();
            $table->date('est_finish')->nullable();
            $table->integer('aging')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();

            $table->foreign('unit_id')->references('id')->on('units')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('breakdowns');
    }
};
