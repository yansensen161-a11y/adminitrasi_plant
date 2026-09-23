<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE maintenance_orders MODIFY COLUMN status ENUM('OPEN','WAITING PART','IN PROGRESS','PARTIAL','COMPLETED','CANCEL ORDER','BACKLOG') NOT NULL DEFAULT 'WAITING PART'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE maintenance_orders MODIFY COLUMN status ENUM('OPEN','WAITING PART','IN PROGRESS','COMPLETED','CANCEL ORDER','BACKLOG') NOT NULL DEFAULT 'WAITING PART'");
        }
    }
};
