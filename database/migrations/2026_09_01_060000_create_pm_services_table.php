<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pm_services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama_pm');
            $table->integer('interval_hm');
            $table->string('type_service')->default('Periodical');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pm_services');
    }
};
