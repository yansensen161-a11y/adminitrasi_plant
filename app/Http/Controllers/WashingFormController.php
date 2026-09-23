<?php

namespace App\Http\Controllers;

use App\Models\PlantForm;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WashingFormController extends Controller
{
    public function index(Request $request)
    {
        $units = Unit::select('id', 'code_unit', 'model', 'sn_chassis as serial_number', 'engine_model', 'hm as current_hm', 'location as lokasi')
            ->orderBy('code_unit')
            ->get();

        $defaultItems = PlantForm::getWashingChecklistItems();
        $suggestedFormNumber = PlantForm::generateFormNumber('WASH');

        $selectedForm = null;
        if ($request->filled('id')) {
            $selectedForm = PlantForm::with(['unit', 'creator'])->find($request->id);
        }

        // Prefill from query params (e.g., from Work Order)
        $preUnitId = $request->query('unit_id');
        $preNoWo = $request->query('no_wo');

        $recentForms = PlantForm::with(['unit', 'creator'])
            ->where('form_type', 'WASHING-UNIT')
            ->latest('date')
            ->latest('id')
            ->take(15)
            ->get();

        return Inertia::render('WashingForm/Index', [
            'units' => $units,
            'defaultItems' => $defaultItems,
            'suggestedFormNumber' => $suggestedFormNumber,
            'selectedForm' => $selectedForm,
            'recentForms' => $recentForms,
            'prefill' => [
                'unit_id' => $preUnitId,
                'no_wo' => $preNoWo,
            ],
        ]);
    }

    public function create(Request $request)
    {
        return redirect()->route('form-washing-unit.index', $request->query());
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
            'items' => 'required|array',
            'results_data' => 'nullable|array',
            'notes' => 'nullable|string|max:3000',
            'mechanic_name' => 'nullable|string|max:255',
            'supervisor_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:DRAFT,COMPLETED',
        ]);

        $validated['form_type'] = $validated['form_type'] ?? 'WASHING-UNIT';
        $validated['service_type'] = 'A'; // default non-empty value for schema compatibility

        if (empty($validated['form_number'])) {
            $validated['form_number'] = PlantForm::generateFormNumber('WASH');
        }

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'COMPLETED';

        $plantForm = PlantForm::create($validated);

        return redirect()->route('form-washing-unit.index', ['id' => $plantForm->id])
            ->with('success', "Form Washing Unit {$plantForm->form_number} berhasil disimpan.");
    }

    public function show($id)
    {
        $plantForm = PlantForm::with(['unit', 'creator'])->findOrFail($id);

        return redirect()->route('form-washing-unit.index', ['id' => $plantForm->id]);
    }

    public function edit($id)
    {
        return redirect()->route('form-washing-unit.index', ['id' => $id]);
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
            'items' => 'required|array',
            'results_data' => 'nullable|array',
            'notes' => 'nullable|string|max:3000',
            'mechanic_name' => 'nullable|string|max:255',
            'supervisor_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:DRAFT,COMPLETED',
        ]);

        $plantForm->update($validated);

        return redirect()->route('form-washing-unit.index', ['id' => $plantForm->id])
            ->with('success', "Form Washing Unit {$plantForm->form_number} berhasil diperbarui.");
    }

    public function destroy($id)
    {
        $plantForm = PlantForm::findOrFail($id);
        $formNo = $plantForm->form_number;
        $plantForm->delete();

        return redirect()->route('form-washing-unit.index')
            ->with('success', "Form {$formNo} berhasil dihapus.");
    }

    public function print($id)
    {
        $plantForm = PlantForm::with(['unit', 'creator'])->findOrFail($id);

        return Inertia::render('WashingForm/Print', [
            'form' => $plantForm,
            'isBlank' => false,
            'defaultItems' => PlantForm::getWashingChecklistItems(),
        ]);
    }

    public function blankPrint(Request $request)
    {
        $defaultItems = PlantForm::getWashingChecklistItems();
        $unitId = $request->query('unit_id');
        $unit = $unitId ? Unit::find($unitId) : null;

        return Inertia::render('WashingForm/Print', [
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

        $items = $selectedForm ? $selectedForm->items : PlantForm::getWashingChecklistItems();
        $results = $selectedForm?->results_data ?? [];

        $pdf = Pdf::loadView('pdf.form-washing-unit', [
            'form' => $selectedForm,
            'unit' => $unit,
            'items' => $items,
            'results' => $results,
            'formNumber' => $selectedForm?->form_number ?? ($request->form_number ?? 'PLT/FRM/WASH/001'),
            'date' => $selectedForm?->date ?? ($request->date ?? date('Y-m-d')),
            'shift' => $selectedForm?->shift ?? ($request->shift ?? 'DS'),
            'smu' => $selectedForm?->smu ?? ($request->smu ?? ''),
            'notes' => $selectedForm?->notes ?? ($request->notes ?? ''),
            'mechanicName' => $selectedForm?->mechanic_name ?? ($request->mechanic_name ?? ''),
            'supervisorName' => $selectedForm?->supervisor_name ?? ($request->supervisor_name ?? ''),
        ])->setPaper('a4', 'portrait');

        $filename = 'Form_Washing_Unit_'.($unit?->code_unit ?? 'BLANK').'_'.date('Ymd_His').'.pdf';

        return $pdf->download($filename);
    }
}
