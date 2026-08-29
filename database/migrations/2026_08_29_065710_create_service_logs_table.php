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
        Schema::create('service_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('unit_id')->constrained()->onDelete('cascade');
            $table->integer('service_type'); // e.g. 250, 500, 1000
            $table->decimal('target_hm', 10, 1);
            $table->decimal('actual_hm', 10, 1)->nullable();
            $table->date('target_date')->nullable();
            $table->date('actual_date')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'overdue'])->default('scheduled');
            $table->integer('work_hours_per_day')->default(22);
            $table->integer('back_evo')->nullable();
            $table->decimal('accuracy', 5, 2)->nullable(); // e.g. 98.50
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_logs');
    }
};
