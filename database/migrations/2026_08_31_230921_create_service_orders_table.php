<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('no_so')->unique();
            $table->date('tanggal');
            $table->foreignUuid('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('lokasi')->nullable();
            $table->string('department')->nullable();
            $table->enum('priority', ['LOW', 'MEDIUM', 'HIGH'])->default('LOW');
            $table->enum('status', ['OPEN', 'PROCESS', 'CLOSED', 'CANCEL'])->default('OPEN');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_orders');
    }
};
