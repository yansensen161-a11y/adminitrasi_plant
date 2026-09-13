<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->string('tool_code')->unique(); // e.g. TL-001
            $table->string('name');
            $table->string('brand')->nullable();
            $table->string('category')->nullable(); // Hand Tool, Power Tool, Measuring, Safety, etc.
            $table->string('specifications')->nullable();
            $table->string('location')->nullable(); // Lemari A, Rak B1, dll.
            $table->enum('condition', ['GOOD', 'DAMAGE', 'SCRAP'])->default('GOOD');
            $table->enum('status', ['AVAILABLE', 'BORROWED', 'MAINTENANCE', 'SCRAP'])->default('AVAILABLE');
            $table->integer('qty')->default(1);
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};
