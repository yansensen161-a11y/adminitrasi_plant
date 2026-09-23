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
