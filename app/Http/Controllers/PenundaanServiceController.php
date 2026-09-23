<?php

namespace App\Http\Controllers;

use App\Models\PlantForm;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenundaanServiceController extends Controller
{
    public function index(Request $request)
    {
        $units = Unit::select('id', 'code_unit', 'model', 'sn_chassis as serial_number', 'engine_model', 'hm as current_hm', 'location as lokasi')
            ->orderBy('code_unit')
            ->get();

        $alasanOptions = PlantForm::getPenundaanAlasanOptions();
        $defaultApprovals = PlantForm::getDefaultPenundaanApprovals();
        $suggestedFormNumber = PlantForm::generateFormNumber('PND');

        $selectedForm = null;
        if ($request->filled('id')) {
            $selectedForm = PlantForm::with(['unit', 'creator'])->find($request->id);
        }

        // Prefill from query params (e.g. from Work Order)
        $preUnitId = $request->query('unit_id');
        $preNoWo = $request->query('no_wo');

        $recentForms = PlantForm::with(['unit', 'creator'])
            ->where('form_type', 'PENUNDAAN-SERVICE')
            ->latest('date')
            ->latest('id')
            ->take(15)
            ->get();

        return Inertia::render('PenundaanService/Index', [
            'units' => $units,
            'alasanOptions' => $alasanOptions,
            'defaultApprovals' => $defaultApprovals,
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
        return redirect()->route('form-penundaan-service.index', $request->query());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'form_type' => 'nullable|string|max:50',
            'form_number' => 'nullable|string|max:100',
            'project_id' => 'nullable|string|max:255',
            'unit_id' => 'required|exists:units,id',
            'date' => 'required|date',
            'shift' => 'nullable|string|max:10',
            'smu' => 'nullable|numeric|min:0',
            'service_type' => 'nullable|string|max:50',
            'items' => 'nullable|array', // reasons checked
            'results_data' => 'required|array', // detail penundaan, mitigasi risiko, approvals, dll
            'notes' => 'nullable|string|max:3000', // keterangan / justifikasi
            'mechanic_name' => 'nullable|string|max:255', // pengaju
            'supervisor_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:DRAFT,COMPLETED,APPROVED',
        ]);

        $validated['form_type'] = $validated['form_type'] ?? 'PENUNDAAN-SERVICE';
        $validated['shift'] = $validated['shift'] ?? 'DS';
        $validated['service_type'] = $validated['service_type'] ?? 'PS 250';

        if (empty($validated['form_number'])) {
            $validated['form_number'] = PlantForm::generateFormNumber('PND');
        }

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'COMPLETED';

        $plantForm = PlantForm::create($validated);

        return redirect()->route('form-penundaan-service.index', ['id' => $plantForm->id])
            ->with('success', "Form Penundaan Service {$plantForm->form_number} berhasil disimpan.");
    }

    public function show($id)
    {
        $plantForm = PlantForm::with(['unit', 'creator'])->findOrFail($id);

        return redirect()->route('form-penundaan-service.index', ['id' => $plantForm->id]);
    }

    public function edit($id)
    {
        return redirect()->route('form-penundaan-service.index', ['id' => $id]);
    }

    public function update(Request $request, $id)
    {
        $plantForm = PlantForm::findOrFail($id);

        $validated = $request->validate([
            'project_id' => 'nullable|string|max:255',
            'unit_id' => 'required|exists:units,id',
            'date' => 'required|date',
            'shift' => 'nullable|string|max:10',
            'smu' => 'nullable|numeric|min:0',
            'service_type' => 'nullable|string|max:50',
            'items' => 'nullable|array',
            'results_data' => 'required|array',
            'notes' => 'nullable|string|max:3000',
            'mechanic_name' => 'nullable|string|max:255',
            'supervisor_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:DRAFT,COMPLETED,APPROVED',
        ]);

        $plantForm->update($validated);

        return redirect()->route('form-penundaan-service.index', ['id' => $plantForm->id])
            ->with('success', "Form Penundaan Service {$plantForm->form_number} berhasil diperbarui.");
    }

    public function destroy($id)
    {
        $plantForm = PlantForm::findOrFail($id);
        $formNo = $plantForm->form_number;
        $plantForm->delete();

        return redirect()->route('form-penundaan-service.index')
            ->with('success', "Form {$formNo} berhasil dihapus.");
    }

    public function print($id)
    {
        $plantForm = PlantForm::with(['unit', 'creator'])->findOrFail($id);

        return Inertia::render('PenundaanService/Print', [
            'form' => $plantForm,
            'isBlank' => false,
            'alasanOptions' => PlantForm::getPenundaanAlasanOptions(),
            'defaultApprovals' => PlantForm::getDefaultPenundaanApprovals(),
        ]);
    }

    public function blankPrint(Request $request)
    {
        $alasanOptions = PlantForm::getPenundaanAlasanOptions();
        $defaultApprovals = PlantForm::getDefaultPenundaanApprovals();
        $unitId = $request->query('unit_id');
        $unit = $unitId ? Unit::find($unitId) : null;

        return Inertia::render('PenundaanService/Print', [
            'isBlank' => true,
            'alasanOptions' => $alasanOptions,
            'defaultApprovals' => $defaultApprovals,
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

        $results = $selectedForm?->results_data ?? [];
        $reasons = $selectedForm?->items ?? [];

        $pdf = Pdf::loadView('pdf.form-penundaan-service', [
            'form' => $selectedForm,
            'unit' => $unit,
            'reasons' => $reasons,
            'results' => $results,
            'formNumber' => $selectedForm?->form_number ?? ($request->form_number ?? 'PLT/FRM/PND/001'),
            'date' => $selectedForm?->date ?? ($request->date ?? date('Y-m-d')),
            'serviceType' => $selectedForm?->service_type ?? ($request->service_type ?? 'PS 250'),
            'smu' => $selectedForm?->smu ?? ($request->smu ?? ($unit?->current_hm ?? '')),
            'notes' => $selectedForm?->notes ?? ($request->notes ?? ''),
            'mechanicName' => $selectedForm?->mechanic_name ?? ($request->mechanic_name ?? ''),
            'supervisorName' => $selectedForm?->supervisor_name ?? ($request->supervisor_name ?? ''),
        ])->setPaper('a4', 'landscape');

        $filename = 'Form_Penundaan_Service_'.($unit?->code_unit ?? 'BLANK').'_'.date('Ymd_His').'.pdf';

        return $pdf->download($filename);
    }
}
