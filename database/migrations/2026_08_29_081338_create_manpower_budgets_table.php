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
        Schema::create('manpower_budgets', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // 'Staff' or 'Non Staff'
            $table->string('job_position');
            $table->integer('plan_mp')->default(0);
            $table->integer('tersedia')->default(0);
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manpower_budgets');
    }
};
