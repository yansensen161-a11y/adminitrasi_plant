<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tool_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tool_id')->constrained('tools')->cascadeOnDelete();
            $table->date('inspection_date');
            $table->string('inspector_name');
            $table->enum('condition', ['GOOD', 'DAMAGE', 'SCRAP']);
            $table->string('calibration_status')->nullable(); // VALID, EXPIRED, NOT_REQUIRED
            $table->date('calibration_due_date')->nullable();
            $table->text('findings')->nullable();
            $table->text('action_taken')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tool_inspections');
    }
};
