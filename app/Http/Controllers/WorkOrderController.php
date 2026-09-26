<?php

namespace App\Http\Controllers;

use App\Exports\BreakdownWorkOrderExport;
use App\Exports\WorkOrderExport;
use App\Imports\BreakdownImport;
use App\Imports\LastServiceImport;
use App\Imports\WorkOrderImport;
use App\Models\MaintenanceOrder;
use App\Models\Manpower;
use App\Models\PlanInspection;
use App\Models\PlantForm;
use App\Models\ServiceLog;
use App\Models\Tool;
use App\Models\Tyre;
use App\Models\Unit;
use App\Models\UnitApl;
use App\Models\WorkOrder;
use App\Models\WorkOrderTask;
use App\Services\TyreWorkOrderSyncService;
use App\Services\WorkOrderService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WorkOrderController extends Controller
{
    public function index(Request $request)
    {
        // Breakdown tab: semua WO yang belum completed (semua tipe_wo)
        $breakdownQuery = WorkOrder::with(['unit', 'tasks'])->where(function ($q) {
            $q->where('status_pengerjaan', 'not like', '%COMPLETED%')
                ->where('status_pengerjaan', 'not like', '%CLOSED%');
        });

        if ($request->filled('status') && $request->status !== 'Semua') {
            $statusReq = $request->status;
            $breakdownQuery->where(function ($query) use ($statusReq) {
                $query->where('status_wo', $statusReq)
                    ->orWhere('status_pengerjaan', $statusReq);
            });
        }

        if ($request->filled('tipe') && $request->tipe !== 'Semua') {
            $breakdownQuery->where('tipe_wo', strtoupper($request->tipe));
        }

        if ($request->filled('unit')) {
            $unitSearch = trim($request->unit);
            $breakdownQuery->where(function ($query) use ($unitSearch) {
                $query->where('no_wo', 'like', "%{$unitSearch}%")
                    ->orWhereHas('unit', function ($q) use ($unitSearch) {
                        $q->where('code_unit', 'like', "%{$unitSearch}%")
                            ->orWhere('model', 'like', "%{$unitSearch}%");
                    });
            });
        }

        $perPageInput = $request->input('per_page', 25);
        if ($perPageInput === 'all' || (int) $perPageInput > 500) {
            $perPage = 1000;
        } else {
            $perPage = max(1, (int) $perPageInput);
        }

        $breakdownParams = array_merge(['tab' => 'breakdown'], $request->except('page'));
        $orderDir = strtolower($request->get('order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $historicalParams = array_merge(['tab' => 'historical', 'order' => $orderDir], $request->except('page'));

        $breakdowns = $breakdownQuery
            ->orderByDesc('id')
            ->paginate($perPage)
            ->appends($breakdownParams);

        $historicalQuery = WorkOrder::with(['unit', 'tasks'])->where(function ($q) {
            $q->whereIn('status_pengerjaan', ['CLOSED', 'COMPLETED', 'COMPLETED - PEKERJAAN SELESAI'])
                ->orWhere('status_pengerjaan', 'like', '%COMPLETED%')
                ->orWhere('status_pengerjaan', 'like', '%CLOSED%')
                ->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
        });

        if ($request->filled('type') && $request->type !== 'Semua') {
            $historicalQuery->where('tipe_wo', strtoupper($request->type));
        }

        if ($request->filled('unit')) {
            $unitSearch = trim($request->unit);
            $historicalQuery->where(function ($query) use ($unitSearch) {
                $query->where('no_wo', 'like', "%{$unitSearch}%")
                    ->orWhereHas('unit', function ($q) use ($unitSearch) {
                        $q->where('code_unit', 'like', "%{$unitSearch}%")
                            ->orWhere('model', 'like', "%{$unitSearch}%");
                    });
            });
        }

        $historical = $historicalQuery
            ->orderBy('id', $orderDir)
            ->paginate($perPage)
            ->appends($historicalParams);

        $historicalKpi = [
            'total_closed' => WorkOrder::where(function ($q) {
                $q->whereIn('status_pengerjaan', ['CLOSED', 'COMPLETED', 'COMPLETED - PEKERJAAN SELESAI'])
                    ->orWhere('status_pengerjaan', 'like', '%COMPLETED%')
                    ->orWhere('status_pengerjaan', 'like', '%CLOSED%')
                    ->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->count(),
            'schedule_closed' => WorkOrder::where(function ($q) {
                $q->whereIn('status_pengerjaan', ['CLOSED', 'COMPLETED', 'COMPLETED - PEKERJAAN SELESAI'])
                    ->orWhere('status_pengerjaan', 'like', '%COMPLETED%')
                    ->orWhere('status_pengerjaan', 'like', '%CLOSED%')
                    ->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->where('tipe_wo', 'SCHEDULE')->count(),
            'breakdown_closed' => WorkOrder::where(function ($q) {
                $q->whereIn('status_pengerjaan', ['CLOSED', 'COMPLETED', 'COMPLETED - PEKERJAAN SELESAI'])
                    ->orWhere('status_pengerjaan', 'like', '%COMPLETED%')
                    ->orWhere('status_pengerjaan', 'like', '%CLOSED%')
                    ->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->where('tipe_wo', 'BREAKDOWN')->count(),
            'total_hours' => round((float) WorkOrder::where(function ($q) {
                $q->whereIn('status_pengerjaan', ['CLOSED', 'COMPLETED', 'COMPLETED - PEKERJAAN SELESAI'])
                    ->orWhere('status_pengerjaan', 'like', '%COMPLETED%')
                    ->orWhere('status_pengerjaan', 'like', '%CLOSED%')
                    ->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->sum('durasi_hrs'), 1),
        ];

        $activeBreakdownCount = WorkOrder::where('tipe_wo', 'BREAKDOWN')->where(function ($q) {
            $q->whereNotIn('status_pengerjaan', ['CLOSED', 'COMPLETED', 'COMPLETED - PEKERJAAN SELESAI'])
                ->where('status_pengerjaan', 'not like', '%COMPLETED%')
                ->where('status_pengerjaan', 'not like', '%CLOSED%')
                ->whereNotIn('status_wo', ['COMPLETED', 'CLOSED']);
        })->count();

        $breakdownKpi = [
            'total_wo' => $activeBreakdownCount,
            'total_active' => $activeBreakdownCount,
            'open' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where(function ($q) {
                $q->whereIn('status_pengerjaan', ['OPEN', 'PLANNING', 'PLANNING - PERENCANAAN PEKERJAAN'])
                    ->orWhere('status_pengerjaan', 'like', '%PLANNING%')
                    ->orWhere('status_wo', 'OPEN');
            })->where(function ($q) {
                $q->whereNotIn('status_pengerjaan', ['CLOSED', 'COMPLETED', 'COMPLETED - PEKERJAAN SELESAI'])
                    ->where('status_pengerjaan', 'not like', '%COMPLETED%')
                    ->where('status_pengerjaan', 'not like', '%CLOSED%')
                    ->whereNotIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->count(),
            'process' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where(function ($q) {
                $q->whereIn('status_pengerjaan', ['IN PROGRESS', 'IN PROGRESS - SEDANG DIKERJAKAN', 'PROCESS'])
                    ->orWhere('status_pengerjaan', 'like', '%PROGRESS%')
                    ->orWhere('status_wo', 'PROCESS');
            })->where(function ($q) {
                $q->whereNotIn('status_pengerjaan', ['CLOSED', 'COMPLETED', 'COMPLETED - PEKERJAAN SELESAI'])
                    ->where('status_pengerjaan', 'not like', '%COMPLETED%')
                    ->where('status_pengerjaan', 'not like', '%CLOSED%')
                    ->whereNotIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->count(),
            'waiting_part' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where(function ($q) {
                $q->where('status_wo', 'WAITING PART')
                    ->orWhere('status_pengerjaan', 'WAITING PART')
                    ->orWhere('status_pengerjaan', 'like', '%WAITING%');
            })->where(function ($q) {
                $q->whereNotIn('status_pengerjaan', ['CLOSED', 'COMPLETED', 'COMPLETED - PEKERJAAN SELESAI'])
                    ->where('status_pengerjaan', 'not like', '%COMPLETED%')
                    ->where('status_pengerjaan', 'not like', '%CLOSED%')
                    ->whereNotIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->count(),
            'completed' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where(function ($q) {
                $q->whereIn('status_pengerjaan', ['CLOSED', 'COMPLETED', 'COMPLETED - PEKERJAAN SELESAI'])
                    ->orWhere('status_pengerjaan', 'like', '%COMPLETED%')
                    ->orWhere('status_pengerjaan', 'like', '%CLOSED%')
                    ->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->count(),
        ];

        return Inertia::render('WorkOrder/Index', [
            'breakdown' => [
                'kpi' => $breakdownKpi,
                'data' => $breakdowns,
            ],
            'historical' => [
                'kpi' => $historicalKpi,
                'data' => $historical,
            ],
        ]);
    }

    public function create(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk membuat Work Order.');

        $units = Unit::select('id', 'code_unit', 'model', 'type_unit', 'sn_chassis as serial_number', 'engine_model', 'hm as current_hm', 'location as lokasi')->get();

        // Fetch dynamic manpowers from database
        $manpowers = Manpower::orderBy('nama', 'asc')->get(['id', 'nama', 'bagian', 'departemen', 'nrp']);

        $tools = Tool::where('status', 'AVAILABLE')->get();

        $suggestedNumbers = WorkOrderService::getAllSuggestedNumbers();
        $suggestedCmNo = $suggestedNumbers['CM - CORRECTIVE MAINTENANCE'] ?? WorkOrderService::generateWoNumber('CM');
        $suggestedPmNo = $suggestedNumbers['PM - PREVENTIVE MAINTENANCE'] ?? WorkOrderService::generateWoNumber('PM');

        $selectedUnitId = $request->query('unit_id');
        $initialApls = [];
        $existingForms = [];
        if ($selectedUnitId) {
            $targetUnit = Unit::find($selectedUnitId);
            if ($targetUnit) {
                $initialApls = UnitApl::where(function ($query) use ($targetUnit) {
                    $query->where('unit_id', $targetUnit->id)
                        ->orWhere('is_global', true)
                        ->orWhere(function ($q) use ($targetUnit) {
                            $q->whereNull('unit_id')
                                ->where(function ($sq) use ($targetUnit) {
                                    $sq->whereNull('type_unit')
                                        ->orWhere('type_unit', $targetUnit->type_unit);
                                });
                        });
                })->orderBy('id', 'asc')->get();

                $existingForms = PlantForm::where('unit_id', $targetUnit->id)
                    ->latest('date')
                    ->take(10)
                    ->get(['id', 'form_type', 'form_number', 'date', 'shift', 'service_type', 'status']);
            }
        }

        $stockTyres = Tyre::whereNull('unit_id')
            ->where('condition', 'STOCK')
            ->orderBy('serial_number')
            ->get(['id', 'serial_number', 'brand', 'type_size', 'pattern', 'psi', 'otd', 'rtd']);

        return Inertia::render('WorkOrder/Create', [
            'units' => $units,
            'manpowers' => $manpowers,
            'tools' => $tools,
            'suggestedCmNo' => $suggestedCmNo,
            'suggestedPmNo' => $suggestedPmNo,
            'suggestedNumbers' => $suggestedNumbers,
            'suggestedNoOrder' => MaintenanceOrder::generateNextNoOrder(),
            'initialApls' => $initialApls,
            'existingForms' => $existingForms,
            'stockTyres' => $stockTyres,
        ]);
    }

    public function suggestNumber(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403);

        $type = $request->query('type', 'CM');
        $noWo = WorkOrderService::generateWoNumber($type);
        $prefix = WorkOrderService::getPrefixForType($type);

        return response()->json([
            'no_wo' => $noWo,
            'prefix' => $prefix,
        ]);
    }

    public function store(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menyimpan Work Order.');

        $request->validate([
            'no_wo' => 'nullable|string|max:100',
            'tipe_wo' => 'required|string|max:100',
            'unit_id' => 'required|exists:units,id',
            'status_wo' => 'required|string|max:100',
            'status_pengerjaan' => 'nullable|string|max:100',
            'downtime_code' => 'nullable|string|max:50',
            'site' => 'nullable|string|max:100',
            'waktu_breakdown' => 'nullable|date',
            'waktu_rfu' => 'nullable|date|after_or_equal:waktu_breakdown',
            'durasi_hrs' => 'nullable|numeric|min:0|max:999999',
            'delay' => 'nullable|numeric|min:0|max:999999',
            'hm_unit' => 'nullable|numeric|min:0',
            'hm_bd' => 'nullable|numeric|min:0',
            'hm_rfu' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string|max:2000',
            'problem' => 'nullable|string|max:2000',
            'component_group' => 'nullable|string|max:255',
            'model_system' => 'nullable|string|max:255',
            'priority' => 'nullable|in:LOW,MEDIUM,HIGH,CRITICAL',
            'request_date' => 'nullable|date',
            'tasks' => 'nullable|array|max:100',
            'tasks.*.group_component' => 'nullable|string|max:255',
            'tasks.*.component' => 'nullable|string|max:255',
            'tasks.*.task_description' => 'nullable|string|max:1000',
            'tasks.*.problem' => 'nullable|string|max:2000',
            'tasks.*.activity_progress' => 'nullable|string|max:2000',
            'tasks.*.est_finish' => 'nullable|string',
            'tasks.*.mechanic' => 'nullable|string|max:255',
            'tasks.*.tools' => 'nullable',
            'tasks.*.start_date' => 'nullable|string',
            'tasks.*.end_date' => 'nullable|string',
            'tasks.*.downtime_hrs' => 'nullable|numeric|min:0|max:999999',
            'tasks.*.target_date' => 'nullable|string',
            'tasks.*.status' => 'nullable|string|max:100',
            'plan_inspection_categories' => 'nullable|array',
            'plan_inspection_categories.*' => 'string|in:washing,inspection,greasing,cleaning_track',
            'plan_inspection_shift' => 'nullable|string|in:all,shift_1,shift_2',
            'plan_inspection_date' => 'nullable|date',
            'order_no_order' => 'nullable|string|max:100',
            'order_pr' => 'nullable|string|max:100',
            'order_po' => 'nullable|string|max:100',
            'order_eta_part' => 'nullable|string|max:50',
            'far_no_wo' => 'nullable|string|max:100',
            'abr_no_wo' => 'nullable|string|max:100',
            'mag_plug_no_wo' => 'nullable|string|max:100',
            'form_washing_no' => 'nullable|string|max:100',
            'form_penundaan_service_no' => 'nullable|string|max:100',
            'form_service_unit_no' => 'nullable|string|max:100',
            'form_washing_attachment' => 'nullable|file|max:20480',
            'form_penundaan_service_attachment' => 'nullable|file|max:20480',
            'form_service_unit_attachment' => 'nullable|file|max:20480',
            'tyre_replacements' => 'nullable|array',
            'next_action' => 'nullable|string|in:create_order,create_far,create_abr,create_magnetic_plug,create_form_washing,create_form_penundaan_service,create_form_service_unit',
        ]);

        try {
            $durasiHrs = $request->durasi_hrs;
            if (($durasiHrs === null || $durasiHrs === '' || (float) $durasiHrs == 0) && $request->waktu_breakdown) {
                $start = Carbon::parse($request->waktu_breakdown);
                $end = $request->waktu_rfu ? Carbon::parse($request->waktu_rfu) : Carbon::now();
                if ($end >= $start) {
                    $durasiHrs = round(abs($end->diffInMinutes($start)) / 60, 2);
                }
            }

            $totalPekerjaan = 0;
            if ($request->tasks && is_array($request->tasks)) {
                foreach ($request->tasks as $t) {
                    $totalPekerjaan += (float) ($t['downtime_hrs'] ?? 0);
                }
            }
            $delay = max(0, round(((float) $durasiHrs) - $totalPekerjaan, 2));

            $firstTaskGroup = null;
            if ($request->tasks && is_array($request->tasks) && ! empty($request->tasks[0])) {
                $firstTaskGroup = $request->tasks[0]['group_component'] ?? ($request->tasks[0]['component'] ?? null);
            }

            $wo = WorkOrderService::createWorkOrder([
                'no_wo' => $request->no_wo,
                'tipe_wo' => $request->tipe_wo,
                'downtime_code' => $request->downtime_code,
                'site' => $request->site ?: '-',
                'unit_id' => $request->unit_id,
                'waktu_breakdown' => $request->waktu_breakdown,
                'waktu_rfu' => $request->waktu_rfu,
                'durasi_hrs' => $durasiHrs,
                'delay' => $delay,
                'hm_unit' => $request->hm_unit ?: ($request->hm_bd ?: ($request->hm_rfu ?: 0)),
                'hm_bd' => $request->hm_bd,
                'hm_rfu' => $request->hm_rfu,
                'status_wo' => $request->status_wo,
                'status_pengerjaan' => $request->status_pengerjaan ? strtoupper($request->status_pengerjaan) : ($request->waktu_rfu ? 'COMPLETED - PEKERJAAN SELESAI' : 'PLANNING - PERENCANAAN PEKERJAAN'),
                'keterangan' => $request->keterangan,
                'priority' => $request->priority ?? 'MEDIUM',
                'request_date' => $request->request_date ?? now(),
                'request_by' => auth()->user()->name ?? 'System',
                'problem' => $request->problem ?: (isset($request->tasks[0]['problem']) ? $request->tasks[0]['problem'] : null),
                'component' => $request->component_group ?? ($request->component ?? $firstTaskGroup),
                'component_model' => $request->model_system ?? $request->component_model,
            ]);

            if ($request->tasks && is_array($request->tasks)) {
                foreach ($request->tasks as $task) {
                    $grpComp = $task['group_component'] ?? ($task['component'] ?? '');
                    $comp = $task['component'] ?? ($task['group_component'] ?? '');
                    WorkOrderTask::create([
                        'work_order_id' => $wo->id,
                        'group_component' => $grpComp,
                        'component' => $comp,
                        'task_description' => $task['task_description'] ?? '',
                        'problem' => $task['problem'] ?? null,
                        'activity_progress' => $task['activity_progress'] ?? null,
                        'est_finish' => ! empty($task['est_finish']) ? Carbon::parse($task['est_finish']) : null,
                        'mechanic' => $task['mechanic'] ?? '',
                        'tools' => isset($task['tools']) ? (is_array($task['tools']) ? implode(', ', $task['tools']) : $task['tools']) : null,
                        'start_date' => ! empty($task['start_date']) ? Carbon::parse($task['start_date']) : null,
                        'end_date' => ! empty($task['end_date']) ? Carbon::parse($task['end_date']) : null,
                        'downtime_hrs' => isset($task['downtime_hrs']) && $task['downtime_hrs'] !== '' ? (float) $task['downtime_hrs'] : 0,
                        'target_date' => ! empty($task['start_date']) ? Carbon::parse($task['start_date']) : (! empty($task['target_date']) ? Carbon::parse($task['target_date']) : null),
                        'status' => $task['status'] ?? 'B0 ( On progress )',
                    ]);
                }
            }

            // Sync tyre replacements if applicable
            $isTyreWo = str_contains(strtoupper((string) $wo->status_wo), 'TYRE') || str_contains(strtoupper((string) $wo->tipe_wo), 'TYRE');
            if ($isTyreWo || $request->filled('tyre_replacements')) {
                TyreWorkOrderSyncService::syncTyreReplacements($wo, (array) $request->input('tyre_replacements', []));
            }

            $createdPlanInspections = 0;
            if ($request->tipe_wo === 'SCHEDULE' && ! empty($request->plan_inspection_categories) && $wo->unit_id) {
                $categories = array_values(array_unique(array_intersect(
                    ['washing', 'inspection', 'greasing', 'cleaning_track'],
                    (array) $request->input('plan_inspection_categories', [])
                )));

                if (! empty($categories)) {
                    $rawDate = $request->input('plan_inspection_date')
                        ?: ($request->waktu_breakdown ? Carbon::parse($request->waktu_breakdown)->format('Y-m-d') : Carbon::now()->format('Y-m-d'));
                    $dateStr = Carbon::parse($rawDate)->format('Y-m-d');

                    $fourShiftCats = PlanInspectionController::get4ShiftCategories();
                    $unitData = PlanInspectionController::getCustomGroupedUnits();
                    $unitCategory = $unitData['unitIdToCategory'][$wo->unit_id] ?? null;
                    $chosenShift = $request->input('plan_inspection_shift', 'all');

                    foreach ($categories as $cat) {
                        $is4Shift = ($cat === 'greasing' && in_array($unitCategory, $fourShiftCats));
                        if ($is4Shift) {
                            $targetShifts = ($chosenShift === 'all') ? ['shift_1', 'shift_2'] : [$chosenShift];
                        } else {
                            $targetShifts = ['all'];
                        }

                        foreach ($targetShifts as $s) {
                            $existing = PlanInspection::where('unit_id', $wo->unit_id)
                                ->whereDate('inspection_date', $dateStr)
                                ->where('category', $cat)
                                ->where('shift', $s)
                                ->first();

                            if ($existing) {
                                $existing->update([
                                    'is_completed' => true,
                                    'notes' => $existing->notes ?: 'Dibuat otomatis dari WO Schedule: '.$wo->no_wo,
                                ]);
                            } else {
                                PlanInspection::create([
                                    'unit_id' => $wo->unit_id,
                                    'inspection_date' => $dateStr,
                                    'category' => $cat,
                                    'shift' => $s,
                                    'is_completed' => true,
                                    'notes' => 'Dibuat otomatis dari WO Schedule: '.$wo->no_wo,
                                ]);
                            }
                            $createdPlanInspections++;
                        }
                    }
                }
            }

            if ($wo->tipe_wo === 'SCHEDULE' && ($wo->status_pengerjaan === 'CLOSED' || in_array(strtoupper($wo->status_wo), ['COMPLETED', 'CLOSED']))) {
                self::syncScheduleToServiceLog($wo);
            }

            $successMsg = 'Work Order ('.$wo->no_wo.') berhasil dibuat.';
            if ($createdPlanInspections > 0) {
                $successMsg .= ' Serta '.$createdPlanInspections.' kegiatan otomatis tersimpan di Plan Inspection.';
            }

            // Save form attachments if uploaded
            if ($request->hasFile('form_washing_attachment')) {
                $request->file('form_washing_attachment')->store('work_orders/forms', 'public');
            }
            if ($request->hasFile('form_penundaan_service_attachment')) {
                $request->file('form_penundaan_service_attachment')->store('work_orders/forms', 'public');
            }
            if ($request->hasFile('form_service_unit_attachment')) {
                $request->file('form_service_unit_attachment')->store('work_orders/forms', 'public');
            }

            // Handle next action from "Tindakan Lanjutan (Pembuatan Dokumen)"
            $nextAction = $request->input('next_action');
            if ($nextAction === 'create_order') {
                return redirect()->route('monitoring-orderan.create', [
                    'unit_id' => $wo->unit_id,
                    'code_unit' => $wo->unit?->code_unit,
                    'hm' => $wo->hm_unit,
                    'no_wo' => $wo->no_wo,
                    'no_order' => $request->input('order_no_order'),
                    'pr' => $request->input('order_pr'),
                    'po' => $request->input('order_po'),
                    'eta_part' => $request->input('order_eta_part'),
                    'finding' => $wo->problem,
                    'action' => $wo->keterangan,
                    'priority' => $wo->priority,
                    'return_to' => route('work-orders.show', $wo->id),
                ])->with('success', $successMsg.' Lanjutkan pembuatan Order List.');
            }

            if ($nextAction === 'create_far') {
                return redirect()->route('failure-analysis.create', [
                    'unit_id' => $wo->unit_id,
                    'no_wo' => $request->input('far_no_wo') ?: $wo->no_wo,
                    'return_to' => route('work-orders.show', $wo->id),
                ])->with('success', $successMsg.' Lanjutkan pembuatan FAR.');
            }

            if ($nextAction === 'create_abr') {
                return redirect()->route('abr.create', [
                    'unit_id' => $wo->unit_id,
                    'no_wo' => $request->input('abr_no_wo') ?: $wo->no_wo,
                    'return_to' => route('work-orders.show', $wo->id),
                ])->with('success', $successMsg.' Lanjutkan pembuatan ABR.');
            }

            if ($nextAction === 'create_magnetic_plug') {
                return redirect()->route('repair.magnetic-plug.create', [
                    'unit_id' => $wo->unit_id,
                    'hm' => $wo->hm_unit,
                    'no_wo' => $request->input('mag_plug_no_wo') ?: $wo->no_wo,
                    'return_to' => route('work-orders.show', $wo->id),
                ])->with('success', $successMsg.' Lanjutkan input Magnetic Plug.');
            }

            if ($nextAction === 'create_form_washing') {
                return redirect()->route('form-washing-unit.index', [
                    'unit_id' => $wo->unit_id,
                    'no_wo' => $request->input('form_washing_no') ?: $wo->no_wo,
                    'return_to' => route('work-orders.show', $wo->id),
                ])->with('success', $successMsg.' Lanjutkan pengisian Form Washing Unit.');
            }

            if ($nextAction === 'create_form_penundaan_service') {
                return redirect()->route('form-penundaan-service.index', [
                    'unit_id' => $wo->unit_id,
                    'no_wo' => $request->input('form_penundaan_service_no') ?: $wo->no_wo,
                    'return_to' => route('work-orders.show', $wo->id),
                ])->with('success', $successMsg.' Lanjutkan Form Penundaan Service.');
            }

            if ($nextAction === 'create_form_service_unit') {
                return redirect()->route('form-oht773.create', [
                    'unit_id' => $wo->unit_id,
                    'no_wo' => $request->input('form_service_unit_no') ?: $wo->no_wo,
                    'return_to' => route('work-orders.show', $wo->id),
                ])->with('success', $successMsg.' Lanjutkan pengisian Form Service Unit.');
            }

            if ($request->input('from') === 'pm-monitoring' || $request->input('return_to') === '/pm-monitoring' || str_contains($request->header('referer', ''), 'pm-monitoring')) {
                return redirect()->route('pm-monitoring.index')->with('success', $successMsg)->with('message', $successMsg);
            }

            if ($wo->status_pengerjaan === 'CLOSED' || in_array(strtoupper($wo->status_wo), ['COMPLETED', 'CLOSED'])) {
                return redirect()->route('work-orders.index', ['tab' => 'historical'])->with('success', $successMsg);
            }

            if ($wo->tipe_wo === 'SCHEDULE') {
                return redirect()->route('work-orders.index', ['tab' => 'schedule'])->with('success', $successMsg);
            }

            return redirect()->route('work-orders.index', ['tab' => 'breakdown'])->with('success', $successMsg);
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal membuat Work Order: '.$e->getMessage());
        }
    }

    public function updateStatus(Request $request, $id)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengubah status Work Order.');

        $request->validate([
            'status_wo' => 'nullable|string|max:100',
            'status_pengerjaan' => 'nullable|string|max:100',
            'waktu_rfu' => 'nullable|date',
            'hm_rfu' => 'nullable|numeric|min:0',
        ]);

        $wo = WorkOrder::findOrFail($id);
        $updateData = [];

        if ($request->filled('status_wo')) {
            $updateData['status_wo'] = $request->status_wo;
        }

        if ($request->filled('status_pengerjaan')) {
            $updateData['status_pengerjaan'] = strtoupper($request->status_pengerjaan);
        }

        $isClosing = (isset($updateData['status_pengerjaan']) && (
            str_contains(strtoupper($updateData['status_pengerjaan']), 'COMPLETED')
            || str_contains(strtoupper($updateData['status_pengerjaan']), 'CLOSED')
        ))
            || (isset($updateData['status_wo']) && (
                str_contains(strtoupper($updateData['status_wo']), 'COMPLETED')
                || str_contains(strtoupper($updateData['status_wo']), 'CLOSED')
            ));

        if ($request->filled('waktu_rfu')) {
            $updateData['waktu_rfu'] = $request->waktu_rfu;
            if ($wo->waktu_breakdown) {
                $start = Carbon::parse($wo->waktu_breakdown);
                $end = Carbon::parse($request->waktu_rfu);
                if ($end->greaterThanOrEqualTo($start)) {
                    $updateData['durasi_hrs'] = round(abs($end->diffInMinutes($start)) / 60, 2);
                }
            }
        } elseif ($isClosing && ! $wo->waktu_rfu) {
            $updateData['waktu_rfu'] = now();
            if ($wo->waktu_breakdown) {
                $start = Carbon::parse($wo->waktu_breakdown);
                $end = now();
                if ($end->greaterThanOrEqualTo($start)) {
                    $updateData['durasi_hrs'] = round(abs($end->diffInMinutes($start)) / 60, 2);
                }
            }
        }

        if ($request->filled('hm_rfu')) {
            $updateData['hm_rfu'] = $request->hm_rfu;
        }

        if ($isClosing) {
            $updateData['close_date'] = $updateData['waktu_rfu'] ?? ($wo->waktu_rfu ?? now());
        } elseif (isset($updateData['status_pengerjaan']) && ! $isClosing) {
            $updateData['close_date'] = null;
        }

        if (isset($updateData['durasi_hrs'])) {
            $totalPekerjaan = (float) $wo->tasks()->sum('downtime_hrs');
            $updateData['delay'] = max(0, round(((float) $updateData['durasi_hrs']) - $totalPekerjaan, 2));
        }

        $wo->update($updateData);

        if ($wo->tipe_wo === 'SCHEDULE' && ($isClosing || str_contains(strtoupper((string) $wo->status_pengerjaan), 'CLOSED') || str_contains(strtoupper((string) $wo->status_pengerjaan), 'COMPLETED') || in_array(strtoupper((string) $wo->status_wo), ['COMPLETED', 'CLOSED']))) {
            self::syncScheduleToServiceLog($wo);
        }

        $successMsg = $isClosing
            ? "Status Work Order {$wo->no_wo} berhasil diubah menjadi COMPLETED (otomatis masuk ke Historical WO Closed)."
            : "Status Work Order {$wo->no_wo} berhasil diubah.";

        return back()->with('success', $successMsg);
    }

    public static function syncScheduleToServiceLog(WorkOrder $wo): void
    {
        if (! $wo->unit_id) {
            return;
        }

        $unit = Unit::find($wo->unit_id);
        if (! $unit) {
            return;
        }

        $actualHm = (float) ($wo->hm_rfu ?: ($wo->hm_bd ?: ($wo->hm_unit ?: $unit->hm)));
        $actualDate = $wo->waktu_rfu
            ? Carbon::parse($wo->waktu_rfu)->toDateString()
            : ($wo->waktu_breakdown ? Carbon::parse($wo->waktu_breakdown)->toDateString() : ($wo->request_date ? Carbon::parse($wo->request_date)->toDateString() : now()->toDateString()));

        $serviceType = trim($wo->problem ?: ($wo->keterangan ?: 'Periodical Service'));
        if (! empty($serviceType) && is_numeric($serviceType)) {
            $serviceType = "PS {$serviceType} H";
        }

        $serviceLog = ServiceLog::where('unit_id', $unit->id)
            ->whereDate('actual_date', $actualDate)
            ->where('actual_hm', $actualHm)
            ->first();

        if ($serviceLog) {
            $serviceLog->update([
                'status' => 'completed',
                'service_type' => $serviceType ?: $serviceLog->service_type,
                'actual_hm' => $actualHm,
                'target_hm' => $actualHm,
                'actual_date' => $actualDate,
                'target_date' => $actualDate,
                'accuracy' => 100,
            ]);
        } else {
            ServiceLog::create([
                'unit_id' => $unit->id,
                'service_type' => $serviceType ?: 'PS 500 H',
                'status' => 'completed',
                'actual_hm' => $actualHm,
                'target_hm' => $actualHm,
                'actual_date' => $actualDate,
                'target_date' => $actualDate,
                'accuracy' => 100,
            ]);
        }

        if ($actualHm > 0 && $actualHm >= ($unit->hm ?? 0)) {
            $unit->update(['hm' => $actualHm]);
        }
    }

    public function show($id)
    {
        $wo = WorkOrder::with([
            'unit',
            'breakdownDetails',
            'parts',
            'manpowers',
            'vendors',
            'warranties',
            'statusHistories',
            'tasks',
        ])->findOrFail($id);

        if ($wo->waktu_breakdown && ! $wo->waktu_rfu) {
            $start = Carbon::parse($wo->waktu_breakdown);
            $currentHours = round(abs(Carbon::now()->diffInMinutes($start)) / 60, 2);
            if ($currentHours > 0 && abs((float) $wo->durasi_hrs - $currentHours) >= 0.05) {
                $totalPekerjaan = (float) $wo->tasks->sum('downtime_hrs');
                $currentDelay = max(0, round($currentHours - $totalPekerjaan, 2));
                $wo->update(['durasi_hrs' => $currentHours, 'delay' => $currentDelay]);
                $wo->durasi_hrs = $currentHours;
                $wo->delay = $currentDelay;
            }
        }

        $unitOrders = $wo->unit_id
            ? MaintenanceOrder::with(['parts', 'unit:id,code_unit,model'])
                ->where('unit_id', $wo->unit_id)
                ->where(function ($q) {
                    $q->whereNull('wo_type')
                        ->orWhere('wo_type', '!=', 'PCR');
                })
                ->latest('tanggal')
                ->get()
            : collect([]);

        return Inertia::render('WorkOrder/Show', [
            'workOrder' => $wo,
            'unitOrders' => $unitOrders,
        ]);
    }

    public function attachOrderParts(Request $request, $id)
    {
        $wo = WorkOrder::findOrFail($id);

        $request->validate([
            'order_id' => 'nullable',
            'no_order' => 'nullable|string|max:100',
            'parts' => 'required|array|min:1',
            'parts.*.part_number' => 'nullable|string|max:100',
            'parts.*.description' => 'nullable|string|max:255',
            'parts.*.qty_request' => 'nullable|numeric|min:0',
            'parts.*.qty_used' => 'nullable|numeric|min:0',
            'parts.*.status' => 'nullable|string|max:100',
            'parts.*.pr' => 'nullable|string|max:100',
            'parts.*.po' => 'nullable|string|max:100',
            'parts.*.eta_part' => 'nullable|string|max:100',
            'parts.*.maintenance_order_part_id' => 'nullable',
            'update_down_status' => 'nullable|boolean',
        ]);

        $noOrder = $request->input('no_order');
        $orderId = $request->input('order_id');

        DB::transaction(function () use ($wo, $request, $orderId, $noOrder) {
            foreach ($request->input('parts') as $partData) {
                $wo->parts()->create([
                    'maintenance_order_id' => $orderId,
                    'maintenance_order_part_id' => $partData['maintenance_order_part_id'] ?? null,
                    'no_order' => $partData['no_order'] ?? $noOrder,
                    'part_number' => $partData['part_number'] ?? null,
                    'description' => $partData['description'] ?? null,
                    'qty_request' => $partData['qty_request'] ?? 1,
                    'qty_used' => $partData['qty_used'] ?? 0,
                    'status' => $partData['status'] ?? 'ORDERED',
                    'pr' => $partData['pr'] ?? null,
                    'po' => $partData['po'] ?? null,
                    'eta_part' => $partData['eta_part'] ?? null,
                ]);
            }

            if ($request->boolean('update_down_status')) {
                $wo->update([
                    'downtime_code' => 'B1 - WAITING PARTS',
                ]);
            }
        });

        $count = count($request->input('parts'));

        return back()->with('success', "{$count} part dari Monitoring Orderan ({$noOrder}) berhasil ditambahkan ke Work Order.");
    }

    public function storePart(Request $request, $id)
    {
        $wo = WorkOrder::findOrFail($id);

        $request->validate([
            'part_number' => 'nullable|string|max:100',
            'description' => 'required|string|max:255',
            'qty_request' => 'required|numeric|min:0.01',
            'qty_used' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|max:100',
            'no_order' => 'nullable|string|max:100',
            'pr' => 'nullable|string|max:100',
            'po' => 'nullable|string|max:100',
            'eta_part' => 'nullable|string|max:100',
        ]);

        $wo->parts()->create([
            'part_number' => $request->part_number,
            'description' => $request->description,
            'qty_request' => $request->qty_request,
            'qty_used' => $request->qty_used ?? 0,
            'status' => $request->status ?? 'REQUESTED',
            'no_order' => $request->no_order,
            'pr' => $request->pr,
            'po' => $request->po,
            'eta_part' => $request->eta_part,
        ]);

        return back()->with('success', 'Part berhasil ditambahkan.');
    }

    public function updatePart(Request $request, $id, $partId)
    {
        $wo = WorkOrder::findOrFail($id);
        $part = $wo->parts()->findOrFail($partId);

        $request->validate([
            'qty_request' => 'nullable|numeric|min:0',
            'qty_used' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:255',
            'part_number' => 'nullable|string|max:100',
            'pr' => 'nullable|string|max:100',
            'po' => 'nullable|string|max:100',
            'eta_part' => 'nullable|string|max:100',
        ]);

        $part->update($request->only([
            'qty_request',
            'qty_used',
            'status',
            'description',
            'part_number',
            'pr',
            'po',
            'eta_part',
        ]));

        return back()->with('success', 'Part berhasil diperbarui.');
    }

    public function destroyPart(Request $request, $id, $partId)
    {
        $wo = WorkOrder::findOrFail($id);
        $part = $wo->parts()->findOrFail($partId);
        $part->delete();

        return back()->with('success', 'Part berhasil dihapus dari Work Order.');
    }

    public function searchMonitoringOrders(Request $request, $id)
    {
        $q = trim((string) $request->get('q', ''));
        $unitId = $request->get('unit_id');

        $query = MaintenanceOrder::with(['parts', 'unit:id,code_unit,model'])
            ->where(function ($sub) {
                $sub->whereNull('wo_type')
                    ->orWhere('wo_type', '!=', 'PCR');
            });

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('no_order', 'like', "%{$q}%")
                    ->orWhere('component', 'like', "%{$q}%")
                    ->orWhere('component_name', 'like', "%{$q}%")
                    ->orWhere('root_cause', 'like', "%{$q}%")
                    ->orWhereHas('unit', function ($u) use ($q) {
                        $u->where('code_unit', 'like', "%{$q}%");
                    })
                    ->orWhereHas('parts', function ($p) use ($q) {
                        $p->where('part_number', 'like', "%{$q}%")
                            ->orWhere('department', 'like', "%{$q}%")
                            ->orWhere('pr', 'like', "%{$q}%")
                            ->orWhere('po', 'like', "%{$q}%");
                    });
            });
        }

        $orders = $query->latest('tanggal')->limit(30)->get();

        return response()->json($orders);
    }

    public function edit($id)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak.');

        $wo = WorkOrder::with(['unit', 'tasks'])->findOrFail($id);
        $units = Unit::select('id', 'code_unit', 'model', 'type_unit', 'sn_chassis as serial_number', 'engine_model', 'hm as current_hm', 'location as lokasi')->get();
        $manpowers = Manpower::orderBy('nama', 'asc')->get(['id', 'nama', 'bagian', 'departemen', 'nrp']);
        $tools = Tool::where('status', 'AVAILABLE')->get();
        $stockTyres = Tyre::whereNull('unit_id')
            ->where('condition', 'STOCK')
            ->orderBy('serial_number')
            ->get(['id', 'serial_number', 'brand', 'type_size', 'pattern', 'psi', 'otd', 'rtd']);

        return Inertia::render('WorkOrder/Edit', [
            'workOrder' => $wo,
            'units' => $units,
            'manpowers' => $manpowers,
            'tools' => $tools,
            'stockTyres' => $stockTyres,
        ]);
    }

    public function update(Request $request, $id)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak.');

        $wo = WorkOrder::findOrFail($id);

        $request->validate([
            'tipe_wo' => 'required|string|max:100',
            'unit_id' => 'required|exists:units,id',
            'status_wo' => 'required|string|max:100',
            'status_pengerjaan' => 'nullable|string|max:100',
            'downtime_code' => 'nullable|string|max:50',
            'site' => 'nullable|string|max:100',
            'waktu_breakdown' => 'nullable|date',
            'waktu_rfu' => 'nullable|date|after_or_equal:waktu_breakdown',
            'durasi_hrs' => 'nullable|numeric|min:0|max:999999',
            'delay' => 'nullable|numeric|min:0|max:999999',
            'hm_unit' => 'nullable|numeric|min:0',
            'hm_bd' => 'nullable|numeric|min:0',
            'hm_rfu' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string|max:2000',
            'problem' => 'nullable|string|max:2000',
            'root_cause' => 'nullable|string|max:2000',
            'corrective_action' => 'nullable|string|max:2000',
            'component_group' => 'nullable|string|max:255',
            'model_system' => 'nullable|string|max:255',
            'component_sn' => 'nullable|string|max:255',
            'priority' => 'nullable|in:LOW,MEDIUM,HIGH,CRITICAL',
            'request_date' => 'nullable|date',
            'tyre_replacements' => 'nullable|array',
            'tasks' => 'nullable|array|max:100',
            'tasks.*.id' => 'nullable|integer',
            'tasks.*.group_component' => 'nullable|string|max:255',
            'tasks.*.component' => 'nullable|string|max:255',
            'tasks.*.task_description' => 'nullable|string|max:1000',
            'tasks.*.problem' => 'nullable|string|max:2000',
            'tasks.*.activity_progress' => 'nullable|string|max:2000',
            'tasks.*.est_finish' => 'nullable|string',
            'tasks.*.mechanic' => 'nullable|string|max:255',
            'tasks.*.tools' => 'nullable',
            'tasks.*.start_date' => 'nullable|string',
            'tasks.*.end_date' => 'nullable|string',
            'tasks.*.downtime_hrs' => 'nullable|numeric|min:0|max:999999',
            'tasks.*.target_date' => 'nullable|string',
            'tasks.*.status' => 'nullable|string|max:100',
        ]);

        $durasiHrs = $request->durasi_hrs;
        if (($durasiHrs === null || $durasiHrs === '' || (float) $durasiHrs == 0) && $request->waktu_breakdown) {
            $start = Carbon::parse($request->waktu_breakdown);
            $end = $request->waktu_rfu ? Carbon::parse($request->waktu_rfu) : Carbon::now();
            if ($end >= $start) {
                $durasiHrs = round(abs($end->diffInMinutes($start)) / 60, 2);
            }
        }

        $totalPekerjaan = 0;
        if ($request->tasks && is_array($request->tasks)) {
            foreach ($request->tasks as $t) {
                $totalPekerjaan += (float) ($t['downtime_hrs'] ?? 0);
            }
        }
        $delay = max(0, round(((float) $durasiHrs) - $totalPekerjaan, 2));

        $firstTaskGroup = null;
        if ($request->tasks && is_array($request->tasks) && ! empty($request->tasks[0])) {
            $firstTaskGroup = $request->tasks[0]['group_component'] ?? ($request->tasks[0]['component'] ?? null);
        }

        $statusPengerjaan = $request->status_pengerjaan ? strtoupper($request->status_pengerjaan) : ($request->waktu_rfu ? 'COMPLETED - PEKERJAAN SELESAI' : ($wo->status_pengerjaan ?: 'PLANNING - PERENCANAAN PEKERJAAN'));

        $wo->update([
            'tipe_wo' => $request->tipe_wo,
            'unit_id' => $request->unit_id,
            'status_wo' => $request->status_wo,
            'status_pengerjaan' => $statusPengerjaan,
            'downtime_code' => $request->downtime_code ?: ($wo->downtime_code ?: 'Unschedule'),
            'site' => $request->site ?: '-',
            'waktu_breakdown' => $request->waktu_breakdown,
            'waktu_rfu' => $request->waktu_rfu,
            'durasi_hrs' => $durasiHrs,
            'delay' => $delay,
            'hm_unit' => $request->hm_unit ?: ($request->hm_bd ?: ($request->hm_rfu ?: $wo->hm_unit)),
            'hm_bd' => $request->hm_bd,
            'hm_rfu' => $request->hm_rfu,
            'keterangan' => $request->keterangan,
            'problem' => $request->problem ?: (isset($request->tasks[0]['problem']) ? $request->tasks[0]['problem'] : $wo->problem),
            'root_cause' => $request->root_cause,
            'corrective_action' => $request->corrective_action,
            'priority' => $request->priority ?? 'MEDIUM',
            'request_date' => $request->request_date ?? $wo->request_date,
            'component' => $request->component_group ?? ($request->component ?? ($firstTaskGroup ?: $wo->component)),
            'component_model' => $request->model_system ?? $request->component_model,
            'component_sn' => $request->component_sn,
        ]);

        // Sync tasks: delete removed, update existing, create new
        if ($request->has('tasks') && is_array($request->tasks)) {
            $submittedIds = collect($request->tasks)->pluck('id')->filter()->values()->toArray();
            // Delete tasks not in submitted list
            $wo->tasks()->whereNotIn('id', $submittedIds)->delete();

            foreach ($request->tasks as $taskData) {
                $grpComp = $taskData['group_component'] ?? ($taskData['component'] ?? '');
                $comp = $taskData['component'] ?? ($taskData['group_component'] ?? '');
                if (! empty($taskData['id'])) {
                    WorkOrderTask::where('id', $taskData['id'])->where('work_order_id', $wo->id)->update([
                        'group_component' => $grpComp,
                        'component' => $comp,
                        'task_description' => $taskData['task_description'] ?? '',
                        'problem' => $taskData['problem'] ?? null,
                        'activity_progress' => $taskData['activity_progress'] ?? null,
                        'est_finish' => ! empty($taskData['est_finish']) ? Carbon::parse($taskData['est_finish']) : null,
                        'mechanic' => $taskData['mechanic'] ?? '',
                        'tools' => isset($taskData['tools']) ? (is_array($taskData['tools']) ? implode(', ', $taskData['tools']) : $taskData['tools']) : null,
                        'start_date' => ! empty($taskData['start_date']) ? Carbon::parse($taskData['start_date']) : null,
                        'end_date' => ! empty($taskData['end_date']) ? Carbon::parse($taskData['end_date']) : null,
                        'downtime_hrs' => isset($taskData['downtime_hrs']) && $taskData['downtime_hrs'] !== '' ? (float) $taskData['downtime_hrs'] : 0,
                        'target_date' => ! empty($taskData['start_date']) ? Carbon::parse($taskData['start_date']) : (! empty($taskData['target_date']) ? Carbon::parse($taskData['target_date']) : null),
                        'status' => $taskData['status'] ?? 'B0 ( On progress )',
                    ]);
                } else {
                    WorkOrderTask::create([
                        'work_order_id' => $wo->id,
                        'group_component' => $grpComp,
                        'component' => $comp,
                        'task_description' => $taskData['task_description'] ?? '',
                        'problem' => $taskData['problem'] ?? null,
                        'activity_progress' => $taskData['activity_progress'] ?? null,
                        'est_finish' => ! empty($taskData['est_finish']) ? Carbon::parse($taskData['est_finish']) : null,
                        'mechanic' => $taskData['mechanic'] ?? '',
                        'tools' => isset($taskData['tools']) ? (is_array($taskData['tools']) ? implode(', ', $taskData['tools']) : $taskData['tools']) : null,
                        'start_date' => ! empty($taskData['start_date']) ? Carbon::parse($taskData['start_date']) : null,
                        'end_date' => ! empty($taskData['end_date']) ? Carbon::parse($taskData['end_date']) : null,
                        'downtime_hrs' => isset($taskData['downtime_hrs']) && $taskData['downtime_hrs'] !== '' ? (float) $taskData['downtime_hrs'] : 0,
                        'target_date' => ! empty($taskData['start_date']) ? Carbon::parse($taskData['start_date']) : (! empty($taskData['target_date']) ? Carbon::parse($taskData['target_date']) : null),
                        'status' => $taskData['status'] ?? 'B0 ( On progress )',
                    ]);
                }
            }
        }

        // Sync tyre replacements if applicable
        $isTyreWo = str_contains(strtoupper((string) $wo->status_wo), 'TYRE') || str_contains(strtoupper((string) $wo->tipe_wo), 'TYRE');
        if ($isTyreWo || $request->filled('tyre_replacements')) {
            TyreWorkOrderSyncService::syncTyreReplacements($wo, (array) $request->input('tyre_replacements', []));
        }

        if ($wo->tipe_wo === 'SCHEDULE' && ($statusPengerjaan === 'CLOSED' || in_array(strtoupper($wo->status_wo), ['COMPLETED', 'CLOSED']))) {
            self::syncScheduleToServiceLog($wo);
        }

        return redirect()->route('work-orders.show', $wo->id)->with('success', "Work Order {$wo->no_wo} berhasil diupdate.");
    }

    public function destroy($id)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menghapus Work Order.');

        $wo = WorkOrder::findOrFail($id);
        $noWo = $wo->no_wo;

        DB::transaction(function () use ($wo) {
            $wo->tasks()->delete();
            $wo->breakdownDetails()?->delete();
            $wo->parts()->delete();
            $wo->manpowers()->delete();
            $wo->vendors()->delete();
            $wo->warranties()->delete();
            $wo->statusHistories()->delete();
            $wo->delete();
        });

        $referrer = request()->headers->get('referer');
        if ($referrer && (str_contains($referrer, "/work-orders/{$id}") || str_contains($referrer, "/work-orders/{$wo->id}"))) {
            return redirect()->route('work-orders.index')->with('success', "Work Order {$noWo} berhasil dihapus.");
        }

        return back()->with('success', "Work Order {$noWo} berhasil dihapus.");
    }

    public function exportExcel(Request $request)
    {
        $tab = $request->get('tab');

        // If tab is not in query, check referer header
        if (! $tab && $request->headers->get('referer')) {
            $refererQuery = parse_url($request->headers->get('referer'), PHP_URL_QUERY);
            if ($refererQuery) {
                parse_str($refererQuery, $refererParams);
                $tab = $refererParams['tab'] ?? null;
            }
        }

        // Breakdown tab or default (when no tab is specified): export exact PDF breakdown report
        if ($tab === 'breakdown' || empty($tab)) {
            return $this->exportBreakdownExcel();
        }

        return Excel::download(new WorkOrderExport($tab), 'work_orders_'.date('Ymd').'.xlsx');
    }

    public function exportBreakdownExcel(): StreamedResponse
    {
        return (new BreakdownWorkOrderExport)->download();
    }

    public function importExcel(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengimpor Work Order.');

        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv|max:20480',
        ]);

        try {
            $import = new WorkOrderImport;
            Excel::import($import, $request->file('file'));

            return back()->with('success', $import->getSummaryMessage());
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal import: '.$e->getMessage());
        }
    }

    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import WO');

        $headers = [
            'code_unit',
            'tipe_wo',
            'status_wo',
            'down_status',
            'tanggal_request',
            'tanggal_selesai',
            'hm_unit',
            'problem',
            'tindakan_perbaikan',
            'pic',
            'downtime_code',
            'site',
            'no_wo',
        ];
        $sheet->fromArray([$headers], null, 'A1');

        $sampleData = [
            [
                'ME048',
                'PM - PREVENTIVE MAINTENANCE',
                'COMPLETED - PEKERJAAN SELESAI',
                'B0 - ON PROGRESS',
                date('Y-m-d H:i', strtotime('-2 days 08:00')),
                date('Y-m-d H:i', strtotime('-2 days 14:00')),
                '13500',
                'PS 250 H Periodic Service',
                'Ganti oli mesin, ganti filter solar, inspeksi rutin',
                'Yudi Mekanik',
                'Schedule',
                'Harindo Wahana',
                '',
            ],
            [
                'MDT012',
                'CM - CORRECTIVE MAINTENANCE',
                'IN PROGRESS - SEDANG DIKERJAKAN',
                'B1 - WAITING PARTS',
                date('Y-m-d H:i', strtotime('-1 day 09:30')),
                '',
                '14200',
                'Kebocoran selang hydraulic arm',
                'Menunggu part O-Ring dan hose pengganti',
                'Agus Mekanik',
                'Unschedule',
                'Bukit Baiduri Energy',
                '',
            ],
            [
                'DT-101',
                'TYRE - TYRE REPLACEMENT',
                'PLANNING - PERENCANAAN PEKERJAAN',
                'B0 - ON PROGRESS',
                date('Y-m-d H:i'),
                '',
                '8500',
                'Ban posisi Pos 1 (FL) aus / retak tapak',
                'Rencana penggantian ban dari stock gudang',
                'Dedi Tyre',
                'Unschedule',
                'Harindo Wahana',
                '',
            ],
        ];
        $sheet->fromArray($sampleData, null, 'A2');

        // Header style
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0B6E4F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet->getStyle('A1:M1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(28);

        // Auto size columns
        foreach (range('A', 'M') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Attach reference sheet and Excel dropdown validations
        $this->attachReferenceSheetAndDropdowns($spreadsheet, 'Template Import WO', false);

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Template_Import_Work_Order.xlsx');
    }

    public function importExcelBreakdown(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengimpor Work Order.');

        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv|max:20480',
        ]);

        try {
            $import = new BreakdownImport;
            Excel::import($import, $request->file('file'));

            return back()->with('success', $import->getSummaryMessage());
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal import Breakdown: '.$e->getMessage());
        }
    }

    public function downloadTemplateBreakdown(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import Breakdown');

        $headers = [
            'code_unit',
            'tipe_wo',
            'status_wo',
            'down_status',
            'component_group',
            'tanggal',
            'jam_breakdown',
            'date_rfu',
            'jam_ready',
            'hm_unit',
            'problem',
            'corrective_action',
            'downtime_code',
            'site',
            'pic',
            'no_wo',
        ];
        $sheet->fromArray([$headers], null, 'A1');

        $sampleData = [
            [
                'EX-201',
                'CM - CORRECTIVE MAINTENANCE',
                'COMPLETED - PEKERJAAN SELESAI',
                'B0 - ON PROGRESS',
                'ENGINE',
                date('Y-m-d'),
                '08:00',
                date('Y-m-d'),
                '11:30',
                '10500',
                'Engine overheating',
                'Ganti selang radiator & flushing air pendingin',
                'Unschedule',
                'Harindo Wahana',
                'Budi Mekanik',
                '',
            ],
            [
                'DT-101',
                'CM - CORRECTIVE MAINTENANCE',
                'IN PROGRESS - SEDANG DIKERJAKAN',
                'B1 - WAITING PARTS',
                'TRANSMISSION',
                date('Y-m-d'),
                '09:15',
                '',
                '',
                '5000',
                'Transmisi slip gear 3',
                'Pemeriksaan solenoid valve, menunggu sparepart',
                'Unschedule',
                'Bukit Baiduri Energy',
                'Hendra Mekanik',
                '',
            ],
            [
                'ME048',
                'CM - CORRECTIVE MAINTENANCE',
                'PLANNING - PERENCANAAN PEKERJAAN',
                'B3 - WAITING TOOLS',
                'HYDRAULIC SYSTEM',
                date('Y-m-d'),
                '10:00',
                '',
                '',
                '13500',
                'Silinder boom bocor',
                'Persiapan special tools untuk pembongkaran silinder',
                'Unschedule',
                'Harindo Wahana',
                'Joko Mekanik',
                '',
            ],
        ];
        $sheet->fromArray($sampleData, null, 'A2');

        // Header style
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0B6E4F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet->getStyle('A1:P1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(28);

        // Auto size columns
        foreach (range('A', 'P') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Attach reference sheet and Excel dropdown validations
        $this->attachReferenceSheetAndDropdowns($spreadsheet, 'Template Import Breakdown', true);

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Template_Import_Breakdown.xlsx');
    }

    private function attachReferenceSheetAndDropdowns(Spreadsheet $spreadsheet, string $dataSheetTitle, bool $isBreakdown = false): void
    {
        $refSheet = $spreadsheet->createSheet();
        $refSheet->setTitle('Referensi');

        $refSheet->setCellValue('A1', 'Tipe Work Order');
        $refSheet->setCellValue('B1', 'Status WO');
        $refSheet->setCellValue('C1', 'DOWN STATUS');
        $refSheet->setCellValue('D1', 'Downtime Code');
        $refSheet->setCellValue('E1', 'Component Group');

        $refHeaderStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0B6E4F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $refSheet->getStyle('A1:E1')->applyFromArray($refHeaderStyle);
        $refSheet->getRowDimension(1)->setRowHeight(24);

        foreach (WorkOrderService::TIPE_WO_OPTIONS as $i => $opt) {
            $refSheet->setCellValue('A'.($i + 2), $opt);
        }

        foreach (WorkOrderService::STATUS_WO_OPTIONS as $i => $opt) {
            $refSheet->setCellValue('B'.($i + 2), $opt);
        }

        foreach (WorkOrderService::DOWN_STATUS_OPTIONS as $i => $opt) {
            $refSheet->setCellValue('C'.($i + 2), $opt);
        }

        $downtimeCodes = ['Schedule', 'Unschedule', 'Accident', 'Opportunity'];
        foreach ($downtimeCodes as $i => $opt) {
            $refSheet->setCellValue('D'.($i + 2), $opt);
        }

        $componentGroups = WorkOrderService::COMPONENT_GROUPS;
        foreach ($componentGroups as $i => $opt) {
            $refSheet->setCellValue('E'.($i + 2), $opt);
        }

        foreach (range('A', 'E') as $col) {
            $refSheet->getColumnDimension($col)->setAutoSize(true);
        }

        $dataSheet = $spreadsheet->getSheetByName($dataSheetTitle);
        if (! $dataSheet) {
            return;
        }

        $tipeValidation = new DataValidation;
        $tipeValidation->setType(DataValidation::TYPE_LIST);
        $tipeValidation->setErrorStyle(DataValidation::STYLE_INFORMATION);
        $tipeValidation->setAllowBlank(true);
        $tipeValidation->setShowDropDown(true);
        $tipeValidation->setPromptTitle('Pilih Tipe Work Order');
        $tipeValidation->setFormula1("'Referensi'!\$A\$2:\$A\$8");

        $statusValidation = new DataValidation;
        $statusValidation->setType(DataValidation::TYPE_LIST);
        $statusValidation->setErrorStyle(DataValidation::STYLE_INFORMATION);
        $statusValidation->setAllowBlank(true);
        $statusValidation->setShowDropDown(true);
        $statusValidation->setPromptTitle('Pilih Status WO');
        $statusValidation->setFormula1("'Referensi'!\$B\$2:\$B\$4");

        $downValidation = new DataValidation;
        $downValidation->setType(DataValidation::TYPE_LIST);
        $downValidation->setErrorStyle(DataValidation::STYLE_INFORMATION);
        $downValidation->setAllowBlank(true);
        $downValidation->setShowDropDown(true);
        $downValidation->setPromptTitle('Pilih DOWN STATUS');
        $downValidation->setFormula1("'Referensi'!\$C\$2:\$C\$12");

        $downtimeValidation = new DataValidation;
        $downtimeValidation->setType(DataValidation::TYPE_LIST);
        $downtimeValidation->setErrorStyle(DataValidation::STYLE_INFORMATION);
        $downtimeValidation->setAllowBlank(true);
        $downtimeValidation->setShowDropDown(true);
        $downtimeValidation->setPromptTitle('Pilih Downtime Code');
        $downtimeValidation->setFormula1("'Referensi'!\$D\$2:\$D\$5");

        $compGroupCount = count($componentGroups) + 1;
        $compGroupValidation = new DataValidation;
        $compGroupValidation->setType(DataValidation::TYPE_LIST);
        $compGroupValidation->setErrorStyle(DataValidation::STYLE_INFORMATION);
        $compGroupValidation->setAllowBlank(true);
        $compGroupValidation->setShowDropDown(true);
        $compGroupValidation->setPromptTitle('Pilih Component Group');
        $compGroupValidation->setFormula1("'Referensi'!\$E\$2:\$E\${$compGroupCount}");

        for ($r = 2; $r <= 200; $r++) {
            $dataSheet->getCell("B{$r}")->setDataValidation(clone $tipeValidation);
            $dataSheet->getCell("C{$r}")->setDataValidation(clone $statusValidation);
            $dataSheet->getCell("D{$r}")->setDataValidation(clone $downValidation);

            if ($isBreakdown) {
                $dataSheet->getCell("E{$r}")->setDataValidation(clone $compGroupValidation);
                $dataSheet->getCell("M{$r}")->setDataValidation(clone $downtimeValidation);
            } else {
                $dataSheet->getCell("K{$r}")->setDataValidation(clone $downtimeValidation);
            }
        }

        $spreadsheet->setActiveSheetIndex(0);
    }

    public function downloadTemplateLastService(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Last Service HM');

        $headers = ['code_unit', 'tanggal_service', 'hm_service', 'tipe_service'];
        $sheet->fromArray([$headers], null, 'A1');

        $sheet->fromArray([
            ['EX-201', date('Y-m-d', strtotime('-1 week')), '10500', 'PS 250 H'],
            ['DT-101', date('Y-m-d', strtotime('-3 days')), '5000', 'PS 500 H'],
        ], null, 'A2');

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Template_Last_Service_HM.xlsx');
    }

    public function importLastService(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak.');

        $request->validate([
            'file' => 'required|file|max:51200',
        ]);

        try {
            ini_set('max_execution_time', '300');
            ini_set('memory_limit', '512M');

            $import = new LastServiceImport;
            Excel::import($import, $request->file('file'));

            return back()->with('success', $import->getSummaryMessage());
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal import Last Service: '.$e->getMessage());
        }
    }
}
