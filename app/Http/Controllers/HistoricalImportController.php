<?php

namespace App\Http\Controllers;

use App\Models\ServiceLog;
use App\Models\Unit;
use App\Models\WorkOrder;
use App\Services\WorkOrderService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class HistoricalImportController extends Controller
{
    public function index()
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak.');

        return Inertia::render('HistoricalImport/Index');
    }

    public function downloadTemplate($type)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak.');

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        if ($type === 'BREAKDOWN') {
            $sheet->setTitle('Template Historical Breakdown');
            $headers = ['Tanggal', 'Code Unit', 'HM Unit', 'Problem', 'Jam Breakdown', 'Jam Ready', 'Status WO', 'Downtime Code', 'Corrective Action'];
            $sheet->fromArray([$headers], null, 'A1');
            $sheet->fromArray([
                [date('Y-m-d'), 'EX-201', '10500', 'Engine Overheat', '08:30', '11:00', 'COMPLETED', 'UNP', 'Ganti selang radiator'],
            ], null, 'A2');
        } else {
            $sheet->setTitle('Template Historical Schedule');
            $headers = ['Tanggal Plan', 'Code Unit', 'HM Unit', 'Type Service', 'Status WO', 'Downtime Code', 'Remark'];
            $sheet->fromArray([$headers], null, 'A1');
            $sheet->fromArray([
                [date('Y-m-d'), 'DT-101', '5000', 'Service 500H', 'COMPLETED', 'SCH', 'Selesai tepat waktu'],
            ], null, 'A2');
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'Template_Historical_'.ucfirst(strtolower($type)).'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename);
    }

    public function preview(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak.');

        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv|max:20480',
            'type' => 'required|in:BREAKDOWN,SCHEDULE',
        ]);

        $file = $request->file('file');
        $filename = Str::random(40).'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('temp_imports', $filename);

        // Read data using Excel::toArray (returns array of sheets)
        $data = Excel::toArray(new \stdClass, storage_path('app/'.$path));

        if (empty($data) || empty($data[0])) {
            return back()->with('error', 'File Excel kosong atau tidak valid.');
        }

        $sheet = $data[0];

        // Remove empty rows
        $sheet = array_filter($sheet, function ($row) {
            return count(array_filter($row)) > 0;
        });

        if (count($sheet) < 2) {
            return back()->with('error', 'Data tidak ditemukan atau hanya berisi header.');
        }

        // Extract headers from first row
        $headers = array_shift($sheet);
        // Normalize headers
        $headers = array_map(function ($h) {
            return trim(strtolower($h));
        }, $headers);

        // Take top 20 rows for preview
        $previewData = array_slice($sheet, 0, 20);

        return Inertia::render('HistoricalImport/Mapping', [
            'type' => $request->type,
            'filename' => $filename,
            'headers' => $headers,
            'previewData' => $previewData,
        ]);
    }

    public function process(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak.');

        $request->validate([
            'filename' => 'required|string',
            'type' => 'required|in:BREAKDOWN,SCHEDULE',
            'mapping' => 'required|array',
        ]);

        $filename = $request->filename;
        $type = $request->type;
        $mapping = $request->mapping;

        $path = storage_path('app/temp_imports/'.$filename);
        if (! file_exists($path)) {
            return redirect()->route('import-historical.index')->with('error', 'File import sudah kadaluarsa atau hilang. Silakan upload ulang.');
        }

        $data = Excel::toArray(new \stdClass, $path);
        $sheet = $data[0] ?? [];
        $headers = array_shift($sheet);
        $headers = array_map(function ($h) {
            return trim(strtolower($h));
        }, $headers);

        $totalRow = 0;
        $success = 0;
        $duplicate = 0;
        $errors = [];
        $errorRows = [];

        // Required mapping checks
        $requiredKeys = ['date', 'unit'];
        foreach ($requiredKeys as $rk) {
            if (! isset($mapping[$rk]) || $mapping[$rk] === '') {
                return back()->with('error', 'Mapping untuk field wajib (Tanggal & Unit) harus diisi.');
            }
        }

        // Cache units to reduce DB queries
        $unitCache = Unit::pluck('id', 'code_unit')->toArray();

        // Process rows
        foreach ($sheet as $index => $row) {
            if (count(array_filter($row)) == 0) {
                continue;
            }
            $totalRow++;

            $rowData = [];
            foreach ($headers as $colIndex => $header) {
                $rowData[$header] = $row[$colIndex] ?? null;
            }

            try {
                // 1. Get mapped values
                $dateCol = $mapping['date'] ?? null;
                $unitCol = $mapping['unit'] ?? null;
                $hmCol = $mapping['hm'] ?? null;
                $problemCol = $mapping['problem'] ?? null;
                $downtimeCol = $mapping['downtime_code'] ?? null;
                $jamBCol = $mapping['jam_breakdown'] ?? null;
                $jamRCol = $mapping['jam_ready'] ?? null;
                $statusCol = $mapping['status'] ?? null;
                $actionCol = $mapping['corrective_action'] ?? null;

                $rawDate = $dateCol ? ($rowData[$dateCol] ?? null) : null;
                $rawUnit = $unitCol ? ($rowData[$unitCol] ?? null) : null;

                if (! $rawDate || ! $rawUnit) {
                    throw new \Exception('Tanggal atau Unit kosong.');
                }

                // 2. Parse Date
                $parsedDate = $this->parseExcelDate($rawDate);

                // 3. Find Unit
                $unitId = $unitCache[$rawUnit] ?? null;
                if (! $unitId) {
                    throw new \Exception("Unit '{$rawUnit}' tidak ditemukan di sistem.");
                }

                // 4. Base Data
                $problem = $problemCol ? ($rowData[$problemCol] ?? 'Historical Import') : 'Historical Import';
                $hm = $hmCol ? ($rowData[$hmCol] ?? 0) : 0;
                $statusWo = $statusCol ? ($rowData[$statusCol] ?? 'COMPLETED') : 'COMPLETED';
                $action = $actionCol ? ($rowData[$actionCol] ?? null) : null;

                $downtimeCode = $downtimeCol ? ($rowData[$downtimeCol] ?? 'UNP') : 'UNP';
                if (! $downtimeCode) {
                    $downtimeCode = 'UNP';
                }

                $waktuBreakdown = null;
                $waktuRfu = null;

                if ($type === 'BREAKDOWN') {
                    $jamB = $jamBCol ? ($rowData[$jamBCol] ?? null) : null;
                    $jamR = $jamRCol ? ($rowData[$jamRCol] ?? null) : null;

                    $waktuBreakdown = $this->combineDateTime($parsedDate, $jamB);
                    $waktuRfu = $this->combineDateTime($parsedDate, $jamR);

                    if ($waktuBreakdown && $waktuRfu && $waktuRfu->lt($waktuBreakdown)) {
                        // If jam ready is before jam breakdown (e.g. crossing midnight), add 1 day
                        $waktuRfu->addDay();
                    }
                }

                // 5. Duplicate Check (Tanggal, Unit, Problem, Type)
                // For SCHEDULE, we use request_date. For BREAKDOWN, waktu_breakdown.
                $q = WorkOrder::where('unit_id', $unitId)
                    ->where('tipe_wo', $type)
                    ->where('problem', $problem);

                if ($type === 'BREAKDOWN' && $waktuBreakdown) {
                    $q->whereDate('waktu_breakdown', $waktuBreakdown->format('Y-m-d'));
                } else {
                    $q->whereDate('request_date', $parsedDate->format('Y-m-d'));
                }

                if ($q->exists()) {
                    $duplicate++;

                    continue;
                }

                // 6. Insert to Database
                $wo = WorkOrderService::createWorkOrder([
                    'tipe_wo' => $type,
                    'unit_id' => $unitId,
                    'status_wo' => strtoupper($statusWo),
                    'waktu_breakdown' => $waktuBreakdown,
                    'waktu_rfu' => $waktuRfu,
                    'hm_unit' => $hm,
                    'problem' => $problem,
                    'downtime_code' => $downtimeCode,
                    'site' => 'Lokal',
                    'request_date' => $parsedDate,
                    'request_by' => 'Historical Import',
                    'priority' => 'MEDIUM',
                    'corrective_action' => $action,
                    'remark' => 'Imported via Historical Import Wizard',
                ]);

                // 7. If it's a completed SCHEDULE, create a ServiceLog so Plan Board updates
                if ($type === 'SCHEDULE' && strtoupper($statusWo) === 'COMPLETED') {
                    ServiceLog::create([
                        'unit_id' => $unitId,
                        'status' => 'completed',
                        'service_type' => $problem,
                        'target_hm' => $hm,
                        'target_date' => $parsedDate,
                        'maintenance_order_id' => $wo->id ?? null,
                    ]);
                }

                $success++;
            } catch (\Exception $e) {
                $errors[] = 'Baris '.($index + 2).': '.$e->getMessage();
                // Add error message to row for download
                $errorRow = array_values($row);
                $errorRow[] = $e->getMessage();
                $errorRows[] = $errorRow;
            }
        }

        // Save error file if any
        $errorFileUrl = null;
        if (count($errorRows) > 0) {
            $errorFileName = 'Errors_Import_'.time().'.xlsx';

            $spreadsheet = new Spreadsheet;
            $sheetObj = $spreadsheet->getActiveSheet();

            // Add 'Error Message' to headers
            $errHeaders = array_values($headers);
            $errHeaders[] = 'ERROR MESSAGE';

            $sheetObj->fromArray([$errHeaders], null, 'A1');
            $sheetObj->fromArray($errorRows, null, 'A2');

            $writer = new Xlsx($spreadsheet);
            $errPath = storage_path('app/public/'.$errorFileName);
            $writer->save($errPath);

            $errorFileUrl = '/storage/'.$errorFileName;
        }

        // Clean up temp file
        @unlink($path);

        return Inertia::render('HistoricalImport/Result', [
            'totalRow' => $totalRow,
            'success' => $success,
            'duplicate' => $duplicate,
            'errorCount' => count($errors),
            'errors' => array_slice($errors, 0, 10), // Show top 10 errors
            'errorFileUrl' => $errorFileUrl,
            'type' => $type,
        ]);
    }

    private function parseExcelDate($value)
    {
        if (is_numeric($value)) {
            return Carbon::instance(ExcelDate::excelToDateTimeObject($value));
        }

        return Carbon::parse($value);
    }

    private function combineDateTime($parsedDate, $timeStr)
    {
        if (! $timeStr) {
            return null;
        }

        $time = '00:00:00';
        if (is_numeric($timeStr)) {
            $time = Carbon::instance(ExcelDate::excelToDateTimeObject($timeStr))->format('H:i:s');
        } else {
            try {
                $time = Carbon::parse($timeStr)->format('H:i:s');
            } catch (\Exception $e) {
            }
        }

        return Carbon::parse($parsedDate->format('Y-m-d').' '.$time);
    }
}
