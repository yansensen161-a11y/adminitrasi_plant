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
    public function index(Request $request)
    {
        // Date range: default from August 1 of current year to today (show all HM history)
        $augustFirst = Carbon::createFromDate(Carbon::now()->year, 8, 1)->format('Y-m-d');
        $dateFrom = $request->filled('date_from') ? $request->date_from : $augustFirst;
        $dateTo = $request->filled('date_to') ? $request->date_to : Carbon::now()->format('Y-m-d');

        $codeUnitFilter = $request->input('code_unit', '');
        $shiftFilter = $request->input('shift', '');

        // Build log query — use raw DATE() to avoid Carbon cast issues
        $allLogs = HourMeterLog::query()
            ->whereDate('log_date', '>=', $dateFrom)
            ->whereDate('log_date', '<=', $dateTo)
            ->when($codeUnitFilter, fn ($q) => $q->where('code_unit', $codeUnitFilter))
            ->when($shiftFilter, fn ($q) => $q->where('shift', $shiftFilter))
            ->orderBy('log_date')
            ->get(['code_unit', 'log_date', 'hm_total', 'hm_end']);

        // Generate continuous array of dates from $dateFrom to $dateTo
        $dates = [];
        $currentDate = Carbon::parse($dateFrom);
        $endDate = Carbon::parse($dateTo);
        
        while ($currentDate->lte($endDate)) {
            $dates[] = $currentDate->format('Y-m-d');
            $currentDate->addDay();
        }

        // Build pivot: [code_unit][Y-m-d] = ['total' => hm_total, 'end' => hm_end]
        // Store both values; frontend will use 'total' for warnings and 'end' for display
        $pivot = [];
        foreach ($allLogs as $log) {
            $dateStr = $log->log_date instanceof Carbon
                ? $log->log_date->format('Y-m-d')
                : substr((string) $log->log_date, 0, 10);
            $pivot[$log->code_unit][$dateStr] = [
                'total' => (float) $log->hm_total,
                'end' => (float) $log->hm_end,
            ];
        }

        // Units ordered by no_urut
        $units = Unit::select('id', 'code_unit', 'model', 'hm', 'engine_make')
            ->orderByRaw('CASE WHEN no_urut IS NULL THEN 1 ELSE 0 END, no_urut ASC, code_unit ASC')
            ->when($codeUnitFilter, fn ($q) => $q->where('code_unit', $codeUnitFilter))
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'code_unit' => $u->code_unit,
                'model' => $u->model,
                'engine_make' => $u->engine_make,
                'hm' => (float) $u->hm,
            ])
            ->values()
            ->toArray();

        $normalCount = 0;
        $spikeCount = 0;
        $minusCount = 0;

        foreach ($allLogs as $log) {
            $val = (float) $log->hm_total;
            if ($val < 0) {
                $minusCount++;
            } elseif ($val > 23) {
                $spikeCount++;
            } else {
                $normalCount++;
            }
        }

        $stats = [
            'total_logs' => HourMeterLog::count(),
            'normal_logs' => $normalCount,
            'spike_logs' => $spikeCount,
            'minus_logs' => $minusCount,
        ];

        return Inertia::render('HourMeter/Index', [
            'pivot' => $pivot,
            'dates' => $dates,
            'units' => $units,
            'stats' => $stats,
            'filters' => [
                'code_unit' => $codeUnitFilter,
                'shift' => $shiftFilter,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create()
    {
        $units = Unit::select('id', 'code_unit', 'model', 'hm', 'location')->orderByRaw('CASE WHEN no_urut IS NULL THEN 1 ELSE 0 END, no_urut ASC, code_unit ASC')->get();

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
            // Update Unit current HM if log hm_end is greater
            if ($validated['hm_end'] > $unit->hm) {
                $unit->update(['hm' => $validated['hm_end']]);
            }
        }

        HourMeterLog::create($validated);

        return redirect()->route('hour-meters.index')->with('message', "Log Hour Meter unit [{$request->code_unit}] tanggal {$request->log_date} berhasil disimpan.");
    }

    public function edit(HourMeterLog $hourMeter)
    {
        $units = Unit::select('id', 'code_unit', 'model', 'hm', 'location')->orderByRaw('CASE WHEN no_urut IS NULL THEN 1 ELSE 0 END, no_urut ASC, code_unit ASC')->get();

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
            if ($validated['hm_end'] > $unit->hm) {
                $unit->update(['hm' => $validated['hm_end']]);
            }
        }

        $hourMeter->update($validated);

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

                // If single day number e.g. "10", "9", "08"
                if (is_numeric($str) && (int) $str >= 1 && (int) $str <= 31 && strlen($str) <= 2) {
                    $day = str_pad($str, 2, '0', STR_PAD_LEFT);
                    return "{$currentYear}-{$currentMonth}-{$day}";
                }

                // If Excel Date serial number
                if (is_numeric($str) && (float) $str > 30000 && (float) $str < 70000) {
                    try {
                        return ExcelDate::excelToDateTimeObject($str)->format('Y-m-d');
                    } catch (\Throwable) {}
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
                                $y = '20' . $y;
                            }
                            
                            // Return standard European d/m/Y (day/month/year)
                            if ((int)$d <= 31 && (int)$m <= 12) {
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

            for ($row = 2; $row <= $highestRow; $row++) {
                $rowData = [];
                $hasContent = false;

                for ($col = 1; $col <= $highestColumnIndex; $col++) {
                    $cell = $worksheet->getCell([$col, $row]);
                    $formattedVal = $cell->getFormattedValue();
                    $rawVal = $cell->getValue();

                    $finalVal = $formattedVal !== null && $formattedVal !== '' ? (string) $formattedVal : ($rawVal !== null ? (string) $rawVal : null);

                    if ($finalVal !== null && trim($finalVal) !== '') {
                        $hasContent = true;
                    }

                    $key = $headerMap[$col] ?? "col_{$col}";
                    $rowData[$key] = $finalVal;
                }

                if (! $hasContent) {
                    continue;
                }

                $getRaw = function (...$keys) use ($rowData) {
                    foreach ($keys as $k) {
                        $cleanedKey = strtolower(str_replace(['.', '/', '-', ' '], '_', $k));
                        if (isset($rowData[$cleanedKey]) && trim((string) $rowData[$cleanedKey]) !== '') {
                            return trim((string) $rowData[$cleanedKey]);
                        }
                    }

                    return null;
                };

                // Code Unit
                $codeUnit = $getRaw('code unit', 'code_unit', 'kode unit', 'kode_unit', 'unit', 'unit_code');
                if (empty($codeUnit) || strtolower($codeUnit) === 'code unit') {
                    continue;
                }

                // Date (Vertical Date)
                $rawDate = $getRaw('date_tanggal', 'date', 'tanggal', 'tgl', 'date_vertikal', 'date_vertical', 'tgl_operasional', 'day', 'hari');
                $logDate = $parseDate($rawDate);

                if (!$logDate) {
                    continue; // Skip if date is invalid or empty
                }

                // Start HM
                $rawStart = $getRaw('hm awal', 'hm_awal', 'start hm', 'start_hm', 'hm start', 'hm_start', 'initial hm');
                $hmStart = is_numeric(str_replace(',', '.', (string) $rawStart)) ? (float) str_replace(',', '.', (string) $rawStart) : 0;

                // End HM
                $rawEnd = $getRaw('hm akhir', 'hm_akhir', 'end hm', 'end_hm', 'hm end', 'hm_end', 'final hm', 'hm terkini', 'hm');
                $hmEnd = is_numeric(str_replace(',', '.', (string) $rawEnd)) ? (float) str_replace(',', '.', (string) $rawEnd) : $hmStart;

                // Total HM / Operating Hours
                $rawTotal = $getRaw('hm_total_operasi', 'hm_total_operasi', 'hm total', 'hm_total', 'total hm', 'total_hm', 'hm operasi', 'hm_operasi', 'daily hm', 'jam kerja');
                $hmTotal = is_numeric(str_replace(',', '.', (string) $rawTotal)) ? (float) str_replace(',', '.', (string) $rawTotal) : max(0, round($hmEnd - $hmStart, 1));

                $shift = $getRaw('shift', 'giliran', 'waktu');

                $unit = Unit::where('code_unit', $codeUnit)->first();
                $unitId = $unit?->id;

                if (!$unitId) {
                    continue; // Skip if unit is not registered in the database
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

                // Sync latest HM to unit master
                if ($unit && $hmEnd > $unit->hm) {
                    $unit->update(['hm' => $hmEnd]);
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
