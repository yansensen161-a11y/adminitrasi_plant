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
        Schema::table('p2h_inspections', function (Blueprint $table) {
            $table->text('finding')->nullable()->after('hm');
            $table->string('inspect_by')->nullable()->after('finding');
            $table->text('action')->nullable()->after('inspect_by');
            $table->string('closed_by')->nullable()->after('action');
            $table->date('closed_at')->nullable()->after('closed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('p2h_inspections', function (Blueprint $table) {
            $table->dropColumn(['finding', 'inspect_by', 'action', 'closed_by', 'closed_at']);
        });
    }
};
