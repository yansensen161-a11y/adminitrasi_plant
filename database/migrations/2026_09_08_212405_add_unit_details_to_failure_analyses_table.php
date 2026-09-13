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
        Schema::table('failure_analyses', function (Blueprint $table) {
            $table->string('unit_model')->nullable()->after('unit_id');
            $table->string('unit_sn')->nullable()->after('unit_model');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('failure_analyses', function (Blueprint $table) {
            $table->dropColumn(['unit_model', 'unit_sn']);
        });
    }
};
