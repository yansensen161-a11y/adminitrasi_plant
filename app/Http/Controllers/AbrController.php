<?php

namespace App\Http\Controllers;

use App\Models\Abr;
use App\Models\AbrImage;
use App\Models\AbrItem;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AbrController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->input('date_from', '');
        $dateTo = $request->input('date_to', '');
        $codeUnit = $request->input('code_unit', '');
        $kategori = $request->input('kategori', '');

        $query = Abr::with(['unit', 'items'])->orderBy('tanggal', 'desc');

        if ($dateFrom) {
            $query->whereDate('tanggal', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('tanggal', '<=', $dateTo);
        }
        if ($codeUnit) {
            $query->whereHas('unit', function ($q) use ($codeUnit) {
                $q->where('code_unit', 'like', "%{$codeUnit}%");
            });
        }
        if ($kategori) {
            $query->whereHas('items', function ($q) use ($kategori) {
                $q->where('category', 'like', "%{$kategori}%");
            });
        }

        $allFilteredAbrs = $query->get();

        $total_biaya = $allFilteredAbrs->sum('grand_total');
        $jumlah_repair = $allFilteredAbrs->count();
        $rata_rata_biaya = $jumlah_repair > 0 ? $total_biaya / $jumlah_repair : 0;

        // Simple trend calculation vs previous month
        $currentMonth = now()->startOfMonth();
        $prevMonth = now()->subMonth()->startOfMonth();
        $currentMonthTotal = Abr::whereMonth('tanggal', $currentMonth->month)->whereYear('tanggal', $currentMonth->year)->sum('grand_total');
        $prevMonthTotal = Abr::whereMonth('tanggal', $prevMonth->month)->whereYear('tanggal', $prevMonth->year)->sum('grand_total');

        if ($prevMonthTotal > 0) {
            $trend = (($currentMonthTotal - $prevMonthTotal) / $prevMonthTotal) * 100;
            $trend_pct = ($trend > 0 ? '+' : '').number_format($trend, 1).'%';
        } else {
            $trend_pct = '+0%';
        }

        $stats = [
            'total_biaya' => $total_biaya,
            'periode' => now()->translatedFormat('M Y'),
            'jumlah_repair' => $jumlah_repair,
            'rata_rata_biaya' => $rata_rata_biaya,
            'trend_pct' => $trend_pct,
        ];

        // Chart Biaya Per Unit (Top 5 + Others)
        $unitBiaya = [];
        foreach ($allFilteredAbrs as $abr) {
            $type = ($abr->unit && ! empty($abr->unit->type_unit)) ? $abr->unit->type_unit : 'Lainnya';
            $unitBiaya[$type] = ($unitBiaya[$type] ?? 0) + $abr->grand_total;
        }
        arsort($unitBiaya);
        $colors = ['#1d4ed8', '#10b981', '#facc15', '#ef4444', '#6b7280', '#9ca3af'];
        $chartBiayaPerUnit = [];
        $i = 0;
        $others = 0;
        foreach ($unitBiaya as $name => $value) {
            if ($i < 5) {
                $chartBiayaPerUnit[] = [
                    'name' => $name,
                    'value' => $value,
                    'label' => number_format($value / 1000000, 0).'M',
                    'color' => $colors[$i],
                ];
            } else {
                $others += $value;
            }
            $i++;
        }
        if ($others > 0) {
            $chartBiayaPerUnit[] = [
                'name' => 'Others',
                'value' => $others,
                'label' => number_format($others / 1000000, 0).'M',
                'color' => $colors[5],
            ];
        }

        // Chart Biaya Per Kategori
        $kategoriBiaya = [];
        $totalItemsBiaya = 0;
        foreach ($allFilteredAbrs as $abr) {
            foreach ($abr->items as $item) {
                $cat = ucfirst($item->category);
                $kategoriBiaya[$cat] = ($kategoriBiaya[$cat] ?? 0) + $item->amount;
                $totalItemsBiaya += $item->amount;
            }
        }
        arsort($kategoriBiaya);
        $chartBiayaPerKategori = [];
        $i = 0;
        foreach ($kategoriBiaya as $name => $val) {
            $pct = $totalItemsBiaya > 0 ? ($val / $totalItemsBiaya) * 100 : 0;
            $chartBiayaPerKategori[] = [
                'name' => $name,
                'value' => round($pct, 1),
                'color' => $colors[$i % count($colors)],
            ];
            $i++;
        }

        // Chart Trend Biaya (Last 6 Months)
        $chartTrendBiaya = [];
        for ($m = 5; $m >= 0; $m--) {
            $d = now()->subMonths($m);
            $val = Abr::whereMonth('tanggal', $d->month)->whereYear('tanggal', $d->year)->sum('grand_total');
            $chartTrendBiaya[] = [
                'month' => $d->translatedFormat('M Y'),
                'value' => (float) $val,
                'label' => number_format($val / 1000000, 0).'M',
            ];
        }

        $paginatedAbrs = $query->paginate(10);
        $items = collect($paginatedAbrs->items())->map(function ($abr) {
            $biaya_part = $abr->items->where('category', 'sparepart')->sum('amount');
            $biaya_jasa = $abr->items->whereIn('category', ['repair', 'manpower'])->sum('amount');

            return [
                'id' => $abr->id,
                'tanggal' => Carbon::parse($abr->tanggal)->format('d/m/Y'),
                'code_unit' => $abr->unit ? $abr->unit->code_unit : $abr->manual_unit_code,
                'equipment' => $abr->unit ? $abr->unit->type_unit : '-',
                'model' => $abr->unit ? $abr->unit->model : $abr->manual_unit_model,
                'deskripsi' => $abr->incident_description,
                'kategori' => $abr->items->pluck('category')->map(fn ($c) => ucfirst($c))->unique()->implode(', '),
                'part_number' => $abr->items->pluck('part_number')->filter()->unique()->implode(', '),
                'qty' => $abr->items->sum('qty'),
                'biaya_part' => (float) $biaya_part,
                'biaya_jasa' => (float) $biaya_jasa,
                'total_biaya' => (float) $abr->grand_total,
                'status' => $abr->status,
            ];
        })->values()->toArray();

        return Inertia::render('ABR/Index', [
            'stats' => $stats,
            'chartBiayaPerUnit' => $chartBiayaPerUnit,
            'chartBiayaPerKategori' => $chartBiayaPerKategori,
            'chartTrendBiaya' => $chartTrendBiaya,
            'items' => $items,
            'pagination' => [
                'total' => $paginatedAbrs->total(),
                'per_page' => $paginatedAbrs->perPage(),
                'current_page' => $paginatedAbrs->currentPage(),
                'last_page' => $paginatedAbrs->lastPage(),
            ],
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'code_unit' => $codeUnit,
                'kategori' => $kategori,
            ],
        ]);
    }

    public function create()
    {
        $units = Unit::orderBy('code_unit', 'asc')->get();
        // Generate an auto number: PT-MAM/016/ABR/VIII/2026
        $count = Abr::whereYear('created_at', date('Y'))->whereMonth('created_at', date('m'))->count() + 16;
        $romanMonth = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][date('n') - 1];
        $no_abr = sprintf('PT-MAM/%03d/ABR/%s/%s', $count, $romanMonth, date('Y'));

        return Inertia::render('ABR/Create', [
            'units' => $units,
            'no_abr' => $no_abr,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'no_abr' => 'required|unique:abrs,no_abr',
            'tanggal' => 'required|date',
            'unit_id' => 'nullable|exists:units,id',
            'manual_unit_code' => 'required_without:unit_id|nullable|string',
            'items' => 'required|array',
        ]);

        DB::transaction(function () use ($request) {
            $abr = Abr::create([
                'no_abr' => $request->no_abr,
                'tanggal' => $request->tanggal,
                'unit_id' => $request->unit_id,
                'manual_unit_code' => $request->manual_unit_code,
                'manual_unit_model' => $request->manual_unit_model,
                'manual_sn_chassis' => $request->manual_sn_chassis,
                'manual_engine_model' => $request->manual_engine_model,
                'manual_sn_engine' => $request->manual_sn_engine,
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
                    'description' => $item['description'] ?? '-',
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
                        'file_path' => '/storage/'.$path,
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
            'abr' => $abr,
        ]);
    }

    public function edit(Abr $abr)
    {
        $abr->load(['unit', 'items', 'images']);
        $units = Unit::orderBy('code_unit', 'asc')->get();

        return Inertia::render('ABR/Edit', [
            'abr' => $abr,
            'units' => $units,
        ]);
    }

    public function update(Request $request, Abr $abr)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'unit_id' => 'nullable|exists:units,id',
            'manual_unit_code' => 'required_without:unit_id|nullable|string',
            'items' => 'required|array',
        ]);

        DB::transaction(function () use ($request, $abr) {
            $abr->update([
                'tanggal' => $request->tanggal,
                'unit_id' => $request->unit_id,
                'manual_unit_code' => $request->manual_unit_code,
                'manual_unit_model' => $request->manual_unit_model,
                'manual_sn_chassis' => $request->manual_sn_chassis,
                'manual_engine_model' => $request->manual_engine_model,
                'manual_sn_engine' => $request->manual_sn_engine,
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
                    'description' => $item['description'] ?? '-',
                    'price' => $item['price'] ?? 0,
                    'qty' => $item['qty'] ?? 1,
                    'satuan' => $item['satuan'] ?? null,
                    'hour' => $item['hour'] ?? null,
                    'mp' => $item['mp'] ?? null,
                    'amount' => $item['amount'] ?? 0,
                ]);
            }

            if ($request->hasFile('new_images')) {
                foreach ($request->file('new_images') as $file) {
                    $path = $file->store('abr_images', 'public');
                    AbrImage::create([
                        'abr_id' => $abr->id,
                        'file_path' => '/storage/'.$path,
                    ]);
                }
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
