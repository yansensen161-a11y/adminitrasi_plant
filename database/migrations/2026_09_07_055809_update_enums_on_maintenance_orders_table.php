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
            DB::statement("ALTER TABLE maintenance_orders MODIFY COLUMN status ENUM('OPEN', 'PROCESS', 'CLOSED', 'CANCEL', 'WAITING PART', 'COMPLETED', 'CANCEL ORDER', 'DRAFT') NOT NULL DEFAULT 'OPEN'");
            DB::statement("ALTER TABLE maintenance_orders MODIFY COLUMN priority ENUM('LOW', 'MEDIUM', 'HIGH', 'BACKLOG') NOT NULL DEFAULT 'BACKLOG'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE maintenance_orders MODIFY COLUMN status ENUM('OPEN', 'PROCESS', 'CLOSED', 'CANCEL') NOT NULL DEFAULT 'OPEN'");
            DB::statement("ALTER TABLE maintenance_orders MODIFY COLUMN priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'LOW'");
        }
    }
};
