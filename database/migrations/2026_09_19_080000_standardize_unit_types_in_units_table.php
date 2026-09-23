<?php

use App\Http\Controllers\UnitController;
use App\Models\Unit;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $units = Unit::all();

        foreach ($units as $unit) {
            $standardType = UnitController::resolveStandardUnitType($unit->code_unit, $unit->model, $unit->type_unit);
            if ($unit->type_unit !== $standardType) {
                $unit->update(['type_unit' => $standardType]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reversible not required as this standardizes data taxonomy
    }
};
