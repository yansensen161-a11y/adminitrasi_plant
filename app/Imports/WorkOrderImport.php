<?php

namespace App\Imports;

use App\Models\Unit;
use App\Services\WorkOrderService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class WorkOrderImport implements ToCollection, WithHeadingRow
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

            $requestDate = null;
            if (isset($row['tanggal_request']) && ! empty($row['tanggal_request'])) {
                try {
                    $requestDate = is_numeric($row['tanggal_request'])
                        ? Date::excelToDateTimeObject($row['tanggal_request'])
                        : Carbon::parse($row['tanggal_request']);
                } catch (\Exception $e) {
                    $requestDate = now();
                }
            } else {
                $requestDate = now();
            }

            WorkOrderService::createWorkOrder([
                'tipe_wo' => 'SCHEDULE',
                'unit_id' => $unit->id,
                'status_wo' => 'OPEN',
                'problem' => $row['problem'] ?? 'Plan Schedule Maintenance',
                'request_date' => $requestDate,
                'request_by' => auth()->user()?->name ?? 'System',
                'priority' => 'MEDIUM',
                'hm_unit' => $row['hm_unit'] ?? $unit->hm,
            ]);
        }
    }
}
