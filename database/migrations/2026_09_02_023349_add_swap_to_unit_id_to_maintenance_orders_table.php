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
        Schema::table('maintenance_orders', function (Blueprint $table) {
            $table->foreignUuid('swap_to_unit_id')->nullable()->constrained('units')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_orders', function (Blueprint $table) {
            $table->dropForeign(['swap_to_unit_id']);
            $table->dropColumn('swap_to_unit_id');
        });
    }
};
