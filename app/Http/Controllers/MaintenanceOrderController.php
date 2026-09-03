<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceOrder;
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
        $query = MaintenanceOrder::with(['unit', 'parts.swapToUnit'])->latest('tanggal');

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
                    $q->where('model', $typeUnitFilter);
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

        $units = Unit::select('id', 'code_unit')->orderBy('code_unit')->get();

        return Inertia::render('MonitoringOrder/Index', [
            'orders' => $orders,
            'stats' => $stats,
            'units' => $units,
            'currentTab' => $tab,
            'filters' => [
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
                'codeUnitFilter' => $codeUnitFilter,
                'typeUnitFilter' => $typeUnitFilter,
                'progressFilter' => $progressFilter,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if (in_array($request->input('unit_id'), ['CONSUMABLES', 'ATK'])) {
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
        ]);

        $commonData = $request->only(['tanggal', 'unit_id', 'hm', 'lokasi', 'priority', 'status', 'pic']);

        // Auto generate no_order: HW-MOL-XXXXX (Reset every year)
        $currentYear = date('Y', strtotime($request->tanggal));
        $lastOrder = MaintenanceOrder::whereYear('tanggal', $currentYear)
            ->where('no_order', 'like', 'HW-MOL-%')
            ->orderBy('id', 'desc')
            ->first();

        $nextSequence = 1395;
        if ($lastOrder) {
            $lastSequence = (int) substr($lastOrder->no_order, 7);
            $nextSequence = max($lastSequence + 1, 1395);
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
        if (in_array($request->input('unit_id'), ['CONSUMABLES', 'ATK'])) {
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
        ]);

        $monitoring_order->update($request->only(['tanggal', 'unit_id', 'hm', 'lokasi', 'priority', 'status', 'pic']));

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
