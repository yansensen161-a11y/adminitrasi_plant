<?php

namespace App\Services;

use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class WorkOrderService
{
    public const TIPE_WO_OPTIONS = [
        'PM - PREVENTIVE MAINTENANCE',
        'CM - CORRECTIVE MAINTENANCE',
        'OVH - OVERHAUL',
        'REPL - COMPONENT REPLACEMENT',
        'UC - UNDERCARRIAGE MAINTENANCE',
        'TYRE - TYRE REPLACEMENT',
        'SVC - SERVICE MAINTENANCE',
    ];

    public const STATUS_WO_OPTIONS = [
        'PLANNING - PERENCANAAN PEKERJAAN',
        'IN PROGRESS - SEDANG DIKERJAKAN',
        'COMPLETED - PEKERJAAN SELESAI',
    ];

    public const DOWN_STATUS_OPTIONS = [
        'B0 - ON PROGRESS',
        'B1 - WAITING PARTS',
        'B2 - WAITING SARANA',
        'B3 - WAITING TOOLS',
        'B4 - WAITING MAN POWER',
        'B5 - OUTSIDE / DEALER',
        'B6 - PRODUCTION / ABUSE',
        'B7 - WAITING DECISION PLANT',
        'B8 - WAITING DECISION HO',
        'B9 - WAITING ACCESS',
        'B10 - WAITING RAIN / SLIPPERY CONDITION',
    ];

    public const COMPONENT_GROUPS = [
        'AC SYSTEM', 'ACCESSORIES', 'ACCIDENT', 'AIR SYSTEM', 'ATTACHMENT', 'AUTOLUBE',
        'BATTERY', 'BLADE', 'BRAKE SYSTEM', 'BUCKET', 'CABIN', 'CLUTCH', 'COOLING SYSTEM',
        'DAMPER', 'DIFFERENTIAL', 'ELECTRIC SYSTEM', 'ENGINE', 'FINAL DRIVE',
        'FRAME/BODY/GUARD/CHASSIS', 'FRONT AXLE', 'FUEL SYSTEM', 'GET', 'GREASING', 'HOSES',
        'HYDRAULIC SYSTEM', 'INTAKE & EXHAUST SYSTEM', 'LEVEL OIL/COOLANT', 'MAINTENANCE/SERVICE',
        'PROPELLER SHAFT', 'PTO', 'RADIATOR', 'RADIO', 'REAR AXLE', 'STEERING SYSTEM', 'SUSPENSION',
        'SWING', 'TAIL GATE', 'TRANSMISSION', 'TYRE', 'UNDERCARRIAGE', 'VESSEL', 'WASHING',
        'WATER CANON/SPRAYER', 'WHEEL & HUB',
    ];

    /**
     * Normalize raw string to one of the 7 official Tipe Work Order options.
     */
    public static function normalizeTipeWo(?string $value): string
    {
        $val = strtoupper(trim((string) $value));
        if (empty($val)) {
            return 'CM - CORRECTIVE MAINTENANCE';
        }

        if (str_starts_with($val, 'PM') || str_contains($val, 'PREVENTIVE')) {
            return 'PM - PREVENTIVE MAINTENANCE';
        }
        if (str_starts_with($val, 'OVH') || str_contains($val, 'OVERHAUL')) {
            return 'OVH - OVERHAUL';
        }
        if (str_starts_with($val, 'TYRE') || str_contains($val, 'TYRE') || str_contains($val, 'BAN')) {
            return 'TYRE - TYRE REPLACEMENT';
        }
        if (str_starts_with($val, 'REPL') || str_contains($val, 'REPLACEMENT') || str_contains($val, 'GANTI KOMPONEN')) {
            return 'REPL - COMPONENT REPLACEMENT';
        }
        if (str_starts_with($val, 'UC') || str_contains($val, 'UNDERCARRIAGE')) {
            return 'UC - UNDERCARRIAGE MAINTENANCE';
        }
        if (str_starts_with($val, 'SVC') || str_contains($val, 'SERVICE')) {
            return 'SVC - SERVICE MAINTENANCE';
        }
        if (str_starts_with($val, 'CM') || str_contains($val, 'CORRECTIVE') || $val === 'BREAKDOWN' || str_starts_with($val, 'BD')) {
            return 'CM - CORRECTIVE MAINTENANCE';
        }

        return 'CM - CORRECTIVE MAINTENANCE';
    }

    /**
     * Normalize raw string to one of the 3 official Status WO options.
     */
    public static function normalizeStatusWo(?string $value, bool $hasFinishDate = false): string
    {
        $val = strtoupper(trim((string) $value));
        if (empty($val)) {
            return $hasFinishDate ? 'COMPLETED - PEKERJAAN SELESAI' : 'PLANNING - PERENCANAAN PEKERJAAN';
        }

        if (str_contains($val, 'COMPLETED') || str_contains($val, 'CLOSED') || str_contains($val, 'SELESAI') || str_contains($val, 'RFU')) {
            return 'COMPLETED - PEKERJAAN SELESAI';
        }
        if (str_contains($val, 'PROGRESS') || str_contains($val, 'PROCESS') || str_contains($val, 'DIKERJAKAN') || str_contains($val, 'ON GOING')) {
            return 'IN PROGRESS - SEDANG DIKERJAKAN';
        }
        if (str_contains($val, 'PLAN') || str_contains($val, 'DRAFT') || str_contains($val, 'OPEN') || str_contains($val, 'PERENCANAAN')) {
            return 'PLANNING - PERENCANAAN PEKERJAAN';
        }

        return $hasFinishDate ? 'COMPLETED - PEKERJAAN SELESAI' : 'PLANNING - PERENCANAAN PEKERJAAN';
    }

    /**
     * Normalize raw string to one of the 11 official DOWN STATUS options.
     */
    public static function normalizeDownStatus(?string $value): string
    {
        $val = strtoupper(trim((string) $value));
        if (empty($val)) {
            return 'B0 - ON PROGRESS';
        }

        // Check B10 before B1
        if (str_contains($val, 'B10') || str_contains($val, 'RAIN') || str_contains($val, 'SLIPPERY') || str_contains($val, 'HUJAN') || str_contains($val, 'LICIN')) {
            return 'B10 - WAITING RAIN / SLIPPERY CONDITION';
        }
        if (str_contains($val, 'B9') || str_contains($val, 'ACCESS') || str_contains($val, 'AKSES')) {
            return 'B9 - WAITING ACCESS';
        }
        if (str_contains($val, 'B8') || str_contains($val, 'DECISION HO') || str_contains($val, 'HO')) {
            return 'B8 - WAITING DECISION HO';
        }
        if (str_contains($val, 'B7') || str_contains($val, 'DECISION PLANT') || str_contains($val, 'KEPUTUSAN PLANT')) {
            return 'B7 - WAITING DECISION PLANT';
        }
        if (str_contains($val, 'B6') || str_contains($val, 'PRODUCTION') || str_contains($val, 'ABUSE') || str_contains($val, 'PRODUKSI')) {
            return 'B6 - PRODUCTION / ABUSE';
        }
        if (str_contains($val, 'B5') || str_contains($val, 'OUTSIDE') || str_contains($val, 'DEALER')) {
            return 'B5 - OUTSIDE / DEALER';
        }
        if (str_contains($val, 'B4') || str_contains($val, 'MAN POWER') || str_contains($val, 'MANPOWER') || str_contains($val, 'MEKANIK')) {
            return 'B4 - WAITING MAN POWER';
        }
        if (str_contains($val, 'B3') || str_contains($val, 'TOOLS') || str_contains($val, 'ALAT')) {
            return 'B3 - WAITING TOOLS';
        }
        if (str_contains($val, 'B2') || str_contains($val, 'SARANA')) {
            return 'B2 - WAITING SARANA';
        }
        if (str_contains($val, 'B1') || str_contains($val, 'PARTS') || str_contains($val, 'PART') || str_contains($val, 'SUKU CADANG')) {
            return 'B1 - WAITING PARTS';
        }
        if (str_contains($val, 'B0') || str_contains($val, 'ON PROGRESS') || str_contains($val, 'SEDANG')) {
            return 'B0 - ON PROGRESS';
        }

        return 'B0 - ON PROGRESS';
    }

    /**
     * Normalize raw string to standard Component Group.
     */
    public static function normalizeComponentGroup(?string $value): string
    {
        $val = strtoupper(trim((string) $value));
        if (empty($val)) {
            return 'ENGINE';
        }

        // Exact match
        foreach (self::COMPONENT_GROUPS as $group) {
            if ($val === $group) {
                return $group;
            }
        }

        // Indonesian synonyms & common abbreviations
        if (str_contains($val, 'MESIN')) {
            return 'ENGINE';
        }
        if (str_contains($val, 'TRANSMISI')) {
            return 'TRANSMISSION';
        }
        if (str_contains($val, 'BAN')) {
            return 'TYRE';
        }
        if (str_contains($val, 'REM')) {
            return 'BRAKE SYSTEM';
        }
        if (str_contains($val, 'LISTRIK') || str_contains($val, 'ELEKTRIK') || str_contains($val, 'ELECTRICAL')) {
            return 'ELECTRIC SYSTEM';
        }
        if (str_contains($val, 'HIDROLIK') || str_contains($val, 'HYDRAULIC')) {
            return 'HYDRAULIC SYSTEM';
        }
        if (str_contains($val, 'PENDINGIN') || str_contains($val, 'COOLING')) {
            return 'COOLING SYSTEM';
        }
        if (str_contains($val, 'SUSPENSI')) {
            return 'SUSPENSION';
        }

        // Partial match
        foreach (self::COMPONENT_GROUPS as $group) {
            if (str_contains($val, $group) || str_contains($group, $val)) {
                return $group;
            }
        }

        return $val;
    }

    /**
     * Map Work Order type string to standardized number prefix.
     */
    public static function getPrefixForType(?string $tipeWo): string
    {
        $upper = strtoupper(trim((string) $tipeWo));

        if (str_starts_with($upper, 'PM') || str_contains($upper, 'PREVENTIVE') || $upper === 'SCHEDULE') {
            return 'PLT/WO/PM/';
        }
        if (str_starts_with($upper, 'SVC') || str_contains($upper, 'SERVICE')) {
            return 'PLT/WO/SVC/';
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
        if (str_starts_with($upper, 'TYRE') || str_contains($upper, 'TYRE')) {
            return 'PLT/WO/TYRE/';
        }
        if (str_starts_with($upper, 'REPL') || str_contains($upper, 'REPLACEMENT')) {
            return 'PLT/WO/REPL/';
        }
        if (str_starts_with($upper, 'UC') || str_contains($upper, 'UNDERCARRIAGE')) {
            return 'PLT/WO/UC/';
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
            'OVH - OVERHAUL' => self::generateWoNumber('OVH'),
            'REPL - COMPONENT REPLACEMENT' => self::generateWoNumber('REPL'),
            'UC - UNDERCARRIAGE MAINTENANCE' => self::generateWoNumber('UC'),
            'TYRE - TYRE REPLACEMENT' => self::generateWoNumber('TYRE'),
            'SVC - SERVICE MAINTENANCE' => self::generateWoNumber('SVC'),
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
            $rawType = $data['status_wo'] ?? ($data['tipe_wo'] ?? 'CM');
            $normalizedTipeWo = self::normalizeTipeWo($rawType);

            // Auto generate number if not provided
            if (empty($data['no_wo'])) {
                $data['no_wo'] = self::generateWoNumber($normalizedTipeWo);
            }

            $isCompleted = ! empty($data['waktu_rfu']) || ! empty($data['close_date']);
            $isScheduleType = in_array($normalizedTipeWo, [
                'PM - PREVENTIVE MAINTENANCE',
                'OVH - OVERHAUL',
                'SVC - SERVICE MAINTENANCE',
            ]);

            // Standardize defaults
            $data['status_wo'] = $normalizedTipeWo;
            $data['status_pengerjaan'] = self::normalizeStatusWo($data['status_pengerjaan'] ?? null, $isCompleted);
            $data['tipe_wo'] = ! empty($data['tipe_wo']) ? strtoupper($data['tipe_wo']) : ($isScheduleType ? 'SCHEDULE' : 'BREAKDOWN');
            $data['priority'] = $data['priority'] ?? 'MEDIUM';
            $data['request_date'] = $data['request_date'] ?? Carbon::now();
            $data['site'] = ! empty($data['site']) ? $data['site'] : '-';

            if (empty($data['downtime_code'])) {
                $data['downtime_code'] = $isScheduleType ? 'Schedule' : 'Unschedule';
            }

            if (! empty($data['component_group']) && empty($data['component'])) {
                $data['component'] = $data['component_group'];
            }
            if (! empty($data['component'])) {
                $data['component'] = self::normalizeComponentGroup($data['component']);
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
