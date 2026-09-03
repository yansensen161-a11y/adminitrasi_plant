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
        Schema::table('maintenance_orders', function (Blueprint $table) {
            $table->string('part_number')->nullable()->after('department');
            $table->date('due_date_part')->nullable()->after('part_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_orders', function (Blueprint $table) {
            $table->dropColumn(['part_number', 'due_date_part']);
        });
    }
};
