<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Repair inverted ETA dates in maintenance_order_parts
        $etaSwapMap = [
            '2026-02-09' => '2026-09-02',
            '2026-04-09' => '2026-09-04',
            '2026-05-09' => '2026-09-05',
            '2026-06-09' => '2026-09-06',
            '2026-07-09' => '2026-09-07',
            '2026-11-09' => '2026-09-11',
            '2026-12-09' => '2026-09-12',
            '1970-01-01' => '2026-09-21',
        ];

        foreach ($etaSwapMap as $oldEta => $newEta) {
            DB::table('maintenance_order_parts')
                ->where('due_date_part', $oldEta)
                ->update(['due_date_part' => $newEta]);
        }

        // 2. Repair inverted actual_end in maintenance_orders
        $endSwapMap = [
            '2026-07-09 00:00:00' => '2026-09-07 00:00:00',
            '2026-12-09 00:00:00' => '2026-09-12 00:00:00',
        ];

        foreach ($endSwapMap as $oldEnd => $newEnd) {
            DB::table('maintenance_orders')
                ->where('actual_end', $oldEnd)
                ->update(['actual_end' => $newEnd]);
        }

        // 3. Repair inverted tanggal in maintenance_orders for imported September orders
        $tanggalSwapMap = [
            '2026-01-09' => '2026-09-01',
            '2026-02-09' => '2026-09-02',
            '2026-03-09' => '2026-09-03',
            '2026-04-09' => '2026-09-04',
            '2026-05-09' => '2026-09-05',
            '2026-07-09' => '2026-09-07',
            '2026-08-09' => '2026-09-08',
        ];

        foreach ($tanggalSwapMap as $oldTgl => $newTgl) {
            DB::table('maintenance_orders')
                ->where('tanggal', $oldTgl)
                ->where('created_at', 'like', '2026-09-08%')
                ->update(['tanggal' => $newTgl]);
        }

        // 4. Remove redundant empty parts that were duplicated by subsequent imports with filled PR/PO/ETA
        $orders = DB::table('maintenance_orders')->select('id')->get();
        foreach ($orders as $order) {
            $parts = DB::table('maintenance_order_parts')
                ->where('maintenance_order_id', $order->id)
                ->get();

            $filledParts = $parts->filter(function ($p) {
                return (! empty($p->pr) && $p->pr !== '-') || (! empty($p->po) && $p->po !== '-') || (! empty($p->due_date_part) && $p->due_date_part !== '-');
            });

            if ($filledParts->isNotEmpty()) {
                $emptyParts = $parts->filter(function ($p) {
                    return (empty($p->pr) || $p->pr === '-') && (empty($p->po) || $p->po === '-') && (empty($p->due_date_part) || $p->due_date_part === '-');
                });

                foreach ($emptyParts as $ep) {
                    if (! empty($ep->part_number) && $ep->part_number !== '-') {
                        $hasDuplicateFilled = $filledParts->contains(function ($fp) use ($ep) {
                            return $fp->part_number === $ep->part_number;
                        });
                        if ($hasDuplicateFilled) {
                            DB::table('maintenance_order_parts')->where('id', $ep->id)->delete();
                        }
                    }
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // One-way data fix
    }
};
