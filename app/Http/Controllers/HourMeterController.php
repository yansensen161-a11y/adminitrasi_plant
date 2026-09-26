<?php

namespace App\Http\Controllers;

use App\Models\HourMeterLog;
use App\Models\Unit;
use App\Services\HMUpdateService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
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
            'MD045', 'MD046', 'MD047', 'MD048', 'MG018', 'MG019', 'MG020', 'MG021', 'MDT006', 'MDT009', 'MDT012',
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

        // Ambil log mulai H-1 dari dateFrom agar selisih hari pertama terhadap hari sebelumnya ("dari kemarin") dapat dihitung
        $fetchDateFrom = Carbon::parse($dateFrom)->subDay()->format('Y-m-d');

        $logs = HourMeterLog::whereIn('unit_id', $unitIds)
            ->where('log_date', '>=', $fetchDateFrom)
            ->where('log_date', '<=', $dateTo)
            ->orderBy('log_date', 'asc')
            ->orderBy('hm_end', 'asc')
            ->orderBy('id', 'asc')
            ->select([
                'id',
                'unit_id',
                'code_unit',
                'log_date',
                'hm_start',
                'hm_end',
                'hm_total',
                'shift',
                'operator_name',
                'location',
                'remarks',
            ])
            ->get();

        $groupedLogs = [];
        foreach ($logs as $log) {
            $dateStr = substr((string) $log->log_date, 0, 10);
            $groupedLogs[$log->unit_id][$dateStr] = (object) [
                'id' => $log->id,
                'unit_id' => $log->unit_id,
                'code_unit' => $log->code_unit,
                'log_date' => $dateStr,
                'hm_start' => (float) $log->hm_start,
                'hm_end' => (float) $log->hm_end,
                'hm_total' => $log->hm_total !== null ? (float) $log->hm_total : null,
                'shift' => $log->shift,
                'operator_name' => $log->operator_name,
                'location' => $log->location,
                'remarks' => $log->remarks,
            ];
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
                $hasMatch = false;
                $isLv = in_array(strtoupper(trim((string) $unit->type_unit)), ['LIGHT VEHICLE', 'LV']);

                if ($isLv && in_array($hmErrorFilter, ['over_24', 'minus', 'all_errors'])) {
                    continue; // Unit Light Vehicle dikecualikan dari filter anomali over 24 / minus
                }

                if ($hmErrorFilter === 'belum_terisi') {
                    foreach ($dates as $date) {
                        if (! isset($groupedLogs[$unit->id][$date])) {
                            $hasMatch = true;
                            break;
                        }
                    }
                } elseif ($hmErrorFilter === 'over_24') {
                    foreach ($dates as $date) {
                        $log = $groupedLogs[$unit->id][$date] ?? null;
                        if ($log) {
                            $yesterdayDate = Carbon::parse($date)->subDay()->format('Y-m-d');
                            $prevLog = $groupedLogs[$unit->id][$yesterdayDate] ?? null;
                            $diff = null;
                            if ($prevLog) {
                                $diff = (float) $log->hm_end - (float) $prevLog->hm_end;
                            } elseif ((float) $log->hm_start > 0) {
                                $diff = (float) $log->hm_end - (float) $log->hm_start;
                            } elseif ($log->hm_total !== null) {
                                $diff = (float) $log->hm_total;
                            }

                            if (($diff !== null && $diff > 24) || (float) $log->hm_total > 24) {
                                $hasMatch = true;
                                break;
                            }
                        }
                    }
                } elseif ($hmErrorFilter === 'minus') {
                    foreach ($dates as $date) {
                        $log = $groupedLogs[$unit->id][$date] ?? null;
                        if ($log) {
                            $yesterdayDate = Carbon::parse($date)->subDay()->format('Y-m-d');
                            $prevLog = $groupedLogs[$unit->id][$yesterdayDate] ?? null;
                            $diff = null;
                            if ($prevLog) {
                                $diff = (float) $log->hm_end - (float) $prevLog->hm_end;
                            } elseif ((float) $log->hm_start > 0) {
                                $diff = (float) $log->hm_end - (float) $log->hm_start;
                            } elseif ($log->hm_total !== null) {
                                $diff = (float) $log->hm_total;
                            }

                            if (($diff !== null && $diff < 0) || (float) $log->hm_total < 0) {
                                $hasMatch = true;
                                break;
                            }
                        }
                    }
                } elseif ($hmErrorFilter === 'all_errors') {
                    foreach ($dates as $date) {
                        $log = $groupedLogs[$unit->id][$date] ?? null;
                        if ($log) {
                            $yesterdayDate = Carbon::parse($date)->subDay()->format('Y-m-d');
                            $prevLog = $groupedLogs[$unit->id][$yesterdayDate] ?? null;
                            $diff = null;
                            if ($prevLog) {
                                $diff = (float) $log->hm_end - (float) $prevLog->hm_end;
                            } elseif ((float) $log->hm_start > 0) {
                                $diff = (float) $log->hm_end - (float) $log->hm_start;
                            } elseif ($log->hm_total !== null) {
                                $diff = (float) $log->hm_total;
                            }

                            if (($diff !== null && ($diff > 24 || $diff < 0)) || (float) $log->hm_total > 24 || (float) $log->hm_total < 0) {
                                $hasMatch = true;
                                break;
                            }
                        }
                    }
                }

                if ($hasMatch) {
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

        if (! $unitId) {
            return response()->json(['hm' => null]);
        }

        $logQuery = HourMeterLog::where('unit_id', $unitId);

        if ($date) {
            $logQuery->where('log_date', $date);
        }

        $log = $logQuery->orderBy('log_date', 'desc')->first();

        if ($log) {
            return response()->json(['hm' => $log->hm_end]);
        }

        // Fallback to unit's master hm if log not found
        $unit = Unit::find($unitId);

        return response()->json(['hm' => $unit ? $unit->hm : null]);
    }

    public function create()
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menambah hour meter.');

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
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menyimpan hour meter.');

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
            HMUpdateService::processHmUpdate($unit, $validated['hm_end'], $validated['log_date']);
        }

        return redirect()->route('hour-meters.index')->with('message', "Log Hour Meter unit [{$request->code_unit}] tanggal {$request->log_date} berhasil disimpan.");
    }

    public function edit(HourMeterLog $hourMeter)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengubah hour meter.');

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
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengubah hour meter.');

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

        if ($unit) {
            if ($validated['hm_end'] > $unit->hm) {
                HMUpdateService::processHmUpdate($unit, $validated['hm_end'], $validated['log_date']);
            } else {
                HMUpdateService::syncUnitFromLatestLog($unit);
            }
        }

        return redirect()->route('hour-meters.index')->with('message', "Log Hour Meter unit [{$hourMeter->code_unit}] berhasil diperbarui.");
    }

    public function quickSave(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menyimpan hour meter.');

        $validated = $request->validate([
            'log_id' => 'nullable|string',
            'unit_id' => 'nullable|string',
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

        $unit = null;
        if (! empty($validated['unit_id'])) {
            $unit = Unit::find($validated['unit_id']);
        }
        if (! $unit && ! empty($validated['code_unit'])) {
            $unit = Unit::where('code_unit', $validated['code_unit'])->first();
        }
        if ($unit) {
            $validated['unit_id'] = $unit->id;
        }

        $log = null;
        if (! empty($validated['log_id'])) {
            $log = HourMeterLog::find($validated['log_id']);
        }

        if (! $log) {
            $query = HourMeterLog::query()->where('log_date', $validated['log_date']);
            if ($unit) {
                $query->where('unit_id', $unit->id);
            } else {
                $query->where('code_unit', $validated['code_unit']);
            }
            $log = $query->orderBy('hm_end', 'desc')->first();
        }

        if ($log) {
            $log->update($validated);
        } else {
            $log = HourMeterLog::create($validated);
        }

        // Clean up any remaining duplicate or conflicting records for this unit on this date so they do not overwrite this edit
        if ($unit && $log) {
            HourMeterLog::where('unit_id', $unit->id)
                ->where('log_date', $validated['log_date'])
                ->where('id', '!=', $log->id)
                ->where(function ($q) use ($validated) {
                    if (! empty($validated['shift'])) {
                        $q->where('shift', $validated['shift']);
                    }
                })
                ->delete();
        }

        if ($unit) {
            if ($validated['hm_end'] > $unit->hm) {
                HMUpdateService::processHmUpdate($unit, $validated['hm_end'], $validated['log_date']);
            } else {
                HMUpdateService::syncUnitFromLatestLog($unit);
            }
        }

        $formattedDate = Carbon::parse($validated['log_date'])->translatedFormat('d M Y');
        $msg = "HM unit [{$validated['code_unit']}] tanggal {$formattedDate} berhasil diperbarui menjadi {$validated['hm_end']}.";

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $msg,
                'log' => $log,
            ]);
        }

        return redirect()->back()->with('message', $msg);
    }

    public function destroy(HourMeterLog $hourMeter)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menghapus hour meter.');

        $unitId = $hourMeter->unit_id;
        $code = $hourMeter->code_unit;
        $date = $hourMeter->log_date;
        $hourMeter->delete();

        $unit = $unitId ? Unit::find($unitId) : Unit::where('code_unit', $code)->first();
        if ($unit) {
            HMUpdateService::syncUnitFromLatestLog($unit);
        }

        return redirect()->route('hour-meters.index')->with('message', "Log Hour Meter [{$code}] tanggal {$date} berhasil dihapus.");
    }

    public function deleteAll()
    {
        if (! auth()->user()?->hasAnyRole(['super-admin', 'admin'])) {
            abort(403, 'Akses ditolak: Hanya administrator yang diizinkan menghapus semua log Hour Meter.');
        }

        HourMeterLog::query()->delete();

        return redirect()->route('hour-meters.index')->with('message', 'Semua data log Hour Meter berhasil dihapus.');
    }

    public function import(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengimpor hour meter.');

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

            $unitsMap = Unit::all()->keyBy(function ($u) {
                return strtoupper(trim((string) $u->code_unit));
            });
            $validUnits = $unitsMap->keys()->toArray();

            $emptyRowsCount = 0;

            for ($row = 1; $row <= $highestRow; $row++) {
                $rowDataRaw = [];
                for ($col = 1; $col <= $highestColumnIndex; $col++) {
                    $cell = $worksheet->getCell([$col, $row]);

                    if (Date::isDateTime($cell) && is_numeric($cell->getValue())) {
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
                    $emptyRowsCount++;
                    if ($emptyRowsCount > 20) {
                        break; // Stop if there are too many empty consecutive rows
                    }

                    continue;
                }
                $emptyRowsCount = 0;

                $logDate = null;
                $shift = null;
                $codeUnit = null;
                $numbers = [];

                foreach ($rowDataRaw as $cellStr) {
                    // Detect Date
                    if (! $logDate) {
                        $d = $parseDate($cellStr);
                        if ($d) {
                            $logDate = $d;
                            $upperCell = strtoupper($cellStr);
                            if (str_contains($upperCell, ' NS')) {
                                $shift = 'NS';
                            }
                            if (str_contains($upperCell, ' DS')) {
                                $shift = 'DS';
                            }

                            continue;
                        }
                    }

                    // Detect Unit Code
                    if (! $codeUnit) {
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
                if (! $shift) {
                    foreach ($rowDataRaw as $cellStr) {
                        $upperCell = strtoupper($cellStr);
                        if ($upperCell === 'NS' || $upperCell === 'DS') {
                            $shift = $upperCell;
                            break;
                        }
                    }
                }

                if (! $logDate || ! $codeUnit || count($numbers) < 1) {
                    continue; // Skip invalid rows (like headers)
                }

                $hmStart = $numbers[0];
                $hmEnd = isset($numbers[1]) ? $numbers[1] : $hmStart;
                $hmTotal = isset($numbers[2]) ? $numbers[2] : max(0, round($hmEnd - $hmStart, 1));

                $unit = $unitsMap->get($codeUnit);
                $unitId = $unit?->id;

                if (! $unitId) {
                    continue;
                }

                HourMeterLog::updateOrCreate(
                    [
                        'unit_id' => $unitId,
                        'log_date' => $logDate,
                        'shift' => $shift,
                    ],
                    [
                        'code_unit' => $codeUnit,
                        'hm_start' => $hmStart,
                        'hm_end' => $hmEnd,
                        'hm_total' => $hmTotal,
                    ]
                );

                if ($unit && $hmEnd > $unit->hm) {
                    HMUpdateService::processHmUpdate($unit, $hmEnd, $logDate);
                }

                $importedCount++;
            }

            // Synchronize all units to their latest hour meter log
            HMUpdateService::syncAllUnits();

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

    public function exportExcel(Request $request): StreamedResponse
    {
        ini_set('memory_limit', '512M');
        set_time_limit(300);

        $scope = $request->input('scope', 'all');
        $codeUnitFilter = $request->input('code_unit', '');
        $typeUnitFilter = $request->input('type_unit', '');
        $locationFilter = $request->input('location', '');
        $statusFilter = $request->input('status', '');
        $dateFrom = $request->input('date_from', '');
        $dateTo = $request->input('date_to', '');
        $hmErrorFilter = $request->input('hm_error', '');

        // Menentukan apakah ekspor semua atau berdasarkan filter
        $isAll = ($scope === 'all') || (! $dateFrom && ! $dateTo && ! $codeUnitFilter && ! $typeUnitFilter && ! $locationFilter && ! $statusFilter && ! $hmErrorFilter);

        $hmUnits = $this->getHmUnits();

        // 1. Ambil data armada Unit
        $unitsQuery = Unit::query();
        if ($isAll) {
            $unitsQuery->where(function ($q) use ($hmUnits) {
                $q->whereIn('code_unit', $hmUnits)
                    ->orWhereHas('hourMeterLogs');
            });
        } else {
            $unitsQuery->whereIn('code_unit', $hmUnits);
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
        }
        $units = $unitsQuery->orderBy('code_unit', 'asc')->get();
        $unitIds = $units->pluck('id');

        // 2. Ambil data HourMeterLog
        $logsQuery = HourMeterLog::query()
            ->with('unit')
            ->orderBy('log_date', 'asc')
            ->orderBy('code_unit', 'asc')
            ->orderBy('shift', 'asc');

        if ($isAll) {
            if ($unitIds->isNotEmpty()) {
                $logsQuery->whereIn('unit_id', $unitIds);
            }
        } else {
            $logsQuery->whereIn('unit_id', $unitIds);
            if ($dateFrom) {
                $logsQuery->where('log_date', '>=', $dateFrom);
            }
            if ($dateTo) {
                $logsQuery->where('log_date', '<=', $dateTo);
            }
        }
        $logs = $logsQuery->get();

        // Mapping log per unit dan tanggal
        $groupedLogs = [];
        $logsByUnit = [];
        foreach ($logs as $log) {
            $dateStr = substr((string) $log->log_date, 0, 10);
            $groupedLogs[$log->unit_id][$dateStr] = $log;
            $logsByUnit[$log->unit_id][] = $log;
        }

        // Tentukan rentang tanggal untuk Sheet 1 (Matrix)
        if ($isAll) {
            $distinctDates = $logs->pluck('log_date')
                ->map(fn ($d) => substr((string) $d, 0, 10))
                ->filter()
                ->unique()
                ->sort()
                ->values()
                ->all();
            $dates = ! empty($distinctDates) ? $distinctDates : [Carbon::now()->format('Y-m-d')];
        } else {
            if (! $dateFrom) {
                $dateFrom = Carbon::now()->subDays(9)->format('Y-m-d');
            }
            if (! $dateTo) {
                $dateTo = Carbon::now()->format('Y-m-d');
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
        }

        // Terapkan filter hm_error jika dalam mode filter
        if (! $isAll && $hmErrorFilter) {
            $filteredUnits = [];
            foreach ($units as $unit) {
                $hasMatch = false;
                $isLv = in_array(strtoupper(trim((string) $unit->type_unit)), ['LIGHT VEHICLE', 'LV']);

                if ($isLv && in_array($hmErrorFilter, ['over_24', 'minus', 'all_errors'])) {
                    continue;
                }

                if ($hmErrorFilter === 'belum_terisi') {
                    foreach ($dates as $date) {
                        if (! isset($groupedLogs[$unit->id][$date])) {
                            $hasMatch = true;
                            break;
                        }
                    }
                } elseif ($hmErrorFilter === 'over_24') {
                    foreach ($dates as $date) {
                        $log = $groupedLogs[$unit->id][$date] ?? null;
                        if ($log) {
                            $yesterdayDate = Carbon::parse($date)->subDay()->format('Y-m-d');
                            $prevLog = $groupedLogs[$unit->id][$yesterdayDate] ?? null;
                            $diff = null;
                            if ($prevLog) {
                                $diff = (float) $log->hm_end - (float) $prevLog->hm_end;
                            } elseif ((float) $log->hm_start > 0) {
                                $diff = (float) $log->hm_end - (float) $log->hm_start;
                            } elseif ($log->hm_total !== null) {
                                $diff = (float) $log->hm_total;
                            }

                            if (($diff !== null && $diff > 24) || (float) $log->hm_total > 24) {
                                $hasMatch = true;
                                break;
                            }
                        }
                    }
                } elseif ($hmErrorFilter === 'minus') {
                    foreach ($dates as $date) {
                        $log = $groupedLogs[$unit->id][$date] ?? null;
                        if ($log) {
                            $yesterdayDate = Carbon::parse($date)->subDay()->format('Y-m-d');
                            $prevLog = $groupedLogs[$unit->id][$yesterdayDate] ?? null;
                            $diff = null;
                            if ($prevLog) {
                                $diff = (float) $log->hm_end - (float) $prevLog->hm_end;
                            } elseif ((float) $log->hm_start > 0) {
                                $diff = (float) $log->hm_end - (float) $log->hm_start;
                            } elseif ($log->hm_total !== null) {
                                $diff = (float) $log->hm_total;
                            }

                            if (($diff !== null && $diff < 0) || (float) $log->hm_total < 0) {
                                $hasMatch = true;
                                break;
                            }
                        }
                    }
                } elseif ($hmErrorFilter === 'all_errors') {
                    foreach ($dates as $date) {
                        $log = $groupedLogs[$unit->id][$date] ?? null;
                        if ($log) {
                            $yesterdayDate = Carbon::parse($date)->subDay()->format('Y-m-d');
                            $prevLog = $groupedLogs[$unit->id][$yesterdayDate] ?? null;
                            $diff = null;
                            if ($prevLog) {
                                $diff = (float) $log->hm_end - (float) $prevLog->hm_end;
                            } elseif ((float) $log->hm_start > 0) {
                                $diff = (float) $log->hm_end - (float) $log->hm_start;
                            } elseif ($log->hm_total !== null) {
                                $diff = (float) $log->hm_total;
                            }

                            if (($diff !== null && ($diff > 24 || $diff < 0)) || (float) $log->hm_total > 24 || (float) $log->hm_total < 0) {
                                $hasMatch = true;
                                break;
                            }
                        }
                    }
                }

                if ($hasMatch) {
                    $filteredUnits[] = $unit;
                }
            }
            $units = collect($filteredUnits)->values();
        }

        $spreadsheet = new Spreadsheet;

        // ══════════════════════════════════════════════════════════════════════
        // SHEET 1: Matrix HM Harian
        // ══════════════════════════════════════════════════════════════════════
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Matrix HM Harian');
        $sheet1->setShowGridLines(true);

        $dateCount = count($dates);
        $totalColumnsCount = 6 + $dateCount + 2;
        $lastColLetter = Coordinate::stringFromColumnIndex($totalColumnsCount);

        // Header Title (Row 1)
        $sheet1->mergeCells("A1:{$lastColLetter}1");
        $sheet1->setCellValue('A1', 'MONITORING HOUR METER (HM) HARIAN ALAT BERAT');
        $sheet1->getStyle('A1')->getFont()->setBold(true)->setSize(13)->getColor()->setRGB('FFFFFF');
        $sheet1->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('065F46');
        $sheet1->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet1->getRowDimension(1)->setRowHeight(30);

        // Subtitle Info (Row 2)
        $sheet1->mergeCells("A2:{$lastColLetter}2");
        $dateRangeText = ! empty($dates) ? (Carbon::parse(reset($dates))->format('d/m/Y').' s/d '.Carbon::parse(end($dates))->format('d/m/Y')) : '-';
        $scopeText = $isAll ? 'Semua Data Historis' : 'Data Sesuai Filter';
        $subtitle = "Tipe Unduhan: {$scopeText} | Periode: {$dateRangeText} | Total Armada: {$units->count()} Unit | Diunduh: ".now()->translatedFormat('d F Y H:i');
        $sheet1->setCellValue('A2', $subtitle);
        $sheet1->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->getColor()->setRGB('047857');
        $sheet1->getStyle('A2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('ECFDF5');
        $sheet1->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet1->getRowDimension(2)->setRowHeight(20);

        // Blank Row (Row 3)
        $sheet1->getRowDimension(3)->setRowHeight(8);

        // Table Column Headers (Row 4)
        $headers1 = ['No', 'Kode Unit', 'Model', 'Tipe Unit', 'Lokasi', 'Status'];
        foreach ($dates as $d) {
            $headers1[] = Carbon::parse($d)->format('d/m');
        }
        $headers1[] = 'Total Jam Operasi';
        $headers1[] = 'HM Terakhir';

        $sheet1->fromArray([$headers1], null, 'A4');
        $sheet1->getStyle("A4:{$lastColLetter}4")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '10B981']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '059669'],
                ],
            ],
        ]);
        $sheet1->getRowDimension(4)->setRowHeight(28);

        // Populate Matrix Data Rows
        $matrixRows = [];
        foreach ($units as $idx => $unit) {
            $row = [
                $idx + 1,
                $unit->code_unit,
                $unit->model ?: '-',
                $unit->type_unit ?: '-',
                $unit->location ?: '-',
                $unit->status ?: 'Running',
            ];

            $unitTotalHours = 0.0;
            $latestHmInPeriod = null;

            foreach ($dates as $date) {
                $log = $groupedLogs[$unit->id][$date] ?? null;
                if ($log) {
                    $row[] = (float) $log->hm_end;
                    if ($log->hm_total !== null && (float) $log->hm_total > 0) {
                        $unitTotalHours += (float) $log->hm_total;
                    }
                    $latestHmInPeriod = (float) $log->hm_end;
                } else {
                    $row[] = '-';
                }
            }

            $row[] = round($unitTotalHours, 1);
            $row[] = $latestHmInPeriod !== null ? $latestHmInPeriod : (float) ($unit->hm ?? 0);
            $matrixRows[] = $row;
        }

        if (! empty($matrixRows)) {
            $sheet1->fromArray($matrixRows, null, 'A5');
            $lastRow = 4 + count($matrixRows);

            $sheet1->getStyle("A5:{$lastColLetter}{$lastRow}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'E5E7EB'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);

            $sheet1->getStyle("A5:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet1->getStyle("B5:B{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet1->getStyle("F5:F{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        $sheet1->getColumnDimension('A')->setWidth(6);
        $sheet1->getColumnDimension('B')->setWidth(14);
        $sheet1->getColumnDimension('C')->setWidth(18);
        $sheet1->getColumnDimension('D')->setWidth(18);
        $sheet1->getColumnDimension('E')->setWidth(16);
        $sheet1->getColumnDimension('F')->setWidth(14);
        for ($colIdx = 7; $colIdx <= 6 + $dateCount; $colIdx++) {
            $colLetter = Coordinate::stringFromColumnIndex($colIdx);
            $sheet1->getColumnDimension($colLetter)->setWidth(11);
        }
        $totalHoursColLetter = Coordinate::stringFromColumnIndex(7 + $dateCount);
        $latestHmColLetter = Coordinate::stringFromColumnIndex(8 + $dateCount);
        $sheet1->getColumnDimension($totalHoursColLetter)->setWidth(18);
        $sheet1->getColumnDimension($latestHmColLetter)->setWidth(16);

        // ══════════════════════════════════════════════════════════════════════
        // SHEET 2: Detail Log HM Lengkap
        // ══════════════════════════════════════════════════════════════════════
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Detail Log HM');
        $sheet2->setShowGridLines(true);

        $sheet2->mergeCells('A1:M1');
        $sheet2->setCellValue('A1', 'DATA DETAIL LOG HOUR METER (HM) LENGKAP');
        $sheet2->getStyle('A1')->getFont()->setBold(true)->setSize(13)->getColor()->setRGB('FFFFFF');
        $sheet2->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('065F46');
        $sheet2->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet2->getRowDimension(1)->setRowHeight(30);

        $sheet2->mergeCells('A2:M2');
        $sheet2->setCellValue('A2', "Total Rekaman: {$logs->count()} Baris Log | Tanggal Ekspor: ".now()->translatedFormat('d F Y H:i:s'));
        $sheet2->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->getColor()->setRGB('047857');
        $sheet2->getStyle('A2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('ECFDF5');
        $sheet2->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet2->getRowDimension(2)->setRowHeight(20);

        $sheet2->getRowDimension(3)->setRowHeight(8);

        $headers2 = [
            'No', 'Tanggal', 'Shift', 'Kode Unit', 'Model', 'Tipe Unit',
            'HM Awal', 'HM Akhir', 'Total Jam Kerja', 'Operator', 'Lokasi', 'Status Unit', 'Catatan / Remarks',
        ];
        $sheet2->fromArray([$headers2], null, 'A4');
        $sheet2->getStyle('A4:M4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '065F46'],
                ],
            ],
        ]);
        $sheet2->getRowDimension(4)->setRowHeight(26);

        $detailRows = [];
        foreach ($logs as $idx => $log) {
            $unit = $log->unit;
            $detailRows[] = [
                $idx + 1,
                $log->log_date ? Carbon::parse($log->log_date)->format('d/m/Y') : '-',
                $log->shift ?: 'DS',
                $log->code_unit,
                $unit?->model ?: '-',
                $unit?->type_unit ?: '-',
                $log->hm_start !== null ? (float) $log->hm_start : 0.0,
                $log->hm_end !== null ? (float) $log->hm_end : 0.0,
                $log->hm_total !== null ? (float) $log->hm_total : 0.0,
                $log->operator_name ?: '-',
                $log->location ?: ($unit?->location ?: '-'),
                $unit?->status ?: 'Running',
                $log->remarks ?: '-',
            ];
        }

        if (! empty($detailRows)) {
            $sheet2->fromArray($detailRows, null, 'A5');
            $lastRow2 = 4 + count($detailRows);

            $sheet2->getStyle("A5:M{$lastRow2}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'E5E7EB'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);

            $sheet2->getStyle("A5:D{$lastRow2}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet2->getStyle("G5:I{$lastRow2}")->getNumberFormat()->setFormatCode('#,##0.0');
        }

        foreach (['A' => 6, 'B' => 14, 'C' => 8, 'D' => 14, 'E' => 18, 'F' => 18, 'G' => 13, 'H' => 13, 'I' => 16, 'J' => 18, 'K' => 16, 'L' => 14, 'M' => 25] as $col => $w) {
            $sheet2->getColumnDimension($col)->setWidth($w);
        }

        // ══════════════════════════════════════════════════════════════════════
        // SHEET 3: Ringkasan Per Unit
        // ══════════════════════════════════════════════════════════════════════
        $sheet3 = $spreadsheet->createSheet();
        $sheet3->setTitle('Ringkasan Per Unit');
        $sheet3->setShowGridLines(true);

        $sheet3->mergeCells('A1:K1');
        $sheet3->setCellValue('A1', 'RINGKASAN UTILISASI & PERFORMA ARMADA UNIT');
        $sheet3->getStyle('A1')->getFont()->setBold(true)->setSize(13)->getColor()->setRGB('FFFFFF');
        $sheet3->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('065F46');
        $sheet3->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet3->getRowDimension(1)->setRowHeight(30);

        $sheet3->mergeCells('A2:K2');
        $sheet3->setCellValue('A2', "Total Armada: {$units->count()} Unit | Diunduh: ".now()->translatedFormat('d F Y H:i:s'));
        $sheet3->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->getColor()->setRGB('047857');
        $sheet3->getStyle('A2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('ECFDF5');
        $sheet3->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet3->getRowDimension(2)->setRowHeight(20);

        $sheet3->getRowDimension(3)->setRowHeight(8);

        $headers3 = [
            'No', 'Kode Unit', 'Model', 'Tipe Unit', 'Lokasi', 'Status Unit',
            'Total Log', 'HM Terendah', 'HM Tertinggi', 'Akumulasi Jam Kerja', 'Rata-rata HM/Log',
        ];
        $sheet3->fromArray([$headers3], null, 'A4');
        $sheet3->getStyle('A4:K4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '059669']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '047857'],
                ],
            ],
        ]);
        $sheet3->getRowDimension(4)->setRowHeight(26);

        $summaryRows = [];
        foreach ($units as $idx => $unit) {
            $uLogs = $logsByUnit[$unit->id] ?? [];
            $logCount = count($uLogs);

            $minHm = $logCount > 0 ? min(array_map(fn ($l) => (float) ($l->hm_start > 0 ? $l->hm_start : $l->hm_end), $uLogs)) : (float) ($unit->hm ?? 0);
            $maxHm = $logCount > 0 ? max(array_map(fn ($l) => (float) $l->hm_end, $uLogs)) : (float) ($unit->hm ?? 0);
            $totalHmWorked = $logCount > 0 ? array_sum(array_map(fn ($l) => (float) ($l->hm_total ?: 0), $uLogs)) : 0.0;
            $avgHm = $logCount > 0 ? round($totalHmWorked / $logCount, 1) : 0.0;

            $summaryRows[] = [
                $idx + 1,
                $unit->code_unit,
                $unit->model ?: '-',
                $unit->type_unit ?: '-',
                $unit->location ?: '-',
                $unit->status ?: 'Running',
                $logCount,
                round($minHm, 1),
                round($maxHm, 1),
                round($totalHmWorked, 1),
                $avgHm,
            ];
        }

        if (! empty($summaryRows)) {
            $sheet3->fromArray($summaryRows, null, 'A5');
            $lastRow3 = 4 + count($summaryRows);

            $sheet3->getStyle("A5:K{$lastRow3}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'E5E7EB'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);

            $sheet3->getStyle("A5:B{$lastRow3}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet3->getStyle("F5:G{$lastRow3}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet3->getStyle("H5:K{$lastRow3}")->getNumberFormat()->setFormatCode('#,##0.0');
        }

        foreach (['A' => 6, 'B' => 14, 'C' => 18, 'D' => 18, 'E' => 16, 'F' => 14, 'G' => 12, 'H' => 14, 'I' => 14, 'J' => 18, 'K' => 16] as $col => $w) {
            $sheet3->getColumnDimension($col)->setWidth($w);
        }

        $spreadsheet->setActiveSheetIndex(0);

        $writer = new Xlsx($spreadsheet);
        $fileName = $isAll
            ? 'Data_Hour_Meter_Semua_'.date('Ymd_His').'.xlsx'
            : 'Data_Hour_Meter_'.($dateFrom ?: 'Awal').'_sd_'.($dateTo ?: 'Akhir').'_'.date('His').'.xlsx';

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
            $query->where('log_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('log_date', '<=', $request->date_to);
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
