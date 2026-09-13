<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tool_gate_passes', function (Blueprint $table) {
            $table->id();
            $table->string('pass_number')->unique(); // e.g. GP-20260913-001
            $table->foreignId('tool_id')->constrained('tools')->cascadeOnDelete();
            $table->enum('type', ['OUT', 'IN']); // Keluar atau Masuk
            $table->date('date');
            $table->string('pic'); // Penanggung jawab
            $table->string('destination')->nullable(); // Tujuan
            $table->string('reason'); // Alasan keluar/masuk
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'])->default('PENDING');
            $table->string('approved_by')->nullable();
            $table->date('return_date')->nullable(); // Tanggal kembali (untuk OUT)
            $table->boolean('is_returned')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tool_gate_passes');
    }
};
