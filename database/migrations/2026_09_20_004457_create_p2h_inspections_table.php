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
        Schema::create('p2h_inspections', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignUuid('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('code_unit');
            $table->string('model')->nullable();
            $table->decimal('hm', 10, 1)->default(0);
            $table->string('hour_meter')->nullable();
            $table->string('shift')->default('Shift 1 (Siang)');
            $table->string('inspector_name')->nullable();
            $table->integer('total_item_ok')->default(24);
            $table->integer('total_item_caution')->default(3);
            $table->integer('total_item_abnormal')->default(1);
            $table->integer('total_item_total')->default(28);
            $table->string('pct_ok')->default('85.7%');
            $table->string('pct_caution')->default('10.7%');
            $table->string('pct_abnormal')->default('3.6%');
            $table->string('status')->default('CAUTION');
            $table->text('notes')->nullable();
            $table->json('checklist_data')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('p2h_inspections');
    }
};
