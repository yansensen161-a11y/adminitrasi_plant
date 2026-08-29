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
        Schema::create('units', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedInteger('no_urut')->nullable()->index(); // No Urut (dari Excel)
            $table->string('code_unit')->unique()->index(); // CODE UNIT
            $table->decimal('hm', 10, 1)->default(0); // HM
            $table->string('model')->nullable()->index(); // Model
            $table->string('sn_chassis')->nullable()->index(); // S/N CHASSIS
            $table->string('engine_model')->nullable(); // ENGINE MODEL
            $table->string('sn_engine')->nullable(); // S/N ENGINE
            $table->string('engine_make')->nullable(); // ENGINE MAKE
            $table->string('equipment_capacity')->nullable(); // EQUIPMENT CAPACITY
            $table->string('no_police')->nullable(); // NO.POLICE
            $table->string('attachments')->nullable(); // ATTACHMENTS
            $table->string('hp')->nullable(); // HP
            $table->string('kw')->nullable(); // KW
            $table->unsignedSmallInteger('tahun_perakitan')->nullable(); // TAHUN PERAKITAN
            $table->string('received_date')->nullable(); // RECEIVED DATE
            $table->string('received_from')->nullable(); // RECEIVED FROM
            $table->string('location')->nullable()->index(); // LOCATION
            $table->string('before_from')->nullable(); // BEFORE FROM
            $table->text('remarks')->nullable(); // Remarks
            $table->string('status')->default('Operational')->index(); // Status
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
