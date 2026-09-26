<?php

namespace App\Http\Controllers;

use App\Models\PlantForm;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormJsaController extends Controller
{
    public const TASK_TYPES = [
        'overhaul-starting-motor' => [
            'slug' => 'overhaul-starting-motor',
            'title' => 'Overhaul Starting Motor',
            'code' => 'JSA-STARTING-MOTOR',
            'badge' => '⚡ Electrical & Starting',
        ],
        'maintenance-ac-dump-truck' => [
            'slug' => 'maintenance-ac-dump-truck',
            'title' => 'Maintenance AC System Dump Truck',
            'code' => 'JSA-AC-DUMP-TRUCK',
            'badge' => '❄️ AC System',
        ],
        'radiator-medium-truck' => [
            'slug' => 'radiator-medium-truck',
            'title' => 'Melepas & Memasang Radiator Medium Truck',
            'code' => 'JSA-RADIATOR-MEDIUM-TRUCK',
            'badge' => '🚛 Radiator & Cooling',
        ],
        'welding-chasis-medium-truck' => [
            'slug' => 'welding-chasis-medium-truck',
            'title' => 'Welding Chasis Medium Truck',
            'code' => 'JSA-WELDING-CHASIS-MT',
            'badge' => '🔥 Fabrication & Welding',
        ],
    ];

    /**
     * Display the JSA portal hub featuring cards for all predefined task types.
     */
    public function portal(Request $request)
    {
        $totalForms = PlantForm::where('form_type', 'FORM-JSA')->count();
        $thisMonthForms = PlantForm::where('form_type', 'FORM-JSA')
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->count();
        $completedForms = PlantForm::where('form_type', 'FORM-JSA')
            ->whereIn('status', ['COMPLETED', 'APPROVED'])
            ->count();

        $countsBySlug = [];
        foreach (array_keys(self::TASK_TYPES) as $slug) {
            $countsBySlug[$slug] = PlantForm::where('form_type', 'FORM-JSA')
                ->where(function ($q) use ($slug) {
                    $q->where('results_data->task_slug', $slug)
                        ->orWhere('service_type', $slug);
                })
                ->count();
        }

        $colorPalettes = [
            'overhaul-starting-motor' => [
                'color' => 'amber',
                'accent' => 'from-amber-500/20 via-amber-500/5 to-transparent',
                'border' => 'border-amber-500/30 hover:border-amber-500',
                'badgeBg' => 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                'iconColor' => 'text-amber-600 dark:text-amber-400',
                'systemCategory' => 'Electrical & Starting System',
                'shortDesc' => 'Standar Keselamatan Kerja overhaul, inspeksi armature, brush, relay, dan magnetic switch.',
            ],
            'maintenance-ac-dump-truck' => [
                'color' => 'cyan',
                'accent' => 'from-cyan-500/20 via-cyan-500/5 to-transparent',
                'border' => 'border-cyan-500/30 hover:border-cyan-500',
                'badgeBg' => 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300',
                'iconColor' => 'text-cyan-600 dark:text-cyan-400',
                'systemCategory' => 'HVAC & Cabin Climate Control',
                'shortDesc' => 'Pemeriksaan kebocoran refrigeran R134a, manifold gauge, clutch kompresor, LOTTO & wheel chock.',
            ],
            'radiator-medium-truck' => [
                'color' => 'blue',
                'accent' => 'from-blue-500/20 via-blue-500/5 to-transparent',
                'border' => 'border-blue-500/30 hover:border-blue-500',
                'badgeBg' => 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                'iconColor' => 'text-blue-600 dark:text-blue-400',
                'systemCategory' => 'Cooling System & Radiator',
                'shortDesc' => 'Prosedur melepas dan memasang radiator, draining coolant/oli, rigging chain block, dan tes kebocoran.',
            ],
            'welding-chasis-medium-truck' => [
                'color' => 'rose',
                'accent' => 'from-rose-500/20 via-rose-500/5 to-transparent',
                'border' => 'border-rose-500/30 hover:border-rose-500',
                'badgeBg' => 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
                'iconColor' => 'text-rose-600 dark:text-rose-400',
                'systemCategory' => 'Fabrication & Structural Welding',
                'shortDesc' => 'Keselamatan pemotongan OAW, gerinda chasis, APD apron/kedok las, dan pengelasan bracket vessel.',
            ],
        ];

        $cards = [];
        $allPresets = [];
        foreach (self::TASK_TYPES as $slug => $meta) {
            $preset = PlantForm::getJsaPresetData($slug);
            $allPresets[$slug] = $preset;
            $theme = $colorPalettes[$slug] ?? [
                'color' => 'emerald',
                'accent' => 'from-emerald-500/20 via-emerald-500/5 to-transparent',
                'border' => 'border-emerald-500/30 hover:border-emerald-500',
                'badgeBg' => 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                'iconColor' => 'text-emerald-600 dark:text-emerald-400',
                'systemCategory' => 'General HSE Analysis',
                'shortDesc' => 'Job Safety Analysis form standar PT Mitra Abadi Mahakam.',
            ];

            $hazardHighlights = [];
            if (! empty($preset['steps'])) {
                foreach (array_slice($preset['steps'], 0, 2) as $step) {
                    $firstHazard = explode("\n", $step['hazards'] ?? '')[0] ?? '';
                    if ($firstHazard) {
                        $hazardHighlights[] = trim(preg_replace('/^[0-9.]+\s*/', '', $firstHazard));
                    }
                }
            }

            $cards[] = [
                'slug' => $slug,
                'title' => $meta['title'],
                'code' => $meta['code'],
                'badge' => $meta['badge'],
                'form_code' => $preset['form_code'] ?? 'MAM-HSE-FORM-028',
                'standard_form' => $preset['standard_form'] ?? 'PT MITRA ABADI MAHAKAM',
                'department' => $preset['department'] ?? 'PLANT',
                'total_steps' => count($preset['steps'] ?? []),
                'tools_needed' => $preset['tools_needed'] ?? '',
                'apd_needed' => $preset['apd_needed'] ?? '',
                'hazard_highlights' => $hazardHighlights,
                'form_count' => $countsBySlug[$slug] ?? 0,
                'theme' => $theme,
                'view_url' => route('form-jsa.by-task', ['taskType' => $slug]),
                'create_url' => route('form-jsa.by-task', ['taskType' => $slug]),
                'blank_print_url' => route('form-jsa.blank-print', ['taskType' => $slug]),
                'download_pdf_url' => route('form-jsa.download-pdf', ['task_slug' => $slug]),
            ];
        }

        $recentForms = PlantForm::with(['unit', 'creator'])
            ->where('form_type', 'FORM-JSA')
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->limit(6)
            ->get();

        $units = Unit::select('id', 'code_unit', 'model', 'type_unit', 'hm')
            ->orderBy('code_unit')
            ->get();

        return Inertia::render('FormJsa/Portal', [
            'stats' => [
                'total_forms' => $totalForms,
                'this_month' => $thisMonthForms,
                'completed_forms' => $completedForms,
                'task_types_count' => count(self::TASK_TYPES),
            ],
            'cards' => $cards,
            'recentForms' => $recentForms,
            'allPresets' => $allPresets,
            'units' => $units,
            'taskTypes' => self::TASK_TYPES,
        ]);
    }

    /**
     * Display a listing of JSA forms, optionally scoped by task type.
     */
    public function index(Request $request, ?string $taskType = null)
    {
        $activeTaskType = null;
        if ($taskType && isset(self::TASK_TYPES[$taskType])) {
            $activeTaskType = $taskType;
        }

        $query = PlantForm::with(['unit', 'creator'])
            ->where('form_type', 'FORM-JSA')
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc');

        if ($activeTaskType) {
            $query->where(function ($q) use ($activeTaskType) {
                $q->where('results_data->task_slug', $activeTaskType)
                    ->orWhere('service_type', $activeTaskType);
            });
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('form_number', 'like', "%{$search}%")
                    ->orWhere('results_data->task_name', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('unit', function ($uq) use ($search) {
                        $uq->where('code_unit', 'like', "%{$search}%")
                            ->orWhere('model', 'like', "%{$search}%");
                    });
            });
        }

        $forms = $query->paginate(15)->withQueryString();

        $units = Unit::select('id', 'code_unit', 'model', 'type_unit', 'hm')
            ->orderBy('code_unit')
            ->get();

        // Get preset templates for all 4 task types to provide instant frontend switcher
        $allPresets = [];
        foreach (array_keys(self::TASK_TYPES) as $slug) {
            $allPresets[$slug] = PlantForm::getJsaPresetData($slug);
        }

        $selectedSlug = $activeTaskType ?? 'overhaul-starting-motor';
        $activePreset = $allPresets[$selectedSlug];

        return Inertia::render('FormJsa/Index', [
            'forms' => $forms,
            'filters' => [
                'taskType' => $activeTaskType,
                'search' => $request->search ?? '',
            ],
            'taskTypes' => self::TASK_TYPES,
            'activeTaskType' => $activeTaskType,
            'activePreset' => $activePreset,
            'allPresets' => $allPresets,
            'units' => $units,
        ]);
    }

    /**
     * Store a newly created JSA form.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'task_slug' => 'required|string',
            'task_name' => 'required|string|max:255',
            'date' => 'required|date',
            'unit_id' => 'nullable|exists:units,id',
            'smu' => 'nullable|numeric|min:0',
            'shift' => 'nullable|string|max:10',
            'department' => 'nullable|string|max:100',
            'tools_needed' => 'nullable|string',
            'apd_needed' => 'nullable|string',
            'workers' => 'nullable|array',
            'steps' => 'required|array|min:1',
            'attendees' => 'nullable|array',
            'known_by_mam' => 'nullable|string|max:255',
            'approved_by_bbe' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
            'status' => 'nullable|in:DRAFT,COMPLETED,APPROVED',
        ]);

        $taskSlug = $validated['task_slug'];
        $formNumber = PlantForm::generateJsaNumber();

        $resultsData = [
            'task_slug' => $taskSlug,
            'task_name' => $validated['task_name'],
            'form_code' => 'MAM-HSE-FORM-028',
            'standard_form' => 'PT MITRA ABADI MAHAKAM',
            'department' => $validated['department'] ?? 'PLANT',
            'tools_needed' => $validated['tools_needed'] ?? '',
            'apd_needed' => $validated['apd_needed'] ?? '',
            'workers' => $validated['workers'] ?? [],
            'attendees' => $validated['attendees'] ?? [],
            'known_by_mam' => $validated['known_by_mam'] ?? 'Ambo Mai (Superintendent Plant)',
            'approved_by_bbe' => $validated['approved_by_bbe'] ?? 'Subani (PJO)',
        ];

        $plantForm = PlantForm::create([
            'form_type' => 'FORM-JSA',
            'form_number' => $formNumber,
            'service_type' => $taskSlug,
            'unit_id' => $validated['unit_id'] ?? null,
            'date' => $validated['date'],
            'smu' => $validated['smu'] ?? 0,
            'shift' => $validated['shift'] ?? '1',
            'items' => $validated['steps'],
            'results_data' => $resultsData,
            'notes' => $validated['notes'] ?? null,
            'status' => $validated['status'] ?? 'COMPLETED',
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('form-jsa.by-task', ['taskType' => $taskSlug])
            ->with('success', "Form JSA {$plantForm->form_number} ({$validated['task_name']}) berhasil disimpan.");
    }

    /**
     * Update an existing JSA form.
     */
    public function update(Request $request, $id)
    {
        $plantForm = PlantForm::findOrFail($id);

        $validated = $request->validate([
            'task_slug' => 'required|string',
            'task_name' => 'required|string|max:255',
            'date' => 'required|date',
            'unit_id' => 'nullable|exists:units,id',
            'smu' => 'nullable|numeric|min:0',
            'shift' => 'nullable|string|max:10',
            'department' => 'nullable|string|max:100',
            'tools_needed' => 'nullable|string',
            'apd_needed' => 'nullable|string',
            'workers' => 'nullable|array',
            'steps' => 'required|array|min:1',
            'attendees' => 'nullable|array',
            'known_by_mam' => 'nullable|string|max:255',
            'approved_by_bbe' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
            'status' => 'nullable|in:DRAFT,COMPLETED,APPROVED',
        ]);

        $taskSlug = $validated['task_slug'];

        $resultsData = array_merge($plantForm->results_data ?? [], [
            'task_slug' => $taskSlug,
            'task_name' => $validated['task_name'],
            'form_code' => 'MAM-HSE-FORM-028',
            'standard_form' => 'PT MITRA ABADI MAHAKAM',
            'department' => $validated['department'] ?? 'PLANT',
            'tools_needed' => $validated['tools_needed'] ?? '',
            'apd_needed' => $validated['apd_needed'] ?? '',
            'workers' => $validated['workers'] ?? [],
            'attendees' => $validated['attendees'] ?? [],
            'known_by_mam' => $validated['known_by_mam'] ?? 'Ambo Mai (Superintendent Plant)',
            'approved_by_bbe' => $validated['approved_by_bbe'] ?? 'Subani (PJO)',
        ]);

        $plantForm->update([
            'service_type' => $taskSlug,
            'unit_id' => $validated['unit_id'] ?? null,
            'date' => $validated['date'],
            'smu' => $validated['smu'] ?? 0,
            'shift' => $validated['shift'] ?? '1',
            'items' => $validated['steps'],
            'results_data' => $resultsData,
            'notes' => $validated['notes'] ?? null,
            'status' => $validated['status'] ?? $plantForm->status,
        ]);

        return redirect()->route('form-jsa.by-task', ['taskType' => $taskSlug])
            ->with('success', "Form JSA {$plantForm->form_number} berhasil diperbarui.");
    }

    /**
     * Remove the specified JSA form.
     */
    public function destroy($id)
    {
        $plantForm = PlantForm::findOrFail($id);
        $taskSlug = $plantForm->results_data['task_slug'] ?? 'overhaul-starting-motor';
        $no = $plantForm->form_number;
        $plantForm->delete();

        return redirect()->route('form-jsa.by-task', ['taskType' => $taskSlug])
            ->with('success', "Form JSA {$no} berhasil dihapus.");
    }

    /**
     * Render the print view for a specific JSA document.
     */
    public function print($id)
    {
        $plantForm = PlantForm::with(['unit', 'creator'])->findOrFail($id);
        $taskSlug = $plantForm->results_data['task_slug'] ?? 'overhaul-starting-motor';
        $preset = PlantForm::getJsaPresetData($taskSlug);

        return Inertia::render('FormJsa/Print', [
            'form' => $plantForm,
            'preset' => $preset,
            'isBlank' => false,
        ]);
    }

    /**
     * Render a blank print form for physical filing or offline job analysis.
     */
    public function blankPrint(Request $request, ?string $taskType = 'overhaul-starting-motor')
    {
        $validSlug = isset(self::TASK_TYPES[$taskType]) ? $taskType : 'overhaul-starting-motor';
        $preset = PlantForm::getJsaPresetData($validSlug);

        $unitId = $request->query('unit_id');
        $unit = $unitId ? Unit::find($unitId) : null;

        return Inertia::render('FormJsa/Print', [
            'form' => null,
            'preset' => $preset,
            'isBlank' => true,
            'preselectedUnit' => $unit,
        ]);
    }

    /**
     * Export the JSA form directly as PDF (A4 Landscape).
     */
    public function downloadPdf(Request $request)
    {
        $selectedForm = null;
        if ($request->filled('id')) {
            $selectedForm = PlantForm::with(['unit', 'creator'])->find($request->id);
        }

        $taskSlug = $selectedForm?->results_data['task_slug'] ?? ($request->task_slug ?? 'overhaul-starting-motor');
        if (! isset(self::TASK_TYPES[$taskSlug])) {
            $taskSlug = 'overhaul-starting-motor';
        }

        $preset = PlantForm::getJsaPresetData($taskSlug);
        $unit = $selectedForm?->unit ?? ($request->filled('unit_id') ? Unit::find($request->unit_id) : null);

        $steps = $selectedForm?->items ?? $preset['steps'];
        $results = $selectedForm?->results_data ?? $preset;

        $pdf = Pdf::loadView('pdf.form-jsa', [
            'form' => $selectedForm,
            'unit' => $unit,
            'preset' => $preset,
            'steps' => $steps,
            'results' => $results,
            'formNumber' => $selectedForm?->form_number ?? ($request->form_number ?? 'JSA/MAM-HSE/'.date('Y').'/001'),
            'date' => $selectedForm?->date ?? ($request->date ?? date('Y-m-d')),
            'taskName' => $results['task_name'] ?? $preset['task_name'],
            'department' => $results['department'] ?? $preset['department'],
            'toolsNeeded' => $results['tools_needed'] ?? $preset['tools_needed'],
            'apdNeeded' => $results['apd_needed'] ?? $preset['apd_needed'],
            'workers' => $results['workers'] ?? $preset['workers'],
            'attendees' => $results['attendees'] ?? $preset['attendees'],
            'knownByMam' => $results['known_by_mam'] ?? $preset['known_by_mam'],
            'approvedByBbe' => $results['approved_by_bbe'] ?? $preset['approved_by_bbe'],
        ])->setPaper('a4', 'landscape');

        $slugTitle = str_replace(' ', '_', $results['task_name'] ?? $preset['task_name']);
        $filename = 'JSA_'.$slugTitle.'_'.date('Ymd_His').'.pdf';

        return $pdf->download($filename);
    }
}
