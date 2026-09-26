<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('part_order_lifetimes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('unit_code', 50)->index();
            $table->string('part_number', 100)->index();
            $table->string('part_name')->nullable();
            $table->string('no_order', 100)->index();
            $table->foreignUuid('maintenance_order_id')->nullable()->constrained('maintenance_orders')->nullOnDelete();
            $table->foreignUuid('maintenance_order_part_id')->nullable()->constrained('maintenance_order_parts')->nullOnDelete();
            $table->integer('qty')->default(1);
            $table->date('order_date')->nullable();
            $table->date('eta')->nullable();
            $table->date('received_date')->nullable();
            $table->date('installed_date')->nullable();
            $table->decimal('installed_hm', 10, 1)->nullable();
            $table->date('removed_date')->nullable();
            $table->decimal('removed_hm', 10, 1)->nullable();
            $table->decimal('expected_lifetime', 10, 1)->default(5000.0);
            $table->decimal('actual_lifetime', 10, 1)->nullable();
            $table->text('failure_reason')->nullable();
            $table->string('status', 50)->default('REQUEST')->index();
            $table->foreignUuid('replacement_order_id')->nullable()->constrained('part_order_lifetimes')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index(['unit_id', 'part_number']);
            $table->index(['unit_code', 'part_number', 'no_order']);
        });

        // Backfill from existing maintenance_order_parts & maintenance_orders
        $orders = DB::table('maintenance_orders')
            ->leftJoin('units', 'maintenance_orders.unit_id', '=', 'units.id')
            ->select(
                'maintenance_orders.id as order_id',
                'maintenance_orders.unit_id',
                'maintenance_orders.no_order',
                'maintenance_orders.tanggal',
                'maintenance_orders.hm',
                'maintenance_orders.status as order_status',
                'units.code_unit'
            )
            ->get()
            ->keyBy('order_id');

        $parts = DB::table('maintenance_order_parts')->get();

        $rowsToInsert = [];
        $now = now()->toDateTimeString();

        foreach ($parts as $part) {
            $partNumber = trim((string) ($part->part_number ?? ''));
            if (empty($partNumber) || $partNumber === '-') {
                continue;
            }

            $order = $orders->get($part->maintenance_order_id);
            $unitCode = $order?->code_unit ?? 'NON-UNIT';
            $noOrder = $order?->no_order ?? 'WO-UNKNOWN';

            // Map order status to part order status
            $status = 'REQUEST';
            $orderStatusUpper = strtoupper(trim((string) ($order?->order_status ?? '')));
            if ($orderStatusUpper === 'CLOSED') {
                $status = 'INSTALLED';
            } elseif (in_array($orderStatusUpper, ['IN PROGRESS', 'PROGRES', 'OPEN'])) {
                $status = ! empty($part->po) ? 'ORDERED' : (! empty($part->pr) ? 'PR CREATED' : 'REQUEST');
            } elseif ($orderStatusUpper === 'CANCEL' || $orderStatusUpper === 'CANCELLED') {
                $status = 'CANCELLED';
            }

            $eta = null;
            if (! empty($part->due_date_part) && $part->due_date_part !== '-' && $part->due_date_part !== '1970-01-01') {
                $eta = $part->due_date_part;
            }

            $installedHm = null;
            $installedDate = null;
            if ($status === 'INSTALLED' && $order?->hm) {
                $installedHm = (float) $order->hm;
                $installedDate = $order->tanggal;
            }

            $rowsToInsert[] = [
                'id' => (string) Str::uuid(),
                'unit_id' => $order?->unit_id,
                'unit_code' => $unitCode,
                'part_number' => strtoupper($partNumber),
                'part_name' => $part->department ?: ($part->component_name ?: $part->component),
                'no_order' => $noOrder,
                'maintenance_order_id' => $part->maintenance_order_id,
                'maintenance_order_part_id' => $part->id,
                'qty' => $part->qty ?: 1,
                'order_date' => $order?->tanggal,
                'eta' => $eta,
                'received_date' => $status === 'INSTALLED' ? $order?->tanggal : null,
                'installed_date' => $installedDate,
                'installed_hm' => $installedHm,
                'removed_date' => null,
                'removed_hm' => null,
                'expected_lifetime' => (float) ($part->life_time ?: 5000.0),
                'actual_lifetime' => null,
                'failure_reason' => null,
                'status' => $status,
                'replacement_order_id' => null,
                'remarks' => $part->pr ? 'PR: '.$part->pr.($part->po ? ' | PO: '.$part->po : '') : null,
                'created_at' => $part->created_at ?: $now,
                'updated_at' => $part->updated_at ?: $now,
            ];

            if (count($rowsToInsert) >= 200) {
                DB::table('part_order_lifetimes')->insert($rowsToInsert);
                $rowsToInsert = [];
            }
        }

        if (! empty($rowsToInsert)) {
            DB::table('part_order_lifetimes')->insert($rowsToInsert);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part_order_lifetimes');
    }
};
