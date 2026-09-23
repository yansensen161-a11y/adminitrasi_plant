<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE `maintenance_orders` MODIFY COLUMN `priority` ENUM('P1', 'P2', 'P3', 'BACKLOG', 'HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'BACKLOG'");
        }
        DB::table('maintenance_orders')->where('priority', 'HIGH')->update(['priority' => 'P1']);
        DB::table('maintenance_orders')->where('priority', 'MEDIUM')->update(['priority' => 'P2']);
        DB::table('maintenance_orders')->where('priority', 'LOW')->update(['priority' => 'P3']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('maintenance_orders')->where('priority', 'P1')->update(['priority' => 'HIGH']);
        DB::table('maintenance_orders')->where('priority', 'P2')->update(['priority' => 'MEDIUM']);
        DB::table('maintenance_orders')->where('priority', 'P3')->update(['priority' => 'LOW']);
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE `maintenance_orders` MODIFY COLUMN `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'BACKLOG') NOT NULL DEFAULT 'BACKLOG'");
        }
    }
};
