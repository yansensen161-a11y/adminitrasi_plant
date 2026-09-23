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
        Schema::table('organization_nodes', function (Blueprint $table) {
            $table->json('members')->nullable()->after('name');
            $table->string('section')->nullable()->after('members');
            $table->integer('order_index')->default(0)->after('section');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_nodes', function (Blueprint $table) {
            $table->dropColumn(['members', 'section', 'order_index']);
        });
    }
};
