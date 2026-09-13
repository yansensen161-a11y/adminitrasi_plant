<?php

namespace App\Http\Controllers;

use App\Models\Tyre;
use App\Models\TyreHistory;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TyreController extends Controller
{
    /** Wheel unit types */
    private const WHEEL_TYPES = [
        'DUMP TRUCK', 'HAULER', 'MAINHAUL', 'FUEL TRUCK', 'WATER TRUCK',
        'CRANE TRUCK', 'LUBECAR', 'MOTORGRADER', 'BIS', 'COMPACTOR',
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

        $tyres = $query->orderBy('condition')->orderBy('serial_number')->get();

        $wheelUnits = Unit::whereIn('type_unit', self::WHEEL_TYPES)
            ->orderBy('code_unit')
            ->get(['id', 'code_unit', 'type_unit', 'hm']);

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

    public function store(Request $request)
    {
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
        ]);

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
        ]);

        $tyre->update($data);

        return redirect()->back()->with('success', 'Tyre berhasil diupdate.');
    }

    public function destroy(Tyre $tyre)
    {
        $tyre->histories()->delete();
        $tyre->delete();

        return redirect()->back()->with('success', 'Tyre berhasil dihapus.');
    }

    public function rotate(Request $request, Tyre $tyre)
    {
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

    public function repair(Request $request, Tyre $tyre)
    {
        $data = $request->validate([
            'hm_at_event' => 'nullable|numeric',
            'event_date' => 'required|date',
            'notes' => 'nullable|string',
            'performed_by' => 'nullable|string',
        ]);

        $tyre->update(['condition' => 'REPAIR']);

        TyreHistory::create([
            'tyre_id' => $tyre->id,
            'unit_id' => $tyre->unit_id,
            'event_type' => 'REPAIR',
            'from_position' => $tyre->position,
            'hm_at_event' => $data['hm_at_event'],
            'event_date' => $data['event_date'],
            'performed_by' => $data['performed_by'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Tyre repair berhasil dicatat.');
    }

    public function scrap(Request $request, Tyre $tyre)
    {
        $data = $request->validate([
            'hm_at_event' => 'nullable|numeric',
            'event_date' => 'required|date',
            'notes' => 'nullable|string',
            'performed_by' => 'nullable|string',
        ]);

        // Finalize total_hm
        if ($tyre->installed_hm && $data['hm_at_event']) {
            $tyre->total_hm += max(0, $data['hm_at_event'] - $tyre->installed_hm);
        }

        $tyre->update([
            'condition' => 'SCRAP',
            'unit_id' => null,
            'position' => null,
            'total_hm' => $tyre->total_hm,
        ]);

        TyreHistory::create([
            'tyre_id' => $tyre->id,
            'unit_id' => $tyre->unit_id,
            'event_type' => 'SCRAP',
            'from_position' => $tyre->position,
            'hm_at_event' => $data['hm_at_event'],
            'event_date' => $data['event_date'],
            'performed_by' => $data['performed_by'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Tyre scrap berhasil dicatat.');
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
