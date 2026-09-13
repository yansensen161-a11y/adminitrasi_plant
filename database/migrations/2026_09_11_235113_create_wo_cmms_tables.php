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
        Schema::create('wo_breakdowns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->dateTime('trouble_date')->nullable();
            $table->dateTime('breakdown_start')->nullable();
            $table->dateTime('breakdown_stop')->nullable();
            $table->decimal('downtime_hours', 8, 2)->nullable();
            $table->decimal('downtime_minutes', 8, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('wo_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->string('part_number')->nullable();
            $table->string('description')->nullable();
            $table->decimal('qty_request', 8, 2)->default(0);
            $table->decimal('qty_used', 8, 2)->default(0);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->string('supplier')->nullable();
            $table->string('status')->default('REQUESTED'); // REQUESTED, APPROVED, ORDERED, RECEIVED, USED, CANCELLED
            $table->timestamps();
        });

        Schema::create('wo_manpowers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->string('mechanic')->nullable(); // Can be name or user_id
            $table->dateTime('start')->nullable();
            $table->dateTime('finish')->nullable();
            $table->decimal('man_hours', 8, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('wo_vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->string('vendor_name')->nullable();
            $table->date('date_send')->nullable();
            $table->string('jwo')->nullable();
            $table->text('vendor_feedback')->nullable();
            $table->date('estimated_completion')->nullable();
            $table->date('actual_completion')->nullable();
            $table->decimal('vendor_cost', 15, 2)->default(0);
            $table->string('warranty')->nullable();
            $table->text('remark')->nullable();
            $table->timestamps();
        });

        Schema::create('wo_warranties', function (Blueprint $table) {
            $table->id();
            $table->string('wc_number')->unique();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->text('problem')->nullable();
            $table->dateTime('failure_date')->nullable();
            $table->text('corrective_action')->nullable();
            $table->string('vendor')->nullable();
            $table->string('status')->default('OPEN');
            $table->timestamps();
        });

        Schema::create('wo_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->onDelete('cascade');
            $table->string('status_from')->nullable();
            $table->string('status_to')->nullable();
            $table->string('changed_by')->nullable(); // user name or id
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wo_status_histories');
        Schema::dropIfExists('wo_warranties');
        Schema::dropIfExists('wo_vendors');
        Schema::dropIfExists('wo_manpowers');
        Schema::dropIfExists('wo_parts');
        Schema::dropIfExists('wo_breakdowns');
    }
};
