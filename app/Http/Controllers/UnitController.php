<?php

namespace App\Http\Controllers;

use App\Models\Backlog;
use App\Models\HourMeterLog;
use App\Models\MagneticPlug;
use App\Models\MaintenanceOrder;
use App\Models\PartCanibal;
use App\Models\PcrUc;
use App\Models\PlantForm;
use App\Models\Tyre;
use App\Models\Unit;
use App\Models\UnitApl;
use App\Models\UnitGet;
use App\Models\WorkOrder;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
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

        // Summary KPI statistics (Consolidated single query)
        $statusCounts = Unit::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Operational' THEN 1 ELSE 0 END) as operational,
            SUM(CASE WHEN status = 'Breakdown' THEN 1 ELSE 0 END) as breakdown,
            SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) as maintenance,
            SUM(CASE WHEN status = 'Standby' THEN 1 ELSE 0 END) as standby
        ")->first();

        $stats = [
            'total' => (int) ($statusCounts->total ?? 0),
            'operational' => (int) ($statusCounts->operational ?? 0),
            'breakdown' => (int) ($statusCounts->breakdown ?? 0),
            'maintenance' => (int) ($statusCounts->maintenance ?? 0),
            'standby' => (int) ($statusCounts->standby ?? 0),
        ];

        $unitsByType = Unit::whereNotNull('type_unit')->where('type_unit', '!=', '')
            ->groupBy('type_unit')
            ->selectRaw('type_unit, count(*) as total')
            ->pluck('total', 'type_unit');

        $locations = Unit::select('location')->distinct()->whereNotNull('location')->where('location', '!=', '')->pluck('location');
        $engineMakes = Unit::select('engine_make')->distinct()->whereNotNull('engine_make')->where('engine_make', '!=', '')->pluck('engine_make');
        $allUnitsList = Unit::select('id', 'code_unit', 'model', 'type_unit', 'location', 'hm', 'status')
            ->orderByRaw('CASE WHEN no_urut IS NULL THEN 1 ELSE 0 END, no_urut ASC, code_unit ASC')
            ->get();

        return Inertia::render('Units/Index', [
            'units' => $units,
            'allUnitsList' => $allUnitsList,
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

        $breakdowns = WorkOrder::where('unit_id', $unit->id)
            ->where('tipe_wo', 'BREAKDOWN')
            ->latest()
            ->take(20)
            ->get();

        $woServices = WorkOrder::where('unit_id', $unit->id)
            ->where(function ($q) {
                $q->where('tipe_wo', 'SCHEDULE')
                    ->orWhere('downtime_code', 'Schedule')
                    ->orWhere('problem', 'like', '%Periodical service%');
            })
            ->latest('waktu_breakdown')
            ->latest('created_at')
            ->get();

        $moServices = class_exists(MaintenanceOrder::class)
            ? MaintenanceOrder::where('unit_id', $unit->id)->latest()->take(20)->get()
            : collect();

        $services = $woServices->concat($moServices)->sortByDesc(function ($item) {
            return $item->waktu_breakdown ?? $item->start_date ?? $item->tanggal ?? $item->created_at;
        })->values();

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
        $magneticPlugs = MagneticPlug::where('unit_id', $unit->id)
            ->orderBy('date', 'desc')
            ->take(20)
            ->get();

        // 2. Tyres Data mapped by position
        $tyres = Tyre::where('unit_id', $unit->id)->get();
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
            ],
        ];

        $apls = UnitApl::where(function ($query) use ($unit) {
            $query->where('unit_id', $unit->id)
                ->orWhere('is_global', true)
                ->orWhere(function ($q) use ($unit) {
                    $q->whereNull('unit_id')
                        ->where(function ($sq) use ($unit) {
                            $sq->whereNull('type_unit')
                                ->orWhere('type_unit', $unit->type_unit);
                        });
                });
        })->orderBy('id', 'asc')->get();

        $gets = UnitGet::where(function ($query) use ($unit) {
            $query->where('unit_id', $unit->id)
                ->orWhere('is_global', true)
                ->orWhere(function ($q) use ($unit) {
                    $q->whereNull('unit_id')
                        ->where(function ($sq) use ($unit) {
                            $sq->whereNull('type_unit')
                                ->orWhere('type_unit', $unit->type_unit);
                        });
                });
        })->orderBy('id', 'asc')->get();

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
            'apls' => $apls,
            'gets' => $gets,
        ]);
    }

    public function create()
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk membuat unit.');

        $nextNo = (Unit::max('no_urut') ?? 0) + 1;

        return Inertia::render('Units/Create', [
            'nextNo' => $nextNo,
        ]);
    }

    public function store(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menyimpan unit.');

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

        if (! isset($validated['hm']) || $validated['hm'] === null || $validated['hm'] === '') {
            $validated['hm'] = 0;
        }

        if (empty($validated['type_unit'])) {
            $validated['type_unit'] = self::resolveStandardUnitType($validated['code_unit'], $validated['model'] ?? null);
        }

        Unit::create($validated);

        return redirect()->route('units.index')->with('message', "Data unit [{$request->code_unit}] berhasil ditambahkan.");
    }

    public function edit(Unit $unit)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengubah unit.');

        return Inertia::render('Units/Edit', [
            'unit' => $unit,
        ]);
    }

    public function update(Request $request, Unit $unit)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengubah unit.');

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

        if (! isset($validated['hm']) || $validated['hm'] === null || $validated['hm'] === '') {
            $validated['hm'] = 0;
        }

        if (empty($validated['type_unit'])) {
            $validated['type_unit'] = self::resolveStandardUnitType($validated['code_unit'], $validated['model'] ?? null, $unit->type_unit);
        }

        $unit->update($validated);

        return redirect()->route('units.index')->with('message', "Data unit [{$unit->code_unit}] berhasil diperbarui.");
    }

    public function destroy(Unit $unit)
    {
        // USER REQUESTED LOCK: Prevent any deletion of units
        abort(403, 'Akses ditolak: Data unit saat ini berstatus LOCKED dan tidak boleh dihapus.');

        /*
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menghapus unit.');

        $code = $unit->code_unit;
        $unit->delete();

        return redirect()->route('units.index')->with('message', "Data unit [{$code}] berhasil dihapus.");
        */
    }

    public function deleteAll()
    {
        // USER REQUESTED LOCK: Prevent any deletion of units
        abort(403, 'Akses ditolak: Data unit saat ini berstatus LOCKED dan tidak boleh dihapus.');

        /*
        if (! auth()->user()?->hasAnyRole(['super-admin', 'admin'])) {
            abort(403, 'Akses ditolak: Hanya administrator yang diizinkan menghapus seluruh populasi unit.');
        }

        Unit::query()->delete();

        return redirect()->route('units.index')->with('message', 'Semua data populasi unit berhasil dihapus.');
        */
    }

    public function import(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengimpor unit.');

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

                $modelVal = $getRaw('model', 'model_unit');
                $rawTypeUnit = $getRaw('equipment', 'type_unit', 'tipe_unit', 'jenis_unit');
                $standardTypeUnit = self::resolveStandardUnitType($codeUnit, $modelVal, $rawTypeUnit);

                Unit::updateOrCreate(
                    ['code_unit' => $codeUnit],
                    [
                        'no_urut' => $noUrut,
                        'type_unit' => $standardTypeUnit,
                        'hm' => $hm,
                        'model' => $modelVal,
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

    /**
     * Resolve standard unit type (Equipment) based on unit code, model, and existing type.
     */
    public static function resolveStandardUnitType(?string $code, ?string $model = null, ?string $currentType = null): string
    {
        $codeUpper = strtoupper(trim((string) $code));
        $modelUpper = strtoupper(trim((string) $model));
        $typeUpper = strtoupper(trim((string) $currentType));

        // 1. Check PlanInspection authoritative map first
        $specs = PlanInspectionController::getOrderedUnitSpecs();
        foreach ($specs as $type => $codes) {
            foreach ($codes as $c) {
                if (strtoupper(trim($c)) === $codeUpper) {
                    return $type;
                }
            }
        }

        // 2. Dewatering pumps (MWF008, MWF009, etc.)
        if (in_array($codeUpper, ['MWF008', 'MWF009']) || str_starts_with($codeUpper, 'MWP') || str_starts_with($codeUpper, 'MWF') || str_contains($typeUpper, 'DEWATERING')) {
            return 'DEWATERING PUMP';
        }

        // 3. Light vehicles
        if ($codeUpper === 'HO-06' || str_starts_with($codeUpper, 'LV') || str_contains($typeUpper, 'LIGHT') || str_contains($typeUpper, 'TRITON')) {
            return 'LIGHT VEHICLE';
        }

        // 4. Fuel storages
        if (str_starts_with($codeUpper, 'MFS') || str_contains($modelUpper, 'FUEL STORAGE')) {
            return 'FUEL STORAGE';
        }

        // 5. Containers
        if (str_starts_with($codeUpper, 'BOX KONTAINER') || str_starts_with($codeUpper, 'KONTAINER') || str_contains($modelUpper, 'CON-BRIDGE')) {
            return 'CONTAINER';
        }

        // 6. Chainsaws
        if (str_starts_with($codeUpper, 'CHAINSAW') || str_contains($modelUpper, 'STHIL')) {
            return 'CHAINSAW';
        }

        // 7. Welding, Genset, Compressor
        if (
            str_contains($codeUpper, 'WELDING') ||
            str_contains($modelUpper, 'WELDING') ||
            str_starts_with($codeUpper, 'MGS') ||
            str_starts_with($codeUpper, 'MCM') ||
            str_starts_with($codeUpper, 'MWM') ||
            str_contains($typeUpper, 'GENSET') ||
            str_contains($typeUpper, 'COMPRESSOR') ||
            str_contains($typeUpper, 'WELDING')
        ) {
            return 'GENSET - COMPRESSOR - WELDING MACHINE';
        }

        // 8. Crushers
        if (str_starts_with($codeUpper, 'MSC') || str_contains($typeUpper, 'CRUSHER')) {
            return 'CRUSHER';
        }

        // 9. Bulldozer
        if (str_starts_with($codeUpper, 'MD') || str_contains($typeUpper, 'DOZER')) {
            return 'BULLDOZER';
        }

        // 10. Hauler Truck
        if (str_starts_with($codeUpper, 'OHT') || (str_contains($typeUpper, 'HAUL') && ! str_contains($typeUpper, 'MAINHAUL'))) {
            return 'HAULER TRUCK';
        }

        // 11. Dump Truck
        if (str_starts_with($codeUpper, 'MDT') || str_starts_with($codeUpper, 'DT') || str_contains($typeUpper, 'DUMP')) {
            return 'DUMP TRUCK';
        }

        // 12. Motor Grader
        if (str_starts_with($codeUpper, 'MG') || str_contains($typeUpper, 'GRADER')) {
            return 'MOTOR GRADER';
        }

        // 13. Compactor
        if (str_starts_with($codeUpper, 'MCP') || str_contains($typeUpper, 'COMPACTOR')) {
            return 'COMPACTOR';
        }

        // 14. Tower Lamp
        if (str_starts_with($codeUpper, 'MTL') || str_contains($typeUpper, 'TOWER')) {
            return 'TOWER LAMP';
        }

        // 15. Service Truck
        if (str_starts_with($codeUpper, 'MLT') || str_contains($typeUpper, 'LUBE') || str_contains($typeUpper, 'SERVICE')) {
            return 'SERVICE TRUCK';
        }

        // 16. Fuel Truck
        if (str_starts_with($codeUpper, 'MFT') || str_contains($typeUpper, 'FUEL')) {
            return 'FUEL TRUCK';
        }

        // 17. Water Truck
        if (str_starts_with($codeUpper, 'MWT') || str_contains($typeUpper, 'WATER TRUCK')) {
            return 'WATER TRUCK';
        }

        // 18. Crane Truck & Lowboy
        if (str_starts_with($codeUpper, 'MCT') || str_starts_with($codeUpper, 'MC ') || str_contains($typeUpper, 'CRANE') || str_contains($typeUpper, 'LOWBOY')) {
            return 'CRANE TRUCK & LOWBOY';
        }

        // 19. Sarana Bus
        if (str_starts_with($codeUpper, 'MB') || str_starts_with($codeUpper, 'MMH') || str_contains($typeUpper, 'BUS') || $typeUpper === 'BIS') {
            return 'SARANA BUS';
        }

        // 20. Excavators
        if (str_starts_with($codeUpper, 'ME') || str_contains($typeUpper, 'EXCAVATOR')) {
            return 'EXCAVATOR SMALL DIGGER';
        }

        // 21. Preserved / Fallback
        if (! empty($currentType) && $currentType !== '-' && $currentType !== 'UNIT') {
            return $currentType;
        }

        return 'SUPPORT EQUIPMENT';
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

    public function exportExcel(Request $request): StreamedResponse
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

        if ($request->filled('type_unit')) {
            $query->where('type_unit', $request->type_unit);
        }

        if ($request->filled('engine_make')) {
            $query->where('engine_make', $request->engine_make);
        }

        $units = $query->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Populasi Unit');
        $sheet->setShowGridLines(true);

        // Header Title (Row 1)
        $sheet->mergeCells('A1:T1');
        $sheet->setCellValue('A1', 'DATA POPULASI UNIT PLANT');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('FFFFFF');
        $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('065F46');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension(1)->setRowHeight(32);

        // Subtitle Info (Row 2)
        $sheet->mergeCells('A2:T2');
        $subtitle = 'Tanggal Unduh: '.now()->translatedFormat('d F Y H:i:s').' | Total Unit: '.$units->count().' Unit';
        $sheet->setCellValue('A2', $subtitle);
        $sheet->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->getColor()->setRGB('047857');
        $sheet->getStyle('A2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('ECFDF5');
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension(2)->setRowHeight(20);

        // Blank Row (Row 3)
        $sheet->getRowDimension(3)->setRowHeight(8);

        // Table Column Headers (Row 4)
        $headers = [
            'A' => 'No',
            'B' => 'Kode Unit',
            'C' => 'Model',
            'D' => 'S/N Chassis',
            'E' => 'Engine Model',
            'F' => 'S/N Engine',
            'G' => 'Engine Make',
            'H' => 'Equipment Capacity',
            'I' => 'No. Polisi',
            'J' => 'Attachments',
            'K' => 'HP',
            'L' => 'KW',
            'M' => 'Tahun Perakitan',
            'N' => 'Received Date',
            'O' => 'Received From',
            'P' => 'Location',
            'Q' => 'Before From',
            'R' => 'HM Terakhir',
            'S' => 'Status',
            'T' => 'Remarks',
        ];

        foreach ($headers as $col => $header) {
            $cell = $col.'4';
            $sheet->setCellValue($cell, $header);
            $sheet->getStyle($cell)->getFont()->setBold(true)->setSize(10)->getColor()->setRGB('FFFFFF');
            $sheet->getStyle($cell)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('10B981');
            $sheet->getStyle($cell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        }
        $sheet->getRowDimension(4)->setRowHeight(28);

        $categoryOrder = [
            'CRUSHER',
            'EXCAVATOR SMALL DIGGER',
            'EXCAVATOR BIG DIGGER',
            'BULLDOZER',
            'HAULER TRUCK',
            'DUMP TRUCK',
            'MOTOR GRADER',
            'COMPACTOR',
            'TOWER LAMP',
            'SERVICE TRUCK',
            'FUEL TRUCK',
            'WATER TRUCK',
            'CRANE TRUCK & LOWBOY',
            'DEWATERING PUMP',
            'SARANA BUS',
            'GENSET - COMPRESSOR - WELDING MACHINE',
            'LIGHT VEHICLE',
            'FUEL STORAGE',
            'CONTAINER',
            'CHAINSAW',
            'SUPPORT EQUIPMENT',
        ];

        // Group units by standard unit type
        $groupedUnits = [];
        foreach ($units as $unit) {
            $cat = self::resolveStandardUnitType($unit->code_unit, $unit->model, $unit->type_unit);
            $groupedUnits[$cat][] = $unit;
        }

        // Order groups according to category taxonomy
        $orderedGroups = [];
        foreach ($categoryOrder as $cat) {
            if (! empty($groupedUnits[$cat])) {
                $orderedGroups[$cat] = $groupedUnits[$cat];
                unset($groupedUnits[$cat]);
            }
        }
        foreach ($groupedUnits as $cat => $catUnits) {
            $orderedGroups[$cat] = $catUnits;
        }

        // Data Rows (Row 5+) with grey section headers per unit type
        $row = 5;
        $runningNo = 1;

        foreach ($orderedGroups as $categoryName => $groupUnits) {
            // Grey section header row for unit type
            $sheet->mergeCells("A{$row}:T{$row}");
            $sheet->setCellValue("A{$row}", $categoryName);
            $sheet->getStyle("A{$row}")->getFont()->setBold(true)->setSize(10)->getColor()->setRGB('FFFFFF');
            $sheet->getStyle("A{$row}:T{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('4B5563');
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER)->setIndent(1);
            $sheet->getRowDimension($row)->setRowHeight(24);
            $row++;

            // Data rows under this section
            foreach ($groupUnits as $unit) {
                $sheet->setCellValue('A'.$row, $runningNo++);
                $sheet->setCellValue('B'.$row, $unit->code_unit);
                $sheet->setCellValue('C'.$row, $unit->model ?: '-');
                $sheet->setCellValue('D'.$row, $unit->sn_chassis ?: '-');
                $sheet->setCellValue('E'.$row, $unit->engine_model ?: '-');
                $sheet->setCellValue('F'.$row, $unit->sn_engine ?: '-');
                $sheet->setCellValue('G'.$row, $unit->engine_make ?: '-');
                $sheet->setCellValue('H'.$row, $unit->equipment_capacity ?: '-');
                $sheet->setCellValue('I'.$row, $unit->no_police ?: '-');
                $sheet->setCellValue('J'.$row, $unit->attachments ?: '-');
                $sheet->setCellValue('K'.$row, $unit->hp ?: '-');
                $sheet->setCellValue('L'.$row, $unit->kw ?: '-');
                $sheet->setCellValue('M'.$row, $unit->tahun_perakitan ?: '-');
                $sheet->setCellValue('N'.$row, $unit->received_date ?: '-');
                $sheet->setCellValue('O'.$row, $unit->received_from ?: '-');
                $sheet->setCellValue('P'.$row, $unit->location ?: '-');
                $sheet->setCellValue('Q'.$row, $unit->before_from ?: '-');
                $sheet->setCellValue('R'.$row, (float) ($unit->hm ?? 0));
                $sheet->setCellValue('S'.$row, $unit->status ?: 'Operational');
                $sheet->setCellValue('T'.$row, $unit->remarks ?: '-');

                // Alignments & Styles
                $sheet->getStyle('A'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('B'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('B'.$row)->getFont()->setBold(true);
                $sheet->getStyle('H'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('I'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('K'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('L'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('M'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('N'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('P'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('R'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getStyle('R'.$row)->getNumberFormat()->setFormatCode('#,##0.0');
                $sheet->getStyle('S'.$row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('S'.$row)->getFont()->setBold(true);

                // Row background zebra striping
                if ($runningNo % 2 === 0) {
                    $sheet->getStyle("A{$row}:T{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F9FAFB');
                }

                $sheet->getRowDimension($row)->setRowHeight(22);
                $row++;
            }
        }

        $lastRow = max(5, $row - 1);

        // Apply borders to table
        $sheet->getStyle("A4:T{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'D1D5DB'],
                ],
            ],
        ]);

        // Auto-fit column widths
        foreach (range('A', 'T') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Populasi_Unit_'.date('Y-m-d_His').'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function exportMultiSheetExcel(Request $request): StreamedResponse
    {
        $unitId = $request->get('unit_id');
        $unit = $unitId ? Unit::find($unitId) : null;

        if (! $unit) {
            $unit = Unit::orderByRaw('CASE WHEN no_urut IS NULL THEN 1 ELSE 0 END, no_urut ASC, created_at ASC')->firstOrFail();
        }

        // Fetch Related Data
        $hourMeters = class_exists(HourMeterLog::class)
            ? HourMeterLog::where('unit_id', $unit->id)->orderBy('log_date', 'desc')->get()
            : collect();

        $components = class_exists(PcrUc::class)
            ? PcrUc::where('unit_id', $unit->id)->orderBy('date_replace', 'desc')->get()
            : collect();

        $breakdowns = class_exists(WorkOrder::class)
            ? WorkOrder::where('unit_id', $unit->id)->where('tipe_wo', 'BREAKDOWN')->latest('waktu_breakdown')->latest('created_at')->get()
            : collect();

        $woServices = class_exists(WorkOrder::class)
            ? WorkOrder::where('unit_id', $unit->id)
                ->where(function ($q) {
                    $q->where('tipe_wo', 'SCHEDULE')
                        ->orWhere('downtime_code', 'Schedule')
                        ->orWhere('problem', 'like', '%Periodical service%');
                })
                ->latest('waktu_breakdown')
                ->latest('created_at')
                ->get()
            : collect();

        $moServices = class_exists(MaintenanceOrder::class)
            ? MaintenanceOrder::where('unit_id', $unit->id)->latest()->get()
            : collect();

        $services = $woServices->concat($moServices)->sortByDesc(function ($item) {
            return $item->waktu_breakdown ?? $item->start_date ?? $item->tanggal ?? $item->created_at;
        })->values();

        $backlogs = class_exists(Backlog::class)
            ? Backlog::where('unit_id', $unit->id)->latest('tanggal_temuan')->latest('created_at')->get()
            : collect();

        $magneticPlugs = class_exists(MagneticPlug::class)
            ? MagneticPlug::where('unit_id', $unit->id)->orderBy('date', 'desc')->get()
            : collect();

        $unitBudget = [
            'total_forecast' => ['amount' => '450,000,000', 'vs_realisasi' => '12.5%'],
            'planned_maintenance' => ['amount' => '320,000,000', 'pct' => '71.1%'],
            'corrective_maintenance' => ['amount' => '110,000,000', 'pct' => '24.4%'],
            'project_improvement' => ['amount' => '20,000,000', 'pct' => '4.5%'],
            'monthly' => [
                ['bulan' => 'Januari', 'planned' => 25000000, 'realisasi' => 24000000, 'status' => 'On Track'],
                ['bulan' => 'Februari', 'planned' => 25000000, 'realisasi' => 26500000, 'status' => 'Over Budget'],
                ['bulan' => 'Maret', 'planned' => 30000000, 'realisasi' => 29000000, 'status' => 'On Track'],
                ['bulan' => 'April', 'planned' => 28000000, 'realisasi' => 27500000, 'status' => 'On Track'],
                ['bulan' => 'Mei', 'planned' => 32000000, 'realisasi' => 31000000, 'status' => 'On Track'],
                ['bulan' => 'Juni', 'planned' => 30000000, 'realisasi' => 29800000, 'status' => 'On Track'],
            ],
        ];

        $spreadsheet = new Spreadsheet;

        // Styling Helpers
        $applySheetHeader = function ($sheet, $title, $subtitle, $lastCol = 'I') {
            $sheet->setShowGridLines(true);
            $sheet->mergeCells("A1:{$lastCol}1");
            $sheet->setCellValue('A1', $title);
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(13)->getColor()->setRGB('FFFFFF');
            $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('065F46');
            $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
            $sheet->getRowDimension(1)->setRowHeight(30);

            $sheet->mergeCells("A2:{$lastCol}2");
            $sheet->setCellValue('A2', $subtitle);
            $sheet->getStyle('A2')->getFont()->setItalic(true)->setSize(9.5)->getColor()->setRGB('047857');
            $sheet->getStyle('A2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('ECFDF5');
            $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
            $sheet->getRowDimension(2)->setRowHeight(20);
        };

        $applyTableHeaders = function ($sheet, $headers, $row = 4) {
            $sheet->getRowDimension($row)->setRowHeight(24);
            $colIdx = 1;
            foreach ($headers as $h) {
                $colLetter = Coordinate::stringFromColumnIndex($colIdx);
                $sheet->setCellValue("{$colLetter}{$row}", $h);
                $colIdx++;
            }
            $lastCol = Coordinate::stringFromColumnIndex(count($headers));
            $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);
        };

        $autoFitColumns = function ($sheet, $maxColIdx) {
            for ($i = 1; $i <= $maxColIdx; $i++) {
                $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($i))->setAutoSize(true);
            }
        };

        $applyBorders = function ($sheet, $range) {
            $sheet->getStyle($range)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'D1D5DB'],
                    ],
                ],
            ]);
        };

        // ══════════════════════════════════════════════════════════════════════
        // SHEET 1: INFO UNIT
        // ══════════════════════════════════════════════════════════════════════
        $s1 = $spreadsheet->getActiveSheet();
        $s1->setTitle('Info Unit');
        $applySheetHeader($s1, "DATA SPESIFIKASI & STATUS UNIT: {$unit->code_unit}", "Model: {$unit->model} | Tipe: {$unit->type_unit} | Lokasi: {$unit->location} | Status: {$unit->status}", 'D');

        $infoRows = [
            ['Kode Unit', $unit->code_unit, 'Lokasi Kerja', $unit->location ?? '-'],
            ['Model Unit', $unit->model ?? '-', 'Status Operasional', $unit->status ?? '-'],
            ['Tipe Unit', $unit->type_unit ?? '-', 'Current HM', number_format((float) $unit->hm, 1, ',', '.')],
            ['S/N Chassis', $unit->sn_chassis ?? '-', 'No. Polisi', $unit->no_police ?? '-'],
            ['Engine Make', $unit->engine_make ?? '-', 'Kapasitas Equipment', $unit->equipment_capacity ?? '-'],
            ['Engine Model', $unit->engine_model ?? '-', 'Attachments', $unit->attachments ?? '-'],
            ['S/N Engine', $unit->sn_engine ?? '-', 'Tahun Perakitan', $unit->tahun_perakitan ?? '-'],
            ['Power (HP / KW)', ($unit->hp ?? '-').' / '.($unit->kw ?? '-'), 'Tanggal Diterima', $unit->received_date ?? '-'],
            ['Diterima Dari', $unit->received_from ?? '-', 'Asal Sebelumnya', $unit->before_from ?? '-'],
            ['No. Urut Populasi', $unit->no_urut ?? '-', 'Catatan / Remarks', $unit->remarks ?? '-'],
        ];

        $rIdx = 4;
        foreach ($infoRows as $ir) {
            $s1->setCellValue("A{$rIdx}", $ir[0]);
            $s1->setCellValue("B{$rIdx}", $ir[1]);
            $s1->setCellValue("C{$rIdx}", $ir[2]);
            $s1->setCellValue("D{$rIdx}", $ir[3]);

            $s1->getStyle("A{$rIdx}")->getFont()->setBold(true);
            $s1->getStyle("A{$rIdx}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F3F4F6');
            $s1->getStyle("C{$rIdx}")->getFont()->setBold(true);
            $s1->getStyle("C{$rIdx}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F3F4F6');
            $s1->getRowDimension($rIdx)->setRowHeight(22);
            $rIdx++;
        }
        $applyBorders($s1, 'A4:D'.($rIdx - 1));
        $autoFitColumns($s1, 4);

        // ══════════════════════════════════════════════════════════════════════
        // SHEET 2: RIWAYAT HM
        // ══════════════════════════════════════════════════════════════════════
        $s2 = $spreadsheet->createSheet();
        $s2->setTitle('Riwayat HM');
        $applySheetHeader($s2, "RIWAYAT LOG HOUR METER (HM) - UNIT {$unit->code_unit}", 'Total Log Tercatat: '.$hourMeters->count().' baris data log', 'I');
        $hmHeaders = ['No', 'Tanggal Log', 'HM Awal', 'HM Akhir', 'Total HM', 'Shift', 'Operator', 'Lokasi', 'Catatan'];
        $applyTableHeaders($s2, $hmHeaders, 4);

        $rIdx = 5;
        if ($hourMeters->isEmpty()) {
            $s2->mergeCells('A5:I5');
            $s2->setCellValue('A5', 'Belum ada catatan riwayat Hour Meter untuk unit ini.');
            $s2->getStyle('A5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $s2->getRowDimension(5)->setRowHeight(22);
            $rIdx = 6;
        } else {
            foreach ($hourMeters as $i => $hm) {
                $s2->setCellValue("A{$rIdx}", $i + 1);
                $s2->setCellValue("B{$rIdx}", $hm->log_date ? date('d/m/Y', strtotime($hm->log_date)) : '-');
                $s2->setCellValue("C{$rIdx}", (float) $hm->hm_start);
                $s2->setCellValue("D{$rIdx}", (float) $hm->hm_end);
                $s2->setCellValue("E{$rIdx}", (float) $hm->hm_total);
                $s2->setCellValue("F{$rIdx}", $hm->shift ?? '-');
                $s2->setCellValue("G{$rIdx}", $hm->operator_name ?? '-');
                $s2->setCellValue("H{$rIdx}", $hm->location ?? '-');
                $s2->setCellValue("I{$rIdx}", $hm->remarks ?? '-');

                $s2->getStyle("A{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $s2->getStyle("B{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $s2->getStyle("C{$rIdx}:E{$rIdx}")->getNumberFormat()->setFormatCode('#,##0.0');
                $s2->getStyle("F{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                if ($i % 2 === 1) {
                    $s2->getStyle("A{$rIdx}:I{$rIdx}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F9FAFB');
                }
                $s2->getRowDimension($rIdx)->setRowHeight(20);
                $rIdx++;
            }
        }
        $applyBorders($s2, 'A4:I'.($rIdx - 1));
        $autoFitColumns($s2, count($hmHeaders));

        // ══════════════════════════════════════════════════════════════════════
        // SHEET 3: COMPONENT
        // ══════════════════════════════════════════════════════════════════════
        $s3 = $spreadsheet->createSheet();
        $s3->setTitle('Component');
        $applySheetHeader($s3, "MONITORING KOMPONEN & UNDER CARRIAGE (PCR) - UNIT {$unit->code_unit}", 'Total Komponen Terdaftar: '.$components->count().' komponen', 'L');
        $compHeaders = ['No', 'Komponen', 'Part Number', 'Brand / Merk', 'Deskripsi', 'HM Pasang', 'Tgl Pasang', 'HM Saat Ini', 'Target Life (HM)', 'Lifetime (%)', 'Status', 'Next Plan'];
        $applyTableHeaders($s3, $compHeaders, 4);

        $rIdx = 5;
        if ($components->isEmpty()) {
            $s3->mergeCells('A5:L5');
            $s3->setCellValue('A5', 'Belum ada data komponen untuk unit ini.');
            $s3->getStyle('A5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $s3->getRowDimension(5)->setRowHeight(22);
            $rIdx = 6;
        } else {
            foreach ($components as $i => $cp) {
                $s3->setCellValue("A{$rIdx}", $i + 1);
                $s3->setCellValue("B{$rIdx}", $cp->component ?? '-');
                $s3->setCellValue("C{$rIdx}", $cp->part_number ?? '-');
                $s3->setCellValue("D{$rIdx}", $cp->brand_produk ?? '-');
                $s3->setCellValue("E{$rIdx}", $cp->description ?? '-');
                $s3->setCellValue("F{$rIdx}", $cp->hm_replace !== null ? (float) $cp->hm_replace : 0);
                $s3->setCellValue("G{$rIdx}", $cp->date_replace ? date('d/m/Y', strtotime($cp->date_replace)) : '-');
                $s3->setCellValue("H{$rIdx}", $cp->hm_current !== null ? (float) $cp->hm_current : (float) $unit->hm);
                $s3->setCellValue("I{$rIdx}", $cp->target_life_time !== null ? (float) $cp->target_life_time : 0);
                $s3->setCellValue("J{$rIdx}", ($cp->life_time_pct ?? 0).'%');
                $s3->setCellValue("K{$rIdx}", $cp->status ?? 'Normal');
                $s3->setCellValue("L{$rIdx}", $cp->next_plant ?? '-');

                $s3->getStyle("A{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $s3->getStyle("F{$rIdx}")->getNumberFormat()->setFormatCode('#,##0.0');
                $s3->getStyle("G{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $s3->getStyle("H{$rIdx}:I{$rIdx}")->getNumberFormat()->setFormatCode('#,##0.0');
                $s3->getStyle("J{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $s3->getStyle("K{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                if ($i % 2 === 1) {
                    $s3->getStyle("A{$rIdx}:L{$rIdx}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F9FAFB');
                }
                $s3->getRowDimension($rIdx)->setRowHeight(20);
                $rIdx++;
            }
        }
        $applyBorders($s3, 'A4:L'.($rIdx - 1));
        $autoFitColumns($s3, count($compHeaders));

        // ══════════════════════════════════════════════════════════════════════
        // SHEET 4: RIWAYAT BREAKDOWN
        // ══════════════════════════════════════════════════════════════════════
        $s4 = $spreadsheet->createSheet();
        $s4->setTitle('Riwayat Breakdown');
        $applySheetHeader($s4, "RIWAYAT BREAKDOWN & UNSCHEDULED REPAIR - UNIT {$unit->code_unit}", 'Total Breakdown: '.$breakdowns->count().' kasus pekerjaan', 'L');
        $bdHeaders = ['No', 'No. Work Order', 'Tipe WO', 'Waktu Breakdown', 'Waktu RFU', 'Downtime (Jam)', 'HM Unit', 'Status WO', 'Prioritas', 'Problem / Kerusakan', 'Tindakan Perbaikan', 'Mekanik / Vendor'];
        $applyTableHeaders($s4, $bdHeaders, 4);

        $rIdx = 5;
        if ($breakdowns->isEmpty()) {
            $s4->mergeCells('A5:L5');
            $s4->setCellValue('A5', 'Belum ada riwayat breakdown untuk unit ini.');
            $s4->getStyle('A5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $s4->getRowDimension(5)->setRowHeight(22);
            $rIdx = 6;
        } else {
            foreach ($breakdowns as $i => $bd) {
                $s4->setCellValue("A{$rIdx}", $i + 1);
                $s4->setCellValue("B{$rIdx}", $bd->no_wo ?? '-');
                $s4->setCellValue("C{$rIdx}", $bd->tipe_wo ?? 'BREAKDOWN');
                $s4->setCellValue("D{$rIdx}", $bd->waktu_breakdown ? date('d/m/Y H:i', strtotime($bd->waktu_breakdown)) : '-');
                $s4->setCellValue("E{$rIdx}", $bd->waktu_rfu ? date('d/m/Y H:i', strtotime($bd->waktu_rfu)) : '-');
                $s4->setCellValue("F{$rIdx}", (float) ($bd->durasi_hrs ?? 0));
                $s4->setCellValue("G{$rIdx}", (float) ($bd->hm_unit ?? 0));
                $s4->setCellValue("H{$rIdx}", $bd->status_wo ?? '-');
                $s4->setCellValue("I{$rIdx}", $bd->priority ?? '-');
                $s4->setCellValue("J{$rIdx}", $bd->problem ?? $bd->failure_description ?? '-');
                $s4->setCellValue("K{$rIdx}", $bd->corrective_action ?? $bd->job_instruction ?? '-');
                $s4->setCellValue("L{$rIdx}", $bd->pic ?? $bd->vendor ?? '-');

                $s4->getStyle("A{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $s4->getStyle("F{$rIdx}:G{$rIdx}")->getNumberFormat()->setFormatCode('#,##0.0');
                $s4->getStyle("H{$rIdx}:I{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                if ($i % 2 === 1) {
                    $s4->getStyle("A{$rIdx}:L{$rIdx}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F9FAFB');
                }
                $s4->getRowDimension($rIdx)->setRowHeight(20);
                $rIdx++;
            }
        }
        $applyBorders($s4, 'A4:L'.($rIdx - 1));
        $autoFitColumns($s4, count($bdHeaders));

        // ══════════════════════════════════════════════════════════════════════
        // SHEET 5: RIWAYAT SERVIS
        // ══════════════════════════════════════════════════════════════════════
        $s5 = $spreadsheet->createSheet();
        $s5->setTitle('Riwayat Servis');
        $applySheetHeader($s5, "RIWAYAT SERVIS & PERIODICAL MAINTENANCE (PM) - UNIT {$unit->code_unit}", 'Total Servis Terlaksana: '.$services->count().' riwayat servis', 'I');
        $srvHeaders = ['No', 'No. WO / Order', 'Tipe Servis', 'Tanggal / Waktu', 'HM Unit', 'Status', 'Deskripsi Problem / Scope', 'Tindakan / Action', 'PIC / Vendor'];
        $applyTableHeaders($s5, $srvHeaders, 4);

        $rIdx = 5;
        if ($services->isEmpty()) {
            $s5->mergeCells('A5:I5');
            $s5->setCellValue('A5', 'Belum ada riwayat servis untuk unit ini.');
            $s5->getStyle('A5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $s5->getRowDimension(5)->setRowHeight(22);
            $rIdx = 6;
        } else {
            foreach ($services as $i => $sv) {
                $orderNo = $sv->no_wo ?? $sv->order_no ?? '-';
                $serviceType = $sv->tipe_wo ?? $sv->maintenance_type ?? $sv->jenis_service ?? 'PM SCHEDULE';
                $tgl = $sv->waktu_breakdown ?? $sv->start_date ?? $sv->tanggal ?? $sv->created_at;
                $hmUnit = (float) ($sv->hm_unit ?? $sv->hm ?? 0);
                $status = $sv->status_wo ?? $sv->status ?? '-';
                $problem = $sv->problem ?? $sv->failure_description ?? $sv->keterangan ?? '-';
                $action = $sv->corrective_action ?? $sv->job_instruction ?? $sv->tindakan ?? '-';
                $pic = $sv->pic ?? $sv->vendor ?? $sv->supervisor ?? '-';

                $s5->setCellValue("A{$rIdx}", $i + 1);
                $s5->setCellValue("B{$rIdx}", $orderNo);
                $s5->setCellValue("C{$rIdx}", $serviceType);
                $s5->setCellValue("D{$rIdx}", $tgl ? date('d/m/Y H:i', strtotime($tgl)) : '-');
                $s5->setCellValue("E{$rIdx}", $hmUnit);
                $s5->setCellValue("F{$rIdx}", $status);
                $s5->setCellValue("G{$rIdx}", $problem);
                $s5->setCellValue("H{$rIdx}", $action);
                $s5->setCellValue("I{$rIdx}", $pic);

                $s5->getStyle("A{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $s5->getStyle("E{$rIdx}")->getNumberFormat()->setFormatCode('#,##0.0');
                $s5->getStyle("F{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                if ($i % 2 === 1) {
                    $s5->getStyle("A{$rIdx}:I{$rIdx}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F9FAFB');
                }
                $s5->getRowDimension($rIdx)->setRowHeight(20);
                $rIdx++;
            }
        }
        $applyBorders($s5, 'A4:I'.($rIdx - 1));
        $autoFitColumns($s5, count($srvHeaders));

        // ══════════════════════════════════════════════════════════════════════
        // SHEET 6: RIWAYAT BACKLOG
        // ══════════════════════════════════════════════════════════════════════
        $s6 = $spreadsheet->createSheet();
        $s6->setTitle('Riwayat Backlog');
        $applySheetHeader($s6, "RIWAYAT TEMUAN BACKLOG & DEFECT - UNIT {$unit->code_unit}", 'Total Temuan: '.$backlogs->count().' item backlog', 'J');
        $blHeaders = ['No', 'Tanggal Temuan', 'Tipe Servis', 'Temuan Masalah', 'Part Yang Diperlukan', 'Tindakan Mekanik', 'Tingkat / Priority', 'Target Pasang', 'Status', 'Lokasi'];
        $applyTableHeaders($s6, $blHeaders, 4);

        $rIdx = 5;
        if ($backlogs->isEmpty()) {
            $s6->mergeCells('A5:J5');
            $s6->setCellValue('A5', 'Belum ada temuan backlog untuk unit ini.');
            $s6->getStyle('A5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $s6->getRowDimension(5)->setRowHeight(22);
            $rIdx = 6;
        } else {
            foreach ($backlogs as $i => $bl) {
                $s6->setCellValue("A{$rIdx}", $i + 1);
                $s6->setCellValue("B{$rIdx}", $bl->tanggal_temuan ? date('d/m/Y', strtotime($bl->tanggal_temuan)) : ($bl->created_at ? date('d/m/Y', strtotime($bl->created_at)) : '-'));
                $s6->setCellValue("C{$rIdx}", $bl->tipe_service ?? '-');
                $s6->setCellValue("D{$rIdx}", $bl->temuan ?? $bl->description ?? '-');
                $s6->setCellValue("E{$rIdx}", $bl->part_diperlukan ?? '-');
                $s6->setCellValue("F{$rIdx}", $bl->tindakan_mekanik ?? '-');
                $s6->setCellValue("G{$rIdx}", $bl->tingkat_backlog ?? $bl->priority ?? '-');
                $s6->setCellValue("H{$rIdx}", $bl->target_pasang ? date('d/m/Y', strtotime($bl->target_pasang)) : '-');
                $s6->setCellValue("I{$rIdx}", $bl->status ?? 'Open');
                $s6->setCellValue("J{$rIdx}", $bl->lokasi ?? '-');

                $s6->getStyle("A{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $s6->getStyle("G{$rIdx}:I{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                if ($i % 2 === 1) {
                    $s6->getStyle("A{$rIdx}:J{$rIdx}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F9FAFB');
                }
                $s6->getRowDimension($rIdx)->setRowHeight(20);
                $rIdx++;
            }
        }
        $applyBorders($s6, 'A4:J'.($rIdx - 1));
        $autoFitColumns($s6, count($blHeaders));

        // ══════════════════════════════════════════════════════════════════════
        // SHEET 7: BUDGET PA
        // ══════════════════════════════════════════════════════════════════════
        $s7 = $spreadsheet->createSheet();
        $s7->setTitle('Budget PA');
        $applySheetHeader($s7, "BUDGET PHYSICAL AVAILABILITY & REALISASI BIAYA - UNIT {$unit->code_unit}", 'Ringkasan Forecast vs Realisasi Biaya Perawatan Unit', 'G');

        // Budget KPI Summary Cards
        $s7->setCellValue('A4', 'Kategori Budget');
        $s7->setCellValue('B4', 'Alokasi Biaya (Rp)');
        $s7->setCellValue('C4', 'Persentase / Realisasi');
        $s7->getStyle('A4:C4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '047857']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $s7->getRowDimension(4)->setRowHeight(22);

        $kpiRows = [
            ['Total Forecast', 'Rp '.$unitBudget['total_forecast']['amount'], 'Realisasi: '.$unitBudget['total_forecast']['vs_realisasi']],
            ['Planned Maintenance', 'Rp '.$unitBudget['planned_maintenance']['amount'], $unitBudget['planned_maintenance']['pct'].' dari Total'],
            ['Corrective Maintenance', 'Rp '.$unitBudget['corrective_maintenance']['amount'], $unitBudget['corrective_maintenance']['pct'].' dari Total'],
            ['Project Improvement', 'Rp '.$unitBudget['project_improvement']['amount'], $unitBudget['project_improvement']['pct'].' dari Total'],
        ];

        $rIdx = 5;
        foreach ($kpiRows as $kr) {
            $s7->setCellValue("A{$rIdx}", $kr[0]);
            $s7->setCellValue("B{$rIdx}", $kr[1]);
            $s7->setCellValue("C{$rIdx}", $kr[2]);
            $s7->getStyle("A{$rIdx}")->getFont()->setBold(true);
            $s7->getRowDimension($rIdx)->setRowHeight(20);
            $rIdx++;
        }
        $applyBorders($s7, 'A4:C'.($rIdx - 1));

        // Monthly Breakdown Table
        $rIdx += 2;
        $monthlyHeaders = ['No', 'Bulan', 'Planned Budget (Rp)', 'Realisasi (Rp)', 'Selisih (Rp)', 'Status Biaya'];
        $applyTableHeaders($s7, $monthlyHeaders, $rIdx);
        $startMonthlyRow = $rIdx;
        $rIdx++;

        foreach ($unitBudget['monthly'] as $i => $m) {
            $selisih = $m['planned'] - $m['realisasi'];
            $s7->setCellValue("A{$rIdx}", $i + 1);
            $s7->setCellValue("B{$rIdx}", $m['bulan']);
            $s7->setCellValue("C{$rIdx}", $m['planned']);
            $s7->setCellValue("D{$rIdx}", $m['realisasi']);
            $s7->setCellValue("E{$rIdx}", $selisih);
            $s7->setCellValue("F{$rIdx}", $m['status']);

            $s7->getStyle("A{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $s7->getStyle("C{$rIdx}:E{$rIdx}")->getNumberFormat()->setFormatCode('#,##0');
            $s7->getStyle("F{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            if ($i % 2 === 1) {
                $s7->getStyle("A{$rIdx}:F{$rIdx}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F9FAFB');
            }
            $s7->getRowDimension($rIdx)->setRowHeight(20);
            $rIdx++;
        }
        $applyBorders($s7, "A{$startMonthlyRow}:F".($rIdx - 1));
        $autoFitColumns($s7, 6);

        // ══════════════════════════════════════════════════════════════════════
        // SHEET 8: MAGNETIC PLUG
        // ══════════════════════════════════════════════════════════════════════
        $s8 = $spreadsheet->createSheet();
        $s8->setTitle('Magnetic Plug');
        $applySheetHeader($s8, "RIWAYAT INSPEKSI MAGNETIC PLUG - UNIT {$unit->code_unit}", 'Total Inspeksi: '.$magneticPlugs->count().' riwayat temuan serpihan logam', 'G');
        $mpHeaders = ['No', 'Tanggal Inspeksi', 'HM Unit', 'Komponen', 'Metode Filter', 'Rating Kondisi', 'Keterangan / Remarks'];
        $applyTableHeaders($s8, $mpHeaders, 4);

        $rIdx = 5;
        if ($magneticPlugs->isEmpty()) {
            $s8->mergeCells('A5:G5');
            $s8->setCellValue('A5', 'Belum ada data inspeksi magnetic plug untuk unit ini.');
            $s8->getStyle('A5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $s8->getRowDimension(5)->setRowHeight(22);
            $rIdx = 6;
        } else {
            foreach ($magneticPlugs as $i => $mp) {
                $s8->setCellValue("A{$rIdx}", $i + 1);
                $s8->setCellValue("B{$rIdx}", $mp->date ? date('d/m/Y', strtotime($mp->date)) : '-');
                $s8->setCellValue("C{$rIdx}", (float) ($mp->hm ?? 0));
                $s8->setCellValue("D{$rIdx}", $mp->component ?? '-');
                $s8->setCellValue("E{$rIdx}", $mp->metode_filter ?? '-');
                $s8->setCellValue("F{$rIdx}", $mp->rating ?? 'Normal');
                $s8->setCellValue("G{$rIdx}", $mp->remarks ?? '-');

                $s8->getStyle("A{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $s8->getStyle("B{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $s8->getStyle("C{$rIdx}")->getNumberFormat()->setFormatCode('#,##0.0');
                $s8->getStyle("F{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                if ($i % 2 === 1) {
                    $s8->getStyle("A{$rIdx}:G{$rIdx}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F9FAFB');
                }
                $s8->getRowDimension($rIdx)->setRowHeight(20);
                $rIdx++;
            }
        }
        $applyBorders($s8, 'A4:G'.($rIdx - 1));
        $autoFitColumns($s8, count($mpHeaders));

        // Activate sheet 1
        $spreadsheet->setActiveSheetIndex(0);

        $writer = new Xlsx($spreadsheet);
        $cleanUnitCode = preg_replace('/[^A-Za-z0-9_-]/', '_', $unit->code_unit);
        $fileName = "Riwayat_Lengkap_{$cleanUnitCode}_".date('Y-m-d_His').'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Get APL (Aplikasi Part & Pelumas) list and existing forms for a specific unit in JSON format.
     */
    public function getAplsJson(Unit $unit)
    {
        $apls = UnitApl::where(function ($query) use ($unit) {
            $query->where('unit_id', $unit->id)
                ->orWhere('is_global', true)
                ->orWhere(function ($q) use ($unit) {
                    $q->whereNull('unit_id')
                        ->where(function ($sq) use ($unit) {
                            $sq->whereNull('type_unit')
                                ->orWhere('type_unit', $unit->type_unit);
                        });
                });
        })->orderBy('id', 'asc')->get();

        $existingForms = PlantForm::where('unit_id', $unit->id)
            ->latest('date')
            ->take(10)
            ->get(['id', 'form_type', 'form_number', 'date', 'shift', 'service_type', 'status']);

        return response()->json([
            'unit' => [
                'id' => $unit->id,
                'code_unit' => $unit->code_unit,
                'model' => $unit->model,
                'type_unit' => $unit->type_unit,
                'current_hm' => $unit->hm,
            ],
            'apls' => $apls,
            'existingForms' => $existingForms,
        ]);
    }
}
