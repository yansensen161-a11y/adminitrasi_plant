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
    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            $codeUnit = $row['code_unit'] ?? null;
            if (! $codeUnit) {
                continue;
            }

            $unit = Unit::where('code_unit', $codeUnit)->first();
            if (! $unit) {
                continue;
            }

            // Handle Waktu Breakdown from tanggal and jam_breakdown
            $waktuBreakdown = null;
            $waktuRfu = null;

            if (! empty($row['tanggal']) && ! empty($row['jam_breakdown'])) {
                try {
                    $tanggal = is_numeric($row['tanggal'])
                        ? Date::excelToDateTimeObject($row['tanggal'])->format('Y-m-d')
                        : Carbon::parse($row['tanggal'])->format('Y-m-d');

                    // Sometimes Excel time can be float (fraction of day) or string
                    $jamB = is_numeric($row['jam_breakdown'])
                        ? Date::excelToDateTimeObject($row['jam_breakdown'])->format('H:i')
                        : $row['jam_breakdown'];

                    $waktuBreakdown = Carbon::parse($tanggal.' '.$jamB);

                    // Handle Jam Ready
                    if (! empty($row['jam_ready'])) {
                        $jamR = is_numeric($row['jam_ready'])
                            ? Date::excelToDateTimeObject($row['jam_ready'])->format('H:i')
                            : $row['jam_ready'];

                        $waktuRfu = Carbon::parse($tanggal.' '.$jamR);
                        if ($waktuRfu->lt($waktuBreakdown)) {
                            $waktuRfu->addDay();
                        }
                    }
                } catch (\Exception $e) {
                    $waktuBreakdown = now();
                }
            } else {
                $waktuBreakdown = now();
            }

            WorkOrderService::createWorkOrder([
                'tipe_wo' => 'BREAKDOWN',
                'unit_id' => $unit->id,
                'status_wo' => $row['status_wo'] ?? 'OPEN',
                'waktu_breakdown' => $waktuBreakdown,
                'waktu_rfu' => $waktuRfu,
                'hm_unit' => $row['hm_unit'] ?? $unit->hm,
                'problem' => $row['problem'] ?? 'Unplanned Breakdown',
                'corrective_action' => $row['corrective_action'] ?? null,
                'downtime_code' => $row['downtime_code'] ?? 'UNP', // Default Unplanned
                'site' => $row['site'] ?? 'Lokal',
                'request_date' => now(),
                'request_by' => auth()->user()?->name ?? 'System',
                'priority' => 'HIGH',
            ]);
        }
    }
}
