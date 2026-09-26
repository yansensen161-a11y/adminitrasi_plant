<?php

namespace App\Http\Controllers;

use App\Models\PartOrderLifetime;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PartOrderLifetimeController extends Controller
{
    /**
     * Dashboard: Part Order & Lifetime Monitoring
     */
    public function index(Request $request): Response
    {
        $query = PartOrderLifetime::with(['unit:id,code_unit,model,type_unit,hm', 'replacementOrder:id,no_order,status']);

        // Search & Filters
        if ($request->filled('unit')) {
            $unitSearch = trim($request->unit);
            $query->where(function ($q) use ($unitSearch) {
                $q->where('unit_code', 'LIKE', "%{$unitSearch}%")
                    ->orWhereHas('unit', function ($uq) use ($unitSearch) {
                        $uq->where('code_unit', 'LIKE', "%{$unitSearch}%")
                            ->orWhere('model', 'LIKE', "%{$unitSearch}%");
                    });
            });
        }

        if ($request->filled('part_number')) {
            $query->where('part_number', 'LIKE', '%'.trim($request->part_number).'%');
        }

        if ($request->filled('no_order')) {
            $query->where('no_order', 'LIKE', '%'.trim($request->no_order).'%');
        }

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        // Health Indicator filter
        if ($request->filled('indicator') && in_array($request->indicator, ['NORMAL', 'NEAR_LIFETIME', 'CRITICAL'])) {
            $targetIndicator = $request->indicator;
            $query->where('status', PartOrderLifetime::STATUS_INSTALLED);
            // We can filter in memory or via SQL expressions
        }

        // Sort
        $sortField = $request->input('sort', 'created_at');
        $sortDir = $request->input('direction', 'desc');
        if (in_array($sortField, ['created_at', 'order_date', 'installed_date', 'eta', 'status', 'unit_code', 'part_number', 'no_order'])) {
            $query->orderBy($sortField, $sortDir === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        // Get all unpaginated for metrics
        $allRecords = PartOrderLifetime::with('unit:id,code_unit,hm')->get();

        $activeOrdersCount = $allRecords->filter(fn ($r) => $r->is_active_order)->count();
        $waitingPartsCount = $allRecords->whereIn('status', [
            PartOrderLifetime::STATUS_ORDERED,
            PartOrderLifetime::STATUS_DELIVERY,
            PartOrderLifetime::STATUS_PO_PROCESS,
        ])->count();
        $nearLifetimeCount = $allRecords->filter(fn ($r) => $r->lifetime_status === 'NEAR_LIFETIME')->count();
        $overdueEtaCount = $allRecords->filter(fn ($r) => $r->is_overdue_eta)->count();
        $criticalPartsCount = $allRecords->filter(fn ($r) => $r->lifetime_status === 'CRITICAL')->count();
        $installedPartsCount = $allRecords->where('status', PartOrderLifetime::STATUS_INSTALLED)->count();

        // Paginate records
        $records = $query->paginate(25)->withQueryString();

        // Filter by indicator if requested
        if ($request->filled('indicator') && in_array($request->indicator, ['NORMAL', 'NEAR_LIFETIME', 'CRITICAL'])) {
            $filteredCollection = $records->getCollection()->filter(function ($item) use ($request) {
                return $item->lifetime_status === $request->indicator;
            });
            $records->setCollection($filteredCollection);
        }

        $units = Unit::select('id', 'code_unit', 'model', 'type_unit', 'hm')
            ->orderBy('code_unit')
            ->get();

        return Inertia::render('PartOrderLifetime/Index', [
            'records' => $records,
            'filters' => $request->only(['unit', 'part_number', 'no_order', 'status', 'indicator', 'sort', 'direction']),
            'metrics' => [
                'active_orders' => $activeOrdersCount,
                'waiting_parts' => $waitingPartsCount,
                'near_lifetime' => $nearLifetimeCount,
                'overdue_eta' => $overdueEtaCount,
                'critical_parts' => $criticalPartsCount,
                'installed_parts' => $installedPartsCount,
                'total_records' => $allRecords->count(),
            ],
            'statuses' => PartOrderLifetime::ALL_STATUSES,
            'units' => $units,
        ]);
    }

    /**
     * Check if a Unit + Part Number has active orders and fetch previous history
     * Used for double order warning when typing in Work Order Form & Part Order
     */
    public function checkActiveOrder(Request $request): JsonResponse
    {
        $request->validate([
            'part_number' => 'required|string',
            'unit_id' => 'nullable',
            'unit_code' => 'nullable|string',
            'current_order_id' => 'nullable',
            'current_record_id' => 'nullable',
        ]);

        $partNumber = strtoupper(trim($request->part_number));
        $unitId = $request->unit_id;
        $unitCode = $request->unit_code;

        if (! $unitCode && $unitId) {
            $u = Unit::find($unitId);
            $unitCode = $u?->code_unit;
        }

        $baseQuery = PartOrderLifetime::where('part_number', $partNumber);

        if ($unitId) {
            $baseQuery->where(function ($q) use ($unitId, $unitCode) {
                $q->where('unit_id', $unitId);
                if ($unitCode) {
                    $q->orWhere('unit_code', $unitCode);
                }
            });
        } elseif ($unitCode) {
            $baseQuery->where('unit_code', $unitCode);
        }

        if ($request->current_order_id) {
            $baseQuery->where('maintenance_order_id', '!=', $request->current_order_id);
        }

        if ($request->current_record_id) {
            $baseQuery->where('id', '!=', $request->current_record_id);
        }

        $allMatching = $baseQuery->with('unit:id,code_unit,hm')->latest('order_date')->get();

        $activeOrders = $allMatching->filter(fn ($r) => $r->is_active_order)->values();
        $installedPart = $allMatching->firstWhere('status', PartOrderLifetime::STATUS_INSTALLED);
        $avgActualLifetime = PartOrderLifetime::getAverageLifetime($partNumber, $unitId);

        return response()->json([
            'has_active_order' => $activeOrders->isNotEmpty(),
            'active_orders' => $activeOrders,
            'current_installed_part' => $installedPart,
            'recent_history' => $allMatching->take(5)->values(),
            'average_actual_lifetime' => $avgActualLifetime,
            'unit_code' => $unitCode,
            'part_number' => $partNumber,
        ]);
    }

    /**
     * Get full chronological timeline history for a specific Unit + Part Number
     */
    public function timeline(Request $request): JsonResponse
    {
        $request->validate([
            'part_number' => 'required|string',
            'unit_id' => 'nullable',
            'unit_code' => 'nullable|string',
        ]);

        $partNumber = strtoupper(trim($request->part_number));
        $unitId = $request->unit_id;
        $unitCode = $request->unit_code;

        if (! $unitCode && $unitId) {
            $u = Unit::find($unitId);
            $unitCode = $u?->code_unit;
        }

        $query = PartOrderLifetime::with(['unit:id,code_unit,hm,model', 'replacementOrder:id,no_order,status'])
            ->where('part_number', $partNumber);

        if ($unitId) {
            $query->where(function ($q) use ($unitId, $unitCode) {
                $q->where('unit_id', $unitId);
                if ($unitCode) {
                    $q->orWhere('unit_code', $unitCode);
                }
            });
        } elseif ($unitCode) {
            $query->where('unit_code', $unitCode);
        }

        $timeline = $query->orderBy('created_at', 'desc')->get();
        $avgActualLifetime = PartOrderLifetime::getAverageLifetime($partNumber, $unitId);
        $unit = $unitId ? Unit::find($unitId) : ($unitCode ? Unit::where('code_unit', $unitCode)->first() : null);

        return response()->json([
            'unit' => $unit,
            'part_number' => $partNumber,
            'part_name' => $timeline->first()?->part_name,
            'average_actual_lifetime' => $avgActualLifetime,
            'total_orders' => $timeline->count(),
            'timeline' => $timeline,
        ]);
    }

    /**
     * Store new Part Order
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'unit_id' => 'nullable|exists:units,id',
            'unit_code' => 'nullable|string',
            'part_number' => 'required|string|max:100',
            'part_name' => 'nullable|string|max:255',
            'no_order' => 'required|string|max:100',
            'qty' => 'required|integer|min:1',
            'order_date' => 'nullable|date',
            'eta' => 'nullable|date',
            'status' => 'required|in:'.implode(',', PartOrderLifetime::ALL_STATUSES),
            'expected_lifetime' => 'nullable|numeric|min:0',
            'installed_date' => 'nullable|date',
            'installed_hm' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $unit = null;
        if (! empty($validated['unit_id'])) {
            $unit = Unit::find($validated['unit_id']);
            $validated['unit_code'] = $unit?->code_unit ?? ($validated['unit_code'] ?? 'NON-UNIT');
        } elseif (empty($validated['unit_code'])) {
            $validated['unit_code'] = 'NON-UNIT';
        }

        $validated['part_number'] = strtoupper(trim($validated['part_number']));
        $validated['expected_lifetime'] = $validated['expected_lifetime'] ?? 5000.0;

        PartOrderLifetime::create($validated);

        return redirect()->back()->with('success', "Part Order {$validated['no_order']} ({$validated['part_number']}) berhasil ditambahkan.");
    }

    /**
     * Quick status update
     */
    public function updateStatus(Request $request, PartOrderLifetime $partOrderLifetime): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:'.implode(',', PartOrderLifetime::ALL_STATUSES),
        ]);

        $newStatus = $request->status;
        $updates = ['status' => $newStatus];

        if ($newStatus === PartOrderLifetime::STATUS_RECEIVED && ! $partOrderLifetime->received_date) {
            $updates['received_date'] = now()->toDateString();
        }

        $partOrderLifetime->update($updates);

        return redirect()->back()->with('success', "Status order {$partOrderLifetime->no_order} diubah menjadi {$newStatus}.");
    }

    /**
     * Record Part Installation
     */
    public function install(Request $request, PartOrderLifetime $partOrderLifetime): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'installed_date' => 'required|date',
            'installed_hm' => 'required|numeric|min:0',
            'expected_lifetime' => 'nullable|numeric|min:1',
            'remarks' => 'nullable|string',
        ]);

        $partOrderLifetime->update([
            'status' => PartOrderLifetime::STATUS_INSTALLED,
            'installed_date' => $validated['installed_date'],
            'installed_hm' => $validated['installed_hm'],
            'expected_lifetime' => $validated['expected_lifetime'] ?? $partOrderLifetime->expected_lifetime ?? 5000.0,
            'received_date' => $partOrderLifetime->received_date ?? $validated['installed_date'],
            'remarks' => $validated['remarks'] ?? $partOrderLifetime->remarks,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Part {$partOrderLifetime->part_number} berhasil dicatat TERPASANG pada HM {$validated['installed_hm']}.",
                'data' => $partOrderLifetime->fresh(),
            ]);
        }

        return redirect()->back()->with('success', "Part {$partOrderLifetime->part_number} berhasil dicatat TERPASANG pada HM {$validated['installed_hm']}.");
    }

    /**
     * Record Part Replacement & Archive Old Lifetime
     * "Jika part diganti, simpan lifetime part lama sebagai histori dan mulai lifetime baru untuk part/order pengganti."
     */
    public function replace(Request $request, PartOrderLifetime $partOrderLifetime): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'removed_date' => 'required|date',
            'removed_hm' => 'required|numeric|min:0',
            'failure_reason' => 'required|string',
            // Optional replacement part info
            'create_replacement' => 'nullable|boolean',
            'replacement_no_order' => 'nullable|string',
            'replacement_expected_lifetime' => 'nullable|numeric|min:1',
        ]);

        DB::transaction(function () use ($validated, $partOrderLifetime) {
            $installedHm = (float) ($partOrderLifetime->installed_hm ?? 0);
            $removedHm = (float) $validated['removed_hm'];
            $actualLife = max(0, round($removedHm - $installedHm, 1));

            // Archive old part
            $partOrderLifetime->update([
                'status' => PartOrderLifetime::STATUS_CLOSED,
                'removed_date' => $validated['removed_date'],
                'removed_hm' => $removedHm,
                'actual_lifetime' => $actualLife,
                'failure_reason' => $validated['failure_reason'],
            ]);

            // Create new replacement part record if requested
            if (! empty($validated['create_replacement'])) {
                $replacementOrder = PartOrderLifetime::create([
                    'unit_id' => $partOrderLifetime->unit_id,
                    'unit_code' => $partOrderLifetime->unit_code,
                    'part_number' => $partOrderLifetime->part_number,
                    'part_name' => $partOrderLifetime->part_name,
                    'no_order' => $validated['replacement_no_order'] ?: $partOrderLifetime->no_order.'-REP',
                    'qty' => $partOrderLifetime->qty,
                    'order_date' => $validated['removed_date'],
                    'installed_date' => $validated['removed_date'],
                    'installed_hm' => $removedHm,
                    'expected_lifetime' => $validated['replacement_expected_lifetime'] ?? $partOrderLifetime->expected_lifetime ?? 5000.0,
                    'status' => PartOrderLifetime::STATUS_INSTALLED,
                    'remarks' => 'Pengganti dari order '.$partOrderLifetime->no_order,
                ]);

                $partOrderLifetime->update(['replacement_order_id' => $replacementOrder->id]);
            }
        });

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Part {$partOrderLifetime->part_number} berhasil diganti. Lifetime lama telah disimpan sebagai histori.",
                'data' => $partOrderLifetime->fresh(),
            ]);
        }

        return redirect()->back()->with('success', "Part {$partOrderLifetime->part_number} berhasil diganti. Lifetime lama telah disimpan sebagai histori.");
    }

    /**
     * Update full details
     */
    public function update(Request $request, PartOrderLifetime $partOrderLifetime): RedirectResponse
    {
        $validated = $request->validate([
            'unit_id' => 'nullable|exists:units,id',
            'unit_code' => 'nullable|string',
            'part_number' => 'required|string|max:100',
            'part_name' => 'nullable|string|max:255',
            'no_order' => 'required|string|max:100',
            'qty' => 'required|integer|min:1',
            'order_date' => 'nullable|date',
            'eta' => 'nullable|date',
            'received_date' => 'nullable|date',
            'installed_date' => 'nullable|date',
            'installed_hm' => 'nullable|numeric|min:0',
            'removed_date' => 'nullable|date',
            'removed_hm' => 'nullable|numeric|min:0',
            'expected_lifetime' => 'nullable|numeric|min:0',
            'actual_lifetime' => 'nullable|numeric|min:0',
            'failure_reason' => 'nullable|string',
            'status' => 'required|in:'.implode(',', PartOrderLifetime::ALL_STATUSES),
            'remarks' => 'nullable|string',
        ]);

        if (! empty($validated['unit_id'])) {
            $unit = Unit::find($validated['unit_id']);
            $validated['unit_code'] = $unit?->code_unit ?? ($validated['unit_code'] ?? $partOrderLifetime->unit_code);
        }

        $validated['part_number'] = strtoupper(trim($validated['part_number']));

        // Recalculate actual lifetime if removed_hm is filled
        if (! empty($validated['removed_hm']) && ! empty($validated['installed_hm'])) {
            $validated['actual_lifetime'] = max(0, (float) $validated['removed_hm'] - (float) $validated['installed_hm']);
        }

        $partOrderLifetime->update($validated);

        return redirect()->back()->with('success', "Data Part Order {$partOrderLifetime->no_order} ({$partOrderLifetime->part_number}) berhasil diperbarui.");
    }

    /**
     * Delete record
     */
    public function destroy(PartOrderLifetime $partOrderLifetime): RedirectResponse
    {
        $noOrder = $partOrderLifetime->no_order;
        $partNumber = $partOrderLifetime->part_number;
        $partOrderLifetime->delete();

        return redirect()->back()->with('success', "Part Order {$noOrder} ({$partNumber}) berhasil dihapus.");
    }
}
