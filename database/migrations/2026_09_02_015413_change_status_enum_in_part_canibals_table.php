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
        // Change the status column from enum to string
        DB::statement("ALTER TABLE part_canibals MODIFY status VARCHAR(255) DEFAULT 'Waiting part'");
        DB::statement("UPDATE part_canibals SET status = 'Waiting part'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back if necessary
    }
};
