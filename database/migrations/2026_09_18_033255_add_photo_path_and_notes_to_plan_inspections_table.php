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
        Schema::table('plan_inspections', function (Blueprint $table) {
            $table->string('photo_path', 255)->nullable()->after('is_completed');
            $table->text('notes')->nullable()->after('photo_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plan_inspections', function (Blueprint $table) {
            $table->dropColumn(['photo_path', 'notes']);
        });
    }
};
