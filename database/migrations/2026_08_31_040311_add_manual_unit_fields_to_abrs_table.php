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
        Schema::table('abrs', function (Blueprint $table) {
            // Drop existing foreign key
            $table->dropForeign(['unit_id']);

            // Make unit_id nullable
            $table->uuid('unit_id')->nullable()->change();

            // Re-add foreign key with nullable behavior
            $table->foreign('unit_id')->references('id')->on('units')->onDelete('set null');

            // Add manual fields
            $table->string('manual_unit_code')->nullable()->after('unit_id');
            $table->string('manual_unit_model')->nullable()->after('manual_unit_code');
            $table->string('manual_sn_chassis')->nullable()->after('manual_unit_model');
            $table->string('manual_engine_model')->nullable()->after('manual_sn_chassis');
            $table->string('manual_sn_engine')->nullable()->after('manual_engine_model');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('abrs', function (Blueprint $table) {
            $table->dropColumn([
                'manual_unit_code',
                'manual_unit_model',
                'manual_sn_chassis',
                'manual_engine_model',
                'manual_sn_engine',
            ]);

            $table->dropForeign(['unit_id']);
            $table->uuid('unit_id')->nullable(false)->change();
            $table->foreign('unit_id')->references('id')->on('units')->onDelete('cascade');
        });
    }
};
