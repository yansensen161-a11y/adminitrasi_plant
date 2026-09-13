<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tool_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_code')->unique(); // e.g. BRW-20260913-001
            $table->foreignId('tool_id')->constrained('tools')->cascadeOnDelete();
            $table->string('mechanic_name');
            $table->string('mechanic_badge')->nullable(); // No. ID karyawan
            $table->string('work_order_no')->nullable();
            $table->date('borrow_date');
            $table->date('expected_return_date')->nullable();
            $table->date('return_date')->nullable();
            $table->string('returned_condition')->nullable(); // GOOD, DAMAGE
            $table->enum('status', ['BORROWED', 'RETURNED', 'OVERDUE', 'LOST'])->default('BORROWED');
            $table->text('purpose')->nullable(); // Tujuan peminjaman
            $table->text('notes')->nullable();
            $table->string('approved_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tool_transactions');
    }
};
