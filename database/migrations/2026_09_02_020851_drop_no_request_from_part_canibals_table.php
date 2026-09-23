<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            Schema::table('part_canibals', function (Blueprint $table) {
                $table->dropUnique('part_canibals_no_request_unique');
                $table->dropColumn('no_request');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_canibals', function (Blueprint $table) {
            $table->string('no_request')->nullable();
        });
    }
};
