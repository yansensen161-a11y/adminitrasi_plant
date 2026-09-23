<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\WoOutsideRepair;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class JobOutsideRepairController extends Controller
{
    /** Common component types in mining plant */
    private const DEFAULT_COMPONENTS = [
        'ALTERNATOR',
        'STARTER MOTOR 24V',
        'MAIN HYDRAULIC PUMP',
        'HOIST CYLINDER (RH)',
        'HOIST CYLINDER (LH)',
        'STEERING CYLINDER',
        'INJECTOR COMMON RAIL (SET)',
        'TURBOCHARGER',
        'TORQUE CONVERTER',
        'TRANSMISSION ASSEMBLY',
        'WATER PUMP',
        'CONTROL VALVE HYDRAULIC',
        'FINAL DRIVE',
        'FRONT SUSPENSION',
        'REAR SUSPENSION',
    ];

    /** Default vendors / outside repair shops */
    private const DEFAULT_WORKSHOPS = [
        'AREMA DINAMO',
        'SURYA HYDRAULIC',
        'BORNEO HARDCHROME',
        'BERAU DIESEL SERVICE',
        'UNITED TRACTORS',
        'TRAKTOR NUSANTARA',
        'HEXINDO ADIPERKASA',
        'CV. TEKNIK MANDIRI',
    ];

    public function index(Request $request)
    {
        $query = WoOutsideRepair::with('unit')->orderByDesc('date')->orderByDesc('id');

        // Filter search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('wo_no', 'like', "%{$search}%")
                    ->orWhere('kode_unit', 'like', "%{$search}%")
                    ->orWhere('nama_komponen', 'like', "%{$search}%")
                    ->orWhere('sn_komponen', 'like', "%{$search}%")
                    ->orWhere('nama_bengkel', 'like', "%{$search}%")
                    ->orWhere('problem', 'like', "%{$search}%");
            });
        }

        // Filter unit
        if ($request->filled('unit')) {
            $query->where('kode_unit', $request->unit);
        }

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter workshop
        if ($request->filled('bengkel')) {
            $query->where('nama_bengkel', $request->bengkel);
        }

        $allRepairs = $query->get();

        // Active WO: Not yet completed or installed
        $activeRepairs = $allRepairs->filter(function ($item) {
            return in_array($item->status, ['DRAFT', 'DIKIRIM', 'PROSES REPAIR']);
        })->values();

        // Historical repairs: Completed, installed or all with completed repair data
        $historicalRepairs = $allRepairs->filter(function ($item) {
            return in_array($item->status, ['SELESAI', 'TERPASANG']) || $item->tanggal_kembali !== null;
        })->values();

        // Stats summary
        $totalCount = $allRepairs->count();
        $inShopCount = $allRepairs->whereIn('status', ['DIKIRIM', 'PROSES REPAIR'])->count();
        $completedCount = $allRepairs->whereIn('status', ['SELESAI', 'TERPASANG'])->count();
        $totalCost = $allRepairs->sum('aktual_biaya');
        $avgLifetime = $allRepairs->where('lifetime_hours', '>', 0)->avg('lifetime_hours') ?: 0;

        // Suggested next WO Number
        $suggestedWoNo = WoOutsideRepair::generateNextWoNumber();

        // Master units for dropdown
        $units = Unit::select('id', 'code_unit', 'model', 'sn_chassis', 'hm', 'location')
            ->orderBy('code_unit')
            ->get();

        // Vendors list
        $workshops = WoOutsideRepair::select('nama_bengkel')
            ->distinct()
            ->pluck('nama_bengkel')
            ->merge(self::DEFAULT_WORKSHOPS)
            ->unique()
            ->values();

        return Inertia::render('Repair/JobOutside', [
            'allRepairs' => $allRepairs,
            'activeRepairs' => $activeRepairs,
            'historicalRepairs' => $historicalRepairs,
            'stats' => [
                'total' => $totalCount,
                'in_shop' => $inShopCount,
                'completed' => $completedCount,
                'avg_lifetime' => round($avgLifetime, 1),
                'total_cost' => $totalCost,
            ],
            'suggestedWoNo' => $suggestedWoNo,
            'units' => $units,
            'workshops' => $workshops,
            'componentPresets' => self::DEFAULT_COMPONENTS,
            'filters' => $request->only(['search', 'unit', 'status', 'bengkel', 'tab']),
        ]);
    }

    public function store(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'wo_no' => 'required|string|max:100|unique:wo_outside_repairs,wo_no',
            'date' => 'required|date',
            'nama_bengkel' => 'required|string|max:150',
            'tanggal_kirim' => 'nullable|date',
            'estimasi_finish' => 'nullable|date',
            'tanggal_kembali' => 'nullable|date',
            'pic' => 'nullable|string|max:100',
            'lokasi' => 'nullable|string|max:100',
            'tanggal_kerusakan' => 'nullable|date',
            'unit_id' => 'nullable|exists:units,id',
            'kode_unit' => 'nullable|string|max:100',
            'model_mesin' => 'nullable|string|max:150',
            'serial_no_unit' => 'nullable|string|max:150',
            'nama_komponen' => 'required|string|max:150',
            'model_komponen' => 'nullable|string|max:150',
            'sn_komponen' => 'nullable|string|max:150',
            'smr_hours' => 'nullable|numeric|min:0',
            'prev_smr_hours' => 'nullable|numeric|min:0',
            'lifetime_hours' => 'nullable|numeric|min:0',
            'target_lifetime' => 'nullable|numeric|min:0',
            'qty' => 'nullable|integer|min:1',
            'problem' => 'nullable|string|max:2000',
            'job_instruction' => 'nullable|string|max:2000',
            'status' => 'nullable|string|in:DRAFT,DIKIRIM,PROSES REPAIR,SELESAI,TERPASANG',
            'estimasi_biaya' => 'nullable|numeric|min:0',
            'aktual_biaya' => 'nullable|numeric|min:0',
            'garansi_bulan' => 'nullable|integer|min:0',
            'dibuat_oleh' => 'nullable|string|max:100',
            'diketahui_oleh' => 'nullable|string|max:100',
            'disetujui_oleh' => 'nullable|string|max:100',
            'dikirim_oleh' => 'nullable|string|max:100',
            'diterima_oleh' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|max:10240',
        ]);

        // Auto compute lifetime_hours if not directly provided
        if (! isset($validated['lifetime_hours']) || $validated['lifetime_hours'] === null || $validated['lifetime_hours'] == 0) {
            $smr = (float) ($validated['smr_hours'] ?? 0);
            $prevSmr = (float) ($validated['prev_smr_hours'] ?? 0);
            if ($smr > 0) {
                $validated['lifetime_hours'] = max(0, $smr - $prevSmr);
            }
        }

        // Set defaults & normalize empty fields
        $validated['qty'] = (isset($validated['qty']) && $validated['qty'] !== '') ? (int) $validated['qty'] : 1;
        $validated['status'] = ! empty($validated['status']) ? $validated['status'] : 'DIKIRIM';
        $validated['target_lifetime'] = (isset($validated['target_lifetime']) && $validated['target_lifetime'] !== '') ? (float) $validated['target_lifetime'] : 5000;
        $validated['estimasi_biaya'] = (isset($validated['estimasi_biaya']) && $validated['estimasi_biaya'] !== '') ? (float) $validated['estimasi_biaya'] : null;
        $validated['aktual_biaya'] = (isset($validated['aktual_biaya']) && $validated['aktual_biaya'] !== '') ? (float) $validated['aktual_biaya'] : null;
        $validated['garansi_bulan'] = (isset($validated['garansi_bulan']) && $validated['garansi_bulan'] !== '') ? (int) $validated['garansi_bulan'] : 1;
        $validated['smr_hours'] = (isset($validated['smr_hours']) && $validated['smr_hours'] !== '') ? (float) $validated['smr_hours'] : 0;
        $validated['prev_smr_hours'] = (isset($validated['prev_smr_hours']) && $validated['prev_smr_hours'] !== '') ? (float) $validated['prev_smr_hours'] : 0;
        $validated['lifetime_hours'] = (isset($validated['lifetime_hours']) && $validated['lifetime_hours'] !== '') ? (float) $validated['lifetime_hours'] : 0;
        $validated['dibuat_oleh'] = ! empty($validated['dibuat_oleh']) ? $validated['dibuat_oleh'] : 'Admin Plant';
        $validated['diketahui_oleh'] = ! empty($validated['diketahui_oleh']) ? $validated['diketahui_oleh'] : 'Planner';
        $validated['disetujui_oleh'] = ! empty($validated['disetujui_oleh']) ? $validated['disetujui_oleh'] : 'Superintendent Plant';
        $validated['dikirim_oleh'] = ! empty($validated['dikirim_oleh']) ? $validated['dikirim_oleh'] : 'Logistic';
        $validated['diterima_oleh'] = ! empty($validated['diterima_oleh']) ? $validated['diterima_oleh'] : null;
        $validated['estimasi_finish'] = ! empty($validated['estimasi_finish']) ? $validated['estimasi_finish'] : null;
        $validated['tanggal_kembali'] = ! empty($validated['tanggal_kembali']) ? $validated['tanggal_kembali'] : null;
        $validated['tanggal_kirim'] = ! empty($validated['tanggal_kirim']) ? $validated['tanggal_kirim'] : null;
        $validated['tanggal_kerusakan'] = ! empty($validated['tanggal_kerusakan']) ? $validated['tanggal_kerusakan'] : null;
        $validated['nama_bengkel'] = ! empty($validated['nama_bengkel']) ? strtoupper(trim($validated['nama_bengkel'])) : '';
        $validated['nama_komponen'] = ! empty($validated['nama_komponen']) ? strtoupper(trim($validated['nama_komponen'])) : '';
        $validated['sn_komponen'] = ! empty($validated['sn_komponen']) ? strtoupper(trim($validated['sn_komponen'])) : null;
        $validated['model_komponen'] = ! empty($validated['model_komponen']) ? strtoupper(trim($validated['model_komponen'])) : null;
        $validated['kode_unit'] = ! empty($validated['kode_unit']) ? strtoupper(trim($validated['kode_unit'])) : null;
        $validated['model_mesin'] = ! empty($validated['model_mesin']) ? strtoupper(trim($validated['model_mesin'])) : null;
        $validated['serial_no_unit'] = ! empty($validated['serial_no_unit']) ? strtoupper(trim($validated['serial_no_unit'])) : null;
        $validated['pic'] = ! empty($validated['pic']) ? strtoupper(trim($validated['pic'])) : null;
        $validated['lokasi'] = ! empty($validated['lokasi']) ? strtoupper(trim($validated['lokasi'])) : null;
        $validated['notes'] = ! empty($validated['notes']) ? trim($validated['notes']) : null;
        $validated['problem'] = ! empty($validated['problem']) ? strtoupper(trim($validated['problem'])) : null;
        $validated['job_instruction'] = ! empty($validated['job_instruction']) ? strtoupper(trim($validated['job_instruction'])) : null;

        // Auto attach Unit if unit_id not passed but kode_unit matches
        if (empty($validated['unit_id']) && ! empty($validated['kode_unit'])) {
            $u = Unit::where('code_unit', $validated['kode_unit'])->first();
            if ($u) {
                $validated['unit_id'] = $u->id;
                $validated['model_mesin'] = $validated['model_mesin'] ?: $u->model;
                $validated['serial_no_unit'] = $validated['serial_no_unit'] ?: $u->sn_chassis;
            }
        }

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('wo_outside_repairs', 'public');
            $validated['photo_path'] = $path;
        }

        $record = WoOutsideRepair::create($validated);

        return redirect()->route('repair.job-outside')
            ->with('success', "Work Order Outside Repair [{$record->wo_no}] berhasil dibuat.");
    }

    public function update(Request $request, WoOutsideRepair $wo)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'wo_no' => 'required|string|max:100|unique:wo_outside_repairs,wo_no,'.$wo->id,
            'date' => 'required|date',
            'nama_bengkel' => 'required|string|max:150',
            'tanggal_kirim' => 'nullable|date',
            'estimasi_finish' => 'nullable|date',
            'tanggal_kembali' => 'nullable|date',
            'pic' => 'nullable|string|max:100',
            'lokasi' => 'nullable|string|max:100',
            'tanggal_kerusakan' => 'nullable|date',
            'unit_id' => 'nullable|exists:units,id',
            'kode_unit' => 'nullable|string|max:100',
            'model_mesin' => 'nullable|string|max:150',
            'serial_no_unit' => 'nullable|string|max:150',
            'nama_komponen' => 'required|string|max:150',
            'model_komponen' => 'nullable|string|max:150',
            'sn_komponen' => 'nullable|string|max:150',
            'smr_hours' => 'nullable|numeric|min:0',
            'prev_smr_hours' => 'nullable|numeric|min:0',
            'lifetime_hours' => 'nullable|numeric|min:0',
            'target_lifetime' => 'nullable|numeric|min:0',
            'qty' => 'nullable|integer|min:1',
            'problem' => 'nullable|string|max:2000',
            'job_instruction' => 'nullable|string|max:2000',
            'status' => 'nullable|string|in:DRAFT,DIKIRIM,PROSES REPAIR,SELESAI,TERPASANG',
            'estimasi_biaya' => 'nullable|numeric|min:0',
            'aktual_biaya' => 'nullable|numeric|min:0',
            'garansi_bulan' => 'nullable|integer|min:0',
            'dibuat_oleh' => 'nullable|string|max:100',
            'diketahui_oleh' => 'nullable|string|max:100',
            'disetujui_oleh' => 'nullable|string|max:100',
            'dikirim_oleh' => 'nullable|string|max:100',
            'diterima_oleh' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|max:10240',
        ]);

        // Auto compute lifetime if needed
        if (! isset($validated['lifetime_hours']) || $validated['lifetime_hours'] === null || $validated['lifetime_hours'] == 0) {
            $smr = (float) ($validated['smr_hours'] ?? 0);
            $prevSmr = (float) ($validated['prev_smr_hours'] ?? 0);
            if ($smr > 0) {
                $validated['lifetime_hours'] = max(0, $smr - $prevSmr);
            }
        }

        // Set defaults & normalize empty fields
        $validated['qty'] = (isset($validated['qty']) && $validated['qty'] !== '') ? (int) $validated['qty'] : 1;
        $validated['target_lifetime'] = (isset($validated['target_lifetime']) && $validated['target_lifetime'] !== '') ? (float) $validated['target_lifetime'] : 5000;
        $validated['estimasi_biaya'] = (isset($validated['estimasi_biaya']) && $validated['estimasi_biaya'] !== '') ? (float) $validated['estimasi_biaya'] : null;
        $validated['aktual_biaya'] = (isset($validated['aktual_biaya']) && $validated['aktual_biaya'] !== '') ? (float) $validated['aktual_biaya'] : null;
        $validated['garansi_bulan'] = (isset($validated['garansi_bulan']) && $validated['garansi_bulan'] !== '') ? (int) $validated['garansi_bulan'] : 1;
        $validated['smr_hours'] = (isset($validated['smr_hours']) && $validated['smr_hours'] !== '') ? (float) $validated['smr_hours'] : 0;
        $validated['prev_smr_hours'] = (isset($validated['prev_smr_hours']) && $validated['prev_smr_hours'] !== '') ? (float) $validated['prev_smr_hours'] : 0;
        $validated['lifetime_hours'] = (isset($validated['lifetime_hours']) && $validated['lifetime_hours'] !== '') ? (float) $validated['lifetime_hours'] : 0;
        $validated['dibuat_oleh'] = ! empty($validated['dibuat_oleh']) ? $validated['dibuat_oleh'] : 'Admin Plant';
        $validated['diketahui_oleh'] = ! empty($validated['diketahui_oleh']) ? $validated['diketahui_oleh'] : 'Planner';
        $validated['disetujui_oleh'] = ! empty($validated['disetujui_oleh']) ? $validated['disetujui_oleh'] : 'Superintendent Plant';
        $validated['dikirim_oleh'] = ! empty($validated['dikirim_oleh']) ? $validated['dikirim_oleh'] : 'Logistic';
        $validated['diterima_oleh'] = ! empty($validated['diterima_oleh']) ? $validated['diterima_oleh'] : null;
        $validated['estimasi_finish'] = ! empty($validated['estimasi_finish']) ? $validated['estimasi_finish'] : null;
        $validated['tanggal_kembali'] = ! empty($validated['tanggal_kembali']) ? $validated['tanggal_kembali'] : null;
        $validated['tanggal_kirim'] = ! empty($validated['tanggal_kirim']) ? $validated['tanggal_kirim'] : null;
        $validated['tanggal_kerusakan'] = ! empty($validated['tanggal_kerusakan']) ? $validated['tanggal_kerusakan'] : null;
        $validated['nama_bengkel'] = ! empty($validated['nama_bengkel']) ? strtoupper(trim($validated['nama_bengkel'])) : '';
        $validated['nama_komponen'] = ! empty($validated['nama_komponen']) ? strtoupper(trim($validated['nama_komponen'])) : '';
        $validated['sn_komponen'] = ! empty($validated['sn_komponen']) ? strtoupper(trim($validated['sn_komponen'])) : null;
        $validated['model_komponen'] = ! empty($validated['model_komponen']) ? strtoupper(trim($validated['model_komponen'])) : null;
        $validated['kode_unit'] = ! empty($validated['kode_unit']) ? strtoupper(trim($validated['kode_unit'])) : null;
        $validated['model_mesin'] = ! empty($validated['model_mesin']) ? strtoupper(trim($validated['model_mesin'])) : null;
        $validated['serial_no_unit'] = ! empty($validated['serial_no_unit']) ? strtoupper(trim($validated['serial_no_unit'])) : null;
        $validated['pic'] = ! empty($validated['pic']) ? strtoupper(trim($validated['pic'])) : null;
        $validated['lokasi'] = ! empty($validated['lokasi']) ? strtoupper(trim($validated['lokasi'])) : null;
        $validated['notes'] = ! empty($validated['notes']) ? trim($validated['notes']) : null;
        $validated['problem'] = ! empty($validated['problem']) ? strtoupper(trim($validated['problem'])) : null;
        $validated['job_instruction'] = ! empty($validated['job_instruction']) ? strtoupper(trim($validated['job_instruction'])) : null;

        // Auto attach Unit if unit_id not passed but kode_unit matches
        if (empty($validated['unit_id']) && ! empty($validated['kode_unit'])) {
            $u = Unit::where('code_unit', $validated['kode_unit'])->first();
            if ($u) {
                $validated['unit_id'] = $u->id;
                $validated['model_mesin'] = (! empty($validated['model_mesin'])) ? $validated['model_mesin'] : $u->model;
                $validated['serial_no_unit'] = (! empty($validated['serial_no_unit'])) ? $validated['serial_no_unit'] : $u->sn_chassis;
            }
        }

        // Handle photo upload
        if ($request->hasFile('photo')) {
            if ($wo->photo_path && Storage::disk('public')->exists($wo->photo_path)) {
                Storage::disk('public')->delete($wo->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('wo_outside_repairs', 'public');
        }

        $wo->update($validated);

        return redirect()->route('repair.job-outside')
            ->with('success', "Work Order Outside Repair [{$wo->wo_no}] berhasil diperbarui.");
    }

    public function destroy(WoOutsideRepair $wo)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menghapus data.');

        if ($wo->photo_path && Storage::disk('public')->exists($wo->photo_path)) {
            Storage::disk('public')->delete($wo->photo_path);
        }

        $no = $wo->wo_no;
        $wo->delete();

        return redirect()->route('repair.job-outside')
            ->with('success', "Work Order Outside Repair [{$no}] berhasil dihapus.");
    }

    public function printPdf(WoOutsideRepair $wo): Response
    {
        $pdf = Pdf::loadView('pdf.wo-outside-repair', ['wo' => $wo]);
        $pdf->setPaper('a4', 'portrait');

        $cleanWoNo = str_replace('/', '_', $wo->wo_no);

        return $pdf->stream("WO_External_Repair_{$cleanWoNo}.pdf");
    }
}
