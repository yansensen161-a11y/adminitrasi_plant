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
        Schema::table('p2h_inspections', function (Blueprint $table) {
            $table->string('component_group')->nullable()->after('model');
            $table->string('component_name')->nullable()->after('component_group');
            $table->string('priority', 10)->default('P2')->after('component_name');
            $table->string('image')->nullable()->after('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('p2h_inspections', function (Blueprint $table) {
            $table->dropColumn(['component_group', 'component_name', 'priority', 'image']);
        });
    }
};
