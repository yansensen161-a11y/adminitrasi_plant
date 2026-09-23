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
        Schema::create('unit_gate_passes', function (Blueprint $table) {
            $table->id();
            $table->string('gatepass_no')->unique();
            $table->uuid('unit_id')->nullable()->index();
            $table->string('code_unit');
            $table->string('type_unit')->nullable();
            $table->string('model')->nullable();
            $table->string('no_police')->nullable();
            $table->string('driver_name');
            $table->string('destination');
            $table->string('purpose');
            $table->dateTime('exit_time');
            $table->dateTime('expected_return_time')->nullable();
            $table->dateTime('actual_return_time')->nullable();
            $table->string('status')->default('ACTIVE'); // ACTIVE, RETURNED, CANCELLED
            $table->string('approved_by')->nullable();
            $table->string('security_checkpoint')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->foreign('unit_id')->references('id')->on('units')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_gate_passes');
    }
};
