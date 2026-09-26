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
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
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
        if (str_contains($typeUpper, 'CRUSHER') || str_starts_with($codeUpper, 'MSC') || in_array($codeUpper, ['ME023', 'ME053'])) {
            return 'CRUSHER';
        }

        // 2 & 3. Excavators (Big vs Small)
        if (str_contains($typeUpper, 'EXCAVATOR') || str_starts_with($codeUpper, 'ME') || str_starts_with($codeUpper, 'EX')) {
            if (in_array($codeUpper, ['ME049', 'ME055', 'ME056'])) {
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

        // Scope analytics and KPIs by date range if provided
        $analyticsQuery = OilConsumption::with('unit');
        $kpiRecordsQuery = OilConsumption::query();

        if ($request->filled('dateFrom')) {
            $analyticsQuery->whereDate('date', '>=', $request->dateFrom);
            $kpiRecordsQuery->whereDate('date', '>=', $request->dateFrom);
        }
        if ($request->filled('dateTo')) {
            $analyticsQuery->whereDate('date', '<=', $request->dateTo);
            $kpiRecordsQuery->whereDate('date', '<=', $request->dateTo);
        }

        // All records for analytics (strictly honoring the selected date range)
        $allRecords = $analyticsQuery->get();

        // Compute General KPIs based on the filtered scope
        $totalRecords = (clone $kpiRecordsQuery)->count();
        $totalUnitCount = (clone $kpiRecordsQuery)->distinct('code_unit')->count('code_unit');
        $totalLiter = (float) (clone $kpiRecordsQuery)->sum('pengisian');
        $avgL100 = $totalRecords > 0 ? (float) (clone $kpiRecordsQuery)->avg('l_per_1000') : 0.0;
        $overLimitCount = (clone $kpiRecordsQuery)->where('status', 'Over Limit')->count();
        $overLimitPct = $totalRecords > 0 ? round(($overLimitCount / $totalRecords) * 100, 1) : 0.0;

        // Determine min/max date and formatted range
        $dbMinDate = OilConsumption::min('date');
        $dbMaxDate = OilConsumption::max('date');
        $displayFrom = $request->dateFrom ?: ($dbMinDate ? Carbon::parse($dbMinDate)->format('Y-m-d') : null);
        $displayTo = $request->dateTo ?: ($dbMaxDate ? Carbon::parse($dbMaxDate)->format('Y-m-d') : null);

        $formattedRange = 'Seluruh Periode';
        if ($displayFrom && $displayTo) {
            $formattedRange = Carbon::parse($displayFrom)->format('d M Y').' - '.Carbon::parse($displayTo)->format('d M Y');
        } elseif ($displayFrom) {
            $formattedRange = 'Mulai '.Carbon::parse($displayFrom)->format('d M Y');
        } elseif ($displayTo) {
            $formattedRange = 's/d '.Carbon::parse($displayTo)->format('d M Y');
        }

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

                    return $c === 'EXCAVATOR BIG DIGGER' || $c === 'EXCAVATOR SMALL DIGGER';
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
                    return $c === 'EXCAVATOR BIG DIGGER' || $c === 'EXCAVATOR SMALL DIGGER';
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
            $schLiter = (float) $recs->filter(fn ($r) => ! str_contains(strtolower($r->service_type ?? ''), 'uns'))->sum('pengisian');
            $unsLiter = (float) $recs->filter(fn ($r) => str_contains(strtolower($r->service_type ?? ''), 'uns'))->sum('pengisian');

            $gradeTypeBreakdown = [];
            foreach ($recs->groupBy(fn ($r) => self::classifyUnitType($r->code_unit, $r->model, $r->unit?->type_unit)) as $uType => $uRecs) {
                $gradeTypeBreakdown[$uType] = round((float) $uRecs->sum('pengisian'), 1);
            }

            $perGradeAnalytics[] = [
                'grade' => $gradeName ?: 'Tidak Ditentukan',
                'total_liter' => round($gradeLiter, 1),
                'schedule_liter' => round($schLiter, 1),
                'unschedule_liter' => round($unsLiter, 1),
                'percentage' => $totalLiter > 0 ? round(($gradeLiter / $totalLiter) * 100, 1) : 0,
                'record_count' => $recs->count(),
                'avg_ratio' => round((float) $recs->avg('l_per_1000'), 2),
                'unit_types' => $gradeTypeBreakdown,
            ];
        }
        usort($perGradeAnalytics, fn ($a, $b) => $b['total_liter'] <=> $a['total_liter']);

        // Ordered Matrix Grades (all 13 standard grades in exact matrix sequence)
        $allGradeStats = [];
        $standardOrder = [
            'SAE 15W-40', 'SAE 60', 'SAE 50', 'SAE ISO V68', 'SAE 80W-90',
            'SAE 90 GL-5 & GL-4', 'SAE 46', 'SAE 30', 'SAE 10W', 'SAE 85W-140',
            'ATF', 'Coolant', 'Grease',
        ];
        $byName = collect($perGradeAnalytics)->keyBy('grade');
        foreach ($standardOrder as $stdG) {
            if ($byName->has($stdG)) {
                $allGradeStats[] = $byName->get($stdG);
            } else {
                $allGradeStats[] = [
                    'grade' => $stdG,
                    'total_liter' => 0.0,
                    'schedule_liter' => 0.0,
                    'unschedule_liter' => 0.0,
                    'percentage' => 0.0,
                    'record_count' => 0,
                    'avg_ratio' => 0.0,
                    'unit_types' => [],
                ];
            }
        }
        foreach ($perGradeAnalytics as $pga) {
            if (! in_array($pga['grade'], $standardOrder)) {
                $allGradeStats[] = $pga;
            }
        }

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
            'allGradeStats' => $allGradeStats,
            'units' => $units,
            'oilTypes' => array_values(array_unique(array_merge(self::STANDARD_OIL_GRADES, self::DEFAULT_OIL_TYPES, $distinctOils))),
            'components' => self::DEFAULT_COMPONENTS,
            'modelOptions' => $distinctModels,
            'departmentOptions' => $distinctDepartments,
            'filters' => [
                'search' => $request->search ?? '',
                'dateFrom' => $request->dateFrom ?? '',
                'dateTo' => $request->dateTo ?? '',
                'formattedRange' => $formattedRange,
                'minDate' => $dbMinDate ? Carbon::parse($dbMinDate)->format('Y-m-d') : '',
                'maxDate' => $dbMaxDate ? Carbon::parse($dbMaxDate)->format('Y-m-d') : '',
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
        if (isset($validated['hm_prev']) && (float) $validated['hm_prev'] > 0) {
            $hmPrev = (float) $validated['hm_prev'];
        } else {
            $lastRecord = OilConsumption::where('code_unit', $codeUnit)
                ->where('date', '<=', $validated['date'])
                ->where('hm', '<=', $hm)
                ->orderByDesc('date')
                ->orderByDesc('id')
                ->first();
            $hmPrev = $lastRecord ? (float) $lastRecord->hm : (float) ($unit?->hm ?? 0);
        }

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
        $hmPrev = isset($validated['hm_prev']) && (float) $validated['hm_prev'] > 0
            ? (float) $validated['hm_prev']
            : (float) $oilConsumption->hm_prev;
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
     * Map a given oil type and service type into the target matrix column letter.
     */
    public static function resolveMatrixColumn(?string $typeOli, ?string $serviceType): ?string
    {
        if (empty($typeOli)) {
            return null;
        }

        $upper = strtoupper(trim($typeOli));
        $isUns = ! empty($serviceType) && (
            str_contains(strtoupper($serviceType), 'UNS') ||
            str_contains(strtoupper($serviceType), 'UNSCHEDULE')
        );

        $grade = 'SAE 15W-40';
        if (str_contains($upper, '85W-140') || str_contains($upper, '85W140')) {
            $grade = 'SAE 85W-140';
        } elseif (str_contains($upper, '80W-90') || str_contains($upper, '80W90')) {
            $grade = 'SAE 80W-90';
        } elseif (str_contains($upper, '15W-40') || str_contains($upper, '15W40') || str_contains($upper, 'DELVAC') || str_contains($upper, 'RUBIA')) {
            $grade = 'SAE 15W-40';
        } elseif (str_contains($upper, '90')) {
            $grade = 'SAE 90 GL-5 & GL-4';
        } elseif (str_contains($upper, '60')) {
            $grade = 'SAE 60';
        } elseif (str_contains($upper, '50')) {
            $grade = 'SAE 50';
        } elseif (str_contains($upper, 'V68') || str_contains($upper, '68')) {
            $grade = 'SAE ISO V68';
        } elseif (str_contains($upper, '46') || str_contains($upper, 'TURALIK 48')) {
            $grade = 'SAE 46';
        } elseif (str_contains($upper, '30')) {
            $grade = 'SAE 30';
        } elseif (str_contains($upper, '10W') || str_contains($upper, '10 W')) {
            $grade = 'SAE 10W';
        } elseif (str_contains($upper, 'ATF')) {
            $grade = 'ATF';
        } elseif (str_contains($upper, 'COOLANT')) {
            $grade = 'Coolant';
        } elseif (str_contains($upper, 'GREASE')) {
            $grade = 'Grease';
        }

        $colMap = [
            'SAE 15W-40' => ['sch' => 'F', 'uns' => 'G'],
            'SAE 60' => ['sch' => 'H', 'uns' => 'I'],
            'SAE 50' => ['sch' => 'J', 'uns' => 'K'],
            'SAE ISO V68' => ['sch' => 'L', 'uns' => 'M'],
            'SAE 80W-90' => ['sch' => 'N', 'uns' => 'O'],
            'SAE 90 GL-5 & GL-4' => ['sch' => 'P', 'uns' => 'Q'],
            'SAE 46' => ['sch' => 'R', 'uns' => 'S'],
            'SAE 30' => ['sch' => 'T', 'uns' => 'U'],
            'SAE 10W' => ['sch' => 'V', 'uns' => 'W'],
            'SAE 85W-140' => ['sch' => 'X', 'uns' => 'Y'],
            'ATF' => ['sch' => 'Z', 'uns' => 'AA'],
            'Coolant' => ['sch' => 'AB', 'uns' => 'AC'],
            'Grease' => ['sch' => 'AD', 'uns' => 'AE'],
        ];

        return $isUns ? $colMap[$grade]['uns'] : $colMap[$grade]['sch'];
    }

    /**
     * Export all records to Excel using the Daily Fuel & Lube Dispensing Matrix Sheet format.
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $query = OilConsumption::query();

        if ($request->filled('start_date') || $request->filled('dateFrom')) {
            $startDate = $request->start_date ?: $request->dateFrom;
            $query->where('date', '>=', $startDate);
        }
        if ($request->filled('end_date') || $request->filled('dateTo')) {
            $endDate = $request->end_date ?: $request->dateTo;
            $query->where('date', '<=', $endDate);
        }
        if ($request->filled('unit_code')) {
            $query->where('code_unit', $request->unit_code);
        }
        if ($request->filled('search')) {
            $s = trim($request->search);
            $query->where(function ($q) use ($s) {
                $q->where('code_unit', 'like', "%{$s}%")
                    ->orWhere('remarks', 'like', "%{$s}%")
                    ->orWhere('pic', 'like', "%{$s}%");
            });
        }

        $records = $query->orderBy('date', 'asc')->orderBy('id', 'asc')->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Daily Oil Matrix');

        // Column widths
        $sheet->getColumnDimension('A')->setWidth(14);
        $sheet->getColumnDimension('B')->setWidth(9);
        $sheet->getColumnDimension('C')->setWidth(13);
        $sheet->getColumnDimension('D')->setWidth(13);
        $sheet->getColumnDimension('E')->setWidth(14);
        foreach (range('F', 'Z') as $c) {
            $sheet->getColumnDimension($c)->setWidth(8);
        }
        foreach (['AA', 'AB', 'AC', 'AD', 'AE'] as $c) {
            $sheet->getColumnDimension($c)->setWidth(8);
        }
        $sheet->getColumnDimension('AF')->setWidth(35);

        // Row 1: Merges
        $sheet->mergeCells('A1:A3')->setCellValue('A1', 'Code Unit');
        $sheet->mergeCells('B1:B3')->setCellValue('B1', 'Shift');
        $sheet->mergeCells('C1:C3')->setCellValue('C1', 'Date');
        $sheet->mergeCells('D1:D3')->setCellValue('D1', 'KM or HM');
        $sheet->mergeCells('E1:E3')->setCellValue('E1', 'Filled with');
        $sheet->mergeCells('F1:AE1')->setCellValue('F1', 'TYPE /GRADE OIL');
        $sheet->mergeCells('AF1:AF3')->setCellValue('AF1', 'REMARK');

        // Row 2: Oil Grades
        $grades = [
            ['range' => 'F2:G2', 'name' => 'SAE 15W-40'],
            ['range' => 'H2:I2', 'name' => 'SAE 60'],
            ['range' => 'J2:K2', 'name' => 'SAE 50'],
            ['range' => 'L2:M2', 'name' => 'SAE ISO V68'],
            ['range' => 'N2:O2', 'name' => 'SAE 80W-90'],
            ['range' => 'P2:Q2', 'name' => 'SAE 90 GL-5 & GL-4'],
            ['range' => 'R2:S2', 'name' => 'SAE 46'],
            ['range' => 'T2:U2', 'name' => 'SAE 30'],
            ['range' => 'V2:W2', 'name' => 'SAE 10W'],
            ['range' => 'X2:Y2', 'name' => 'SAE 85W-140'],
            ['range' => 'Z2:AA2', 'name' => 'ATF'],
            ['range' => 'AB2:AC2', 'name' => 'Coolant'],
            ['range' => 'AD2:AE2', 'name' => 'Grease'],
        ];

        foreach ($grades as $g) {
            $firstCell = explode(':', $g['range'])[0];
            $sheet->mergeCells($g['range'])->setCellValue($firstCell, $g['name']);
        }

        // Row 3: SCH / UNS
        $schCols = ['F', 'H', 'J', 'L', 'N', 'P', 'R', 'T', 'V', 'X', 'Z', 'AB', 'AD'];
        $unsCols = ['G', 'I', 'K', 'M', 'O', 'Q', 'S', 'U', 'W', 'Y', 'AA', 'AC', 'AE'];

        foreach ($schCols as $sc) {
            $sheet->setCellValue("{$sc}3", 'SCH');
        }
        foreach ($unsCols as $uc) {
            $sheet->setCellValue("{$uc}3", 'UNS');
        }

        // Row 4: Secondary Labels & Numbers
        $sheet->setCellValue('A4', 'Kode Unit');
        $sheet->setCellValue('B4', 'Shift');
        $sheet->setCellValue('C4', 'Date');
        $sheet->setCellValue('D4', 'KM or HM');
        $sheet->setCellValue('E4', 'Filled with');

        $num = 1;
        $allOilCols = ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE'];
        foreach ($allOilCols as $colLetter) {
            $sheet->setCellValue("{$colLetter}4", $num++);
        }
        $sheet->setCellValue('AF4', 'Remark');

        // Style Header Area (Sage Green, Red/Green SCH/UNS, Grey row 4)
        $topHeaderStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => '1E4620'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E2EFDA']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ];
        $sheet->getStyle('A1:AF2')->applyFromArray($topHeaderStyle);
        $sheet->getStyle('A3:E3')->applyFromArray($topHeaderStyle);
        $sheet->getStyle('AF3')->applyFromArray($topHeaderStyle);

        $schStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 9],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '548235']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $unsStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 9],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'C00000']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];

        foreach ($schCols as $sc) {
            $sheet->getStyle("{$sc}3")->applyFromArray($schStyle);
        }
        foreach ($unsCols as $uc) {
            $sheet->getStyle("{$uc}3")->applyFromArray($unsStyle);
        }

        $row4Style = [
            'font' => ['bold' => true, 'color' => ['rgb' => '333333'], 'size' => 9],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9D9D9']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet->getStyle('A4:AF4')->applyFromArray($row4Style);

        $sheet->getRowDimension(1)->setRowHeight(22);
        $sheet->getRowDimension(2)->setRowHeight(24);
        $sheet->getRowDimension(3)->setRowHeight(20);
        $sheet->getRowDimension(4)->setRowHeight(20);

        // Group records into matrix sessions
        $sessions = [];
        foreach ($records as $r) {
            // Extract shift
            $shift = 'DS';
            if (preg_match('/\[Shift:\s*([^\]]+)\]/i', (string) $r->remarks, $m)) {
                $shift = trim($m[1]);
            } elseif (preg_match('/Shift\s*([A-Za-z0-9]+)/i', (string) $r->pic, $m)) {
                $shift = trim($m[1]);
            }

            // Extract filledWith (dispenser unit)
            $filledWith = 'MLT008';
            if (preg_match('/\[Dispenser:\s*([^\]]+)\]/i', (string) $r->remarks, $m)) {
                $filledWith = trim($m[1]);
            } elseif (! empty($r->pic) && ! str_contains(strtolower($r->pic), 'admin') && ! str_contains(strtolower($r->pic), 'user')) {
                $filledWith = trim($r->pic);
            }

            // Extract remark
            $cleanRemark = preg_replace('/\[Shift:\s*[^\]]+\]/i', '', (string) $r->remarks);
            $cleanRemark = preg_replace('/\[Dispenser:\s*[^\]]+\]/i', '', $cleanRemark);
            $cleanRemark = trim($cleanRemark);
            if ($cleanRemark === 'Import Matrix Sheet' || $cleanRemark === 'Import Excel') {
                $cleanRemark = '';
            }

            $hmVal = (float) ($r->hm ?? 0);
            $formattedHm = $hmVal > 0 ? (floor($hmVal) == $hmVal ? (int) $hmVal : number_format($hmVal, 1, ',', '')) : '';
            $formattedDate = $r->date ? Carbon::parse($r->date)->format('d-M-y') : '';

            $sessionKey = "{$r->code_unit}|{$r->date}|{$formattedHm}|{$shift}|{$filledWith}";

            if (! isset($sessions[$sessionKey])) {
                $sessions[$sessionKey] = [
                    'code_unit' => $r->code_unit,
                    'shift' => $shift,
                    'date' => $formattedDate,
                    'hm' => $formattedHm,
                    'filled_with' => $filledWith,
                    'volumes' => [],
                    'remarks' => [],
                ];
            }

            $targetCol = self::resolveMatrixColumn((string) $r->type_oli, (string) $r->service_type);
            if ($targetCol) {
                $currentVol = $sessions[$sessionKey]['volumes'][$targetCol] ?? 0;
                $sessions[$sessionKey]['volumes'][$targetCol] = $currentVol + (float) $r->pengisian;
            }

            if (! empty($cleanRemark)) {
                $sessions[$sessionKey]['remarks'][] = $cleanRemark;
            }
        }

        // Fill data rows starting at row 5
        $currRow = 5;
        foreach ($sessions as $session) {
            $sheet->setCellValue("A{$currRow}", $session['code_unit']);
            $sheet->setCellValue("B{$currRow}", $session['shift']);
            $sheet->setCellValue("C{$currRow}", $session['date']);
            $sheet->setCellValue("D{$currRow}", $session['hm']);
            $sheet->setCellValue("E{$currRow}", $session['filled_with']);

            foreach ($session['volumes'] as $colLetter => $vol) {
                $displayVol = floor($vol) == $vol ? (int) $vol : round($vol, 1);
                $sheet->setCellValue("{$colLetter}{$currRow}", $displayVol);
            }

            // If remark is empty, deduce default from filled oils
            $finalRemarks = array_unique(array_filter($session['remarks']));
            if (empty($finalRemarks)) {
                $autoRemarks = [];
                if (! empty($session['volumes']['AD']) || ! empty($session['volumes']['AE'])) {
                    $autoRemarks[] = 'GREASING MANUAL';
                }
                if (! empty($session['volumes']['AB']) || ! empty($session['volumes']['AC'])) {
                    $autoRemarks[] = 'ADD COOLANT';
                }
                if (! empty($session['volumes']['F']) || ! empty($session['volumes']['G'])) {
                    $engVol = ($session['volumes']['F'] ?? 0) + ($session['volumes']['G'] ?? 0);
                    $engDisplay = floor($engVol) == $engVol ? (int) $engVol : round($engVol, 1);
                    $autoRemarks[] = "ENGINE {$engDisplay}L";
                }
                $finalRemarkText = implode(', ', $autoRemarks);
            } else {
                $finalRemarkText = implode(', ', $finalRemarks);
            }

            $sheet->setCellValue("AF{$currRow}", $finalRemarkText);
            $sheet->getRowDimension($currRow)->setRowHeight(20);

            $currRow++;
        }

        $lastRow = max(5, $currRow - 1);

        // Styling Data Rows
        if ($lastRow >= 5 && count($sessions) > 0) {
            // 1. Column A (Kode Unit): Bold text, center
            $codeUnitStyle = [
                'font' => ['bold' => true, 'color' => ['rgb' => '222222']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ];
            $sheet->getStyle("A5:A{$lastRow}")->applyFromArray($codeUnitStyle);

            // 2. Column B (Shift): Blue background, dark bold text
            $shiftStyle = [
                'font' => ['bold' => true, 'color' => ['rgb' => '002060']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'BDD7EE']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ];
            $sheet->getStyle("B5:B{$lastRow}")->applyFromArray($shiftStyle);

            // 3. Columns C & E (Date, Filled with): Center aligned
            $centerStyle = [
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ];
            $sheet->getStyle("C5:C{$lastRow}")->applyFromArray($centerStyle);
            $sheet->getStyle("E5:E{$lastRow}")->applyFromArray($centerStyle);

            // 4. Column D (KM or HM): Right aligned
            $rightStyle = [
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER],
            ];
            $sheet->getStyle("D5:D{$lastRow}")->applyFromArray($rightStyle);

            // 5. Volume Columns (F to AE): Center aligned
            $sheet->getStyle("F5:AE{$lastRow}")->applyFromArray($centerStyle);

            // 6. UNS Columns (G, I, K, M, O, Q, S, U, W, Y, AA, AC, AE): Peach background tint (#FCE4D6)
            $unsDataStyle = [
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FCE4D6']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ];
            foreach ($unsCols as $uc) {
                $sheet->getStyle("{$uc}5:{$uc}{$lastRow}")->applyFromArray($unsDataStyle);
            }

            // 7. Column AF (Remark): Left aligned
            $leftStyle = [
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
            ];
            $sheet->getStyle("AF5:AF{$lastRow}")->applyFromArray($leftStyle);
        }

        // Apply All Borders from A1 to AF{$lastRow}
        $borderStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'BFBFBF'],
                ],
            ],
        ];
        $sheet->getStyle("A1:AF{$lastRow}")->applyFromArray($borderStyle);

        // Enable AutoFilter on row 4
        $sheet->setAutoFilter("A4:AF{$lastRow}");

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Daily_Oil_Matrix_Report_'.date('Ymd_His').'.xlsx');
    }

    /**
     * Deduce default equipment component from oil grade.
     */
    public static function deduceComponentFromOil(string $oilGrade): string
    {
        $upper = strtoupper(trim($oilGrade));
        if (str_contains($upper, '15W-40') || str_contains($upper, '15W40') || str_contains($upper, '50') || str_contains($upper, '60')) {
            return 'Engine';
        }
        if (str_contains($upper, '46') || str_contains($upper, 'V68') || str_contains($upper, '68')) {
            return 'Hydraulic';
        }
        if (str_contains($upper, 'COOLANT')) {
            return 'Radiator';
        }
        if (str_contains($upper, 'GREASE')) {
            return 'Chassis';
        }
        if (str_contains($upper, '80W-90') || str_contains($upper, '85W-140') || str_contains($upper, '90')) {
            return 'Differential';
        }
        if (str_contains($upper, 'ATF') || str_contains($upper, '10W') || str_contains($upper, '30')) {
            return 'Transmission';
        }

        return 'Engine';
    }

    /**
     * Helper to create and calculate a single oil consumption record.
     */
    private static function createConsumptionRecord(
        ?Unit $unit,
        string $codeUnit,
        string $model,
        string $department,
        string $date,
        float $hmPrev,
        float $hm,
        float $hmDiff,
        string $typeOli,
        string $serviceType,
        float $pengisian,
        string $remarks,
        string $pic
    ): OilConsumption {
        $component = self::deduceComponentFromOil($typeOli);
        $lPer100 = $hmDiff > 0 ? round(($pengisian / $hmDiff) * 100, 2) : 0.0;

        $isHauler = str_contains(strtoupper($unit?->type_unit ?? ''), 'HAULER')
            || str_contains(strtoupper($model), 'HAULER')
            || str_starts_with(strtoupper($codeUnit), 'OHT');

        $batasNormal = $isHauler ? 0.60 : 0.50;

        if ($lPer100 > $batasNormal) {
            $status = 'Over Limit';
        } elseif ($lPer100 > ($batasNormal * 0.8)) {
            $status = 'Perlu Monitoring';
        } else {
            $status = 'Normal';
        }

        return OilConsumption::create([
            'unit_id' => $unit?->id,
            'code_unit' => $codeUnit,
            'model' => $model,
            'department' => $department,
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
            'remarks' => $remarks ?: 'Import Matrix Sheet',
            'pic' => $pic,
            'created_by' => auth()->user()?->name ?? 'Import Excel',
        ]);
    }

    /**
     * Download Excel template for import (Daily Fuel & Lube Dispensing Matrix Sheet).
     */
    public function downloadTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Daily Oil Matrix');

        // Column widths
        $sheet->getColumnDimension('A')->setWidth(14);
        $sheet->getColumnDimension('B')->setWidth(9);
        $sheet->getColumnDimension('C')->setWidth(13);
        $sheet->getColumnDimension('D')->setWidth(13);
        $sheet->getColumnDimension('E')->setWidth(14);
        foreach (range('F', 'Z') as $c) {
            $sheet->getColumnDimension($c)->setWidth(8);
        }
        foreach (['AA', 'AB', 'AC', 'AD', 'AE'] as $c) {
            $sheet->getColumnDimension($c)->setWidth(8);
        }
        $sheet->getColumnDimension('AF')->setWidth(35);

        // Row 1: Merges
        $sheet->mergeCells('A1:A3')->setCellValue('A1', 'Code Unit');
        $sheet->mergeCells('B1:B3')->setCellValue('B1', 'Shift');
        $sheet->mergeCells('C1:C3')->setCellValue('C1', 'Date');
        $sheet->mergeCells('D1:D3')->setCellValue('D1', 'KM or HM');
        $sheet->mergeCells('E1:E3')->setCellValue('E1', 'Filled with');
        $sheet->mergeCells('F1:AE1')->setCellValue('F1', 'TYPE /GRADE OIL');
        $sheet->mergeCells('AF1:AF3')->setCellValue('AF1', 'REMARK');

        // Row 2: Oil Grades
        $grades = [
            ['range' => 'F2:G2', 'name' => 'SAE 15W-40'],
            ['range' => 'H2:I2', 'name' => 'SAE 60'],
            ['range' => 'J2:K2', 'name' => 'SAE 50'],
            ['range' => 'L2:M2', 'name' => 'SAE ISO V68'],
            ['range' => 'N2:O2', 'name' => 'SAE 80W-90'],
            ['range' => 'P2:Q2', 'name' => 'SAE 90 GL-5 & GL-4'],
            ['range' => 'R2:S2', 'name' => 'SAE 46'],
            ['range' => 'T2:U2', 'name' => 'SAE 30'],
            ['range' => 'V2:W2', 'name' => 'SAE 10W'],
            ['range' => 'X2:Y2', 'name' => 'SAE 85W-140'],
            ['range' => 'Z2:AA2', 'name' => 'ATF'],
            ['range' => 'AB2:AC2', 'name' => 'Coolant'],
            ['range' => 'AD2:AE2', 'name' => 'Grease'],
        ];

        foreach ($grades as $g) {
            $firstCell = explode(':', $g['range'])[0];
            $sheet->mergeCells($g['range'])->setCellValue($firstCell, $g['name']);
        }

        // Row 3: SCH / UNS
        $schCols = ['F', 'H', 'J', 'L', 'N', 'P', 'R', 'T', 'V', 'X', 'Z', 'AB', 'AD'];
        $unsCols = ['G', 'I', 'K', 'M', 'O', 'Q', 'S', 'U', 'W', 'Y', 'AA', 'AC', 'AE'];

        foreach ($schCols as $sc) {
            $sheet->setCellValue("{$sc}3", 'SCH');
        }
        foreach ($unsCols as $uc) {
            $sheet->setCellValue("{$uc}3", 'UNS');
        }

        // Row 4: Secondary Labels & Numbers
        $sheet->setCellValue('A4', 'Kode Unit');
        $sheet->setCellValue('B4', 'Shift');
        $sheet->setCellValue('C4', 'Date');
        $sheet->setCellValue('D4', 'KM or HM');
        $sheet->setCellValue('E4', 'Filled with');

        $num = 1;
        $allOilCols = ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE'];
        foreach ($allOilCols as $colLetter) {
            $sheet->setCellValue("{$colLetter}4", $num++);
        }
        $sheet->setCellValue('AF4', 'Remark');

        // Sample Data Rows (Matching Screenshot)
        $sampleRows = [
            ['ME055', 'DS', '01-Feb-26', 15922, 'MLT008', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 4, '', 5, '', 'GREASING MANUAL, ADD COOLANT'],
            ['ME067', 'DS', '01-Feb-26', 4347,  'MLT008', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 5, '', 'GREASING MANUAL'],
            ['ME068', 'DS', '01-Feb-26', 4625,  'MLT008', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 5, '', 'GREASING MANUAL'],
            ['ME057', 'DS', '01-Feb-26', 12229, 'MLT008', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 5, '', 'GREASING MANUAL'],
            ['ME049', 'DS', '01-Feb-26', 15924, 'MLT008', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 5, '', 'GREASING MANUAL'],
        ];

        $rIndex = 5;
        foreach ($sampleRows as $sRow) {
            $sheet->fromArray($sRow, null, "A{$rIndex}");
            $rIndex++;
        }

        // Apply Styles
        // 1. Sage Green Top Header Area
        $topHeaderStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => '1E4620'], 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E2EFDA']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ];
        $sheet->getStyle('A1:AF2')->applyFromArray($topHeaderStyle);
        $sheet->getStyle('A3:E3')->applyFromArray($topHeaderStyle);
        $sheet->getStyle('AF3')->applyFromArray($topHeaderStyle);

        // 2. Row 3: SCH (Green) & UNS (Red)
        $schStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 9],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '548235']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $unsStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 9],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'C00000']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];

        foreach ($schCols as $sc) {
            $sheet->getStyle("{$sc}3")->applyFromArray($schStyle);
        }
        foreach ($unsCols as $uc) {
            $sheet->getStyle("{$uc}3")->applyFromArray($unsStyle);
        }

        // 3. Row 4: Grey Header Numbers
        $row4Style = [
            'font' => ['bold' => true, 'color' => ['rgb' => '333333'], 'size' => 9],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9D9D9']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet->getStyle('A4:AF4')->applyFromArray($row4Style);

        // 4. Sample Shift cells: Blue highlight
        $shiftStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => '002060']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'BDD7EE']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet->getStyle('B5:B9')->applyFromArray($shiftStyle);

        // 5. Heights & Borders
        $sheet->getRowDimension(1)->setRowHeight(22);
        $sheet->getRowDimension(2)->setRowHeight(24);
        $sheet->getRowDimension(3)->setRowHeight(20);
        $sheet->getRowDimension(4)->setRowHeight(20);

        $borderStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'BFBFBF'],
                ],
            ],
        ];
        $sheet->getStyle('A1:AF9')->applyFromArray($borderStyle);

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'Template_Daily_Oil_Matrix_Report.xlsx');
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
            $rows = $sheet->toArray(null, true, true, false);

            if (count($rows) <= 1) {
                return redirect()->back()->with('error', 'File Excel kosong atau format tidak sesuai.');
            }

            // Matrix column definitions (Col F is index 5 to Col AE is index 30)
            $matrixOils = [
                ['grade' => 'SAE 15W-40', 'sch' => 5, 'uns' => 6],
                ['grade' => 'SAE 60', 'sch' => 7, 'uns' => 8],
                ['grade' => 'SAE 50', 'sch' => 9, 'uns' => 10],
                ['grade' => 'SAE ISO V68', 'sch' => 11, 'uns' => 12],
                ['grade' => 'SAE 80W-90', 'sch' => 13, 'uns' => 14],
                ['grade' => 'SAE 90 GL-5 & GL-4', 'sch' => 15, 'uns' => 16],
                ['grade' => 'SAE 46', 'sch' => 17, 'uns' => 18],
                ['grade' => 'SAE 30', 'sch' => 19, 'uns' => 20],
                ['grade' => 'SAE 10W', 'sch' => 21, 'uns' => 22],
                ['grade' => 'SAE 85W-140', 'sch' => 23, 'uns' => 24],
                ['grade' => 'ATF', 'sch' => 25, 'uns' => 26],
                ['grade' => 'Coolant', 'sch' => 27, 'uns' => 28],
                ['grade' => 'Grease', 'sch' => 29, 'uns' => 30],
            ];

            $imported = 0;
            $unitCount = 0;

            for ($i = 0; $i < count($rows); $i++) {
                $row = $rows[$i];
                $rawCode = trim(strval($row[0] ?? ''));

                if (empty($rawCode)) {
                    continue;
                }

                $lowerCode = strtolower($rawCode);
                // Skip header rows
                if (
                    in_array($lowerCode, ['code unit', 'kode unit', 'no', 'unit', 'type /grade oil', 'type/grade oil']) ||
                    str_starts_with($lowerCode, 'type') ||
                    (is_numeric($rawCode) && count($row) > 10)
                ) {
                    continue;
                }

                // Check if this is legacy simple format (<= 12 columns)
                if (count($row) <= 12 && isset($row[7])) {
                    $unit = Unit::where('code_unit', $rawCode)->first();
                    $dateRaw = $row[1] ?? date('Y-m-d');
                    $date = date('Y-m-d', strtotime($dateRaw));
                    $hmPrev = (float) ($row[2] ?? ($unit?->hm ?? 0));
                    $hm = (float) ($row[3] ?? ($hmPrev + 100));
                    $hmDiff = max(0, $hm - $hmPrev);
                    $typeOli = ! empty($row[5]) ? trim($row[5]) : 'SAE 15W-40';
                    $serviceType = ! empty($row[6]) && in_array(ucfirst(strtolower(trim($row[6]))), ['Schedule', 'Unschedule'])
                        ? ucfirst(strtolower(trim($row[6])))
                        : 'Schedule';
                    $pengisian = (float) ($row[7] ?? 10.0);
                    $remarks = ! empty($row[8]) ? trim($row[8]) : 'Import Excel';
                    $pic = ! empty($row[9]) ? trim($row[9]) : (auth()->user()?->name ?? 'Admin Plant');

                    self::createConsumptionRecord(
                        $unit, $rawCode, $unit?->model ?? 'Heavy Equipment', $unit?->location ?? 'Mining',
                        $date, $hmPrev, $hm, $hmDiff, $typeOli, $serviceType, $pengisian, $remarks, $pic
                    );
                    $imported++;

                    continue;
                }

                // Matrix format
                $codeUnit = strtoupper($rawCode);
                $shift = trim(strval($row[1] ?? ''));
                $dateRaw = $row[2] ?? null;
                $hmRaw = $row[3] ?? null;
                $filledWith = trim(strval($row[4] ?? ''));
                $remark = trim(strval($row[31] ?? ($row[count($row) - 1] ?? '')));

                // Parse Date
                $date = date('Y-m-d');
                if (! empty($dateRaw)) {
                    if (is_numeric($dateRaw) && (float) $dateRaw > 30000 && (float) $dateRaw < 60000) {
                        try {
                            $date = Date::excelToDateTimeObject((int) $dateRaw)->format('Y-m-d');
                        } catch (\Throwable $e) {
                            $date = date('Y-m-d');
                        }
                    } else {
                        try {
                            $date = Carbon::parse(trim(strval($dateRaw)))->format('Y-m-d');
                        } catch (\Throwable $e) {
                            $date = date('Y-m-d');
                        }
                    }
                }

                // Parse HM
                $hmClean = preg_replace('/[^0-9.]/', '', strval($hmRaw));
                $hm = is_numeric($hmClean) ? (float) $hmClean : 0.0;

                $unit = Unit::where('code_unit', $codeUnit)->first();
                $model = $unit?->model ?? 'Heavy Equipment';
                $department = $unit?->location ?? 'Mining';

                // Find baseline HM
                $lastRecord = OilConsumption::where('code_unit', $codeUnit)
                    ->where('date', '<=', $date)
                    ->where('hm', '<=', $hm)
                    ->orderByDesc('date')
                    ->orderByDesc('id')
                    ->first();
                $hmPrev = $lastRecord ? (float) $lastRecord->hm : (float) ($unit?->hm ?? 0);
                $hmDiff = max(0, $hm - $hmPrev);

                $combinedRemarks = trim(
                    ($shift ? "[Shift: {$shift}] " : '').
                    ($filledWith ? "[Dispenser: {$filledWith}] " : '').
                    ($remark ?: '')
                );
                $pic = $filledWith ?: ($shift ? "Shift {$shift}" : (auth()->user()?->name ?? 'Admin Plant'));

                $rowEntriesCreated = 0;

                foreach ($matrixOils as $oil) {
                    // Check SCH
                    if (isset($row[$oil['sch']])) {
                        $schVal = floatval(str_replace(',', '.', trim(strval($row[$oil['sch']]))));
                        if ($schVal > 0) {
                            self::createConsumptionRecord(
                                $unit, $codeUnit, $model, $department, $date,
                                $hmPrev, $hm, $hmDiff,
                                $oil['grade'], 'Schedule', $schVal,
                                $combinedRemarks, $pic
                            );
                            $rowEntriesCreated++;
                        }
                    }

                    // Check UNS
                    if (isset($row[$oil['uns']])) {
                        $unsVal = floatval(str_replace(',', '.', trim(strval($row[$oil['uns']]))));
                        if ($unsVal > 0) {
                            self::createConsumptionRecord(
                                $unit, $codeUnit, $model, $department, $date,
                                $hmPrev, $hm, $hmDiff,
                                $oil['grade'], 'Unschedule', $unsVal,
                                $combinedRemarks, $pic
                            );
                            $rowEntriesCreated++;
                        }
                    }
                }

                if ($rowEntriesCreated > 0) {
                    $imported += $rowEntriesCreated;
                    $unitCount++;
                }
            }

            return redirect()->back()->with('success', "Berhasil mengimpor {$imported} catatan pengisian pelumas dari {$unitCount} unit.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Gagal memproses file Excel: '.$e->getMessage());
        }
    }
}
