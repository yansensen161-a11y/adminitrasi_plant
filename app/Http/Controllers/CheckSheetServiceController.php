<?php

namespace App\Http\Controllers;

use App\Models\PlantForm;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CheckSheetServiceController extends Controller
{
    public function index(Request $request)
    {
        $units = Unit::select(
            'id',
            'code_unit',
            'model',
            'type_unit',
            'sn_chassis as serial_number',
            'engine_model',
            'hm as current_hm',
            'location as lokasi'
        )->orderBy('code_unit')->get();

        $defaultItems = PlantForm::getCheckSheetServiceItems();
        $suggestedFormNumber = PlantForm::generateFormNumber('CSS');

        $selectedForm = null;
        if ($request->filled('id')) {
            $selectedForm = PlantForm::with(['unit', 'creator'])->find($request->id);
        }

        $recentForms = PlantForm::with(['unit', 'creator'])
            ->where('form_type', 'CHECK-SHEET-SERVICE')
            ->latest('date')
            ->latest('id')
            ->take(20)
            ->get();

        return Inertia::render('CheckSheetService/Index', [
            'units' => $units,
            'defaultItems' => $defaultItems,
            'suggestedFormNumber' => $suggestedFormNumber,
            'selectedForm' => $selectedForm,
            'recentForms' => $recentForms,
            'prefill' => [
                'unit_id' => $request->query('unit_id'),
                'no_wo' => $request->query('no_wo'),
            ],
        ]);
    }

    public function create(Request $request)
    {
        return redirect()->route('form-check-sheet-service.index', $request->query());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'form_number' => 'nullable|string|max:100',
            'project_id' => 'nullable|string|max:255',
            'unit_id' => 'required|exists:units,id',
            'date' => 'required|date',
            'shift' => 'nullable|string|max:10',
            'smu' => 'nullable|numeric|min:0',
            'service_type' => 'nullable|string|max:50',
            'items' => 'required|array',
            'results_data' => 'nullable|array',
            'notes' => 'nullable|string|max:3000',
            'mechanic_name' => 'nullable|string|max:255',
            'supervisor_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:DRAFT,COMPLETED,APPROVED',
        ]);

        $validated['form_type'] = 'CHECK-SHEET-SERVICE';
        $validated['project_id'] = $validated['project_id'] ?? 'PT Mitra Abadi Mahakam';

        if (empty($validated['form_number'])) {
            $validated['form_number'] = PlantForm::generateFormNumber('CSS');
        }

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'COMPLETED';

        $plantForm = PlantForm::create($validated);

        return redirect()->route('form-check-sheet-service.index', ['id' => $plantForm->id])
            ->with('success', "Check Sheet Service {$plantForm->form_number} berhasil disimpan.");
    }

    public function show($id)
    {
        return redirect()->route('form-check-sheet-service.index', ['id' => $id]);
    }

    public function edit($id)
    {
        return redirect()->route('form-check-sheet-service.index', ['id' => $id]);
    }

    public function update(Request $request, $id)
    {
        $plantForm = PlantForm::findOrFail($id);

        $validated = $request->validate([
            'form_number' => 'nullable|string|max:100',
            'project_id' => 'nullable|string|max:255',
            'unit_id' => 'required|exists:units,id',
            'date' => 'required|date',
            'shift' => 'nullable|string|max:10',
            'smu' => 'nullable|numeric|min:0',
            'service_type' => 'nullable|string|max:50',
            'items' => 'required|array',
            'results_data' => 'nullable|array',
            'notes' => 'nullable|string|max:3000',
            'mechanic_name' => 'nullable|string|max:255',
            'supervisor_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:DRAFT,COMPLETED,APPROVED',
        ]);

        $validated['form_type'] = 'CHECK-SHEET-SERVICE';
        $plantForm->update($validated);

        return redirect()->route('form-check-sheet-service.index', ['id' => $plantForm->id])
            ->with('success', "Check Sheet Service {$plantForm->form_number} berhasil diperbarui.");
    }

    public function destroy($id)
    {
        $plantForm = PlantForm::findOrFail($id);
        $formNo = $plantForm->form_number;
        $plantForm->delete();

        return redirect()->route('form-check-sheet-service.index')
            ->with('success', "Form {$formNo} berhasil dihapus.");
    }

    public function print($id)
    {
        $plantForm = PlantForm::with(['unit', 'creator'])->findOrFail($id);

        return Inertia::render('CheckSheetService/Print', [
            'form' => $plantForm,
            'isBlank' => false,
            'defaultItems' => PlantForm::getCheckSheetServiceItems(),
        ]);
    }

    public function blankPrint(Request $request)
    {
        $defaultItems = PlantForm::getCheckSheetServiceItems();
        $unitId = $request->query('unit_id');
        $unit = $unitId ? Unit::find($unitId) : null;

        return Inertia::render('CheckSheetService/Print', [
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

        $items = $selectedForm?->items ?? PlantForm::getCheckSheetServiceItems();
        $results = $selectedForm?->results_data ?? [];

        $pdf = Pdf::loadView('pdf.check-sheet-service', [
            'form' => $selectedForm,
            'unit' => $unit,
            'items' => $items,
            'results' => $results,
            'formNumber' => $selectedForm?->form_number ?? ($request->form_number ?? 'PLT/FRM/CSS/001'),
            'date' => $selectedForm?->date ?? ($request->date ?? date('Y-m-d')),
            'smu' => $selectedForm?->smu ?? ($request->smu ?? ($unit?->current_hm ?? '')),
            'serviceType' => $selectedForm?->service_type ?? ($request->service_type ?? '250/750'),
            'mechanicName' => $selectedForm?->mechanic_name ?? ($request->mechanic_name ?? ''),
            'supervisorName' => $selectedForm?->supervisor_name ?? ($request->supervisor_name ?? ''),
        ])->setPaper('a4', 'portrait');

        $filename = 'Check_Sheet_Service_'.($unit?->code_unit ?? 'BLANK').'_'.date('Ymd_His').'.pdf';

        return $pdf->download($filename);
    }
}
