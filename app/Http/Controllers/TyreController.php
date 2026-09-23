<?php

namespace App\Http\Controllers;

use App\Models\Tyre;
use App\Models\TyreHistory;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TyreController extends Controller
{
    /** Wheel unit types */
    private const WHEEL_TYPES = [
        'DUMP TRUCK', 'HAULER', 'HAULER TRUCK', 'MAINHAUL', 'FUEL TRUCK', 'WATER TRUCK',
        'CRANE TRUCK', 'CRANE TRUCK & LOWBOY', 'LUBECAR', 'SERVICE TRUCK', 'MOTORGRADER',
        'MOTOR GRADER', 'BIS', 'SARANA BUS', 'COMPACTOR', 'LIGHT VEHICLE',
    ];

    public function index(Request $request)
    {
        $query = Tyre::with(['unit', 'latestHistory']);

        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }
        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }
        if ($request->filled('brand')) {
            $query->where('brand', 'like', '%'.$request->brand.'%');
        }
        if ($request->filled('search')) {
            $query->where('serial_number', 'like', '%'.$request->search.'%');
        }

        $tyres = $query->orderBy('unit_id')->orderBy('position')->orderBy('serial_number')->get();

        $wheelUnits = Unit::whereIn('type_unit', self::WHEEL_TYPES)
            ->orderBy('code_unit')
            ->get(['id', 'code_unit', 'type_unit', 'model', 'hm']);

        // Stats
        $stats = [
            'total' => Tyre::count(),
            'active' => Tyre::where('condition', 'ACTIVE')->count(),
            'repair' => Tyre::where('condition', 'REPAIR')->count(),
            'scrap' => Tyre::where('condition', 'SCRAP')->count(),
            'stock' => Tyre::where('condition', 'STOCK')->count(),
        ];

        // Per-unit tyre map for 3D visual
        $unitTyreMap = [];
        foreach ($wheelUnits as $unit) {
            $unitTyres = $tyres->where('unit_id', $unit->id)->keyBy('position');
            $unitTyreMap[$unit->id] = $unitTyres;
        }

        $brands = Tyre::select('brand')->distinct()->pluck('brand');

        return Inertia::render('Tyre/Index', [
            'tyres' => $tyres,
            'wheelUnits' => $wheelUnits,
            'unitTyreMap' => $unitTyreMap,
            'stats' => $stats,
            'brands' => $brands,
            'filters' => $request->only(['unit_id', 'condition', 'brand', 'search']),
        ]);
    }

    public function create()
    {
        return redirect()->route('tyres.index', ['action' => 'create']);
    }

    public function edit(Tyre $tyre)
    {
        return redirect()->route('tyres.index', ['edit' => $tyre->id]);
    }

    public function bulkStore(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner', 'tyre-man']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'unit_id' => 'nullable|exists:units,id',
            'tyres' => 'required|array|min:1',
            'tyres.*.serial_number' => 'required|string|distinct|unique:tyres,serial_number',
            'tyres.*.brand' => 'required|string',
            'tyres.*.type_size' => 'nullable|string',
            'tyres.*.condition' => 'required|in:ACTIVE,REPAIR,SCRAP,STOCK',
            'tyres.*.purchase_date' => 'nullable|date',
            'tyres.*.purchase_price' => 'nullable|numeric',
            'tyres.*.unit_id' => 'nullable|exists:units,id',
            'tyres.*.position' => 'nullable|string',
            'tyres.*.installed_hm' => 'nullable|numeric',
            'tyres.*.total_hm' => 'nullable|numeric',
            'tyres.*.pattern' => 'nullable|string',
            'tyres.*.psi' => 'nullable|integer',
            'tyres.*.plan_rotary_target' => 'nullable|numeric',
            'tyres.*.otd' => 'nullable|string',
            'tyres.*.rtd' => 'nullable|string',
            'tyres.*.notes' => 'nullable|string',
        ]);

        $createdCount = 0;

        DB::transaction(function () use ($validated, &$createdCount) {
            foreach ($validated['tyres'] as $item) {
                $unitId = $item['unit_id'] ?? $validated['unit_id'] ?? null;
                $position = $item['position'] ?? null;
                $condition = $item['condition'] ?? 'ACTIVE';

                if ($condition === 'ACTIVE' && $unitId && $position) {
                    // Check if existing tyre is on this slot
                    $existingTyre = Tyre::where('unit_id', $unitId)
                        ->where('position', $position)
                        ->where('condition', 'ACTIVE')
                        ->first();

                    if ($existingTyre) {
                        $existingTyre->update([
                            'condition' => 'STOCK',
                            'unit_id' => null,
                            'position' => null,
                        ]);

                        TyreHistory::create([
                            'tyre_id' => $existingTyre->id,
                            'unit_id' => $unitId,
                            'event_type' => 'REMOVE',
                            'from_position' => $position,
                            'hm_at_event' => $item['installed_hm'] ?? 0,
                            'event_date' => $item['purchase_date'] ?? now()->toDateString(),
                            'notes' => 'Digantikan oleh registrasi tyre baru '.$item['serial_number'],
                        ]);
                    }
                }

                $item['unit_id'] = ($condition === 'ACTIVE') ? $unitId : null;
                $item['position'] = ($condition === 'ACTIVE') ? $position : null;
                $item['condition'] = $condition;
                $item['installed_hm'] = $item['installed_hm'] ?? 0;
                $item['total_hm'] = $item['total_hm'] ?? 0;
                $item['installed_km'] = $item['installed_km'] ?? 0;
                $item['total_km'] = $item['total_km'] ?? 0;
                $item['plan_rotary_target'] = $item['plan_rotary_target'] ?? 3000;

                $tyre = Tyre::create($item);
                $createdCount++;

                if ($tyre->unit_id && $tyre->condition === 'ACTIVE') {
                    TyreHistory::create([
                        'tyre_id' => $tyre->id,
                        'unit_id' => $tyre->unit_id,
                        'event_type' => 'INSTALL',
                        'to_position' => $tyre->position,
                        'hm_at_event' => $tyre->installed_hm ?? 0,
                        'event_date' => $tyre->purchase_date ?? now()->toDateString(),
                        'notes' => 'Registrasi dan instalasi awal (batch)',
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', "Berhasil mendaftarkan $createdCount tyre sekaligus.");
    }

    public function store(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner', 'tyre-man']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $data = $request->validate([
            'serial_number' => 'required|string|unique:tyres,serial_number',
            'brand' => 'required|string',
            'type_size' => 'nullable|string',
            'condition' => 'required|in:ACTIVE,REPAIR,SCRAP,STOCK',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric',
            'unit_id' => 'nullable|exists:units,id',
            'position' => 'nullable|string',
            'installed_hm' => 'nullable|numeric',
            'total_hm' => 'nullable|numeric',
            'tread_depth_new' => 'nullable|string',
            'notes' => 'nullable|string',
            'pattern' => 'nullable|string',
            'psi' => 'nullable|integer',
            'plan_rotary_target' => 'nullable|numeric',
            'otd' => 'nullable|string',
            'rtd' => 'nullable|string',
        ]);

        $data['installed_hm'] = $data['installed_hm'] ?? 0;
        $data['total_hm'] = $data['total_hm'] ?? 0;
        $data['installed_km'] = $data['installed_km'] ?? 0;
        $data['total_km'] = $data['total_km'] ?? 0;
        $data['plan_rotary_target'] = $data['plan_rotary_target'] ?? 3000;

        $tyre = Tyre::create($data);

        // Log install event
        if ($tyre->unit_id) {
            TyreHistory::create([
                'tyre_id' => $tyre->id,
                'unit_id' => $tyre->unit_id,
                'event_type' => 'INSTALL',
                'to_position' => $tyre->position,
                'hm_at_event' => $tyre->installed_hm,
                'event_date' => $tyre->purchase_date ?? now()->toDateString(),
                'notes' => 'Initial install',
            ]);
        }

        return redirect()->back()->with('success', 'Tyre berhasil ditambahkan.');
    }

    public function update(Request $request, Tyre $tyre)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner', 'tyre-man']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $data = $request->validate([
            'serial_number' => 'required|string|unique:tyres,serial_number,'.$tyre->id,
            'brand' => 'required|string',
            'type_size' => 'nullable|string',
            'condition' => 'required|in:ACTIVE,REPAIR,SCRAP,STOCK',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric',
            'unit_id' => 'nullable|exists:units,id',
            'position' => 'nullable|string',
            'installed_hm' => 'nullable|numeric',
            'total_hm' => 'nullable|numeric',
            'tread_depth_new' => 'nullable|string',
            'tread_depth_current' => 'nullable|string',
            'notes' => 'nullable|string',
            'pattern' => 'nullable|string',
            'psi' => 'nullable|integer',
            'plan_rotary_target' => 'nullable|numeric',
            'otd' => 'nullable|string',
            'rtd' => 'nullable|string',
        ]);

        $tyre->update($data);

        return redirect()->back()->with('success', 'Tyre berhasil diupdate.');
    }

    public function destroy(Tyre $tyre)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menghapus tyre.');

        $tyre->histories()->delete();
        $tyre->delete();

        return redirect()->back()->with('success', 'Tyre berhasil dihapus.');
    }

    public function rotate(Request $request, Tyre $tyre)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner', 'tyre-man']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $data = $request->validate([
            'to_position' => 'required|string',
            'to_unit_id' => 'nullable|exists:units,id',
            'hm_at_event' => 'nullable|numeric',
            'event_date' => 'required|date',
            'notes' => 'nullable|string',
            'performed_by' => 'nullable|string',
        ]);

        $fromPosition = $tyre->position;
        $fromUnitId = $tyre->unit_id;

        // Calculate accumulated HM
        if ($tyre->installed_hm && $data['hm_at_event']) {
            $tyre->total_hm += max(0, $data['hm_at_event'] - $tyre->installed_hm);
        }

        $tyre->update([
            'position' => $data['to_position'],
            'unit_id' => $data['to_unit_id'] ?? $tyre->unit_id,
            'installed_hm' => $data['hm_at_event'] ?? $tyre->installed_hm,
            'total_hm' => $tyre->total_hm,
        ]);

        TyreHistory::create([
            'tyre_id' => $tyre->id,
            'unit_id' => $fromUnitId,
            'event_type' => 'ROTATE',
            'from_position' => $fromPosition,
            'to_position' => $data['to_position'],
            'hm_at_event' => $data['hm_at_event'],
            'event_date' => $data['event_date'],
            'performed_by' => $data['performed_by'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Rotasi tyre berhasil dicatat.');
    }

    public function remove(Request $request, Tyre $tyre)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner', 'tyre-man']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $data = $request->validate([
            'hm_at_event' => 'required|numeric',
            'event_date' => 'required|date',
            'reason' => 'required|in:REPAIR,STOCK,SCRAP',
            'notes' => 'nullable|string',
            'performed_by' => 'nullable|string',
        ]);

        if ($tyre->installed_hm && $data['hm_at_event']) {
            $tyre->total_hm += max(0, (float) $data['hm_at_event'] - (float) $tyre->installed_hm);
        }

        $fromPosition = $tyre->position;
        $unitId = $tyre->unit_id;

        $tyre->update([
            'condition' => $data['reason'],
            'unit_id' => null,
            'position' => null,
            'installed_hm' => 0,
            'total_hm' => $tyre->total_hm,
        ]);

        TyreHistory::create([
            'tyre_id' => $tyre->id,
            'unit_id' => $unitId,
            'event_type' => $data['reason'] === 'STOCK' ? 'REMOVE' : $data['reason'],
            'from_position' => $fromPosition,
            'hm_at_event' => $data['hm_at_event'],
            'event_date' => $data['event_date'],
            'performed_by' => $data['performed_by'],
            'notes' => $data['notes'],
        ]);

        return redirect()->back()->with('success', 'Tyre successfully removed.');
    }

    public function install(Request $request, Tyre $tyre)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner', 'tyre-man']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $data = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'position' => 'required|string',
            'hm_at_event' => 'required|numeric',
            'event_date' => 'required|date',
            'notes' => 'nullable|string',
            'performed_by' => 'nullable|string',
        ]);

        $tyre->update([
            'condition' => 'ACTIVE',
            'unit_id' => $data['unit_id'],
            'position' => $data['position'],
            'installed_hm' => $data['hm_at_event'],
        ]);

        TyreHistory::create([
            'tyre_id' => $tyre->id,
            'unit_id' => $data['unit_id'],
            'event_type' => 'INSTALL',
            'to_position' => $data['position'],
            'hm_at_event' => $data['hm_at_event'],
            'event_date' => $data['event_date'],
            'performed_by' => $data['performed_by'],
            'notes' => $data['notes'],
        ]);

        return redirect()->back()->with('success', 'Tyre successfully installed.');
    }

    public function history(Tyre $tyre)
    {
        $tyre->load(['unit', 'histories.unit']);

        return Inertia::render('Tyre/History', [
            'tyre' => $tyre,
        ]);
    }

    /** API: List semua wheel units untuk dropdown 3D viewer */
    public function apiWheelUnits()
    {
        $units = Unit::whereIn('type_unit', self::WHEEL_TYPES)
            ->orderBy('code_unit')
            ->get(['id', 'code_unit', 'type_unit', 'hm']);

        return response()->json($units);
    }

    /** API: Semua tyre terpasang di unit tertentu beserta posisi & kondisi */
    public function apiUnitTyres(Unit $unit)
    {
        $tyres = Tyre::where('unit_id', $unit->id)
            ->get(['id', 'serial_number', 'brand', 'type_size', 'condition', 'position', 'installed_hm', 'total_hm', 'tread_depth_current', 'notes']);

        $stockTyres = Tyre::whereNull('unit_id')
            ->where('condition', 'STOCK')
            ->get(['id', 'serial_number', 'brand', 'type_size']);

        $map = [];
        foreach ($tyres as $t) {
            if ($t->position) {
                $currentHm = (float) $unit->hm;
                $lifetime = (float) $t->total_hm + max(0, $currentHm - (float) $t->installed_hm);
                $map[$t->position] = array_merge($t->toArray(), ['current_lifetime' => round($lifetime, 1)]);
            }
        }

        return response()->json([
            'unit' => $unit->only(['id', 'code_unit', 'type_unit', 'hm']),
            'tyres' => $map,
            'stock' => $stockTyres,
        ]);
    }

    /** API: Install tyre ke posisi langsung dari 3D viewer */
    public function apiInstall(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner', 'tyre-man']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $data = $request->validate([
            'tyre_id' => 'required|exists:tyres,id',
            'unit_id' => 'required|exists:units,id',
            'position' => 'required|string',
            'hm' => 'nullable|numeric',
            'date' => 'nullable|date',
        ]);

        // Lepas dari unit lama jika ada
        $tyre = Tyre::findOrFail($data['tyre_id']);
        $oldUnit = $tyre->unit_id;
        $oldPos = $tyre->position;

        if ($tyre->installed_hm && $data['hm']) {
            $tyre->total_hm += max(0, (float) $data['hm'] - (float) $tyre->installed_hm);
        }

        $tyre->update([
            'unit_id' => $data['unit_id'],
            'position' => $data['position'],
            'condition' => 'ACTIVE',
            'installed_hm' => $data['hm'] ?? $tyre->installed_hm,
            'total_hm' => $tyre->total_hm,
        ]);

        TyreHistory::create([
            'tyre_id' => $tyre->id,
            'unit_id' => $data['unit_id'],
            'event_type' => $oldUnit ? 'ROTATE' : 'INSTALL',
            'from_position' => $oldPos,
            'to_position' => $data['position'],
            'hm_at_event' => $data['hm'],
            'event_date' => $data['date'] ?? now()->toDateString(),
            'notes' => 'Installed via TireVault 3D',
        ]);

        return response()->json(['success' => true, 'tyre' => $tyre]);
    }
}
