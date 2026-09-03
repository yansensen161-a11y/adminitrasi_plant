<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('part_canibals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('no_request')->unique();
            $table->date('tanggal');
            $table->foreignUuid('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('part_name');
            $table->foreignUuid('dari_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->integer('qty')->default(1);
            $table->enum('status', ['PENDING', 'PROCESS', 'APPROVED', 'USED', 'REJECTED'])->default('PENDING');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('part_canibals');
    }
};
