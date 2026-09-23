<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceOrder;
use App\Models\MaintenanceOrderPart;
use App\Models\PartCanibal;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PartCanibalController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->input('date_from', '');
        $dateTo = $request->input('date_to', '');
        $statusFilter = $request->input('status', '');
        $unitFilter = $request->input('unit', '');

        $units = Unit::select('id', 'code_unit', 'type_unit')->orderBy('code_unit')->get();

        $canibalsQuery = PartCanibal::with(['unit', 'dariUnit', 'parts', 'maintenanceOrder'])->latest('tanggal');

        if ($dateFrom) {
            $canibalsQuery->whereDate('tanggal', '>=', $dateFrom);
        }
        if ($dateTo) {
            $canibalsQuery->whereDate('tanggal', '<=', $dateTo);
        }
        if ($statusFilter) {
            $canibalsQuery->where('status', $statusFilter);
        }
        if ($unitFilter) {
            $canibalsQuery->where('unit_id', $unitFilter);
        }
        $canibalsList = $canibalsQuery->get()->map(function ($item) {
            $data = $item->toArray();
            $data['is_readonly'] = false;

            return $data;
        });

        $moParts = MaintenanceOrderPart::with(['order.unit', 'swapToUnit'])
            ->whereNotNull('swap_to_unit_id')
            ->get()
            ->map(function ($part) {
                return [
                    'id' => 'mo_'.$part->id,
                    'tanggal' => $part->order ? $part->order->tanggal : null,
                    'unit_id' => $part->order ? $part->order->unit_id : null,
                    'unit' => $part->order ? $part->order->unit : null,
                    'hm' => $part->order ? $part->order->hm : null,
                    'dari_unit_id' => $part->swap_to_unit_id,
                    'dari_unit' => $part->swapToUnit,
                    'remark' => $part->remark_part_swap ?: 'Dari Monitoring Order List',
                    'no_order' => $part->order ? $part->order->no_order : null,
                    'pr' => $part->pr,
                    'po' => $part->po,
                    'eta_part' => $part->due_date_part,
                    'status' => ($part->order && $part->order->status == 'Close') ? 'USED' : 'AVAILABLE',
                    'parts' => [
                        [
                            'part_name' => $part->part_number,
                            'qty' => $part->qty,
                            'description' => $part->department,
                            'life_time' => null,
                            'component' => $part->component,
                        ],
                    ],
                    'is_readonly' => true,
                ];
            });

        $canibals = collect($canibalsList)->concat($moParts)->sortByDesc('tanggal')->values();

        $canibalStats = [
            'total' => $canibals->count(),
            'available' => $canibals->where('status', 'AVAILABLE')->count(),
            'used' => $canibals->where('status', 'USED')->count(),
            'unavailable' => $canibals->where('status', 'UNAVAILABLE')->count(),
        ];

        return Inertia::render('PartCanibal/Index', [
            'canibals' => $canibals,
            'stats' => $canibalStats,
            'units' => $units,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'status' => $statusFilter,
                'unit' => $unitFilter,
            ],
        ]);
    }

    public function store(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'unit_id' => 'required|exists:units,id',
            'hm' => 'nullable|string|max:255',
            'dari_unit_id' => 'required|exists:units,id',
            'remark' => 'nullable|string',
            'no_order' => 'nullable|string|max:255',
            'pr' => 'nullable|string|max:255',
            'po' => 'nullable|string|max:255',
            'eta_part' => 'nullable|date',
            'status' => 'required|in:WAITING MANPOWER,IN PROGRES,COMPLETED,CANCELLED / ON HOLD',
            'parts' => 'required|array|min:1',
            'parts.*.part_name' => 'required|string|max:255',
            'parts.*.qty' => 'required|integer|min:1',
            'parts.*.description' => 'nullable|string',
            'parts.*.life_time' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $data = Arr::except($validated, ['parts', 'image']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('canibals', 'public');
        }

        $wo = MaintenanceOrder::create([
            'wo_type' => 'Part Canibal',
            'no_order' => 'PC-'.now()->format('YmdHis').'-'.rand(100, 999),
            'tanggal' => $data['tanggal'],
            'unit_id' => $data['unit_id'],
            'hm' => $data['hm'],
            'priority' => 'High',
            'status' => 'OPEN',
            'action_taken' => 'Part Canibal Request '.($data['remark'] ?? ''),
        ]);

        $data['maintenance_order_id'] = $wo->id;

        $partCanibal = PartCanibal::create($data);

        foreach ($validated['parts'] as $part) {
            $partCanibal->parts()->create($part);
        }

        return redirect()->back()->with('success', 'Request Part Canibal berhasil ditambahkan');
    }

    public function update(Request $request, PartCanibal $partCanibal)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'unit_id' => 'required|exists:units,id',
            'hm' => 'nullable|string|max:255',
            'dari_unit_id' => 'required|exists:units,id',
            'remark' => 'nullable|string',
            'no_order' => 'nullable|string|max:255',
            'pr' => 'nullable|string|max:255',
            'po' => 'nullable|string|max:255',
            'eta_part' => 'nullable|date',
            'status' => 'required|in:WAITING MANPOWER,IN PROGRES,COMPLETED,CANCELLED / ON HOLD,AVAILABLE,USED,UNAVAILABLE',
            'parts' => 'required|array|min:1',
            'parts.*.part_name' => 'required|string|max:255',
            'parts.*.qty' => 'required|integer|min:1',
            'parts.*.description' => 'nullable|string',
            'parts.*.life_time' => 'nullable|string',
            'parts.*.component' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $data = Arr::except($validated, ['parts', 'image']);

        if ($request->hasFile('image')) {
            if ($partCanibal->image) {
                Storage::disk('public')->delete($partCanibal->image);
            }
            $data['image'] = $request->file('image')->store('canibals', 'public');
        }

        $partCanibal->update($data);

        if ($partCanibal->maintenance_order_id) {
            MaintenanceOrder::where('id', $partCanibal->maintenance_order_id)->update([
                'tanggal' => $data['tanggal'],
                'unit_id' => $data['unit_id'],
                'hm' => $data['hm'],
                'status' => in_array($data['status'], ['COMPLETED', 'CANCELLED / ON HOLD']) ? 'CLOSED' : 'OPEN',
                'action_taken' => 'Part Canibal Update '.($data['remark'] ?? ''),
            ]);
        }

        $partCanibal->parts()->delete();
        foreach ($validated['parts'] as $part) {
            $partCanibal->parts()->create($part);
        }

        return redirect()->back()->with('success', 'Request Part Canibal berhasil diperbarui');
    }

    public function destroy(PartCanibal $partCanibal)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        if ($partCanibal->image) {
            Storage::disk('public')->delete($partCanibal->image);
        }
        $partCanibal->parts()->delete();

        $woId = $partCanibal->maintenance_order_id;
        $partCanibal->delete();

        if ($woId) {
            MaintenanceOrder::where('id', $woId)->delete();
        }

        return redirect()->back()->with('success', 'Request Part Canibal berhasil dihapus');
    }

    public function updateStatus(Request $request, PartCanibal $partCanibal)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'status' => 'required|in:WAITING MANPOWER,IN PROGRES,COMPLETED,CANCELLED / ON HOLD,AVAILABLE,USED,UNAVAILABLE',
        ]);

        $partCanibal->update(['status' => $validated['status']]);

        if ($partCanibal->maintenance_order_id) {
            MaintenanceOrder::where('id', $partCanibal->maintenance_order_id)->update([
                'status' => in_array($validated['status'], ['COMPLETED', 'CANCELLED / ON HOLD']) ? 'CLOSED' : 'OPEN',
            ]);
        }

        return response()->json(['message' => 'Status updated successfully', 'status' => $partCanibal->status]);
    }
}
