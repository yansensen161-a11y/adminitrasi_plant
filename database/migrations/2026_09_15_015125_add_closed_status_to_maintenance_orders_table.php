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
            DB::statement("ALTER TABLE maintenance_orders MODIFY COLUMN status ENUM('OPEN','WAITING PART','IN PROGRESS','PROCESS','PARTIAL','COMPLETED','CLOSED','CANCEL ORDER','BACKLOG') NOT NULL DEFAULT 'WAITING PART'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE maintenance_orders MODIFY COLUMN status ENUM('OPEN','WAITING PART','IN PROGRESS','PARTIAL','COMPLETED','CANCEL ORDER','BACKLOG') NOT NULL DEFAULT 'WAITING PART'");
        }
    }
};
