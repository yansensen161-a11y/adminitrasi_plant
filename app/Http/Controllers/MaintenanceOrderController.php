<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceOrder;
use App\Models\MaintenanceOrderPart;
use App\Models\PartCanibal;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class MaintenanceOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = MaintenanceOrder::with(['unit', 'parts.swapToUnit'])->latest('updated_at');

        $tab = $request->input('tab', 'ORDERAN AKTIF');
        $dateFrom = $request->input('dateFrom');
        $dateTo = $request->input('dateTo');
        $codeUnitFilter = $request->input('codeUnitFilter');
        $typeUnitFilter = $request->input('typeUnitFilter');
        $progressFilter = $request->input('progressFilter');

        if ($tab === 'ORDERAN AKTIF') {
            $query->whereNotIn('status', ['CLOSED', 'CANCEL', 'DRAFT']);
        } elseif ($tab === 'HISTORICAL ORDER') {
            $query->whereIn('status', ['CLOSED', 'CANCEL']);
        } elseif ($tab === 'BACKLOG') {
            $query->where('priority', 'LOW')
                ->whereNotIn('status', ['CLOSED', 'CANCEL', 'DRAFT']);
        } elseif ($tab === 'SUPPLY PARTIAL') {
            $query->where('status', 'CANCEL');
        } elseif ($tab === 'DRAFT') {
            $query->where('status', 'DRAFT');
        }

        if ($dateFrom) {
            $query->whereDate('tanggal', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('tanggal', '<=', $dateTo);
        }
        if ($progressFilter) {
            $query->where('status', $progressFilter);
        }

        if ($codeUnitFilter || $typeUnitFilter) {
            $query->whereHas('unit', function ($q) use ($codeUnitFilter, $typeUnitFilter) {
                if ($codeUnitFilter) {
                    $q->where('code_unit', $codeUnitFilter);
                }
                if ($typeUnitFilter) {
                    $q->where('type_unit', $typeUnitFilter);
                }
            });
        }

        // Stats
        $stats = [
            'total' => MaintenanceOrder::count(),
            'open' => MaintenanceOrder::where('status', 'OPEN')->count(),
            'process' => MaintenanceOrder::where('status', 'PROCESS')->count(),
            'closed' => MaintenanceOrder::where('status', 'CLOSED')->count(),
            'cancel' => MaintenanceOrder::where('status', 'CANCEL')->count(),
            'draft' => MaintenanceOrder::where('status', 'DRAFT')->count(),
        ];

        // Get All Data
        $orders = $query->get();

        $units = Unit::select('id', 'code_unit', 'type_unit')->orderBy('code_unit')->get();

        $canibals = [];
        $canibalStats = ['total' => 0, 'available' => 0, 'used' => 0, 'unavailable' => 0];

        if ($tab === 'PART CANIBAL') {
            $canibalsQuery = PartCanibal::with(['unit', 'dariUnit', 'parts', 'maintenanceOrder'])->latest('tanggal');
            $canibalsList = $canibalsQuery->get()->map(function ($item) {
                $data = $item->toArray();
                $data['is_readonly'] = false;

                return $data;
            });

            $moParts = MaintenanceOrderPart::with(['order.unit', 'swapToUnit'])
                ->whereNotNull('swap_to_unit_id')
                ->get()
                ->map(function ($part) {
                    return [
                        'id' => 'mo_'.$part->id,
                        'tanggal' => $part->order ? $part->order->tanggal : null,
                        'unit_id' => $part->order ? $part->order->unit_id : null,
                        'unit' => $part->order ? $part->order->unit : null,
                        'hm' => $part->order ? $part->order->hm : null,
                        'dari_unit_id' => $part->swap_to_unit_id,
                        'dari_unit' => $part->swapToUnit,
                        'remark' => $part->remark_part_swap ?: 'Dari Monitoring Order List',
                        'no_order' => $part->order ? $part->order->no_order : null,
                        'pr' => $part->pr,
                        'po' => $part->po,
                        'eta_part' => $part->due_date_part,
                        'status' => ($part->order && $part->order->status == 'Close') ? 'USED' : 'AVAILABLE',
                        'parts' => [
                            [
                                'part_name' => $part->part_number,
                                'qty' => $part->qty,
                                'description' => $part->department,
                                'life_time' => null,
                                'component' => $part->component,
                            ],
                        ],
                        'is_readonly' => true,
                    ];
                });

            $canibals = collect($canibalsList)->concat($moParts)->sortByDesc('tanggal')->values();

            $canibalStats = [
                'total' => $canibals->count(),
                'available' => $canibals->where('status', 'AVAILABLE')->count(),
                'used' => $canibals->where('status', 'USED')->count(),
                'unavailable' => $canibals->where('status', 'UNAVAILABLE')->count(),
            ];
        }

        // --- MOCK DATA FOR NEW MCC DASHBOARD ---
        $mccStats = [
            'total_unit' => 185,
            'breakdown' => ['count' => 12, 'pct' => '6.5%'],
            'under_repair' => ['count' => 18, 'pct' => '9.7%'],
            'running' => ['count' => 148, 'pct' => '79.8%'],
            'total_wo' => 236,
        ];

        $chartStatusUnit = [
            ['name' => 'Running', 'value' => 148, 'color' => '#0b5c3e'], // green
            ['name' => 'Breakdown', 'value' => 12, 'color' => '#dc2626'], // red
            ['name' => 'Under Repair', 'value' => 18, 'color' => '#facc15'], // yellow
            ['name' => 'Standby', 'value' => 7, 'color' => '#6b7280'], // gray
        ];

        $chartWoStatus = [
            ['name' => 'Closed', 'value' => 168, 'color' => '#0b5c3e'], // green
            ['name' => 'On Process', 'value' => 42, 'color' => '#3b82f6'], // blue
            ['name' => 'Open', 'value' => 26, 'color' => '#facc15'], // yellow
        ];

        $chartTrendStatus = [
            'months' => ['Apr 2026', 'Mei 2026', 'Jun 2026', 'Jul 2026', 'Agu 2026', 'Sep 2026'],
            'running' => [140, 145, 148, 144, 146, 148],
            'under_repair' => [20, 18, 15, 18, 17, 18],
            'breakdown' => [8, 10, 12, 11, 10, 12],
        ];

        $mccUnits = [
            ['id' => 1, 'code_unit' => 'EX-056', 'equipment' => 'Excavator', 'lokasi' => 'Pit A', 'hm' => '8,245', 'status' => 'Running', 'pekerjaan' => '-', 'pic' => 'Andi', 'target' => '-'],
            ['id' => 2, 'code_unit' => 'EX-057', 'equipment' => 'Excavator', 'lokasi' => 'Pit A', 'hm' => '7,862', 'status' => 'Under Repair', 'pekerjaan' => 'Replace Hydraulic Pump', 'pic' => 'Budi', 'target' => '05-09-2026'],
            ['id' => 3, 'code_unit' => 'HD785-12', 'equipment' => 'Hauler', 'lokasi' => 'Pit B', 'hm' => '12,450', 'status' => 'Breakdown', 'pekerjaan' => 'Trouble Engine', 'pic' => 'Rudi', 'target' => '03-09-2026'],
            ['id' => 4, 'code_unit' => 'HD785-13', 'equipment' => 'Hauler', 'lokasi' => 'Pit B', 'hm' => '11,982', 'status' => 'Running', 'pekerjaan' => '-', 'pic' => 'Rudi', 'target' => '-'],
            ['id' => 5, 'code_unit' => 'D85-01', 'equipment' => 'Dozer', 'lokasi' => 'Pit A', 'hm' => '9,521', 'status' => 'Running', 'pekerjaan' => '-', 'pic' => 'Slamet', 'target' => '-'],
            ['id' => 6, 'code_unit' => 'GD655-01', 'equipment' => 'Motor Grader', 'lokasi' => 'Mainroad', 'hm' => '6,321', 'status' => 'Under Repair', 'pekerjaan' => 'Replace Circle Bearing', 'pic' => 'Joko', 'target' => '04-09-2026'],
            ['id' => 7, 'code_unit' => 'TRK-01', 'equipment' => 'Water Truck', 'lokasi' => 'Jetty', 'hm' => '4,982', 'status' => 'Running', 'pekerjaan' => '-', 'pic' => 'Anton', 'target' => '-'],
            ['id' => 8, 'code_unit' => 'SV-01', 'equipment' => 'Service Truck', 'lokasi' => 'Workshop', 'hm' => '5,678', 'status' => 'Running', 'pekerjaan' => '-', 'pic' => 'Deni', 'target' => '-'],
            ['id' => 9, 'code_unit' => 'LT-01', 'equipment' => 'Tower Lamp', 'lokasi' => 'Workshop', 'hm' => '2,351', 'status' => 'Standby', 'pekerjaan' => '-', 'pic' => 'Deni', 'target' => '-'],
            ['id' => 10, 'code_unit' => 'CM-01', 'equipment' => 'Compactor', 'lokasi' => 'Stockyard', 'hm' => '3,610', 'status' => 'Running', 'pekerjaan' => '-', 'pic' => 'Rudi', 'target' => '-'],
        ];

        $priorityJobs = [
            ['id' => 1, 'kode_unit' => 'HD785-12', 'pekerjaan' => 'Trouble Engine', 'prioritas' => 'High', 'target' => '03-09-2026'],
            ['id' => 2, 'kode_unit' => 'EX-057', 'pekerjaan' => 'Replace Hydraulic Pump', 'prioritas' => 'High', 'target' => '05-09-2026'],
            ['id' => 3, 'kode_unit' => 'GD655-01', 'pekerjaan' => 'Replace Circle Bearing', 'prioritas' => 'Medium', 'target' => '04-09-2026'],
            ['id' => 4, 'kode_unit' => 'CM-01', 'pekerjaan' => 'Overhaul Vibration Motor', 'prioritas' => 'Medium', 'target' => '06-09-2026'],
            ['id' => 5, 'kode_unit' => 'TRK-03', 'pekerjaan' => 'Replace Radiator', 'prioritas' => 'Medium', 'target' => '07-09-2026'],
        ];

        $notifications = [
            ['waktu' => '03-09-2026 08:15', 'pesan' => 'HM EX-056 mencapai 8,000 (P2H)', 'tipe' => 'Info'],
            ['waktu' => '03-09-2026 07:40', 'pesan' => 'Unit HD785-12 breakdown', 'tipe' => 'Alert'],
            ['waktu' => '02-09-2026 16:20', 'pesan' => 'WO #WO-202608-125 selesai', 'tipe' => 'Success'],
            ['waktu' => '02-09-2026 14:10', 'pesan' => 'Spare part belum tersedia: 708-21-00450', 'tipe' => 'Warning'],
            ['waktu' => '01-09-2026 10:05', 'pesan' => 'Jadwal PM EX-057 due soon', 'tipe' => 'Warning'],
        ];

        $upcomingMaintenance = [
            ['tanggal' => '04-09-2026', 'kode_unit' => 'EX-056', 'jenis' => 'PM 250 HM', 'interval' => '250', 'next_hm' => '8,500'],
            ['tanggal' => '05-09-2026', 'kode_unit' => 'TRK-01', 'jenis' => 'PM 500 HM', 'interval' => '500', 'next_hm' => '5,000'],
            ['tanggal' => '06-09-2026', 'kode_unit' => 'HD785-13', 'jenis' => 'PM 1,000 HM', 'interval' => '1,000', 'next_hm' => '13,000'],
            ['tanggal' => '08-09-2026', 'kode_unit' => 'D85-01', 'jenis' => 'PM 500 HM', 'interval' => '500', 'next_hm' => '10,000'],
            ['tanggal' => '10-09-2026', 'kode_unit' => 'GD655-01', 'jenis' => 'PM 250 HM', 'interval' => '250', 'next_hm' => '6,500'],
        ];

        $topDowntime = [
            ['no' => 1, 'kode_unit' => 'HD785-12', 'downtime' => 48.5, 'event' => 5],
            ['no' => 2, 'kode_unit' => 'EX-057', 'downtime' => 32.0, 'event' => 4],
            ['no' => 3, 'kode_unit' => 'CM-01', 'downtime' => 28.5, 'event' => 3],
            ['no' => 4, 'kode_unit' => 'TRK-03', 'downtime' => 26.0, 'event' => 3],
            ['no' => 5, 'kode_unit' => 'LT-01', 'downtime' => 18.5, 'event' => 2],
        ];
        // ----------------------------------------

        return Inertia::render('MonitoringOrder/Index', [
            'orders' => $orders,
            'stats' => $stats,
            'units' => $units,
            'canibals' => $canibals,
            'canibalStats' => $canibalStats,
            'currentTab' => $tab,
            'filters' => [
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
                'codeUnitFilter' => $codeUnitFilter,
                'typeUnitFilter' => $typeUnitFilter,
                'progressFilter' => $progressFilter,
            ],
            // MCC Mock Data
            'mccStats' => $mccStats,
            'chartStatusUnit' => $chartStatusUnit,
            'chartWoStatus' => $chartWoStatus,
            'chartTrendStatus' => $chartTrendStatus,
            'mccUnits' => $mccUnits,
            'priorityJobs' => $priorityJobs,
            'notifications' => $notifications,
            'upcomingMaintenance' => $upcomingMaintenance,
            'topDowntime' => $topDowntime,
        ]);
    }

    public function store(Request $request)
    {
        if (in_array($request->input('unit_id'), ['CONSUMABLES', 'ATK', 'TOOL'])) {
            $request->merge(['unit_id' => null]);
        }

        $request->validate([
            'tanggal' => 'required|date',
            'unit_id' => 'nullable|exists:units,id',
            'hm' => 'nullable|string|max:255',
            'lokasi' => 'required|string|max:255',
            'priority' => 'required|in:LOW,MEDIUM,HIGH',
            'status' => 'required|in:OPEN,PROCESS,CLOSED,CANCEL,DRAFT',
            'pic' => 'nullable|string|max:255',
            'wo_type' => 'nullable|string|max:255',
            'downtime_start' => 'nullable|date',
            'downtime_end' => 'nullable|date|after_or_equal:downtime_start',
            'actual_start' => 'nullable|date',
            'actual_end' => 'nullable|date|after_or_equal:actual_start',
            'failure_code' => 'nullable|string|max:255',
            'root_cause' => 'nullable|string',
            'action_taken' => 'nullable|string',
            'parts' => 'required|array|min:1',
            'parts.*.department' => 'required|string|max:255',
            'parts.*.part_number' => 'nullable|string|max:255',
            'parts.*.qty' => 'nullable|integer|min:1',
            'parts.*.component' => 'nullable|string|max:255',
            'parts.*.due_date_part' => 'nullable|date',
            'parts.*.pr' => 'nullable|string|max:255',
            'parts.*.po' => 'nullable|string|max:255',
            'parts.*.image' => 'nullable|image|max:10240',
            'parts.*.swap_to_unit_id' => 'nullable|exists:units,id',
            'parts.*.remark_part_swap' => 'nullable|string|max:255',
        ]);

        $commonData = $request->only([
            'tanggal', 'unit_id', 'hm', 'lokasi', 'priority', 'status', 'pic',
            'wo_type', 'downtime_start', 'downtime_end', 'actual_start', 'actual_end',
            'failure_code', 'root_cause', 'action_taken',
        ]);

        // Auto generate no_order: HW-MOL-XXXXX (Reset every year)
        $currentYear = date('Y', strtotime($request->tanggal));
        $lastOrder = MaintenanceOrder::whereYear('tanggal', $currentYear)
            ->where('no_order', 'like', 'HW-MOL-%')
            ->orderBy('id', 'desc')
            ->first();

        $nextSequence = 1439;
        if ($lastOrder) {
            $lastSequence = (int) substr($lastOrder->no_order, 7);
            $nextSequence = max($lastSequence + 1, 1439);
        }

        $noOrder = 'HW-MOL-'.str_pad($nextSequence, 5, '0', STR_PAD_LEFT);

        $order = MaintenanceOrder::create(array_merge($commonData, ['no_order' => $noOrder]));

        foreach ($request->parts as $index => $part) {
            $data = [
                'department' => $part['department'] ?? '',
                'part_number' => $part['part_number'] ?? null,
                'qty' => $part['qty'] ?? null,
                'component' => $part['component'] ?? null,
                'due_date_part' => $part['due_date_part'] ?? null,
                'pr' => $part['pr'] ?? null,
                'po' => $part['po'] ?? null,
                'swap_to_unit_id' => $part['swap_to_unit_id'] ?? null,
                'remark_part_swap' => $part['remark_part_swap'] ?? null,
            ];

            if ($request->hasFile("parts.{$index}.image")) {
                $data['image'] = $request->file("parts.{$index}.image")->store('orders', 'public');
            }

            $order->parts()->create($data);
        }

        $this->syncPartCanibal($noOrder);

        return redirect()->back()->with('success', 'Order berhasil ditambahkan.');
    }

    public function checkHistory(Request $request)
    {
        $partNumber = $request->input('part_number');
        $unitId = $request->input('unit_id');

        if (! $partNumber || ! $unitId) {
            return response()->json([]);
        }

        $history = MaintenanceOrder::whereHas('parts', function ($query) use ($partNumber) {
            $query->where('part_number', $partNumber);
        })
            ->where('unit_id', $unitId)
            ->orderBy('tanggal', 'desc')
            ->get();

        return response()->json($history);
    }

    public function findByNo(Request $request)
    {
        $noOrder = $request->input('no_order');

        $order = MaintenanceOrder::with('parts')->where('no_order', $noOrder)->first();

        if ($order) {
            return response()->json([
                'found' => true,
                'pr' => $order->parts->first()->pr ?? '',
                'po' => $order->parts->first()->po ?? '',
                'eta' => $order->parts->first()->due_date_part ? substr($order->parts->first()->due_date_part, 0, 10) : '',
            ]);
        }

        return response()->json(['found' => false]);
    }

    public function update(Request $request, MaintenanceOrder $monitoring_order)
    {
        if (in_array($request->input('unit_id'), ['CONSUMABLES', 'ATK', 'TOOL'])) {
            $request->merge(['unit_id' => null]);
        }

        $request->validate([
            'tanggal' => 'required|date',
            'unit_id' => 'nullable|exists:units,id',
            'hm' => 'nullable|string|max:255',
            'lokasi' => 'required|string|max:255',
            'priority' => 'required|in:LOW,MEDIUM,HIGH',
            'status' => 'required|in:OPEN,PROCESS,CLOSED,CANCEL,DRAFT',
            'pic' => 'nullable|string|max:255',
            'wo_type' => 'nullable|string|max:255',
            'downtime_start' => 'nullable|date',
            'downtime_end' => 'nullable|date|after_or_equal:downtime_start',
            'actual_start' => 'nullable|date',
            'actual_end' => 'nullable|date|after_or_equal:actual_start',
            'failure_code' => 'nullable|string|max:255',
            'root_cause' => 'nullable|string',
            'action_taken' => 'nullable|string',
            'parts' => 'required|array|min:1',
            'parts.*.id' => 'nullable|exists:maintenance_order_parts,id',
            'parts.*.department' => 'required|string|max:255',
            'parts.*.part_number' => 'nullable|string|max:255',
            'parts.*.qty' => 'nullable|integer|min:1',
            'parts.*.component' => 'nullable|string|max:255',
            'parts.*.due_date_part' => 'nullable|date',
            'parts.*.pr' => 'nullable|string|max:255',
            'parts.*.po' => 'nullable|string|max:255',
            'parts.*.image' => 'nullable|image|max:10240',
            'parts.*.swap_to_unit_id' => 'nullable|exists:units,id',
            'parts.*.remark_part_swap' => 'nullable|string|max:255',
        ]);

        $monitoring_order->update($request->only([
            'tanggal', 'unit_id', 'hm', 'lokasi', 'priority', 'status', 'pic',
            'wo_type', 'downtime_start', 'downtime_end', 'actual_start', 'actual_end',
            'failure_code', 'root_cause', 'action_taken',
        ]));

        $submittedPartIds = collect($request->parts)->pluck('id')->filter()->toArray();

        // Delete parts that were removed
        $monitoring_order->parts()->whereNotIn('id', $submittedPartIds)->get()->each(function ($part) {
            if ($part->image) {
                Storage::disk('public')->delete($part->image);
            }
            $part->delete();
        });

        // Update or create parts
        foreach ($request->parts as $index => $partData) {
            $data = [
                'department' => $partData['department'] ?? '',
                'part_number' => $partData['part_number'] ?? null,
                'qty' => $partData['qty'] ?? null,
                'component' => $partData['component'] ?? null,
                'due_date_part' => $partData['due_date_part'] ?? null,
                'pr' => $partData['pr'] ?? null,
                'po' => $partData['po'] ?? null,
                'swap_to_unit_id' => $partData['swap_to_unit_id'] ?? null,
                'remark_part_swap' => $partData['remark_part_swap'] ?? null,
            ];

            $part = null;
            if (! empty($partData['id'])) {
                $part = $monitoring_order->parts()->find($partData['id']);
            }

            if ($request->hasFile("parts.{$index}.image")) {
                if ($part && $part->image) {
                    Storage::disk('public')->delete($part->image);
                }
                $data['image'] = $request->file("parts.{$index}.image")->store('orders', 'public');
            }

            if ($part) {
                $part->update($data);
            } else {
                $monitoring_order->parts()->create($data);
            }
        }

        $this->syncPartCanibal($monitoring_order->no_order);

        return redirect()->back()->with('success', 'Order berhasil diubah.');
    }

    public function destroy(MaintenanceOrder $monitoring_order)
    {
        foreach ($monitoring_order->parts as $part) {
            if ($part->image) {
                Storage::disk('public')->delete($part->image);
            }
        }
        $noOrder = $monitoring_order->no_order;
        $monitoring_order->delete();

        $this->syncPartCanibal($noOrder);

        return redirect()->back()->with('success', 'Order berhasil dihapus.');
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

            if ($highestRow < 2) {
                return redirect()->back()->withErrors(['file' => 'File Excel kosong atau tidak memiliki baris data.']);
            }

            $importedCount = 0;
            $orderHeaders = [];

            for ($row = 2; $row <= $highestRow; $row++) {
                $noOrder = $worksheet->getCell([1, $row])->getValue(); // col 1
                $tanggal = $worksheet->getCell([2, $row])->getFormattedValue(); // col 2
                $codeUnit = $worksheet->getCell([3, $row])->getValue(); // col 3
                $lokasi = $worksheet->getCell([4, $row])->getValue(); // col 4
                $department = $worksheet->getCell([5, $row])->getValue(); // col 5 (description)
                $priority = $worksheet->getCell([6, $row])->getValue(); // col 6
                $status = $worksheet->getCell([7, $row])->getValue(); // col 7
                $pic = $worksheet->getCell([8, $row])->getValue(); // col 8

                if (empty($noOrder) || empty($codeUnit)) {
                    continue;
                }

                $unit = Unit::where('code_unit', $codeUnit)->first();
                if (! $unit) {
                    continue;
                }

                $parsedDate = date('Y-m-d');
                if ($tanggal) {
                    $timestamp = strtotime(str_replace('/', '-', $tanggal));
                    if ($timestamp !== false) {
                        $parsedDate = date('Y-m-d', $timestamp);
                    }
                }

                if (! isset($orderHeaders[$noOrder])) {
                    $order = MaintenanceOrder::firstOrCreate(
                        ['no_order' => $noOrder],
                        [
                            'tanggal' => $parsedDate,
                            'unit_id' => $unit->id,
                            'lokasi' => $lokasi ?? '-',
                            'priority' => strtoupper($priority) ?: 'LOW',
                            'status' => strtoupper($status) ?: 'OPEN',
                            'pic' => $pic,
                        ]
                    );
                    $orderHeaders[$noOrder] = $order;
                } else {
                    $order = $orderHeaders[$noOrder];
                }

                $order->parts()->create([
                    'department' => $department ?? '-',
                    'qty' => 1,
                    'component' => '-',
                    'part_number' => '-',
                ]);
                $importedCount++;
            }

            foreach (array_keys($orderHeaders) as $noOrder) {
                $this->syncPartCanibal($noOrder);
            }

            if ($importedCount > 0) {
                return redirect()->back()->with('success', "$importedCount baris data berhasil diimpor.");
            } else {
                return redirect()->back()->withErrors(['file' => 'Tidak ada data valid yang bisa diimpor.']);
            }
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['file' => 'Gagal memproses file: '.$e->getMessage()]);
        }
    }

    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Order');

        $headers = ['No Order', 'Tanggal', 'Code Unit', 'Lokasi', 'Department', 'Priority', 'Status', 'PIC'];
        $sheet->fromArray([$headers], null, 'A1');

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0A4D3C'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ];
        $sheet->getStyle('A1:H1')->applyFromArray($headerStyle);

        $samples = [
            ['ORD-001', '2024-05-10', 'EXC-201', 'Pit 1', 'Mining', 'HIGH', 'OPEN', 'Budi'],
            ['ORD-002', '2024-05-12', 'DT-105', 'Workshop', 'Support', 'MEDIUM', 'PROCESS', 'Andi'],
        ];
        $sheet->fromArray($samples, null, 'A2');

        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Import_Order.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function syncPartCanibal($noOrder)
    {
        $orders = MaintenanceOrder::where('no_order', $noOrder)->get();
        $swapOrders = $orders->filter(function ($o) {
            return ! empty($o->swap_to_unit_id);
        });

        if ($swapOrders->isNotEmpty()) {
            $firstSwap = $swapOrders->first();
            $canibal = PartCanibal::updateOrCreate(
                ['no_order' => $noOrder],
                [
                    'tanggal' => $firstSwap->tanggal,
                    'unit_id' => $firstSwap->swap_to_unit_id,
                    'dari_unit_id' => $firstSwap->unit_id,
                    'pr' => $firstSwap->pr,
                    'po' => $firstSwap->po,
                    'eta_part' => $firstSwap->due_date_part,
                    'status' => 'Waiting part',
                    'remark' => $firstSwap->remark_part_swap ?: 'Dari Monitoring Order List',
                ]
            );

            // Re-sync parts
            $canibal->parts()->delete();
            foreach ($swapOrders as $order) {
                $canibal->parts()->create([
                    'part_name' => $order->part_number ?? '-',
                    'qty' => $order->qty ?? 1,
                    'component' => $order->component ?? '-',
                    'description' => $order->department ?? '-',
                ]);
            }
        } else {
            $canibal = PartCanibal::where('no_order', $noOrder)->first();
            if ($canibal) {
                $canibal->delete();
            }
        }
    }
}
