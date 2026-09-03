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
        Schema::create('breakdown_tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('breakdown_id')->nullable();
            $table->string('task_no')->nullable();
            $table->text('problem')->nullable();
            $table->text('activity')->nullable();
            $table->string('status')->nullable();
            $table->text('remarks')->nullable();
            $table->string('mol')->nullable();
            $table->string('pr')->nullable();
            $table->string('po')->nullable();
            $table->string('eta')->nullable();
            $table->timestamps();

            $table->foreign('breakdown_id')->references('id')->on('breakdowns')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('breakdown_tasks');
    }
};
