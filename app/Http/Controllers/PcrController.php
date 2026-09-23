<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceOrder;
use App\Models\PcrUc;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Conditional;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class PcrController extends Controller
{
    private function getPcrData(Request $request)
    {
        $query = PcrUc::with(['unit', 'maintenanceOrder']);

        if ($request->has('code_unit') && $request->code_unit !== 'All Unit') {
            $query->whereHas('unit', function ($q) use ($request) {
                $q->where('code_unit', $request->code_unit);
            });
        }

        $formatHm = function ($val) {
            if ($val === null || $val === '') {
                return '-';
            }
            $formatted = number_format((float) $val, 3, ',', '.');
            if (strpos($formatted, ',') !== false) {
                $formatted = rtrim(rtrim($formatted, '0'), ',');
            }

            return $formatted;
        };

        $data = $query->get()->map(function ($pcr) use ($formatHm) {
            $unit = $pcr->unit;
            $targetLifeTime = $pcr->target_life_time ?: 8000;
            $currentHm = $unit && $unit->hm !== null ? (float) $unit->hm : ($pcr->hm_current ?: 0);
            $hmReplace = $pcr->hm_replace !== null ? (float) $pcr->hm_replace : 0;
            $wornOut = ($pcr->worn_out !== null && $pcr->worn_out !== '') ? (float) $pcr->worn_out : null;

            if ($wornOut !== null && $targetLifeTime > 0) {
                $sisaHm = $targetLifeTime * ((100 - $wornOut) / 100);
                $usageHm = $targetLifeTime - $sisaHm;
                $pct = $wornOut;
            } else {
                $usageHm = max(0, $currentHm - $hmReplace);
                $sisaHm = $targetLifeTime - $usageHm;
                $pct = $targetLifeTime > 0 ? ($usageHm / $targetLifeTime) * 100 : 0;
            }

            $statusStr = 'ON SCHEDULE';
            if ($sisaHm < 0) {
                $statusStr = 'OVERDUE';
            } elseif ($sisaHm < 250) {
                $statusStr = 'DUE SOON';
            }

            return [
                'id' => $pcr->id,
                'unit_id' => $pcr->unit_id,
                'code_unit' => $unit->code_unit ?? '-',
                'equipment' => (function () use ($unit) {
                    $typeUnit = $unit->type_unit ?? '';
                    $equipCap = $unit->equipment_capacity ?? '';
                    $code = $unit->code_unit ?? '';
                    $model = strtoupper($unit->model ?? '');
                    // If already has a type_unit value, use it
                    if ($typeUnit && $typeUnit !== '-') {
                        return $typeUnit;
                    }
                    // Detect LV by code pattern (T-02, A-07, etc.) or model name
                    if (
                        preg_match('/^[A-Z]-\d+$/i', trim($code)) ||
                        str_contains($model, 'TRITON') ||
                        str_contains($model, 'HILUX') ||
                        str_contains($model, 'PAJERO') ||
                        str_contains($model, 'RANGER') ||
                        str_contains($model, 'NAVARA') ||
                        str_contains($model, 'D-MAX') ||
                        str_contains($model, 'LIGHT VEHICLE') ||
                        str_contains($model, 'PASSANGER') ||
                        str_contains($model, 'PASSENGER')
                    ) {
                        return 'LV';
                    }

                    return $equipCap ?: '-';
                })(),
                'model' => $unit->model ?? '-',
                'serial_number' => $unit->sn_chassis ?? ($unit->sn_engine ?? '-'),
                'part_number' => $pcr->part_number,
                'description' => $pcr->description,
                'component' => $pcr->component,
                'target_life_time' => $targetLifeTime,
                'target_life_time_formatted' => $formatHm($targetLifeTime),
                'hm_replace' => $pcr->hm_replace,
                'hm_replace_formatted' => $pcr->hm_replace !== null ? $formatHm($pcr->hm_replace) : null,
                'date_replace' => $pcr->date_replace,
                'brand_produk' => $pcr->brand_produk,
                'date_replace_brand' => ($pcr->date_replace ? date('d/m/Y', strtotime($pcr->date_replace)) : '-').($pcr->brand_produk ? ' ('.$pcr->brand_produk.')' : ''),
                'hm_current' => $currentHm,
                'hm_current_formatted' => $formatHm($currentHm),
                'life_time_pct' => $pcr->life_time_pct ? number_format($pcr->life_time_pct, 2, '.', '') : ($targetLifeTime > 0 ? number_format(($usageHm / $targetLifeTime) * 100, 2, '.', '') : '0.00'),
                'status' => $statusStr,
                'sisa_hm' => $sisaHm,
                'target_tanggal' => $pcr->date_replace ? date('d M Y', strtotime($pcr->date_replace)) : now()->addDays((int) floor($sisaHm / 22))->format('d M Y'),
                'pic' => 'Plant Team',
                'next_plant' => $pcr->next_plant ?: ($hmReplace + $targetLifeTime),
                'next_plant_formatted' => $formatHm($pcr->next_plant ?: ($hmReplace + $targetLifeTime)),
                'wo_no' => $pcr->maintenanceOrder ? $pcr->maintenanceOrder->no_order : '-',
                'status_penggantian' => ($pcr->status_penggantian === 'Sudah Diganti' || $pcr->status_penggantian === 'NEW') ? 'NEW' : ($pcr->status_penggantian ?: (($pcr->hm_replace > 0 || $pcr->date_replace) ? 'NEW' : 'Belum Diganti')),
                'worn_out' => $pcr->worn_out !== null ? (float) $pcr->worn_out : null,
                'inspection_date' => $pcr->inspection_date ? date('Y-m-d', strtotime($pcr->inspection_date)) : null,
                'inspection_date_formatted' => $pcr->inspection_date ? date('d/m/Y', strtotime($pcr->inspection_date)) : '-',
                'replacement_history' => $pcr->replacement_history ?? [],
            ];
        });

        // Mock stats based on the Mockup image
        $stats = [
            'total' => 245,
            'on_schedule' => 168,
            'on_schedule_pct' => 68.6,
            'due_soon' => 48,
            'due_soon_pct' => 19.6,
            'overdue' => 29,
            'overdue_pct' => 11.8,
        ];

        // Chart 2: PCR Per Tipe Unit
        // Simplified for now
        $pcr_per_unit_type = [
            ['name' => 'Dozer D85ESS-2', 'count' => 63, 'pct' => 52.50, 'color' => '#1d4ed8'],
            ['name' => 'Excavator', 'count' => 57, 'pct' => 47.50, 'color' => '#0d9488'],
        ];

        // Chart 3: PCR Per Component (Rata-Rata %)
        $pcr_per_component = [
            ['name' => 'Track Link Assy', 'value' => 85, 'color' => '#16a34a'],
            ['name' => 'Shoe / Track Shoe', 'value' => 70, 'color' => '#22c55e'],
        ];

        $units = Unit::orderBy('code_unit')->get();

        return [
            'stats' => $stats,
            'pcr_per_unit_type' => $pcr_per_unit_type,
            'pcr_per_component' => $pcr_per_component,
            'data' => $data,
            'units' => $units,
            'filters' => [
                'code_unit' => $request->code_unit,
                'open_modal' => $request->boolean('open_modal') || $request->open_modal === '1',
                'tab' => $request->tab,
                'component' => $request->component,
            ],
        ];
    }

    public function index(Request $request)
    {
        return Inertia::render('Pcr/Index', $this->getPcrData($request));
    }

    public function indexComponent(Request $request)
    {
        return Inertia::render('Pcr/ComponentIndex', $this->getPcrData($request));
    }

    public function getComponentsByUnit(Request $request)
    {
        $unitId = $request->query('unit_id');
        $unit = Unit::find($unitId);

        $pcrRecords = [];
        if ($unit) {
            $pcrRecords = PcrUc::where('unit_id', $unit->id)->get();
        }

        return response()->json([
            'unit' => $unit,
            'pcr_records' => $pcrRecords,
        ]);
    }

    public function store(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'part_number' => 'required|string',
            'description' => 'nullable|string',
            'component' => 'nullable|string',
            'qty' => 'nullable|numeric',
            'target_life_time' => 'nullable|numeric',
            'hm_replace' => 'nullable|numeric',
            'date_replace' => 'nullable|date',
            'brand_produk' => 'nullable|string',
            'hm_current' => 'nullable|numeric',
            'worn_out' => 'nullable|numeric',
            'inspection_date' => 'nullable|date',
            'status_penggantian' => 'nullable|string',
        ]);

        $existing = PcrUc::where('unit_id', $validated['unit_id'])
            ->where('component', $validated['component'])
            ->first();

        $target = $validated['target_life_time'] ?? 0;
        $current = $validated['hm_current'] ?? 0;
        $statusPenggantian = $validated['status_penggantian'] ?? 'NEW';
        if ($statusPenggantian === 'Sudah Diganti') {
            $statusPenggantian = 'NEW';
        }
        $isReseal = $statusPenggantian === 'Reseal';
        $rawHmInput = $validated['hm_replace'] ?? null;
        $wornOut = (isset($validated['worn_out']) && $validated['worn_out'] !== '' && $validated['worn_out'] !== null)
            ? min(100, max(0, (float) $validated['worn_out']))
            : null;

        if ($wornOut !== null && $target > 0) {
            $remaining = $target * ((100 - $wornOut) / 100);
            $validated['next_plant'] = $current + $remaining;
            $validated['life_time_pct'] = $wornOut;
            $validated['status'] = $wornOut >= 70 ? 'POOR' : ($wornOut >= 40 ? 'FAIR' : 'GOOD');
        } elseif ($isReseal) {
            // Reseal: tidak mendapat penambahan/reset umur lifetime component baru
            // hm_replace dipertahankan dari riwayat sebelumnya agar running hours tidak ter-reset ke 0
            $prevHmReplace = $existing ? ($existing->hm_replace ?: 0) : 0;
            $validated['hm_replace'] = $prevHmReplace;
            $usageHm = max(0, $current - $prevHmReplace);
            $validated['next_plant'] = $existing && $existing->next_plant ? $existing->next_plant : ($prevHmReplace + $target);
            $pct = $target > 0 ? ($usageHm / $target) * 100 : 0;
            $validated['life_time_pct'] = $pct;
            $validated['status'] = $pct >= 70 ? 'POOR' : ($pct >= 40 ? 'FAIR' : 'GOOD');
        } elseif ($target > 0) {
            $validated['next_plant'] = $target + ($validated['hm_replace'] ?? $current);
            $pct = ($current / $target) * 100;
            $validated['life_time_pct'] = $pct;
            $validated['status'] = $pct >= 70 ? 'GOOD' : ($pct >= 40 ? 'FAIR' : 'POOR');
        } else {
            $validated['next_plant'] = 0;
            $validated['life_time_pct'] = 0;
            $validated['status'] = 'GOOD';
        }

        $validated['status_penggantian'] = $statusPenggantian;
        $validated['worn_out'] = $wornOut;
        $validated['inspection_date'] = $validated['inspection_date'] ?? null;

        $newCycle = [
            'action' => match ($statusPenggantian) {
                'Reseal' => 'Reseal',
                'Recondition' => 'Recondition',
                'Overhaul' => 'Overhaul',
                default => 'Replace',
            },
            'status_penggantian' => $statusPenggantian,
            'date_replace' => $validated['date_replace'] ?? null,
            'hm_replace' => $rawHmInput ?? $validated['hm_replace'],
            'next_plant' => $validated['next_plant'],
            'brand_produk' => $validated['brand_produk'] ?? null,
            'recorded_at' => now()->toIso8601String(),
            'notes' => $isReseal ? 'Reseal component (lifetime tidak di-reset)' : ($statusPenggantian === 'Recondition' ? 'Recondition component' : null),
        ];

        if ($existing) {
            $history = $existing->replacement_history ?: [];
            if (empty($history) && ($existing->date_replace || $existing->hm_replace)) {
                $history[] = [
                    'action' => 'Initial',
                    'date_replace' => $existing->date_replace,
                    'hm_replace' => $existing->hm_replace,
                    'next_plant' => $existing->next_plant,
                    'brand_produk' => $existing->brand_produk,
                    'recorded_at' => $existing->created_at ? $existing->created_at->toIso8601String() : now()->toIso8601String(),
                ];
            }
            $history[] = $newCycle;
            $validated['replacement_history'] = $history;
            $existing->update($validated);
        } else {
            $validated['replacement_history'] = [$newCycle];
            PcrUc::create($validated);
        }

        return redirect()->back()->with('success', $isReseal ? 'Data Reseal berhasil dicatat (umur lifetime komponen tidak direset)' : 'Data PCR dan Work Order berhasil ditambahkan');
    }

    public function bulkStore(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'hm_current' => 'nullable|numeric',
            'components' => 'required|array',
            'components.*.id' => 'nullable|string',
            'components.*.part_number' => 'required|string',
            'components.*.component' => 'nullable|string',
            'components.*.name' => 'nullable|string',
            'components.*.description' => 'nullable|string',
            'components.*.remarks' => 'nullable|string',
            'components.*.qty' => 'nullable|numeric',
            'components.*.target_life_time' => 'nullable|numeric',
            'components.*.hm_replace' => 'nullable|numeric',
            'components.*.date_replace' => 'nullable|date',
            'components.*.brand_produk' => 'nullable|string',
            'components.*.brand' => 'nullable|string',
            'components.*.worn_out' => 'nullable|numeric',
            'components.*.inspection_date' => 'nullable|date',
            'components.*.status_penggantian' => 'nullable|string',
        ]);

        $unit_id = $validated['unit_id'];
        $current = $validated['hm_current'] ?? 0;

        foreach ($validated['components'] as $index => $comp) {
            $target = $comp['target_life_time'] ?? 0;
            $rawStatusPenggantian = $comp['status_penggantian'] ?? 'Belum Diganti';
            $statusPenggantian = ($rawStatusPenggantian === 'Sudah Diganti' || $rawStatusPenggantian === 'NEW') ? 'NEW' : $rawStatusPenggantian;
            $isReseal = $statusPenggantian === 'Reseal';

            $existing = null;
            if (! empty($comp['id'])) {
                $existing = PcrUc::find($comp['id']);
            }
            if (! $existing) {
                $existing = PcrUc::where('unit_id', $unit_id)
                    ->where('component', $comp['component'] ?? $comp['name'] ?? null)
                    ->first();
            }

            $rawHmReplace = $comp['hm_replace'] ?? 0;
            $prevHmReplace = $existing ? ($existing->hm_replace ?: 0) : 0;
            $hmReplace = $isReseal ? $prevHmReplace : $rawHmReplace;

            // Re-calculate
            $wornOut = (isset($comp['worn_out']) && $comp['worn_out'] !== '' && $comp['worn_out'] !== null) ? min(100, max(0, (float) $comp['worn_out'])) : null;

            $next_plant = 0;
            $life_time_pct = 0;

            if ($target > 0) {
                if ($wornOut !== null) {
                    $remaining = $target * ((100 - $wornOut) / 100);
                    $next_plant = $current + $remaining;
                    $life_time_pct = $wornOut;
                } elseif ($isReseal) {
                    // Reseal tidak mereset umur lifetime komponen
                    $usageHm = max(0, $current - $prevHmReplace);
                    $next_plant = $existing && $existing->next_plant ? $existing->next_plant : ($prevHmReplace + $target);
                    $life_time_pct = ($usageHm / $target) * 100;
                } else {
                    $next_plant = ($hmReplace > 0 ? $hmReplace : $current) + $target;
                    $life_time_pct = ($current / $target) * 100;
                }
            }
            $status = $life_time_pct >= 70 ? 'POOR' : ($life_time_pct >= 40 ? 'FAIR' : 'GOOD');

            $compData = [
                'unit_id' => $unit_id,
                'part_number' => $comp['part_number'],
                'component' => $comp['component'] ?? $comp['name'] ?? null,
                'qty' => $comp['qty'] ?? 1,
                'description' => $comp['description'] ?? $comp['remarks'] ?? null,
                'target_life_time' => $target,
                'hm_replace' => $hmReplace,
                'date_replace' => $comp['date_replace'] ?? null,
                'brand_produk' => $comp['brand_produk'] ?? $comp['brand'] ?? null,
                'worn_out' => $wornOut,
                'inspection_date' => ! empty($comp['inspection_date']) ? $comp['inspection_date'] : null,
                'status_penggantian' => $statusPenggantian,
                'hm_current' => $current,
                'next_plant' => $next_plant,
                'life_time_pct' => $life_time_pct,
                'status' => $status,
            ];

            $newCycle = [
                'action' => match ($statusPenggantian) {
                    'Reseal' => 'Reseal',
                    'Recondition' => 'Recondition',
                    'Overhaul' => 'Overhaul',
                    'NEW', 'Sudah Diganti' => 'Replace',
                    default => 'Replace',
                },
                'status_penggantian' => $statusPenggantian,
                'date_replace' => $compData['date_replace'],
                'hm_replace' => $rawHmReplace ?: $current,
                'next_plant' => $next_plant,
                'brand_produk' => $compData['brand_produk'],
                'recorded_at' => now()->toIso8601String(),
                'notes' => $isReseal ? 'Reseal (lifetime tidak di-reset)' : ($statusPenggantian === 'Recondition' ? 'Recondition component' : ($wornOut !== null ? 'Inspection: '.$wornOut.'%' : null)),
            ];

            if ($existing) {
                $history = $existing->replacement_history ?: [];
                if (empty($history) && ($existing->date_replace || $existing->hm_replace)) {
                    $history[] = [
                        'action' => 'Initial',
                        'date_replace' => $existing->date_replace,
                        'hm_replace' => $existing->hm_replace,
                        'next_plant' => $existing->next_plant,
                        'brand_produk' => $existing->brand_produk,
                        'recorded_at' => $existing->created_at ? $existing->created_at->toIso8601String() : now()->toIso8601String(),
                    ];
                }

                if ($compData['date_replace'] || $rawHmReplace || $isReseal || $statusPenggantian === 'Recondition') {
                    $history[] = $newCycle;
                }

                $compData['replacement_history'] = $history;
                $existing->update($compData);
            } else {
                if ($compData['date_replace'] || $rawHmReplace || $isReseal || $statusPenggantian === 'Recondition') {
                    $compData['replacement_history'] = [$newCycle];
                } else {
                    $compData['replacement_history'] = [];
                }
                PcrUc::create($compData);
            }
        }

        return redirect()->back()->with('success', 'Data PCR massal berhasil diperbarui');
    }

    public function update(Request $request, PcrUc $pcr_uc)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'part_number' => 'required|string',
            'description' => 'nullable|string',
            'component' => 'nullable|string',
            'qty' => 'nullable|numeric',
            'target_life_time' => 'nullable|numeric',
            'hm_replace' => 'nullable|numeric',
            'date_replace' => 'nullable|date',
            'brand_produk' => 'nullable|string',
            'hm_current' => 'nullable|numeric',
            'worn_out' => 'nullable|numeric',
            'inspection_date' => 'nullable|date',
            'status_penggantian' => 'nullable|string',
        ]);

        $target = $validated['target_life_time'] ?? 0;
        $current = $validated['hm_current'] ?? 0;
        $statusPenggantian = $validated['status_penggantian'] ?? $pcr_uc->status_penggantian ?? 'Belum Diganti';
        if ($statusPenggantian === 'Sudah Diganti') {
            $statusPenggantian = 'NEW';
        }
        $isReseal = $statusPenggantian === 'Reseal';
        $rawHmReplace = $validated['hm_replace'] ?? 0;
        $prevHmReplace = $pcr_uc->hm_replace ?: 0;

        $wornOut = (isset($validated['worn_out']) && $validated['worn_out'] !== '' && $validated['worn_out'] !== null)
            ? min(100, max(0, (float) $validated['worn_out']))
            : null;

        if ($wornOut !== null && $target > 0) {
            $remaining = $target * ((100 - $wornOut) / 100);
            $validated['next_plant'] = $current + $remaining;
            $validated['life_time_pct'] = $wornOut;
            $validated['status'] = $wornOut >= 70 ? 'POOR' : ($wornOut >= 40 ? 'FAIR' : 'GOOD');
        } elseif ($isReseal) {
            // Reseal tidak mendapat umur lifetime component baru
            $validated['hm_replace'] = $prevHmReplace;
            $usageHm = max(0, $current - $prevHmReplace);
            $validated['next_plant'] = $pcr_uc->next_plant ?: ($prevHmReplace + $target);
            $pct = $target > 0 ? ($usageHm / $target) * 100 : 0;
            $validated['life_time_pct'] = $pct;
            $validated['status'] = $pct >= 70 ? 'POOR' : ($pct >= 40 ? 'FAIR' : 'GOOD');
        } elseif ($target > 0) {
            $validated['next_plant'] = $target + ($validated['hm_replace'] ?? $current);
            $pct = ($current / $target) * 100;
            $validated['life_time_pct'] = $pct;
            $validated['status'] = $pct >= 70 ? 'GOOD' : ($pct >= 40 ? 'FAIR' : 'POOR');
        } else {
            $validated['next_plant'] = 0;
            $validated['life_time_pct'] = 0;
            $validated['status'] = 'GOOD';
        }

        $validated['status_penggantian'] = $statusPenggantian;
        $validated['worn_out'] = $wornOut;
        $validated['inspection_date'] = ! empty($validated['inspection_date']) ? $validated['inspection_date'] : null;

        $history = $pcr_uc->replacement_history ?: [];
        if (empty($history) && ($pcr_uc->date_replace || $pcr_uc->hm_replace)) {
            $history[] = [
                'action' => 'Initial',
                'date_replace' => $pcr_uc->date_replace,
                'hm_replace' => $pcr_uc->hm_replace,
                'next_plant' => $pcr_uc->next_plant,
                'brand_produk' => $pcr_uc->brand_produk,
                'recorded_at' => $pcr_uc->created_at ? $pcr_uc->created_at->toIso8601String() : now()->toIso8601String(),
            ];
        }

        $currentCycle = [
            'action' => match ($statusPenggantian) {
                'Reseal' => 'Reseal',
                'Recondition' => 'Recondition',
                'Overhaul' => 'Overhaul',
                'NEW', 'Sudah Diganti' => 'Replace',
                default => 'Replace',
            },
            'status_penggantian' => $statusPenggantian,
            'date_replace' => $validated['date_replace'] ?? null,
            'hm_replace' => $rawHmReplace ?: $current,
            'next_plant' => $validated['next_plant'] ?? ($target + ($validated['hm_replace'] ?? $current)),
            'brand_produk' => $validated['brand_produk'] ?? null,
            'recorded_at' => now()->toIso8601String(),
            'notes' => $isReseal ? 'Reseal (lifetime tidak di-reset)' : ($statusPenggantian === 'Recondition' ? 'Recondition component' : ($wornOut !== null ? 'Inspection: '.$wornOut.'%' : null)),
        ];

        if (empty($history)) {
            $history[] = $currentCycle;
        } else {
            $lastIndex = count($history) - 1;
            if ($history[$lastIndex]['hm_replace'] != $rawHmReplace || $history[$lastIndex]['date_replace'] != $validated['date_replace'] || ($history[$lastIndex]['status_penggantian'] ?? '') !== $statusPenggantian) {
                $history[] = $currentCycle;
            } else {
                $history[$lastIndex] = $currentCycle;
            }
        }
        $validated['replacement_history'] = $history;

        $pcr_uc->update($validated);

        return redirect()->back()->with('success', $isReseal ? 'Data Reseal berhasil diperbarui (umur lifetime komponen tidak direset)' : 'Data PCR berhasil diperbarui');
    }

    public function destroy(PcrUc $pcr_uc)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $woId = $pcr_uc->maintenance_order_id;
        $pcr_uc->delete();

        if ($woId) {
            MaintenanceOrder::where('id', $woId)->delete();
        }

        return redirect()->back()->with('success', 'Data PCR dan Work Order berhasil dihapus');
    }

    public function destroyAll()
    {
        if (! auth()->user()?->hasAnyRole(['super-admin', 'admin'])) {
            abort(403, 'Akses ditolak: Hanya administrator yang diizinkan menghapus semua data PCR.');
        }

        // Delete all related maintenance orders first
        $woIds = PcrUc::whereNotNull('maintenance_order_id')->pluck('maintenance_order_id')->filter()->unique()->toArray();
        if (! empty($woIds)) {
            MaintenanceOrder::whereIn('id', $woIds)->delete();
        }

        // Delete all PCR records
        $count = PcrUc::count();
        PcrUc::query()->delete();

        return redirect()->back()->with('success', "Berhasil menghapus {$count} data PCR.");
    }

    public function import(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $request->validate([
            'file_base64' => 'required|string',
            'file_name' => ['required', 'string', 'regex:/\.(xlsx|xls|csv)$/i'],
        ]);

        try {
            $parts = explode(',', $request->file_base64);
            $base64Data = count($parts) > 1 ? $parts[1] : $parts[0];
            $fileData = base64_decode($base64Data);

            $safeFileName = basename($request->file_name);
            $tempPath = sys_get_temp_dir().'/'.uniqid('pcr_', true).'_'.$safeFileName;
            file_put_contents($tempPath, $fileData);

            $spreadsheet = IOFactory::load($tempPath);
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            $headerMap = null;

            foreach ($rows as $row) {
                // If header map not found yet, check if this row contains column titles
                if ($headerMap === null) {
                    $normalized = array_map(function ($val) {
                        return strtolower(trim((string) $val));
                    }, $row);

                    if (in_array('code unit', $normalized) || in_array('part number', $normalized)) {
                        $headerMap = [];
                        foreach ($normalized as $idx => $txt) {
                            if (str_contains($txt, 'code unit')) {
                                $headerMap['code_unit'] = $idx;
                            } elseif (str_contains($txt, 'part number')) {
                                $headerMap['part_number'] = $idx;
                            } elseif (str_contains($txt, 'description')) {
                                $headerMap['description'] = $idx;
                            } elseif (str_contains($txt, 'component')) {
                                $headerMap['component'] = $idx;
                            } elseif (str_contains($txt, 'brand') || str_contains($txt, 'vendor')) {
                                $headerMap['brand_produk'] = $idx;
                            } elseif (str_contains($txt, 'target')) {
                                $headerMap['target_life_time'] = $idx;
                            } elseif (str_contains($txt, 'hm replace')) {
                                $headerMap['hm_replace'] = $idx;
                            } elseif (str_contains($txt, 'date replace') || str_contains($txt, 'tanggal')) {
                                $headerMap['date_replace'] = $idx;
                            } elseif (str_contains($txt, 'current') || str_contains($txt, 'hm current')) {
                                $headerMap['hm_current'] = $idx;
                            }
                        }
                    }

                    continue;
                }

                $getVal = function ($key, $fallbackIdx) use ($headerMap, $row) {
                    if (isset($headerMap[$key]) && isset($row[$headerMap[$key]])) {
                        return $row[$headerMap[$key]];
                    }

                    return $row[$fallbackIdx] ?? null;
                };

                $codeUnit = trim((string) $getVal('code_unit', 0));
                $partNumber = trim((string) $getVal('part_number', 1));

                if (empty($codeUnit) || empty($partNumber) || strtolower($codeUnit) === 'code unit') {
                    continue;
                }

                $description = $getVal('description', 2);
                $component = $getVal('component', 3) ?: 'Undercarriage';

                // Check brand column
                $brand = null;
                if (isset($headerMap['brand_produk'])) {
                    $brand = $getVal('brand_produk', 4);
                    $rawTarget = $getVal('target_life_time', 5);
                    $rawHmReplace = $getVal('hm_replace', 6);
                    $rawDateReplace = $getVal('date_replace', 7);
                    $rawHmCurrent = $getVal('hm_current', 8);
                } elseif (! is_numeric($row[4] ?? null) && is_numeric($row[5] ?? null)) {
                    // New 9-column format
                    $brand = $row[4] ?? null;
                    $rawTarget = $row[5] ?? 0;
                    $rawHmReplace = $row[6] ?? 0;
                    $rawDateReplace = $row[7] ?? null;
                    $rawHmCurrent = $row[8] ?? 0;
                } else {
                    // Legacy 8-column format
                    $rawTarget = $row[4] ?? 0;
                    $rawHmReplace = $row[5] ?? 0;
                    $rawDateReplace = $row[6] ?? null;
                    $rawHmCurrent = $row[7] ?? 0;
                }

                $targetLifeTime = is_numeric($rawTarget) ? (float) $rawTarget : 0;
                $hmReplace = is_numeric($rawHmReplace) ? (float) $rawHmReplace : 0;
                $dateReplace = ! empty($rawDateReplace) && strtotime((string) $rawDateReplace) ? date('Y-m-d', strtotime((string) $rawDateReplace)) : null;
                $hmCurrent = is_numeric($rawHmCurrent) ? (float) $rawHmCurrent : 0;

                $unit = Unit::where('code_unit', $codeUnit)->first();
                if (! $unit) {
                    continue;
                }

                $target = $targetLifeTime;
                $current = $hmCurrent;
                $nextPlant = 0;
                $lifeTimePct = 0;
                $status = 'GOOD';

                if ($target > 0) {
                    $nextPlant = $target + ($hmReplace > 0 ? $hmReplace : $current);
                    $pct = ($current / $target) * 100;
                    $lifeTimePct = $pct;
                    $status = $pct >= 70 ? 'GOOD' : ($pct >= 40 ? 'FAIR' : 'POOR');
                }

                PcrUc::create([
                    'unit_id' => $unit->id,
                    'part_number' => $partNumber,
                    'description' => $description,
                    'component' => $component,
                    'brand_produk' => $brand,
                    'target_life_time' => $targetLifeTime,
                    'hm_replace' => $hmReplace,
                    'date_replace' => $dateReplace,
                    'hm_current' => $hmCurrent,
                    'life_time_pct' => $lifeTimePct,
                    'status' => $status,
                    'next_plant' => $nextPlant,
                ]);
            }

            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

            return redirect()->back()->with('success', 'Data Excel berhasil diimport');
        } catch (\Exception $e) {
            if (isset($tempPath) && file_exists($tempPath)) {
                unlink($tempPath);
            }

            return redirect()->back()->withErrors(['file_base64' => 'Gagal mengimport file: '.$e->getMessage()]);
        }
    }

    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template PCR & UC');
        $sheet->setShowGridLines(true);

        // Header Title
        $sheet->mergeCells('A1:I1');
        $sheet->setCellValue('A1', 'TEMPLATE IMPORT PCR & UNDERCARRIAGE (UC)');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(12)->getColor()->setRGB('FFFFFF');
        $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0B6E4F');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Headers
        $headers = [
            'A' => 'Code Unit',
            'B' => 'Part Number',
            'C' => 'Description',
            'D' => 'Component',
            'E' => 'Brand / Vendor',
            'F' => 'Target Life Time',
            'G' => 'HM Replace',
            'H' => 'Date Replace',
            'I' => 'HM Current',
        ];

        foreach ($headers as $col => $header) {
            $sheet->setCellValue($col.'2', $header);
            $sheet->getStyle($col.'2')->getFont()->setBold(true)->setSize(10)->getColor()->setRGB('FFFFFF');
            $sheet->getStyle($col.'2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('1E293B');
            $sheet->getStyle($col.'2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        }
        $sheet->getRowDimension(2)->setRowHeight(25);

        // Add Sample Rows
        $samples = [
            ['DZ-085-012', '14X-30-00142', 'Undercarriage Component', 'Carrier Roller RHF', 'KOMATSU', 3000, 1500, '2026-05-20', 1800],
            ['ME057', 'YA60038399', 'Undercarriage Component', 'Carrier Roller RHR', 'HITACHI', 3000, 0, '2026-06-15', 14561.5],
        ];

        $rowIdx = 3;
        foreach ($samples as $sample) {
            foreach ($sample as $colIdx => $value) {
                $column = Coordinate::stringFromColumnIndex($colIdx + 1);
                $sheet->setCellValue($column.$rowIdx, $value);
            }
            $sheet->getRowDimension($rowIdx)->setRowHeight(20);
            $rowIdx++;
        }

        // Borders
        $sheet->getStyle('A2:I'.($rowIdx - 1))->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'E2E8F0'],
                ],
            ],
        ]);

        // Auto-size columns
        foreach (range('A', 'I') as $columnID) {
            $sheet->getColumnDimension($columnID)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="template_pcr_uc.xlsx"');
        header('Cache-Control: max-age=0');

        $writer->save('php://output');
        exit;
    }

    private function applyCategoryScope($query, string $category): void
    {
        if ($category === 'component') {
            $query->where(function ($sub) {
                $sub->where('component', 'not like', '%CARRIER ROLLER%')
                    ->where('component', 'not like', '%TRACK ROLLER%')
                    ->where('component', 'not like', '%IDLER%')
                    ->where('component', 'not like', '%SEGMENT%')
                    ->where('component', 'not like', '%TRACK LINK%')
                    ->where('component', 'not like', '%TRACK SHOE%')
                    ->where('component', 'not like', '%SPROCKET%')
                    ->where('component', 'not like', '%GROUSER%')
                    ->where('component', 'not like', '%TRACK ADJUSTER%')
                    ->where('component', 'not like', '%UNDERCARRIAGE%')
                    ->where(function ($uc) {
                        $uc->whereNull('component')->orWhere('component', '!=', 'UC');
                    })
                    ->where(function ($d) {
                        $d->whereNull('description')->orWhere('description', 'not like', '%UNDERCARRIAGE%');
                    });
            });
        } elseif ($category !== 'all') {
            // Default: Undercarriage only
            $query->where(function ($sub) {
                $sub->where('component', 'like', '%CARRIER ROLLER%')
                    ->orWhere('component', 'like', '%TRACK ROLLER%')
                    ->orWhere('component', 'like', '%IDLER%')
                    ->orWhere('component', 'like', '%SEGMENT%')
                    ->orWhere('component', 'like', '%TRACK LINK%')
                    ->orWhere('component', 'like', '%TRACK SHOE%')
                    ->orWhere('component', 'like', '%SPROCKET%')
                    ->orWhere('component', 'like', '%GROUSER%')
                    ->orWhere('component', 'like', '%TRACK ADJUSTER%')
                    ->orWhere('component', 'like', '%UNDERCARRIAGE%')
                    ->orWhere('component', '=', 'UC')
                    ->orWhere('description', 'like', '%UNDERCARRIAGE%');
            });
        }
    }

    public function export(Request $request)
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setShowGridLines(true);

        // Query data with optional filters
        $query = PcrUc::with(['unit', 'maintenanceOrder']);
        $filterTexts = [];

        $category = $request->get('category', 'uc');
        $this->applyCategoryScope($query, $category);

        if ($category === 'component') {
            $bannerTitle = 'MONITORING PLAN COMPONENT REPLACEMENT (PCR GENERAL)';
            $filePrefix = 'PCR_Component_Report';
            $sheetTitle = 'PCR Component';
            $filterTexts[] = 'Kategori: General Component';
        } elseif ($category === 'all') {
            $bannerTitle = 'MONITORING PLAN COMPONENT REPLACEMENT & UNDERCARRIAGE (ALL)';
            $filePrefix = 'PCR_All_Report';
            $sheetTitle = 'Semua PCR & UC';
            $filterTexts[] = 'Kategori: Semua Komponen';
        } else {
            $bannerTitle = 'MONITORING PLAN COMPONENT REPLACEMENT - UNDERCARRIAGE (PCR UC)';
            $filePrefix = 'PCR_Undercarriage_Report';
            $sheetTitle = 'PCR Undercarriage';
            $filterTexts[] = 'Kategori: Undercarriage Only';
        }

        $sheet->setTitle(substr($sheetTitle, 0, 31));

        if ($request->filled('code_unit') && $request->code_unit !== 'All Unit') {
            $codeUnitFilter = $request->code_unit;
            $query->whereHas('unit', function ($q) use ($codeUnitFilter) {
                $q->where('code_unit', $codeUnitFilter);
            });
            $filterTexts[] = "Unit: {$codeUnitFilter}";
        }

        if ($request->filled('model') && $request->model !== 'All Model') {
            $modelFilter = $request->model;
            $query->whereHas('unit', function ($q) use ($modelFilter) {
                $q->where('model', $modelFilter);
            });
            $filterTexts[] = "Model: {$modelFilter}";
        }

        if ($request->filled('status') && $request->status !== 'All Status') {
            $statusFilter = $request->status;
            $query->where('status', $statusFilter);
            $filterTexts[] = "Status: {$statusFilter}";
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('component', 'like', "%{$search}%")
                    ->orWhere('part_number', 'like', "%{$search}%")
                    ->orWhere('brand_produk', 'like', "%{$search}%")
                    ->orWhereHas('unit', function ($qu) use ($search) {
                        $qu->where('code_unit', 'like', "%{$search}%")
                            ->orWhere('model', 'like', "%{$search}%");
                    });
            });
            $filterTexts[] = "Search: \"{$search}\"";
        }

        $data = $query->orderBy('unit_id')->orderBy('component')->get();

        // 1. CORPORATE HEADER BANNER
        $sheet->mergeCells('A1:O1');
        $sheet->setCellValue('A1', 'PT. MITRA ABADI MAHAKAM - PLANT DEPARTMENT');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('FFFFFF');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0B6E4F');
        $sheet->getRowDimension(1)->setRowHeight(28);

        $sheet->mergeCells('A2:O2');
        $sheet->setCellValue('A2', $bannerTitle);
        $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(11)->getColor()->setRGB('D1FAE5');
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle('A2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0B6E4F');
        $sheet->getRowDimension(2)->setRowHeight(22);

        $exportTime = now()->format('d/m/Y H:i');
        $filterSummary = ! empty($filterTexts) ? implode(' | ', $filterTexts) : 'Semua Unit';
        $sheet->mergeCells('A3:O3');
        $sheet->setCellValue('A3', "Tanggal Download: {$exportTime} WITA   |   Filter: {$filterSummary}   |   Total Komponen: ".count($data).' Item');
        $sheet->getStyle('A3')->getFont()->setItalic(true)->setSize(9)->getColor()->setRGB('A7F3D0');
        $sheet->getStyle('A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle('A3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('064E3B');
        $sheet->getRowDimension(3)->setRowHeight(18);

        $sheet->getRowDimension(4)->setRowHeight(8); // Spacer row

        // 2. TABLE HEADERS (Row 5)
        $headers = [
            'A' => 'NO',
            'B' => 'CODE UNIT',
            'C' => 'MODEL',
            'D' => 'PART NUMBER',
            'E' => 'COMPONENT',
            'F' => 'DESCRIPTION',
            'G' => 'BRAND / VENDOR',
            'H' => "TARGET\nLIFETIME (HRS)",
            'I' => "HM REPLACE\n(HRS)",
            'J' => 'DATE REPLACE',
            'K' => "CURRENT HM\n(HRS)",
            'L' => "REMAINING\n(HRS)",
            'M' => 'LIFETIME %',
            'N' => 'STATUS',
            'O' => "NEXT PLAN\nHM",
        ];

        foreach ($headers as $col => $header) {
            $cell = $col.'5';
            $sheet->setCellValue($cell, $header);
            $sheet->getStyle($cell)->getFont()->setBold(true)->setSize(9)->getColor()->setRGB('FFFFFF');
            $sheet->getStyle($cell)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('1E293B'); // Slate 800
            $sheet->getStyle($cell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER)->setWrapText(true);
        }
        $sheet->getRowDimension(5)->setRowHeight(32);

        $borderThin = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'E2E8F0'],
                ],
            ],
        ];
        $sheet->getStyle('A5:O5')->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '334155'],
                ],
            ],
        ]);

        // 3. PREPARE ROWS IN MEMORY (High performance)
        $rowsData = [];
        $rowIdx = 6;
        $no = 1;

        foreach ($data as $item) {
            $unit = $item->unit;
            $codeUnit = $unit ? $unit->code_unit : '-';
            $model = $unit ? $unit->model : '-';
            $partNumber = $item->part_number ?: '-';
            $component = $item->component ?: '-';
            $description = $item->description ?: '-';
            $brand = $item->brand_produk ?: '-';

            $targetLife = (float) ($item->target_life_time ?: 0);
            $currentHm = round($unit && $unit->hm !== null ? (float) $unit->hm : (float) ($item->hm_current ?: 0), 1);
            $hmReplace = round($item->hm_replace !== null ? (float) $item->hm_replace : 0, 1);
            $usageHm = max(0, $currentHm - $hmReplace);
            $remaining = round($targetLife - $usageHm, 1);

            // Clean date replace without concatenated brand
            $dateReplace = ! empty($item->date_replace) ? date('Y-m-d', strtotime($item->date_replace)) : '-';

            // Percentage as decimal for Excel percentage formatting (e.g. 0.8974 -> 89.7%)
            $lifeTimePct = 0;
            if ($item->life_time_pct !== null && (float) $item->life_time_pct > 0) {
                $lifeTimePct = round(((float) $item->life_time_pct / 100), 4);
            } elseif ($targetLife > 0) {
                $lifeTimePct = round(($usageHm / $targetLife), 4);
            }

            // Clean status string
            $rawStatus = strtoupper(trim((string) $item->status));
            if ($remaining < 0) {
                $statusStr = 'OVERDUE';
            } elseif ($rawStatus !== '' && $rawStatus !== '-') {
                $statusStr = $rawStatus;
            } elseif ($remaining <= 250 && $targetLife > 0) {
                $statusStr = 'DUE SOON';
            } else {
                $statusStr = 'GOOD';
            }

            $nextPlant = round((float) ($item->next_plant ?: ($hmReplace > 0 ? $hmReplace + $targetLife : $targetLife)), 1);

            $rowsData[] = [
                $no,
                $codeUnit,
                $model,
                $partNumber,
                $component,
                $description,
                $brand,
                $targetLife > 0 ? $targetLife : 0,
                $item->hm_replace !== null ? $hmReplace : 0,
                $dateReplace,
                $currentHm > 0 ? $currentHm : 0,
                $remaining,
                $lifeTimePct,
                $statusStr,
                $nextPlant > 0 ? $nextPlant : 0,
            ];

            $rowIdx++;
            $no++;
        }

        $lastDataRow = max(6, $rowIdx - 1);

        // Bulk insert all data rows
        $sheet->fromArray($rowsData, null, 'A6');

        // Set row heights
        $sheet->getDefaultRowDimension()->setRowHeight(20);

        // Bulk Range Styles
        $borderThin = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'E2E8F0'],
                ],
            ],
        ];
        $sheet->getStyle("A6:O{$lastDataRow}")->applyFromArray($borderThin);
        $sheet->getStyle("A6:O{$lastDataRow}")->getFont()->setSize(9);
        $sheet->getStyle("A6:O{$lastDataRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        // Column alignments & fonts
        $sheet->getStyle("A6:B{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("B6:B{$lastDataRow}")->getFont()->setBold(true);
        $sheet->getStyle("C6:C{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle("D6:D{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("D6:D{$lastDataRow}")->getFont()->setName('Consolas');
        $sheet->getStyle("E6:F{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle("E6:E{$lastDataRow}")->getFont()->setBold(true);
        $sheet->getStyle("G6:G{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("H6:I{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("J6:J{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("K6:M{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("N6:N{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("O6:O{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // Number Formats
        $sheet->getStyle("H6:H{$lastDataRow}")->getNumberFormat()->setFormatCode('#,##0');
        $sheet->getStyle("I6:I{$lastDataRow}")->getNumberFormat()->setFormatCode('#,##0.0');
        $sheet->getStyle("K6:L{$lastDataRow}")->getNumberFormat()->setFormatCode('#,##0.0');
        $sheet->getStyle("M6:M{$lastDataRow}")->getNumberFormat()->setFormatCode('0.0%');
        $sheet->getStyle("O6:O{$lastDataRow}")->getNumberFormat()->setFormatCode('#,##0.0');

        // Dynamic Conditional Formatting: Zebra rows
        $condZebra = new Conditional;
        $condZebra->setConditionType(Conditional::CONDITION_EXPRESSION);
        $condZebra->addCondition('MOD(ROW(),2)=0');
        $condZebra->getStyle()->getFill()->setFillType(Fill::FILL_SOLID)->getEndColor()->setRGB('F8FAFC');
        $sheet->getStyle("A6:O{$lastDataRow}")->setConditionalStyles([$condZebra]);

        // Dynamic Conditional Formatting: Remaining (L)
        $condNeg = new Conditional;
        $condNeg->setConditionType(Conditional::CONDITION_CELLIS);
        $condNeg->setOperatorType(Conditional::OPERATOR_LESSTHAN);
        $condNeg->addCondition('0');
        $condNeg->getStyle()->getFont()->getColor()->setRGB('DC2626');
        $condNeg->getStyle()->getFont()->setBold(true);

        $condPos = new Conditional;
        $condPos->setConditionType(Conditional::CONDITION_CELLIS);
        $condPos->setOperatorType(Conditional::OPERATOR_GREATERTHANOREQUAL);
        $condPos->addCondition('0');
        $condPos->getStyle()->getFont()->getColor()->setRGB('16A34A');
        $condPos->getStyle()->getFont()->setBold(true);

        $sheet->getStyle("L6:L{$lastDataRow}")->setConditionalStyles([$condNeg, $condPos]);

        // Dynamic Conditional Formatting: Status Badges (N)
        $createBadgeCond = function ($val, $bg, $text) {
            $cond = new Conditional;
            $cond->setConditionType(Conditional::CONDITION_CELLIS);
            $cond->setOperatorType(Conditional::OPERATOR_EQUAL);
            $cond->addCondition('"'.$val.'"');
            $cond->getStyle()->getFill()->setFillType(Fill::FILL_SOLID)->getEndColor()->setRGB($bg);
            $cond->getStyle()->getFont()->getColor()->setRGB($text);
            $cond->getStyle()->getFont()->setBold(true);

            return $cond;
        };

        $statusConditions = [
            $createBadgeCond('GOOD', 'DCFCE7', '15803D'),
            $createBadgeCond('ON SCHEDULE', 'DCFCE7', '15803D'),
            $createBadgeCond('NORMAL', 'DCFCE7', '15803D'),
            $createBadgeCond('FAIR', 'FEF3C7', 'B45309'),
            $createBadgeCond('DUE SOON', 'FEF3C7', 'B45309'),
            $createBadgeCond('WARNING', 'FEF3C7', 'B45309'),
            $createBadgeCond('POOR', 'FEE2E2', 'B91C1C'),
            $createBadgeCond('OVERDUE', 'FEE2E2', 'B91C1C'),
            $createBadgeCond('CRITICAL', 'FEE2E2', 'B91C1C'),
        ];
        $sheet->getStyle("N6:N{$lastDataRow}")->setConditionalStyles($statusConditions);

        // 4. SUMMARY ROW
        $r = $rowIdx;
        $sheet->mergeCells("A{$r}:G{$r}");
        $sheet->setCellValue("A{$r}", 'RATA-RATA / TOTAL DATA ('.count($data).' KOMPONEN)');
        $sheet->getStyle("A{$r}")->getFont()->setBold(true)->setSize(9)->getColor()->setRGB('0F172A');
        $sheet->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT)->setVertical(Alignment::VERTICAL_CENTER);

        if (count($data) > 0) {
            $sheet->setCellValue("H{$r}", "=AVERAGE(H6:H{$lastDataRow})");
            $sheet->getStyle("H{$r}")->getNumberFormat()->setFormatCode('#,##0');
            $sheet->setCellValue("I{$r}", '-');
            $sheet->setCellValue("J{$r}", '-');
            $sheet->setCellValue("K{$r}", "=AVERAGE(K6:K{$lastDataRow})");
            $sheet->getStyle("K{$r}")->getNumberFormat()->setFormatCode('#,##0.0');
            $sheet->setCellValue("L{$r}", "=AVERAGE(L6:L{$lastDataRow})");
            $sheet->getStyle("L{$r}")->getNumberFormat()->setFormatCode('#,##0.0');
            $sheet->setCellValue("M{$r}", "=AVERAGE(M6:M{$lastDataRow})");
            $sheet->getStyle("M{$r}")->getNumberFormat()->setFormatCode('0.0%');
            $sheet->setCellValue("N{$r}", count($data).' Item');
            $sheet->setCellValue("O{$r}", '-');
        }

        $summaryStyle = [
            'font' => ['bold' => true, 'size' => 9],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E2E8F0']],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            'borders' => [
                'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '64748B']],
                'bottom' => ['borderStyle' => Border::BORDER_DOUBLE, 'color' => ['rgb' => '0F172A']],
            ],
        ];
        $sheet->getStyle("A{$r}:O{$r}")->applyFromArray($summaryStyle);
        $sheet->getStyle("I{$r}:J{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle("N{$r}:O{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension($r)->setRowHeight(24);

        // 5. COLUMN WIDTHS & FREEZE
        $columnWidths = [
            'A' => 6,   // NO
            'B' => 16,  // CODE UNIT
            'C' => 22,  // MODEL
            'D' => 22,  // PART NUMBER
            'E' => 26,  // COMPONENT
            'F' => 32,  // DESCRIPTION
            'G' => 26,  // BRAND / VENDOR
            'H' => 16,  // TARGET LIFETIME
            'I' => 16,  // HM REPLACE
            'J' => 15,  // DATE REPLACE
            'K' => 16,  // CURRENT HM
            'L' => 16,  // REMAINING
            'M' => 15,  // LIFETIME %
            'N' => 16,  // STATUS
            'O' => 16,  // NEXT PLAN HM
        ];

        foreach ($columnWidths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        // Freeze below row 5 (headers stay fixed when scrolling down)
        $sheet->freezePane('A6');

        // Enable auto-filter on table headers
        $sheet->setAutoFilter('A5:O5');

        $writer = new Xlsx($spreadsheet);
        $fileName = "{$filePrefix}_".date('Ymd_His').'.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"{$fileName}\"");
        header('Cache-Control: max-age=0');

        $writer->save('php://output');
        exit;
    }

    public function exportPdf(Request $request)
    {
        ini_set('memory_limit', '1536M');
        set_time_limit(300);

        $query = PcrUc::with(['unit', 'maintenanceOrder']);
        $filterTexts = [];

        $category = $request->get('category', 'uc');
        $this->applyCategoryScope($query, $category);

        if ($category === 'component') {
            $reportTitle = 'Monitoring Plan Component Replacement (PCR General)';
            $filePrefix = 'PCR_Component_Report';
            $filterTexts[] = 'Kategori: General Component';
        } elseif ($category === 'all') {
            $reportTitle = 'Monitoring Plan Component Replacement & Undercarriage (ALL)';
            $filePrefix = 'PCR_All_Report';
            $filterTexts[] = 'Kategori: Semua Komponen';
        } else {
            $reportTitle = 'Monitoring Plan Component Replacement - Undercarriage (PCR UC)';
            $filePrefix = 'PCR_Undercarriage_Report';
            $filterTexts[] = 'Kategori: Undercarriage Only';
        }

        if ($request->filled('code_unit') && $request->code_unit !== 'All Unit') {
            $codeUnitFilter = $request->code_unit;
            $query->whereHas('unit', function ($q) use ($codeUnitFilter) {
                $q->where('code_unit', $codeUnitFilter);
            });
            $filterTexts[] = "Unit: {$codeUnitFilter}";
        }

        if ($request->filled('model') && $request->model !== 'All Model') {
            $modelFilter = $request->model;
            $query->whereHas('unit', function ($q) use ($modelFilter) {
                $q->where('model', $modelFilter);
            });
            $filterTexts[] = "Model: {$modelFilter}";
        }

        if ($request->filled('status') && $request->status !== 'All Status') {
            $statusFilter = $request->status;
            $query->where('status', $statusFilter);
            $filterTexts[] = "Status: {$statusFilter}";
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('component', 'like', "%{$search}%")
                    ->orWhere('part_number', 'like', "%{$search}%")
                    ->orWhere('brand_produk', 'like', "%{$search}%")
                    ->orWhereHas('unit', function ($qu) use ($search) {
                        $qu->where('code_unit', 'like', "%{$search}%")
                            ->orWhere('model', 'like', "%{$search}%");
                    });
            });
            $filterTexts[] = "Search: \"{$search}\"";
        }

        $rawItems = $query->orderBy('unit_id')->orderBy('component')->get();

        $stats = [
            'total' => $rawItems->count(),
            'good' => 0,
            'due_soon' => 0,
            'overdue' => 0,
        ];

        $items = $rawItems->map(function ($item) use (&$stats) {
            $unit = $item->unit;
            $targetLife = (float) ($item->target_life_time ?: 0);
            $currentHm = round($unit && $unit->hm !== null ? (float) $unit->hm : (float) ($item->hm_current ?: 0), 1);
            $hmReplace = round($item->hm_replace !== null ? (float) $item->hm_replace : 0, 1);
            $usageHm = max(0, $currentHm - $hmReplace);
            $remaining = round($targetLife - $usageHm, 1);
            $dateReplace = ! empty($item->date_replace) ? date('Y-m-d', strtotime($item->date_replace)) : '-';

            $lifeTimePct = 0;
            if ($item->life_time_pct !== null && (float) $item->life_time_pct > 0) {
                $lifeTimePct = round((float) $item->life_time_pct, 1);
            } elseif ($targetLife > 0) {
                $lifeTimePct = round(($usageHm / $targetLife) * 100, 1);
            }

            $rawStatus = strtoupper(trim((string) $item->status));
            if ($remaining < 0) {
                $statusStr = 'OVERDUE';
                $stats['overdue']++;
            } elseif ($remaining < 250) {
                $statusStr = 'DUE SOON';
                $stats['due_soon']++;
            } else {
                $statusStr = 'GOOD';
                $stats['good']++;
            }

            $nextPlant = round((float) ($item->next_plant ?: ($hmReplace > 0 ? $hmReplace + $targetLife : $targetLife)), 1);

            return (object) [
                'code_unit' => $unit ? $unit->code_unit : '-',
                'model' => $unit ? $unit->model : '-',
                'part_number' => $item->part_number ?: '-',
                'component' => $item->component ?: '-',
                'description' => $item->description ?: '-',
                'brand_produk' => $item->brand_produk ?: '-',
                'target_life_time' => $targetLife,
                'hm_replace' => $hmReplace,
                'date_replace' => $dateReplace,
                'hm_current' => $currentHm,
                'remaining' => $remaining,
                'life_time_pct' => $lifeTimePct,
                'status' => $statusStr,
                'next_plant' => $nextPlant,
            ];
        });

        $pdf = Pdf::loadView('pdf.pcr-uc-report', [
            'title' => $reportTitle,
            'company' => 'PT. MITRA ABADI MAHAKAM',
            'department' => 'PLANT DEPARTMENT — MAINTENANCE & RELIABILITY',
            'items' => $items,
            'stats' => $stats,
            'filterSummary' => ! empty($filterTexts) ? implode(' | ', $filterTexts) : 'Semua Unit',
            'generatedAt' => now()->format('d/m/Y H:i').' WITA',
        ])->setPaper('a4', 'landscape');

        return $pdf->download("{$filePrefix}_".date('Ymd_His').'.pdf');
    }
}
