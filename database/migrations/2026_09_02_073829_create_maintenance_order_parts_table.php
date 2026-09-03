<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_order_parts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('maintenance_order_id')->constrained('maintenance_orders')->cascadeOnDelete();
            $table->string('department')->nullable(); // Used for Description
            $table->string('component')->nullable();
            $table->string('part_number')->nullable();
            $table->integer('qty')->nullable();
            $table->date('due_date_part')->nullable();
            $table->string('pr')->nullable();
            $table->string('po')->nullable();
            $table->string('image')->nullable();
            $table->foreignUuid('swap_to_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->timestamps();
        });

        // Data migration logic
        $orders = DB::table('maintenance_orders')->get();
        $groupedOrders = $orders->groupBy('no_order');

        foreach ($groupedOrders as $noOrder => $group) {
            // Take the first order as the header
            $header = $group->first();

            // Insert parts for all items in the group, pointing to this single header id
            foreach ($group as $item) {
                DB::table('maintenance_order_parts')->insert([
                    'id' => (string) Str::uuid(),
                    'maintenance_order_id' => $header->id,
                    'department' => $item->department,
                    'component' => $item->component,
                    'part_number' => $item->part_number,
                    'qty' => $item->qty,
                    'due_date_part' => $item->due_date_part,
                    'pr' => $item->pr,
                    'po' => $item->po,
                    'image' => $item->image,
                    'swap_to_unit_id' => $item->swap_to_unit_id,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ]);
            }

            // Remove duplicate headers (all but the first one)
            if ($group->count() > 1) {
                $duplicates = $group->slice(1)->pluck('id');
                DB::table('maintenance_orders')->whereIn('id', $duplicates)->delete();
            }
        }

        // Drop part columns from maintenance_orders
        Schema::table('maintenance_orders', function (Blueprint $table) {
            $table->dropForeign(['swap_to_unit_id']);
            $table->dropColumn([
                'department',
                'component',
                'part_number',
                'qty',
                'due_date_part',
                'pr',
                'po',
                'image',
                'swap_to_unit_id',
            ]);
        });
    }

    public function down(): void
    {
        // Re-add columns to maintenance_orders
        Schema::table('maintenance_orders', function (Blueprint $table) {
            $table->string('department')->nullable();
            $table->string('component')->nullable();
            $table->string('part_number')->nullable();
            $table->integer('qty')->nullable();
            $table->date('due_date_part')->nullable();
            $table->string('pr')->nullable();
            $table->string('po')->nullable();
            $table->string('image')->nullable();
            $table->foreignUuid('swap_to_unit_id')->nullable()->constrained('units')->nullOnDelete();
        });

        // We can't perfectly reconstruct the old multi-header structure, but we can move data back
        $parts = DB::table('maintenance_order_parts')->get();
        foreach ($parts as $part) {
            DB::table('maintenance_orders')->where('id', $part->maintenance_order_id)->update([
                'department' => $part->department,
                'component' => $part->component,
                'part_number' => $part->part_number,
                'qty' => $part->qty,
                'due_date_part' => $part->due_date_part,
                'pr' => $part->pr,
                'po' => $part->po,
                'image' => $part->image,
                'swap_to_unit_id' => $part->swap_to_unit_id,
            ]);
            // For multiple parts, it just overwrites. Perfect rollback would require re-cloning headers.
        }

        Schema::dropIfExists('maintenance_order_parts');
    }
};
