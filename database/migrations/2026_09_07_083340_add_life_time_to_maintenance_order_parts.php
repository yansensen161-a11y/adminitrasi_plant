<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_order_parts', function (Blueprint $table) {
            $table->string('life_time')->nullable()->after('department');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_order_parts', function (Blueprint $table) {
            $table->dropColumn('life_time');
        });
    }
};
