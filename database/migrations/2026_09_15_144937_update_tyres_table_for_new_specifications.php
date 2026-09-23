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
        Schema::table('tyres', function (Blueprint $table) {
            $table->string('pattern')->nullable()->after('type_size');
            $table->integer('psi')->nullable()->after('pattern');
            $table->decimal('plan_rotary_target', 10, 2)->default(3000)->after('psi');

            // Rename tread columns
            $table->renameColumn('tread_depth_new', 'otd');
            $table->renameColumn('tread_depth_current', 'rtd');

            // Note: Since 'condition' is already an enum, to avoid doctrine issues when modifying enum,
            // and because it might already contain 'ACTIVE', 'REPAIR', 'SCRAP', 'STOCK' as we saw earlier:
            // $table->enum('condition', ['ACTIVE', 'REPAIR', 'SCRAP', 'STOCK'])->default('STOCK');
            // The existing enum is already correct! So we don't need to change condition column enum values.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tyres', function (Blueprint $table) {
            $table->dropColumn(['pattern', 'psi', 'plan_rotary_target']);
            $table->renameColumn('otd', 'tread_depth_new');
            $table->renameColumn('rtd', 'tread_depth_current');
        });
    }
};
