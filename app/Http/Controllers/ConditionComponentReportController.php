<?php

namespace App\Http\Controllers;

use App\Models\ConditionComponentReport;
use App\Models\ConditionComponentReportItem;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ConditionComponentReportController extends Controller
{
    /**
     * Display a listing of CCR reports.
     */
    public function index(Request $request): Response
    {
        $query = ConditionComponentReport::with(['items', 'unit'])->latest('created_at');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('report_no', 'like', "%{$search}%")
                    ->orWhere('unit_code', 'like', "%{$search}%")
                    ->orWhere('project', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('reported_by', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('serial_no', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('date_reported', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date_reported', '<=', $request->date_to);
        }

        $reports = $query->paginate(15)->withQueryString();

        // Calculate statistics
        $stats = [
            'total' => ConditionComponentReport::count(),
            'this_month' => ConditionComponentReport::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'approved' => ConditionComponentReport::where('status', 'APPROVED')->count(),
            'avg_hm_life' => round((float) ConditionComponentReport::whereNotNull('hm_life')->avg('hm_life'), 1),
        ];

        return Inertia::render('Component/ConditionReport/Index', [
            'reports' => $reports,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? 'ALL',
                'date_from' => $request->date_from ?? '',
                'date_to' => $request->date_to ?? '',
            ],
        ]);
    }

    /**
     * Generate next sequential number for WO CCR: PLT/WO/CCR/001
     */
    private function generateNextCcrNo(): string
    {
        $latest = ConditionComponentReport::where('report_no', 'like', 'PLT/WO/CCR/%')
            ->orderByRaw('CAST(SUBSTRING(report_no, 12) AS UNSIGNED) DESC')
            ->first();

        if ($latest && preg_match('/PLT\/WO\/CCR\/(\d+)/', $latest->report_no, $matches)) {
            $nextNum = (int) $matches[1] + 1;
        } else {
            $nextNum = ConditionComponentReport::count() + 1;
        }

        return 'PLT/WO/CCR/'.str_pad($nextNum, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Show form for creating a new report.
     */
    public function create(): Response
    {
        $units = Unit::select('id', 'code_unit', 'model', 'sn_chassis', 'hm', 'location')
            ->orderBy('code_unit')
            ->get();

        $suggestedNo = $this->generateNextCcrNo();

        return Inertia::render('Component/ConditionReport/Form', [
            'units' => $units,
            'suggestedNo' => $suggestedNo,
            'report' => null,
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created report.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'report_no' => 'nullable|string|max:100',
            'project' => 'nullable|string|max:150',
            'location' => 'nullable|string|max:150',
            'date_reported' => 'nullable|date',
            'reported_by' => 'nullable|string|max:150',
            'company_name' => 'nullable|string|max:150',
            'unit_id' => 'nullable|string|max:36',
            'unit_code' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'serial_no' => 'nullable|string|max:100',
            'date_install' => 'nullable|date',
            'hm_install' => 'nullable|numeric|min:0',
            'date_failure' => 'nullable|date',
            'hm_failure' => 'nullable|numeric|min:0',
            'dibuat_oleh' => 'nullable|string|max:150',
            'disetujui_oleh' => 'nullable|string|max:150',
            'diketahui_oleh' => 'nullable|string|max:150',
            'status' => 'nullable|string|in:DRAFT,APPROVED,CLOSED',
            'items' => 'nullable|array',
            'items.*.item_no' => 'nullable|integer',
            'items.*.remarks' => 'nullable|string',
            'items.*.picture' => 'nullable',
        ]);

        if (empty($validated['report_no'])) {
            $validated['report_no'] = $this->generateNextCcrNo();
        }

        if (empty($validated['company_name'])) {
            $validated['company_name'] = 'PT. MITRA ABADI MAHAKAM';
        }

        DB::beginTransaction();
        try {
            $report = ConditionComponentReport::create([
                'report_no' => $validated['report_no'],
                'project' => $validated['project'] ?? null,
                'location' => $validated['location'] ?? null,
                'date_reported' => $validated['date_reported'] ?? now()->toDateString(),
                'reported_by' => $validated['reported_by'] ?? null,
                'company_name' => $validated['company_name'],
                'unit_id' => $validated['unit_id'] ?? null,
                'unit_code' => $validated['unit_code'] ?? null,
                'model' => $validated['model'] ?? null,
                'serial_no' => $validated['serial_no'] ?? null,
                'date_install' => $validated['date_install'] ?? null,
                'hm_install' => $validated['hm_install'] ?? null,
                'date_failure' => $validated['date_failure'] ?? null,
                'hm_failure' => $validated['hm_failure'] ?? null,
                'dibuat_oleh' => $validated['dibuat_oleh'] ?? null,
                'disetujui_oleh' => $validated['disetujui_oleh'] ?? null,
                'diketahui_oleh' => $validated['diketahui_oleh'] ?? null,
                'status' => $validated['status'] ?? 'DRAFT',
            ]);

            // Save items & uploaded images
            $itemsData = $request->input('items', []);
            $itemsFiles = $request->file('items', []);

            if (is_array($itemsData) && count($itemsData) > 0) {
                foreach ($itemsData as $index => $itemData) {
                    $itemNo = $itemData['item_no'] ?? ($index + 1);
                    $remarks = $itemData['remarks'] ?? null;
                    $picturePath = null;

                    // Check if file was uploaded for this item index
                    if (isset($itemsFiles[$index]['picture']) && $itemsFiles[$index]['picture']->isValid()) {
                        $picturePath = $itemsFiles[$index]['picture']->store('ccr_pictures', 'public');
                    }

                    ConditionComponentReportItem::create([
                        'report_id' => $report->id,
                        'item_no' => $itemNo,
                        'remarks' => $remarks,
                        'picture_path' => $picturePath,
                    ]);
                }
            } else {
                // Default two rows if none provided
                for ($i = 1; $i <= 2; $i++) {
                    ConditionComponentReportItem::create([
                        'report_id' => $report->id,
                        'item_no' => $i,
                        'remarks' => null,
                        'picture_path' => null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('ccr.show', $report->id)
                ->with('success', 'Conditions Component Report (CCR) berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withInput()->with('error', 'Gagal menyimpan CCR: '.$e->getMessage());
        }
    }

    /**
     * Display the specified report (Print/Detail view).
     */
    public function show(ConditionComponentReport $ccr): Response
    {
        $ccr->load(['items', 'unit']);

        return Inertia::render('Component/ConditionReport/Print', [
            'report' => $ccr,
        ]);
    }

    /**
     * Show form for editing the report.
     */
    public function edit(ConditionComponentReport $ccr): Response
    {
        $ccr->load(['items', 'unit']);
        $units = Unit::select('id', 'code_unit', 'model', 'sn_chassis', 'hm', 'location')
            ->orderBy('code_unit')
            ->get();

        return Inertia::render('Component/ConditionReport/Form', [
            'report' => $ccr,
            'units' => $units,
            'isEdit' => true,
        ]);
    }

    /**
     * Update the specified report.
     */
    public function update(Request $request, ConditionComponentReport $ccr): RedirectResponse
    {
        $validated = $request->validate([
            'report_no' => 'nullable|string|max:100',
            'project' => 'nullable|string|max:150',
            'location' => 'nullable|string|max:150',
            'date_reported' => 'nullable|date',
            'reported_by' => 'nullable|string|max:150',
            'company_name' => 'nullable|string|max:150',
            'unit_id' => 'nullable|string|max:36',
            'unit_code' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'serial_no' => 'nullable|string|max:100',
            'date_install' => 'nullable|date',
            'hm_install' => 'nullable|numeric|min:0',
            'date_failure' => 'nullable|date',
            'hm_failure' => 'nullable|numeric|min:0',
            'dibuat_oleh' => 'nullable|string|max:150',
            'disetujui_oleh' => 'nullable|string|max:150',
            'diketahui_oleh' => 'nullable|string|max:150',
            'status' => 'nullable|string|in:DRAFT,APPROVED,CLOSED',
            'items' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            $ccr->update([
                'report_no' => $validated['report_no'] ?? $ccr->report_no,
                'project' => $validated['project'] ?? null,
                'location' => $validated['location'] ?? null,
                'date_reported' => $validated['date_reported'] ?? $ccr->date_reported,
                'reported_by' => $validated['reported_by'] ?? null,
                'company_name' => $validated['company_name'] ?? 'PT. MITRA ABADI MAHAKAM',
                'unit_id' => $validated['unit_id'] ?? null,
                'unit_code' => $validated['unit_code'] ?? null,
                'model' => $validated['model'] ?? null,
                'serial_no' => $validated['serial_no'] ?? null,
                'date_install' => $validated['date_install'] ?? null,
                'hm_install' => $validated['hm_install'] ?? null,
                'date_failure' => $validated['date_failure'] ?? null,
                'hm_failure' => $validated['hm_failure'] ?? null,
                'dibuat_oleh' => $validated['dibuat_oleh'] ?? null,
                'disetujui_oleh' => $validated['disetujui_oleh'] ?? null,
                'diketahui_oleh' => $validated['diketahui_oleh'] ?? null,
                'status' => $validated['status'] ?? $ccr->status,
            ]);

            // Synchronize items
            $itemsData = $request->input('items', []);
            $itemsFiles = $request->file('items', []);

            $existingItemIds = $ccr->items->pluck('id')->toArray();
            $updatedItemIds = [];

            if (is_array($itemsData) && count($itemsData) > 0) {
                foreach ($itemsData as $index => $itemData) {
                    $itemId = $itemData['id'] ?? null;
                    $itemNo = $itemData['item_no'] ?? ($index + 1);
                    $remarks = $itemData['remarks'] ?? null;
                    $existingPicturePath = $itemData['picture_path'] ?? null;

                    $newPicturePath = null;
                    if (isset($itemsFiles[$index]['picture']) && $itemsFiles[$index]['picture']->isValid()) {
                        $newPicturePath = $itemsFiles[$index]['picture']->store('ccr_pictures', 'public');
                    }

                    if ($itemId && in_array($itemId, $existingItemIds)) {
                        $item = ConditionComponentReportItem::find($itemId);
                        if ($item) {
                            $pictureToSave = $newPicturePath ?: $existingPicturePath;
                            // If new picture uploaded and old one existed, delete old
                            if ($newPicturePath && $item->picture_path && $item->picture_path !== $newPicturePath) {
                                Storage::disk('public')->delete($item->picture_path);
                            }

                            $item->update([
                                'item_no' => $itemNo,
                                'remarks' => $remarks,
                                'picture_path' => $pictureToSave,
                            ]);
                            $updatedItemIds[] = $item->id;
                        }
                    } else {
                        $item = ConditionComponentReportItem::create([
                            'report_id' => $ccr->id,
                            'item_no' => $itemNo,
                            'remarks' => $remarks,
                            'picture_path' => $newPicturePath ?: $existingPicturePath,
                        ]);
                        $updatedItemIds[] = $item->id;
                    }
                }
            }

            // Remove deleted items
            $toDelete = array_diff($existingItemIds, $updatedItemIds);
            if (! empty($toDelete)) {
                $itemsToDelete = ConditionComponentReportItem::whereIn('id', $toDelete)->get();
                foreach ($itemsToDelete as $delItem) {
                    if ($delItem->picture_path) {
                        Storage::disk('public')->delete($delItem->picture_path);
                    }
                    $delItem->delete();
                }
            }

            DB::commit();

            return redirect()->route('ccr.show', $ccr->id)
                ->with('success', 'Conditions Component Report (CCR) berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withInput()->with('error', 'Gagal memperbarui CCR: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified report.
     */
    public function destroy(ConditionComponentReport $ccr): RedirectResponse
    {
        try {
            foreach ($ccr->items as $item) {
                if ($item->picture_path) {
                    Storage::disk('public')->delete($item->picture_path);
                }
            }
            $ccr->delete();

            return redirect()->route('ccr.index')->with('success', 'CCR Report berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus data: '.$e->getMessage());
        }
    }

    /**
     * Export official PDF matching the Excel template.
     */
    public function exportPdf(ConditionComponentReport $ccr)
    {
        $ccr->load(['items', 'unit']);

        $pdf = Pdf::loadView('pdf.ccr-report', [
            'report' => $ccr,
        ])->setPaper('a4', 'landscape');

        return $pdf->stream("CCR_{$ccr->report_no}.pdf");
    }
}
