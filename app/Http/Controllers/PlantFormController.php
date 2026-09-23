<?php

namespace App\Http\Controllers;

use App\Models\PlantForm;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlantFormController extends Controller
{
    public function index(Request $request)
    {
        $units = Unit::select('id', 'code_unit', 'model', 'sn_chassis as serial_number', 'engine_model', 'hm as current_hm', 'location as lokasi')
            ->orderBy('code_unit')
            ->get();

        $defaultItems = PlantForm::getDefaultChecklistItems();
        $suggestedFormNumber = PlantForm::generateFormNumber('PM-773E');

        $selectedForm = null;
        if ($request->filled('id')) {
            $selectedForm = PlantForm::with(['unit', 'creator'])->find($request->id);
        }

        $recentForms = PlantForm::with(['unit', 'creator'])
            ->latest('date')
            ->latest('id')
            ->take(15)
            ->get();

        return Inertia::render('PlantForm/Index', [
            'units' => $units,
            'defaultItems' => $defaultItems,
            'suggestedFormNumber' => $suggestedFormNumber,
            'selectedForm' => $selectedForm,
            'recentForms' => $recentForms,
        ]);
    }

    public function create(Request $request)
    {
        $units = Unit::select('id', 'code_unit', 'model', 'sn_chassis as serial_number', 'engine_model', 'hm as current_hm', 'location as lokasi')
            ->orderBy('code_unit')
            ->get();

        $preUnitId = $request->query('unit_id');
        $preUnit = $preUnitId ? $units->firstWhere('id', $preUnitId) : null;

        $suggestedFormNumber = PlantForm::generateFormNumber('PM-773E');
        $defaultItems = PlantForm::getDefaultChecklistItems();

        return Inertia::render('PlantForm/Create', [
            'units' => $units,
            'preselectedUnit' => $preUnit,
            'suggestedFormNumber' => $suggestedFormNumber,
            'defaultItems' => $defaultItems,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'form_type' => 'nullable|string|max:50',
            'form_number' => 'nullable|string|max:100',
            'project_id' => 'nullable|string|max:255',
            'unit_id' => 'required|exists:units,id',
            'date' => 'required|date',
            'shift' => 'required|in:DS,NS',
            'smu' => 'nullable|numeric|min:0',
            'service_type' => 'required|in:A,B,C,D,E',
            'oil_samples' => 'nullable|array',
            'items' => 'required|array',
            'results_data' => 'nullable|array',
            'notes' => 'nullable|string|max:3000',
            'mechanic_name' => 'nullable|string|max:255',
            'supervisor_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:DRAFT,COMPLETED',
        ]);

        if (empty($validated['form_number'])) {
            $validated['form_number'] = PlantForm::generateFormNumber($validated['form_type'] ?? 'PM-773E');
        }

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'COMPLETED';

        $plantForm = PlantForm::create($validated);

        return redirect()->route('form-oht773.index', ['id' => $plantForm->id])
            ->with('success', "Form PM {$plantForm->form_number} berhasil disimpan.");
    }

    public function show($id)
    {
        $plantForm = PlantForm::with(['unit', 'creator'])->findOrFail($id);

        return Inertia::render('PlantForm/Show', [
            'form' => $plantForm,
        ]);
    }

    public function edit($id)
    {
        $plantForm = PlantForm::with('unit')->findOrFail($id);
        $units = Unit::select('id', 'code_unit', 'model', 'sn_chassis as serial_number', 'engine_model', 'hm as current_hm', 'location as lokasi')
            ->orderBy('code_unit')
            ->get();

        return Inertia::render('PlantForm/Create', [
            'units' => $units,
            'existingForm' => $plantForm,
            'defaultItems' => $plantForm->items ?: PlantForm::getDefaultChecklistItems(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $plantForm = PlantForm::findOrFail($id);

        $validated = $request->validate([
            'project_id' => 'nullable|string|max:255',
            'unit_id' => 'required|exists:units,id',
            'date' => 'required|date',
            'shift' => 'required|in:DS,NS',
            'smu' => 'nullable|numeric|min:0',
            'service_type' => 'required|in:A,B,C,D,E',
            'oil_samples' => 'nullable|array',
            'items' => 'required|array',
            'results_data' => 'nullable|array',
            'notes' => 'nullable|string|max:3000',
            'mechanic_name' => 'nullable|string|max:255',
            'supervisor_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:DRAFT,COMPLETED',
        ]);

        $plantForm->update($validated);

        return redirect()->route('form-oht773.index', ['id' => $plantForm->id])
            ->with('success', "Form PM {$plantForm->form_number} berhasil diperbarui.");
    }

    public function destroy($id)
    {
        $plantForm = PlantForm::findOrFail($id);
        $formNo = $plantForm->form_number;
        $plantForm->delete();

        return redirect()->route('form-oht773.index')
            ->with('success', "Form {$formNo} berhasil dihapus.");
    }

    public function print($id)
    {
        $plantForm = PlantForm::with(['unit', 'creator'])->findOrFail($id);

        return Inertia::render('PlantForm/Print', [
            'form' => $plantForm,
            'isBlank' => false,
        ]);
    }

    public function blankPrint(Request $request)
    {
        $defaultItems = PlantForm::getDefaultChecklistItems();
        $unitId = $request->query('unit_id');
        $unit = $unitId ? Unit::find($unitId) : null;

        return Inertia::render('PlantForm/Print', [
            'isBlank' => true,
            'defaultItems' => $defaultItems,
            'preselectedUnit' => $unit,
        ]);
    }

    public function downloadPdf(Request $request)
    {
        $selectedForm = null;
        if ($request->filled('id')) {
            $selectedForm = PlantForm::with(['unit', 'creator'])->find($request->id);
        }

        $unit = null;
        if ($selectedForm && $selectedForm->unit) {
            $unit = $selectedForm->unit;
        } elseif ($request->filled('unit_id')) {
            $unit = Unit::find($request->unit_id);
        }

        $items = $selectedForm ? $selectedForm->items : PlantForm::getDefaultChecklistItems();
        $sections = [
            'ENGINE SYSTEM' => '1. ENGINE SYSTEM',
            'DIFFERENTIAL & FINAL DRIVE' => '2. DIFFERENTIAL & FINAL DRIVE',
            'TRANSMISSION & TORQUE CONVERTER' => '3. TRANSMISSION & TORQUE CONVERTER',
            'HYDRAULIC, STEERING & BRAKE SYSTEM' => '4. HYDRAULIC, STEERING & BRAKE SYSTEM',
            'STEERING SYSTEM & AIR SYSTEM' => '5. STEERING SYSTEM & AIR SYSTEM',
            'LUBRICATION / GREASING' => '6. LUBRICATION / GREASING',
            'GENERAL & SAFETY INSPECTION' => '7. GENERAL & SAFETY INSPECTION',
        ];

        $serviceType = $selectedForm?->service_type ?? ($request->service_type ?? 'A');

        $pdf = Pdf::loadView('pdf.pm-service-sheet-773e', [
            'form' => $selectedForm,
            'unit' => $unit,
            'items' => $items,
            'sections' => $sections,
            'formNumber' => $selectedForm?->form_number ?? ($request->form_number ?? 'PLT/FRM/PM-773E/001'),
            'projectId' => $selectedForm?->project_id ?? ($request->project_id ?? 'PT. MAM'),
            'date' => $selectedForm?->date ?? ($request->date ?? date('Y-m-d')),
            'shift' => $selectedForm?->shift ?? ($request->shift ?? 'DS'),
            'smu' => $selectedForm?->smu ?? ($request->smu ?? ''),
            'serviceType' => $serviceType,
            'oilSamples' => $selectedForm?->oil_samples ?? [
                'engine' => $request->oil_engine ?? '',
                'transmission' => $request->oil_transmission ?? '',
                'differential' => $request->oil_differential ?? '',
                'hydraulic' => $request->oil_hydraulic ?? '',
            ],
            'notes' => $selectedForm?->notes ?? ($request->notes ?? ''),
            'mechanicName' => $selectedForm?->mechanic_name ?? ($request->mechanic_name ?? ''),
            'supervisorName' => $selectedForm?->supervisor_name ?? ($request->supervisor_name ?? ''),
        ])->setPaper('a4', 'portrait');

        $filename = 'PM_Service_Sheet_OHT773E_'.($unit?->code_unit ?? 'BLANK').'_'.date('Ymd_His').'.pdf';

        return $pdf->download($filename);
    }
}
