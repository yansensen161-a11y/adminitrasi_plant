<?php

namespace App\Imports;

use App\Models\Unit;
use App\Services\WorkOrderService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class BreakdownImport implements ToCollection, WithHeadingRow
{
    protected int $importedCount = 0;

    protected int $skippedCount = 0;

    protected array $unregisteredUnits = [];

    protected int $emptyUnitRowsCount = 0;

    public function collection(Collection $rows): void
    {
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

            // 2. Flexible unit code extraction
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

            // Handle Waktu Breakdown from tanggal and jam_breakdown
            $waktuBreakdown = null;
            $waktuRfu = null;

            $rawTanggal = $rowArr['tanggal'] ?? $rowArr['tanggal_breakdown'] ?? $rowArr['tanggal_request'] ?? null;
            $rawJamBreakdown = $rowArr['jam_breakdown'] ?? $rowArr['jam_bd'] ?? null;

            if (! empty($rawTanggal)) {
                try {
                    $tanggal = is_numeric($rawTanggal)
                        ? Date::excelToDateTimeObject($rawTanggal)->format('Y-m-d')
                        : Carbon::parse($rawTanggal)->format('Y-m-d');

                    if (! empty($rawJamBreakdown)) {
                        $jamB = is_numeric($rawJamBreakdown)
                            ? Date::excelToDateTimeObject($rawJamBreakdown)->format('H:i')
                            : trim((string) $rawJamBreakdown);

                        $waktuBreakdown = Carbon::parse($tanggal.' '.$jamB);
                    } else {
                        $waktuBreakdown = Carbon::parse($tanggal.' 00:00:00');
                    }
                } catch (\Exception $e) {
                    $waktuBreakdown = now();
                }
            } else {
                $waktuBreakdown = now();
            }

            // Handle Waktu RFU from date_rfu / tanggal_rfu and jam_ready / jam_rfu
            $rawTanggalRfu = $rowArr['date_rfu']
                ?? $rowArr['tanggal_rfu']
                ?? $rowArr['tgl_rfu']
                ?? $rowArr['tanggal_ready']
                ?? $rowArr['date_ready']
                ?? $rowArr['tanggal_selesai']
                ?? null;

            $rawJamReady = $rowArr['jam_ready']
                ?? $rowArr['jam_rfu']
                ?? null;

            if (! empty($rawTanggalRfu)) {
                try {
                    $tanggalRfu = is_numeric($rawTanggalRfu)
                        ? Date::excelToDateTimeObject($rawTanggalRfu)->format('Y-m-d')
                        : Carbon::parse($rawTanggalRfu)->format('Y-m-d');

                    if (! empty($rawJamReady)) {
                        $jamR = is_numeric($rawJamReady)
                            ? Date::excelToDateTimeObject($rawJamReady)->format('H:i')
                            : trim((string) $rawJamReady);

                        $waktuRfu = Carbon::parse($tanggalRfu.' '.$jamR);
                    } else {
                        $waktuRfu = Carbon::parse($tanggalRfu.' 00:00:00');
                    }
                } catch (\Exception $e) {
                    $waktuRfu = null;
                }
            } elseif (! empty($rawJamReady)) {
                try {
                    $jamR = is_numeric($rawJamReady)
                        ? Date::excelToDateTimeObject($rawJamReady)->format('H:i')
                        : trim((string) $rawJamReady);

                    if (str_contains($jamR, '-') || str_contains($jamR, '/')) {
                        $waktuRfu = Carbon::parse($jamR);
                    } elseif ($waktuBreakdown) {
                        $waktuRfu = Carbon::parse($waktuBreakdown->format('Y-m-d').' '.$jamR);
                        if ($waktuRfu->lt($waktuBreakdown)) {
                            $waktuRfu->addDay();
                        }
                    }
                } catch (\Exception $e) {
                    $waktuRfu = null;
                }
            }

            // Normalization
            $rawTipe = $rowArr['tipe_wo'] ?? $rowArr['tipe_work_order'] ?? null;
            $rawStatus = $rowArr['status_wo'] ?? $rowArr['status_pengerjaan'] ?? $rowArr['status'] ?? null;

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

            $tipeWo = WorkOrderService::normalizeTipeWo($rawTipe ?: 'CM - CORRECTIVE MAINTENANCE');
            $hasFinishDate = ! empty($waktuRfu);
            $statusPengerjaan = WorkOrderService::normalizeStatusWo($rawStatus, $hasFinishDate);
            $downStatus = WorkOrderService::normalizeDownStatus($rowArr['down_status'] ?? $rowArr['status_down'] ?? $rowArr['b_status'] ?? null);

            // Compute durasi_hrs
            $durasiHrs = null;
            if (! empty($rowArr['durasi_hrs']) && is_numeric($rowArr['durasi_hrs'])) {
                $durasiHrs = (float) $rowArr['durasi_hrs'];
            } elseif ($waktuBreakdown && $waktuRfu) {
                $durasiHrs = round(abs($waktuRfu->diffInMinutes($waktuBreakdown)) / 60, 2);
            }

            $problem = $rowArr['problem'] ?? $rowArr['deskripsi_problem'] ?? 'Unplanned Breakdown';
            $correctiveAction = $rowArr['corrective_action'] ?? $rowArr['tindakan_perbaikan'] ?? $rowArr['activity_progress'] ?? null;
            $pic = $rowArr['pic'] ?? $rowArr['mechanic'] ?? $rowArr['mekanik'] ?? 'Mekanik';
            $site = $rowArr['site'] ?? $rowArr['lokasi'] ?? ($unit->lokasi ?: 'Lokal');

            $rawCompGroup = $rowArr['component_group']
                ?? $rowArr['group_component']
                ?? $rowArr['component']
                ?? $rowArr['komponen']
                ?? $rowArr['grup_komponen']
                ?? null;
            $componentGroup = WorkOrderService::normalizeComponentGroup($rawCompGroup);

            $workOrder = WorkOrderService::createWorkOrder([
                'no_wo' => ! empty($rowArr['no_wo']) ? trim((string) $rowArr['no_wo']) : null,
                'tipe_wo' => 'BREAKDOWN',
                'unit_id' => $unit->id,
                'status_wo' => $tipeWo,
                'status_pengerjaan' => $statusPengerjaan,
                'component' => $componentGroup,
                'waktu_breakdown' => $waktuBreakdown,
                'waktu_rfu' => $waktuRfu,
                'close_date' => ($statusPengerjaan === 'COMPLETED - PEKERJAAN SELESAI') ? ($waktuRfu ?: $waktuBreakdown) : null,
                'durasi_hrs' => $durasiHrs,
                'delay' => 0,
                'hm_unit' => $this->cleanHm($rowArr['hm_unit'] ?? $rowArr['hm'] ?? null, (float) ($unit->hm ?? 0)),
                'hm_bd' => $this->cleanHm($rowArr['hm_bd'] ?? null, (float) ($unit->hm ?? 0)),
                'hm_rfu' => $this->cleanHm($rowArr['hm_rfu'] ?? null, null),
                'problem' => $problem,
                'corrective_action' => $correctiveAction,
                'downtime_code' => $rowArr['downtime_code'] ?? 'Unschedule',
                'site' => $site,
                'request_date' => $waktuBreakdown ?: now(),
                'request_by' => auth()->user()?->name ?? 'System',
                'priority' => 'HIGH',
            ]);

            // Create initial task with down status
            $workOrder->tasks()->create([
                'group_component' => $componentGroup,
                'component' => $componentGroup,
                'task_description' => mb_substr($problem, 0, 250),
                'problem' => $problem,
                'activity_progress' => $correctiveAction,
                'mechanic' => mb_substr($pic, 0, 250),
                'status' => $downStatus,
                'start_date' => $waktuBreakdown ? Carbon::instance($waktuBreakdown)->toDateTimeString() : null,
                'end_date' => $waktuRfu ? Carbon::instance($waktuRfu)->toDateTimeString() : null,
                'downtime_hrs' => $durasiHrs ?? 0,
            ]);

            $this->importedCount++;
        }
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
        $msg = "Berhasil mengimpor {$this->importedCount} data Breakdown.";

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
