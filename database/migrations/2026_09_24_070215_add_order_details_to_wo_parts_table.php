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
        Schema::table('wo_parts', function (Blueprint $table) {
            $table->uuid('maintenance_order_id')->nullable()->after('work_order_id');
            $table->uuid('maintenance_order_part_id')->nullable()->after('maintenance_order_id');
            $table->string('no_order', 100)->nullable()->after('maintenance_order_part_id');
            $table->string('pr', 100)->nullable()->after('status');
            $table->string('po', 100)->nullable()->after('pr');
            $table->string('eta_part', 100)->nullable()->after('po');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wo_parts', function (Blueprint $table) {
            $table->dropColumn([
                'maintenance_order_id',
                'maintenance_order_part_id',
                'no_order',
                'pr',
                'po',
                'eta_part',
            ]);
        });
    }
};
