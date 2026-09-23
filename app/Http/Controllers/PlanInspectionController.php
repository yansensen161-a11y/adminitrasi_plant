<?php

namespace App\Http\Controllers;

use App\Models\PlanInspection;
use App\Models\PlanInspectionTarget;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PlanInspectionController extends Controller
{
    /**
     * Define the operational unit grouping and exact sequence as requested.
     */
    public static function getOrderedUnitSpecs(): array
    {
        return [
            'CRUSHER' => ['ME023', 'ME053', 'MSC001'],
            'EXCAVATOR BIG DIGGER' => ['ME049', 'ME055', 'ME056'],
            'EXCAVATOR SMALL DIGGER' => [
                'ME048', 'ME052', 'ME057', 'ME059', 'ME066',
                'ME067', 'ME068', 'ME069', 'ME070', 'ME072',
            ],
            'BULLDOZER' => [
                'MD036', 'MD037', 'MD041', 'MD042', 'MD043',
                'MD045', 'MD046', 'MD047', 'MD048',
            ],
            'HAULER TRUCK' => [
                'OHT066', 'OHT067', 'OHT068', 'OHT069', 'OHT070', 'OHT071',
                'OHT072', 'OHT073', 'OHT074', 'OHT075', 'OHT115', 'OHT116',
                'OHT117', 'OHT118', 'OHT119', 'OHT120',
            ],
            'DUMP TRUCK' => [
                'MDT006', 'MDT009', 'MDT012', 'MDT015', 'MDT016', 'MDT017',
                'MDT019', 'MDT020', 'MDT021', 'MDT022', 'MDT023', 'MDT025',
                'MDT026', 'MDT027', 'MDT028', 'MDT029', 'MDT030', 'MDT035',
                'MDT036', 'MDT039', 'MDT040', 'MDT041', 'MDT042', 'MDT043',
                'MDT045', 'MDT046', 'MDT047', 'MDT048', 'MDT051', 'MDT052',
            ],
            'MOTOR GRADER' => ['MG018', 'MG019', 'MG021'],
            'COMPACTOR' => ['MCP003', 'MCP006'],
            'TOWER LAMP' => [
                'MTL013', 'MTL015', 'MTL016', 'MTL023', 'MTL031',
                'MTL035', 'MTL040', 'MTL041', 'MTL042', 'MTL043',
            ],
            'SERVICE TRUCK' => ['MLT005', 'MLT008'],
            'FUEL TRUCK' => ['MFT007', 'MFT009'],
            'WATER TRUCK' => ['MWT010', 'MWT009'],
            'CRANE TRUCK & LOWBOY' => ['MCT001', 'MC 02'],
            'DEWATERING PUMP' => ['MWP003', 'MWF007', 'MWP005', 'MWP007'],
            'SARANA BUS' => ['MB001', 'MB002', 'MMH005'],
            'GENSET - COMPRESSOR - WELDING MACHINE' => [
                'MCM007', 'MCM008', 'MGS002', 'MGS006', 'MGS009',
                'MGS016', 'MGS018', 'MWM006', 'MWM007', 'MWM010',
            ],
            'LIGHT VEHICLE' => [
                'T-02', 'A-07', 'A-08', 'B-10', 'B-16', 'B-02', 'D-09',
                'D-19', 'D-21', 'G-03', 'G-05', 'E-02', 'F-05', 'H-02',
            ],
        ];
    }

    /**
     * Define the unit categories that use 4 shifts per day (Pagi, Siang, Sore, Malam) in Greasing.
     */
    public static function get4ShiftCategories(): array
    {
        return [
            'CRUSHER',
            'EXCAVATOR BIG DIGGER',
            'EXCAVATOR SMALL DIGGER',
            'BULLDOZER',
            'MOTOR GRADER',
            'CRANE TRUCK & LOWBOY',
        ];
    }

    /**
     * Define the unit categories that use Cleaning Track.
     */
    public static function getCleaningTrackCategories(): array
    {
        return [
            'CRUSHER',
            'EXCAVATOR BIG DIGGER',
            'EXCAVATOR SMALL DIGGER',
            'BULLDOZER',
        ];
    }

    /**
     * Define the unit categories that do not have Greasing achievement.
     */
    public static function getNonGreasingCategories(): array
    {
        return [
            'DEWATERING PUMP',
            'GENSET - COMPRESSOR - WELDING MACHINE',
        ];
    }

    /**
     * Helper to retrieve units grouped and ordered strictly according to specs.
     */
    public static function getCustomGroupedUnits(): array
    {
        $specs = self::getOrderedUnitSpecs();
        $rawUnits = Unit::all();
        $unitsByCode = [];
        foreach ($rawUnits as $unit) {
            $unitsByCode[strtoupper(trim($unit->code_unit))] = $unit;
        }

        $groupedUnits = [];
        $allUnits = [];
        $unitIdToCategory = [];

        foreach ($specs as $category => $codes) {
            $groupedUnits[$category] = [];
            foreach ($codes as $code) {
                $c = strtoupper(trim($code));
                if (isset($unitsByCode[$c])) {
                    $u = clone $unitsByCode[$c];
                    $u->type_unit = $category;
                    $groupedUnits[$category][] = $u;
                    $allUnits[] = $u;
                    $unitIdToCategory[$u->id] = $category;
                }
            }
        }

        return [
            'groupedUnits' => $groupedUnits,
            'allUnits' => $allUnits,
            'unitIdToCategory' => $unitIdToCategory,
            'unitTypes' => array_keys($specs),
        ];
    }

    public function index(Request $request)
    {
        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);
        $dateStr = sprintf('%04d-%02d-01', $year, $month);
        $date = Carbon::parse($dateStr);
        $daysInMonth = $date->daysInMonth;

        $unitData = self::getCustomGroupedUnits();
        $groupedUnits = $unitData['groupedUnits'];
        $allUnits = $unitData['allUnits'];
        $unitTypes = $unitData['unitTypes'];
        $allowedUnitIds = array_keys($unitData['unitIdToCategory']);

        // Fetch inspections for the selected month scoped to the specified units
        $inspections = PlanInspection::whereIn('unit_id', $allowedUnitIds)
            ->whereYear('inspection_date', $year)
            ->whereMonth('inspection_date', $month)
            ->get();

        $fourShiftCats = self::get4ShiftCategories();
        $unitIdToCategory = $unitData['unitIdToCategory'];

        // Organize into a fast lookup array [unit_id][category][day] = data
        $planData = [];
        foreach ($inspections as $inspection) {
            $day = Carbon::parse($inspection->inspection_date)->day;
            $cat = $inspection->category;
            $unitCategory = $unitIdToCategory[$inspection->unit_id] ?? null;
            $is4Shift = ($cat === 'greasing' && in_array($unitCategory, $fourShiftCats));
            $shift = $inspection->shift ?? 'all';

            if ($is4Shift) {
                if (in_array($shift, ['shift_2', 'sore', 'malam', '2'])) {
                    $shift = 'shift_2';
                } else {
                    $shift = 'shift_1';
                }
            }

            $item = [
                'id' => $inspection->id,
                'checked' => true,
                'photo_path' => $inspection->photo_path,
                'photo_url' => $inspection->photo_url,
                'notes' => $inspection->notes,
                'date' => Carbon::parse($inspection->inspection_date)->format('Y-m-d'),
                'shift' => $shift,
            ];

            if ($is4Shift) {
                $planData[$inspection->unit_id][$cat][$day][$shift] = $item;
            } else {
                $planData[$inspection->unit_id][$cat][$day] = $item;
            }
        }

        // Fetch saved target values for this month [unit_id][category] = target
        $targets = PlanInspectionTarget::whereIn('unit_id', $allowedUnitIds)
            ->where('month', $month)
            ->where('year', $year)
            ->get();
        $targetData = [];
        foreach ($targets as $t) {
            $targetData[$t->unit_id][$t->category] = $t->target_value;
        }

        return Inertia::render('PlanInspection/Index', [
            'groupedUnits' => $groupedUnits,
            'allUnits' => $allUnits,
            'planData' => $planData,
            'targetData' => $targetData,
            'currentMonth' => $month,
            'currentYear' => $year,
            'daysInMonth' => $daysInMonth,
            'unitTypes' => $unitTypes,
            'fourShiftCategories' => $fourShiftCats,
            'cleaningTrackCategories' => self::getCleaningTrackCategories(),
            'nonGreasingCategories' => self::getNonGreasingCategories(),
        ]);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'unit_id' => 'required|exists:units,id',
            'day' => 'required|integer|min:1|max:31',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
            'category' => 'required|string|in:washing,inspection,greasing,cleaning_track',
            'shift' => 'nullable|string',
        ]);

        $unitData = self::getCustomGroupedUnits();
        $unitCategory = $unitData['unitIdToCategory'][$request->unit_id] ?? null;
        $is4Shift = ($request->category === 'greasing' && in_array($unitCategory, self::get4ShiftCategories()));
        $rawShift = $request->input('shift', 'shift_1');

        if ($is4Shift) {
            $shift = in_array($rawShift, ['shift_2', 'sore', 'malam', '2']) ? 'shift_2' : 'shift_1';
            $aliasShifts = ($shift === 'shift_2') ? ['shift_2', 'sore', 'malam'] : ['shift_1', 'pagi', 'siang'];
        } else {
            $shift = 'all';
            $aliasShifts = ['all'];
        }

        $dateStr = sprintf('%04d-%02d-%02d', $request->year, $request->month, $request->day);

        $existing = PlanInspection::where('unit_id', $request->unit_id)
            ->whereDate('inspection_date', $dateStr)
            ->where('category', $request->category)
            ->whereIn('shift', $aliasShifts)
            ->first();

        if ($existing) {
            if ($existing->photo_path && Storage::disk('public')->exists($existing->photo_path)) {
                Storage::disk('public')->delete($existing->photo_path);
            }
            $existing->delete();

            return response()->json([
                'status' => 'removed',
                'shift' => $shift,
                'day' => (int) $request->day,
            ]);
        } else {
            $created = PlanInspection::create([
                'unit_id' => $request->unit_id,
                'inspection_date' => $dateStr,
                'category' => $request->category,
                'shift' => $shift,
                'is_completed' => true,
            ]);

            return response()->json([
                'status' => 'added',
                'entry' => [
                    'id' => $created->id,
                    'unit_id' => $created->unit_id,
                    'category' => $created->category,
                    'shift' => $created->shift,
                    'day' => (int) $request->day,
                    'checked' => true,
                    'photo_url' => null,
                    'notes' => null,
                    'date' => $dateStr,
                ],
            ]);
        }
    }

    public function storeEntry(Request $request)
    {
        $request->validate([
            'unit_id' => 'nullable|exists:units,id',
            'unit_ids' => 'nullable|array',
            'unit_ids.*' => 'exists:units,id',
            'inspection_date' => 'nullable|date',
            'inspection_dates' => 'nullable|array',
            'inspection_dates.*' => 'date',
            'category' => 'nullable|string|in:washing,inspection,greasing,cleaning_track',
            'categories' => 'nullable|array',
            'categories.*' => 'string|in:washing,inspection,greasing,cleaning_track',
            'shift' => 'nullable|string',
            'shifts' => 'nullable|array',
            'photo' => 'nullable|image|max:10240',
            'notes' => 'nullable|string|max:1000',
        ]);

        $unitIds = $request->input('unit_ids', []);
        if (empty($unitIds) && $request->filled('unit_id')) {
            $unitIds = [$request->unit_id];
        }
        $unitIds = array_values(array_unique(array_filter((array) $unitIds)));

        if (empty($unitIds)) {
            return response()->json(['message' => 'Pilih setidaknya satu unit.'], 422);
        }

        $dates = $request->input('inspection_dates', []);
        if (empty($dates) && $request->filled('inspection_date')) {
            $dates = [$request->inspection_date];
        }
        $dates = array_values(array_unique(array_filter((array) $dates)));

        if (empty($dates)) {
            return response()->json(['message' => 'Pilih setidaknya satu tanggal kegiatan.'], 422);
        }

        $categories = $request->input('categories', []);
        if (empty($categories) && $request->filled('category')) {
            $categories = [$request->category];
        }
        $validCats = ['washing', 'inspection', 'greasing', 'cleaning_track'];
        $categories = array_values(array_unique(array_intersect($validCats, (array) $categories)));

        if (empty($categories)) {
            return response()->json(['message' => 'Pilih setidaknya satu kategori kegiatan.'], 422);
        }

        $shiftsInput = $request->input('shifts', []);
        if (empty($shiftsInput) && $request->filled('shift')) {
            $shiftsInput = [$request->shift];
        }
        $normalizedShifts = [];
        foreach ((array) $shiftsInput as $s) {
            if (in_array($s, ['shift_2', 'sore', 'malam', '2'])) {
                $normalizedShifts[] = 'shift_2';
            } elseif (in_array($s, ['shift_1', 'pagi', 'siang', '1'])) {
                $normalizedShifts[] = 'shift_1';
            }
        }
        $chosenShifts = array_values(array_unique($normalizedShifts));
        if (empty($chosenShifts)) {
            $chosenShifts = ['shift_1', 'shift_2'];
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('plan_inspections', 'public');
        }

        $fourShiftCats = self::get4ShiftCategories();
        $unitData = self::getCustomGroupedUnits();
        $unitIdToCat = $unitData['unitIdToCategory'];

        $entries = [];

        foreach ($unitIds as $uId) {
            $unitGroup = $unitIdToCat[$uId] ?? null;
            foreach ($dates as $dateStr) {
                $parsed = Carbon::parse($dateStr);
                foreach ($categories as $cat) {
                    $is4Shift = ($cat === 'greasing' && in_array($unitGroup, $fourShiftCats));
                    $targetShifts = $is4Shift ? $chosenShifts : ['all'];

                    foreach ($targetShifts as $s) {
                        $entry = PlanInspection::where('unit_id', $uId)
                            ->whereDate('inspection_date', $dateStr)
                            ->where('category', $cat)
                            ->where('shift', $s)
                            ->first();

                        if ($entry) {
                            $updateData = ['is_completed' => true];
                            if ($photoPath) {
                                $updateData['photo_path'] = $photoPath;
                            }
                            if ($request->has('notes')) {
                                $updateData['notes'] = $request->notes;
                            }
                            $entry->update($updateData);
                        } else {
                            $entry = PlanInspection::create([
                                'unit_id' => $uId,
                                'inspection_date' => $dateStr,
                                'category' => $cat,
                                'shift' => $s,
                                'photo_path' => $photoPath,
                                'notes' => $request->notes,
                                'is_completed' => true,
                            ]);
                        }

                        $entries[] = [
                            'id' => $entry->id,
                            'unit_id' => $entry->unit_id,
                            'category' => $entry->category,
                            'shift' => $entry->shift,
                            'day' => $parsed->day,
                            'month' => $parsed->month,
                            'year' => $parsed->year,
                            'date' => $parsed->format('Y-m-d'),
                            'photo_path' => $entry->photo_path,
                            'photo_url' => $entry->photo_url,
                            'notes' => $entry->notes,
                            'checked' => true,
                        ];
                    }
                }
            }
        }

        $unitCount = count($unitIds);
        $dateCount = count($dates);
        $catCount = count($categories);

        return response()->json([
            'status' => 'success',
            'message' => "Berhasil menyimpan entri untuk {$unitCount} unit, {$dateCount} tanggal, dan {$catCount} kategori kegiatan.",
            'entry' => $entries[0] ?? null,
            'entries' => $entries,
        ]);
    }

    public function deleteEntry(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:plan_inspections,id',
        ]);

        $inspection = PlanInspection::findOrFail($request->id);
        if ($inspection->photo_path && Storage::disk('public')->exists($inspection->photo_path)) {
            Storage::disk('public')->delete($inspection->photo_path);
        }
        $day = Carbon::parse($inspection->inspection_date)->day;
        $unitId = $inspection->unit_id;
        $cat = $inspection->category;
        $shift = $inspection->shift ?? 'all';
        $inspection->delete();

        return response()->json([
            'status' => 'removed',
            'unit_id' => $unitId,
            'category' => $cat,
            'shift' => $shift,
            'day' => $day,
        ]);
    }

    public function dashboard(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $unitTypeFilter = $request->input('unit_type', 'all');

        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        $unitData = self::getCustomGroupedUnits();
        $unitIdToCategory = $unitData['unitIdToCategory'];
        $groupedUnits = $unitData['groupedUnits'];
        $unitTypes = $unitData['unitTypes'];

        // If filtered by a specific category, only include those units
        if ($unitTypeFilter !== 'all' && isset($groupedUnits[$unitTypeFilter])) {
            $activeUnits = $groupedUnits[$unitTypeFilter];
            $activeCategories = [$unitTypeFilter];
        } else {
            $activeUnits = $unitData['allUnits'];
            $activeCategories = $unitTypes;
        }

        $activeUnitIds = array_map(fn ($u) => $u->id, $activeUnits);

        // --- Fetch actuals (centang) in date range ---
        $inspections = PlanInspection::whereBetween('inspection_date', [$startDate, $endDate])
            ->whereIn('unit_id', $activeUnitIds)
            ->get();

        // Count actuals per [category_type][activity_category]
        $actualByTypeCat = [];
        foreach ($inspections as $ins) {
            $type = $unitIdToCategory[$ins->unit_id] ?? 'UNSPECIFIED';
            $cat = strtolower($ins->category);
            if (! isset($actualByTypeCat[$type][$cat])) {
                $actualByTypeCat[$type][$cat] = 0;
            }
            $actualByTypeCat[$type][$cat]++;
        }

        // --- Fetch saved plan targets from DB for the date range's months ---
        $monthsInRange = [];
        $cursor = $start->copy()->startOfMonth();
        while ($cursor->lte($end)) {
            $monthsInRange[] = ['month' => $cursor->month, 'year' => $cursor->year];
            $cursor->addMonth();
        }

        $planByTypeCat = [];
        foreach ($monthsInRange as $my) {
            $monthTargets = PlanInspectionTarget::whereIn('unit_id', $activeUnitIds)
                ->where('month', $my['month'])
                ->where('year', $my['year'])
                ->get();

            foreach ($monthTargets as $t) {
                $type = $unitIdToCategory[$t->unit_id] ?? 'UNSPECIFIED';
                $cat = strtolower($t->category);
                if (! isset($planByTypeCat[$type][$cat])) {
                    $planByTypeCat[$type][$cat] = 0;
                }
                $planByTypeCat[$type][$cat] += $t->target_value;
            }
        }

        // --- Build rekap rows ---
        $categories = ['inspection', 'washing', 'greasing', 'cleaning_track'];
        $cleaningTrackCats = self::getCleaningTrackCategories();
        $cleaningTrackCatsUpper = array_map('strtoupper', $cleaningTrackCats);
        $nonGreasingCats = self::getNonGreasingCategories();
        $nonGreasingCatsUpper = array_map('strtoupper', $nonGreasingCats);

        $rekap = [];
        $totalPlanAll = 0;
        $totalActualAll = 0;

        foreach ($activeCategories as $type) {
            $row = ['type' => $type];
            $typeUpper = strtoupper(trim($type));
            $isTrackApplicable = in_array($typeUpper, $cleaningTrackCatsUpper);
            $isGreasingApplicable = ! in_array($typeUpper, $nonGreasingCatsUpper);

            foreach ($categories as $cat) {
                $plan = $planByTypeCat[$type][$cat] ?? 0;
                $actual = $actualByTypeCat[$type][$cat] ?? 0;

                $isApplicable = true;
                if ($cat === 'cleaning_track' && ! $isTrackApplicable) {
                    $isApplicable = false;
                } elseif ($cat === 'greasing' && ! $isGreasingApplicable) {
                    $isApplicable = false;
                }

                if (! $isApplicable) {
                    $row[$cat] = ['plan' => null, 'actual' => null, 'applicable' => false];
                } else {
                    $row[$cat] = ['plan' => $plan, 'actual' => $actual, 'applicable' => true];
                    $totalPlanAll += $plan;
                    $totalActualAll += $actual;
                }
            }
            $rekap[] = $row;
        }

        $remaining = max(0, $totalPlanAll - $totalActualAll);
        $compliance = $totalPlanAll > 0 ? round(($totalActualAll / $totalPlanAll) * 100, 1) : 0;

        // --- Trend: monthly compliance for each category over the year ---
        $trendMonthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $trendYear = $end->year;
        $trendData = ['inspection' => [], 'washing' => [], 'greasing' => [], 'cleaning_track' => []];

        for ($m = 1; $m <= 12; $m++) {
            foreach ($categories as $cat) {
                $catUnitIds = $activeUnitIds;
                if ($cat === 'cleaning_track') {
                    $catUnitIds = array_keys(array_filter($unitIdToCategory, fn ($c) => in_array(strtoupper(trim($c)), $cleaningTrackCatsUpper)));
                    $catUnitIds = array_values(array_intersect($catUnitIds, $activeUnitIds));
                } elseif ($cat === 'greasing') {
                    $catUnitIds = array_keys(array_filter($unitIdToCategory, fn ($c) => ! in_array(strtoupper(trim($c)), $nonGreasingCatsUpper)));
                    $catUnitIds = array_values(array_intersect($catUnitIds, $activeUnitIds));
                }

                $mPlanCat = PlanInspectionTarget::whereIn('unit_id', $catUnitIds)
                    ->where('month', $m)->where('year', $trendYear)
                    ->where('category', $cat)->sum('target_value');

                $mActCat = PlanInspection::whereYear('inspection_date', $trendYear)
                    ->whereMonth('inspection_date', $m)
                    ->where('category', $cat)
                    ->whereIn('unit_id', $catUnitIds)
                    ->count();

                $trendData[$cat][] = $mPlanCat > 0 ? round(($mActCat / $mPlanCat) * 100, 1) : 0;
            }
        }

        // Previous month compliance for growth arrow
        $prevMonth = $end->copy()->subMonth();
        $prevPlan = PlanInspectionTarget::whereIn('unit_id', $activeUnitIds)
            ->where('month', $prevMonth->month)->where('year', $prevMonth->year)->sum('target_value');
        $prevAct = PlanInspection::whereBetween('inspection_date', [
            $prevMonth->startOfMonth()->format('Y-m-d'),
            $prevMonth->copy()->endOfMonth()->format('Y-m-d'),
        ])->whereIn('unit_id', $activeUnitIds)->count();
        $prevCompliance = $prevPlan > 0 ? round(($prevAct / $prevPlan) * 100, 1) : 0;
        $growth = round($compliance - $prevCompliance, 1);

        return response()->json([
            'kpi' => [
                'totalPlan' => $totalPlanAll,
                'totalActual' => $totalActualAll,
                'remaining' => $remaining,
                'compliance' => $compliance,
                'growth' => $growth,
            ],
            'rekap' => $rekap,
            'trend' => [
                'labels' => $trendMonthLabels,
                'datasets' => $trendData,
            ],
            'unitTypes' => $unitTypes,
            'cleaningTrackCategories' => $cleaningTrackCats,
            'nonGreasingCategories' => $nonGreasingCats,
        ]);
    }

    /**
     * Upsert a plan target value for a unit/category/month/year.
     */
    public function updateTarget(Request $request)
    {
        $request->validate([
            'unit_id' => 'required|exists:units,id',
            'category' => 'required|string|in:washing,inspection,greasing,cleaning_track',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
            'target_value' => 'required|integer|min:0',
        ]);

        PlanInspectionTarget::updateOrCreate(
            [
                'unit_id' => $request->unit_id,
                'category' => $request->category,
                'month' => $request->month,
                'year' => $request->year,
            ],
            ['target_value' => $request->target_value]
        );

        return response()->json(['status' => 'ok']);
    }

    /**
     * Download Excel template containing all 125 units in 17 groups for the given month/year.
     */
    public function downloadTemplate(Request $request): StreamedResponse
    {
        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);
        $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
        $monthName = Carbon::create($year, $month, 1)->translatedFormat('F');

        $unitData = self::getCustomGroupedUnits();
        $groupedUnits = $unitData['groupedUnits'];
        $allowedUnitIds = array_keys($unitData['unitIdToCategory']);

        // Fetch existing inspection records for this month to pre-fill
        $inspections = PlanInspection::whereIn('unit_id', $allowedUnitIds)
            ->whereYear('inspection_date', $year)
            ->whereMonth('inspection_date', $month)
            ->get();

        $fourShiftCats = self::get4ShiftCategories();

        $existingLookup = [];
        foreach ($inspections as $ins) {
            $day = Carbon::parse($ins->inspection_date)->day;
            $s = $ins->shift ?? 'all';
            $existingLookup[$ins->category][$ins->unit_id][$day][$s] = true;
            $existingLookup[$ins->category][$ins->unit_id][$day]['checked'] = true;
        }

        $categories = [
            'washing' => 'Washing',
            'inspection' => 'Inspection',
            'greasing' => 'Greasing',
            'cleaning_track' => 'Cleaning Track',
        ];

        $spreadsheet = new Spreadsheet;
        $spreadsheet->removeSheetByIndex(0);

        foreach ($categories as $catKey => $catLabel) {
            $sheet = $spreadsheet->createSheet();
            $sheet->setTitle($catLabel);
            $isGreasingSheet = ($catKey === 'greasing');

            // Title
            $sheet->setCellValue('A1', 'DAILY MAINTENANCE ACHIEVEMENT - '.strtoupper($catLabel).' (BULAN: '.strtoupper($monthName)." {$year})");
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(13);

            $sheet->setCellValue('A2', 'Petunjuk: Isi angka 1 atau huruf X pada kolom tanggal untuk menandai kegiatan pada unit, lalu simpan dan upload.');
            $sheet->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->getColor()->setRGB('555555');

            // Table Headers in Row 4
            $sheet->setCellValue('A4', 'NO');
            $sheet->setCellValue('B4', 'KATEGORI UNIT');
            $sheet->setCellValue('C4', 'MODEL');
            $sheet->setCellValue('D4', 'KODE UNIT');

            $colIdx = 5;
            $dayShiftColMap = [];

            if ($isGreasingSheet) {
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    $shifts = ['Shift 1', 'Shift 2'];
                    foreach ($shifts as $s) {
                        $colLetter = Coordinate::stringFromColumnIndex($colIdx);
                        $sheet->setCellValue("{$colLetter}4", "Tgl {$d} {$s}");
                        $sKey = ($s === 'Shift 2') ? 'shift_2' : 'shift_1';
                        $dayShiftColMap[$colIdx] = ['day' => $d, 'shift' => $sKey];
                        $colIdx++;
                    }
                }
            } else {
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    $colLetter = Coordinate::stringFromColumnIndex($colIdx);
                    $sheet->setCellValue("{$colLetter}4", $d);
                    $dayShiftColMap[$colIdx] = ['day' => $d, 'shift' => 'all'];
                    $colIdx++;
                }
            }

            $lastColLetter = Coordinate::stringFromColumnIndex($colIdx - 1);
            $headerRange = "A4:{$lastColLetter}4";
            $sheet->getStyle($headerRange)->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
            $sheet->getStyle($headerRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('1E3A8A');
            $sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $row = 5;
            $no = 1;
            $targetGroupedUnits = $groupedUnits;
            if ($catKey === 'cleaning_track') {
                $cleanTrackUpper = array_map('strtoupper', self::getCleaningTrackCategories());
                $targetGroupedUnits = array_filter(
                    $groupedUnits,
                    fn ($grp) => in_array(strtoupper(trim($grp)), $cleanTrackUpper),
                    ARRAY_FILTER_USE_KEY
                );
            } elseif ($catKey === 'greasing') {
                $nonGreasingUpper = array_map('strtoupper', self::getNonGreasingCategories());
                $targetGroupedUnits = array_filter(
                    $groupedUnits,
                    fn ($grp) => ! in_array(strtoupper(trim($grp)), $nonGreasingUpper),
                    ARRAY_FILTER_USE_KEY
                );
            }

            foreach ($targetGroupedUnits as $groupName => $units) {
                // Group Header Row
                $sheet->setCellValue("A{$row}", $groupName);
                $sheet->mergeCells("A{$row}:{$lastColLetter}{$row}");
                $sheet->getStyle("A{$row}:{$lastColLetter}{$row}")->getFont()->setBold(true);
                $sheet->getStyle("A{$row}:{$lastColLetter}{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('E2E8F0');
                $row++;

                $is4ShiftUnitGroup = ($isGreasingSheet && in_array($groupName, $fourShiftCats));

                foreach ($units as $u) {
                    $sheet->setCellValue("A{$row}", $no++);
                    $sheet->setCellValue("B{$row}", $groupName);
                    $sheet->setCellValue("C{$row}", $u->model);
                    $sheet->setCellValue("D{$row}", $u->code_unit);

                    foreach ($dayShiftColMap as $cIndex => $info) {
                        $colLetter = Coordinate::stringFromColumnIndex($cIndex);
                        $day = $info['day'];
                        $shift = $info['shift'];

                        $isMarked = false;
                        if ($is4ShiftUnitGroup) {
                            $isMarked = ! empty($existingLookup[$catKey][$u->id][$day][$shift]);
                        } else {
                            if ($shift === 'all' || $shift === 'pagi' || $shift === 'shift_1') {
                                $isMarked = ! empty($existingLookup[$catKey][$u->id][$day]['checked']);
                            }
                        }

                        if ($isMarked) {
                            $sheet->setCellValue("{$colLetter}{$row}", 1);
                        }
                        $sheet->getStyle("{$colLetter}{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    }
                    $row++;
                }
            }

            // Auto fit column widths
            $sheet->getColumnDimension('A')->setWidth(6);
            $sheet->getColumnDimension('B')->setWidth(24);
            $sheet->getColumnDimension('C')->setWidth(24);
            $sheet->getColumnDimension('D')->setWidth(14);
            for ($c = 5; $c < $colIdx; $c++) {
                $colLetter = Coordinate::stringFromColumnIndex($c);
                $sheet->getColumnDimension($colLetter)->setWidth($isGreasingSheet ? 9 : 4.5);
            }
        }

        $spreadsheet->setActiveSheetIndex(0);

        $filename = "Template_Plan_Inspection_{$monthName}_{$year}.xlsx";

        return new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Import spreadsheet matrix into plan inspections.
     */
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:20480',
            'month' => 'nullable|integer|min:1|max:12',
            'year' => 'nullable|integer',
        ]);

        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);
        $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;

        $unitData = self::getCustomGroupedUnits();
        $allowedUnits = collect($unitData['allUnits'])->keyBy(fn ($u) => strtoupper(trim($u->code_unit)));

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getRealPath());

        $categoryMap = [
            'wash' => 'washing',
            'cuci' => 'washing',
            'insp' => 'inspection',
            'cek' => 'inspection',
            'grea' => 'greasing',
            'gemuk' => 'greasing',
            'clean' => 'cleaning_track',
            'track' => 'cleaning_track',
        ];

        $importedCount = 0;
        $updatedUnits = [];

        foreach ($spreadsheet->getAllSheets() as $sheet) {
            $sheetTitle = strtolower(trim($sheet->getTitle()));
            $category = null;

            foreach ($categoryMap as $keyword => $catVal) {
                if (str_contains($sheetTitle, $keyword)) {
                    $category = $catVal;
                    break;
                }
            }

            // Fallback: check cell A1
            if (! $category) {
                $a1 = strtolower(trim((string) $sheet->getCell('A1')->getValue()));
                foreach ($categoryMap as $keyword => $catVal) {
                    if (str_contains($a1, $keyword)) {
                        $category = $catVal;
                        break;
                    }
                }
            }

            if (! $category) {
                continue; // Skip unrecognized sheet
            }

            $highestRow = $sheet->getHighestRow();
            $highestCol = $sheet->getHighestColumn();
            $highestColIndex = Coordinate::columnIndexFromString($highestCol);

            // Find header row where 'KODE UNIT' or day numbers are located
            $headerRow = 4;
            $codeUnitCol = 4; // Col D by default
            $dayCols = [];

            for ($r = 1; $r <= min(10, $highestRow); $r++) {
                for ($c = 1; $c <= $highestColIndex; $c++) {
                    $val = strtoupper(trim((string) $sheet->getCell([$c, $r])->getValue()));
                    if (in_array($val, ['KODE UNIT', 'CODE UNIT', 'KODE', 'CODE', 'UNIT'])) {
                        $headerRow = $r;
                        $codeUnitCol = $c;
                        break 2;
                    }
                }
            }

            // Parse header columns for day numbers and shifts
            for ($c = 1; $c <= $highestColIndex; $c++) {
                $val = trim((string) $sheet->getCell([$c, $headerRow])->getValue());
                $dayNum = null;
                $shift = 'all';

                if (is_numeric($val) && (int) $val >= 1 && (int) $val <= $daysInMonth) {
                    $dayNum = (int) $val;
                } elseif (preg_match('/(?:Tgl\s*)?(\d+)(?:\s*(Shift\s*1|Shift\s*2|S1|S2|Pagi|Siang|Sore|Malam|P|Si|So|M))?/i', $val, $matches)) {
                    $dayCandidate = (int) $matches[1];
                    if ($dayCandidate >= 1 && $dayCandidate <= $daysInMonth) {
                        $dayNum = $dayCandidate;
                        if (! empty($matches[2])) {
                            $rawShift = strtolower(str_replace(' ', '', $matches[2]));
                            if (in_array($rawShift, ['shift2', 's2', 'sore', 'malam', 'so', 'm'])) {
                                $shift = 'shift_2';
                            } else {
                                $shift = 'shift_1';
                            }
                        }
                    }
                }

                if ($dayNum) {
                    $dayCols[$c] = ['day' => $dayNum, 'shift' => $shift];
                }
            }

            if (empty($dayCols)) {
                continue;
            }

            // Read rows starting from headerRow + 1
            for ($r = $headerRow + 1; $r <= $highestRow; $r++) {
                $code = strtoupper(trim((string) $sheet->getCell([$codeUnitCol, $r])->getValue()));
                if (empty($code) || ! $allowedUnits->has($code)) {
                    continue;
                }

                $unit = $allowedUnits->get($code);

                foreach ($dayCols as $colIndex => $info) {
                    $cellVal = trim((string) $sheet->getCell([$colIndex, $r])->getValue());
                    if ($cellVal === '' || $cellVal === '0' || $cellVal === '-') {
                        continue;
                    }

                    $dayNum = $info['day'];
                    $shift = $info['shift'];
                    $dateStr = sprintf('%04d-%02d-%02d', $year, $month, $dayNum);

                    PlanInspection::updateOrCreate(
                        [
                            'unit_id' => $unit->id,
                            'inspection_date' => $dateStr,
                            'category' => $category,
                            'shift' => $shift,
                        ],
                        [
                            'is_completed' => true,
                        ]
                    );

                    $importedCount++;
                    $updatedUnits[$unit->id] = true;
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Berhasil mengimpor {$importedCount} entri kegiatan dari file Excel untuk ".count($updatedUnits).' unit.',
            'imported_count' => $importedCount,
            'units_count' => count($updatedUnits),
        ]);
    }
}
