<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_order_tasks', function (Blueprint $table) {
            $table->string('mol')->nullable()->after('status');
            $table->string('pr')->nullable()->after('mol');
            $table->string('po')->nullable()->after('pr');
            $table->string('eta')->nullable()->after('po');
        });
    }

    public function down(): void
    {
        Schema::table('work_order_tasks', function (Blueprint $table) {
            $table->dropColumn(['mol', 'pr', 'po', 'eta']);
        });
    }
};
