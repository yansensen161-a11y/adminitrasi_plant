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
        Schema::create('plan_inspection_targets', function (Blueprint $table) {
            $table->id();
            $table->char('unit_id', 36);
            $table->foreign('unit_id')->references('id')->on('units')->cascadeOnDelete();
            $table->string('category'); // washing, inspection, greasing
            $table->integer('month');
            $table->integer('year');
            $table->integer('target_value');
            $table->timestamps();

            $table->unique(['unit_id', 'category', 'month', 'year'], 'plan_inspection_target_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_inspection_targets');
    }
};
