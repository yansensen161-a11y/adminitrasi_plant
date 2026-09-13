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
        Schema::create('plan_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('unit_id')->constrained()->cascadeOnDelete();
            $table->date('inspection_date');
            $table->boolean('is_completed')->default(false); // Maybe later they want to mark it completed
            $table->timestamps();

            // Prevent duplicate inspections for the same unit on the same day
            $table->unique(['unit_id', 'inspection_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_inspections');
    }
};
