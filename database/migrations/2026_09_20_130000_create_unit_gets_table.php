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
        Schema::create('unit_gets', function (Blueprint $table) {
            $table->id();
            $table->uuid('unit_id')->nullable();
            $table->string('code_unit')->nullable();
            $table->string('model_unit')->nullable();
            $table->string('type_unit')->nullable();
            $table->string('part_number');
            $table->string('depart')->nullable();
            $table->text('description')->nullable();
            $table->decimal('qty', 10, 2)->default(1);
            $table->string('satuan', 50)->default('PCS');
            $table->string('ps_250', 50)->nullable();
            $table->string('ps_500', 50)->nullable();
            $table->string('ps_1000', 50)->nullable();
            $table->string('ps_2000', 50)->nullable();
            $table->decimal('price_rate', 15, 2)->default(0);
            $table->decimal('amount', 15, 2)->default(0);
            $table->boolean('is_global')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('unit_id')->references('id')->on('units')->onDelete('cascade');
            $table->index(['unit_id', 'part_number']);
            $table->index('code_unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_gets');
    }
};
