<?php

namespace App\Http\Controllers;

use App\Models\Abr;
use App\Models\AbrItem;
use App\Models\AbrImage;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AbrController extends Controller
{
    public function index()
    {
        $abrs = Abr::with('unit')->orderBy('created_at', 'desc')->paginate(10);
        return Inertia::render('ABR/Index', [
            'abrs' => $abrs
        ]);
    }

    public function create()
    {
        $units = Unit::orderBy('code_unit', 'asc')->get();
        // Generate an auto number: PT-MAM/001/ABR/VII/2026
        $count = Abr::whereYear('created_at', date('Y'))->whereMonth('created_at', date('m'))->count() + 1;
        $romanMonth = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][date('n') - 1];
        $no_abr = sprintf('PT-MAM/%03d/ABR/%s/%s', $count, $romanMonth, date('Y'));

        return Inertia::render('ABR/Create', [
            'units' => $units,
            'no_abr' => $no_abr
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'no_abr' => 'required|unique:abrs,no_abr',
            'tanggal' => 'required|date',
            'unit_id' => 'required|exists:units,id',
            'items' => 'required|array',
        ]);

        DB::transaction(function () use ($request) {
            $abr = Abr::create([
                'no_abr' => $request->no_abr,
                'tanggal' => $request->tanggal,
                'unit_id' => $request->unit_id,
                'lokasi_site' => $request->lokasi_site,
                'lokasi_perbaikan' => $request->lokasi_perbaikan,
                'hm' => $request->hm,
                'inspected_by' => $request->inspected_by,
                'incident_description' => $request->incident_description,
                'total_biaya' => $request->total_biaya ?? 0,
                'tax_amount' => $request->tax_amount ?? 0,
                'grand_total' => $request->grand_total ?? 0,
                'dibuat_oleh' => $request->dibuat_oleh,
                'dibuat_jabatan' => $request->dibuat_jabatan,
                'checked_by' => $request->checked_by,
                'checked_jabatan' => $request->checked_jabatan,
                'disetujui_oleh' => $request->disetujui_oleh,
                'disetujui_jabatan' => $request->disetujui_jabatan,
                'diketahui_oleh' => $request->diketahui_oleh,
                'diketahui_jabatan' => $request->diketahui_jabatan,
                'status' => $request->status ?? 'Open',
            ]);

            foreach ($request->items as $item) {
                AbrItem::create([
                    'abr_id' => $abr->id,
                    'category' => $item['category'],
                    'part_number' => $item['part_number'] ?? null,
                    'description' => $item['description'],
                    'price' => $item['price'] ?? 0,
                    'qty' => $item['qty'] ?? 1,
                    'satuan' => $item['satuan'] ?? null,
                    'hour' => $item['hour'] ?? null,
                    'mp' => $item['mp'] ?? null,
                    'amount' => $item['amount'] ?? 0,
                ]);
            }

            // Handle images (assuming base64 or file uploads handled separately, for simplicity skipping complex file upload in this snippet, assuming paths are passed if handled via separate endpoint, or we handle files here)
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    $path = $file->store('abr_images', 'public');
                    AbrImage::create([
                        'abr_id' => $abr->id,
                        'file_path' => '/storage/' . $path,
                    ]);
                }
            }
        });

        return redirect()->route('abr.index')->with('success', 'Data ABR Baru Berhasil Disimpan!');
    }

    public function show(Abr $abr)
    {
        $abr->load(['unit', 'items', 'images']);
        return Inertia::render('ABR/Print', [
            'abr' => $abr
        ]);
    }
    
    public function edit(Abr $abr)
    {
        $abr->load(['unit', 'items', 'images']);
        $units = Unit::orderBy('code_unit', 'asc')->get();
        
        return Inertia::render('ABR/Edit', [
            'abr' => $abr,
            'units' => $units
        ]);
    }

    public function update(Request $request, Abr $abr)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'unit_id' => 'required|exists:units,id',
            'items' => 'required|array',
        ]);

        DB::transaction(function () use ($request, $abr) {
            $abr->update([
                'tanggal' => $request->tanggal,
                'unit_id' => $request->unit_id,
                'lokasi_site' => $request->lokasi_site,
                'lokasi_perbaikan' => $request->lokasi_perbaikan,
                'hm' => $request->hm,
                'inspected_by' => $request->inspected_by,
                'incident_description' => $request->incident_description,
                'total_biaya' => $request->total_biaya ?? 0,
                'tax_amount' => $request->tax_amount ?? 0,
                'grand_total' => $request->grand_total ?? 0,
                'dibuat_oleh' => $request->dibuat_oleh,
                'dibuat_jabatan' => $request->dibuat_jabatan,
                'checked_by' => $request->checked_by,
                'checked_jabatan' => $request->checked_jabatan,
                'disetujui_oleh' => $request->disetujui_oleh,
                'disetujui_jabatan' => $request->disetujui_jabatan,
                'diketahui_oleh' => $request->diketahui_oleh,
                'diketahui_jabatan' => $request->diketahui_jabatan,
                'status' => $request->status ?? 'Open',
            ]);

            // Recreate items for simplicity
            $abr->items()->delete();
            foreach ($request->items as $item) {
                AbrItem::create([
                    'abr_id' => $abr->id,
                    'category' => $item['category'],
                    'part_number' => $item['part_number'] ?? null,
                    'description' => $item['description'],
                    'price' => $item['price'] ?? 0,
                    'qty' => $item['qty'] ?? 1,
                    'satuan' => $item['satuan'] ?? null,
                    'hour' => $item['hour'] ?? null,
                    'mp' => $item['mp'] ?? null,
                    'amount' => $item['amount'] ?? 0,
                ]);
            }
        });

        return redirect()->route('abr.index')->with('success', 'Data ABR Berhasil Diperbarui!');
    }

    public function destroy(Abr $abr)
    {
        $abr->delete();
        return redirect()->route('abr.index')->with('success', 'Data ABR Berhasil Dihapus!');
    }
}
