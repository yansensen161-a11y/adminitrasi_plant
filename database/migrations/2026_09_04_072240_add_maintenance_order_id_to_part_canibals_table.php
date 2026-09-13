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
        Schema::table('part_canibals', function (Blueprint $table) {
            $table->foreignUuid('maintenance_order_id')->nullable()->constrained('maintenance_orders')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_canibals', function (Blueprint $table) {
            $table->dropForeign(['maintenance_order_id']);
            $table->dropColumn('maintenance_order_id');
        });
    }
};
