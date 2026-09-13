<?php

use App\Http\Controllers\AbrController;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\BacklogController;
use App\Http\Controllers\BreakdownController;
use App\Http\Controllers\ClaimWarrantyController;
use App\Http\Controllers\ConditionComponentReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DatabaseSchemaController;
use App\Http\Controllers\FailureAnalysisController;
use App\Http\Controllers\ForecastPaController;
use App\Http\Controllers\HistoricalServiceController;
use App\Http\Controllers\HistoricalTyreController;
use App\Http\Controllers\HourMeterController;
use App\Http\Controllers\JadwalCutiController;
use App\Http\Controllers\JobOutsideRepairController;
use App\Http\Controllers\KpiController;
use App\Http\Controllers\ListPopulasiController;
use App\Http\Controllers\MagneticPlugController;
use App\Http\Controllers\MaintenanceOrderController;
use App\Http\Controllers\ManpowerBudgetController;
use App\Http\Controllers\ManpowerController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\MasterPmController;
use App\Http\Controllers\MonitoringOrderanController;
use App\Http\Controllers\OilConsumptionController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\P2hController;
use App\Http\Controllers\PartCanibalController;
use App\Http\Controllers\PcrController;
use App\Http\Controllers\PengajuanCutiController;
use App\Http\Controllers\PerhitunganManpowerController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PlanInspectionController;
use App\Http\Controllers\PlanServiceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RosterController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SlipGajiController;
use App\Http\Controllers\SosPapController;
use App\Http\Controllers\ToolroomController;
use App\Http\Controllers\TyreController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WorkOrderController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Master Data Hub
    Route::get('/master-data', [MasterDataController::class, 'index'])->name('master-data.index');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Populasi Unit (Plant Operations)
    Route::delete('/units-delete-all', [UnitController::class, 'deleteAll'])->name('units.delete.all');
    Route::get('/units/export/pdf', [UnitController::class, 'exportPdf'])->name('units.export.pdf');
    Route::get('/units/download/template', [UnitController::class, 'downloadTemplate'])->name('units.download.template');
    Route::post('/units/import', [UnitController::class, 'import'])->name('units.import');
    Route::resource('units', UnitController::class);

    Route::get('/list-populasi', [ListPopulasiController::class, 'index'])->name('list-populasi.index');
    Route::get('/kpi', [KpiController::class, 'index'])->name('kpi.index');

    // Hour Meter Daily Logs (Plant Operations)
    Route::get('/api/get-hm', [HourMeterController::class, 'getHm'])->name('hour-meters.get-hm');
    Route::delete('/hour-meters-delete-all', [HourMeterController::class, 'deleteAll'])->name('hour-meters.delete.all');
    Route::get('/hour-meters/export/pdf', [HourMeterController::class, 'exportPdf'])->name('hour-meters.export.pdf');
    Route::get('/hour-meters/download/template', [HourMeterController::class, 'downloadTemplate'])->name('hour-meters.download.template');
    Route::post('/hour-meters/import', [HourMeterController::class, 'import'])->name('hour-meters.import');
    Route::resource('hour-meters', HourMeterController::class);

    Route::resource('plan-service', PlanServiceController::class);
    Route::resource('abr', AbrController::class);

    // Org & Manpower Routes
    Route::get('/organization', [OrganizationController::class, 'index'])->name('organization.index');
    Route::get('/manpower-budget', [ManpowerBudgetController::class, 'index'])->name('manpower.index');

    // ─── ADMIN-ONLY ROUTES ──────────────────────────────────────────────────
    Route::middleware('role:super-admin|admin')->group(function () {
        // User & Access Management
        Route::resource('users', UserController::class);
        Route::resource('roles', RoleController::class);
        Route::resource('permissions', PermissionController::class);

        // Audit & Activity Logs
        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');

        // Database 3D Relasi — exposes full DB structure, admin only
        Route::get('/database-schema', [DatabaseSchemaController::class, 'index'])->name('database-schema.index');
        Route::get('/api/database-schema', [DatabaseSchemaController::class, 'getSchema'])->name('api.database-schema');

        // Dynamic Settings
        Route::get('/settings/mail', [SettingController::class, 'index'])->name('settings.mail');
        Route::post('/settings/mail', [SettingController::class, 'update'])->name('settings.mail.update');
        Route::post('/settings/test-mail', [SettingController::class, 'sendTestMail'])->name('settings.mail.test');

        // Reports (DomPDF)
        Route::get('/reports/users/pdf', [ReportController::class, 'usersPdf'])->name('reports.users.pdf');
    });

    // Service Order Plant & Monitoring
    Route::get('/service-orders', [ServiceOrderController::class, 'index'])->name('service-orders.index');
    Route::post('/service-orders/bulk', [ServiceOrderController::class, 'storeBulk'])->name('service-orders.storeBulk');
    Route::put('/service-orders/{service_order}', [ServiceOrderController::class, 'update'])->name('service-orders.update');
    Route::delete('/service-orders/{service_order}', [ServiceOrderController::class, 'destroy'])->name('service-orders.destroy');
    // Work Orders Route
    Route::get('/work-orders/export', [WorkOrderController::class, 'exportExcel'])->name('work-orders.export');
    Route::post('/work-orders/import', [WorkOrderController::class, 'importExcel'])->name('work-orders.import');
    Route::get('/work-orders', [WorkOrderController::class, 'index'])->name('work-orders.index');
    Route::post('/work-orders', [WorkOrderController::class, 'store'])->name('work-orders.store');
    Route::get('/work-orders/create', [WorkOrderController::class, 'create'])->name('work-orders.create');
    Route::get('/work-orders/{id}', [WorkOrderController::class, 'show'])->name('work-orders.show');

    Route::get('/monitoring-orders/check-history', [MaintenanceOrderController::class, 'checkHistory'])->name('monitoring-orders.check-history');
    Route::get('/monitoring-orders/find-by-no', [MaintenanceOrderController::class, 'findByNo'])->name('monitoring-orders.find-by-no');
    Route::get('/monitoring-orders', [MaintenanceOrderController::class, 'index'])->name('monitoring-orders.index');
    Route::post('/monitoring-orders', [MaintenanceOrderController::class, 'store'])->name('monitoring-orders.store');
    Route::post('/monitoring-orders/{monitoring_order}', [MaintenanceOrderController::class, 'update'])->name('monitoring-orders.update');
    Route::delete('/monitoring-orders/{monitoring_order}', [MaintenanceOrderController::class, 'destroy'])->name('monitoring-orders.destroy');
    Route::post('/monitoring-orders/import', [MaintenanceOrderController::class, 'import'])->name('monitoring-orders.import');
    Route::get('/monitoring-orders/download-template', [MaintenanceOrderController::class, 'downloadTemplate'])->name('monitoring-orders.download-template');

    // Monitoring Orderan (Standard Table View)
    Route::get('/monitoring-orderan', [MonitoringOrderanController::class, 'index'])->name('monitoring-orderan.index');
    Route::get('/monitoring-orderan/create', [MonitoringOrderanController::class, 'create'])->name('monitoring-orderan.create');
    Route::get('/monitoring-orderan/{id}/edit', [MonitoringOrderanController::class, 'edit'])->name('monitoring-orderan.edit');
    Route::get('/monitoring-orderan/part-lifetime', [MonitoringOrderanController::class, 'getPartLifetime'])->name('monitoring-orderan.part-lifetime');
    Route::post('/monitoring-orderan', [MonitoringOrderanController::class, 'store'])->name('monitoring-orderan.store');
    Route::put('/monitoring-orderan/{monitoring_orderan}', [MonitoringOrderanController::class, 'update'])->name('monitoring-orderan.update');
    Route::post('/monitoring-orderan/import', [MonitoringOrderanController::class, 'import'])->name('monitoring-orderan.import');
    Route::get('/monitoring-orderan/download-template', [MonitoringOrderanController::class, 'downloadTemplate'])->name('monitoring-orderan.download-template');
    Route::delete('/monitoring-orderan/clear', [MonitoringOrderanController::class, 'destroyAll'])->name('monitoring-orderan.destroy-all');
    Route::delete('/monitoring-orderan/{monitoring_orderan}', [MonitoringOrderanController::class, 'destroy'])->name('monitoring-orderan.destroy');

    Route::put('/part-canibals/{part_canibal}/status', [PartCanibalController::class, 'updateStatus'])->name('part-canibals.updateStatus');
    Route::resource('part-canibals', PartCanibalController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('/monitoring/p2h', [P2hController::class, 'index'])->name('p2h.index');

    // Plan Service & Master PM
    Route::get('/plan-service', [PlanServiceController::class, 'index'])->name('plan-service.index');
    Route::post('/plan-service/{unit}/complete', [PlanServiceController::class, 'complete'])->name('plan-service.complete');

    // Backlog
    Route::resource('backlogs', BacklogController::class);

    // Failure Analysis (FAR)
    Route::get('/failure-analysis/{failure_analysis}/export-pdf', [FailureAnalysisController::class, 'exportPdf'])->name('failure-analysis.export-pdf');
    Route::resource('failure-analysis', FailureAnalysisController::class);

    // Historical Periodical Service
    Route::get('/historical-services', [HistoricalServiceController::class, 'index'])->name('historical-services.index');

    // Forecast PA Unit
    Route::get('/forecast-pa', [ForecastPaController::class, 'index'])->name('forecast-pa.index');

    // PCR U/C & Component
    Route::get('/pcr', [PcrController::class, 'index'])->name('pcr.index');

    // Report SOS-PAP Result
    Route::get('/sos-pap', [SosPapController::class, 'index'])->name('sos-pap.index');

    // Historical Tyre
    Route::get('/historical-tyre', [HistoricalTyreController::class, 'index'])->name('historical-tyre.index');

    // Claim Warranty Report
    Route::get('/claim-warranty', [ClaimWarrantyController::class, 'index'])->name('claim-warranty.index');

    // Roster Manpower
    Route::get('/roster', [RosterController::class, 'index'])->name('roster.index');

    // Absensi Harian Karyawan
    Route::get('/absensi', [AbsensiController::class, 'index'])->name('absensi.index');

    // Slip Gaji
    Route::get('/absensi/slip-gaji', [SlipGajiController::class, 'index'])->name('slip-gaji.index');

    // Manpower
    Route::get('/manpower', [ManpowerController::class, 'index'])->name('manpower.index');
    Route::get('/manpower/perhitungan', [PerhitunganManpowerController::class, 'index'])->name('manpower.perhitungan');

    // Cuti & Transportasi
    Route::get('/cuti/pengajuan', [PengajuanCutiController::class, 'create'])->name('cuti.pengajuan');
    Route::get('/cuti/jadwal', [JadwalCutiController::class, 'index'])->name('cuti.jadwal');

    // Breakdown
    Route::get('/breakdown/daily/export', [BreakdownController::class, 'exportExcel'])->name('breakdown.export');
    Route::get('/breakdown/daily', [BreakdownController::class, 'daily'])->name('breakdown.daily');
    Route::post('/breakdown/daily/rename-category', [BreakdownController::class, 'renameCategory'])->name('breakdown.rename-category');
    Route::post('/breakdown/daily', [BreakdownController::class, 'store'])->name('breakdown.store');
    Route::put('/breakdown/daily/{breakdown}', [BreakdownController::class, 'update'])->name('breakdown.update');
    Route::delete('/breakdown/daily/{breakdown}', [BreakdownController::class, 'destroy'])->name('breakdown.destroy');

    // Repair & Maintenance
    Route::get('/repair/job-outside', [JobOutsideRepairController::class, 'index'])->name('repair.job-outside');
    Route::get('/repair/magnetic-plug', [MagneticPlugController::class, 'index'])->name('repair.magnetic-plug');
    Route::get('/repair/magnetic-plug/create', [MagneticPlugController::class, 'create'])->name('repair.magnetic-plug.create');

    // Tyre Management
    Route::resource('tyres', TyreController::class)->except(['show']);
    Route::post('tyres/{tyre}/rotate', [TyreController::class, 'rotate'])->name('tyres.rotate');
    Route::post('tyres/{tyre}/repair', [TyreController::class, 'repair'])->name('tyres.repair');
    Route::post('tyres/{tyre}/scrap', [TyreController::class, 'scrap'])->name('tyres.scrap');
    Route::get('tyres/{tyre}/history', [TyreController::class, 'history'])->name('tyres.history');
    Route::post('/repair/magnetic-plug', [MagneticPlugController::class, 'store'])->name('repair.magnetic-plug.store');
    Route::get('/repair/oil-consumption', [OilConsumptionController::class, 'index'])->name('repair.oil-consumption');

    // Master Control PM Service
    Route::get('/pcr-uc', [PcrController::class, 'index'])->name('pcr-uc.index');
    Route::get('/pcr-component', [PcrController::class, 'indexComponent'])->name('pcr-component.index');
    Route::get('/pcr-uc/template', [PcrController::class, 'downloadTemplate'])->name('pcr-uc.template');
    Route::get('/pcr-uc/export', [PcrController::class, 'export'])->name('pcr-uc.export');
    Route::post('/pcr-uc/bulk-store', [PcrController::class, 'bulkStore'])->name('pcr-uc.bulk-store');
    Route::post('/pcr-uc', [PcrController::class, 'store'])->name('pcr-uc.store');
    Route::post('/pcr-uc/import', [PcrController::class, 'import'])->name('pcr-uc.import');
    Route::delete('/pcr-uc/destroy-all', [PcrController::class, 'destroyAll'])->name('pcr-uc.destroy-all');
    Route::put('/pcr-uc/{pcr_uc}', [PcrController::class, 'update'])->name('pcr-uc.update');
    Route::delete('/pcr-uc/{pcr_uc}', [PcrController::class, 'destroy'])->name('pcr-uc.destroy');
    Route::get('/master-pm/condition-report', [ConditionComponentReportController::class, 'index'])->name('pcr.condition-report');

    Route::get('/master-pm', [MasterPmController::class, 'index'])->name('master-pm.index');
    Route::post('/master-pm/{master_pm}/toggle', [MasterPmController::class, 'toggle'])->name('master-pm.toggle');

    // Plan Inspection
    Route::get('/plan-inspections', [PlanInspectionController::class, 'index'])->name('plan-inspections.index');
    Route::post('/plan-inspections/toggle', [PlanInspectionController::class, 'toggle'])->name('plan-inspections.toggle');
    Route::get('/plan-inspections/dashboard', [PlanInspectionController::class, 'dashboard'])->name('plan-inspections.dashboard');
    Route::post('/plan-inspections/update-target', [PlanInspectionController::class, 'updateTarget'])->name('plan-inspections.update-target');

    // ABR
    Route::resource('abr', AbrController::class);

    // TireVault 3D API — real data for the 3D viewer
    Route::get('/api/tirevault/units', [TyreController::class, 'apiWheelUnits'])->name('api.tirevault.units');
    Route::get('/api/tirevault/unit/{unit}', [TyreController::class, 'apiUnitTyres'])->name('api.tirevault.unit');
    Route::post('/api/tirevault/install', [TyreController::class, 'apiInstall'])->name('api.tirevault.install');

    // Toolroom
    Route::get('/toolroom', [ToolroomController::class, 'index'])->name('toolroom.index');
    Route::post('/toolroom/tools', [ToolroomController::class, 'storeTool'])->name('toolroom.tools.store');
    Route::put('/toolroom/tools/{tool}', [ToolroomController::class, 'updateTool'])->name('toolroom.tools.update');
    Route::post('/toolroom/tools/{tool}/scrap', [ToolroomController::class, 'scrapTool'])->name('toolroom.tools.scrap');
    Route::post('/toolroom/borrow', [ToolroomController::class, 'storeBorrow'])->name('toolroom.borrow.store');
    Route::post('/toolroom/borrow/{transaction}/return', [ToolroomController::class, 'returnTool'])->name('toolroom.borrow.return');
    Route::post('/toolroom/inspections', [ToolroomController::class, 'storeInspection'])->name('toolroom.inspections.store');
    Route::post('/toolroom/orders', [ToolroomController::class, 'storeOrder'])->name('toolroom.orders.store');
    Route::put('/toolroom/orders/{order}/status', [ToolroomController::class, 'updateOrderStatus'])->name('toolroom.orders.status');
    Route::post('/toolroom/gate-passes', [ToolroomController::class, 'storeGatePass'])->name('toolroom.gate-passes.store');
});

require __DIR__.'/auth.php';
