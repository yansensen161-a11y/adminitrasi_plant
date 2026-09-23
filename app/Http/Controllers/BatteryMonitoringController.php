<?php

namespace App\Http\Controllers;

use App\Models\BatteryMonitoring;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BatteryMonitoringController extends Controller
{
    /** Common battery brands in Indonesian heavy equipment / automotive operations */
    private const DEFAULT_BRANDS = [
        'GS ASTRA',
        'YUASA',
        'INCOE',
        'G-FORCE',
        'DELKOR',
        'OPTIMA',
        'BOSCH',
        'ROCKET',
        'AMARON',
        'PANASONIC',
        'MASSIV',
    ];

    /** Default battery part number specifications */
    private const DEFAULT_SPECS = [
        [
            'part_number' => 'N100',
            'description' => 'BATTERY 12V 100AH HEAVY DUTY LEAD ACID',
            'voltage' => '12V',
            'target_lifetime' => 4000,
        ],
        [
            'part_number' => 'N120',
            'description' => 'BATTERY 12V 120AH HEAVY DUTY LEAD ACID',
            'voltage' => '12V',
            'target_lifetime' => 4000,
        ],
        [
            'part_number' => 'N150',
            'description' => 'BATTERY 12V 150AH HEAVY DUTY COMMERCIAL',
            'voltage' => '12V',
            'target_lifetime' => 4500,
        ],
        [
            'part_number' => 'N200',
            'description' => 'BATTERY 12V 200AH HEAVY EQUIPMENT & DUMP TRUCK',
            'voltage' => '12V',
            'target_lifetime' => 5000,
        ],
        [
            'part_number' => '115D31R',
            'description' => 'BATTERY 12V 95AH HIGH CRANKING AMP (LIGHT VEHICLE/BUS)',
            'voltage' => '12V',
            'target_lifetime' => 3500,
        ],
        [
            'part_number' => '95D31R',
            'description' => 'BATTERY 12V 80AH DIESEL STARTING',
            'voltage' => '12V',
            'target_lifetime' => 3500,
        ],
        [
            'part_number' => '55D23L',
            'description' => 'BATTERY 12V 60AH SUPPORT VEHICLE',
            'voltage' => '12V',
            'target_lifetime' => 3000,
        ],
    ];

    /**
     * Display battery monitoring dashboard and records
     */
    public function index(Request $request)
    {
        $query = BatteryMonitoring::with('unit')->orderByDesc('tanggal_instal')->orderByDesc('id');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code_unit', 'like', "%{$search}%")
                    ->orWhere('brand_battery', 'like', "%{$search}%")
                    ->orWhere('part_number', 'like', "%{$search}%")
                    ->orWhere('part_number_description', 'like', "%{$search}%")
                    ->orWhere('pic_instal', 'like', "%{$search}%")
                    ->orWhere('serial_number_battery', 'like', "%{$search}%")
                    ->orWhere('penyebab_rusak', 'like', "%{$search}%");
            });
        }

        // Unit filter
        if ($request->filled('unit')) {
            $query->where(function ($q) use ($request) {
                $q->where('unit_id', $request->unit)
                    ->orWhere('code_unit', $request->unit);
            });
        }

        // Brand filter
        if ($request->filled('brand')) {
            $query->where('brand_battery', $request->brand);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Tab filter (ACTIVE, HISTORICAL, ALL)
        $tab = $request->get('tab', 'ACTIVE');
        if ($tab === 'ACTIVE') {
            $query->where('status', 'TERPASANG');
        } elseif ($tab === 'HISTORICAL') {
            $query->whereIn('status', ['RUSAK', 'SCRAP', 'CLAIM_GARANSI']);
        }

        $batteries = $query->get();

        // Calculate Global KPI Stats across all records
        $allRecords = BatteryMonitoring::with('unit')->get();
        $totalInstalled = $allRecords->where('status', 'TERPASANG')->count();
        $totalReplaced = $allRecords->whereIn('status', ['RUSAK', 'SCRAP', 'CLAIM_GARANSI'])->count();
        $totalMonitoredUnits = $allRecords->pluck('code_unit')->unique()->count();

        // Average lifetime of replaced batteries
        $historicalBatteries = $allRecords->whereIn('status', ['RUSAK', 'SCRAP'])->where('lifetime_hours', '>', 0);
        $avgLifetimeHours = $historicalBatteries->count() > 0
            ? round($historicalBatteries->avg('lifetime_hours'), 1)
            : 0;

        // Batteries that are active and have reached or exceeded 90% target lifetime
        $alertBatteriesCount = $allRecords->where('is_alert', true)->count();

        // Distinct units for select dropdown
        $units = Unit::select('id', 'code_unit', 'model', 'hm', 'location')
            ->orderBy('code_unit')
            ->get();

        return Inertia::render('Repair/BatteryMonitoring', [
            'batteries' => $batteries,
            'stats' => [
                'total_installed' => $totalInstalled,
                'total_replaced' => $totalReplaced,
                'total_monitored_units' => $totalMonitoredUnits,
                'avg_lifetime_hours' => $avgLifetimeHours,
                'alert_count' => $alertBatteriesCount,
            ],
            'brandPresets' => self::DEFAULT_BRANDS,
            'specPresets' => self::DEFAULT_SPECS,
            'units' => $units,
            'filters' => [
                'search' => $request->search ?? '',
                'unit' => $request->unit ?? '',
                'brand' => $request->brand ?? '',
                'status' => $request->status ?? '',
                'tab' => $tab,
            ],
        ]);
    }

    /**
     * Store a newly created battery record
     */
    public function store(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner', 'elektrikal']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'unit_id' => 'nullable|uuid|exists:units,id',
            'code_unit' => 'required|string|max:50',
            'brand_battery' => 'required|string|max:100',
            'part_number' => 'required|string|max:100',
            'part_number_description' => 'nullable|string|max:255',
            'qty' => 'required|integer|min:1',
            'hm_instal' => 'required|numeric|min:0',
            'hm_rusak' => 'nullable|numeric|min:0',
            'target_lifetime_hours' => 'nullable|numeric|min:1',
            'tanggal_instal' => 'required|date',
            'tanggal_rusak' => 'nullable|date',
            'status' => 'required|string|in:TERPASANG,RUSAK,SCRAP,CLAIM_GARANSI',
            'posisi' => 'nullable|string|max:50',
            'voltage' => 'nullable|string|max:20',
            'penyebab_rusak' => 'nullable|string',
            'pic_instal' => 'nullable|string|max:100',
            'pic_rusak' => 'nullable|string|max:100',
            'serial_number_battery' => 'nullable|string|max:100',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'photo' => 'nullable|image|max:5120',
        ]);

        // If unit_id is not given, attempt to find unit by code_unit
        if (empty($validated['unit_id'])) {
            $foundUnit = Unit::where('code_unit', $validated['code_unit'])->first();
            if ($foundUnit) {
                $validated['unit_id'] = $foundUnit->id;
            }
        }

        // Photo upload handling
        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('battery_photos', 'public');
        }

        // Auto compute lifetime if hm_rusak is present
        if (! empty($validated['hm_rusak'])) {
            $validated['lifetime_hours'] = max(0, (float) $validated['hm_rusak'] - (float) $validated['hm_instal']);
        }

        BatteryMonitoring::create($validated);

        return redirect()->route('repair.battery.index')
            ->with('success', "Data instalasi battery untuk unit {$validated['code_unit']} berhasil disimpan.");
    }

    /**
     * Update an existing battery record
     */
    public function update(Request $request, BatteryMonitoring $battery)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner', 'elektrikal']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'unit_id' => 'nullable|uuid|exists:units,id',
            'code_unit' => 'required|string|max:50',
            'brand_battery' => 'required|string|max:100',
            'part_number' => 'required|string|max:100',
            'part_number_description' => 'nullable|string|max:255',
            'qty' => 'required|integer|min:1',
            'hm_instal' => 'required|numeric|min:0',
            'hm_rusak' => 'nullable|numeric|min:0',
            'target_lifetime_hours' => 'nullable|numeric|min:1',
            'tanggal_instal' => 'required|date',
            'tanggal_rusak' => 'nullable|date',
            'status' => 'required|string|in:TERPASANG,RUSAK,SCRAP,CLAIM_GARANSI',
            'posisi' => 'nullable|string|max:50',
            'voltage' => 'nullable|string|max:20',
            'penyebab_rusak' => 'nullable|string',
            'pic_instal' => 'nullable|string|max:100',
            'pic_rusak' => 'nullable|string|max:100',
            'serial_number_battery' => 'nullable|string|max:100',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'photo' => 'nullable|image|max:5120',
        ]);

        if (empty($validated['unit_id'])) {
            $foundUnit = Unit::where('code_unit', $validated['code_unit'])->first();
            if ($foundUnit) {
                $validated['unit_id'] = $foundUnit->id;
            }
        }

        if ($request->hasFile('photo')) {
            if ($battery->photo_path) {
                Storage::disk('public')->delete($battery->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('battery_photos', 'public');
        }

        if (! empty($validated['hm_rusak'])) {
            $validated['lifetime_hours'] = max(0, (float) $validated['hm_rusak'] - (float) $validated['hm_instal']);
        }

        $battery->update($validated);

        return redirect()->route('repair.battery.index')
            ->with('success', "Data battery {$battery->code_unit} ({$battery->brand_battery} {$battery->part_number}) berhasil diperbarui.");
    }

    /**
     * Quick Replace Action:
     * Marks the current battery as RUSAK, computes lifetime, and installs a new replacement battery.
     */
    public function replace(Request $request, BatteryMonitoring $battery)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner', 'elektrikal']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            // Old battery damage data
            'hm_rusak' => 'required|numeric|min:'.$battery->hm_instal,
            'tanggal_rusak' => 'required|date',
            'penyebab_rusak' => 'required|string|max:255',
            'pic_rusak' => 'nullable|string|max:100',

            // New replacement battery specs
            'new_brand_battery' => 'required|string|max:100',
            'new_part_number' => 'required|string|max:100',
            'new_part_number_description' => 'nullable|string|max:255',
            'new_qty' => 'required|integer|min:1',
            'new_pic_instal' => 'nullable|string|max:100',
            'new_serial_number' => 'nullable|string|max:100',
            'new_cost' => 'nullable|numeric|min:0',
        ]);

        // 1. Finalize old battery as RUSAK
        $calculatedLife = max(0, (float) $validated['hm_rusak'] - (float) $battery->hm_instal);
        $battery->update([
            'status' => 'RUSAK',
            'hm_rusak' => $validated['hm_rusak'],
            'tanggal_rusak' => $validated['tanggal_rusak'],
            'lifetime_hours' => $calculatedLife,
            'penyebab_rusak' => $validated['penyebab_rusak'],
            'pic_rusak' => $validated['pic_rusak'] ?? $battery->pic_rusak,
        ]);

        // 2. Install new battery with HM instal matching HM rusak
        BatteryMonitoring::create([
            'unit_id' => $battery->unit_id,
            'code_unit' => $battery->code_unit,
            'brand_battery' => $validated['new_brand_battery'],
            'part_number' => $validated['new_part_number'],
            'part_number_description' => $validated['new_part_number_description'] ?? $battery->part_number_description,
            'qty' => $validated['new_qty'],
            'hm_instal' => $validated['hm_rusak'],
            'target_lifetime_hours' => $battery->target_lifetime_hours ?: 4000,
            'tanggal_instal' => $validated['tanggal_rusak'],
            'status' => 'TERPASANG',
            'posisi' => $battery->posisi,
            'voltage' => $battery->voltage,
            'pic_instal' => $validated['new_pic_instal'] ?? $battery->pic_instal,
            'serial_number_battery' => $validated['new_serial_number'] ?? null,
            'cost' => $validated['new_cost'] ?? null,
            'notes' => "Penggantian dari battery sebelumnya ({$battery->brand_battery} {$battery->part_number} - Life: {$calculatedLife} jam)",
        ]);

        return redirect()->route('repair.battery.index')
            ->with('success', "Penggantian battery unit {$battery->code_unit} berhasil dicatat. Battery baru telah aktif terpasang.");
    }

    /**
     * Remove a battery record
     */
    public function destroy(BatteryMonitoring $battery)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menghapus.');

        if ($battery->photo_path) {
            Storage::disk('public')->delete($battery->photo_path);
        }

        $code = $battery->code_unit;
        $battery->delete();

        return redirect()->route('repair.battery.index')
            ->with('success', "Data battery unit {$code} berhasil dihapus.");
    }

    /**
     * Export battery monitoring data to Excel / CSV format
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $query = BatteryMonitoring::with('unit')->orderByDesc('tanggal_instal');

        if ($request->filled('unit')) {
            $query->where('code_unit', $request->unit);
        }
        if ($request->filled('brand')) {
            $query->where('brand_battery', $request->brand);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $records = $query->get();

        $filename = 'Monitoring_Replace_Battery_'.date('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($records) {
            $handle = fopen('php://output', 'w');
            // Add UTF-8 BOM for Microsoft Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // CSV Header
            fputcsv($handle, [
                'No',
                'Code Unit',
                'Model Mesin / Unit',
                'Brand Battery',
                'Part Number',
                'Part Number Description',
                'Qty',
                'Posisi',
                'Voltage',
                'HM Instal',
                'Tanggal Instal',
                'HM Rusak',
                'Tanggal Rusak',
                'Life Time (Jam)',
                'Target Lifetime (Jam)',
                'Pencapaian (%)',
                'Status',
                'Penyebab Kerusakan',
                'PIC Pemasangan',
                'Serial Number Battery',
                'Biaya (Rp)',
                'Keterangan',
            ]);

            foreach ($records as $idx => $r) {
                fputcsv($handle, [
                    $idx + 1,
                    $r->code_unit,
                    $r->unit?->model ?? '-',
                    $r->brand_battery,
                    $r->part_number,
                    $r->part_number_description ?? '-',
                    $r->qty,
                    $r->posisi ?? '-',
                    $r->voltage ?? '12V',
                    number_format((float) $r->hm_instal, 1, ',', ''),
                    $r->tanggal_instal ? $r->tanggal_instal->format('d/m/Y') : '-',
                    $r->hm_rusak !== null ? number_format((float) $r->hm_rusak, 1, ',', '') : '-',
                    $r->tanggal_rusak ? $r->tanggal_rusak->format('d/m/Y') : '-',
                    number_format((float) $r->current_lifetime, 1, ',', ''),
                    number_format((float) $r->target_lifetime_hours, 1, ',', ''),
                    $r->lifetime_percentage.'%',
                    $r->status,
                    $r->penyebab_rusak ?? '-',
                    $r->pic_instal ?? '-',
                    $r->serial_number_battery ?? '-',
                    $r->cost ? number_format((float) $r->cost, 0, ',', '.') : '-',
                    $r->notes ?? '-',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
