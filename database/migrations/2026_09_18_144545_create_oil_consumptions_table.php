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
        Schema::create('oil_consumptions', function (Blueprint $table) {
            $table->id();
            $table->char('unit_id', 36)->nullable()->index();
            $table->foreign('unit_id')->references('id')->on('units')->nullOnDelete();
            $table->string('code_unit');
            $table->string('model')->nullable();
            $table->string('department')->nullable();
            $table->date('date');
            $table->decimal('hm_prev', 12, 2)->default(0);
            $table->decimal('hm', 12, 2)->default(0);
            $table->decimal('hm_diff', 12, 2)->default(0);
            $table->string('component')->nullable()->default('Engine');
            $table->string('type_oli')->nullable();
            $table->decimal('pengisian', 10, 2)->default(0);
            $table->decimal('konsumsi', 10, 2)->default(0);
            $table->decimal('l_per_1000', 10, 2)->default(0);
            $table->decimal('batas_normal', 6, 2)->default(0.50);
            $table->string('status')->default('Normal');
            $table->text('remarks')->nullable();
            $table->string('pic')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('oil_consumptions');
    }
};
