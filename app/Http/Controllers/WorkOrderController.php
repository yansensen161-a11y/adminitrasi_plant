<?php

namespace App\Http\Controllers;

use App\Exports\BreakdownWorkOrderExport;
use App\Exports\WorkOrderExport;
use App\Imports\BreakdownImport;
use App\Imports\LastServiceImport;
use App\Models\MaintenanceOrder;
use App\Models\Manpower;
use App\Models\PlanInspection;
use App\Models\PlantForm;
use App\Models\ServiceLog;
use App\Models\Tool;
use App\Models\Unit;
use App\Models\UnitApl;
use App\Models\WorkOrder;
use App\Models\WorkOrderTask;
use App\Services\WorkOrderService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WorkOrderController extends Controller
{
    public function index(Request $request)
    {
        $breakdownQuery = WorkOrder::with('unit')->where('tipe_wo', 'BREAKDOWN');

        if ($request->filled('status') && $request->status !== 'Semua') {
            $statusReq = $request->status;
            $breakdownQuery->where(function ($query) use ($statusReq) {
                $query->where('status_wo', $statusReq)
                    ->orWhere('status_pengerjaan', $statusReq);
            });
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

        $breakdownParams = array_merge(['tab' => 'breakdown'], $request->except('page'));
        $orderDir = strtolower($request->get('order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $historicalParams = array_merge(['tab' => 'historical', 'order' => $orderDir], $request->except('page'));

        $breakdowns = $breakdownQuery
            ->orderByDesc('id')
            ->paginate(10)
            ->appends($breakdownParams);

        $scheduleQuery = WorkOrder::with('unit')->where('tipe_wo', 'SCHEDULE');

        if ($request->filled('status') && $request->status !== 'Semua') {
            $statusReq = $request->status;
            $scheduleQuery->where(function ($query) use ($statusReq) {
                $query->where('status_wo', $statusReq)
                    ->orWhere('status_pengerjaan', $statusReq);
            });
        }

        if ($request->filled('unit')) {
            $unitSearch = trim($request->unit);
            $scheduleQuery->where(function ($query) use ($unitSearch) {
                $query->where('no_wo', 'like', "%{$unitSearch}%")
                    ->orWhereHas('unit', function ($q) use ($unitSearch) {
                        $q->where('code_unit', 'like', "%{$unitSearch}%")
                            ->orWhere('model', 'like', "%{$unitSearch}%");
                    });
            });
        }

        $scheduleParams = array_merge(['tab' => 'schedule'], $request->except('page'));
        $schedules = $scheduleQuery
            ->orderByDesc('id')
            ->paginate(10)
            ->appends($scheduleParams);

        $historicalQuery = WorkOrder::with('unit')->where(function ($q) {
            $q->where('status_pengerjaan', 'CLOSED')
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
            ->paginate(10)
            ->appends($historicalParams);

        $historicalKpi = [
            'total_closed' => WorkOrder::where(function ($q) {
                $q->where('status_pengerjaan', 'CLOSED')->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->count(),
            'schedule_closed' => WorkOrder::where(function ($q) {
                $q->where('status_pengerjaan', 'CLOSED')->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->where('tipe_wo', 'SCHEDULE')->count(),
            'breakdown_closed' => WorkOrder::where(function ($q) {
                $q->where('status_pengerjaan', 'CLOSED')->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->where('tipe_wo', 'BREAKDOWN')->count(),
            'total_hours' => round((float) WorkOrder::where(function ($q) {
                $q->where('status_pengerjaan', 'CLOSED')->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->sum('durasi_hrs'), 1),
        ];

        $breakdownKpi = [
            'total_wo' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->count(),
            'open' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where(function ($q) {
                $q->where('status_pengerjaan', 'OPEN')->orWhere('status_wo', 'OPEN');
            })->count(),
            'process' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where('status_wo', 'PROCESS')->count(),
            'waiting_part' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where('status_wo', 'WAITING PART')->count(),
            'completed' => WorkOrder::where('tipe_wo', 'BREAKDOWN')->where(function ($q) {
                $q->where('status_pengerjaan', 'CLOSED')->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->count(),
        ];

        $scheduleKpi = [
            'total_wo' => WorkOrder::where('tipe_wo', 'SCHEDULE')->count(),
            'open' => WorkOrder::where('tipe_wo', 'SCHEDULE')->where(function ($q) {
                $q->where('status_pengerjaan', 'OPEN')->orWhere('status_wo', 'OPEN');
            })->count(),
            'process' => WorkOrder::where('tipe_wo', 'SCHEDULE')->where('status_wo', 'PROCESS')->count(),
            'waiting_part' => WorkOrder::where('tipe_wo', 'SCHEDULE')->where('status_wo', 'WAITING PART')->count(),
            'completed' => WorkOrder::where('tipe_wo', 'SCHEDULE')->where(function ($q) {
                $q->where('status_pengerjaan', 'CLOSED')->orWhereIn('status_wo', ['COMPLETED', 'CLOSED']);
            })->count(),
        ];

        return Inertia::render('WorkOrder/Index', [
            'breakdown' => [
                'kpi' => $breakdownKpi,
                'data' => $breakdowns,
            ],
            'schedule' => [
                'kpi' => $scheduleKpi,
                'data' => $schedules,
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
            'status_pengerjaan' => 'nullable|string|max:20',
            'downtime_code' => 'nullable|string|max:50',
            'site' => 'nullable|string|max:100',
            'waktu_breakdown' => 'nullable|date',
            'waktu_rfu' => 'nullable|date|after_or_equal:waktu_breakdown',
            'durasi_hrs' => 'nullable|numeric|min:0|max:999999',
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

            $wo = WorkOrderService::createWorkOrder([
                'no_wo' => $request->no_wo,
                'tipe_wo' => $request->tipe_wo,
                'downtime_code' => $request->downtime_code,
                'site' => $request->site ?: '-',
                'unit_id' => $request->unit_id,
                'waktu_breakdown' => $request->waktu_breakdown,
                'waktu_rfu' => $request->waktu_rfu,
                'durasi_hrs' => $durasiHrs,
                'hm_unit' => $request->hm_unit ?: ($request->hm_bd ?: ($request->hm_rfu ?: 0)),
                'hm_bd' => $request->hm_bd,
                'hm_rfu' => $request->hm_rfu,
                'status_wo' => $request->status_wo,
                'status_pengerjaan' => strtoupper($request->status_pengerjaan ?? ($request->waktu_rfu ? 'CLOSED' : 'OPEN')),
                'keterangan' => $request->keterangan,
                'priority' => $request->priority ?? 'MEDIUM',
                'request_date' => $request->request_date ?? now(),
                'request_by' => auth()->user()->name ?? 'System',
                'problem' => $request->problem ?: (isset($request->tasks[0]['problem']) ? $request->tasks[0]['problem'] : null),
                'component' => $request->component_group ?? $request->component,
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
            'status_wo' => 'nullable|string|max:50',
            'status_pengerjaan' => 'nullable|string|max:20',
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

        $isClosing = (isset($updateData['status_pengerjaan']) && $updateData['status_pengerjaan'] === 'CLOSED')
            || (isset($updateData['status_wo']) && in_array(strtoupper($updateData['status_wo']), ['COMPLETED', 'CLOSED']));

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

        $wo->update($updateData);

        if ($wo->tipe_wo === 'SCHEDULE' && ($isClosing || $wo->status_pengerjaan === 'CLOSED' || in_array(strtoupper($wo->status_wo), ['COMPLETED', 'CLOSED']))) {
            self::syncScheduleToServiceLog($wo);
        }

        return back()->with('success', "Status Work Order {$wo->no_wo} berhasil diubah.");
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
                $wo->update(['durasi_hrs' => $currentHours]);
                $wo->durasi_hrs = $currentHours;
            }
        }

        return Inertia::render('WorkOrder/Show', [
            'workOrder' => $wo,
        ]);
    }

    public function edit($id)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak.');

        $wo = WorkOrder::with(['unit', 'tasks'])->findOrFail($id);
        $units = Unit::select('id', 'code_unit', 'model', 'sn_chassis as serial_number', 'engine_model', 'hm as current_hm', 'location as lokasi')->get();
        $manpowers = Manpower::orderBy('nama', 'asc')->get(['id', 'nama', 'bagian', 'departemen', 'nrp']);
        $tools = Tool::where('status', 'AVAILABLE')->get();

        return Inertia::render('WorkOrder/Edit', [
            'workOrder' => $wo,
            'units' => $units,
            'manpowers' => $manpowers,
            'tools' => $tools,
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
            'status_pengerjaan' => 'nullable|string|max:20',
            'downtime_code' => 'nullable|string|max:50',
            'site' => 'nullable|string|max:100',
            'waktu_breakdown' => 'nullable|date',
            'waktu_rfu' => 'nullable|date|after_or_equal:waktu_breakdown',
            'durasi_hrs' => 'nullable|numeric|min:0|max:999999',
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

        $statusPengerjaan = strtoupper($request->status_pengerjaan ?? ($request->waktu_rfu ? 'CLOSED' : ($wo->status_pengerjaan ?: 'OPEN')));

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
            'hm_unit' => $request->hm_unit ?: ($request->hm_bd ?: ($request->hm_rfu ?: $wo->hm_unit)),
            'hm_bd' => $request->hm_bd,
            'hm_rfu' => $request->hm_rfu,
            'keterangan' => $request->keterangan,
            'problem' => $request->problem ?: (isset($request->tasks[0]['problem']) ? $request->tasks[0]['problem'] : $wo->problem),
            'root_cause' => $request->root_cause,
            'corrective_action' => $request->corrective_action,
            'priority' => $request->priority ?? 'MEDIUM',
            'request_date' => $request->request_date ?? $wo->request_date,
            'component' => $request->component_group ?? $request->component,
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
            Excel::import(new WorkOrderImport, $request->file('file'));

            return back()->with('success', 'Data berhasil diimport.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal import: '.$e->getMessage());
        }
    }

    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import WO Schedule');

        $headers = ['code_unit', 'tanggal_request', 'hm_unit', 'problem'];
        $sheet->fromArray([$headers], null, 'A1');

        $sheet->fromArray([
            ['EX-201', date('Y-m-d'), '10500', 'Service 250H'],
            ['DT-101', date('Y-m-d'), '5000', 'Service 500H'],
        ], null, 'A2');

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Template_Import_WO_Schedule.xlsx');
    }

    public function importExcelBreakdown(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk mengimpor Work Order.');

        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv|max:20480',
        ]);

        try {
            Excel::import(new BreakdownImport, $request->file('file'));

            return back()->with('success', 'Data Breakdown berhasil diimport.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal import Breakdown: '.$e->getMessage());
        }
    }

    public function downloadTemplateBreakdown(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import Breakdown');

        $headers = ['code_unit', 'tanggal', 'jam_breakdown', 'jam_ready', 'hm_unit', 'problem', 'downtime_code', 'site', 'status_wo', 'corrective_action'];
        $sheet->fromArray([$headers], null, 'A1');

        $sheet->fromArray([
            ['EX-201', date('Y-m-d'), date('H:i'), date('H:i', strtotime('+2 hours')), '10500', 'Engine over heat', 'UNP', 'Lokal', 'COMPLETED', 'Ganti selang radiator'],
            ['DT-101', date('Y-m-d'), date('H:i'), '', '5000', 'Ban Bocor', 'UNP', 'Lokal', 'OPEN', ''],
        ], null, 'A2');

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Template_Import_Breakdown.xlsx');
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
