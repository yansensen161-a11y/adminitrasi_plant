<?php

namespace App\Http\Controllers;

use App\Models\MonthlyBudgetForecast;
use App\Models\Unit;
use App\Models\UnitApl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PdfForecastController extends Controller
{
    public function index(): Response
    {
        if (MonthlyBudgetForecast::count() === 0) {
            $this->seedFromStaticData();
        }

        if (MonthlyBudgetForecast::whereIn('tab', ['BULLDOZER', 'EXCAVATOR', 'DUMP TRUCK', 'DEWATERING', 'OHT'])->count() === 0) {
            $this->seedHeavyEquipmentData();
        }

        $allRecords = MonthlyBudgetForecast::orderBy('id', 'asc')->get();

        $pdfData = [];
        foreach ($allRecords->groupBy('tab') as $tabName => $tabRecords) {
            $pdfData[$tabName] = [];
            foreach ($tabRecords->groupBy('code_unit') as $codeUnit => $unitRecords) {
                $first = $unitRecords->first();
                $items = $unitRecords->map(function ($rec, $idx) {
                    return [
                        'id' => $rec->id,
                        'no' => $rec->no ?: ($idx + 1),
                        'code_budget' => $rec->code_budget ?? '',
                        'cost_element' => $rec->cost_element ?? '',
                        'code_depart' => $rec->code_depart ?? '',
                        'uraian' => $rec->uraian ?? '',
                        'std_qty' => $rec->std_qty ?? '',
                        'forecast_qty' => $rec->forecast_qty ?? '',
                        'satuan' => $rec->satuan ?? '',
                        'unit_rate' => (float) $rec->unit_rate,
                        'amount' => (float) $rec->amount,
                    ];
                })->values()->toArray();

                $pdfData[$tabName][] = [
                    'code_unit' => $codeUnit,
                    'type_unit' => $first->type_unit ?? $codeUnit,
                    'hm' => $first->hm ?? '',
                    'items' => $items,
                ];
            }
        }

        // Custom Priority Order for Tabs: Bulldozer, Excavator, Dump Truck, Dewatering, OHT first
        $priorityOrder = [
            'BULLDOZER',
            'EXCAVATOR',
            'DUMP TRUCK',
            'DEWATERING',
            'OHT',
            'CAT 14',
            'GD755-5R',
            'SEM 922 AWD',
            'COMPACTOR SSR220C',
            'LIGHT VEHICLE',
            'WATER PUMP',
            'TOOLS',
            'ATK',
            'PRAMAC',
            'HIMOINSA',
        ];

        $rawTabs = array_keys($pdfData);
        usort($rawTabs, function ($a, $b) use ($priorityOrder) {
            $posA = array_search(strtoupper($a), $priorityOrder);
            $posB = array_search(strtoupper($b), $priorityOrder);
            $idxA = $posA === false ? 999 : $posA;
            $idxB = $posB === false ? 999 : $posB;

            return $idxA === $idxB ? strcmp($a, $b) : $idxA - $idxB;
        });
        $pdfTabs = $rawTabs;

        $totalAmount = (float) $allRecords->sum('amount');
        $plannedAmount = (float) $allRecords->filter(fn ($r) => stripos($r->cost_element ?? '', 'PM') !== false || stripos($r->cost_element ?? '', 'Oil') !== false)->sum('amount');
        $correctiveAmount = (float) $allRecords->filter(fn ($r) => stripos($r->cost_element ?? '', 'Corrective') !== false || stripos($r->cost_element ?? '', 'Tools') !== false)->sum('amount');
        $projectAmount = max(0, $totalAmount - $plannedAmount - $correctiveAmount);

        $pctPlanned = $totalAmount > 0 ? round(($plannedAmount / $totalAmount) * 100, 1).'%' : '61.8%';
        $pctCorrective = $totalAmount > 0 ? round(($correctiveAmount / $totalAmount) * 100, 1).'%' : '31.2%';
        $pctProject = $totalAmount > 0 ? round(($projectAmount / $totalAmount) * 100, 1).'%' : '7.0%';

        $kpiBudget = [
            'total_forecast' => ['amount' => number_format($totalAmount, 0, ',', ','), 'vs_realisasi' => '8.5%', 'color' => '#3b82f6'],
            'planned_maintenance' => ['amount' => number_format($plannedAmount, 0, ',', ','), 'pct' => $pctPlanned, 'color' => '#10b981'],
            'corrective_maintenance' => ['amount' => number_format($correctiveAmount, 0, ',', ','), 'pct' => $pctCorrective, 'color' => '#facc15'],
            'project_improvement' => ['amount' => number_format($projectAmount, 0, ',', ','), 'pct' => $pctProject, 'color' => '#ef4444'],
        ];

        // Charts Data
        $chartForecastRealisasi = [
            'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            'forecast' => [1000, 1030, 1060, 1090, 1060, 1100, 1100, 1140, 1120, 1070, 1040, 1010],
            'realisasi' => [920, 950, 980, 990, 970, 1000, 1010, 1050, 1020, 980, 960, 930],
        ];

        $chartDistribusiKategori = [
            ['name' => 'Planned Maintenance', 'value' => (int) round($plannedAmount / 1000000), 'pct' => $pctPlanned, 'color' => '#10b981'],
            ['name' => 'Corrective Maintenance', 'value' => (int) round($correctiveAmount / 1000000), 'pct' => $pctCorrective, 'color' => '#3b82f6'],
            ['name' => 'Project / Improvement', 'value' => (int) round($projectAmount / 1000000), 'pct' => $pctProject, 'color' => '#facc15'],
        ];

        // Top Equipment / Unit Tabs
        $tabTotals = $allRecords->groupBy('tab')->map->sum('amount')->sortDesc();
        $palette = ['#10b981', '#3b82f6', '#facc15', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
        $chartTopUnit = [];
        $colorIdx = 0;
        foreach ($tabTotals->take(5) as $tabName => $tabSum) {
            $chartTopUnit[] = [
                'name' => $tabName,
                'value' => (int) round($tabSum / 1000000),
                'color' => $palette[$colorIdx % count($palette)],
            ];
            $colorIdx++;
        }

        // Master Units list for Add Entry modal auto-suggestion
        $unitsMaster = Unit::select('code_unit', 'type_unit', 'model', 'hm')
            ->orderBy('code_unit')
            ->get()
            ->map(function ($u) {
                $code = strtoupper($u->code_unit);
                $type = strtoupper($u->type_unit ?? '');
                $category = 'OTHER';

                if (str_contains($type, 'DOZER') || str_starts_with($code, 'MD0')) {
                    $category = 'BULLDOZER';
                } elseif (str_contains($type, 'EXCAVATOR') || str_starts_with($code, 'ME0') || str_starts_with($code, 'EX')) {
                    $category = 'EXCAVATOR';
                } elseif (str_contains($type, 'DUMP TRUCK') || str_starts_with($code, 'MDT') || str_starts_with($code, 'DT')) {
                    $category = 'DUMP TRUCK';
                } elseif (str_contains($type, 'DEWATERING') || str_starts_with($code, 'MWP') || str_starts_with($code, 'MWF')) {
                    $category = 'DEWATERING';
                } elseif (str_contains($type, 'HAULER') || str_starts_with($code, 'OHT')) {
                    $category = 'OHT';
                }

                return [
                    'code_unit' => $u->code_unit,
                    'type_unit' => $u->type_unit ?: ($u->model ?: $u->code_unit),
                    'model' => $u->model,
                    'hm' => (string) ($u->hm ?? ''),
                    'category' => $category,
                ];
            });

        // Main Table: Detail Forecast Budget Monthly (Jan - Dec)
        $tableDetailForecast = [
            ['no' => 1, 'bulan' => 'Jan', 'planned' => '620,000,000', 'corrective' => '310,000,000', 'project' => '70,000,000', 'total' => '1,000,000,000', 'realisasi' => '920,000,000', 'selisih' => '+8.7%', 'status' => 'On Track'],
            ['no' => 2, 'bulan' => 'Feb', 'planned' => '640,000,000', 'corrective' => '320,000,000', 'project' => '70,000,000', 'total' => '1,030,000,000', 'realisasi' => '950,000,000', 'selisih' => '+8.4%', 'status' => 'On Track'],
            ['no' => 3, 'bulan' => 'Mar', 'planned' => '650,000,000', 'corrective' => '330,000,000', 'project' => '80,000,000', 'total' => '1,060,000,000', 'realisasi' => '980,000,000', 'selisih' => '+8.2%', 'status' => 'On Track'],
            ['no' => 4, 'bulan' => 'Apr', 'planned' => '670,000,000', 'corrective' => '340,000,000', 'project' => '80,000,000', 'total' => '1,090,000,000', 'realisasi' => '990,000,000', 'selisih' => '+10.1%', 'status' => 'On Track'],
            ['no' => 5, 'bulan' => 'May', 'planned' => '650,000,000', 'corrective' => '330,000,000', 'project' => '80,000,000', 'total' => '1,060,000,000', 'realisasi' => '970,000,000', 'selisih' => '+9.3%', 'status' => 'On Track'],
            ['no' => 6, 'bulan' => 'Jun', 'planned' => '680,000,000', 'corrective' => '340,000,000', 'project' => '80,000,000', 'total' => '1,100,000,000', 'realisasi' => '1,000,000,000', 'selisih' => '+10.0%', 'status' => 'On Track'],
            ['no' => 7, 'bulan' => 'Jul', 'planned' => '680,000,000', 'corrective' => '340,000,000', 'project' => '80,000,000', 'total' => '1,100,000,000', 'realisasi' => '1,010,000,000', 'selisih' => '+8.9%', 'status' => 'On Track'],
            ['no' => 8, 'bulan' => 'Aug', 'planned' => '700,000,000', 'corrective' => '360,000,000', 'project' => '80,000,000', 'total' => '1,140,000,000', 'realisasi' => '1,050,000,000', 'selisih' => '+8.6%', 'status' => 'On Track'],
            ['no' => 9, 'bulan' => 'Sep', 'planned' => '690,000,000', 'corrective' => '350,000,000', 'project' => '80,000,000', 'total' => '1,120,000,000', 'realisasi' => '1,020,000,000', 'selisih' => '+9.8%', 'status' => 'On Track'],
            ['no' => 10, 'bulan' => 'Oct', 'planned' => '660,000,000', 'corrective' => '340,000,000', 'project' => '70,000,000', 'total' => '1,070,000,000', 'realisasi' => '980,000,000', 'selisih' => '+9.2%', 'status' => 'On Track'],
            ['no' => 11, 'bulan' => 'Nov', 'planned' => '640,000,000', 'corrective' => '330,000,000', 'project' => '70,000,000', 'total' => '1,040,000,000', 'realisasi' => '960,000,000', 'selisih' => '+8.3%', 'status' => 'On Track'],
            ['no' => 12, 'bulan' => 'Dec', 'planned' => '620,000,000', 'corrective' => '320,000,000', 'project' => '70,000,000', 'total' => '1,010,000,000', 'realisasi' => '930,000,000', 'selisih' => '+8.6%', 'status' => 'On Track'],
        ];

        $rekapDepartment = [
            ['no' => 1, 'dept' => 'Plant', 'forecast' => '8,950,000,000', 'pct' => '70.8%'],
            ['no' => 2, 'dept' => 'Workshop', 'forecast' => '2,150,000,000', 'pct' => '17.0%'],
            ['no' => 3, 'dept' => 'Tyre', 'forecast' => '980,000,000', 'pct' => '7.8%'],
            ['no' => 4, 'dept' => 'Electrical', 'forecast' => '570,000,000', 'pct' => '4.5%'],
        ];

        $rekapKategori = [
            ['no' => 1, 'kategori' => 'Planned Maintenance', 'forecast' => '7,820,000,000', 'pct' => '61.8%'],
            ['no' => 2, 'kategori' => 'Corrective Maintenance', 'forecast' => '3,950,000,000', 'pct' => '31.2%'],
            ['no' => 3, 'kategori' => 'Project / Improvement', 'forecast' => '880,000,000', 'pct' => '7.0%'],
        ];

        return Inertia::render('PdfForecast/Index', [
            'kpiBudget' => $kpiBudget,
            'chartForecastRealisasi' => $chartForecastRealisasi,
            'chartDistribusiKategori' => $chartDistribusiKategori,
            'chartTopUnit' => $chartTopUnit,
            'tableDetailForecast' => $tableDetailForecast,
            'rekapDepartment' => $rekapDepartment,
            'rekapKategori' => $rekapKategori,
            'pdfTabs' => $pdfTabs,
            'pdfData' => $pdfData,
            'unitsMaster' => $unitsMaster,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tab' => 'required|string|max:100',
            'code_unit' => 'required|string|max:100',
            'type_unit' => 'nullable|string|max:100',
            'hm' => 'nullable|string|max:50',
            'code_budget' => 'nullable|string|max:50',
            'cost_element' => 'nullable|string|max:100',
            'code_depart' => 'nullable|string|max:100',
            'uraian' => 'required|string|max:1000',
            'std_qty' => 'nullable|string|max:50',
            'forecast_qty' => 'nullable|string|max:50',
            'satuan' => 'nullable|string|max:50',
            'unit_rate' => 'nullable|numeric|min:0',
            'amount' => 'nullable|numeric|min:0',
            'year' => 'nullable|integer',
        ]);

        $forecastQty = (float) ($validated['forecast_qty'] ?? 0);
        $unitRate = (float) ($validated['unit_rate'] ?? 0);
        $amount = isset($validated['amount']) && $validated['amount'] > 0
            ? (float) $validated['amount']
            : ($forecastQty * $unitRate);

        $maxNo = MonthlyBudgetForecast::where('tab', $validated['tab'])
            ->where('code_unit', $validated['code_unit'])
            ->max('no') ?? 0;

        MonthlyBudgetForecast::create([
            'year' => $validated['year'] ?? 2026,
            'tab' => strtoupper(trim($validated['tab'])),
            'code_unit' => strtoupper(trim($validated['code_unit'])),
            'type_unit' => $validated['type_unit'] ?? null,
            'hm' => $validated['hm'] ?? null,
            'no' => $maxNo + 1,
            'code_budget' => $validated['code_budget'] ?? null,
            'cost_element' => $validated['cost_element'] ?? null,
            'code_depart' => $validated['code_depart'] ?? null,
            'uraian' => $validated['uraian'],
            'std_qty' => $validated['std_qty'] ?? null,
            'forecast_qty' => $validated['forecast_qty'] ?? null,
            'satuan' => $validated['satuan'] ?? null,
            'unit_rate' => $unitRate,
            'amount' => $amount,
        ]);

        return redirect()->back()->with('success', 'Entry forecast budget berhasil ditambahkan.');
    }

    public function update(Request $request, int|string $id): RedirectResponse
    {
        $forecast = MonthlyBudgetForecast::findOrFail($id);

        $validated = $request->validate([
            'tab' => 'sometimes|required|string|max:100',
            'code_unit' => 'sometimes|required|string|max:100',
            'type_unit' => 'nullable|string|max:100',
            'hm' => 'nullable|string|max:50',
            'code_budget' => 'nullable|string|max:50',
            'cost_element' => 'nullable|string|max:100',
            'code_depart' => 'nullable|string|max:100',
            'uraian' => 'required|string|max:1000',
            'std_qty' => 'nullable|string|max:50',
            'forecast_qty' => 'nullable|string|max:50',
            'satuan' => 'nullable|string|max:50',
            'unit_rate' => 'nullable|numeric|min:0',
            'amount' => 'nullable|numeric|min:0',
        ]);

        $forecastQty = (float) ($validated['forecast_qty'] ?? $forecast->forecast_qty);
        $unitRate = (float) ($validated['unit_rate'] ?? $forecast->unit_rate);
        $amount = isset($validated['amount']) && $validated['amount'] !== null
            ? (float) $validated['amount']
            : ($forecastQty * $unitRate);

        $forecast->update([
            'tab' => isset($validated['tab']) ? strtoupper(trim($validated['tab'])) : $forecast->tab,
            'code_unit' => isset($validated['code_unit']) ? strtoupper(trim($validated['code_unit'])) : $forecast->code_unit,
            'type_unit' => $validated['type_unit'] ?? $forecast->type_unit,
            'hm' => $validated['hm'] ?? $forecast->hm,
            'code_budget' => $validated['code_budget'] ?? $forecast->code_budget,
            'cost_element' => $validated['cost_element'] ?? $forecast->cost_element,
            'code_depart' => $validated['code_depart'] ?? $forecast->code_depart,
            'uraian' => $validated['uraian'],
            'std_qty' => $validated['std_qty'] ?? $forecast->std_qty,
            'forecast_qty' => $validated['forecast_qty'] ?? $forecast->forecast_qty,
            'satuan' => $validated['satuan'] ?? $forecast->satuan,
            'unit_rate' => $unitRate,
            'amount' => $amount,
        ]);

        return redirect()->back()->with('success', 'Entry forecast budget berhasil diperbarui.');
    }

    public function destroy(int|string $id): RedirectResponse
    {
        $forecast = MonthlyBudgetForecast::findOrFail($id);
        $forecast->delete();

        return redirect()->back()->with('success', 'Entry forecast budget berhasil dihapus.');
    }

    private function seedFromStaticData(): void
    {
        $pdfData = ForecastPaData::getPdfData();
        $records = [];
        $now = now();

        foreach ($pdfData as $tab => $unitBlocks) {
            foreach ($unitBlocks as $block) {
                $codeUnit = $block['code_unit'] ?? $tab;
                $typeUnit = $block['type_unit'] ?? null;
                $hm = $block['hm'] ?? null;
                foreach ($block['items'] ?? [] as $item) {
                    $records[] = [
                        'year' => 2026,
                        'tab' => $tab,
                        'code_unit' => $codeUnit,
                        'type_unit' => $typeUnit,
                        'hm' => $hm,
                        'no' => $item['no'] ?? null,
                        'code_budget' => $item['code_budget'] ?? null,
                        'cost_element' => $item['cost_element'] ?? null,
                        'code_depart' => $item['code_depart'] ?? null,
                        'uraian' => $item['uraian'] ?? null,
                        'std_qty' => $item['std_qty'] ?? null,
                        'forecast_qty' => null,
                        'satuan' => $item['satuan'] ?? null,
                        'unit_rate' => $item['unit_rate'] ?? 0,
                        'amount' => 0,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
        }

        if (! empty($records)) {
            foreach (array_chunk($records, 100) as $chunk) {
                MonthlyBudgetForecast::insert($chunk);
            }
        }
    }

    private function seedHeavyEquipmentData(): void
    {
        $now = now();
        $records = [];

        // 1. BULLDOZER
        $dozerUnits = Unit::where('code_unit', 'LIKE', 'MD0%')->get();
        if ($dozerUnits->isEmpty()) {
            $dozerUnits = collect([
                (object) ['code_unit' => 'MD036', 'type_unit' => 'BULLDOZER', 'hm' => '16539.7'],
                (object) ['code_unit' => 'MD037', 'type_unit' => 'BULLDOZER', 'hm' => '15016.7'],
                (object) ['code_unit' => 'MD041', 'type_unit' => 'BULLDOZER', 'hm' => '7379.8'],
            ]);
        }
        $dozerTemplateItems = [
            ['code_budget' => '3.0.6', 'cost_element' => 'PM Service', 'code_depart' => 'Plant', 'uraian' => '600-211-1341 - Filter Oil Engine', 'std_qty' => '1', 'satuan' => 'Pcs', 'unit_rate' => 942000],
            ['code_budget' => '3.0.6', 'cost_element' => 'PM Service', 'code_depart' => 'Plant', 'uraian' => '600-311-5410 - Fuel Filter Cartridge', 'std_qty' => '1', 'satuan' => 'Pcs', 'unit_rate' => 450000],
            ['code_budget' => '3.0.6', 'cost_element' => 'PM Service', 'code_depart' => 'Plant', 'uraian' => '600-185-6100 - Air Cleaner Element (Outer)', 'std_qty' => '1', 'satuan' => 'Pcs', 'unit_rate' => 2350000],
            ['code_budget' => '3.0.6', 'cost_element' => 'PM Service', 'code_depart' => 'Plant', 'uraian' => '600-185-6110 - Air Cleaner Element (Inner)', 'std_qty' => '1', 'satuan' => 'Pcs', 'unit_rate' => 2700000],
            ['code_budget' => '3.0.6', 'cost_element' => 'PM Service', 'code_depart' => 'Plant', 'uraian' => '175-49-11580 - Transmission Oil Filter', 'std_qty' => '1', 'satuan' => 'Pcs', 'unit_rate' => 850000],
            ['code_budget' => '3.0.6', 'cost_element' => 'PM Service', 'code_depart' => 'Plant', 'uraian' => '175-60-27380 - Hydraulic Return Filter', 'std_qty' => '1', 'satuan' => 'Pcs', 'unit_rate' => 1250000],
            ['code_budget' => '3.0.6', 'cost_element' => 'PM Service', 'code_depart' => 'Plant', 'uraian' => '600-411-5110 - Corrosion Resistor / Coolant Filter', 'std_qty' => '1', 'satuan' => 'Pcs', 'unit_rate' => 650000],
            ['code_budget' => '3.0.1', 'cost_element' => 'Oil Consumption', 'code_depart' => 'Plant', 'uraian' => 'SAE 15W-40 Engine Oil (PAO)', 'std_qty' => '38', 'satuan' => 'Ltr', 'unit_rate' => 58000],
            ['code_budget' => '3.0.1', 'cost_element' => 'Oil Consumption', 'code_depart' => 'Plant', 'uraian' => 'SAE 10W Hydraulic Oil', 'std_qty' => '60', 'satuan' => 'Ltr', 'unit_rate' => 54000],
            ['code_budget' => '3.0.1', 'cost_element' => 'Oil Consumption', 'code_depart' => 'Plant', 'uraian' => 'SAE 30 Transmission Oil', 'std_qty' => '50', 'satuan' => 'Ltr', 'unit_rate' => 56000],
            ['code_budget' => '3.0.9', 'cost_element' => 'Corrective Maintenance', 'code_depart' => 'Plant', 'uraian' => 'Cutting Edge & End Bit Set Komatsu D85', 'std_qty' => '1', 'satuan' => 'Set', 'unit_rate' => 12500000],
            ['code_budget' => '3.0.9', 'cost_element' => 'Corrective Maintenance', 'code_depart' => 'Plant', 'uraian' => 'Track Link & Shoe Bolt Replacement Lot', 'std_qty' => '1', 'satuan' => 'Lot', 'unit_rate' => 18500000],
        ];

        foreach ($dozerUnits as $u) {
            foreach ($dozerTemplateItems as $idx => $item) {
                $rate = (float) $item['unit_rate'];
                $records[] = [
                    'year' => 2026,
                    'tab' => 'BULLDOZER',
                    'code_unit' => $u->code_unit,
                    'type_unit' => $u->type_unit ?: 'BULLDOZER',
                    'hm' => (string) ($u->hm ?? ''),
                    'no' => $idx + 1,
                    'code_budget' => $item['code_budget'],
                    'cost_element' => $item['cost_element'],
                    'code_depart' => $item['code_depart'],
                    'uraian' => $item['uraian'],
                    'std_qty' => $item['std_qty'],
                    'forecast_qty' => null,
                    'satuan' => $item['satuan'],
                    'unit_rate' => $rate,
                    'amount' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // 2. EXCAVATOR
        $excavatorUnits = Unit::where('code_unit', 'LIKE', 'ME%')->get();
        if ($excavatorUnits->isEmpty()) {
            $excavatorUnits = collect([
                (object) ['code_unit' => 'ME048', 'type_unit' => 'EXCAVATOR SMALL DIGGER', 'hm' => '13714.3'],
                (object) ['code_unit' => 'ME049', 'type_unit' => 'EXCAVATOR BIG DIGGER', 'hm' => '17130.6'],
                (object) ['code_unit' => 'ME052', 'type_unit' => 'EXCAVATOR SMALL DIGGER', 'hm' => '12563.7'],
            ]);
        }
        $excavatorApls = UnitApl::whereIn('type_unit', ['EXCAVATOR BIG DIGGER', 'EXCAVATOR SMALL DIGGER'])->get()->groupBy('code_unit');
        $excavatorDefaultItems = UnitApl::whereIn('type_unit', ['EXCAVATOR BIG DIGGER', 'EXCAVATOR SMALL DIGGER'])->limit(20)->get();
        if ($excavatorDefaultItems->isEmpty()) {
            $excavatorDefaultItems = collect([
                (object) ['part_number' => '600-211-1341', 'description' => 'Filter Oil Engine', 'qty' => 2, 'satuan' => 'Pcs', 'price_rate' => 942000, 'amount' => 1884000],
                (object) ['part_number' => '600-311-5410', 'description' => 'Fuel Filter Cartridge', 'qty' => 2, 'satuan' => 'Pcs', 'price_rate' => 450000, 'amount' => 900000],
                (object) ['part_number' => '600-185-6100', 'description' => 'Air Cleaner Element Outer', 'qty' => 1, 'satuan' => 'Pcs', 'price_rate' => 2350000, 'amount' => 2350000],
            ]);
        }

        foreach ($excavatorUnits as $u) {
            $apls = $excavatorApls[$u->code_unit] ?? $excavatorDefaultItems;
            foreach ($apls as $idx => $apl) {
                $rate = (float) ($apl->price_rate ?: 0);
                $records[] = [
                    'year' => 2026,
                    'tab' => 'EXCAVATOR',
                    'code_unit' => $u->code_unit,
                    'type_unit' => $u->type_unit ?: 'EXCAVATOR',
                    'hm' => (string) ($u->hm ?? ''),
                    'no' => $idx + 1,
                    'code_budget' => '3.0.6',
                    'cost_element' => 'PM Service',
                    'code_depart' => 'Plant',
                    'uraian' => trim(($apl->part_number ? $apl->part_number.' - ' : '').$apl->description),
                    'std_qty' => (string) ($apl->qty ?: 1),
                    'forecast_qty' => null,
                    'satuan' => $apl->satuan ?: 'PCS',
                    'unit_rate' => $rate,
                    'amount' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // 3. DUMP TRUCK
        $dtUnits = Unit::where('type_unit', 'DUMP TRUCK')->orWhere('code_unit', 'LIKE', 'MDT%')->get();
        if ($dtUnits->isEmpty()) {
            $dtUnits = collect([
                (object) ['code_unit' => 'MDT006', 'type_unit' => 'DUMP TRUCK', 'hm' => '6003'],
                (object) ['code_unit' => 'MDT046', 'type_unit' => 'DUMP TRUCK', 'hm' => '9840'],
            ]);
        }
        $dtApls = UnitApl::where('type_unit', 'DUMP TRUCK')->get()->groupBy('code_unit');
        $dtDefaultItems = UnitApl::where('type_unit', 'DUMP TRUCK')->limit(15)->get();
        if ($dtDefaultItems->isEmpty()) {
            $dtDefaultItems = collect([
                (object) ['part_number' => '5223958455', 'description' => 'Oil Engine Filter', 'qty' => 2, 'satuan' => 'Pcs', 'price_rate' => 900000, 'amount' => 1800000],
                (object) ['part_number' => '5223964910', 'description' => 'Fuel Filter Insert', 'qty' => 2, 'satuan' => 'Pcs', 'price_rate' => 750000, 'amount' => 1500000],
            ]);
        }

        foreach ($dtUnits as $u) {
            $apls = $dtApls[$u->code_unit] ?? $dtDefaultItems;
            foreach ($apls as $idx => $apl) {
                $rate = (float) ($apl->price_rate ?: 0);
                $records[] = [
                    'year' => 2026,
                    'tab' => 'DUMP TRUCK',
                    'code_unit' => $u->code_unit,
                    'type_unit' => $u->type_unit ?: 'DUMP TRUCK',
                    'hm' => (string) ($u->hm ?? ''),
                    'no' => $idx + 1,
                    'code_budget' => '3.0.6',
                    'cost_element' => 'PM Service',
                    'code_depart' => 'Plant',
                    'uraian' => trim(($apl->part_number ? $apl->part_number.' - ' : '').$apl->description),
                    'std_qty' => (string) ($apl->qty ?: 1),
                    'forecast_qty' => null,
                    'satuan' => $apl->satuan ?: 'PCS',
                    'unit_rate' => $rate,
                    'amount' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // 4. DEWATERING
        $dwUnits = Unit::where('code_unit', 'LIKE', 'MWP%')->orWhere('code_unit', 'LIKE', 'MWF%')->get();
        if ($dwUnits->isEmpty()) {
            $dwUnits = collect([
                (object) ['code_unit' => 'MWP003', 'type_unit' => 'DEWATERING PUMP', 'hm' => '1735.8'],
                (object) ['code_unit' => 'MWP005', 'type_unit' => 'DEWATERING PUMP', 'hm' => '1472.8'],
            ]);
        }
        $dwApls = UnitApl::where('type_unit', 'DEWATERING PUMP')->get()->groupBy('code_unit');
        $dwDefaultItems = UnitApl::where('type_unit', 'DEWATERING PUMP')->limit(10)->get();
        if ($dwDefaultItems->isEmpty()) {
            $dwDefaultItems = collect([
                (object) ['part_number' => 'LF691A', 'description' => 'Oil Engine Filter', 'qty' => 1, 'satuan' => 'Pcs', 'price_rate' => 425000, 'amount' => 425000],
                (object) ['part_number' => 'FF5324', 'description' => 'Fuel Filter', 'qty' => 1, 'satuan' => 'Pcs', 'price_rate' => 851000, 'amount' => 851000],
            ]);
        }

        foreach ($dwUnits as $u) {
            $apls = $dwApls[$u->code_unit] ?? $dwDefaultItems;
            foreach ($apls as $idx => $apl) {
                $rate = (float) ($apl->price_rate ?: 0);
                $records[] = [
                    'year' => 2026,
                    'tab' => 'DEWATERING',
                    'code_unit' => $u->code_unit,
                    'type_unit' => $u->type_unit ?: 'DEWATERING PUMP',
                    'hm' => (string) ($u->hm ?? ''),
                    'no' => $idx + 1,
                    'code_budget' => '3.0.6',
                    'cost_element' => 'PM Service',
                    'code_depart' => 'Plant',
                    'uraian' => trim(($apl->part_number ? $apl->part_number.' - ' : '').$apl->description),
                    'std_qty' => (string) ($apl->qty ?: 1),
                    'forecast_qty' => null,
                    'satuan' => $apl->satuan ?: 'PCS',
                    'unit_rate' => $rate,
                    'amount' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // 5. OHT
        $ohtUnits = Unit::where('code_unit', 'LIKE', 'OHT%')->get();
        if ($ohtUnits->isEmpty()) {
            $ohtUnits = collect([
                (object) ['code_unit' => 'OHT066', 'type_unit' => 'HAULER TRUCK', 'hm' => '18474'],
                (object) ['code_unit' => 'OHT067', 'type_unit' => 'HAULER TRUCK', 'hm' => '16319.6'],
            ]);
        }
        $ohtApls = UnitApl::where('type_unit', 'HAULER TRUCK')->get()->groupBy('code_unit');
        $ohtDefaultItems = UnitApl::where('type_unit', 'HAULER TRUCK')->limit(25)->get();
        if ($ohtDefaultItems->isEmpty()) {
            $ohtDefaultItems = collect([
                (object) ['part_number' => '1R-1808', 'description' => 'Filter-Engine Oil', 'qty' => 2, 'satuan' => 'Pcs', 'price_rate' => 1150000, 'amount' => 2300000],
                (object) ['part_number' => '130-3212', 'description' => 'Filter-Oil', 'qty' => 2, 'satuan' => 'Pcs', 'price_rate' => 498000, 'amount' => 996000],
            ]);
        }

        foreach ($ohtUnits as $u) {
            $apls = $ohtApls[$u->code_unit] ?? $ohtDefaultItems;
            foreach ($apls as $idx => $apl) {
                $rate = (float) ($apl->price_rate ?: 0);
                $records[] = [
                    'year' => 2026,
                    'tab' => 'OHT',
                    'code_unit' => $u->code_unit,
                    'type_unit' => $u->type_unit ?: 'HAULER TRUCK',
                    'hm' => (string) ($u->hm ?? ''),
                    'no' => $idx + 1,
                    'code_budget' => '3.0.6',
                    'cost_element' => 'PM Service',
                    'code_depart' => 'Plant',
                    'uraian' => trim(($apl->part_number ? $apl->part_number.' - ' : '').$apl->description),
                    'std_qty' => (string) ($apl->qty ?: 1),
                    'forecast_qty' => null,
                    'satuan' => $apl->satuan ?: 'PCS',
                    'unit_rate' => $rate,
                    'amount' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if (! empty($records)) {
            foreach (array_chunk($records, 100) as $chunk) {
                MonthlyBudgetForecast::insert($chunk);
            }
        }
    }
}
