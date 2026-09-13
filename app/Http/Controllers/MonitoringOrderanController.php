<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceOrder;
use App\Models\MaintenanceOrderPart;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class MonitoringOrderanController extends Controller
{
    public function index(Request $request)
    {
        $sortBy = $request->get('sortBy', 'terbaru');

        $query = MaintenanceOrder::with(['unit', 'parts.swapToUnit']);

        // Sorting
        match ($sortBy) {
            'terlama' => $query->oldest('tanggal'),
            'no_asc' => $query->orderBy('no_order', 'asc'),
            'no_desc' => $query->orderBy('no_order', 'desc'),
            default => $query->latest('tanggal'),  // terbaru
        };

        // Pencarian berdasarkan nomor order atau unit
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_order', 'like', "%{$search}%")
                    ->orWhereHas('unit', function ($qu) use ($search) {
                        $qu->where('code_unit', 'like', "%{$search}%");
                    });
            });
        }

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter tanggal
        if ($request->filled('dateFrom')) {
            $query->whereDate('tanggal', '>=', $request->dateFrom);
        }
        if ($request->filled('dateTo')) {
            $query->whereDate('tanggal', '<=', $request->dateTo);
        }

        $orders = $query->get();
        $units = Unit::select('id', 'code_unit', 'type_unit', 'hm')->orderBy('code_unit')->get();

        return Inertia::render('MonitoringOrderan/Index', [
            'orders' => $orders,
            'units' => $units,
            'filters' => $request->only(['search', 'status', 'dateFrom', 'dateTo', 'sortBy']),
        ]);
    }

    public function create()
    {
        $units = Unit::select('id', 'code_unit', 'type_unit', 'hm')->orderBy('code_unit')->get();
        return Inertia::render('MonitoringOrderan/Form', [
            'units' => $units,
            'mode' => 'create'
        ]);
    }

    public function edit($id)
    {
        $order = MaintenanceOrder::with('parts.swapToUnit')->findOrFail($id);
        $units = Unit::select('id', 'code_unit', 'type_unit', 'hm')->orderBy('code_unit')->get();
        
        return Inertia::render('MonitoringOrderan/Form', [
            'order' => $order,
            'units' => $units,
            'mode' => 'edit'
        ]);
    }

    public function getPartLifetime(Request $request)
    {
        $request->validate([
            'unit_id' => 'required',
            'part_number' => 'required|string',
            'current_hm' => 'nullable|numeric',
            'order_id' => 'nullable',
        ]);

        $query = MaintenanceOrder::where('unit_id', $request->unit_id)
            ->whereHas('parts', function ($q) use ($request) {
                $q->where('part_number', $request->part_number);
            });

        if ($request->order_id) {
            $query->where('id', '!=', $request->order_id);
        }

        $lastOrder = $query->latest('tanggal')->first();

        if ($lastOrder && $lastOrder->hm !== null && $request->current_hm !== null) {
            $lifeTime = max(0, $request->current_hm - $lastOrder->hm);

            return response()->json(['life_time' => $lifeTime]);
        }

        return response()->json(['life_time' => null]);
    }

    public function store(Request $request)
    {
        $nonUnitValues = ['ATK', 'CONSUMABLE', 'TOOL'];
        $isNonUnit = in_array($request->unit_id, $nonUnitValues);

        $request->validate([
            'tanggal' => 'required|date',
            'unit_id' => $isNonUnit ? 'required|string' : 'required|exists:units,id',
            'hm' => 'nullable',
            'lokasi' => 'nullable|string',
            'component' => 'nullable|string',
            'component_name' => 'nullable|string',
            'priority' => 'required|in:LOW,MEDIUM,HIGH,BACKLOG',
            'status' => 'required|string',
            'pic' => 'nullable|string',
            'root_cause' => 'nullable|string',
            'action_taken' => 'nullable|string',
            'parts' => 'nullable|array',
        ]);

        $order = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $isNonUnit) {
            $currentYear = date('Y', strtotime($request->tanggal));
            
            // Lock the table to prevent duplicate numbering
            $lastOrder = MaintenanceOrder::whereYear('tanggal', $currentYear)
                ->where('no_order', 'like', 'HW-MOL-%')
                ->lockForUpdate()
                ->orderBy('id', 'desc')
                ->first();

            $nextSequence = 1439;
            if ($lastOrder) {
                $lastSequence = (int) substr($lastOrder->no_order, 7);
                $nextSequence = max($lastSequence + 1, 1439);
            }

            $noOrder = 'HW-MOL-'.str_pad($nextSequence, 5, '0', STR_PAD_LEFT);

            return MaintenanceOrder::create([
                'no_order' => $noOrder,
            'tanggal' => $request->tanggal,
            'unit_id' => $isNonUnit ? null : $request->unit_id,
            'hm' => $request->hm,
            'lokasi' => $isNonUnit ? $request->unit_id.($request->lokasi ? ' - '.$request->lokasi : '') : $request->lokasi,
            'component' => $request->component,
            'component_name' => $request->component_name,
            'priority' => $request->priority,
            'status' => $request->status,
            'pic' => $request->pic,
            'root_cause' => $request->root_cause,
            'action_taken' => $request->action_taken,
        ]);

        if ($request->has('parts') && is_array($request->parts)) {
            foreach ($request->parts as $part) {
                $order->parts()->create([
                    'part_number' => $part['part_number'] ?? '-',
                    'department' => $part['description'] ?? '-',
                    'life_time' => $part['life_time'] ?? null,
                    'qty' => $part['qty'] ?? 1,
                    'due_date_part' => $part['due_date_part'] ?? null,
                    'pr' => $part['pr'] ?? null,
                    'po' => $part['po'] ?? null,
                    'swap_to_unit_id' => $part['swap_to_unit_id'] ?? null,
                ]);
            }
        } else {
            // Create minimal 1 empty part
            $order->parts()->create([
                'part_number' => '-',
                'department' => '-',
                'qty' => 1,
            ]);
        }

        }); // End transaction

        return redirect()->route('monitoring-orderan.index')->with('success', 'Work Order berhasil dibuat.');
    }

    public function update(Request $request, MaintenanceOrder $monitoring_orderan)
    {
        $nonUnitValues = ['ATK', 'CONSUMABLE', 'TOOL'];
        $isNonUnit = in_array($request->unit_id, $nonUnitValues);

        $request->validate([
            'tanggal' => 'required|date',
            'unit_id' => $isNonUnit ? 'required|string' : 'required|exists:units,id',
            'hm' => 'nullable',
            'lokasi' => 'nullable|string',
            'component' => 'nullable|string',
            'component_name' => 'nullable|string',
            'priority' => 'required|in:LOW,MEDIUM,HIGH,BACKLOG',
            'status' => 'required|string',
            'pic' => 'nullable|string',
            'root_cause' => 'nullable|string',
            'action_taken' => 'nullable|string',
            'parts' => 'nullable|array',
        ]);

        $monitoring_orderan->update([
            'tanggal' => $request->tanggal,
            'unit_id' => $isNonUnit ? null : $request->unit_id,
            'hm' => $request->hm,
            'lokasi' => $isNonUnit ? $request->unit_id.($request->lokasi ? ' - '.$request->lokasi : '') : $request->lokasi,
            'component' => $request->component,
            'component_name' => $request->component_name,
            'priority' => $request->priority,
            'status' => $request->status,
            'pic' => $request->pic,
            'root_cause' => $request->root_cause,
            'action_taken' => $request->action_taken,
        ]);

        $monitoring_orderan->parts()->delete();

        if ($request->has('parts') && is_array($request->parts)) {
            foreach ($request->parts as $part) {
                $monitoring_orderan->parts()->create([
                    'part_number' => $part['part_number'] ?? '-',
                    'department' => $part['description'] ?? '-',
                    'life_time' => $part['life_time'] ?? null,
                    'qty' => $part['qty'] ?? 1,
                    'due_date_part' => $part['due_date_part'] ?? null,
                    'pr' => $part['pr'] ?? null,
                    'po' => $part['po'] ?? null,
                    'swap_to_unit_id' => $part['swap_to_unit_id'] ?? null,
                ]);
            }
        } else {
            // Create minimal 1 empty part
            $monitoring_orderan->parts()->create([
                'part_number' => '-',
                'department' => '-',
                'qty' => 1,
            ]);
        }

        return redirect()->route('monitoring-orderan.index')->with('success', 'Work Order berhasil diupdate.');
    }

    public function destroy(MaintenanceOrder $monitoring_orderan)
    {
        $monitoring_orderan->parts()->delete();
        $monitoring_orderan->delete();

        return redirect()->back()->with('success', 'Work Order berhasil dihapus.');
    }

    public function destroyAll()
    {
        // Hapus semua parts terlebih dahulu untuk menghindari constraint error
        MaintenanceOrderPart::query()->delete();
        // Hapus semua order
        MaintenanceOrder::query()->delete();

        return redirect()->back()->with('success', 'Semua data Work Order berhasil dihapus (Reset Data).');
    }

    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import Orderan');

        $headers = [
            'Tanggal', 'NO Unit', 'Component', 'Part Number', 'Description', 'Qty', 'HM',
            'Remark/keterangan', 'Swap', 'No Order', 'PR', 'PO', 'Eta Part', 'Status',
        ];

        $sheet->fromArray([$headers], null, 'A1');

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0f5132'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ];
        $sheet->getStyle('A1:N1')->applyFromArray($headerStyle);

        $samples = [
            ['2026-09-01', 'EX2001', 'ENGINE', '14X-27-11110', 'Filter', 1, '15000', 'Rutin', 'HD785', '', 'PR-123', 'PO-456', '2026-09-05', 'WAITING PART'],
        ];
        $sheet->fromArray($samples, null, 'A2');

        foreach (range('A', 'N') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Import_Monitoring_Orderan.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            // Remove header
            array_shift($rows);

            $importedCount = 0;
            $orderHeaders = [];

            foreach ($rows as $row) {
                if (empty(array_filter($row))) {
                    continue;
                }

                $tanggal = trim($row[0] ?? '');
                $codeUnit = trim($row[1] ?? '');
                $component = trim($row[2] ?? '');
                $partNumber = trim($row[3] ?? '-');
                $description = trim($row[4] ?? '-');
                $qty = (int) trim($row[5] ?? 1);
                $hm = trim($row[6] ?? '');
                $remark = trim($row[7] ?? '');
                $swapCodeUnit = trim($row[8] ?? '');
                $noOrder = trim($row[9] ?? '');
                $pr = trim($row[10] ?? '');
                $po = trim($row[11] ?? '');
                $etaPartDate = trim($row[12] ?? '');

                // Clean and validate status
                $rawStatus = strtoupper(trim($row[13] ?? ''));
                if ($rawStatus == 'COMPLATED') {
                    $rawStatus = 'COMPLETED';
                }

                $validStatuses = ['OPEN', 'PROCESS', 'CLOSED', 'CANCEL', 'WAITING PART', 'COMPLETED', 'CANCEL ORDER', 'DRAFT', 'PARTIAL'];
                $status = in_array($rawStatus, $validStatuses) ? $rawStatus : (! empty($rawStatus) ? 'WAITING PART' : '');

                if (empty($codeUnit)) {
                    continue;
                }

                if (empty($tanggal)) {
                    $tanggal = date('Y-m-d');
                } elseif (strpos($tanggal, '/') !== false) {
                    $tanggal = date('Y-m-d', strtotime(str_replace('/', '-', $tanggal)));
                }

                if (! empty($etaPartDate) && strpos($etaPartDate, '/') !== false) {
                    $etaPartDate = date('Y-m-d', strtotime(str_replace('/', '-', $etaPartDate)));
                }

                $nonUnitValues = ['ATK', 'CONSUMABLE', 'TOOL'];
                $isNonUnit = in_array(strtoupper($codeUnit), $nonUnitValues);

                $unit = null;
                if (! $isNonUnit) {
                    $unit = Unit::where('code_unit', $codeUnit)->first();
                    if (! $unit) {
                        continue;
                    }
                }

                $swapUnit = ! empty($swapCodeUnit) ? Unit::where('code_unit', $swapCodeUnit)->first() : null;

                if (! empty($noOrder)) {
                    $existingOrder = MaintenanceOrder::where('no_order', $noOrder)->first();
                    if ($existingOrder) {
                        if (! isset($orderHeaders[$noOrder])) {
                            $orderHeaders[$noOrder] = $existingOrder;

                            if (! empty($tanggal)) {
                                $existingOrder->tanggal = $tanggal;
                            }
                            if ($unit) {
                                $existingOrder->unit_id = $unit->id;
                            } elseif ($isNonUnit) {
                                $existingOrder->unit_id = null;
                            }
                            if (! empty($hm)) {
                                $existingOrder->hm = $hm;
                            }
                            if (! empty($component) && $component !== '-') {
                                $existingOrder->component = $component;
                            }
                            if (! empty($status)) {
                                $existingOrder->status = strtoupper($status);
                            }
                            if (! empty($remark) && $remark !== '-') {
                                $existingOrder->action_taken = $remark;
                            }
                            $existingOrder->save();
                        }

                        // Update or Create Part
                        $part = $existingOrder->parts()->where('part_number', $partNumber)->first();

                        // Handle updating placeholder part
                        if (! $part && $partNumber !== '-') {
                            $placeholderPart = $existingOrder->parts()->where('part_number', '-')->first();
                            if ($placeholderPart && $existingOrder->parts()->count() === 1) {
                                $part = $placeholderPart;
                            }
                        }

                        if ($part) {
                            $part->update([
                                'part_number' => $partNumber,
                                'pr' => ! empty($pr) ? $pr : $part->pr,
                                'po' => ! empty($po) ? $po : $part->po,
                                'due_date_part' => ! empty($etaPartDate) ? $etaPartDate : $part->due_date_part,
                                'qty' => $qty > 0 ? $qty : $part->qty,
                                'department' => (! empty($description) && $description !== '-') ? $description : $part->department,
                                'swap_to_unit_id' => $swapUnit ? $swapUnit->id : $part->swap_to_unit_id,
                                'component' => (! empty($component) && $component !== '-') ? $component : $part->component,
                            ]);
                        } else {
                            $existingOrder->parts()->create([
                                'part_number' => $partNumber,
                                'department' => $description,
                                'qty' => $qty > 0 ? $qty : 1,
                                'component' => $component,
                                'due_date_part' => ! empty($etaPartDate) ? $etaPartDate : null,
                                'swap_to_unit_id' => $swapUnit ? $swapUnit->id : null,
                                'pr' => $pr,
                                'po' => $po,
                            ]);
                        }
                        $importedCount++;

                        continue;
                    }
                }

                // Gunakan kombinasi code unit sebagai referensi grup jika noOrder kosong atau tidak ditemukan
                $groupKey = ! empty($noOrder) ? $noOrder : 'NEW_'.$tanggal.'_'.$codeUnit;

                if (! isset($orderHeaders[$groupKey])) {
                    if (empty($noOrder)) {
                        // Generate No Order
                        $currentYear = date('Y', strtotime($tanggal));
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
                    }

                    $order = MaintenanceOrder::create([
                        'no_order' => $noOrder,
                        'tanggal' => $tanggal,
                        'unit_id' => $isNonUnit ? null : $unit->id,
                        'hm' => $hm,
                        'lokasi' => $isNonUnit ? strtoupper($codeUnit) : '-', // Default
                        'component' => $component, // From import column C
                        'priority' => 'BACKLOG', // Default
                        'status' => ! empty($status) ? strtoupper($status) : 'WAITING PART',
                        'pic' => '-', // Default
                        'root_cause' => '-', // Default
                        'action_taken' => $remark,
                    ]);
                    $orderHeaders[$groupKey] = $order;
                } else {
                    $order = $orderHeaders[$groupKey];
                }

                $order->parts()->create([
                    'part_number' => $partNumber,
                    'department' => $description,
                    'qty' => $qty > 0 ? $qty : 1,
                    'component' => $component,
                    'due_date_part' => ! empty($etaPartDate) ? $etaPartDate : null,
                    'swap_to_unit_id' => $swapUnit ? $swapUnit->id : null,
                    'pr' => $pr,
                    'po' => $po,
                ]);
                $importedCount++;
            }

            if ($importedCount > 0) {
                return redirect()->back()->with('success', "$importedCount baris part data berhasil diimpor.");
            } else {
                return redirect()->back()->withErrors(['file' => 'Tidak ada data valid yang bisa diimpor. Pastikan code unit benar.']);
            }
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['file' => 'Gagal memproses file: '.$e->getMessage()]);
        }
    }
}
