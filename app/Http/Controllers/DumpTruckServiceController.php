<?php

namespace App\Http\Controllers;

use App\Models\PlantForm;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DumpTruckServiceController extends Controller
{
    public function index(Request $request)
    {
        $units = Unit::select('id', 'code_unit', 'model', 'sn_chassis as serial_number', 'engine_model', 'hm as current_hm', 'location as lokasi')
            ->orderBy('code_unit')
            ->get();

        $defaultItems = PlantForm::getDumpTruckChecklistItems();
        $suggestedFormNumber = PlantForm::generateFormNumber('PM-DT');

        $selectedForm = null;
        if ($request->filled('id')) {
            $selectedForm = PlantForm::with(['unit', 'creator'])->find($request->id);
        }

        $recentForms = PlantForm::with(['unit', 'creator'])
            ->where('form_type', 'PM-DUMP-TRUCK')
            ->latest('date')
            ->latest('id')
            ->take(15)
            ->get();

        return Inertia::render('DumpTruckService/Index', [
            'units' => $units,
            'defaultItems' => $defaultItems,
            'suggestedFormNumber' => $suggestedFormNumber,
            'selectedForm' => $selectedForm,
            'recentForms' => $recentForms,
        ]);
    }

    public function create(Request $request)
    {
        return redirect()->route('form-service-dump-truck.index');
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

        $validated['form_type'] = $validated['form_type'] ?? 'PM-DUMP-TRUCK';

        if (empty($validated['form_number'])) {
            $validated['form_number'] = PlantForm::generateFormNumber('PM-DT');
        }

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'COMPLETED';

        $plantForm = PlantForm::create($validated);

        return redirect()->route('form-service-dump-truck.index', ['id' => $plantForm->id])
            ->with('success', "Form PM Dump Truck {$plantForm->form_number} berhasil disimpan.");
    }

    public function show($id)
    {
        $plantForm = PlantForm::with(['unit', 'creator'])->findOrFail($id);

        return redirect()->route('form-service-dump-truck.index', ['id' => $plantForm->id]);
    }

    public function edit($id)
    {
        return redirect()->route('form-service-dump-truck.index', ['id' => $id]);
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

        return redirect()->route('form-service-dump-truck.index', ['id' => $plantForm->id])
            ->with('success', "Form PM Dump Truck {$plantForm->form_number} berhasil diperbarui.");
    }

    public function destroy($id)
    {
        $plantForm = PlantForm::findOrFail($id);
        $formNo = $plantForm->form_number;
        $plantForm->delete();

        return redirect()->route('form-service-dump-truck.index')
            ->with('success', "Form {$formNo} berhasil dihapus.");
    }

    public function print($id)
    {
        $plantForm = PlantForm::with(['unit', 'creator'])->findOrFail($id);

        return Inertia::render('DumpTruckService/Print', [
            'form' => $plantForm,
            'isBlank' => false,
            'defaultItems' => PlantForm::getDumpTruckChecklistItems(),
        ]);
    }

    public function blankPrint(Request $request)
    {
        $defaultItems = PlantForm::getDumpTruckChecklistItems();
        $unitId = $request->query('unit_id');
        $unit = $unitId ? Unit::find($unitId) : null;

        return Inertia::render('DumpTruckService/Print', [
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

        $items = $selectedForm ? $selectedForm->items : PlantForm::getDumpTruckChecklistItems();

        $serviceType = $selectedForm?->service_type ?? ($request->service_type ?? 'A');

        $pdf = Pdf::loadView('pdf.pm-service-sheet-dump-truck', [
            'form' => $selectedForm,
            'unit' => $unit,
            'items' => $items,
            'formNumber' => $selectedForm?->form_number ?? ($request->form_number ?? 'PLT/FRM/PM-DT/001'),
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

        $filename = 'PM_Service_Sheet_Dump_Truck_'.($unit?->code_unit ?? 'BLANK').'_'.date('Ymd_His').'.pdf';

        return $pdf->download($filename);
    }
}
