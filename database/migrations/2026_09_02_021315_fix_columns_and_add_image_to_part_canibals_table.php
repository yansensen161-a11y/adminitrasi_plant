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
        Schema::table('part_canibals', function (Blueprint $table) {
            $table->dropColumn(['part_name', 'qty', 'description']);
            $table->string('image')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_canibals', function (Blueprint $table) {
            $table->string('part_name')->nullable();
            $table->integer('qty')->nullable();
            $table->text('description')->nullable();
            $table->dropColumn('image');
        });
    }
};
