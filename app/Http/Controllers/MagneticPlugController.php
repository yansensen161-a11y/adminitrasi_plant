<?php

namespace App\Http\Controllers;

use App\Models\MagneticPlug;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MagneticPlugController extends Controller
{
    public function index(Request $request)
    {
        $codeUnitFilter = $request->input('codeUnitFilter');
        $metodeFilter = $request->input('metodeFilter');
        $componentFilter = $request->input('componentFilter');
        $ratingFilter = $request->input('ratingFilter');
        $dateFrom = $request->input('dateFrom');
        $dateTo = $request->input('dateTo');

        $query = MagneticPlug::with('unit')->orderBy('date', 'desc');

        if ($codeUnitFilter) {
            $query->whereHas('unit', function ($q) use ($codeUnitFilter) {
                $q->where('code_unit', $codeUnitFilter);
            });
        }
        if ($metodeFilter) {
            $query->where('metode_filter', $metodeFilter);
        }
        if ($componentFilter) {
            $query->where('component', $componentFilter);
        }
        if ($ratingFilter) {
            $query->where('rating', $ratingFilter);
        }
        if ($dateFrom) {
            $query->whereDate('date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('date', '<=', $dateTo);
        }

        $data = $query->paginate(10)->withQueryString();

        // Calculate KPI stats based on filtered query or overall? Let's use overall for simplicity for now.
        $totalInspeksi = MagneticPlug::count();
        $ratingACount = MagneticPlug::where('rating', 'Rating A')->count();
        $ratingBCount = MagneticPlug::where('rating', 'Rating B')->count();
        $ratingCCount = MagneticPlug::where('rating', 'Rating C')->count();
        $ratingXCount = MagneticPlug::where('rating', 'Rating X')->count();

        // We will pass the paginated data
        return Inertia::render('Repair/MagneticPlug', [
            'data' => $data,
            'filters' => [
                'codeUnitFilter' => $codeUnitFilter,
                'metodeFilter' => $metodeFilter,
                'componentFilter' => $componentFilter,
                'ratingFilter' => $ratingFilter,
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
            ],
            'kpi' => [
                'totalInspeksi' => $totalInspeksi,
                'ratingACount' => $ratingACount,
                'ratingBCount' => $ratingBCount,
                'ratingCCount' => $ratingCCount,
                'ratingXCount' => $ratingXCount,
            ],
        ]);
    }

    public function create()
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $units = Unit::orderBy('code_unit', 'asc')->get();

        return Inertia::render('Repair/CreateMagneticPlug', [
            'units' => $units,
        ]);
    }

    public function store(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'hm' => 'required|numeric',
            'date' => 'required|date',
            'metode_filter' => 'required|string',
            'component' => 'required|string',
            'rating' => 'required|string',
            'remarks' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'return_to' => 'nullable|string',
        ]);

        $returnTo = $request->input('return_to');
        unset($validated['return_to']);

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('magnetic_plugs', 'public');
        }

        MagneticPlug::create($validated);

        if ($returnTo) {
            return redirect($returnTo)->with('success', 'Data Magnetic Plug berhasil ditambahkan untuk Work Order.');
        }

        return redirect()->route('repair.magnetic-plug')->with('success', 'Data Magnetic Plug berhasil ditambahkan.');
    }
}
