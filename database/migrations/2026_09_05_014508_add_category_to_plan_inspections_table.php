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
        Schema::table('plan_inspections', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropUnique(['unit_id', 'inspection_date']);

            $table->string('category', 50)->default('inspection')->after('unit_id');
            $table->unique(['unit_id', 'inspection_date', 'category']);
            $table->foreign('unit_id')->references('id')->on('units')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plan_inspections', function (Blueprint $table) {
            $table->dropUnique(['unit_id', 'inspection_date', 'category']);
            $table->dropColumn('category');
            $table->unique(['unit_id', 'inspection_date']);
        });
    }
};
