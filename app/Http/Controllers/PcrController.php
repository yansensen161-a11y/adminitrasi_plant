<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceOrder;
use App\Models\PcrUc;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
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
            $usageHm = max(0, $currentHm - $hmReplace);
            $sisaHm = $targetLifeTime - $usageHm;

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
                'equipment' => $unit->type_unit ?? ($unit->equipment_capacity ?? '-'),
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

    public function store(Request $request)
    {
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
        ]);

        $target = $validated['target_life_time'] ?? 0;
        $current = $validated['hm_current'] ?? 0;

        if ($target > 0) {
            $validated['next_plant'] = $target + $current;
            $pct = ($current / $target) * 100;
            $validated['life_time_pct'] = $pct;
            $validated['status'] = $pct >= 70 ? 'GOOD' : ($pct >= 40 ? 'FAIR' : 'POOR');
        } else {
            $validated['next_plant'] = 0;
            $validated['life_time_pct'] = 0;
            $validated['status'] = 'GOOD';
        }

        // Generate WO for PCR
        $wo = MaintenanceOrder::create([
            'wo_type' => 'PCR',
            'no_order' => 'PCR-'.now()->format('YmdHis').'-'.rand(100, 999),
            'tanggal' => $validated['date_replace'] ?? now()->format('Y-m-d'),
            'unit_id' => $validated['unit_id'],
            'hm' => $validated['hm_replace'],
            'priority' => 'Medium',
            'status' => 'OPEN',
            'downtime_start' => $validated['date_replace'] ?? null,
            'action_taken' => 'Replace '.$validated['component'].' - '.$validated['part_number'],
        ]);

        $validated['maintenance_order_id'] = $wo->id;

        $existing = PcrUc::where('unit_id', $validated['unit_id'])
            ->where('component', $validated['component'])
            ->first();

        $newCycle = [
            'date_replace' => $validated['date_replace'] ?? null,
            'hm_replace' => $validated['hm_replace'] ?? null,
            'next_plant' => $validated['next_plant'] ?? ($target + ($validated['hm_replace'] ?? $current)),
            'brand_produk' => $validated['brand_produk'] ?? null,
            'recorded_at' => now()->toIso8601String(),
        ];

        if ($existing) {
            $history = $existing->replacement_history ?: [];
            if (empty($history) && ($existing->date_replace || $existing->hm_replace)) {
                $history[] = [
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

        return redirect()->back()->with('success', 'Data PCR dan Work Order berhasil ditambahkan');
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'hm_current' => 'nullable|numeric',
            'components' => 'required|array',
            'components.*.id' => 'nullable|string',
            'components.*.part_number' => 'required|string',
            'components.*.component' => 'nullable|string',
            'components.*.name' => 'nullable|string',
            'components.*.description' => 'nullable|string',
            'components.*.qty' => 'nullable|numeric',
            'components.*.target_life_time' => 'nullable|numeric',
            'components.*.hm_replace' => 'nullable|numeric',
            'components.*.date_replace' => 'nullable|date',
            'components.*.brand_produk' => 'nullable|string',
            'components.*.worn_out' => 'nullable|numeric',
            'components.*.inspection_date' => 'nullable|date',
            'components.*.status_penggantian' => 'nullable|string',
        ]);

        $unit_id = $validated['unit_id'];
        $current = $validated['hm_current'] ?? 0;

        foreach ($validated['components'] as $index => $comp) {
            // Skip components that are not updated (e.g., if they were not checked in the frontend, though frontend should only send checked ones)
            $target = $comp['target_life_time'] ?? 0;

            // Re-calculate
            $wornOut = (isset($comp['worn_out']) && $comp['worn_out'] !== '') ? min(100, max(0, (float) $comp['worn_out'])) : null;
            $hmReplace = $comp['hm_replace'] ?? 0;

            $next_plant = 0;
            $life_time_pct = 0;

            if ($target > 0) {
                if ($wornOut !== null) {
                    $remaining = $target * ((100 - $wornOut) / 100);
                    $next_plant = $current + $remaining;
                    $life_time_pct = $wornOut;
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
                'description' => $comp['description'] ?? null,
                'target_life_time' => $target,
                'hm_replace' => $hmReplace,
                'date_replace' => $comp['date_replace'] ?? null,
                'brand_produk' => $comp['brand_produk'] ?? null,
                'worn_out' => $comp['worn_out'] ?? null,
                'inspection_date' => $comp['inspection_date'] ?? null,
                'status_penggantian' => $comp['status_penggantian'] ?? 'Sudah Diganti',
                'hm_current' => $current,
                'next_plant' => $next_plant,
                'life_time_pct' => $life_time_pct,
                'status' => $status,
            ];

            // Generate WO if replaced
            if (! empty($compData['date_replace']) && ! empty($compData['hm_replace'])) {
                $wo = MaintenanceOrder::create([
                    'wo_type' => 'PCR',
                    'no_order' => 'PCR-'.now()->format('YmdHis').'-'.rand(100, 999).'-'.$index,
                    'tanggal' => $compData['date_replace'],
                    'unit_id' => $unit_id,
                    'hm' => $compData['hm_replace'],
                    'priority' => 'Medium',
                    'status' => 'OPEN',
                    'downtime_start' => $compData['date_replace'],
                    'action_taken' => 'Replace '.$compData['component'].' - '.$compData['part_number'],
                ]);
                $compData['maintenance_order_id'] = $wo->id;
            }

            $existing = null;
            if (! empty($comp['id'])) {
                $existing = PcrUc::find($comp['id']);
            }
            if (! $existing) {
                $existing = PcrUc::where('unit_id', $unit_id)
                    ->where('component', $compData['component'])
                    ->first();
            }

            $newCycle = [
                'date_replace' => $compData['date_replace'],
                'hm_replace' => $compData['hm_replace'],
                'next_plant' => $next_plant,
                'brand_produk' => $compData['brand_produk'],
                'recorded_at' => now()->toIso8601String(),
            ];

            if ($existing) {
                $history = $existing->replacement_history ?: [];
                // if history is empty but existing has data, seed history
                if (empty($history) && ($existing->date_replace || $existing->hm_replace)) {
                    $history[] = [
                        'date_replace' => $existing->date_replace,
                        'hm_replace' => $existing->hm_replace,
                        'next_plant' => $existing->next_plant,
                        'brand_produk' => $existing->brand_produk,
                        'recorded_at' => $existing->created_at ? $existing->created_at->toIso8601String() : now()->toIso8601String(),
                    ];
                }

                // only add to history if there is actual replacement date/hm
                if ($compData['date_replace'] || $compData['hm_replace']) {
                    $history[] = $newCycle;
                }

                $compData['replacement_history'] = $history;
                $existing->update($compData);
            } else {
                if ($compData['date_replace'] || $compData['hm_replace']) {
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
        $validated = $request->validate([
            'unit_id' => 'required|exists:units,id',
            'part_number' => 'required|string',
            'description' => 'nullable|string',
            'component' => 'nullable|string',
            'target_life_time' => 'nullable|numeric',
            'hm_replace' => 'nullable|numeric',
            'date_replace' => 'nullable|date',
            'brand_produk' => 'nullable|string',
            'hm_current' => 'nullable|numeric',
        ]);

        $target = $validated['target_life_time'] ?? 0;
        $current = $validated['hm_current'] ?? 0;

        if ($target > 0) {
            $validated['next_plant'] = $target + ($validated['hm_replace'] ?? $current);
            $pct = ($current / $target) * 100;
            $validated['life_time_pct'] = $pct;
            $validated['status'] = $pct >= 70 ? 'GOOD' : ($pct >= 40 ? 'FAIR' : 'POOR');
        } else {
            $validated['next_plant'] = 0;
            $validated['life_time_pct'] = 0;
            $validated['status'] = 'GOOD';
        }

        if ($pcr_uc->maintenance_order_id) {
            MaintenanceOrder::where('id', $pcr_uc->maintenance_order_id)->update([
                'tanggal' => $validated['date_replace'] ?? $pcr_uc->date_replace,
                'unit_id' => $validated['unit_id'],
                'hm' => $validated['hm_replace'],
                'action_taken' => 'Replace '.$validated['component'].' - '.$validated['part_number'],
            ]);
        }

        $history = $pcr_uc->replacement_history ?: [];
        if (empty($history) && ($pcr_uc->date_replace || $pcr_uc->hm_replace)) {
            $history[] = [
                'date_replace' => $pcr_uc->date_replace,
                'hm_replace' => $pcr_uc->hm_replace,
                'next_plant' => $pcr_uc->next_plant,
                'brand_produk' => $pcr_uc->brand_produk,
                'recorded_at' => $pcr_uc->created_at ? $pcr_uc->created_at->toIso8601String() : now()->toIso8601String(),
            ];
        }

        $currentCycle = [
            'date_replace' => $validated['date_replace'] ?? null,
            'hm_replace' => $validated['hm_replace'] ?? null,
            'next_plant' => $validated['next_plant'] ?? ($target + ($validated['hm_replace'] ?? $current)),
            'brand_produk' => $validated['brand_produk'] ?? null,
            'recorded_at' => now()->toIso8601String(),
        ];

        if (empty($history)) {
            $history[] = $currentCycle;
        } else {
            $lastIndex = count($history) - 1;
            if ($history[$lastIndex]['hm_replace'] != $validated['hm_replace'] || $history[$lastIndex]['date_replace'] != $validated['date_replace']) {
                $history[] = $currentCycle;
            } else {
                $history[$lastIndex] = $currentCycle;
            }
        }
        $validated['replacement_history'] = $history;

        $pcr_uc->update($validated);

        return redirect()->back()->with('success', 'Data PCR berhasil diperbarui');
    }

    public function destroy(PcrUc $pcr_uc)
    {
        $woId = $pcr_uc->maintenance_order_id;
        $pcr_uc->delete();

        if ($woId) {
            MaintenanceOrder::where('id', $woId)->delete();
        }

        return redirect()->back()->with('success', 'Data PCR dan Work Order berhasil dihapus');
    }

    public function destroyAll()
    {
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
        $request->validate([
            'file_base64' => 'required|string',
            'file_name' => 'required|string',
        ]);

        try {
            $base64Data = explode(',', $request->file_base64)[1];
            $fileData = base64_decode($base64Data);

            $tempPath = sys_get_temp_dir().'/'.uniqid().'_'.$request->file_name;
            file_put_contents($tempPath, $fileData);

            $spreadsheet = IOFactory::load($tempPath);
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Assume first row is header
            $headerSkipped = false;
            foreach ($rows as $row) {
                if (! $headerSkipped) {
                    $headerSkipped = true;

                    continue;
                }

                // Format: Code Unit | Part Number | Description | Component | Target Life Time | HM Replace | Date Replace | HM Current
                if (empty($row[0]) || empty($row[1])) {
                    continue;
                }

                $codeUnit = $row[0];
                $partNumber = $row[1];
                $description = $row[2] ?? null;
                $component = $row[3] ?? 'Undercarriage';
                $targetLifeTime = is_numeric($row[4]) ? $row[4] : 0;
                $hmReplace = is_numeric($row[5]) ? $row[5] : 0;
                $dateReplace = ! empty($row[6]) && strtotime($row[6]) ? date('Y-m-d', strtotime($row[6])) : null;
                $hmCurrent = is_numeric($row[7]) ? $row[7] : 0;

                $unit = Unit::where('code_unit', $codeUnit)->first();
                if (! $unit) {
                    continue;
                } // Skip if unit not found

                $target = $targetLifeTime;
                $current = $hmCurrent;
                $nextPlant = 0;
                $lifeTimePct = 0;
                $status = 'GOOD';

                if ($target > 0) {
                    $nextPlant = $target + $current;
                    $pct = ($current / $target) * 100;
                    $lifeTimePct = $pct;
                    $status = $pct >= 70 ? 'GOOD' : ($pct >= 40 ? 'FAIR' : 'POOR');
                }

                PcrUc::create([
                    'unit_id' => $unit->id,
                    'part_number' => $partNumber,
                    'description' => $description,
                    'component' => $component,
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

        // Set Headers
        $headers = ['Code Unit', 'Part Number', 'Description', 'Component', 'Target Life Time', 'HM Replace', 'Date Replace', 'HM Current'];
        foreach ($headers as $index => $header) {
            $column = Coordinate::stringFromColumnIndex($index + 1);
            $sheet->setCellValue($column.'1', $header);
            $sheet->getStyle($column.'1')->getFont()->setBold(true);
        }

        // Add Sample Row
        $sample = ['DZ-085-012', '14X-30-00142', 'Carrier Roller', 'Undercarriage', '3000', '1500', '2026-05-20', '1800'];
        foreach ($sample as $index => $value) {
            $column = Coordinate::stringFromColumnIndex($index + 1);
            $sheet->setCellValue($column.'2', $value);
        }

        // Auto-size columns
        foreach (range('A', 'H') as $columnID) {
            $sheet->getColumnDimension($columnID)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="template_pcr_uc.xlsx"');
        header('Cache-Control: max-age=0');

        $writer->save('php://output');
        exit;
    }

    public function export()
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // Set Headers
        $headers = ['Code Unit', 'Model', 'Part Number', 'Description', 'Component', 'Target Life Time', 'HM Replace', 'Date Replace', 'HM Current', 'Life Time Pct', 'Status', 'Next Plant'];
        foreach ($headers as $index => $header) {
            $column = Coordinate::stringFromColumnIndex($index + 1);
            $sheet->setCellValue($column.'1', $header);
            $sheet->getStyle($column.'1')->getFont()->setBold(true);
        }

        $data = PcrUc::with('unit')->get();
        $row = 2;
        foreach ($data as $item) {
            $sheet->setCellValue('A'.$row, $item->unit ? $item->unit->code_unit : '-');
            $sheet->setCellValue('B'.$row, $item->unit ? $item->unit->model : '-');
            $sheet->setCellValue('C'.$row, $item->part_number);
            $sheet->setCellValue('D'.$row, $item->description);
            $sheet->setCellValue('E'.$row, $item->component);
            $sheet->setCellValue('F'.$row, $item->target_life_time);
            $sheet->setCellValue('G'.$row, $item->hm_replace);
            $sheet->setCellValue('H'.$row, $item->date_replace.($item->brand_produk ? ' - '.$item->brand_produk : ''));
            $sheet->setCellValue('I'.$row, $item->hm_current);
            $sheet->setCellValue('J'.$row, $item->life_time_pct.'%');
            $sheet->setCellValue('K'.$row, $item->status);
            $sheet->setCellValue('L'.$row, $item->next_plant);
            $row++;
        }

        foreach (range('A', 'L') as $columnID) {
            $sheet->getColumnDimension($columnID)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="pcr_uc_export.xlsx"');
        header('Cache-Control: max-age=0');

        $writer->save('php://output');
        exit;
    }
}
