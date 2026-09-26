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
        Schema::create('navigation_menus', function (Blueprint $table) {
            $table->id();
            $table->string('portal_id', 50)->default('plant-fleet')->index();
            $table->string('section_label', 100)->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('navigation_menus')->onDelete('cascade');
            $table->string('name', 150);
            $table->string('href', 255)->default('#');
            $table->string('icon_key', 50)->default('logs');
            $table->string('permission', 100)->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('badge', 50)->nullable();
            $table->string('target', 20)->default('_self');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('navigation_menus');
    }
};
