<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('failure_analysis_photos', function (Blueprint $table) {
            $table->id();
            $table->uuid('failure_analysis_id');
            $table->string('komponen_bagian');
            $table->text('observasi');
            $table->string('foto_path');
            $table->timestamps();

            $table->foreign('failure_analysis_id')->references('id')->on('failure_analyses')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failure_analysis_photos');
    }
};
