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
            $table->string('hm')->nullable()->after('unit_id');
            $table->text('description')->nullable()->after('qty');
            $table->text('remark')->nullable()->after('description');
            $table->string('no_order')->nullable()->after('remark');
            $table->string('pr')->nullable()->after('no_order');
            $table->string('po')->nullable()->after('pr');
            $table->date('eta_part')->nullable()->after('po');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_canibals', function (Blueprint $table) {
            $table->dropColumn([
                'hm',
                'description',
                'remark',
                'no_order',
                'pr',
                'po',
                'eta_part',
            ]);
        });
    }
};
