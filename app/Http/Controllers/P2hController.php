<?php

namespace App\Http\Controllers;

use App\Models\P2hInspection;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class P2hController extends Controller
{
    /**
     * Standard list of component groups.
     */
    public const COMPONENT_GROUPS = [
        'AC SYSTEM', 'ACCESSORIES', 'ACCIDENT', 'AIR SYSTEM', 'ATTACHMENT', 'AUTOLUBE',
        'BATTERY', 'BLADE', 'BRAKE SYSTEM', 'BUCKET', 'CABIN', 'CLUTCH', 'COOLING SYSTEM',
        'DAMPER', 'DIFFERENTIAL', 'ELECTRIC SYSTEM', 'ENGINE', 'FINAL DRIVE',
        'FRAME/BODY/GUARD/CHASSIS', 'FRONT AXLE', 'FUEL SYSTEM', 'GET', 'GREASING', 'HOSES',
        'HYDRAULIC SYSTEM', 'INTAKE & EXHAUST SYSTEM', 'LEVEL OIL/COOLANT', 'MAINTENANCE/SERVICE',
        'PROPELLER SHAFT', 'PTO', 'RADIATOR', 'RADIO', 'REAR AXLE', 'STEERING SYSTEM', 'SUSPENSION',
        'SWING', 'TAIL GATE', 'TRANSMISSION', 'TYRE', 'UNDERCARRIAGE', 'VESSEL', 'WASHING',
        'WATER CANON/SPRAYER', 'WHEEL & HUB',
    ];

    /**
     * Display a listing of the Inspection Unit monitoring records.
     */
    public function index(Request $request)
    {
        $query = P2hInspection::with('unit');

        $dateFrom = $request->input('dateFrom');
        $dateTo = $request->input('dateTo');
        $codeUnitFilter = $request->input('codeUnitFilter');
        $statusFilter = $request->input('statusFilter');
        $priorityFilter = $request->input('priorityFilter');
        $componentGroupFilter = $request->input('componentGroupFilter');
        $search = $request->input('search');

        if ($dateFrom) {
            $query->whereDate('date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('date', '<=', $dateTo);
        }
        if ($codeUnitFilter) {
            $query->where('code_unit', $codeUnitFilter);
        }
        if ($statusFilter && $statusFilter !== 'ALL') {
            $query->where('status', strtoupper($statusFilter));
        }
        if ($priorityFilter && $priorityFilter !== 'ALL') {
            $query->where('priority', strtoupper($priorityFilter));
        }
        if ($componentGroupFilter && $componentGroupFilter !== 'ALL') {
            $query->where('component_group', $componentGroupFilter);
        }
        if ($search) {
            $s = trim($search);
            $query->where(function ($q) use ($s) {
                $q->where('code_unit', 'like', "%{$s}%")
                    ->orWhere('wo_number', 'like', "%{$s}%")
                    ->orWhere('model', 'like', "%{$s}%")
                    ->orWhere('component_group', 'like', "%{$s}%")
                    ->orWhere('component_name', 'like', "%{$s}%")
                    ->orWhere('priority', 'like', "%{$s}%")
                    ->orWhere('finding', 'like', "%{$s}%")
                    ->orWhere('inspect_by', 'like', "%{$s}%")
                    ->orWhere('action', 'like', "%{$s}%")
                    ->orWhere('closed_by', 'like', "%{$s}%");
            });
        }

        $inspections = $query->orderBy('date', 'desc')->latest('id')->get();

        // Format data matching table columns:
        // NO WO | DATE | Unit | MODEL UNIT | FOTO | Component Group | Component Name | Priority | HM | FINDING | INSPECT BY | AGING (days) | ACTION | Closed by | STATUS
        $p2hData = $inspections->map(function ($item) {
            $dateFormatted = Carbon::parse($item->date)->format('d/m/Y');
            $status = strtoupper($item->status ?: 'OPEN');
            $closedBy = $status === 'CLOSED' ? ($item->closed_by ?: 'Admin') : '-';

            return [
                'id' => $item->id,
                'unit_id' => $item->unit_id,
                'wo_number' => $item->wo_number ?: ('PLT/WO/INS/'.str_pad($item->id, 3, '0', STR_PAD_LEFT)),
                'date' => $dateFormatted,
                'raw_date' => Carbon::parse($item->date)->format('Y-m-d'),
                'unit' => $item->code_unit,
                'code_unit' => $item->code_unit,
                'model_unit' => $item->model ?: ($item->unit?->model ?: '-'),
                'model' => $item->model ?: ($item->unit?->model ?: '-'),
                'component_group' => $item->component_group ?: '-',
                'component_name' => $item->component_name ?: '-',
                'priority' => strtoupper($item->priority ?: 'P2'),
                'image' => $item->image,
                'image_url' => $item->image_url,
                'hm' => number_format((float) $item->hm, 1),
                'raw_hm' => (float) $item->hm,
                'finding' => $item->finding ?: ($item->notes ?: '-'),
                'inspect_by' => $item->inspect_by ?: ($item->inspector_name ?: '-'),
                'aging' => $item->aging_days,
                'aging_days' => $item->aging_days,
                'action' => $item->action ?: '-',
                'closed_by' => $closedBy,
                'closed_at' => $item->closed_at ? Carbon::parse($item->closed_at)->format('Y-m-d') : null,
                'status' => $status,
                'notes' => $item->notes ?: '',
            ];
        });

        // Summary KPI counts
        $totalFindings = $inspections->count();
        $totalOpen = $inspections->where('status', 'OPEN')->count();
        $totalProgress = $inspections->where('status', 'PROGRESS')->count();
        $totalClosed = $inspections->where('status', 'CLOSED')->count();

        $summary = [
            'total_findings' => $totalFindings,
            'open' => $totalOpen,
            'progress' => $totalProgress,
            'closed' => $totalClosed,
            'p1' => $inspections->where('priority', 'P1')->count(),
            'p2' => $inspections->where('priority', 'P2')->count(),
            'p3' => $inspections->where('priority', 'P3')->count(),
            'avg_aging' => $totalFindings > 0 ? round($inspections->avg('aging_days'), 1) : 0,
        ];

        $units = Unit::where('code_unit', 'not like', 'BOX%')
            ->where('code_unit', 'not like', 'Chainsaw%')
            ->orderBy('code_unit')
            ->get(['id', 'code_unit', 'model', 'hm']);

        return Inertia::render('Planner/P2hMonitoring', [
            'p2hData' => $p2hData,
            'summary' => $summary,
            'units' => $units,
            'nextWoNumber' => P2hInspection::generateNextWoNumber(),
            'componentGroups' => self::COMPONENT_GROUPS,
            'filters' => [
                'dateFrom' => $dateFrom ?: '',
                'dateTo' => $dateTo ?: '',
                'codeUnitFilter' => $codeUnitFilter ?: '',
                'statusFilter' => $statusFilter ?: '',
                'priorityFilter' => $priorityFilter ?: '',
                'componentGroupFilter' => $componentGroupFilter ?: '',
                'search' => $search ?: '',
            ],
        ]);
    }

    /**
     * Store a newly created P2H inspection in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id' => 'nullable|string',
            'code_unit' => 'required|string',
            'wo_number' => 'nullable|string',
            'date' => 'required|date',
            'hm' => 'required|numeric|min:0',
            'component_group' => 'nullable|string',
            'component_name' => 'nullable|string',
            'priority' => 'nullable|string|in:P1,P2,P3,p1,p2,p3',
            'finding' => 'required|string',
            'inspect_by' => 'required|string',
            'action' => 'nullable|string',
            'closed_by' => 'nullable|string',
            'status' => 'required|string',
            'image' => 'nullable|image|max:10240',
        ]);

        $unit = null;
        if (! empty($validated['unit_id'])) {
            $unit = Unit::find($validated['unit_id']);
        }
        if (! $unit) {
            $unit = Unit::where('code_unit', $validated['code_unit'])->first();
        }

        $status = strtoupper($validated['status'] ?? 'OPEN');
        $closedAt = null;
        $closedBy = null;

        if ($status === 'CLOSED') {
            $closedAt = now()->toDateString();
            $closedBy = $validated['closed_by'] ?: (auth()->user()?->name ?: 'Admin');
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('inspection_images', 'public');
        }

        $priority = strtoupper($validated['priority'] ?? 'P2');
        if (! in_array($priority, ['P1', 'P2', 'P3'])) {
            $priority = 'P2';
        }

        P2hInspection::create([
            'unit_id' => $unit?->id,
            'code_unit' => $validated['code_unit'],
            'wo_number' => ! empty($validated['wo_number']) ? $validated['wo_number'] : P2hInspection::generateNextWoNumber(),
            'model' => $unit?->model,
            'component_group' => $validated['component_group'] ?? null,
            'component_name' => $validated['component_name'] ?? null,
            'priority' => $priority,
            'image' => $imagePath,
            'date' => $validated['date'],
            'hm' => $validated['hm'],
            'hour_meter' => number_format((float) $validated['hm'], 1),
            'finding' => $validated['finding'],
            'inspect_by' => $validated['inspect_by'],
            'action' => $validated['action'] ?? '',
            'closed_by' => $closedBy,
            'closed_at' => $closedAt,
            'status' => $status,
            'shift' => $request->input('shift', 'Shift 1'),
            'notes' => $validated['finding'],
        ]);

        return back()->with('success', "Temuan Inspection Unit untuk unit {$validated['code_unit']} berhasil ditambahkan.");
    }

    /**
     * Update the specified P2H inspection record.
     */
    public function update(Request $request, $id)
    {
        $inspection = P2hInspection::findOrFail($id);

        $validated = $request->validate([
            'wo_number' => 'nullable|string',
            'date' => 'required|date',
            'hm' => 'required|numeric|min:0',
            'component_group' => 'nullable|string',
            'component_name' => 'nullable|string',
            'priority' => 'nullable|string|in:P1,P2,P3,p1,p2,p3',
            'finding' => 'required|string',
            'inspect_by' => 'required|string',
            'action' => 'nullable|string',
            'closed_by' => 'nullable|string',
            'status' => 'required|string',
            'image' => 'nullable|image|max:10240',
            'remove_image' => 'nullable|boolean',
        ]);

        $status = strtoupper($validated['status']);
        $closedAt = $inspection->closed_at;
        $closedBy = $validated['closed_by'] ?? $inspection->closed_by;

        if ($status === 'CLOSED') {
            if (! $closedAt) {
                $closedAt = now()->toDateString();
            }
            if (! $closedBy) {
                $closedBy = auth()->user()?->name ?: 'Admin';
            }
        } else {
            $closedAt = null;
            $closedBy = null;
        }

        $imagePath = $inspection->image;
        if ($request->boolean('remove_image')) {
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            $imagePath = null;
        } elseif ($request->hasFile('image')) {
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            $imagePath = $request->file('image')->store('inspection_images', 'public');
        }

        $priority = strtoupper($validated['priority'] ?? ($inspection->priority ?: 'P2'));
        if (! in_array($priority, ['P1', 'P2', 'P3'])) {
            $priority = 'P2';
        }

        $inspection->update([
            'wo_number' => ! empty($validated['wo_number']) ? $validated['wo_number'] : ($inspection->wo_number ?: P2hInspection::generateNextWoNumber()),
            'component_group' => $validated['component_group'] ?? $inspection->component_group,
            'component_name' => $validated['component_name'] ?? $inspection->component_name,
            'priority' => $priority,
            'image' => $imagePath,
            'date' => $validated['date'],
            'hm' => $validated['hm'],
            'hour_meter' => number_format((float) $validated['hm'], 1),
            'finding' => $validated['finding'],
            'inspect_by' => $validated['inspect_by'],
            'action' => $validated['action'],
            'closed_by' => $closedBy,
            'closed_at' => $closedAt,
            'status' => $status,
        ]);

        return back()->with('success', "Data temuan Inspection Unit {$inspection->code_unit} berhasil diperbarui.");
    }

    /**
     * Remove the specified P2H inspection record.
     */
    public function destroy($id)
    {
        $inspection = P2hInspection::findOrFail($id);
        $codeUnit = $inspection->code_unit;

        if ($inspection->image && Storage::disk('public')->exists($inspection->image)) {
            Storage::disk('public')->delete($inspection->image);
        }

        $inspection->delete();

        return back()->with('success', "Data temuan Inspection Unit {$codeUnit} berhasil dihapus.");
    }

    /**
     * Export P2H inspection list to Excel matching the exact user image headers.
     */
    public function export(Request $request): StreamedResponse
    {
        $query = P2hInspection::with('unit');

        if ($request->filled('dateFrom')) {
            $query->whereDate('date', '>=', $request->dateFrom);
        }
        if ($request->filled('dateTo')) {
            $query->whereDate('date', '<=', $request->dateTo);
        }
        if ($request->filled('codeUnitFilter')) {
            $query->where('code_unit', $request->codeUnitFilter);
        }
        if ($request->filled('statusFilter') && $request->statusFilter !== 'ALL') {
            $query->where('status', strtoupper($request->statusFilter));
        }
        if ($request->filled('priorityFilter') && $request->priorityFilter !== 'ALL') {
            $query->where('priority', strtoupper($request->priorityFilter));
        }
        if ($request->filled('componentGroupFilter') && $request->componentGroupFilter !== 'ALL') {
            $query->where('component_group', $request->componentGroupFilter);
        }

        $data = $query->orderBy('date', 'desc')->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Inspection Unit');

        // Headers:
        // NO WO | DATE | Unit | MODEL UNIT | COMPONENT GROUP | COMPONENT NAME | PRIORITY | HM | FINDING | INSPECT BY | AGING (days) | ACTION | Closed by | STATUS
        $headers = [
            'NO WO',
            'DATE',
            'Unit',
            'MODEL UNIT',
            'COMPONENT GROUP',
            'COMPONENT NAME',
            'PRIORITY',
            'HM',
            'FINDING',
            'INSPECT BY',
            'AGING (days)',
            'ACTION',
            'Closed by',
            'STATUS',
        ];
        $sheet->fromArray([$headers], null, 'A1');

        // Style the header in cyan/teal #00F0D0
        $headerRange = 'A1:N1';
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => '000000'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '00F0D0'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        $rows = [];
        foreach ($data as $item) {
            $status = strtoupper($item->status ?: 'OPEN');
            $closedBy = $status === 'CLOSED' ? ($item->closed_by ?: 'Admin') : '-';

            $rows[] = [
                $item->wo_number ?: ('PLT/WO/INS/'.str_pad($item->id, 3, '0', STR_PAD_LEFT)),
                Carbon::parse($item->date)->format('d/m/Y'),
                $item->code_unit,
                $item->model ?: ($item->unit?->model ?: '-'),
                $item->component_group ?: '-',
                $item->component_name ?: '-',
                strtoupper($item->priority ?: 'P2'),
                (float) $item->hm,
                $item->finding ?: '-',
                $item->inspect_by ?: ($item->inspector_name ?: '-'),
                $item->aging_days,
                $item->action ?: '-',
                $closedBy,
                $status,
            ];
        }

        if (! empty($rows)) {
            $sheet->fromArray($rows, null, 'A2');

            $lastRow = count($rows) + 1;
            $sheet->getStyle("A2:N{$lastRow}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'CCCCCC'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);

            // Alignments
            $sheet->getStyle("A2:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B2:B{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C2:C{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("G2:G{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("H2:H{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("K2:K{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("N2:N{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        foreach (range('A', 'N') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Inspection_Unit_'.date('Ymd_His').'.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
