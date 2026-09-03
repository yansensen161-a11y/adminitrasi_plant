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
        Schema::create('abr_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('abr_id')->constrained('abrs')->onDelete('cascade');
            $table->string('category');
            $table->string('part_number')->nullable();
            $table->string('description');
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('qty', 10, 2)->default(1);
            $table->string('satuan')->nullable(); // Set, Pcs
            $table->decimal('hour', 10, 2)->nullable();
            $table->decimal('mp', 10, 2)->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('abr_items');
    }
};
