<?php

namespace App\Imports;

use App\Http\Controllers\WorkOrderController;
use App\Models\Unit;
use App\Services\WorkOrderService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class WorkOrderImport implements ToCollection, WithHeadingRow
{
    protected int $importedCount = 0;

    protected int $skippedCount = 0;

    protected array $unregisteredUnits = [];

    protected int $emptyUnitRowsCount = 0;

    public function collection(Collection $rows): void
    {
        // 1. Preload all units for fast and resilient lookup
        $allUnits = Unit::all();
        $unitMap = [];
        foreach ($allUnits as $u) {
            $raw = strtoupper(trim((string) $u->code_unit));
            $unitMap[$raw] = $u;
            $clean = preg_replace('/[^A-Za-z0-9]/', '', $raw);
            if ($clean !== '') {
                $unitMap[$clean] = $u;
            }
        }

        foreach ($rows as $row) {
            $rowArr = is_array($row) ? $row : (method_exists($row, 'toArray') ? $row->toArray() : (array) $row);

            // 1. Skip completely empty / whitespace rows (Excel trailing blank rows)
            $hasAnyData = false;
            foreach ($rowArr as $val) {
                if ($val !== null && trim((string) $val) !== '') {
                    $hasAnyData = true;
                    break;
                }
            }

            if (! $hasAnyData) {
                continue;
            }

            $codeUnit = trim((string) (
                $rowArr['code_unit']
                ?? $rowArr['kode_unit']
                ?? $rowArr['unit']
                ?? $rowArr['unit_code']
                ?? $rowArr['no_unit']
                ?? $rowArr['nomor_unit']
                ?? $rowArr['cn']
                ?? $rowArr['equipment']
                ?? $rowArr['alat']
                ?? $rowArr['unit_id']
                ?? $rowArr['code']
                ?? ''
            ));

            if (empty($codeUnit)) {
                $this->emptyUnitRowsCount++;
                $this->skippedCount++;

                continue;
            }

            $rawCode = strtoupper($codeUnit);
            $cleanCode = preg_replace('/[^A-Za-z0-9]/', '', $rawCode);
            $unit = $unitMap[$rawCode] ?? $unitMap[$cleanCode] ?? null;
            if (! $unit) {
                $this->unregisteredUnits[$rawCode] = $codeUnit;
                $this->skippedCount++;

                continue;
            }

            try {
                // 2. Parse Start / Request Date & Time
                $rawTanggal = $rowArr['tanggal'] ?? $rowArr['tanggal_request'] ?? $rowArr['tanggal_breakdown'] ?? $rowArr['start_date'] ?? $rowArr['tgl'] ?? null;
                $rawJamB = $rowArr['jam_breakdown'] ?? $rowArr['jam_bd'] ?? $rowArr['jam_start'] ?? null;
                $rawJamR = $rowArr['jam_ready'] ?? $rowArr['jam_rfu'] ?? null;
                $rawTanggalSelesai = $rowArr['tanggal_selesai'] ?? $rowArr['tanggal_rfu'] ?? $rowArr['finish_date'] ?? $rowArr['close_date'] ?? null;

                $requestDate = $this->parseDateTime($rawTanggal, $rawJamB) ?: now();

                // Finish Date: check if separate finished date is provided, or if jam_ready is combined with tanggal
                $finishDate = null;
                if (! empty($rawTanggalSelesai) && (str_contains((string) $rawTanggalSelesai, '-') || str_contains((string) $rawTanggalSelesai, '/') || is_numeric($rawTanggalSelesai))) {
                    $finishDate = $this->parseDateTime($rawTanggalSelesai, $rawJamR);
                } elseif (! empty($rawJamR) && ! empty($rawTanggal)) {
                    $finishDate = $this->parseDateTime($rawTanggal, $rawJamR);
                    if ($finishDate && $requestDate && $finishDate->lt($requestDate)) {
                        $finishDate->addDay();
                    }
                } elseif (! empty($rawTanggalSelesai)) {
                    $finishDate = $this->parseDateTime($rawTanggalSelesai);
                }

                // 3. Resolve raw Tipe WO and Status WO
                $rawTipe = $rowArr['tipe_wo'] ?? $rowArr['tipe_work_order'] ?? $rowArr['tipe'] ?? null;
                $rawStatus = $rowArr['status_wo'] ?? $rowArr['status_pengerjaan'] ?? $rowArr['status'] ?? null;

                // Handle legacy files where status_wo contained the WO Type
                if (! empty($rawStatus) && (
                    str_contains(strtoupper((string) $rawStatus), 'PREVENTIVE') ||
                    str_contains(strtoupper((string) $rawStatus), 'CORRECTIVE') ||
                    str_contains(strtoupper((string) $rawStatus), 'OVERHAUL') ||
                    str_contains(strtoupper((string) $rawStatus), 'REPLACEMENT') ||
                    str_contains(strtoupper((string) $rawStatus), 'UNDERCARRIAGE') ||
                    str_contains(strtoupper((string) $rawStatus), 'TYRE') ||
                    str_contains(strtoupper((string) $rawStatus), 'SERVICE')
                )) {
                    if (empty($rawTipe)) {
                        $rawTipe = $rawStatus;
                        $rawStatus = null;
                    }
                }

                $tipeWo = WorkOrderService::normalizeTipeWo($rawTipe ?: ($rowArr['maintenance_type'] ?? $rowArr['tipe_service'] ?? $rowArr['problem'] ?? null));
                $hasFinishDate = ! empty($finishDate);
                $statusPengerjaan = WorkOrderService::normalizeStatusWo($rawStatus, $hasFinishDate);
                $downStatus = WorkOrderService::normalizeDownStatus($rowArr['down_status'] ?? $rowArr['status_down'] ?? $rowArr['b_status'] ?? $rowArr['downtime_status'] ?? null);

                // 4. Calculate duration if both dates are present
                $durasiHrs = null;
                if (! empty($rowArr['durasi_hrs']) && is_numeric($rowArr['durasi_hrs'])) {
                    $durasiHrs = (float) $rowArr['durasi_hrs'];
                } elseif (! empty($rowArr['downtime_hrs']) && is_numeric($rowArr['downtime_hrs'])) {
                    $durasiHrs = (float) $rowArr['downtime_hrs'];
                } elseif ($finishDate && $requestDate) {
                    $durasiHrs = round(abs($finishDate->diffInMinutes($requestDate)) / 60, 2);
                }

                // 5. Safely clean HM values (never pass strings like 'HM ERROR' or 'ERROR' to MySQL)
                $hmUnit = $this->cleanHm($rowArr['hm_unit'] ?? $rowArr['hm'] ?? null, (float) ($unit->hm ?? 0));
                $hmBd = $this->cleanHm($rowArr['hm_bd'] ?? null, $hmUnit);
                $hmRfu = $this->cleanHm($rowArr['hm_rfu'] ?? null, null);

                $problem = trim((string) ($rowArr['problem'] ?? $rowArr['deskripsi_problem'] ?? $rowArr['kerusakan'] ?? $rowArr['uraian_pekerjaan'] ?? $tipeWo));
                if (empty($problem)) {
                    $problem = $tipeWo;
                }
                $correctiveAction = $rowArr['corrective_action'] ?? $rowArr['tindakan_perbaikan'] ?? $rowArr['activity_progress'] ?? $rowArr['tindakan'] ?? null;
                $pic = $rowArr['pic'] ?? $rowArr['mechanic'] ?? $rowArr['mekanik'] ?? 'Mekanik';
                $site = $rowArr['site'] ?? $rowArr['lokasi'] ?? ($unit->lokasi ?: 'Lokal');

                $isSchedule = in_array($tipeWo, [
                    'PM - PREVENTIVE MAINTENANCE',
                    'OVH - OVERHAUL',
                    'SVC - SERVICE MAINTENANCE',
                ]);
                $tipeWoCategory = $isSchedule ? 'SCHEDULE' : 'BREAKDOWN';

                $isCompleted = ($statusPengerjaan === 'COMPLETED - PEKERJAAN SELESAI') || ! empty($finishDate);

                $rawCompGroup = $rowArr['component_group']
                    ?? $rowArr['group_component']
                    ?? $rowArr['component']
                    ?? $rowArr['komponen']
                    ?? $rowArr['grup_komponen']
                    ?? null;
                $componentGroup = WorkOrderService::normalizeComponentGroup($rawCompGroup);

                $workOrder = WorkOrderService::createWorkOrder([
                    'no_wo' => ! empty($rowArr['no_wo']) ? trim((string) $rowArr['no_wo']) : null,
                    'unit_id' => $unit->id,
                    'status_wo' => $tipeWo,
                    'status_pengerjaan' => $statusPengerjaan,
                    'component' => $componentGroup,
                    'tipe_wo' => $tipeWoCategory,
                    'waktu_breakdown' => $requestDate,
                    'waktu_rfu' => $finishDate,
                    'close_date' => $isCompleted ? ($finishDate ?: $requestDate) : null,
                    'durasi_hrs' => $durasiHrs,
                    'delay' => 0,
                    'hm_unit' => $hmUnit,
                    'hm_bd' => $hmBd,
                    'hm_rfu' => $hmRfu,
                    'problem' => $problem,
                    'corrective_action' => $correctiveAction,
                    'downtime_code' => $rowArr['downtime_code'] ?? ($isSchedule ? 'Schedule' : 'Unschedule'),
                    'site' => $site,
                    'request_date' => $requestDate,
                    'request_by' => auth()->user()?->name ?? 'System',
                    'priority' => 'MEDIUM',
                ]);

                // Create initial task with down status
                $taskDesc = mb_substr($problem, 0, 250);
                $workOrder->tasks()->create([
                    'group_component' => $componentGroup,
                    'component' => $componentGroup,
                    'task_description' => $taskDesc,
                    'problem' => $problem,
                    'activity_progress' => $correctiveAction,
                    'mechanic' => mb_substr($pic, 0, 250),
                    'status' => $downStatus,
                    'start_date' => $requestDate ? Carbon::instance($requestDate)->toDateTimeString() : null,
                    'end_date' => $finishDate ? Carbon::instance($finishDate)->toDateTimeString() : null,
                    'downtime_hrs' => $durasiHrs ?? 0,
                ]);

                if ($workOrder->tipe_wo === 'SCHEDULE' && $statusPengerjaan === 'COMPLETED - PEKERJAAN SELESAI') {
                    WorkOrderController::syncScheduleToServiceLog($workOrder);
                }

                $this->importedCount++;
            } catch (\Throwable $e) {
                // Protect batch from crashing on isolated row errors
                $this->skippedCount++;
            }
        }
    }

    /**
     * Parse date and optional time into Carbon instance.
     */
    protected function parseDateTime($rawDate, $rawTime = null): ?Carbon
    {
        if (empty($rawDate) && empty($rawTime)) {
            return null;
        }

        $parsed = null;
        if (! empty($rawDate)) {
            if (is_numeric($rawDate)) {
                try {
                    $parsed = Carbon::instance(Date::excelToDateTimeObject($rawDate));
                } catch (\Throwable $e) {
                }
            } else {
                $str = trim((string) $rawDate);
                // Check if string contains both date and time (e.g. '2026-09-20 08:00')
                if (preg_match('/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\s+\d{1,2}:\d{2}/', $str) ||
                    preg_match('/\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\s+\d{1,2}:\d{2}/', $str)) {
                    try {
                        return Carbon::parse($str);
                    } catch (\Throwable $e) {
                    }
                }
                try {
                    $parsed = Carbon::parse($str);
                } catch (\Throwable $e) {
                }
            }
        }

        if ($parsed && ! empty($rawTime)) {
            $timeStr = null;
            if (is_numeric($rawTime)) {
                try {
                    $timeStr = Date::excelToDateTimeObject($rawTime)->format('H:i:s');
                } catch (\Throwable $e) {
                }
            } else {
                $timeStr = trim((string) $rawTime);
            }

            if ($timeStr && preg_match('/(\d{1,2}):(\d{2})(?::(\d{2}))?/', $timeStr, $m)) {
                $h = (int) $m[1];
                $i = (int) $m[2];
                $s = isset($m[3]) ? (int) $m[3] : 0;
                $parsed = $parsed->copy()->setTime($h, $i, $s);
            }
        }

        return $parsed;
    }

    /**
     * Clean and sanitize HM numbers, preventing MySQL SQLSTATE[HY000] 1366 errors on strings like 'HM ERROR'.
     */
    protected function cleanHm($val, $fallback = null): ?float
    {
        if ($val === null || $val === '') {
            return $fallback !== null ? (float) $fallback : null;
        }

        if (is_numeric($val)) {
            return (float) $val;
        }

        $str = trim((string) $val);
        if (preg_match('/error|n\/a|null|none|#ref!|#value!/i', $str)) {
            return $fallback !== null ? (float) $fallback : null;
        }

        $clean = preg_replace('/[^0-9.,]/', '', $str);
        if ($clean === '') {
            return $fallback !== null ? (float) $fallback : null;
        }

        if (str_contains($clean, ',') && str_contains($clean, '.')) {
            if (strrpos($clean, ',') > strrpos($clean, '.')) {
                $clean = str_replace('.', '', $clean);
                $clean = str_replace(',', '.', $clean);
            } else {
                $clean = str_replace(',', '', $clean);
            }
        } elseif (str_contains($clean, ',')) {
            $clean = str_replace(',', '.', $clean);
        }

        return is_numeric($clean) ? (float) $clean : ($fallback !== null ? (float) $fallback : null);
    }

    public function getSummaryMessage(): string
    {
        $msg = "Berhasil mengimpor {$this->importedCount} data Work Order.";

        $warnings = [];
        if (! empty($this->unregisteredUnits)) {
            $unitsList = implode(', ', array_slice(array_values($this->unregisteredUnits), 0, 5));
            $more = count($this->unregisteredUnits) > 5 ? ' dan '.(count($this->unregisteredUnits) - 5).' lainnya' : '';
            $warnings[] = count($this->unregisteredUnits)." unit belum terdaftar di master Unit ({$unitsList}{$more})";
        }

        if ($this->emptyUnitRowsCount > 0) {
            $warnings[] = "{$this->emptyUnitRowsCount} baris memiliki data tetapi kolom kode unit kosong";
        }

        if (! empty($warnings)) {
            $msg .= ' ('.implode('; ', $warnings).')';
        }

        return $msg;
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }

    public function getUnregisteredUnits(): array
    {
        return $this->unregisteredUnits;
    }

    public function getEmptyUnitRowsCount(): int
    {
        return $this->emptyUnitRowsCount;
    }
}
