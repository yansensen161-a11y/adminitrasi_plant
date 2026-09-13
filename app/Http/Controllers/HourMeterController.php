<?php

namespace App\Http\Controllers;

use App\Models\HourMeterLog;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HourMeterController extends Controller
{
    private function getHmUnits(): array
    {
        return [
            'ME023', 'ME048', 'ME049', 'ME052', 'ME053', 'ME055', 'ME056', 'ME057', 'ME059', 'ME066',
            'ME067', 'ME068', 'ME069', 'ME070', 'ME072', 'MD036', 'MD037', 'MD041', 'MD042', 'MD043',
            'MD045', 'MD046', 'MD047', 'MD048', 'MG018', 'MG019', 'MG021', 'MDT006', 'MDT009', 'MDT012',
            'MDT015', 'MDT016', 'MDT017', 'MDT019', 'MDT020', 'MDT021', 'MDT022', 'MDT023', 'MDT025',
            'MDT027', 'MDT028', 'MDT029', 'MDT030', 'MDT035', 'MDT036', 'MDT039', 'MDT040', 'MDT041',
            'MDT042', 'MDT043', 'MDT045', 'MCP003', 'MCP006', 'MDT046', 'MDT047', 'MDT048', 'MDT051',
            'MDT052', 'MDT026', 'MLT008', 'MLT005', 'MCT001', 'MB001', 'MB002', 'MWT010', 'MTL013',
            'MTL015', 'MTL016', 'MTL023', 'MTL031', 'MTL035', 'MTL040', 'MTL041', 'MTL042', 'MTL043',
            'MFT007', 'MFT009', 'MWP005', 'MWP003', 'MCM007', 'MGS002', 'MGS009', 'MGS006', 'B-02',
            'B-10', 'T-02', 'A-07', 'A-08', 'B-16', 'G-03', 'D-09', 'D-21', 'D-20', 'E-02', 'F-05',
            'G-05', 'D-19', 'H-02', 'HO-06', 'OHT066', 'OHT067', 'OHT068', 'OHT069', 'OHT070', 'OHT071',
            'OHT072', 'OHT073', 'OHT074', 'OHT075', 'OHT115', 'OHT116', 'OHT117', 'OHT118', 'OHT119',
            'OHT120', 'MWT009', 'MWM010', 'MMH005', 'MWP007', 'MGS016', 'MGS018', 'MC 02',
        ];
    }

    public function index(Request $request)
    {
        $codeUnitFilter = $request->input('code_unit', '');
        $typeUnitFilter = $request->input('type_unit', '');
        $locationFilter = $request->input('location', '');
        $departmentFilter = $request->input('department', '');
        $statusFilter = $request->input('status', '');
        $dateFrom = $request->input('date_from', '');
        $dateTo = $request->input('date_to', '');
        $hmErrorFilter = $request->input('hm_error', '');

        if (! $dateFrom) {
            $dateFrom = Carbon::now()->subDays(9)->format('Y-m-d');
        }
        if (! $dateTo) {
            $dateTo = Carbon::now()->format('Y-m-d');
        }

        $unitsQuery = Unit::query()->whereIn('code_unit', $this->getHmUnits());
        if ($codeUnitFilter) {
            $unitsQuery->where('code_unit', 'like', "%{$codeUnitFilter}%");
        }
        if ($typeUnitFilter) {
            $unitsQuery->where('type_unit', $typeUnitFilter);
        }
        if ($locationFilter) {
            $unitsQuery->where('location', $locationFilter);
        }
        if ($statusFilter) {
            $unitsQuery->where('status', $statusFilter);
        }

        $units = $unitsQuery->orderBy('code_unit', 'asc')->get();
        $unitIds = $units->pluck('id');

        $logs = HourMeterLog::whereIn('unit_id', $unitIds)
            ->whereDate('log_date', '>=', $dateFrom)
            ->whereDate('log_date', '<=', $dateTo)
            ->get();

        $groupedLogs = [];
        foreach ($logs as $log) {
            $dateStr = Carbon::parse($log->log_date)->format('Y-m-d');
            $groupedLogs[$log->unit_id][$dateStr] = $log;
        }

        $period = new \DatePeriod(
            new \DateTime($dateFrom),
            new \DateInterval('P1D'),
            (new \DateTime($dateTo))->modify('+1 day')
        );
        $dates = [];
        foreach ($period as $dt) {
            $dates[] = $dt->format('Y-m-d');
        }

        if ($hmErrorFilter) {
            $filteredUnits = [];
            foreach ($units as $unit) {
                $hasError = false;
                if ($hmErrorFilter === 'belum_terisi') {
                    foreach ($dates as $date) {
                        if (! isset($groupedLogs[$unit->id][$date])) {
                            $hasError = true;
                            break;
                        }
                    }
                } elseif ($hmErrorFilter === 'over_24') {
                    foreach ($dates as $date) {
                        if (isset($groupedLogs[$unit->id][$date]) && $groupedLogs[$unit->id][$date]->hm_total > 24) {
                            $hasError = true;
                            break;
                        }
                    }
                } elseif ($hmErrorFilter === 'minus') {
                    foreach ($dates as $date) {
                        if (isset($groupedLogs[$unit->id][$date]) && $groupedLogs[$unit->id][$date]->hm_total < 0) {
                            $hasError = true;
                            break;
                        }
                    }
                }

                if ($hasError) {
                    $filteredUnits[] = $unit;
                }
            }
            $units = collect($filteredUnits)->values();
        }

        $typeUnits = Unit::select('type_unit')->distinct()->whereNotNull('type_unit')->where('type_unit', '!=', '')->pluck('type_unit');
        $locations = Unit::select('location')->distinct()->whereNotNull('location')->where('location', '!=', '')->pluck('location');
        $departments = collect(['Production', 'Support', 'Maintenance', 'Engineering', 'Safety']);
        $statuses = Unit::select('status')->distinct()->whereNotNull('status')->where('status', '!=', '')->pluck('status');

        return Inertia::render('HourMeter/Index', [
            'units' => $units,
            'groupedLogs' => $groupedLogs,
            'dates' => $dates,
            'dropdowns' => [
                'typeUnits' => $typeUnits,
                'locations' => $locations,
                'departments' => $departments,
                'statuses' => $statuses,
            ],
            'filters' => $request->only(['code_unit', 'type_unit', 'location', 'department', 'status', 'date_from', 'date_to', 'hm_error']),
        ]);
    }

    public function getHm(Request $request)
    {
        $unitId = $request->input('unit_id');
        $date = $request->input('date');

        if (! $unitId || ! $date) {
            return response()->json(['hm' => null]);
        }

        $log = HourMeterLog::where('unit_id', $unitId)
            ->whereDate('log_date', $date)
            ->first();

        return response()->json(['hm' => $log ? $log->hm_end : null]);
    }

    public function create()
    {
        $units = Unit::select('id', 'code_unit', 'model', 'hm', 'location')
            ->whereIn('code_unit', $this->getHmUnits())
            ->orderByRaw('CASE WHEN no_urut IS NULL THEN 1 ELSE 0 END, no_urut ASC, code_unit ASC')
            ->get();

        return Inertia::render('HourMeter/Create', [
            'units' => $units,
            'defaultDate' => date('Y-m-d'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code_unit' => 'required|string|max:100',
            'log_date' => 'required|date',
            'hm_start' => 'required|numeric|min:0',
            'hm_end' => 'required|numeric|min:0',
            'hm_total' => 'nullable|numeric|min:0',
            'shift' => 'nullable|string|max:50',
            'operator_name' => 'nullable|string|max:150',
            'location' => 'nullable|string|max:150',
            'remarks' => 'nullable|string|max:1000',
        ]);

        // Auto calculate hm_total if not given
        if (! isset($validated['hm_total']) || $validated['hm_total'] === null || $validated['hm_total'] == 0) {
            $validated['hm_total'] = max(0, round($validated['hm_end'] - $validated['hm_start'], 1));
        }

        $unit = Unit::where('code_unit', $validated['code_unit'])->first();
        if ($unit) {
            $validated['unit_id'] = $unit->id;
        }

        HourMeterLog::create($validated);
        
        if ($unit && $validated['hm_end'] > $unit->hm) {
            \App\Services\HMUpdateService::processHmUpdate($unit, $validated['hm_end'], $validated['log_date']);
        }

        return redirect()->route('hour-meters.index')->with('message', "Log Hour Meter unit [{$request->code_unit}] tanggal {$request->log_date} berhasil disimpan.");
    }

    public function edit(HourMeterLog $hourMeter)
    {
        $units = Unit::select('id', 'code_unit', 'model', 'hm', 'location')
            ->whereIn('code_unit', $this->getHmUnits())
            ->orderByRaw('CASE WHEN no_urut IS NULL THEN 1 ELSE 0 END, no_urut ASC, code_unit ASC')
            ->get();

        return Inertia::render('HourMeter/Edit', [
            'log' => $hourMeter,
            'units' => $units,
        ]);
    }

    public function update(Request $request, HourMeterLog $hourMeter)
    {
        $validated = $request->validate([
            'code_unit' => 'required|string|max:100',
            'log_date' => 'required|date',
            'hm_start' => 'required|numeric|min:0',
            'hm_end' => 'required|numeric|min:0',
            'hm_total' => 'nullable|numeric|min:0',
            'shift' => 'nullable|string|max:50',
            'operator_name' => 'nullable|string|max:150',
            'location' => 'nullable|string|max:150',
            'remarks' => 'nullable|string|max:1000',
        ]);

        if (! isset($validated['hm_total']) || $validated['hm_total'] === null || $validated['hm_total'] == 0) {
            $validated['hm_total'] = max(0, round($validated['hm_end'] - $validated['hm_start'], 1));
        }

        $unit = Unit::where('code_unit', $validated['code_unit'])->first();
        if ($unit) {
            $validated['unit_id'] = $unit->id;
        }

        $hourMeter->update($validated);
        
        if ($unit && $validated['hm_end'] > $unit->hm) {
            \App\Services\HMUpdateService::processHmUpdate($unit, $validated['hm_end'], $validated['log_date']);
        }

        return redirect()->route('hour-meters.index')->with('message', "Log Hour Meter unit [{$hourMeter->code_unit}] berhasil diperbarui.");
    }

    public function destroy(HourMeterLog $hourMeter)
    {
        $code = $hourMeter->code_unit;
        $date = $hourMeter->log_date;
        $hourMeter->delete();

        return redirect()->route('hour-meters.index')->with('message', "Log Hour Meter [{$code}] tanggal {$date} berhasil dihapus.");
    }

    public function deleteAll()
    {
        HourMeterLog::query()->delete();

        return redirect()->route('hour-meters.index')->with('message', 'Semua data log Hour Meter berhasil dihapus.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:20480',
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();

            $highestRow = $worksheet->getHighestRow();
            $highestColumn = $worksheet->getHighestColumn();
            $highestColumnIndex = Coordinate::columnIndexFromString($highestColumn);

            if ($highestRow < 2) {
                return redirect()->back()->withErrors(['file' => 'File Excel kosong atau tidak memiliki data.']);
            }

            // Map header column row (Row 1)
            $headerMap = [];
            for ($col = 1; $col <= $highestColumnIndex; $col++) {
                $cellVal = $worksheet->getCell([$col, 1])->getValue();
                $clean = strtolower(trim((string) $cellVal));
                // Remove brackets to avoid issues with names like "Date (Tanggal)"
                $clean = str_replace(['(', ')', '[', ']'], '', $clean);
                // Replace any non-alphanumeric character with underscore
                $clean = preg_replace('/[^a-z0-9]+/i', '_', $clean);
                $clean = trim($clean, '_');
                $headerMap[$col] = $clean;
            }

            $importedCount = 0;
            $currentYear = date('Y');
            $currentMonth = date('m');

            // Parse helper for dates
            $parseDate = function ($val) use ($currentYear, $currentMonth) {
                if (empty($val)) {
                    return null;
                }

                $str = trim((string) $val);
                
                // If it contains a space, it might be something like "11/09/2026 NS"
                // Let's just take the first part for the date.
                if (str_contains($str, ' ')) {
                    $str = explode(' ', $str)[0];
                }

                // If single day number e.g. "10", "9", "08"
                if (is_numeric($str) && (int) $str >= 1 && (int) $str <= 31 && strlen($str) <= 2) {
                    $day = str_pad($str, 2, '0', STR_PAD_LEFT);

                    return "{$currentYear}-{$currentMonth}-{$day}";
                }

                // If Excel Date serial number
                if (is_numeric($str) && (float) $str > 30000 && (float) $str < 70000) {
                    try {
                        return ExcelDate::excelToDateTimeObject($str)->format('Y-m-d');
                    } catch (\Throwable) {
                    }
                }

                // If date string format
                try {
                    $strNorm = str_replace('-', '/', $str);
                    if (str_contains($strNorm, '/')) {
                        $parts = explode('/', $strNorm);
                        // Only do strict European parsing if we have 3 parts and they look numeric
                        if (count($parts) === 3 && is_numeric($parts[0]) && is_numeric($parts[1])) {
                            // If first part is a 4 digit year (e.g. 2026/08/10), Carbon parse will handle it fine
                            if (strlen($parts[0]) === 4) {
                                return Carbon::parse($str)->format('Y-m-d');
                            }

                            $y = $parts[2];
                            $m = $parts[1];
                            $d = $parts[0];
                            if (strlen($y) === 2) {
                                $y = '20'.$y;
                            }

                            // Return standard European d/m/Y (day/month/year)
                            if ((int) $d <= 31 && (int) $m <= 12) {
                                return Carbon::createFromDate($y, $m, $d)->format('Y-m-d');
                            }
                        }
                    }

                    // Let Carbon figure out the rest (e.g. "10-Aug-2026", "2026-08-10")
                    return Carbon::parse($str)->format('Y-m-d');
                } catch (\Throwable) {
                    return null;
                }
            };

            $validUnits = Unit::pluck('code_unit')->map(fn($c) => strtoupper(trim((string)$c)))->toArray();

            for ($row = 1; $row <= $highestRow; $row++) {
                $rowDataRaw = [];
                for ($col = 1; $col <= $highestColumnIndex; $col++) {
                    $cell = $worksheet->getCell([$col, $row]);
                    
                    if (\PhpOffice\PhpSpreadsheet\Shared\Date::isDateTime($cell) && is_numeric($cell->getValue())) {
                        $rowDataRaw[] = (string) $cell->getValue();
                    } else {
                        $formattedVal = $cell->getFormattedValue();
                        $rawVal = $cell->getValue();
                        $finalVal = $formattedVal !== null && $formattedVal !== '' ? (string) $formattedVal : ($rawVal !== null ? (string) $rawVal : '');
                        
                        if (trim($finalVal) !== '') {
                            $rowDataRaw[] = trim($finalVal);
                        }
                    }
                }

                if (empty($rowDataRaw)) {
                    continue;
                }

                $logDate = null;
                $shift = null;
                $codeUnit = null;
                $numbers = [];

                foreach ($rowDataRaw as $cellStr) {
                    // Detect Date
                    if (!$logDate) {
                        $d = $parseDate($cellStr);
                        if ($d) {
                            $logDate = $d;
                            $upperCell = strtoupper($cellStr);
                            if (str_contains($upperCell, ' NS')) $shift = 'NS';
                            if (str_contains($upperCell, ' DS')) $shift = 'DS';
                            continue;
                        }
                    }

                    // Detect Unit Code
                    if (!$codeUnit) {
                        $upperCell = strtoupper($cellStr);
                        if (in_array($upperCell, $validUnits)) {
                            $codeUnit = $upperCell;
                            continue;
                        }
                    }

                    // Detect Numbers (HM)
                    $cleanNum = str_replace(',', '.', $cellStr);
                    if (is_numeric($cleanNum)) {
                        $numbers[] = (float) $cleanNum;
                    }
                }

                // If we didn't find shift in date, check if any cell is exactly 'NS' or 'DS'
                if (!$shift) {
                    foreach ($rowDataRaw as $cellStr) {
                        $upperCell = strtoupper($cellStr);
                        if ($upperCell === 'NS' || $upperCell === 'DS') {
                            $shift = $upperCell;
                            break;
                        }
                    }
                }

                if (!$logDate || !$codeUnit || count($numbers) < 1) {
                    continue; // Skip invalid rows (like headers)
                }

                $hmStart = $numbers[0];
                $hmEnd = isset($numbers[1]) ? $numbers[1] : $hmStart;
                $hmTotal = isset($numbers[2]) ? $numbers[2] : max(0, round($hmEnd - $hmStart, 1));

                $unit = Unit::where('code_unit', $codeUnit)->first();
                $unitId = $unit?->id;

                if (! $unitId) {
                    continue;
                }

                HourMeterLog::create([
                    'unit_id' => $unitId,
                    'code_unit' => $codeUnit,
                    'log_date' => $logDate,
                    'hm_start' => $hmStart,
                    'hm_end' => $hmEnd,
                    'hm_total' => $hmTotal,
                    'shift' => $shift,
                ]);

                if ($unit && $hmEnd > $unit->hm) {
                    \App\Services\HMUpdateService::processHmUpdate($unit, $hmEnd, $logDate);
                }

                $importedCount++;
            }

            return redirect()->route('hour-meters.index')->with('message', "Berhasil mengimpor {$importedCount} data log Hour Meter vertikal.");
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['file' => 'Gagal memproses file Excel: '.$e->getMessage()]);
        }
    }

    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Hour Meter Log');

        // Headers — simplified
        $headers = [
            'Date (Tanggal)', 'Shift', 'CODE UNIT', 'HM Awal', 'HM Akhir',
        ];
        $sheet->fromArray([$headers], null, 'A1');

        // Style Header (A1:E1 — 5 columns)
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '7C3AED'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ];
        $sheet->getStyle('A1:E1')->applyFromArray($headerStyle);

        // Sample data rows (format DD/MM/YYYY)
        $currentMonth = date('m');
        $currentYear = date('Y');
        $samples = [
            ["10/{$currentMonth}/{$currentYear}", 'DS', 'EX-201', 4512.0, 4520.5],
            ["09/{$currentMonth}/{$currentYear}", 'DS', 'EX-201', 4504.0, 4512.0],
            ["08/{$currentMonth}/{$currentYear}", 'DS', 'EX-201', 4496.0, 4504.0],
            ["10/{$currentMonth}/{$currentYear}", 'DS', 'DT-101', 8132.0, 8140.0],
            ["09/{$currentMonth}/{$currentYear}", 'DS', 'DT-101', 8124.0, 8132.0],
            ["08/{$currentMonth}/{$currentYear}", 'DS', 'DT-101', 8116.0, 8124.0],
            ["10/{$currentMonth}/{$currentYear}", 'DS', 'DZ-005', 6320.2, 6320.2],
            ["10/{$currentMonth}/{$currentYear}", 'NS', 'WL-012', 5112.0, 5120.0],
            ["09/{$currentMonth}/{$currentYear}", 'NS', 'WL-012', 5104.0, 5112.0],
            ["08/{$currentMonth}/{$currentYear}", 'NS', 'WL-012', 5096.0, 5104.0],
        ];
        $sheet->fromArray($samples, null, 'A2');

        foreach (range('A', 'E') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Hour_Meter_Vertical.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $query = HourMeterLog::query()->orderBy('log_date', 'desc')->orderBy('code_unit', 'asc');

        if ($request->filled('code_unit')) {
            $query->where('code_unit', $request->code_unit);
        }

        if ($request->filled('shift')) {
            $query->where('shift', $request->shift);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('log_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('log_date', '<=', $request->date_to);
        }

        $logs = $query->get();

        $stats = [
            'total_logs' => $logs->count(),
            'total_hours' => round($logs->sum('hm_total'), 1),
            'active_units' => $logs->unique('code_unit')->count(),
        ];

        $pdf = Pdf::loadView('pdf.hour-meter-report', [
            'title' => 'Laporan Catatan Harian Hour Meter (HM) Alat Berat',
            'logs' => $logs,
            'stats' => $stats,
            'generatedAt' => now()->translatedFormat('d F Y - H:i:s'),
            'dateRange' => ($request->date_from ? Carbon::parse($request->date_from)->translatedFormat('d M Y') : 'Awal').' s/d '.($request->date_to ? Carbon::parse($request->date_to)->translatedFormat('d M Y') : 'Sekarang'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('Laporan_Hour_Meter_'.date('Ymd_His').'.pdf');
    }
}
