<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\UnitGatePass;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class UnitGatePassController extends Controller
{
    /**
     * Display a listing of unit gate passes / despatch reports.
     */
    public function index(Request $request): Response
    {
        $query = UnitGatePass::query()->latest('created_at');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('gatepass_no', 'like', "%{$search}%")
                    ->orWhere('code_unit', 'like', "%{$search}%")
                    ->orWhere('driver_name', 'like', "%{$search}%")
                    ->orWhere('person_name', 'like', "%{$search}%")
                    ->orWhere('to_location', 'like', "%{$search}%")
                    ->orWhere('destination', 'like', "%{$search}%")
                    ->orWhere('engine_make', 'like', "%{$search}%")
                    ->orWhere('engine_model', 'like', "%{$search}%")
                    ->orWhere('purpose', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $gatepasses = $query->paginate(20)->withQueryString();

        // Summary statistics
        $stats = [
            'total' => UnitGatePass::count(),
            'active' => UnitGatePass::whereIn('status', ['ACTIVE', 'DESPATCHED'])->count(),
            'returned' => UnitGatePass::whereIn('status', ['RETURNED', 'RECEIVED'])->count(),
            'today' => UnitGatePass::whereDate('created_at', today())->count(),
        ];

        // Available units for dropdown selector with complete specs
        $units = Unit::select('id', 'code_unit', 'model', 'type_unit', 'engine_make', 'engine_model', 'sn_engine', 'hm', 'no_police', 'sn_chassis')
            ->orderBy('code_unit')
            ->get();

        // Next suggested gate pass number (format: GP-01 or GPU-20260919-001)
        $countTotal = UnitGatePass::count() + 1;
        $suggestedNo = str_pad($countTotal, 2, '0', STR_PAD_LEFT);

        return Inertia::render('UnitGatepass/Index', [
            'gatepasses' => $gatepasses,
            'stats' => $stats,
            'units' => $units,
            'suggestedNo' => $suggestedNo,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Store a newly created unit gate pass / despatch report.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'gatepass_no' => 'required|string|max:50|unique:unit_gate_passes,gatepass_no',
            'company_name' => 'nullable|string|max:150',
            'transfer_type' => 'nullable|string|max:150',
            'cst_no' => 'nullable|string|max:50',
            'lst_no' => 'nullable|string|max:50',
            'st_form_no' => 'nullable|string|max:50',

            // FROM & TO
            'from_company' => 'nullable|string|max:150',
            'from_location' => 'nullable|string|max:200',
            'to_company' => 'nullable|string|max:150',
            'to_location' => 'nullable|string|max:200',
            'kind_attn' => 'nullable|string|max:150',

            // Courier / Person info
            'person_name' => 'nullable|string|max:150',
            'mob_no' => 'nullable|string|max:50',
            'receiver_name' => 'nullable|string|max:150',
            'wt_material' => 'nullable|string|max:50',
            'approx_value' => 'nullable|string|max:50',
            'gate' => 'nullable|string|max:50',

            // Unit details
            'unit_id' => 'nullable|exists:units,id',
            'code_unit' => 'required|string|max:100',
            'type_unit' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'no_police' => 'nullable|string|max:50',
            'unit_measure' => 'nullable|string|max:20',
            'qty_despatch' => 'nullable|integer',
            'qty_recd' => 'nullable|integer',
            'engine_make' => 'nullable|string|max:100',
            'engine_model' => 'nullable|string|max:100',
            'sn_engine' => 'nullable|string|max:100',
            'starter_alternator' => 'nullable|string|max:150',
            'battery_spec' => 'nullable|string|max:100',
            'battery_model' => 'nullable|string|max:150',
            'battery_qty' => 'nullable|integer',

            // Remarks / Condition Checklist
            'fuel_level' => 'nullable|string|max:100',
            'oil_level' => 'nullable|string|max:100',
            'hr_mtr' => 'nullable|string|max:50',
            'battery_condition' => 'nullable|string|max:100',
            'battery_performance' => 'nullable|string|max:100',
            'parts_missing' => 'nullable|string|max:100',
            'radio_rig' => 'nullable|string|max:100',
            'general_condition' => 'nullable|string|max:100',
            'apar_1' => 'nullable|string|max:100',
            'apar_2' => 'nullable|string|max:100',
            'next_service_hm' => 'nullable|string|max:50',

            // Signatures
            'approved_by_name' => 'nullable|string|max:150',
            'approved_by_title' => 'nullable|string|max:150',
            'issued_by_name' => 'nullable|string|max:150',
            'issued_by_title' => 'nullable|string|max:150',
            'checked_by_name' => 'nullable|string|max:150',
            'checked_by_title' => 'nullable|string|max:150',
            'received_by_name' => 'nullable|string|max:150',
            'received_by_title' => 'nullable|string|max:150',

            // Legacy & dates
            'driver_name' => 'nullable|string|max:150',
            'destination' => 'nullable|string|max:200',
            'purpose' => 'nullable|string|max:255',
            'exit_time' => 'nullable|date',
            'expected_return_time' => 'nullable|date',
            'status' => 'nullable|string|in:ACTIVE,RETURNED,DESPATCHED,RECEIVED,CANCELLED',
            'remarks' => 'nullable|string|max:500',
            'despatch_date' => 'nullable|date',
        ]);

        if (empty($validated['status'])) {
            $validated['status'] = 'DESPATCHED';
        }
        if (empty($validated['exit_time'])) {
            $validated['exit_time'] = now();
        }
        if (empty($validated['driver_name']) && ! empty($validated['person_name'])) {
            $validated['driver_name'] = $validated['person_name'];
        }
        if (empty($validated['person_name']) && ! empty($validated['driver_name'])) {
            $validated['person_name'] = $validated['driver_name'];
        }
        if (empty($validated['destination']) && ! empty($validated['to_location'])) {
            $validated['destination'] = $validated['to_location'];
        }

        // Fill unit details from Unit model if unit_id exists
        if (! empty($validated['unit_id'])) {
            $unit = Unit::find($validated['unit_id']);
            if ($unit) {
                $validated['type_unit'] = ! empty($validated['type_unit']) ? $validated['type_unit'] : $unit->type_unit;
                $validated['model'] = ! empty($validated['model']) ? $validated['model'] : $unit->model;
                $validated['engine_make'] = ! empty($validated['engine_make']) ? $validated['engine_make'] : $unit->engine_make;
                $validated['engine_model'] = ! empty($validated['engine_model']) ? $validated['engine_model'] : $unit->engine_model;
                $validated['sn_engine'] = ! empty($validated['sn_engine']) ? $validated['sn_engine'] : $unit->sn_engine;
                $validated['hr_mtr'] = ! empty($validated['hr_mtr']) ? $validated['hr_mtr'] : ($unit->hm ? (string) $unit->hm : null);
                $validated['no_police'] = ! empty($validated['no_police']) ? $validated['no_police'] : $unit->no_police;
            }
        }

        UnitGatePass::create($validated);

        return redirect()->back()->with('success', 'Despatch Report / Gatepass Unit berhasil diterbitkan.');
    }

    /**
     * Update the specified unit gate pass.
     */
    public function update(Request $request, UnitGatePass $gatepass_unit): RedirectResponse
    {
        $validated = $request->validate([
            'gatepass_no' => 'required|string|max:50|unique:unit_gate_passes,gatepass_no,'.$gatepass_unit->id,
            'company_name' => 'nullable|string|max:150',
            'transfer_type' => 'nullable|string|max:150',
            'cst_no' => 'nullable|string|max:50',
            'lst_no' => 'nullable|string|max:50',
            'st_form_no' => 'nullable|string|max:50',

            // FROM & TO
            'from_company' => 'nullable|string|max:150',
            'from_location' => 'nullable|string|max:200',
            'to_company' => 'nullable|string|max:150',
            'to_location' => 'nullable|string|max:200',
            'kind_attn' => 'nullable|string|max:150',

            // Courier / Person info
            'person_name' => 'nullable|string|max:150',
            'mob_no' => 'nullable|string|max:50',
            'receiver_name' => 'nullable|string|max:150',
            'wt_material' => 'nullable|string|max:50',
            'approx_value' => 'nullable|string|max:50',
            'gate' => 'nullable|string|max:50',

            // Unit details
            'unit_id' => 'nullable|exists:units,id',
            'code_unit' => 'required|string|max:100',
            'type_unit' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'no_police' => 'nullable|string|max:50',
            'unit_measure' => 'nullable|string|max:20',
            'qty_despatch' => 'nullable|integer',
            'qty_recd' => 'nullable|integer',
            'engine_make' => 'nullable|string|max:100',
            'engine_model' => 'nullable|string|max:100',
            'sn_engine' => 'nullable|string|max:100',
            'starter_alternator' => 'nullable|string|max:150',
            'battery_spec' => 'nullable|string|max:100',
            'battery_model' => 'nullable|string|max:150',
            'battery_qty' => 'nullable|integer',

            // Remarks / Condition Checklist
            'fuel_level' => 'nullable|string|max:100',
            'oil_level' => 'nullable|string|max:100',
            'hr_mtr' => 'nullable|string|max:50',
            'battery_condition' => 'nullable|string|max:100',
            'battery_performance' => 'nullable|string|max:100',
            'parts_missing' => 'nullable|string|max:100',
            'radio_rig' => 'nullable|string|max:100',
            'general_condition' => 'nullable|string|max:100',
            'apar_1' => 'nullable|string|max:100',
            'apar_2' => 'nullable|string|max:100',
            'next_service_hm' => 'nullable|string|max:50',

            // Signatures
            'approved_by_name' => 'nullable|string|max:150',
            'approved_by_title' => 'nullable|string|max:150',
            'issued_by_name' => 'nullable|string|max:150',
            'issued_by_title' => 'nullable|string|max:150',
            'checked_by_name' => 'nullable|string|max:150',
            'checked_by_title' => 'nullable|string|max:150',
            'received_by_name' => 'nullable|string|max:150',
            'received_by_title' => 'nullable|string|max:150',

            // Legacy & dates
            'driver_name' => 'nullable|string|max:150',
            'destination' => 'nullable|string|max:200',
            'purpose' => 'nullable|string|max:255',
            'exit_time' => 'nullable|date',
            'expected_return_time' => 'nullable|date',
            'actual_return_time' => 'nullable|date',
            'status' => 'required|string',
            'remarks' => 'nullable|string|max:500',
            'despatch_date' => 'nullable|date',
        ]);

        if (empty($validated['driver_name']) && ! empty($validated['person_name'])) {
            $validated['driver_name'] = $validated['person_name'];
        }
        if (empty($validated['destination']) && ! empty($validated['to_location'])) {
            $validated['destination'] = $validated['to_location'];
        }

        $gatepass_unit->update($validated);

        return redirect()->back()->with('success', 'Despatch Report / Gatepass Unit berhasil diperbarui.');
    }

    /**
     * Mark unit as returned / received.
     */
    public function markReturned(Request $request, UnitGatePass $gatepass_unit): RedirectResponse
    {
        $gatepass_unit->update([
            'status' => 'RECEIVED',
            'actual_return_time' => $request->input('actual_return_time', now()),
            'qty_recd' => $request->input('qty_recd', $gatepass_unit->qty_despatch ?: 1),
        ]);

        return redirect()->back()->with('success', 'Unit telah berhasil ditandai RECEIVED / KEMBALI.');
    }

    /**
     * Export / download Despatch Report PDF.
     */
    public function exportPdf(UnitGatePass $gatepass_unit): HttpResponse
    {
        $pdf = Pdf::loadView('pdf.unit-gatepass-report', [
            'gatepass' => $gatepass_unit,
        ]);

        return $pdf->stream('Despatch_Report_'.$gatepass_unit->gatepass_no.'.pdf');
    }

    /**
     * Remove the specified unit gate pass.
     */
    public function destroy(UnitGatePass $gatepass_unit): RedirectResponse
    {
        $gatepass_unit->delete();

        return redirect()->back()->with('success', 'Gatepass Unit berhasil dihapus.');
    }
}
