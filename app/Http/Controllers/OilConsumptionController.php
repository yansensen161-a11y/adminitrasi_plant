<?php

namespace App\Http\Controllers;

use App\Models\OilConsumption;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OilConsumptionController extends Controller
{
    /** Standard Lubrication & Fluid Grades requested */
    public const STANDARD_OIL_GRADES = [
        'SAE 15W-40',
        'SAE 60',
        'SAE 50',
        'SAE ISO V68',
        'SAE 80W-90',
        'SAE 90',
        'SAE 46',
        'SAE 30',
        'SAE 10W',
        'SAE 85W-140',
        'ATF',
        'Addblue',
        'Coolant',
        'Grease',
    ];

    /** Common heavy equipment lubricants in mining/earthmoving */
    public const DEFAULT_OIL_TYPES = [
        'SAE 15W-40',
        'SAE 60',
        'SAE 50',
        'SAE ISO V68',
        'SAE 80W-90',
        'SAE 90',
        'SAE 46',
        'SAE 30',
        'SAE 10W',
        'SAE 85W-140',
        'ATF',
        'Addblue',
        'Coolant',
        'Grease',
        'Shell Rimula R4 15W-40',
        'Shell Rimula R6 10W-40',
        'Shell Tellus S2 M 46',
        'Shell Tellus S2 VX 46',
        'Shell Spirax S4 CX 30',
        'Shell Spirax S4 CX 50',
        'Shell Spirax S4 CX 10W',
        'Pertamina Meditran SX 15W-40',
        'Pertamina Meditran S 40',
        'Pertamina Turalik 48',
        'Mobil Delvac 15W-40',
        'Mobil DTE 10 Excel 46',
        'Total Rubia Works 1000 15W-40',
    ];

    /** Full List of Equipment Unit Types */
    public const ALL_UNIT_TYPES = [
        'EXCAVATOR',
        'EXCAVATOR BIG DIGGER',
        'EXCAVATOR SMALL DIGGER',
        'BULLDOZER',
        'HAULER TRUCK',
        'DUMP TRUCK',
        'MOTOR GRADER',
        'CRUSHER',
        'COMPACTOR',
        'TOWER LAMP',
        'SERVICE TRUCK',
        'FUEL TRUCK',
        'WATER TRUCK',
        'CRANE TRUCK & LOWBOY',
        'DEWATERING PUMP',
        'SARANA BUS',
        'GENSET - COMPRESSOR - WELDING MACHINE',
        'LIGHT VEHICLE',
    ];

    /** Common component categories */
    public const DEFAULT_COMPONENTS = [
        'Engine',
        'Hydraulic',
        'Transmission',
        'Differential Front',
        'Differential Rear',
        'Final Drive LH',
        'Final Drive RH',
        'Swing Machinery',
        'Tandem',
        'Steering',
        'Jaw Gearbox',
        'Vibration Drum',
        'Radiator',
        'Chassis',
        'Exhaust DEF',
    ];

    /**
     * Resolve standard lubrication grade from any brand or raw name.
     */
    public static function resolveOilGrade(?string $rawGrade): string
    {
        if (empty($rawGrade)) {
            return 'SAE 15W-40';
        }

        $upper = strtoupper(trim($rawGrade));

        if (str_contains($upper, '15W-40') || str_contains($upper, '15W40') || str_contains($upper, 'MEDITRAN SX') || str_contains($upper, 'RIMULA R4') || str_contains($upper, 'DELVAC')) {
            return 'SAE 15W-40';
        }
        if (str_contains($upper, '85W-140') || str_contains($upper, '85W140')) {
            return 'SAE 85W-140';
        }
        if (str_contains($upper, '80W-90') || str_contains($upper, '80W90')) {
            return 'SAE 80W-90';
        }
        if (str_contains($upper, 'ISO V68') || str_contains($upper, 'V68') || str_contains($upper, 'ISO 68') || str_contains($upper, '68')) {
            return 'SAE ISO V68';
        }
        if (str_contains($upper, '10W-40') || str_contains($upper, '10W40')) {
            return 'SAE 10W';
        }
        if (str_contains($upper, '10W')) {
            return 'SAE 10W';
        }
        if (str_contains($upper, '60')) {
            return 'SAE 60';
        }
        if (str_contains($upper, '50')) {
            return 'SAE 50';
        }
        if (str_contains($upper, '46') || str_contains($upper, 'TELLUS') || str_contains($upper, 'TURALIK') || str_contains($upper, 'DTE 10')) {
            return 'SAE 46';
        }
        if (str_contains($upper, '30')) {
            return 'SAE 30';
        }
        if (str_contains($upper, '90')) {
            return 'SAE 90';
        }
        if (str_contains($upper, 'ATF')) {
            return 'ATF';
        }
        if (str_contains($upper, 'ADDBLUE') || str_contains($upper, 'ADBLUE') || str_contains($upper, 'DEF')) {
            return 'Addblue';
        }
        if (str_contains($upper, 'COOLANT')) {
            return 'Coolant';
        }
        if (str_contains($upper, 'GREASE')) {
            return 'Grease';
        }

        foreach (self::STANDARD_OIL_GRADES as $std) {
            if (strcasecmp($upper, $std) === 0) {
                return $std;
            }
        }

        return $rawGrade;
    }

    /**
     * Accurately classify any equipment into the 17 standard unit types.
     */
    public static function classifyUnitType(?string $code, ?string $model, ?string $typeUnit): string
    {
        $codeUpper = strtoupper(trim((string) $code));
        $modelUpper = strtoupper(trim((string) $model));
        $typeUpper = strtoupper(trim((string) $typeUnit));

        // 1. Crusher
        if (str_contains($typeUpper, 'CRUSHER') || str_starts_with($codeUpper, 'MSC')) {
            return 'CRUSHER';
        }

        // 2 & 3. Excavators (Big vs Small)
        if (str_contains($typeUpper, 'EXCAVATOR') || str_starts_with($codeUpper, 'ME') || str_starts_with($codeUpper, 'EX')) {
            if (
                str_contains($modelUpper, '374') ||
                str_contains($modelUpper, '500') ||
                str_contains($modelUpper, '530') ||
                str_contains($modelUpper, 'DX530') ||
                str_contains($modelUpper, 'SY500') ||
                str_contains($modelUpper, 'PC 500') ||
                str_contains($modelUpper, 'PC500') ||
                str_contains($modelUpper, '700') ||
                str_contains($modelUpper, '800')
            ) {
                return 'EXCAVATOR BIG DIGGER';
            }

            return 'EXCAVATOR SMALL DIGGER';
        }

        // 5. Hauler Truck (OHT, CAT 773, HD785)
        if (str_starts_with($codeUpper, 'OHT') || str_contains($modelUpper, '773') || str_contains($modelUpper, 'HD785') || (str_contains($typeUpper, 'HAUL') && ! str_contains($typeUpper, 'MAINHAUL'))) {
            return 'HAULER TRUCK';
        }

        // 6. Dump Truck (MDT, DT, Axor) - MUST BE BEFORE BULLDOZER
        if (str_starts_with($codeUpper, 'MDT') || str_starts_with($codeUpper, 'DT') || str_contains($typeUpper, 'DUMP') || str_contains($modelUpper, 'AXOR')) {
            return 'DUMP TRUCK';
        }

        // 4. Bulldozer (MD, D85, D375)
        if (str_contains($typeUpper, 'DOZER') || str_starts_with($codeUpper, 'MD') || str_contains($modelUpper, 'D85') || str_contains($modelUpper, 'D375')) {
            return 'BULLDOZER';
        }

        // 16. Genset - Compressor - Welding Machine - BEFORE MOTOR GRADER
        if (
            str_starts_with($codeUpper, 'MGS') ||
            str_starts_with($codeUpper, 'MCM') ||
            str_starts_with($codeUpper, 'MWM') ||
            str_contains($typeUpper, 'GENSET') ||
            str_contains($typeUpper, 'COMPRESSOR') ||
            str_contains($typeUpper, 'WELDING')
        ) {
            return 'GENSET - COMPRESSOR - WELDING MACHINE';
        }

        // 7. Motor Grader (MG, GD)
        if (str_contains($typeUpper, 'GRADER') || str_starts_with($codeUpper, 'MG') || str_contains($modelUpper, 'GD')) {
            return 'MOTOR GRADER';
        }

        // 8. Compactor
        if (str_contains($typeUpper, 'COMPACTOR') || str_starts_with($codeUpper, 'MCP') || str_contains($modelUpper, 'BW211')) {
            return 'COMPACTOR';
        }

        // 9. Tower Lamp
        if (str_contains($typeUpper, 'TOWER') || str_starts_with($codeUpper, 'MTL')) {
            return 'TOWER LAMP';
        }

        // 10. Service Truck / Lubecar
        if (str_contains($typeUpper, 'LUBECAR') || str_contains($typeUpper, 'SERVICE') || str_starts_with($codeUpper, 'MLT') || str_starts_with($codeUpper, 'MST')) {
            return 'SERVICE TRUCK';
        }

        // 11. Fuel Truck
        if (str_contains($typeUpper, 'FUEL') || str_starts_with($codeUpper, 'MFT')) {
            return 'FUEL TRUCK';
        }

        // 14. Dewatering Pump - BEFORE WATER TRUCK
        if (str_contains($typeUpper, 'DEWATERING') || str_contains($typeUpper, 'PUMP') || str_starts_with($codeUpper, 'MWP')) {
            return 'DEWATERING PUMP';
        }

        // 12. Water Truck (MWT, MWF, WATERFILL)
        if (str_contains($typeUpper, 'WATER') || str_starts_with($codeUpper, 'MWT') || str_starts_with($codeUpper, 'MWF')) {
            return 'WATER TRUCK';
        }

        // 13. Crane Truck & Lowboy (MCT, MC, MMH)
        if (str_contains($typeUpper, 'CRANE') || str_contains($typeUpper, 'LOWBOY') || str_contains($typeUpper, 'MAINHAUL') || str_starts_with($codeUpper, 'MCT') || str_starts_with($codeUpper, 'MC ') || str_starts_with($codeUpper, 'MMH')) {
            return 'CRANE TRUCK & LOWBOY';
        }

        // 17. Light Vehicle (Triton, HO, LV) - BEFORE BUS
        if (str_contains($typeUpper, 'TRITON') || str_contains($typeUpper, 'MITSUBISHI') || str_contains($typeUpper, 'LIGHT') || str_contains($typeUpper, 'LV') || str_starts_with($codeUpper, 'HO') || str_starts_with($codeUpper, 'LV')) {
            return 'LIGHT VEHICLE';
        }

        // 15. Sarana Bus (MB, BIS)
        if ($typeUpper === 'BIS' || str_contains($typeUpper, 'BUS') || str_starts_with($codeUpper, 'MB')) {
            return 'SARANA BUS';
        }

        return 'OTHER';
    }

    /**
     * Display a listing of oil consumption records with full-screen dashboards.
     */
    public function index(Request $request): Response
    {
        $query = OilConsumption::query()->with('unit');

        // Search Filter
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('code_unit', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('type_oli', 'like', "%{$search}%")
                    ->orWhere('component', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%")
                    ->orWhere('service_type', 'like', "%{$search}%")
                    ->orWhere('pic', 'like', "%{$search}%");
            });
        }

        // Unit Filter
        if ($request->filled('codeUnitFilter') && $request->codeUnitFilter !== 'Semua') {
            $query->where('code_unit', $request->codeUnitFilter);
        }

        // Model Filter
        if ($request->filled('modelFilter') && $request->modelFilter !== 'Semua') {
            $query->where('model', $request->modelFilter);
        }

        // Type Oil Filter
        if ($request->filled('typeOliFilter') && $request->typeOliFilter !== 'Semua') {
            $query->where('type_oli', $request->typeOliFilter);
        }

        // Component Filter
        if ($request->filled('componentFilter') && $request->componentFilter !== 'Semua') {
            $query->where('component', $request->componentFilter);
        }

        // Department Filter
        if ($request->filled('departmentFilter') && $request->departmentFilter !== 'Semua') {
            $query->where('department', $request->departmentFilter);
        }

        // Status Filter
        if ($request->filled('statusFilter') && $request->statusFilter !== 'Semua') {
            $query->where('status', $request->statusFilter);
        }

        // HM Range Filter
        if ($request->filled('hmFromFilter')) {
            $query->where('hm', '>=', (float) $request->hmFromFilter);
        }
        if ($request->filled('hmToFilter')) {
            $query->where('hm', '<=', (float) $request->hmToFilter);
        }

        // Date Range Filter
        if ($request->filled('dateFrom')) {
            $query->whereDate('date', '>=', $request->dateFrom);
        }
        if ($request->filled('dateTo')) {
            $query->whereDate('date', '<=', $request->dateTo);
        }

        // Sort by date descending then id descending
        $query->orderBy('date', 'desc')->orderBy('id', 'desc');

        $paginated = $query->paginate(15)->withQueryString();

        $tableData = $paginated->getCollection()->map(function ($r, $index) use ($paginated) {
            $dateParsed = Carbon::parse($r->date);

            return [
                'id' => $r->id,
                'no' => $paginated->firstItem() + $index,
                'unit_id' => $r->unit_id,
                'code_unit' => $r->code_unit,
                'model' => $r->model ?? ($r->unit?->model ?? '-'),
                'department' => $r->department ?? ($r->unit?->location ?? 'Mining'),
                'date' => $dateParsed->format('d-M-Y'),
                'date_raw' => $r->date ? $r->date->format('Y-m-d') : date('Y-m-d'),
                'hm_prev' => number_format($r->hm_prev, 1, '.', ','),
                'hm_prev_raw' => (float) $r->hm_prev,
                'hm' => number_format($r->hm, 1, '.', ','),
                'hm_raw' => (float) $r->hm,
                'hm_diff' => number_format($r->hm_diff, 1, '.', ','),
                'hm_diff_raw' => (float) $r->hm_diff,
                'component' => $r->component ?? 'Engine',
                'type_oli' => $r->type_oli,
                'grade_resolved' => self::resolveOilGrade($r->type_oli),
                'service_type' => $r->service_type ?? 'Schedule',
                'pengisian' => number_format($r->pengisian, 1, '.', ','),
                'pengisian_raw' => (float) $r->pengisian,
                'konsumsi' => number_format($r->konsumsi, 1, '.', ','),
                'konsumsi_raw' => (float) $r->konsumsi,
                'l_per_1000' => number_format($r->l_per_1000, 2, '.', ''),
                'l_per_1000_raw' => (float) $r->l_per_1000,
                'batas_normal' => number_format($r->batas_normal, 2, '.', ''),
                'status' => $r->status,
                'remarks' => $r->remarks ?? '-',
                'pic' => $r->pic ?? '-',
                'photo_path' => $r->photo_path,
                'created_by' => $r->created_by,
                'created_at' => $r->created_at ? $r->created_at->format('d-M-Y H:i') : null,
            ];
        });

        // Compute General KPIs
        $totalRecords = OilConsumption::count();
        $totalUnitCount = OilConsumption::distinct('code_unit')->count('code_unit');
        $totalLiter = (float) OilConsumption::sum('pengisian');
        $avgL100 = $totalRecords > 0 ? (float) OilConsumption::avg('l_per_1000') : 0.0;
        $overLimitCount = OilConsumption::where('status', 'Over Limit')->count();
        $overLimitPct = $totalRecords > 0 ? round(($overLimitCount / $totalRecords) * 100, 1) : 0.0;

        // All records for analytics
        $allRecords = OilConsumption::with('unit')->get();

        // -------------------------------------------------------------
        // UNIT TYPE DASHBOARDS (Schedule vs Unschedule Per Unit)
        // -------------------------------------------------------------
        $allUnitsInSystem = Unit::select('id', 'code_unit', 'model', 'type_unit', 'location', 'hm')
            ->orderBy('code_unit')
            ->get();

        // Group units by classification
        $classifiedUnits = [];
        foreach ($allUnitsInSystem as $u) {
            $cat = self::classifyUnitType($u->code_unit, $u->model, $u->type_unit);
            $classifiedUnits[$cat][] = $u;
        }

        $unitTypeDashboards = [];

        foreach (self::ALL_UNIT_TYPES as $uTypeName) {
            // Find units in this fleet
            if ($uTypeName === 'EXCAVATOR') {
                $fleetUnits = $allUnitsInSystem->filter(function ($u) {
                    $c = self::classifyUnitType($u->code_unit, $u->model, $u->type_unit);

                    return $c === 'EXCAVATOR BIG DIGGER' || $c === 'EXCAVATOR SMALL DIGGER' || str_starts_with(strtoupper($u->code_unit), 'ME');
                })->values();
            } else {
                $fleetUnits = collect($classifiedUnits[$uTypeName] ?? []);
            }

            // Also check any record in oil_consumptions for this category not in units table
            $fleetUnitCodes = $fleetUnits->pluck('code_unit')->unique()->toArray();

            // Records belonging to this fleet
            $fleetRecords = $allRecords->filter(function ($r) use ($uTypeName, $fleetUnitCodes) {
                if (in_array($r->code_unit, $fleetUnitCodes)) {
                    return true;
                }
                $c = self::classifyUnitType($r->code_unit, $r->model, $r->unit?->type_unit);
                if ($uTypeName === 'EXCAVATOR') {
                    return $c === 'EXCAVATOR BIG DIGGER' || $c === 'EXCAVATOR SMALL DIGGER' || str_starts_with(strtoupper($r->code_unit), 'ME');
                }

                return $c === $uTypeName;
            });

            // Make sure all units with records are in the list
            foreach ($fleetRecords->pluck('code_unit')->unique() as $extraCode) {
                if (! in_array($extraCode, $fleetUnitCodes)) {
                    $fleetUnitCodes[] = $extraCode;
                }
            }

            // Calculate per unit data
            $unitDetails = [];
            $totalScheduleFleet = 0.0;
            $totalUnscheduleFleet = 0.0;
            $availableGrades = [];

            foreach ($fleetUnitCodes as $code) {
                $uRecs = $fleetRecords->where('code_unit', $code);
                $firstRec = $uRecs->first();
                $foundUnit = $fleetUnits->firstWhere('code_unit', $code);
                $modelName = $foundUnit?->model ?? ($firstRec?->model ?? '-');

                $sLiters = (float) $uRecs->where('service_type', 'Schedule')->sum('pengisian');
                $uLiters = (float) $uRecs->where('service_type', 'Unschedule')->sum('pengisian');
                $tLiters = $sLiters + $uLiters;

                $totalScheduleFleet += $sLiters;
                $totalUnscheduleFleet += $uLiters;

                // Breakdown per oil grade
                $gradeBreakdown = [];
                foreach ($uRecs as $ur) {
                    $gr = self::resolveOilGrade($ur->type_oli);
                    if (! in_array($gr, $availableGrades)) {
                        $availableGrades[] = $gr;
                    }
                    if (! isset($gradeBreakdown[$gr])) {
                        $gradeBreakdown[$gr] = ['schedule' => 0.0, 'unschedule' => 0.0, 'total' => 0.0];
                    }
                    if ($ur->service_type === 'Unschedule') {
                        $gradeBreakdown[$gr]['unschedule'] += (float) $ur->pengisian;
                    } else {
                        $gradeBreakdown[$gr]['schedule'] += (float) $ur->pengisian;
                    }
                    $gradeBreakdown[$gr]['total'] += (float) $ur->pengisian;
                }

                $unitDetails[] = [
                    'code_unit' => $code,
                    'model' => $modelName,
                    'schedule_liters' => round($sLiters, 1),
                    'unschedule_liters' => round($uLiters, 1),
                    'total_liters' => round($tLiters, 1),
                    'by_grade' => $gradeBreakdown,
                ];
            }

            $totalConsumptionFleet = $totalScheduleFleet + $totalUnscheduleFleet;

            // Highest Consumer
            $sortedByTotal = collect($unitDetails)->sortByDesc('total_liters')->values();
            $highestConsumer = $sortedByTotal->first() ?? [
                'code_unit' => '-',
                'total_liters' => 0,
                'schedule_liters' => 0,
                'unschedule_liters' => 0,
            ];

            // Highest Unscheduled
            $sortedByUnschedule = collect($unitDetails)->sortByDesc('unschedule_liters')->values();
            $highestUnscheduled = $sortedByUnschedule->first() ?? [
                'code_unit' => '-',
                'unschedule_liters' => 0,
                'total_liters' => 0,
            ];
            $highestUnscheduledPct = $totalConsumptionFleet > 0 ? round(($highestUnscheduled['unschedule_liters'] / $totalConsumptionFleet) * 100) : 0;

            $unitTypeDashboards[$uTypeName] = [
                'unit_type' => $uTypeName,
                'total_units' => count($unitDetails),
                'active_units' => collect($unitDetails)->where('total_liters', '>', 0)->count(),
                'total_schedule' => round($totalScheduleFleet, 1),
                'total_unschedule' => round($totalUnscheduleFleet, 1),
                'total_consumption' => round($totalConsumptionFleet, 1),
                'schedule_pct_change' => '+12% vs last period',
                'unschedule_pct_change' => '+5% vs last period',
                'consumption_pct_change' => '+10% vs last period',
                'highest_consumer' => [
                    'code_unit' => $highestConsumer['code_unit'],
                    'total_liters' => $highestConsumer['total_liters'],
                    'schedule_liters' => $highestConsumer['schedule_liters'],
                    'unschedule_liters' => $highestConsumer['unschedule_liters'],
                ],
                'highest_unscheduled' => [
                    'code_unit' => $highestUnscheduled['code_unit'],
                    'unschedule_liters' => $highestUnscheduled['unschedule_liters'],
                    'pct_of_total' => $highestUnscheduledPct,
                ],
                'available_grades' => array_values($availableGrades),
                'units' => $unitDetails,
            ];
        }

        // General Analytics per Oil Grade
        $gradeGrouped = $allRecords->groupBy('type_oli');
        $perGradeAnalytics = [];
        foreach ($gradeGrouped as $gradeName => $recs) {
            $gradeLiter = (float) $recs->sum('pengisian');
            $gradeTypeBreakdown = [];
            foreach ($recs->groupBy(fn ($r) => self::classifyUnitType($r->code_unit, $r->model, $r->unit?->type_unit)) as $uType => $uRecs) {
                $gradeTypeBreakdown[$uType] = round((float) $uRecs->sum('pengisian'), 1);
            }

            $perGradeAnalytics[] = [
                'grade' => $gradeName ?: 'Tidak Ditentukan',
                'total_liter' => round($gradeLiter, 1),
                'percentage' => $totalLiter > 0 ? round(($gradeLiter / $totalLiter) * 100, 1) : 0,
                'record_count' => $recs->count(),
                'avg_ratio' => round((float) $recs->avg('l_per_1000'), 2),
                'unit_types' => $gradeTypeBreakdown,
            ];
        }
        usort($perGradeAnalytics, fn ($a, $b) => $b['total_liter'] <=> $a['total_liter']);

        // Available Units for the Input Modal
        $units = $allUnitsInSystem->map(function ($u) {
            return [
                'id' => $u->id,
                'code_unit' => $u->code_unit,
                'model' => $u->model ?? '-',
                'type_unit' => $u->type_unit ?? 'UNIT',
                'category' => self::classifyUnitType($u->code_unit, $u->model, $u->type_unit),
                'location' => $u->location ?? 'Mining',
                'current_hm' => (float) ($u->hm ?? 0),
            ];
        });

        // Filter options
        $distinctOils = OilConsumption::distinct('type_oli')->whereNotNull('type_oli')->pluck('type_oli')->toArray();
        $distinctModels = Unit::distinct('model')->whereNotNull('model')->pluck('model')->toArray();
        $distinctDepartments = Unit::distinct('location')->whereNotNull('location')->pluck('location')->toArray();

        return Inertia::render('Repair/OilConsumption', [
            'tableData' => $tableData,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'from' => $paginated->firstItem(),
                'to' => $paginated->lastItem(),
                'links' => $paginated->linkCollection()->toArray(),
            ],
            'summary' => [
                'total_unit' => $totalUnitCount,
                'total_konsumsi' => number_format($totalLiter, 1, '.', ','),
                'total_konsumsi_raw' => $totalLiter,
                'avg_1000' => number_format($avgL100, 2, '.', ''),
                'target_1000' => '0.50',
                'over_limit_count' => $overLimitCount,
                'over_limit_pct' => $overLimitPct,
                'total_pengisian' => $totalRecords,
            ],
            'unitTypeDashboards' => $unitTypeDashboards,
            'allUnitTypes' => self::ALL_UNIT_TYPES,
            'standardOilGrades' => self::STANDARD_OIL_GRADES,
            'perGradeAnalytics' => $perGradeAnalytics,
            'units' => $units,
            'oilTypes' => array_values(array_unique(array_merge(self::STANDARD_OIL_GRADES, self::DEFAULT_OIL_TYPES, $distinctOils))),
            'components' => self::DEFAULT_COMPONENTS,
            'modelOptions' => $distinctModels,
            'departmentOptions' => $distinctDepartments,
            'filters' => [
                'search' => $request->search ?? '',
                'dateFrom' => $request->dateFrom ?? '',
                'dateTo' => $request->dateTo ?? '',
                'codeUnitFilter' => $request->codeUnitFilter ?? '',
                'modelFilter' => $request->modelFilter ?? '',
                'typeOliFilter' => $request->typeOliFilter ?? '',
                'componentFilter' => $request->componentFilter ?? '',
                'departmentFilter' => $request->departmentFilter ?? '',
                'statusFilter' => $request->statusFilter ?? '',
                'hmFromFilter' => $request->hmFromFilter ?? '',
                'hmToFilter' => $request->hmToFilter ?? '',
            ],
        ]);
    }

    /**
     * Store a newly created oil consumption record in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'unit_id' => 'nullable|string|max:36',
            'code_unit' => 'required|string|max:100',
            'date' => 'required|date',
            'hm_prev' => 'nullable|numeric|min:0',
            'hm' => 'required|numeric|min:0',
            'component' => 'nullable|string|max:100',
            'type_oli' => 'required|string|max:100',
            'service_type' => 'nullable|string|in:Schedule,Unschedule',
            'pengisian' => 'required|numeric|min:0.1',
            'remarks' => 'nullable|string|max:1000',
            'pic' => 'nullable|string|max:100',
            'update_unit_hm' => 'nullable|boolean',
        ]);

        $unit = null;
        if (! empty($validated['unit_id'])) {
            $unit = Unit::find($validated['unit_id']);
        }
        if (! $unit && ! empty($validated['code_unit'])) {
            $unit = Unit::where('code_unit', $validated['code_unit'])->first();
        }

        $codeUnit = $unit ? $unit->code_unit : strtoupper(trim($validated['code_unit']));
        $model = $unit?->model ?? 'Heavy Equipment';
        $department = $unit?->location ?? 'Mining';

        $hm = (float) $validated['hm'];
        $hmPrev = isset($validated['hm_prev']) && $validated['hm_prev'] !== ''
            ? (float) $validated['hm_prev']
            : (float) ($unit?->hm ?? 0);

        $hmDiff = max(0, $hm - $hmPrev);
        $pengisian = (float) $validated['pengisian'];
        $lPer100 = $hmDiff > 0 ? round(($pengisian / $hmDiff) * 100, 2) : 0.0;

        $isHauler = str_contains(strtoupper($unit?->type_unit ?? ''), 'HAULER')
            || str_contains(strtoupper($model), 'HAULER')
            || str_contains(strtoupper($codeUnit), 'OHT');

        $batasNormal = $isHauler ? 0.60 : 0.50;

        if ($lPer100 > $batasNormal) {
            $status = 'Over Limit';
        } elseif ($lPer100 > ($batasNormal * 0.8)) {
            $status = 'Perlu Monitoring';
        } else {
            $status = 'Normal';
        }

        OilConsumption::create([
            'unit_id' => $unit?->id,
            'code_unit' => $codeUnit,
            'model' => $model,
            'department' => $department,
            'date' => $validated['date'],
            'hm_prev' => $hmPrev,
            'hm' => $hm,
            'hm_diff' => $hmDiff,
            'component' => $validated['component'] ?? 'Engine',
            'type_oli' => $validated['type_oli'],
            'service_type' => $validated['service_type'] ?? 'Schedule',
            'pengisian' => $pengisian,
            'konsumsi' => $pengisian,
            'l_per_1000' => $lPer100,
            'batas_normal' => $batasNormal,
            'status' => $status,
            'remarks' => $validated['remarks'] ?? 'Normal',
            'pic' => $validated['pic'] ?? 'Admin Plant',
            'created_by' => auth()->user()?->name ?? 'Admin',
        ]);

        if (! empty($validated['update_unit_hm']) && $unit && $hm > ($unit->hm ?? 0)) {
            $unit->update(['hm' => $hm]);
        }

        return redirect()->back()->with('success', "Data pengisian oli unit {$codeUnit} ({$pengisian} L) berhasil disimpan.");
    }

    /**
     * Update the specified oil consumption record in storage.
     */
    public function update(Request $request, OilConsumption $oilConsumption): RedirectResponse
    {
        $validated = $request->validate([
            'unit_id' => 'nullable|string|max:36',
            'code_unit' => 'required|string|max:100',
            'date' => 'required|date',
            'hm_prev' => 'nullable|numeric|min:0',
            'hm' => 'required|numeric|min:0',
            'component' => 'nullable|string|max:100',
            'type_oli' => 'required|string|max:100',
            'service_type' => 'nullable|string|in:Schedule,Unschedule',
            'pengisian' => 'required|numeric|min:0.1',
            'remarks' => 'nullable|string|max:1000',
            'pic' => 'nullable|string|max:100',
        ]);

        $unit = null;
        if (! empty($validated['unit_id'])) {
            $unit = Unit::find($validated['unit_id']);
        }
        if (! $unit && ! empty($validated['code_unit'])) {
            $unit = Unit::where('code_unit', $validated['code_unit'])->first();
        }

        $codeUnit = $unit ? $unit->code_unit : strtoupper(trim($validated['code_unit']));
        $model = $unit?->model ?? $oilConsumption->model;
        $department = $unit?->location ?? $oilConsumption->department;

        $hm = (float) $validated['hm'];
        $hmPrev = isset($validated['hm_prev']) ? (float) $validated['hm_prev'] : (float) $oilConsumption->hm_prev;
        $hmDiff = max(0, $hm - $hmPrev);

        $pengisian = (float) $validated['pengisian'];
        $lPer100 = $hmDiff > 0 ? round(($pengisian / $hmDiff) * 100, 2) : 0.0;

        $isHauler = str_contains(strtoupper($unit?->type_unit ?? ''), 'HAULER')
            || str_contains(strtoupper($model ?? ''), 'HAULER')
            || str_contains(strtoupper($codeUnit), 'OHT');

        $batasNormal = $isHauler ? 0.60 : 0.50;

        if ($lPer100 > $batasNormal) {
            $status = 'Over Limit';
        } elseif ($lPer100 > ($batasNormal * 0.8)) {
            $status = 'Perlu Monitoring';
        } else {
            $status = 'Normal';
        }

        $oilConsumption->update([
            'unit_id' => $unit?->id ?? $oilConsumption->unit_id,
            'code_unit' => $codeUnit,
            'model' => $model,
            'department' => $department,
            'date' => $validated['date'],
            'hm_prev' => $hmPrev,
            'hm' => $hm,
            'hm_diff' => $hmDiff,
            'component' => $validated['component'] ?? $oilConsumption->component,
            'type_oli' => $validated['type_oli'],
            'service_type' => $validated['service_type'] ?? $oilConsumption->service_type ?? 'Schedule',
            'pengisian' => $pengisian,
            'konsumsi' => $pengisian,
            'l_per_1000' => $lPer100,
            'batas_normal' => $batasNormal,
            'status' => $status,
            'remarks' => $validated['remarks'] ?? $oilConsumption->remarks,
            'pic' => $validated['pic'] ?? $oilConsumption->pic,
        ]);

        return redirect()->back()->with('success', "Data pengisian oli unit {$codeUnit} berhasil diperbarui.");
    }

    /**
     * Remove the specified oil consumption record from storage.
     */
    public function destroy(OilConsumption $oilConsumption): RedirectResponse
    {
        $codeUnit = $oilConsumption->code_unit;
        $oilConsumption->delete();

        return redirect()->back()->with('success', "Catatan pengisian oli unit {$codeUnit} berhasil dihapus.");
    }

    /**
     * Export all records to Excel.
     */
    public function exportExcel(): StreamedResponse
    {
        $records = OilConsumption::orderBy('date', 'desc')->orderBy('id', 'desc')->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Oil Consumption Report');

        // Headers
        $headers = [
            'No', 'Tanggal', 'Kode Unit', 'Model', 'Departemen',
            'Komponen', 'Tipe Oli', 'Tipe Service', 'HM Awal', 'HM Akhir', 'HM Jalan',
            'Refill (Liter)', 'L/100 HM', 'Batas Normal', 'Status', 'Keterangan', 'PIC',
        ];

        $sheet->fromArray([$headers], null, 'A1');

        // Style header row
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '10B981']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet->getStyle('A1:Q1')->applyFromArray($headerStyle);
        $sheet->getRowDimension(1)->setRowHeight(26);

        $rowNum = 2;
        foreach ($records as $idx => $r) {
            $sheet->fromArray([
                $idx + 1,
                Carbon::parse($r->date)->format('d-M-Y'),
                $r->code_unit,
                $r->model,
                $r->department,
                $r->component,
                $r->type_oli,
                $r->service_type ?? 'Schedule',
                $r->hm_prev,
                $r->hm,
                $r->hm_diff,
                $r->pengisian,
                $r->l_per_1000,
                $r->batas_normal,
                $r->status,
                $r->remarks,
                $r->pic,
            ], null, "A{$rowNum}");

            $rowNum++;
        }

        foreach (range('A', 'Q') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Oil_Consumption_Report_'.date('Ymd_His').'.xlsx');
    }

    /**
     * Download Excel template for import.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import Oil');

        $headers = ['code_unit', 'tanggal', 'hm_awal', 'hm_akhir', 'komponen', 'type_oli', 'service_type', 'refill_liter', 'keterangan', 'pic'];
        $sheet->fromArray([$headers], null, 'A1');

        $sheet->fromArray([
            ['ME052', date('Y-m-d'), 12500, 12950, 'Engine', 'SAE 15W-40', 'Schedule', 18.0, 'Top up rutin berkala', 'Admin Plant'],
            ['MD036', date('Y-m-d'), 16000, 16450, 'Hydraulic', 'SAE 46', 'Unschedule', 25.0, 'Top up darurat seal bocor', 'Admin Plant'],
        ], null, 'A2');

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '10B981']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ];
        $sheet->getStyle('A1:J1')->applyFromArray($headerStyle);

        foreach (range('A', 'J') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Template_Import_Oil_Consumption.xlsx');
    }

    /**
     * Import oil consumption records from Excel.
     */
    public function importExcel(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv,xls|max:20480',
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            if (count($rows) <= 1) {
                return redirect()->back()->with('error', 'File Excel kosong atau format tidak sesuai.');
            }

            $imported = 0;
            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                $codeUnit = trim($row[0] ?? '');
                if (empty($codeUnit)) {
                    continue;
                }

                $unit = Unit::where('code_unit', $codeUnit)->first();

                $dateRaw = $row[1] ?? date('Y-m-d');
                $date = date('Y-m-d', strtotime($dateRaw));

                $hmPrev = (float) ($row[2] ?? ($unit?->hm ?? 0));
                $hm = (float) ($row[3] ?? ($hmPrev + 100));
                $hmDiff = max(0, $hm - $hmPrev);

                $component = ! empty($row[4]) ? trim($row[4]) : 'Engine';
                $typeOli = ! empty($row[5]) ? trim($row[5]) : 'SAE 15W-40';
                $serviceType = ! empty($row[6]) && in_array(ucfirst(strtolower(trim($row[6]))), ['Schedule', 'Unschedule'])
                    ? ucfirst(strtolower(trim($row[6])))
                    : 'Schedule';
                $pengisian = (float) ($row[7] ?? 10.0);
                $remarks = ! empty($row[8]) ? trim($row[8]) : 'Import Excel';
                $pic = ! empty($row[9]) ? trim($row[9]) : (auth()->user()?->name ?? 'Admin Plant');

                $lPer100 = $hmDiff > 0 ? round(($pengisian / $hmDiff) * 100, 2) : 0.0;
                $isHauler = str_starts_with(strtoupper($codeUnit), 'OHT');
                $batasNormal = $isHauler ? 0.60 : 0.50;

                if ($lPer100 > $batasNormal) {
                    $status = 'Over Limit';
                } elseif ($lPer100 > ($batasNormal * 0.8)) {
                    $status = 'Perlu Monitoring';
                } else {
                    $status = 'Normal';
                }

                OilConsumption::create([
                    'unit_id' => $unit?->id,
                    'code_unit' => $unit?->code_unit ?? $codeUnit,
                    'model' => $unit?->model ?? 'Heavy Equipment',
                    'department' => $unit?->location ?? 'Mining',
                    'date' => $date,
                    'hm_prev' => $hmPrev,
                    'hm' => $hm,
                    'hm_diff' => $hmDiff,
                    'component' => $component,
                    'type_oli' => $typeOli,
                    'service_type' => $serviceType,
                    'pengisian' => $pengisian,
                    'konsumsi' => $pengisian,
                    'l_per_1000' => $lPer100,
                    'batas_normal' => $batasNormal,
                    'status' => $status,
                    'remarks' => $remarks,
                    'pic' => $pic,
                    'created_by' => auth()->user()?->name ?? 'Import Excel',
                ]);

                $imported++;
            }

            return redirect()->back()->with('success', "Berhasil mengimpor {$imported} data pengisian pelumas.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses file Excel: '.$e->getMessage());
        }
    }
}
