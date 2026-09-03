<?php

namespace App\Http\Controllers;

use App\Models\PartCanibal;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;

class PartCanibalController extends Controller
{
    public function index(Request $request)
    {
        $query = PartCanibal::with(['unit', 'dariUnit', 'parts'])->latest('tanggal');

        $stats = [
            'waiting_part' => PartCanibal::where('status', 'Waiting part')->count(),
            'part_ter_supply' => PartCanibal::where('status', 'Part ter supply')->count(),
            'done' => PartCanibal::where('status', 'Done Instal')->count(),
        ];

        // Fetch all
        $canibals = $query->get();

        $units = Unit::orderBy('code_unit')->get();

        return Inertia::render('PartCanibal/Index', [
            'canibals' => $canibals,
            'stats' => $stats,
            'units' => $units,
        ]);
    }

    public function store(Request $request)
    {
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
            'status' => 'required|in:Waiting part,Part ter supply,Done Instal',
            'parts' => 'required|array|min:1',
            'parts.*.part_name' => 'required|string|max:255',
            'parts.*.qty' => 'required|integer|min:1',
            'parts.*.description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $data = Arr::except($validated, ['parts', 'image']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('canibals', 'public');
        }

        $partCanibal = PartCanibal::create($data);

        foreach ($validated['parts'] as $part) {
            $partCanibal->parts()->create($part);
        }

        return redirect()->back()->with('success', 'Request Part Canibal berhasil ditambahkan');
    }
}
