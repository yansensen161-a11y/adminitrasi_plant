<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tool_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // e.g. PO-TOOL-20260913-001
            $table->string('tool_name');
            $table->string('brand')->nullable();
            $table->string('specifications')->nullable();
            $table->integer('qty_requested')->default(1);
            $table->integer('qty_received')->default(0);
            $table->string('unit')->nullable(); // unit satuan: pcs, set, unit
            $table->decimal('estimated_price', 15, 2)->nullable();
            $table->string('pr_number')->nullable(); // Purchase Request
            $table->string('po_number')->nullable(); // Purchase Order
            $table->string('vendor')->nullable();
            $table->enum('status', ['DRAFT', 'REQUESTED', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED'])->default('DRAFT');
            $table->date('request_date')->nullable();
            $table->date('eta_date')->nullable();
            $table->date('received_date')->nullable();
            $table->string('requested_by');
            $table->string('approved_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tool_orders');
    }
};
