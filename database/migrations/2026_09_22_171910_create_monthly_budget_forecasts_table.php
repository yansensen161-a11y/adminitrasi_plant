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
        Schema::create('monthly_budget_forecasts', function (Blueprint $table) {
            $table->id();
            $table->integer('year')->default(2026);
            $table->string('tab');
            $table->string('code_unit');
            $table->string('type_unit')->nullable();
            $table->string('hm')->nullable();
            $table->integer('no')->nullable();
            $table->string('code_budget')->nullable();
            $table->string('cost_element')->nullable();
            $table->string('code_depart')->nullable();
            $table->text('uraian')->nullable();
            $table->string('std_qty')->nullable();
            $table->string('forecast_qty')->nullable();
            $table->string('satuan')->nullable();
            $table->decimal('unit_rate', 18, 2)->default(0);
            $table->decimal('amount', 18, 2)->default(0);
            $table->timestamps();

            $table->index(['year', 'tab']);
            $table->index('code_unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_budget_forecasts');
    }
};
