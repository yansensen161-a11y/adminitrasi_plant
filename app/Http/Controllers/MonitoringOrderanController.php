<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceOrder;
use App\Models\MaintenanceOrderPart;
use App\Models\PartOrderLifetime;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class MonitoringOrderanController extends Controller
{
    public function index(Request $request)
    {
        $sortBy = $request->get('sortBy', 'terbaru');

        $query = MaintenanceOrder::with(['unit', 'parts.swapToUnit'])
            ->where(function ($q) {
                $q->whereNull('wo_type')
                    ->orWhere('wo_type', '!=', 'PCR');
            })
            ->where('no_order', 'not like', 'PCR-%');

        // Sorting: selalu utamakan no_order paling tinggi secara default
        match ($sortBy) {
            'terlama' => $query->oldest('tanggal')->orderBy('no_order', 'asc'),
            'no_asc' => $query->orderBy('no_order', 'asc'),
            'no_desc' => $query->orderBy('no_order', 'desc'),
            default => $query->orderBy('no_order', 'desc'),
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
        $suggestedNoOrder = MaintenanceOrder::generateNextNoOrder();

        return Inertia::render('MonitoringOrderan/Form', [
            'units' => $units,
            'mode' => 'create',
            'suggestedNoOrder' => $suggestedNoOrder,
        ]);
    }

    public function edit(MaintenanceOrder $monitoring_orderan)
    {
        $monitoring_orderan->load('parts.swapToUnit');
        $units = Unit::select('id', 'code_unit', 'type_unit', 'hm')->orderBy('code_unit')->get();

        return Inertia::render('MonitoringOrderan/Form', [
            'order' => $monitoring_orderan,
            'units' => $units,
            'mode' => 'edit',
        ]);
    }

    public function print(MaintenanceOrder $monitoring_orderan)
    {
        $monitoring_orderan->load(['unit', 'parts.swapToUnit']);

        return view('pdf.maintenance-order', [
            'order' => $monitoring_orderan,
            'isBrowserPrint' => true,
        ]);
    }

    public function exportPdf(Request $request, MaintenanceOrder $monitoring_orderan)
    {
        $monitoring_orderan->load(['unit', 'parts.swapToUnit']);

        $pdf = Pdf::loadView('pdf.maintenance-order', [
            'order' => $monitoring_orderan,
            'isBrowserPrint' => false,
        ]);
        $pdf->setPaper('a4', 'portrait');

        $cleanNo = str_replace(['/', '\\', ' '], '_', $monitoring_orderan->no_order);
        $fileName = "MOL_{$cleanNo}.pdf";

        if ($request->query('download') == '1') {
            return $pdf->download($fileName);
        }

        return $pdf->stream($fileName);
    }

    public function exportPdfByQuery(Request $request)
    {
        $order = null;
        if ($request->filled('no_order')) {
            $order = MaintenanceOrder::where('no_order', $request->no_order)->first();
        } elseif ($request->filled('id')) {
            $order = MaintenanceOrder::find($request->id);
        }

        if (! $order) {
            abort(404, 'Nomor order tidak ditemukan.');
        }

        return $this->exportPdf($request, $order);
    }

    public function exportExcelOrder(MaintenanceOrder $monitoring_orderan)
    {
        $monitoring_orderan->load(['unit', 'parts.swapToUnit']);
        $order = $monitoring_orderan;

        $spreadsheet = new Spreadsheet;
        $spreadsheet->getDefaultStyle()->getFont()->setName('Calibri')->setSize(10);
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('MOL - '.substr($order->no_order, 0, 20));

        // Company Header
        $sheet->mergeCells('A1:I1');
        $sheet->setCellValue('A1', 'PT MITRA ABADI MAHAKAM - PLANT DEPARTMENT');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(13)->getColor()->setARGB('FF064E3B');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

        $sheet->mergeCells('A2:I2');
        $sheet->setCellValue('A2', 'MAINTENANCE ORDER LOG (MOL) / PERMINTAAN PART');
        $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(11)->getColor()->setARGB('FF1F2937');

        // Order Info Cards (Row 4 to 8)
        $sheet->setCellValue('A4', 'Nomor Order');
        $sheet->setCellValue('B4', ': '.$order->no_order);
        $sheet->getStyle('B4')->getFont()->setBold(true);

        $sheet->setCellValue('D4', 'Status Order');
        $sheet->setCellValue('E4', ': '.($order->status ?: '-'));
        $sheet->getStyle('E4')->getFont()->setBold(true);

        $sheet->setCellValue('G4', 'Prioritas');
        $sheet->setCellValue('H4', ': '.($order->priority ?: '-'));

        $sheet->setCellValue('A5', 'Tanggal Order');
        $sheet->setCellValue('B5', ': '.($order->tanggal ?: '-'));

        $sheet->setCellValue('D5', 'Unit Code');
        $unitLabel = $order->unit ? $order->unit->code_unit : ($order->lokasi ?: '-');
        $sheet->setCellValue('E5', ': '.$unitLabel);
        $sheet->getStyle('E5')->getFont()->setBold(true);

        $sheet->setCellValue('G5', 'Model Unit');
        $sheet->setCellValue('H5', ': '.($order->unit?->model ?: '-'));

        $sheet->setCellValue('A6', 'Current HM');
        $sheet->setCellValue('B6', ': '.($order->hm ?? '-'));

        $sheet->setCellValue('D6', 'Lokasi Unit');
        $sheet->setCellValue('E6', ': '.($order->lokasi ?: '-'));

        $sheet->setCellValue('G6', 'PIC / Pemohon');
        $sheet->setCellValue('H6', ': '.($order->pic ?: '-'));

        $sheet->setCellValue('A7', 'Komponen');
        $compName = $order->component_name ?: ($order->component ?: '-');
        $sheet->setCellValue('B7', ': '.$compName);

        $sheet->setCellValue('D7', 'Problem / Root Cause');
        $sheet->setCellValue('E7', ': '.($order->root_cause ?: '-'));

        $sheet->setCellValue('A8', 'Tindakan / Action Taken');
        $sheet->mergeCells('B8:I8');
        $sheet->setCellValue('B8', ': '.($order->action_taken ?: '-'));

        $sheet->getStyle('A4:A8')->getFont()->setBold(true)->getColor()->setARGB('FF4B5563');
        $sheet->getStyle('D4:D7')->getFont()->setBold(true)->getColor()->setARGB('FF4B5563');
        $sheet->getStyle('G4:G6')->getFont()->setBold(true)->getColor()->setARGB('FF4B5563');

        $infoBoxStyle = [
            'borders' => [
                'outline' => [
                    'borderStyle' => Border::BORDER_MEDIUM,
                    'color' => ['argb' => 'FF064E3B'],
                ],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FFF9FAFB'],
            ],
        ];
        $sheet->getStyle('A4:I8')->applyFromArray($infoBoxStyle);

        // Parts Table Section (Starts at Row 10)
        $startRow = 10;
        $headers = [
            'A' => 'No',
            'B' => 'Part Number',
            'C' => 'Nama / Deskripsi Part',
            'D' => 'Qty',
            'E' => 'PR Number',
            'F' => 'PO Number',
            'G' => 'ETA Part (Due Date)',
            'H' => 'Swap Unit',
            'I' => 'Komponen',
        ];

        foreach ($headers as $col => $title) {
            $sheet->setCellValue("{$col}{$startRow}", $title);
        }

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 10],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF064E3B'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF000000']],
            ],
        ];
        $sheet->getStyle("A{$startRow}:I{$startRow}")->applyFromArray($headerStyle);
        $sheet->getRowDimension($startRow)->setRowHeight(24);

        $rowIdx = $startRow + 1;
        $parts = $order->parts ?: [];
        $no = 1;

        if (count($parts) > 0) {
            foreach ($parts as $part) {
                $sheet->setCellValue("A{$rowIdx}", $no);
                $sheet->setCellValue("B{$rowIdx}", $part->part_number ?: '-');
                $sheet->setCellValue("C{$rowIdx}", $part->department ?: '-');
                $sheet->setCellValue("D{$rowIdx}", $part->qty ?: 1);
                $sheet->setCellValue("E{$rowIdx}", $part->pr ?: '-');
                $sheet->setCellValue("F{$rowIdx}", $part->po ?: '-');
                $sheet->setCellValue("G{$rowIdx}", $part->due_date_part ?: '-');
                $sheet->setCellValue("H{$rowIdx}", $part->swapToUnit?->code_unit ?: '-');
                $sheet->setCellValue("I{$rowIdx}", $part->component ?: ($order->component ?: '-'));

                $sheet->getStyle("A{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("B{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("D{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("E{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("F{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("G{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("H{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                if ($no % 2 === 0) {
                    $sheet->getStyle("A{$rowIdx}:I{$rowIdx}")->getFill()
                        ->setFillType(Fill::FILL_SOLID)
                        ->getStartColor()->setARGB('FFF9FAFB');
                }

                $sheet->getStyle("A{$rowIdx}:I{$rowIdx}")->applyFromArray([
                    'borders' => [
                        'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFE5E7EB']],
                    ],
                ]);

                $sheet->getRowDimension($rowIdx)->setRowHeight(20);
                $rowIdx++;
                $no++;
            }
        } else {
            $sheet->mergeCells("A{$rowIdx}:I{$rowIdx}");
            $sheet->setCellValue("A{$rowIdx}", 'Belum ada item part yang terdaftar pada order ini.');
            $sheet->getStyle("A{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("A{$rowIdx}:I{$rowIdx}")->applyFromArray([
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFE5E7EB']],
                ],
            ]);
            $rowIdx++;
        }

        foreach (range('A', 'I') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $cleanNo = str_replace(['/', '\\', ' '], '_', $order->no_order);
        $fileName = "MOL_{$cleanNo}_".date('Ymd_His').'.xlsx';
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    public function exportExcel(Request $request)
    {
        if ($request->filled('no_order')) {
            $order = MaintenanceOrder::where('no_order', $request->no_order)->first();
            if ($order) {
                return $this->exportExcelOrder($order);
            }
        }

        if ($request->filled('id')) {
            $order = MaintenanceOrder::find($request->id);
            if ($order) {
                return $this->exportExcelOrder($order);
            }
        }

        return $this->exportExcelList($request);
    }

    public function exportExcelList(Request $request)
    {
        $sortBy = $request->get('sortBy', 'terbaru');

        $query = MaintenanceOrder::with(['unit', 'parts.swapToUnit'])
            ->where(function ($q) {
                $q->whereNull('wo_type')
                    ->orWhere('wo_type', '!=', 'PCR');
            })
            ->where('no_order', 'not like', 'PCR-%');

        match ($sortBy) {
            'terlama' => $query->oldest('tanggal')->orderBy('no_order', 'asc'),
            'no_asc' => $query->orderBy('no_order', 'asc'),
            'no_desc' => $query->orderBy('no_order', 'desc'),
            default => $query->orderBy('no_order', 'desc'),
        };

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_order', 'like', "%{$search}%")
                    ->orWhereHas('unit', function ($qu) use ($search) {
                        $qu->where('code_unit', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('dateFrom')) {
            $query->whereDate('tanggal', '>=', $request->dateFrom);
        }
        if ($request->filled('dateTo')) {
            $query->whereDate('tanggal', '<=', $request->dateTo);
        }

        $orders = $query->get();

        $spreadsheet = new Spreadsheet;
        $spreadsheet->getDefaultStyle()->getFont()->setName('Calibri')->setSize(9);
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Monitoring Orderan');

        // Title
        $sheet->mergeCells('A1:R1');
        $sheet->setCellValue('A1', 'LAPORAN MONITORING ORDERAN (MOL) - PT MITRA ABADI MAHAKAM');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(13)->getColor()->setARGB('FF064E3B');

        $sheet->mergeCells('A2:R2');
        $sheet->setCellValue('A2', 'Tanggal Export: '.Carbon::now()->translatedFormat('d F Y H:i:s'));
        $sheet->getStyle('A2')->getFont()->setSize(9)->getColor()->setARGB('FF6B7280');

        $startRow = 4;
        $headers = [
            'A' => 'No',
            'B' => 'No Order',
            'C' => 'Tanggal',
            'D' => 'Unit',
            'E' => 'Model Unit',
            'F' => 'Current HM',
            'G' => 'Lokasi',
            'H' => 'Komponen',
            'I' => 'Part Number',
            'J' => 'Deskripsi Part',
            'K' => 'Qty',
            'L' => 'PR',
            'M' => 'PO',
            'N' => 'ETA Part',
            'O' => 'Swap Unit',
            'P' => 'Status',
            'Q' => 'Prioritas',
            'R' => 'PIC / Keterangan',
        ];

        foreach ($headers as $col => $title) {
            $sheet->setCellValue("{$col}{$startRow}", $title);
        }

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 9.5],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF064E3B'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF000000']],
            ],
        ];
        $sheet->getStyle("A{$startRow}:R{$startRow}")->applyFromArray($headerStyle);
        $sheet->getRowDimension($startRow)->setRowHeight(24);

        $rowIdx = $startRow + 1;
        $no = 1;

        foreach ($orders as $order) {
            $parts = $order->parts->isNotEmpty() ? $order->parts : [null];
            foreach ($parts as $pIdx => $part) {
                $sheet->setCellValue("A{$rowIdx}", $no);
                $sheet->setCellValue("B{$rowIdx}", $order->no_order);
                $sheet->setCellValue("C{$rowIdx}", $order->tanggal);
                $sheet->setCellValue("D{$rowIdx}", $order->unit?->code_unit ?: ($order->lokasi ?: '-'));
                $sheet->setCellValue("E{$rowIdx}", $order->unit?->model ?: '-');
                $sheet->setCellValue("F{$rowIdx}", $order->hm ?: '-');
                $sheet->setCellValue("G{$rowIdx}", $order->lokasi ?: '-');
                $sheet->setCellValue("H{$rowIdx}", $order->component_name ?: ($order->component ?: '-'));
                $sheet->setCellValue("I{$rowIdx}", $part?->part_number ?: '-');
                $sheet->setCellValue("J{$rowIdx}", $part?->department ?: '-');
                $sheet->setCellValue("K{$rowIdx}", $part?->qty ?: 1);
                $sheet->setCellValue("L{$rowIdx}", $part?->pr ?: '-');
                $sheet->setCellValue("M{$rowIdx}", $part?->po ?: '-');
                $sheet->setCellValue("N{$rowIdx}", $part?->due_date_part ?: '-');
                $sheet->setCellValue("O{$rowIdx}", $part?->swapToUnit?->code_unit ?: '-');
                $sheet->setCellValue("P{$rowIdx}", $order->status ?: '-');
                $sheet->setCellValue("Q{$rowIdx}", $order->priority ?: '-');
                $sheet->setCellValue("R{$rowIdx}", $order->pic ? ($order->pic.($order->action_taken ? ' - '.$order->action_taken : '')) : ($order->action_taken ?: '-'));

                $sheet->getStyle("A{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("B{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("C{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("D{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("F{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("I{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("K{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("L{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("M{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("N{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("O{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("P{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("Q{$rowIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                if ($no % 2 === 0) {
                    $sheet->getStyle("A{$rowIdx}:R{$rowIdx}")->getFill()
                        ->setFillType(Fill::FILL_SOLID)
                        ->getStartColor()->setARGB('FFF9FAFB');
                }

                $sheet->getStyle("A{$rowIdx}:R{$rowIdx}")->applyFromArray([
                    'borders' => [
                        'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFE5E7EB']],
                    ],
                ]);

                $sheet->getRowDimension($rowIdx)->setRowHeight(19);
                $rowIdx++;
            }
            $no++;
        }

        foreach (range('A', 'R') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $fileName = 'Monitoring_Orderan_'.date('Ymd_His').'.xlsx';
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
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
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk membuat order.');

        $nonUnitValues = ['ATK', 'CONSUMABLE', 'TOOL'];
        $isNonUnit = in_array($request->unit_id, $nonUnitValues);

        $request->validate([
            'tanggal' => 'required|date',
            'unit_id' => $isNonUnit ? 'required|string' : 'required|exists:units,id',
            'hm' => 'nullable',
            'lokasi' => 'nullable|string',
            'component' => 'nullable|string',
            'component_name' => 'nullable|string',
            'priority' => 'required|in:P1,P2,P3,BACKLOG,LOW,MEDIUM,HIGH',
            'status' => 'required|string',
            'pic' => 'nullable|string',
            'root_cause' => 'nullable|string',
            'action_taken' => 'nullable|string',
            'parts' => 'nullable|array',
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf,xlsx,xls,doc,docx|max:10240',
            'return_to' => 'nullable|string',
        ]);

        // Validasi: Cegah duplikat part number dalam 1 order
        if ($request->has('parts') && is_array($request->parts)) {
            $seenPartNumbers = [];
            foreach ($request->parts as $p) {
                $pn = strtoupper(trim((string) ($p['part_number'] ?? '')));
                if (! empty($pn) && $pn !== '-') {
                    if (in_array($pn, $seenPartNumbers, true)) {
                        throw ValidationException::withMessages([
                            'parts' => "Part Number '{$pn}' terdeteksi duplikat! Tidak boleh menginput Part Number yang sama dalam 1 order.",
                        ]);
                    }
                    $seenPartNumbers[] = $pn;
                }
            }
        }

        $attachmentData = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('attachments/orders', 'public');
                    $attachmentData[] = [
                        'id' => (string) Str::uuid(),
                        'name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'url' => '/storage/'.$path,
                        'size' => $file->getSize(),
                        'mime' => $file->getClientMimeType(),
                        'uploaded_at' => now()->toIso8601String(),
                    ];
                }
            }
        }

        $order = DB::transaction(function () use ($request, $isNonUnit, $attachmentData) {
            $noOrder = null;
            if ($request->filled('no_order') && $request->no_order !== 'AUTO GENERATED' && ! MaintenanceOrder::where('no_order', $request->no_order)->exists()) {
                $noOrder = $request->no_order;
            } else {
                $noOrder = MaintenanceOrder::generateNextNoOrder($request->tanggal);
            }

            $prio = strtoupper($request->priority);
            if ($prio === 'HIGH') {
                $prio = 'P1';
            } elseif ($prio === 'MEDIUM') {
                $prio = 'P2';
            } elseif ($prio === 'LOW') {
                $prio = 'P3';
            }

            $firstPart = ! empty($request->parts) && is_array($request->parts) ? $request->parts[0] : null;
            $orderComponent = ! empty($firstPart['component']) ? $firstPart['component'] : ($request->component ?? null);
            $orderComponentName = ! empty($firstPart['component_name']) ? $firstPart['component_name'] : ($request->component_name ?? null);

            $order = MaintenanceOrder::create([
                'no_order' => $noOrder,
                'tanggal' => $request->tanggal,
                'unit_id' => $isNonUnit ? null : $request->unit_id,
                'hm' => $request->hm,
                'lokasi' => $isNonUnit ? $request->unit_id.($request->lokasi ? ' - '.$request->lokasi : '') : $request->lokasi,
                'component' => $orderComponent,
                'component_name' => $orderComponentName,
                'priority' => $prio,
                'status' => $request->status,
                'pic' => $request->pic,
                'root_cause' => $request->root_cause,
                'action_taken' => $request->action_taken,
                'attachments' => ! empty($attachmentData) ? $attachmentData : null,
            ]);

            if ($request->has('parts') && is_array($request->parts)) {
                $unitModel = $order->unit_id ? Unit::find($order->unit_id) : null;
                $unitCode = $unitModel?->code_unit ?? ($isNonUnit ? $request->unit_id : 'NON-UNIT');

                foreach ($request->parts as $part) {
                    $createdPart = $order->parts()->create([
                        'component' => $part['component'] ?? null,
                        'component_name' => $part['component_name'] ?? null,
                        'part_number' => $part['part_number'] ?? '-',
                        'department' => $part['description'] ?? '-',
                        'life_time' => $part['life_time'] ?? null,
                        'qty' => $part['qty'] ?? 1,
                        'due_date_part' => $part['due_date_part'] ?? null,
                        'pr' => $part['pr'] ?? null,
                        'po' => $part['po'] ?? null,
                        'swap_to_unit_id' => $part['swap_to_unit_id'] ?? null,
                    ]);

                    $pn = strtoupper(trim((string) ($part['part_number'] ?? '')));
                    if (! empty($pn) && $pn !== '-') {
                        $orderStatusUpper = strtoupper(trim((string) $order->status));
                        $partStatus = 'REQUEST';
                        if ($orderStatusUpper === 'CLOSED') {
                            $partStatus = 'INSTALLED';
                        } elseif (in_array($orderStatusUpper, ['IN PROGRESS', 'PROGRES', 'OPEN'])) {
                            $partStatus = ! empty($part['po']) ? 'ORDERED' : (! empty($part['pr']) ? 'PR CREATED' : 'REQUEST');
                        } elseif ($orderStatusUpper === 'CANCEL' || $orderStatusUpper === 'CANCELLED') {
                            $partStatus = 'CANCELLED';
                        }

                        $installedHm = ($partStatus === 'INSTALLED' && $order->hm) ? (float) $order->hm : null;
                        $installedDate = ($partStatus === 'INSTALLED') ? $order->tanggal : null;

                        PartOrderLifetime::create([
                            'unit_id' => $order->unit_id,
                            'unit_code' => $unitCode,
                            'part_number' => $pn,
                            'part_name' => $part['description'] ?? ($part['component_name'] ?? $part['component'] ?? null),
                            'no_order' => $order->no_order,
                            'maintenance_order_id' => $order->id,
                            'maintenance_order_part_id' => $createdPart->id,
                            'qty' => $part['qty'] ?? 1,
                            'order_date' => $order->tanggal,
                            'eta' => ! empty($part['due_date_part']) && $part['due_date_part'] !== '-' ? $part['due_date_part'] : null,
                            'installed_date' => $installedDate,
                            'installed_hm' => $installedHm,
                            'expected_lifetime' => ! empty($part['life_time']) ? (float) $part['life_time'] : 5000.0,
                            'status' => $partStatus,
                            'remarks' => ! empty($part['pr']) ? 'PR: '.$part['pr'].(! empty($part['po']) ? ' | PO: '.$part['po'] : '') : null,
                        ]);
                    }
                }
            } else {
                // Create minimal 1 empty part
                $order->parts()->create([
                    'component' => $orderComponent,
                    'component_name' => $orderComponentName,
                    'part_number' => '-',
                    'department' => '-',
                    'qty' => 1,
                ]);
            }

            return $order;
        }); // End transaction

        if ($request->filled('return_to')) {
            return redirect($request->return_to)->with('success', 'Order List ('.$order->no_order.') berhasil dibuat dan dihubungkan ke Work Order.');
        }

        return redirect()->route('monitoring-orderan.index')->with('success', 'Work Order berhasil dibuat.');
    }

    public function update(Request $request, MaintenanceOrder $monitoring_orderan)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengubah order.');

        $nonUnitValues = ['ATK', 'CONSUMABLE', 'TOOL'];
        $isNonUnit = in_array($request->unit_id, $nonUnitValues);

        $request->validate([
            'tanggal' => 'required|date',
            'unit_id' => $isNonUnit ? 'required|string' : 'required|exists:units,id',
            'hm' => 'nullable',
            'lokasi' => 'nullable|string',
            'component' => 'nullable|string',
            'component_name' => 'nullable|string',
            'priority' => 'required|in:P1,P2,P3,BACKLOG,LOW,MEDIUM,HIGH',
            'status' => 'required|string',
            'pic' => 'nullable|string',
            'root_cause' => 'nullable|string',
            'action_taken' => 'nullable|string',
            'parts' => 'nullable|array',
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf,xlsx,xls,doc,docx|max:10240',
            'existing_attachments' => 'nullable',
        ]);

        // Validasi: Cegah duplikat part number dalam 1 order
        if ($request->has('parts') && is_array($request->parts)) {
            $seenPartNumbers = [];
            foreach ($request->parts as $p) {
                $pn = strtoupper(trim((string) ($p['part_number'] ?? '')));
                if (! empty($pn) && $pn !== '-') {
                    if (in_array($pn, $seenPartNumbers, true)) {
                        throw ValidationException::withMessages([
                            'parts' => "Part Number '{$pn}' terdeteksi duplikat! Tidak boleh menginput Part Number yang sama dalam 1 order.",
                        ]);
                    }
                    $seenPartNumbers[] = $pn;
                }
            }
        }

        $existing = $request->input('existing_attachments');
        if (is_string($existing)) {
            $existing = json_decode($existing, true) ?: [];
        }
        if (! is_array($existing)) {
            $existing = [];
        }

        $finalAttachments = array_values($existing);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('attachments/orders', 'public');
                    $finalAttachments[] = [
                        'id' => (string) Str::uuid(),
                        'name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'url' => '/storage/'.$path,
                        'size' => $file->getSize(),
                        'mime' => $file->getClientMimeType(),
                        'uploaded_at' => now()->toIso8601String(),
                    ];
                }
            }
        }

        $prio = strtoupper($request->priority);
        if ($prio === 'HIGH') {
            $prio = 'P1';
        } elseif ($prio === 'MEDIUM') {
            $prio = 'P2';
        } elseif ($prio === 'LOW') {
            $prio = 'P3';
        }

        $firstPart = ! empty($request->parts) && is_array($request->parts) ? $request->parts[0] : null;
        $orderComponent = ! empty($firstPart['component']) ? $firstPart['component'] : ($request->component ?? null);
        $orderComponentName = ! empty($firstPart['component_name']) ? $firstPart['component_name'] : ($request->component_name ?? null);

        $monitoring_orderan->update([
            'tanggal' => $request->tanggal,
            'unit_id' => $isNonUnit ? null : $request->unit_id,
            'hm' => $request->hm,
            'lokasi' => $isNonUnit ? $request->unit_id.($request->lokasi ? ' - '.$request->lokasi : '') : $request->lokasi,
            'component' => $orderComponent,
            'component_name' => $orderComponentName,
            'priority' => $prio,
            'status' => $request->status,
            'pic' => $request->pic,
            'root_cause' => $request->root_cause,
            'action_taken' => $request->action_taken,
            'attachments' => ! empty($finalAttachments) ? $finalAttachments : null,
        ]);

        $monitoring_orderan->parts()->delete();
        PartOrderLifetime::where('maintenance_order_id', $monitoring_orderan->id)->delete();

        if ($request->has('parts') && is_array($request->parts)) {
            $unitModel = $monitoring_orderan->unit_id ? Unit::find($monitoring_orderan->unit_id) : null;
            $unitCode = $unitModel?->code_unit ?? ($isNonUnit ? $request->unit_id : 'NON-UNIT');

            foreach ($request->parts as $part) {
                $createdPart = $monitoring_orderan->parts()->create([
                    'component' => $part['component'] ?? null,
                    'component_name' => $part['component_name'] ?? null,
                    'part_number' => $part['part_number'] ?? '-',
                    'department' => $part['description'] ?? '-',
                    'life_time' => $part['life_time'] ?? null,
                    'qty' => $part['qty'] ?? 1,
                    'due_date_part' => $part['due_date_part'] ?? null,
                    'pr' => $part['pr'] ?? null,
                    'po' => $part['po'] ?? null,
                    'swap_to_unit_id' => $part['swap_to_unit_id'] ?? null,
                ]);

                $pn = strtoupper(trim((string) ($part['part_number'] ?? '')));
                if (! empty($pn) && $pn !== '-') {
                    $orderStatusUpper = strtoupper(trim((string) $monitoring_orderan->status));
                    $partStatus = 'REQUEST';
                    if ($orderStatusUpper === 'CLOSED') {
                        $partStatus = 'INSTALLED';
                    } elseif (in_array($orderStatusUpper, ['IN PROGRESS', 'PROGRES', 'OPEN'])) {
                        $partStatus = ! empty($part['po']) ? 'ORDERED' : (! empty($part['pr']) ? 'PR CREATED' : 'REQUEST');
                    } elseif ($orderStatusUpper === 'CANCEL' || $orderStatusUpper === 'CANCELLED') {
                        $partStatus = 'CANCELLED';
                    }

                    $installedHm = ($partStatus === 'INSTALLED' && $monitoring_orderan->hm) ? (float) $monitoring_orderan->hm : null;
                    $installedDate = ($partStatus === 'INSTALLED') ? $monitoring_orderan->tanggal : null;

                    PartOrderLifetime::create([
                        'unit_id' => $monitoring_orderan->unit_id,
                        'unit_code' => $unitCode,
                        'part_number' => $pn,
                        'part_name' => $part['description'] ?? ($part['component_name'] ?? $part['component'] ?? null),
                        'no_order' => $monitoring_orderan->no_order,
                        'maintenance_order_id' => $monitoring_orderan->id,
                        'maintenance_order_part_id' => $createdPart->id,
                        'qty' => $part['qty'] ?? 1,
                        'order_date' => $monitoring_orderan->tanggal,
                        'eta' => ! empty($part['due_date_part']) && $part['due_date_part'] !== '-' ? $part['due_date_part'] : null,
                        'installed_date' => $installedDate,
                        'installed_hm' => $installedHm,
                        'expected_lifetime' => ! empty($part['life_time']) ? (float) $part['life_time'] : 5000.0,
                        'status' => $partStatus,
                        'remarks' => ! empty($part['pr']) ? 'PR: '.$part['pr'].(! empty($part['po']) ? ' | PO: '.$part['po'] : '') : null,
                    ]);
                }
            }
        } else {
            // Create minimal 1 empty part
            $monitoring_orderan->parts()->create([
                'component' => $orderComponent,
                'component_name' => $orderComponentName,
                'part_number' => '-',
                'department' => '-',
                'qty' => 1,
            ]);
        }

        if ($request->filled('return_to')) {
            return redirect($request->return_to)->with('success', 'Work Order berhasil diupdate.');
        }

        return redirect()->route('monitoring-orderan.index')->with('success', 'Work Order berhasil diupdate.');
    }

    public function destroy(MaintenanceOrder $monitoring_orderan)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menghapus order.');

        if (! empty($monitoring_orderan->attachments) && is_array($monitoring_orderan->attachments)) {
            foreach ($monitoring_orderan->attachments as $att) {
                if (! empty($att['path'])) {
                    Storage::disk('public')->delete($att['path']);
                }
            }
        }

        $monitoring_orderan->parts()->delete();
        $monitoring_orderan->delete();

        return redirect()->back()->with('success', 'Work Order berhasil dihapus.');
    }

    public function destroyAll()
    {
        if (! auth()->user()?->hasAnyRole(['super-admin', 'admin'])) {
            abort(403, 'Akses ditolak: Hanya administrator yang diizinkan menghapus semua Work Order.');
        }

        // Hapus semua parts terlebih dahulu untuk menghindari constraint error
        MaintenanceOrderPart::query()->delete();
        // Hapus semua order
        MaintenanceOrder::query()->delete();

        return redirect()->back()->with('success', 'Semua data Work Order berhasil dihapus (Reset Data).');
    }

    public function downloadTemplate(Request $request)
    {
        $type = $request->query('type', 'all');
        $spreadsheet = new Spreadsheet;

        // Sheet 1: Template Update PO & ETA (by PR)
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Update PO & ETA (by PR)');

        $headers1 = [
            'PR', 'PO', 'Eta Part', 'Part Number (Opsional)', 'Status (Opsional)',
        ];
        $sheet1->fromArray([$headers1], null, 'A1');

        $headerStyle1 = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1D4ED8'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ];
        $sheet1->getStyle('A1:E1')->applyFromArray($headerStyle1);

        $samples1 = [
            ['PR.HW.2026.09.00004', 'PO.MAM.2026.09.05614', '2026-09-25', '', 'WAITING PART'],
            ['PR.HW.2026.09.00036', 'PO.MAM.2026.09.05615', '2026-09-28', '', 'PROCESS'],
        ];
        $sheet1->fromArray($samples1, null, 'A2');

        foreach (range('A', 'E') as $col) {
            $sheet1->getColumnDimension($col)->setAutoSize(true);
        }

        // Sheet 2: Template Konfirmasi Barang Datang (Closed Order)
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Barang Datang (Closed Order)');

        $headers2 = [
            'PR', 'PO (Opsional)', 'No Order (Opsional)', 'Tanggal Datang', 'Part Number (Opsional)', 'Keterangan (Opsional)', 'Status',
        ];
        $sheet2->fromArray([$headers2], null, 'A1');

        $headerStyle2 = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0F5132'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ];
        $sheet2->getStyle('A1:G1')->applyFromArray($headerStyle2);

        $samples2 = [
            ['PR.HW.2026.09.00004', 'PO.MAM.2026.09.05614', 'HW-MOL-01475', date('Y-m-d'), '', 'Barang sudah datang lengkap di gudang', 'CLOSED'],
            ['PR.HW.2026.09.00036', 'PO.MAM.2026.09.05615', 'HW-MOL-01476', date('Y-m-d'), '', 'Part diterima', 'CLOSED'],
        ];
        $sheet2->fromArray($samples2, null, 'A2');

        foreach (range('A', 'G') as $col) {
            $sheet2->getColumnDimension($col)->setAutoSize(true);
        }

        if ($type === 'po_eta') {
            $spreadsheet->removeSheetByIndex(1);
        } elseif ($type === 'barang_datang') {
            $spreadsheet->removeSheetByIndex(0);
        }

        $spreadsheet->setActiveSheetIndex(0);

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Monitoring_Orderan.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function import(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengimpor order.');

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:20480',
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());

            // Kumpulkan semua sheet yang memiliki baris data
            $sheetsToProcess = [];
            foreach ($spreadsheet->getAllSheets() as $sheetObj) {
                $rawRows = $sheetObj->toArray();
                $nonEmptyRows = array_values(array_filter($rawRows, function ($r) {
                    return ! empty(array_filter($r, fn ($v) => $v !== null && trim((string) $v) !== ''));
                }));

                if (count($nonEmptyRows) > 1) {
                    $sheetsToProcess[] = [
                        'title' => strtolower(trim($sheetObj->getTitle())),
                        'rows' => $nonEmptyRows,
                    ];
                }
            }

            if (empty($sheetsToProcess)) {
                $activeSheet = $spreadsheet->getActiveSheet();
                $rawRows = $activeSheet->toArray();
                $nonEmptyRows = array_values(array_filter($rawRows, function ($r) {
                    return ! empty(array_filter($r, fn ($v) => $v !== null && trim((string) $v) !== ''));
                }));

                if (! empty($nonEmptyRows)) {
                    $sheetsToProcess[] = [
                        'title' => strtolower(trim($activeSheet->getTitle())),
                        'rows' => $nonEmptyRows,
                    ];
                }
            }

            if (empty($sheetsToProcess)) {
                return redirect()->back()->with('error', 'File Excel kosong atau tidak terbaca.');
            }

            // Date Parser Helper (Mendukung Excel date serial, dd/mm/yyyy, yyyy-mm-dd)
            $parseDate = function ($value) {
                if (empty($value) || $value === '-' || $value === '1970-01-01') {
                    return null;
                }
                if (is_numeric($value) && (float) $value > 20000 && (float) $value < 60000) {
                    try {
                        return Date::excelToDateTimeObject((float) $value)->format('Y-m-d');
                    } catch (\Throwable $e) {
                    }
                }
                $str = trim((string) $value);

                // 1. Format YYYY-MM-DD
                if (preg_match('/^\d{4}-\d{1,2}-\d{1,2}$/', $str)) {
                    try {
                        return Carbon::parse($str)->format('Y-m-d');
                    } catch (\Throwable $e) {
                    }
                }

                // 2. Format DD/MM/YYYY or DD-MM-YYYY (Standard Indonesia)
                if (preg_match('/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/', $str, $m)) {
                    $p1 = (int) $m[1];
                    $p2 = (int) $m[2];
                    $year = (int) $m[3];

                    if ($p2 > 12) {
                        // Jika bagian tengah > 12, maka bagian tengah adalah tanggal (MM/DD/YYYY)
                        $month = $p1;
                        $day = $p2;
                    } else {
                        // Standar Indonesia DD/MM/YYYY
                        $day = $p1;
                        $month = $p2;
                    }
                    if (checkdate($month, $day, $year)) {
                        return sprintf('%04d-%02d-%02d', $year, $month, $day);
                    }
                }

                // 3. Format YYYY/MM/DD
                if (preg_match('/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})$/', $str, $m)) {
                    $year = (int) $m[1];
                    $month = (int) $m[2];
                    $day = (int) $m[3];
                    if (checkdate($month, $day, $year)) {
                        return sprintf('%04d-%02d-%02d', $year, $month, $day);
                    }
                }

                try {
                    $parsed = Carbon::parse($str);
                    if ($parsed->year > 1990 && $parsed->year < 2050) {
                        return $parsed->format('Y-m-d');
                    }
                } catch (\Throwable $e) {
                }

                return null;
            };

            $closedOrderIds = [];
            $closedCount = 0;
            $updatedPrCount = 0;
            $importedCount = 0;
            $orderHeaders = [];

            foreach ($sheetsToProcess as $sheetItem) {
                $rows = $sheetItem['rows'];
                $sheetTitle = $sheetItem['title'];

                // Smart Header Mapping untuk sheet ini
                $firstRow = array_map(fn ($val) => strtolower(trim((string) $val)), $rows[0]);
                $headerMap = [];
                $hasHeader = false;

                foreach ($firstRow as $idx => $txt) {
                    if (
                        str_contains($txt, 'pr') || str_contains($txt, 'po') || str_contains($txt, 'eta') ||
                        str_contains($txt, 'unit') || str_contains($txt, 'part') || str_contains($txt, 'tanggal') ||
                        str_contains($txt, 'order') || str_contains($txt, 'component') || str_contains($txt, 'datang') ||
                        str_contains($txt, 'terima') || str_contains($txt, 'status')
                    ) {
                        $hasHeader = true;
                        break;
                    }
                }

                if ($hasHeader) {
                    foreach ($firstRow as $idx => $txt) {
                        if ($txt === 'pr' || str_contains($txt, 'no pr') || str_contains($txt, 'nomor pr') || str_contains($txt, 'purchase request')) {
                            $headerMap['pr'] = $idx;
                        } elseif ($txt === 'po' || str_contains($txt, 'no po') || str_contains($txt, 'nomor po') || str_contains($txt, 'purchase order')) {
                            $headerMap['po'] = $idx;
                        } elseif (str_contains($txt, 'tgl datang') || str_contains($txt, 'tanggal datang') || str_contains($txt, 'tgl tiba') || str_contains($txt, 'tgl terima') || str_contains($txt, 'arrival') || str_contains($txt, 'received') || str_contains($txt, 'barang datang')) {
                            $headerMap['tanggal_datang'] = $idx;
                        } elseif (str_contains($txt, 'eta') || str_contains($txt, 'due date') || str_contains($txt, 'estimasi')) {
                            $headerMap['eta'] = $idx;
                        } elseif (str_contains($txt, 'part number') || str_contains($txt, 'part no') || $txt === 'p/n' || $txt === 'pn') {
                            $headerMap['part_number'] = $idx;
                        } elseif (str_contains($txt, 'code unit') || str_contains($txt, 'no unit') || $txt === 'unit') {
                            $headerMap['code_unit'] = $idx;
                        } elseif (str_contains($txt, 'no order') || str_contains($txt, 'nomor order') || $txt === 'wo' || str_contains($txt, 'work order')) {
                            $headerMap['no_order'] = $idx;
                        } elseif (str_contains($txt, 'tanggal') || str_contains($txt, 'date')) {
                            $headerMap['tanggal'] = $idx;
                        } elseif (str_contains($txt, 'component')) {
                            $headerMap['component'] = $idx;
                        } elseif (str_contains($txt, 'description') || str_contains($txt, 'nama part')) {
                            $headerMap['description'] = $idx;
                        } elseif (str_contains($txt, 'qty') || str_contains($txt, 'jumlah')) {
                            $headerMap['qty'] = $idx;
                        } elseif ($txt === 'hm') {
                            $headerMap['hm'] = $idx;
                        } elseif (str_contains($txt, 'remark') || str_contains($txt, 'keterangan') || str_contains($txt, 'catatan') || str_contains($txt, 'note')) {
                            $headerMap['remark'] = $idx;
                        } elseif (str_contains($txt, 'swap')) {
                            $headerMap['swap'] = $idx;
                        } elseif (str_contains($txt, 'status')) {
                            $headerMap['status'] = $idx;
                        }
                    }
                    array_shift($rows); // Hapus header row
                }

                $isBarangDatangSheet = str_contains($sheetTitle, 'datang') || str_contains($sheetTitle, 'arrival') || str_contains($sheetTitle, 'closed') || str_contains($sheetTitle, 'terima');

                foreach ($rows as $row) {
                    if (empty(array_filter($row, fn ($v) => $v !== null && trim((string) $v) !== ''))) {
                        continue;
                    }

                    $getVal = function ($key) use ($headerMap, $row) {
                        return (isset($headerMap[$key]) && array_key_exists($headerMap[$key], $row)) ? trim((string) ($row[$headerMap[$key]] ?? '')) : '';
                    };

                    $pr = $getVal('pr');
                    $po = $getVal('po');
                    $noOrder = $getVal('no_order');
                    $partNumber = $getVal('part_number');
                    $rawStatus = strtoupper($getVal('status'));
                    $keterangan = $getVal('remark');
                    $tglDatangRaw = $getVal('tanggal_datang');
                    $etaRaw = $getVal('eta');
                    $codeUnit = $getVal('code_unit');
                    $component = $getVal('component');
                    $description = $getVal('description') ?: '-';
                    $rawQty = $getVal('qty');
                    $qty = is_numeric($rawQty) ? (int) $rawQty : 1;
                    $hm = $getVal('hm');
                    $swapCodeUnit = $getVal('swap');
                    $tanggal = $getVal('tanggal');

                    $tglDatangParsed = $parseDate($tglDatangRaw);
                    $etaParsed = $parseDate($etaRaw);
                    $parsedTanggal = $parseDate($tanggal) ?: date('Y-m-d');

                    // ========================================================
                    // 1. KASUS BARANG DATANG (STATUS CLOSED -> HISTORICAL ORDER)
                    // ========================================================
                    $isBarangDatang = $isBarangDatangSheet || $rawStatus === 'CLOSED' || ! empty($tglDatangParsed);

                    if ($isBarangDatang) {
                        $arrivalDate = $tglDatangParsed ?: date('Y-m-d');
                        $rowProcessed = false;

                        // A. Cari & Update berdasarkan Nomor PR
                        if (! empty($pr) && $pr !== '-') {
                            $partQuery = MaintenanceOrderPart::where('pr', $pr);
                            if (! empty($partNumber) && $partNumber !== '-') {
                                $hasExactPart = (clone $partQuery)->where('part_number', $partNumber)->exists();
                                if ($hasExactPart) {
                                    $partQuery->where('part_number', $partNumber);
                                }
                            }
                            $matchedParts = $partQuery->get();

                            if ($matchedParts->isNotEmpty()) {
                                foreach ($matchedParts as $mp) {
                                    $partUpdates = [];
                                    if (! empty($po) && $po !== '-') {
                                        $partUpdates['po'] = $po;
                                    }
                                    if (! empty($arrivalDate)) {
                                        $partUpdates['due_date_part'] = $arrivalDate;
                                    }
                                    if (! empty($partUpdates)) {
                                        $mp->update($partUpdates);
                                    }

                                    $order = $mp->maintenanceOrder ?: MaintenanceOrder::find($mp->maintenance_order_id);
                                    if ($order) {
                                        $orderUpdates = ['status' => 'CLOSED'];
                                        if (empty($order->actual_end)) {
                                            $orderUpdates['actual_end'] = $arrivalDate;
                                        }
                                        if (! empty($keterangan) && ! str_contains((string) $order->action_taken, $keterangan)) {
                                            $orderUpdates['action_taken'] = trim(($order->action_taken ? $order->action_taken.' | ' : '').'Barang Datang: '.$keterangan);
                                        }
                                        $order->update($orderUpdates);
                                        $closedOrderIds[$order->id] = true;
                                    }
                                }
                                $closedCount++;
                                $rowProcessed = true;
                            }
                        }

                        // B. Cari & Update berdasarkan Nomor Order
                        if (! $rowProcessed && ! empty($noOrder) && $noOrder !== '-') {
                            $order = MaintenanceOrder::where('no_order', $noOrder)->first();
                            if ($order) {
                                $orderUpdates = ['status' => 'CLOSED'];
                                if (empty($order->actual_end)) {
                                    $orderUpdates['actual_end'] = $arrivalDate;
                                }
                                if (! empty($keterangan) && ! str_contains((string) $order->action_taken, $keterangan)) {
                                    $orderUpdates['action_taken'] = trim(($order->action_taken ? $order->action_taken.' | ' : '').'Barang Datang: '.$keterangan);
                                }
                                $order->update($orderUpdates);
                                $closedOrderIds[$order->id] = true;
                                $closedCount++;
                                $rowProcessed = true;
                            }
                        }

                        // C. Cari & Update berdasarkan Nomor PO
                        if (! $rowProcessed && ! empty($po) && $po !== '-') {
                            $matchedParts = MaintenanceOrderPart::where('po', $po)->get();
                            if ($matchedParts->isNotEmpty()) {
                                foreach ($matchedParts as $mp) {
                                    $order = $mp->maintenanceOrder ?: MaintenanceOrder::find($mp->maintenance_order_id);
                                    if ($order) {
                                        $orderUpdates = ['status' => 'CLOSED'];
                                        if (empty($order->actual_end)) {
                                            $orderUpdates['actual_end'] = $arrivalDate;
                                        }
                                        $order->update($orderUpdates);
                                        $closedOrderIds[$order->id] = true;
                                    }
                                }
                                $closedCount++;
                                $rowProcessed = true;
                            }
                        }

                        if ($rowProcessed) {
                            continue;
                        }
                    }

                    // ========================================================
                    // 2. KASUS UPDATE PO & ETA (by PR)
                    // ========================================================
                    if (! empty($pr) && $pr !== '-') {
                        $partQuery = MaintenanceOrderPart::where('pr', $pr);
                        if (! empty($partNumber) && $partNumber !== '-') {
                            $hasExactPart = (clone $partQuery)->where('part_number', $partNumber)->exists();
                            if ($hasExactPart) {
                                $partQuery->where('part_number', $partNumber);
                            }
                        }
                        $matchedParts = $partQuery->get();

                        // Fallback: Jika belum ada part dengan PR ini tapi ada nomor order, cari part di order tersebut
                        if ($matchedParts->isEmpty() && ! empty($noOrder) && $noOrder !== '-') {
                            $order = MaintenanceOrder::where('no_order', $noOrder)->first();
                            if ($order) {
                                $oq = $order->parts();
                                if (! empty($partNumber) && $partNumber !== '-') {
                                    $oq->where('part_number', $partNumber);
                                }
                                $matchedParts = $oq->get();
                                foreach ($matchedParts as $mp) {
                                    if (empty($mp->pr) || $mp->pr === '-') {
                                        $mp->update(['pr' => $pr]);
                                    }
                                }
                            }
                        }

                        if ($matchedParts->isNotEmpty()) {
                            foreach ($matchedParts as $mp) {
                                $updates = [];
                                if (! empty($po) && $po !== '-') {
                                    $updates['po'] = $po;
                                }
                                if (! empty($etaParsed)) {
                                    $updates['due_date_part'] = $etaParsed;
                                }
                                if (! empty($updates)) {
                                    $mp->update($updates);
                                }

                                if (! empty($rawStatus)) {
                                    $statusToSet = $rawStatus === 'COMPLATED' ? 'COMPLETED' : $rawStatus;
                                    $order = $mp->maintenanceOrder ?: MaintenanceOrder::find($mp->maintenance_order_id);
                                    if ($order) {
                                        $order->update(['status' => $statusToSet]);
                                        if ($statusToSet === 'CLOSED') {
                                            $closedOrderIds[$order->id] = true;
                                        }
                                    }
                                }
                            }
                            $updatedPrCount++;

                            continue;
                        }
                    }

                    // ========================================================
                    // 3. FALLBACK LEGACY JIKA ADA CODE UNIT & NO ORDER LENGKAP
                    // ========================================================
                    if (empty($codeUnit)) {
                        continue;
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
                                if (! empty($parsedTanggal)) {
                                    $existingOrder->tanggal = $parsedTanggal;
                                }
                                if ($unit) {
                                    $existingOrder->unit_id = $unit->id;
                                } elseif ($isNonUnit) {
                                    $existingOrder->unit_id = null;
                                }
                                if (! empty($hm)) {
                                    $existingOrder->hm = $hm;
                                }
                                if (! empty($component)) {
                                    $existingOrder->component = $component;
                                }
                                if (! empty($rawStatus)) {
                                    $existingOrder->status = $rawStatus === 'COMPLATED' ? 'COMPLETED' : $rawStatus;
                                }
                                $existingOrder->save();
                                $existingOrder->parts()->delete();
                            }

                            $orderHeaders[$noOrder]->parts()->create([
                                'part_number' => $partNumber ?: '-',
                                'department' => $description,
                                'qty' => $qty > 0 ? $qty : 1,
                                'component' => $component,
                                'due_date_part' => ! empty($etaParsed) ? $etaParsed : null,
                                'swap_to_unit_id' => $swapUnit ? $swapUnit->id : null,
                                'pr' => $pr,
                                'po' => $po,
                            ]);
                            $importedCount++;

                            continue;
                        }
                    }

                    $groupKey = ! empty($noOrder) ? $noOrder : 'NEW_'.$parsedTanggal.'_'.$codeUnit;
                    if (! isset($orderHeaders[$groupKey])) {
                        if (empty($noOrder)) {
                            $currentYear = date('Y', strtotime($parsedTanggal));
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
                            'tanggal' => $parsedTanggal,
                            'unit_id' => $isNonUnit ? null : $unit->id,
                            'hm' => $hm,
                            'lokasi' => $isNonUnit ? strtoupper($codeUnit) : '-',
                            'component' => $component,
                            'priority' => 'BACKLOG',
                            'status' => ! empty($rawStatus) ? ($rawStatus === 'COMPLATED' ? 'COMPLETED' : $rawStatus) : 'WAITING PART',
                            'pic' => '-',
                            'root_cause' => '-',
                            'action_taken' => $keterangan,
                        ]);
                        $orderHeaders[$groupKey] = $order;
                    } else {
                        $order = $orderHeaders[$groupKey];
                    }

                    $order->parts()->create([
                        'part_number' => $partNumber ?: '-',
                        'department' => $description,
                        'qty' => $qty > 0 ? $qty : 1,
                        'component' => $component,
                        'due_date_part' => ! empty($etaParsed) ? $etaParsed : null,
                        'swap_to_unit_id' => $swapUnit ? $swapUnit->id : null,
                        'pr' => $pr,
                        'po' => $po,
                    ]);
                    $importedCount++;
                }
            }

            $messages = [];
            if (! empty($closedOrderIds)) {
                $countOrders = count($closedOrderIds);
                $messages[] = "{$countOrders} Work Order berhasil di-update menjadi CLOSED (Masuk ke Historical Order) karena barang sudah datang";
            } elseif ($closedCount > 0) {
                $messages[] = "{$closedCount} baris barang datang berhasil diproses menjadi CLOSED";
            }

            if ($updatedPrCount > 0) {
                $messages[] = "{$updatedPrCount} data part berhasil diperbarui (PO & ETA Part) berdasarkan nomor PR";
            }

            if ($importedCount > 0) {
                $messages[] = "{$importedCount} baris orderan berhasil diproses";
            }

            $resultText = ! empty($messages) ? implode(' dan ', $messages).'.' : 'Tidak ada data yang cocok untuk diperbarui. Pastikan nomor PR, PO, atau No Order sudah sesuai.';

            return redirect()->back()->with('success', $resultText);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses file Excel: '.$e->getMessage());
        }
    }
}
