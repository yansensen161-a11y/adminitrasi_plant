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
        Schema::create('plant_forms', function (Blueprint $table) {
            $table->id();
            $table->string('form_type')->default('PM_773E'); // e.g. PM_773E
            $table->string('form_number')->unique();
            $table->string('project_id')->nullable();
            $table->foreignUuid('unit_id')->constrained('units')->onDelete('cascade');
            $table->date('date');
            $table->string('shift', 10)->default('DS'); // DS, NS
            $table->decimal('smu', 10, 1)->nullable(); // SMU / HM
            $table->string('service_type', 10)->default('A'); // A, B, C, D, E
            $table->json('oil_samples')->nullable();
            $table->json('items')->nullable(); // checklist items state
            $table->json('results_data')->nullable(); // measurement values (RPM, cycle times, ratings)
            $table->text('notes')->nullable();
            $table->string('mechanic_name')->nullable();
            $table->string('supervisor_name')->nullable();
            $table->string('status', 20)->default('COMPLETED'); // DRAFT, COMPLETED
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plant_forms');
    }
};
