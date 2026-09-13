<?php

namespace App\Http\Controllers;

use App\Models\Backlog;
use App\Models\Breakdown;
use App\Models\HourMeterLog;
use App\Models\MaintenanceOrder;
use App\Models\PartCanibal;
use App\Models\PcrUc;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $query = Unit::query()->orderByRaw('CASE WHEN no_urut IS NULL THEN 1 ELSE 0 END, no_urut ASC, created_at ASC');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code_unit', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('sn_chassis', 'like', "%{$search}%")
                    ->orWhere('engine_model', 'like', "%{$search}%")
                    ->orWhere('sn_engine', 'like', "%{$search}%")
                    ->orWhere('engine_make', 'like', "%{$search}%")
                    ->orWhere('no_police', 'like', "%{$search}%")
                    ->orWhere('hp', 'like', "%{$search}%")
                    ->orWhere('kw', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('location')) {
            $query->where('location', $request->location);
        }

        if ($request->filled('engine_make')) {
            $query->where('engine_make', $request->engine_make);
        }

        $units = $query->paginate(20)->withQueryString();

        // Summary KPI statistics
        $stats = [
            'total' => Unit::count(),
            'operational' => Unit::where('status', 'Operational')->count(),
            'breakdown' => Unit::where('status', 'Breakdown')->count(),
            'maintenance' => Unit::where('status', 'Maintenance')->count(),
            'standby' => Unit::where('status', 'Standby')->count(),
        ];

        $unitsByType = Unit::whereNotNull('type_unit')->where('type_unit', '!=', '')
            ->groupBy('type_unit')
            ->selectRaw('type_unit, count(*) as total')
            ->pluck('total', 'type_unit');

        $locations = Unit::select('location')->distinct()->whereNotNull('location')->where('location', '!=', '')->pluck('location');
        $engineMakes = Unit::select('engine_make')->distinct()->whereNotNull('engine_make')->where('engine_make', '!=', '')->pluck('engine_make');

        return Inertia::render('Units/Index', [
            'units' => $units,
            'stats' => $stats,
            'unitsByType' => $unitsByType,
            'locations' => $locations,
            'engineMakes' => $engineMakes,
            'filters' => $request->only(['search', 'status', 'location', 'engine_make']),
        ]);
    }

    public function show(Unit $unit)
    {
        $hourMeters = HourMeterLog::where('unit_id', $unit->id)
            ->orderBy('log_date', 'desc')
            ->take(20)
            ->get();

        $breakdowns = \App\Models\WorkOrder::where('unit_id', $unit->id)
            ->where('tipe_wo', 'BREAKDOWN')
            ->latest()
            ->take(20)
            ->get();

        $services = class_exists(MaintenanceOrder::class)
            ? MaintenanceOrder::where('unit_id', $unit->id)->latest()->take(20)->get()
            : [];

        $backlogs = class_exists(Backlog::class)
            ? Backlog::where('unit_id', $unit->id)->latest()->take(20)->get()
            : [];

        $components = PcrUc::where('unit_id', $unit->id)
            ->orderBy('date_replace', 'desc')
            ->get();

        $cannibals = PartCanibal::with(['unit', 'dariUnit'])
            ->where(function ($q) use ($unit) {
                $q->where('unit_id', $unit->id)
                    ->orWhere('dari_unit_id', $unit->id);
            })
            ->latest()
            ->get();

        // 1. Magnetic Plug Data
        $magneticPlugs = \App\Models\MagneticPlug::where('unit_id', $unit->id)
            ->orderBy('date', 'desc')
            ->take(20)
            ->get();

        // 2. Tyres Data mapped by position
        $tyres = \App\Models\Tyre::where('unit_id', $unit->id)->get();
        $tyresMap = [];
        foreach ($tyres as $t) {
            if ($t->position) {
                $currentHm = (float) $unit->hm;
                $lifetime = (float) $t->total_hm + max(0, $currentHm - (float) $t->installed_hm);
                $tArray = $t->toArray();
                $tArray['current_lifetime'] = round($lifetime, 1);
                $tyresMap[$t->position] = $tArray;
            }
        }

        // 3. Mock Budget Data
        $unitBudget = [
            'total_forecast' => ['amount' => '450,000,000', 'vs_realisasi' => '12.5%', 'color' => '#3b82f6'],
            'planned_maintenance' => ['amount' => '320,000,000', 'pct' => '71.1%', 'color' => '#10b981'],
            'corrective_maintenance' => ['amount' => '110,000,000', 'pct' => '24.4%', 'color' => '#facc15'],
            'project_improvement' => ['amount' => '20,000,000', 'pct' => '4.5%', 'color' => '#ef4444'],
            'monthly' => [
                ['bulan' => 'Jan', 'planned' => '25,000,000', 'realisasi' => '24,000,000', 'status' => 'On Track'],
                ['bulan' => 'Feb', 'planned' => '25,000,000', 'realisasi' => '26,500,000', 'status' => 'Over Budget'],
                ['bulan' => 'Mar', 'planned' => '30,000,000', 'realisasi' => '29,000,000', 'status' => 'On Track'],
            ]
        ];

        return Inertia::render('Units/Show', [
            'unit' => $unit,
            'hourMeters' => $hourMeters,
            'breakdowns' => $breakdowns,
            'services' => $services,
            'backlogs' => $backlogs,
            'components' => $components,
            'cannibals' => $cannibals,
            'magneticPlugs' => $magneticPlugs,
            'tyresMap' => $tyresMap,
            'unitBudget' => $unitBudget,
        ]);
    }

    public function create()
    {
        $nextNo = (Unit::max('no_urut') ?? 0) + 1;

        return Inertia::render('Units/Create', [
            'nextNo' => $nextNo,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'no_urut' => 'nullable|integer|min:1',
            'code_unit' => 'required|string|max:100|unique:units,code_unit',
            'type_unit' => 'nullable|string|max:100',
            'hm' => 'nullable|numeric|min:0',
            'model' => 'nullable|string|max:150',
            'sn_chassis' => 'nullable|string|max:150',
            'engine_model' => 'nullable|string|max:150',
            'sn_engine' => 'nullable|string|max:150',
            'engine_make' => 'nullable|string|max:150',
            'equipment_capacity' => 'nullable|string|max:150',
            'no_police' => 'nullable|string|max:100',
            'attachments' => 'nullable|string|max:255',
            'hp' => 'nullable|string|max:50',
            'kw' => 'nullable|string|max:50',
            'tahun_perakitan' => 'nullable|integer|min:1970|max:'.(date('Y') + 1),
            'received_date' => 'nullable|string|max:100',
            'received_from' => 'nullable|string|max:150',
            'location' => 'nullable|string|max:150',
            'before_from' => 'nullable|string|max:150',
            'remarks' => 'nullable|string|max:1000',
            'status' => 'required|in:Operational,Breakdown,Maintenance,Standby',
        ]);

        if (empty($validated['no_urut'])) {
            $validated['no_urut'] = (Unit::max('no_urut') ?? 0) + 1;
        }

        Unit::create($validated);

        return redirect()->route('units.index')->with('message', "Data unit [{$request->code_unit}] berhasil ditambahkan.");
    }

    public function edit(Unit $unit)
    {
        return Inertia::render('Units/Edit', [
            'unit' => $unit,
        ]);
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'no_urut' => 'nullable|integer|min:1',
            'code_unit' => 'required|string|max:100|unique:units,code_unit,'.$unit->id,
            'type_unit' => 'nullable|string|max:100',
            'hm' => 'nullable|numeric|min:0',
            'model' => 'nullable|string|max:150',
            'sn_chassis' => 'nullable|string|max:150',
            'engine_model' => 'nullable|string|max:150',
            'sn_engine' => 'nullable|string|max:150',
            'engine_make' => 'nullable|string|max:150',
            'equipment_capacity' => 'nullable|string|max:150',
            'no_police' => 'nullable|string|max:100',
            'attachments' => 'nullable|string|max:255',
            'hp' => 'nullable|string|max:50',
            'kw' => 'nullable|string|max:50',
            'tahun_perakitan' => 'nullable|integer|min:1970|max:'.(date('Y') + 1),
            'received_date' => 'nullable|string|max:100',
            'received_from' => 'nullable|string|max:150',
            'location' => 'nullable|string|max:150',
            'before_from' => 'nullable|string|max:150',
            'remarks' => 'nullable|string|max:1000',
            'status' => 'required|in:Operational,Breakdown,Maintenance,Standby',
        ]);

        $unit->update($validated);

        return redirect()->route('units.index')->with('message', "Data unit [{$unit->code_unit}] berhasil diperbarui.");
    }

    public function destroy(Unit $unit)
    {
        $code = $unit->code_unit;
        $unit->delete();

        return redirect()->route('units.index')->with('message', "Data unit [{$code}] berhasil dihapus.");
    }

    public function deleteAll()
    {
        Unit::query()->delete();

        return redirect()->route('units.index')->with('message', 'Semua data populasi unit berhasil dihapus.');
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
                return redirect()->back()->withErrors(['file' => 'File Excel kosong atau tidak memiliki baris data.']);
            }

            // Map header row (Row 1)
            $headerMap = [];
            for ($col = 1; $col <= $highestColumnIndex; $col++) {
                $cellVal = $worksheet->getCell([$col, 1])->getValue();
                $clean = strtolower(trim((string) $cellVal));
                $clean = str_replace(['.', '/', '-', ' ', '0'], ['_', '_', '_', '_', 'o'], $clean); // toleransi no_police / no_p0lice
                $headerMap[$col] = $clean;
            }

            $importedCount = 0;

            for ($row = 2; $row <= $highestRow; $row++) {
                $rowData = [];
                $hasContent = false;

                for ($col = 1; $col <= $highestColumnIndex; $col++) {
                    $cell = $worksheet->getCell([$col, $row]);
                    $formattedVal = $cell->getFormattedValue();
                    $rawVal = $cell->getValue();

                    // Prefer formatted string so leading zeros or date representations stay intact
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

                // Helper to get raw exact string without alteration
                $getRaw = function (...$keys) use ($rowData) {
                    foreach ($keys as $k) {
                        $cleanedKey = strtolower(str_replace(['.', '/', '-', ' ', '0'], ['_', '_', '_', '_', 'o'], $k));
                        if (isset($rowData[$cleanedKey]) && trim((string) $rowData[$cleanedKey]) !== '') {
                            return trim((string) $rowData[$cleanedKey]);
                        }
                    }

                    return null;
                };

                // Match Code Unit exactly as in Excel
                $codeUnit = $getRaw('code unit', 'code_unit', 'kode unit', 'kode_unit', 'unit code', 'code', 'unit');

                if (empty($codeUnit) || strtolower($codeUnit) === 'code unit') {
                    continue;
                }

                // No Urut exactly from Excel
                $rawNo = $getRaw('no', 'no_urut', 'nomor', 'number');
                $noUrut = is_numeric($rawNo) ? (int) $rawNo : ($row - 1);

                // Hour meter (HM)
                $rawHm = $getRaw('hm', 'hour meter', 'hour_meter', 'hourmeter');
                $hm = is_numeric(str_replace(',', '.', (string) $rawHm)) ? (float) str_replace(',', '.', (string) $rawHm) : 0;

                // Tahun perakitan
                $rawTahun = $getRaw('tahun perakitan', 'tahun_perakitan', 'tahun', 'year', 'year manufacture');
                $tahun = is_numeric($rawTahun) ? (int) $rawTahun : null;

                // Status: preserve whatever is given or default to Operational
                $rawStatus = $getRaw('status', 'status_unit', 'kondisi');
                $status = 'Operational';
                if ($rawStatus) {
                    $uc = ucfirst(strtolower($rawStatus));
                    if (in_array($uc, ['Operational', 'Breakdown', 'Maintenance', 'Standby'])) {
                        $status = $uc;
                    } else {
                        $status = $rawStatus;
                    }
                }

                $rawReceivedDate = $getRaw('received_date', 'received date', 'tgl terima', 'tanggal terima');
                if ($rawReceivedDate && is_numeric($rawReceivedDate) && (int) $rawReceivedDate > 30000 && (int) $rawReceivedDate < 60000) {
                    try {
                        $rawReceivedDate = Date::excelToDateTimeObject((float) $rawReceivedDate)->format('Y-m-d');
                    } catch (\Throwable $e) {
                    }
                }

                Unit::updateOrCreate(
                    ['code_unit' => $codeUnit],
                    [
                        'no_urut' => $noUrut,
                        'hm' => $hm,
                        'model' => $getRaw('model', 'model_unit'),
                        'sn_chassis' => $getRaw('s_n_chassis', 'sn_chassis', 's/n chassis', 'serial number', 'chassis', 'vin'),
                        'engine_model' => $getRaw('engine_model', 'engine model', 'model_engine'),
                        'sn_engine' => $getRaw('s_n_engine', 'sn_engine', 's/n engine', 'serial engine', 'no engine'),
                        'engine_make' => $getRaw('engine_make', 'engine make', 'make', 'brand_engine', 'engine brand'),
                        'equipment_capacity' => $getRaw('equipment_capacity', 'equipment capacity', 'capacity', 'kapasitas'),
                        'no_police' => $getRaw('no_police', 'no_p0lice', 'no police', 'no p0lice', 'no_polisi', 'nopol'),
                        'attachments' => $getRaw('attachments', 'attachment', 'aksesoris'),
                        'hp' => $getRaw('hp', 'horse power', 'horsepower'),
                        'kw' => $getRaw('kw', 'kilo watt', 'kilowatt'),
                        'tahun_perakitan' => $tahun,
                        'received_date' => $rawReceivedDate,
                        'received_from' => $getRaw('received_from', 'received from', 'terima dari', 'vendor'),
                        'location' => $getRaw('location', 'lokasi', 'site'),
                        'before_from' => $getRaw('before_from', 'before from', 'sebelumnya', 'asal unit'),
                        'remarks' => $getRaw('remarks', 'catatan', 'keterangan'),
                        'status' => $status,
                    ]
                );

                $importedCount++;
            }

            return redirect()->route('units.index')->with('message', "Berhasil mengimpor {$importedCount} data unit dari Excel persis sesuai data aslinya.");
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['file' => 'Gagal memproses file Excel: '.$e->getMessage()]);
        }
    }

    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Populasi Unit');

        // Headers matching user's exact specification
        $headers = [
            'No', 'CODE UNIT', 'HM', 'Model', 'S/N CHASSIS',
            'ENGINE MODEL', 'S/N ENGINE', 'ENGINE MAKE', 'EQUIPMENT CAPACITY',
            'NO.P0LICE', 'ATTACHMENTS', 'HP', 'KW', 'TAHUN PERAKITAN',
            'RECEIVED DATE', 'RECEIVED FROM', 'LOCATION', 'BEFORE FROM', 'Remarks',
        ];
        $sheet->fromArray([$headers], null, 'A1');

        // Style Header
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '7C3AED'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ];
        $sheet->getStyle('A1:S1')->applyFromArray($headerStyle);

        // Sample Data Rows with explicit sequential No
        $samples = [
            [1, 'EX-201', 4520.5, 'PC200-8', 'KMTC2008X01923', 'SAA6D107E-1', 'ENG-88219', 'Komatsu', '0.93 m3', '-', 'Standard Bucket', '148 HP', '110 KW', 2022, '2022-03-15', 'United Tractors Jakarta', 'Site Sangatta', 'Workshop Balikpapan', 'Siap Operasi'],
            [2, 'DT-101', 8140.0, 'HD785-7', 'KMTD7857X02102', 'SAA12V140E-3', 'ENG-99120', 'Komatsu', '60 m3 / 91 Ton', 'KT 8192 UT', 'Dump Body Heavy Duty', '1178 HP', '879 KW', 2021, '2021-06-20', 'UT Balikpapan', 'Pit Central', 'New Unit Delivery', 'Rutin Servis 250H'],
            [3, 'DZ-005', 6320.2, 'D85ESS-2', 'KMTD85ESX05432', 'SA6D125E-2', 'ENG-77312', 'Komatsu', '3.4 m3 Blade', '-', 'Straight Tilt Dozer Blade', '200 HP', '149 KW', 2020, '2020-09-10', 'Workshop Samarinda', 'Workshop Central', 'Site Sangatta Pit 1', 'Menunggu Sparepart Seal'],
            [4, 'WL-012', 5120.0, 'CAT 966H', 'CAT966HX12891', 'C11 ACERT', 'ENG-55410', 'Caterpillar', '4.2 m3', '-', 'General Purpose Bucket', '262 HP', '195 KW', 2023, '2023-01-25', 'Trakindo Utama', 'Port Loading Area', 'New Unit Delivery', 'Jadwal PM Service'],
            [5, 'MG-003', 3890.5, 'GD705A-4', 'KMTGD705X03321', 'SAA6D114E-3', 'ENG-66321', 'Komatsu', '4.3 m Moldboard', '-', 'Blade 14ft & Ripper', '200 HP', '149 KW', 2023, '2023-04-12', 'UT Sangatta', 'Hauling Road KM 12', 'Site Batuta', 'Standby menunggu rotasi operator'],
        ];
        $sheet->fromArray($samples, null, 'A2');

        // Auto size columns
        foreach (range('A', 'S') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Populasi_Unit.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $query = Unit::query()->orderByRaw('CASE WHEN no_urut IS NULL THEN 1 ELSE 0 END, no_urut ASC, created_at ASC');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('location')) {
            $query->where('location', $request->location);
        }

        if ($request->filled('engine_make')) {
            $query->where('engine_make', $request->engine_make);
        }

        $units = $query->get();

        $stats = [
            'total' => $units->count(),
            'operational' => $units->where('status', 'Operational')->count(),
            'breakdown' => $units->where('status', 'Breakdown')->count(),
            'maintenance' => $units->where('status', 'Maintenance')->count(),
            'standby' => $units->where('status', 'Standby')->count(),
        ];

        $pdf = Pdf::loadView('pdf.units-report', [
            'title' => 'Laporan Populasi Unit Plant Equipment',
            'units' => $units,
            'stats' => $stats,
            'generatedAt' => now()->translatedFormat('d F Y - H:i:s'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('Laporan_Populasi_Unit_'.date('Ymd_His').'.pdf');
    }
}
