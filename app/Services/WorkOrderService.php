<?php

namespace App\Services;

use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class WorkOrderService
{
    /**
     * Map Work Order type string to standardized number prefix.
     */
    public static function getPrefixForType(?string $tipeWo): string
    {
        $upper = strtoupper(trim((string) $tipeWo));

        if (str_starts_with($upper, 'PM') || str_contains($upper, 'PREVENTIVE') || $upper === 'SCHEDULE') {
            return 'PLT/WO/PM/';
        }
        if (str_starts_with($upper, 'CM') || str_contains($upper, 'CORRECTIVE') || $upper === 'BREAKDOWN' || str_starts_with($upper, 'BD')) {
            return 'PLT/WO/CM/';
        }
        if (str_starts_with($upper, 'INSP') || str_starts_with($upper, 'INS') || str_contains($upper, 'INSPECTION')) {
            return 'PLT/WO/INSP/';
        }
        if (str_starts_with($upper, 'OVH') || str_contains($upper, 'OVERHAUL')) {
            return 'PLT/WO/OVH/';
        }
        if (str_starts_with($upper, 'REPL') || str_contains($upper, 'REPLACEMENT')) {
            return 'PLT/WO/REPL/';
        }
        if (str_starts_with($upper, 'UC') || str_contains($upper, 'UNDERCARRIAGE')) {
            return 'PLT/WO/UC/';
        }
        if (str_starts_with($upper, 'TYRE') || str_contains($upper, 'TYRE')) {
            return 'PLT/WO/TYRE/';
        }

        return 'PLT/WO/CM/';
    }

    /**
     * Generate a unique Work Order number safely with locking based on WO Type.
     * Format:
     * - PM:   PLT/WO/PM/001
     * - CM:   PLT/WO/CM/001
     * - INS:  PLT/WO/INSP/001
     * - OVH:  PLT/WO/OVH/001
     * - REPL: PLT/WO/REPL/001
     * - UC:   PLT/WO/UC/001
     * - TYRE: PLT/WO/TYRE/001
     *
     * @param  string  $tipeWo
     * @return string
     */
    public static function generateWoNumber($tipeWo = 'CM')
    {
        $prefix = self::getPrefixForType($tipeWo);

        return DB::transaction(function () use ($prefix) {
            $query = WorkOrder::where('no_wo', 'like', $prefix.'%');
            if ($prefix === 'PLT/WO/INSP/') {
                $query->orWhere('no_wo', 'like', 'PLT/WO/INS/%');
            }

            if (DB::getDriverName() === 'sqlite') {
                $lastWo = $query
                    ->lockForUpdate()
                    ->get()
                    ->sortByDesc(function ($item) {
                        $parts = explode('/', $item->no_wo);

                        return (int) end($parts);
                    })
                    ->first();
            } else {
                $lastWo = $query
                    ->lockForUpdate()
                    ->orderByRaw('CAST(SUBSTRING_INDEX(no_wo, "/", -1) AS UNSIGNED) DESC')
                    ->first();
            }

            if (! $lastWo) {
                return $prefix.'001';
            }

            // Extract the sequence number after the last slash
            $parts = explode('/', $lastWo->no_wo);
            $lastNum = (int) end($parts);
            $nextSequence = $lastNum + 1;

            return $prefix.str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Get suggested next Work Order numbers for all 7 supported types.
     *
     * @return array<string, string>
     */
    public static function getAllSuggestedNumbers(): array
    {
        return [
            'PM - PREVENTIVE MAINTENANCE' => self::generateWoNumber('PM'),
            'CM - CORRECTIVE MAINTENANCE' => self::generateWoNumber('CM'),
            'INS - INSPECTION' => self::generateWoNumber('INSP'),
            'OVH - OVERHAUL' => self::generateWoNumber('OVH'),
            'REPL - COMPONENT REPLACEMENT' => self::generateWoNumber('REPL'),
            'UC - UNDERCARRIAGE MAINTENANCE' => self::generateWoNumber('UC'),
            'TYRE - Tyre Management' => self::generateWoNumber('TYRE'),
        ];
    }

    /**
     * Create a standard CMMS Work Order
     *
     * @param  array  $data  Basic WO master data
     * @param  array  $breakdownData  Optional breakdown specifics
     * @return WorkOrder
     */
    public static function createWorkOrder(array $data, array $breakdownData = [])
    {
        return DB::transaction(function () use ($data, $breakdownData) {
            $effectiveType = $data['status_wo'] ?? ($data['tipe_wo'] ?? 'CM');

            // Auto generate number if not provided
            if (empty($data['no_wo'])) {
                $data['no_wo'] = self::generateWoNumber($effectiveType);
            }

            // Standardize defaults
            $data['status_wo'] = $data['status_wo'] ?? 'CM - CORRECTIVE MAINTENANCE';
            $data['status_pengerjaan'] = ! empty($data['status_pengerjaan']) ? strtoupper($data['status_pengerjaan']) : 'OPEN';
            $data['priority'] = $data['priority'] ?? 'MEDIUM';
            $data['request_date'] = $data['request_date'] ?? Carbon::now();
            $data['site'] = ! empty($data['site']) ? $data['site'] : '-';

            if (empty($data['downtime_code'])) {
                $upper = strtoupper((string) $effectiveType);
                $isSchedule = str_contains($upper, 'SCHEDULE') || str_contains($upper, 'PREVENTIVE') || str_contains($upper, 'PM') || str_contains($upper, 'INS') || str_contains($upper, 'OVH');
                $data['downtime_code'] = $isSchedule ? 'Schedule' : 'Unschedule';
            }

            // Create WO Master
            $workOrder = WorkOrder::create($data);

            // Create Breakdown sub-transaction if applicable
            if (! empty($breakdownData)) {
                $workOrder->breakdownDetails()->create($breakdownData);
            }

            return $workOrder;
        });
    }
}
