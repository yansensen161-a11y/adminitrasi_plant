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
        Schema::create('unit_apls', function (Blueprint $table) {
            $table->id();

            // Unit Association
            $table->uuid('unit_id')->nullable()->index();
            $table->foreign('unit_id')->references('id')->on('units')->nullOnDelete();
            $table->string('code_unit')->nullable()->index();
            $table->string('model_unit')->nullable()->index();
            $table->string('type_unit')->nullable()->index();

            // APL Columns (sesuai gambar)
            $table->string('part_number')->index();
            $table->string('depart')->nullable()->index(); // Departemen / Kompartemen
            $table->text('description')->nullable();
            $table->decimal('qty', 10, 2)->default(1);
            $table->string('satuan', 50)->default('PCS');
            $table->string('ps_250')->nullable();
            $table->string('ps_500')->nullable();
            $table->string('ps_1000')->nullable();
            $table->string('ps_2000')->nullable();
            $table->decimal('price_rate', 15, 2)->default(0);
            $table->decimal('amount', 15, 2)->default(0);

            // Scope & Notes
            $table->boolean('is_global')->default(false)->index();
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_apls');
    }
};
