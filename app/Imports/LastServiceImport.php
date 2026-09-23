<?php

namespace App\Imports;

use App\Models\ServiceLog;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class LastServiceImport implements ToCollection, WithHeadingRow
{
    protected int $unitsUpdated = 0;

    protected int $totalRowsProcessed = 0;

    protected int $logsCreated = 0;

    public function getSummaryMessage(): string
    {
        return "Berhasil memproses {$this->totalRowsProcessed} baris data riwayat service. {$this->unitsUpdated} unit berhasil diperbarui dengan Last Service terbaru berdasarkan tanggal.";
    }

    public function getUnitsUpdated(): int
    {
        return $this->unitsUpdated;
    }

    public function getTotalRowsProcessed(): int
    {
        return $this->totalRowsProcessed;
    }

    public function collection(Collection $rows): void
    {
        // 1. Cache all units from DB for instant lookup without N+1 queries
        $allUnits = Unit::all();
        $unitMap = [];
        foreach ($allUnits as $unit) {
            $rawCode = strtoupper(trim((string) $unit->code_unit));
            $unitMap[$rawCode] = $unit;
            // Cleaned code: remove hyphens, spaces, dots, underscores
            $cleanCode = preg_replace('/[^A-Za-z0-9]/', '', $rawCode);
            if ($cleanCode !== '') {
                $unitMap[$cleanCode] = $unit;
            }
        }

        // 2. Read and group rows by unit
        $groupedByUnit = [];

        foreach ($rows as $row) {
            $this->totalRowsProcessed++;

            // Extract Unit Code
            $codeUnit = $this->extractValue($row, [
                'code_unit', 'unit', 'unit_code', 'no_unit', 'nomor_unit', 'cn',
                'equipment', 'alat', 'unit_id', 'code',
            ]);

            if ($codeUnit === null || trim((string) $codeUnit) === '') {
                continue;
            }

            $rawInputCode = strtoupper(trim((string) $codeUnit));
            $cleanInputCode = preg_replace('/[^A-Za-z0-9]/', '', $rawInputCode);

            $unit = $unitMap[$rawInputCode] ?? $unitMap[$cleanInputCode] ?? null;
            if (! $unit) {
                continue;
            }

            // Extract Service Date
            $rawDate = $this->extractValue($row, [
                'tanggal_service', 'tanggal', 'tgl_service', 'tgl', 'date', 'service_date',
                'actual_date', 'target_date', 'tanggal_ps', 'tgl_ps', 'date_service', 'waktu',
            ]);
            $date = $this->parseDate($rawDate);
            if (! $date) {
                // If row has no valid date, skip it because we cannot determine order
                continue;
            }

            // Extract HM
            $rawHm = $this->extractValue($row, [
                'hm_service', 'hm', 'meter', 'hour_meter', 'last_hm', 'actual_hm',
                'target_hm', 'hm_unit', 'service_hm',
            ]);
            $hm = $this->parseHm($rawHm);

            // Extract Service Type
            $rawType = $this->extractValue($row, [
                'tipe_service', 'service_type', 'type_service', 'ps', 'tipe', 'service', 'jenis_service',
            ]);
            $serviceType = $this->normalizeServiceType($rawType, $hm);

            $groupedByUnit[$unit->id]['unit'] = $unit;
            $groupedByUnit[$unit->id]['records'][] = [
                'date' => $date,
                'hm' => $hm,
                'service_type' => $serviceType,
            ];
        }

        if (empty($groupedByUnit)) {
            return;
        }

        // 3. Preload existing service logs for all matched units to avoid duplicates
        $unitIds = array_keys($groupedByUnit);
        $existingLogs = ServiceLog::whereIn('unit_id', $unitIds)
            ->get(['unit_id', 'actual_date', 'target_hm'])
            ->mapWithKeys(function ($item) {
                $dateStr = $item->actual_date ? Carbon::parse($item->actual_date)->format('Y-m-d') : '';

                return [$item->unit_id.'_'.$dateStr.'_'.(float) $item->target_hm => true];
            })
            ->toArray();

        $recordsToInsert = [];
        $now = now();

        // 4. For each unit, sort records by DATE descending (and HM descending)
        // The top record is the LATEST service by date!
        foreach ($groupedByUnit as $unitId => $data) {
            $records = $data['records'];

            // Sort: latest date first, then highest HM
            usort($records, function ($a, $b) {
                $timeA = $a['date']->timestamp;
                $timeB = $b['date']->timestamp;
                if ($timeA === $timeB) {
                    return $b['hm'] <=> $a['hm'];
                }

                return $timeB <=> $timeA;
            });

            $this->unitsUpdated++;

            // Deduplicate records in this file by (date, hm)
            $seenInBatch = [];
            // Reverse so older records are inserted first and the latest record is inserted last (highest ID)
            $chronological = array_reverse($records);

            foreach ($chronological as $rec) {
                $dateStr = $rec['date']->format('Y-m-d');
                $batchKey = $dateStr.'_'.$rec['hm'];
                if (isset($seenInBatch[$batchKey])) {
                    continue;
                }
                $seenInBatch[$batchKey] = true;

                $dbKey = $unitId.'_'.$dateStr.'_'.(float) $rec['hm'];
                if (isset($existingLogs[$dbKey])) {
                    // Record already exists in DB
                    continue;
                }

                $recordsToInsert[] = [
                    'unit_id' => $unitId,
                    'status' => 'completed',
                    'service_type' => $rec['service_type'],
                    'target_hm' => $rec['hm'],
                    'actual_hm' => $rec['hm'],
                    'target_date' => $dateStr,
                    'actual_date' => $dateStr,
                    'work_hours_per_day' => 22,
                    'maintenance_order_id' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                // Mark as seen in DB lookup to avoid duplicate within batch
                $existingLogs[$dbKey] = true;
            }
        }

        // 5. Bulk insert in chunks of 500 rows for high performance
        if (! empty($recordsToInsert)) {
            foreach (array_chunk($recordsToInsert, 500) as $chunk) {
                ServiceLog::insert($chunk);
                $this->logsCreated += count($chunk);
            }
        }
    }

    /**
     * Extract value from row using multiple possible key names (case & formatting insensitive).
     */
    protected function extractValue($row, array $possibleKeys)
    {
        $arr = is_array($row) ? $row : (is_object($row) && method_exists($row, 'toArray') ? $row->toArray() : (array) $row);

        // 1. Direct match
        foreach ($possibleKeys as $key) {
            if (isset($arr[$key]) && $arr[$key] !== null && $arr[$key] !== '') {
                return $arr[$key];
            }
        }

        // 2. Normalized keys match (lowercase, letters and numbers only)
        $normalizedMap = [];
        foreach ($arr as $k => $v) {
            $cleanKey = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', (string) $k));
            if ($cleanKey !== '') {
                $normalizedMap[$cleanKey] = $v;
            }
        }

        foreach ($possibleKeys as $key) {
            $cleanTarget = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $key));
            if (isset($normalizedMap[$cleanTarget]) && $normalizedMap[$cleanTarget] !== null && $normalizedMap[$cleanTarget] !== '') {
                return $normalizedMap[$cleanTarget];
            }
        }

        return null;
    }

    /**
     * Parse date from Excel number, Carbon, or various string formats.
     */
    protected function parseDate($value): ?Carbon
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof \DateTimeInterface) {
            return Carbon::instance($value);
        }

        // Excel serial date number (e.g. 45000 - 65000 represents dates around 2023 - 2070)
        if (is_numeric($value)) {
            $num = (float) $value;
            if ($num > 30000 && $num < 65000) {
                try {
                    return Carbon::instance(Date::excelToDateTimeObject($num));
                } catch (\Throwable $e) {
                    // fallback to string parsing
                }
            }
        }

        $str = trim((string) $value);
        if ($str === '') {
            return null;
        }

        // Replace Indonesian month names with English
        $str = str_ireplace(
            ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
            ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            $str
        );

        // Try exact format matches common in Indonesia
        $formats = [
            'd/m/Y', 'd-m-Y', 'Y-m-d', 'd/m/Y H:i', 'd-m-Y H:i', 'Y-m-d H:i',
            'd/m/Y H:i:s', 'd-m-Y H:i:s', 'Y-m-d H:i:s', 'd M Y', 'd-M-Y', 'd M y', 'd-M-y',
        ];

        foreach ($formats as $fmt) {
            try {
                $parsed = Carbon::createFromFormat($fmt, $str);
                if ($parsed !== false && $parsed->year >= 2000 && $parsed->year <= 2050) {
                    // If no time was specified in format, ensure 00:00:00
                    if (! str_contains($fmt, 'H')) {
                        $parsed->startOfDay();
                    }

                    return $parsed;
                }
            } catch (\Throwable $e) {
                // continue to next format
            }
        }

        try {
            $parsed = Carbon::parse($str);
            if ($parsed->year >= 2000 && $parsed->year <= 2050) {
                return $parsed;
            }
        } catch (\Throwable $e) {
            return null;
        }

        return null;
    }

    /**
     * Parse HM from number or string, handling Indonesian decimal comma and thousand dots.
     */
    protected function parseHm($value): float
    {
        if ($value === null || $value === '') {
            return 0.0;
        }

        if (is_numeric($value)) {
            return (float) $value;
        }

        $str = trim((string) $value);
        // Remove text like 'HM', 'KM', etc.
        $str = preg_replace('/[a-zA-Z\s]/', '', $str);

        if (strpos($str, ',') !== false && strpos($str, '.') !== false) {
            if (strrpos($str, ',') > strrpos($str, '.')) {
                // Comma is decimal separator: 12.500,5 -> 12500.5
                $str = str_replace('.', '', $str);
                $str = str_replace(',', '.', $str);
            } else {
                // Dot is decimal separator: 12,500.5 -> 12500.5
                $str = str_replace(',', '', $str);
            }
        } elseif (strpos($str, ',') !== false) {
            $str = str_replace(',', '.', $str);
        }

        return (float) $str;
    }

    /**
     * Normalize service type string or infer from HM.
     */
    protected function normalizeServiceType($rawType, float $hm): string
    {
        if ($rawType !== null && trim((string) $rawType) !== '') {
            $trimmed = trim((string) $rawType);
            // If just a number like '250' or '500', format as 'PS 250 H'
            if (is_numeric($trimmed)) {
                return "PS {$trimmed} H";
            }

            return $trimmed;
        }

        // Infer from HM
        $intHm = (int) round($hm);
        if ($intHm > 0) {
            if ($intHm % 2000 === 0) {
                return 'PS 2000 H';
            }
            if ($intHm % 1000 === 0) {
                return 'PS 1000 H';
            }
            if ($intHm % 500 === 0) {
                return 'PS 500 H';
            }

            return 'PS 250 H';
        }

        return 'PS 250 H';
    }
}
