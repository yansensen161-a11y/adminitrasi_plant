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
        Schema::table('maintenance_order_parts', function (Blueprint $table) {
            $table->string('component_name')->nullable()->after('component');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_order_parts', function (Blueprint $table) {
            $table->dropColumn('component_name');
        });
    }
};
