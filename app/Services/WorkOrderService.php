<?php

namespace App\Services;

use App\Models\WorkOrder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WorkOrderService
{
    /**
     * Generate a unique Work Order number safely with locking.
     * Format: WO-YYYYMMDD-0001
     *
     * @param string $dateStr Date string in 'Y-m-d', defaults to today
     * @return string
     */
    public static function generateWoNumber($dateStr = null)
    {
        $date = $dateStr ? Carbon::parse($dateStr) : Carbon::now();
        $prefix = 'WO-' . $date->format('Ymd') . '-';

        return DB::transaction(function () use ($prefix) {
            // Lock the highest work order number for the given prefix
            $lastWo = WorkOrder::where('no_wo', 'like', $prefix . '%')
                               ->lockForUpdate()
                               ->orderBy('no_wo', 'desc')
                               ->first();

            if (!$lastWo) {
                return $prefix . '0001';
            }

            // Extract the sequence number
            $lastSequence = (int) substr($lastWo->no_wo, -4);
            $nextSequence = $lastSequence + 1;

            return $prefix . str_pad($nextSequence, 4, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Create a standard CMMS Work Order
     *
     * @param array $data Basic WO master data
     * @param array $breakdownData Optional breakdown specifics
     * @return WorkOrder
     */
    public static function createWorkOrder(array $data, array $breakdownData = [])
    {
        return DB::transaction(function () use ($data, $breakdownData) {
            // Auto generate number if not provided
            if (empty($data['no_wo'])) {
                $data['no_wo'] = self::generateWoNumber();
            }

            // Standardize defaults
            $data['status_wo'] = $data['status_wo'] ?? 'OPEN';
            $data['priority'] = $data['priority'] ?? 'MEDIUM';
            $data['request_date'] = $data['request_date'] ?? Carbon::now();

            // Create WO Master
            $workOrder = WorkOrder::create($data);

            // Create Breakdown sub-transaction if applicable
            if (!empty($breakdownData)) {
                $workOrder->breakdownDetails()->create($breakdownData);
            }

            return $workOrder;
        });
    }
}
