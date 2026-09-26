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
        // 1. Get IDs of units created accidentally from Excel formula strings
        $formulaUnitIds = DB::table('units')
            ->where('code_unit', 'LIKE', '=%')
            ->pluck('id');

        if ($formulaUnitIds->isNotEmpty()) {
            // Cascade delete any magnetic plugs created with these formula units
            DB::table('magnetic_plugs')
                ->whereIn('unit_id', $formulaUnitIds)
                ->delete();

            // Delete the formula units
            DB::table('units')
                ->whereIn('id', $formulaUnitIds)
                ->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse needed as these were corrupt formula entries
    }
};
