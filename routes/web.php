<?php

use App\Http\Controllers\AbrController;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\BatteryMonitoringController;
use App\Http\Controllers\BreakdownController;
use App\Http\Controllers\BucketInspectionController;
use App\Http\Controllers\CheckSheetDozerController;
use App\Http\Controllers\CheckSheetMotorgraderController;
use App\Http\Controllers\CheckSheetServiceController;
use App\Http\Controllers\ClaimWarrantyController;
use App\Http\Controllers\ConditionComponentReportController;
use App\Http\Controllers\DatabaseSchemaController;
use App\Http\Controllers\DumpTruckServiceController;
use App\Http\Controllers\FailureAnalysisController;
use App\Http\Controllers\FormJsaController;
use App\Http\Controllers\GensetServiceController;
use App\Http\Controllers\HistoricalImportController;
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
use App\Http\Controllers\MonitoringOrderanController;
use App\Http\Controllers\NavigationMenuController;
use App\Http\Controllers\OilConsumptionController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\P2hController;
use App\Http\Controllers\PartCanibalController;
use App\Http\Controllers\PartOrderLifetimeController;
use App\Http\Controllers\PcrController;
use App\Http\Controllers\PdfForecastController;
use App\Http\Controllers\PengajuanCutiController;
use App\Http\Controllers\PenundaanServiceController;
use App\Http\Controllers\PerformanceUnitController;
use App\Http\Controllers\PerhitunganManpowerController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PlanInspectionController;
use App\Http\Controllers\PlanServiceController;
use App\Http\Controllers\PlantFormController;
use App\Http\Controllers\PmMonitoringController;
use App\Http\Controllers\PreReleaseTrackUnitController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RequestAssetDisposedController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\RosterController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SlipGajiController;
use App\Http\Controllers\SosPapController;
use App\Http\Controllers\SuratPermintaanKomponenController;
use App\Http\Controllers\ToolroomController;
use App\Http\Controllers\TyreController;
use App\Http\Controllers\UnitAplController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UnitGatePassController;
use App\Http\Controllers\UnitGetController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VideoPanduanController;
use App\Http\Controllers\WashingFormController;
use App\Http\Controllers\WorkOrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
});

Route::get('/portal', function () {
    return redirect()->route('dashboard');
})->middleware(['auth'])->name('portal.index');

Route::get('/dashboard', function () {
    return redirect()->route('work-orders.index');
})->middleware(['auth'])->name('dashboard');

Route::post('/api/concurrent-test', function (Request $request) {
    // TEMPORARY TEST RUNNER
    $userId = $request->input('user_id');
    $module = $request->input('module');
    $action = $request->input('action');
    $payload = $request->input('payload', []);

    auth()->loginUsingId($userId);

    // Convert to a real request and forward internally if possible
    // Alternatively, just construct a new Request and dispatch it to the router
    $subRequest = Request::create(
        $payload['_uri'] ?? '/',
        $payload['_method'] ?? 'POST',
        $payload
    );
    $subRequest->headers->set('Accept', 'application/json'); // force json validation responses

    return app()->handle($subRequest);
})->name('concurrent.test.runner');

Route::middleware('auth')->group(function () {
    // Auto-Save & Session Keep-Alive Endpoint (Mencegah data hilang saat diam/idle)
    Route::post('/api/session-keepalive', function (Request $request) {
        $request->session()->put('last_autosave_ping', now()->toDateTimeString());

        return response()->json([
            'status' => 'active',
            'timestamp' => now()->format('H:i:s'),
            'csrf_token' => csrf_token(),
            'user' => auth()->user()?->name,
        ]);
    })->name('session.keepalive');

    // Video Panduan & Tur Sistem Terpadu (Beserta Surat Penjelasan & Download Center)
    Route::get('/video-panduan', [VideoPanduanController::class, 'index'])->name('video-panduan.index');
    Route::post('/video-panduan/settings', [VideoPanduanController::class, 'updateSettings'])->name('video-panduan.settings');
    Route::get('/video-panduan/download/surat-pdf', [VideoPanduanController::class, 'downloadSuratPdf'])->name('video-panduan.download.surat-pdf');
    Route::get('/video-panduan/download/surat-doc', [VideoPanduanController::class, 'downloadSuratDoc'])->name('video-panduan.download.surat-doc');
    Route::get('/video-panduan/download/panduan-pdf', [VideoPanduanController::class, 'downloadPanduanPdf'])->name('video-panduan.download.panduan-pdf');
    Route::get('/video-panduan/download/katalog-csv', [VideoPanduanController::class, 'downloadKatalogCsv'])->name('video-panduan.download.katalog-csv');
    Route::get('/video-panduan/download/transkrip-txt', [VideoPanduanController::class, 'downloadTranskripTxt'])->name('video-panduan.download.transkrip-txt');
    Route::get('/video-panduan/download/audio-20s', [VideoPanduanController::class, 'downloadAudio20s'])->name('video-panduan.download.audio-20s');

    // Master Data Hub
    Route::get('/master-data', [MasterDataController::class, 'index'])->name('master-data.index');

    // Profile (My Profil)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update.post');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Web Settings: Navigation Menu Builder (Drag & Drop, Hierarchy, Permissions)
    Route::get('/settings/menus', [NavigationMenuController::class, 'index'])->name('settings.menus.index');
    Route::post('/settings/menus', [NavigationMenuController::class, 'store'])->name('settings.menus.store');
    Route::put('/settings/menus/{menu}', [NavigationMenuController::class, 'update'])->name('settings.menus.update');
    Route::patch('/settings/menus/{menu}/icon', [NavigationMenuController::class, 'updateIcon'])->name('settings.menus.icon');
    Route::delete('/settings/menus/{menu}', [NavigationMenuController::class, 'destroy'])->name('settings.menus.destroy');
    Route::post('/settings/menus/reorder', [NavigationMenuController::class, 'reorder'])->name('settings.menus.reorder');
    Route::post('/settings/menus/reset', [NavigationMenuController::class, 'resetDefault'])->name('settings.menus.reset');
    Route::post('/settings/branding', [NavigationMenuController::class, 'updateBranding'])->name('settings.branding.update');

    // Role & Permission Management
    Route::get('/settings/roles-permissions', [RolePermissionController::class, 'index'])->name('settings.roles-permissions.index');
    Route::post('/settings/roles', [RolePermissionController::class, 'storeRole'])->name('settings.roles.store');
    Route::put('/settings/roles/{role}', [RolePermissionController::class, 'updateRole'])->name('settings.roles.update');
    Route::delete('/settings/roles/{role}', [RolePermissionController::class, 'destroyRole'])->name('settings.roles.destroy');
    Route::post('/settings/roles/{role}/permissions', [RolePermissionController::class, 'syncRolePermissions'])->name('settings.roles.sync-permissions');
    Route::post('/settings/permissions', [RolePermissionController::class, 'storePermission'])->name('settings.permissions.store');
    Route::delete('/settings/permissions/{permission}', [RolePermissionController::class, 'destroyPermission'])->name('settings.permissions.destroy');
    Route::post('/settings/users/{user}/roles', [RolePermissionController::class, 'syncUserRoles'])->name('settings.users.sync-roles');
    Route::post('/settings/permissions/seed', [RolePermissionController::class, 'seedRecommendedPermissions'])->name('settings.permissions.seed');

    // Navigation and setting redirects
    
    
    
    Route::redirect('/part-canibal', '/part-canibals');
    Route::redirect('/hour-meter', '/hour-meters');
    Route::redirect('/pengajuan-cuti', '/cuti/pengajuan');

    // Email & SMTP Settings
    Route::get('/settings/mail', [SettingController::class, 'index'])->name('settings.mail.index');
    Route::post('/settings/mail', [SettingController::class, 'update'])->name('settings.mail.update');
    Route::post('/settings/mail/test', [SettingController::class, 'sendTestMail'])->name('settings.mail.test');

    // Populasi Unit (Plant Operations)
    Route::get('/units/export/excel', [UnitController::class, 'exportExcel'])->name('units.export.excel');
    Route::get('/units/export/multi-sheet', [UnitController::class, 'exportMultiSheetExcel'])->name('units.export.multi-sheet');
    Route::get('/units/export/pdf', [UnitController::class, 'exportPdf'])->name('units.export.pdf');
    Route::get('/units/download/template', [UnitController::class, 'downloadTemplate'])->name('units.download.template');
    Route::post('/units/import', [UnitController::class, 'import'])->name('units.import');
    Route::get('/units/{unit}/apls', [UnitController::class, 'getAplsJson'])->name('units.apls.json');
    Route::resource('units', UnitController::class);

    // List APL (Aplikasi Part & Pelumas / Service Part List)
    Route::get('/unit-apls/template', [UnitAplController::class, 'downloadTemplate'])->name('unit-apls.template');
    Route::post('/unit-apls/import', [UnitAplController::class, 'import'])->name('unit-apls.import');
    Route::post('/unit-apls', [UnitAplController::class, 'store'])->name('unit-apls.store');
    Route::put('/unit-apls/{unitApl}', [UnitAplController::class, 'update'])->name('unit-apls.update');
    Route::delete('/unit-apls/{unitApl}', [UnitAplController::class, 'destroy'])->name('unit-apls.destroy');

    // GET (Ground Engaging Tools)
    Route::get('/unit-gets/template', [UnitGetController::class, 'downloadTemplate'])->name('unit-gets.template');
    Route::post('/unit-gets/import', [UnitGetController::class, 'import'])->name('unit-gets.import');
    Route::post('/unit-gets', [UnitGetController::class, 'store'])->name('unit-gets.store');
    Route::put('/unit-gets/{unitGet}', [UnitGetController::class, 'update'])->name('unit-gets.update');
    Route::delete('/unit-gets/{unitGet}', [UnitGetController::class, 'destroy'])->name('unit-gets.destroy');

    // Gatepass Unit (Surat Izin Keluar Unit / Despatch Report)
    Route::get('/gatepass-unit/{gatepass_unit}/pdf', [UnitGatePassController::class, 'exportPdf'])->name('gatepass-unit.pdf');
    Route::post('/gatepass-unit/{gatepass_unit}/return', [UnitGatePassController::class, 'markReturned'])->name('gatepass-unit.return');
    Route::resource('gatepass-unit', UnitGatePassController::class);

    Route::get('/list-populasi', [ListPopulasiController::class, 'index'])->name('list-populasi.index');
    Route::get('/kpi', [KpiController::class, 'index'])->name('kpi.index');

    // Performance Unit
    Route::get('/performance-unit/export/excel', [PerformanceUnitController::class, 'exportExcel'])->name('performance-unit.export.excel');
    Route::get('/performance-unit/export/pdf', [PerformanceUnitController::class, 'exportPdf'])->name('performance-unit.export.pdf');
    Route::get('/performance-unit', [PerformanceUnitController::class, 'index'])->name('performance-unit.index');

    Route::get('/api/get-hm', [HourMeterController::class, 'getHm'])->name('hour-meters.get-hm');
    Route::get('/hour-meters/export/excel', [HourMeterController::class, 'exportExcel'])->name('hour-meters.export.excel');
    Route::get('/hour-meters/export/pdf', [HourMeterController::class, 'exportPdf'])->name('hour-meters.export.pdf');
    Route::get('/hour-meters/download/template', [HourMeterController::class, 'downloadTemplate'])->name('hour-meters.download.template');
    Route::post('/hour-meters/import', [HourMeterController::class, 'import'])->name('hour-meters.import');
    Route::post('/hour-meters/quick-save', [HourMeterController::class, 'quickSave'])->name('hour-meters.quick-save');
    Route::resource('hour-meters', HourMeterController::class);

    Route::get('/abr/export/pdf', [AbrController::class, 'exportPdf'])->name('abr.export.pdf');
    Route::get('/abr/{abr}/pdf', [AbrController::class, 'downloadPdf'])->name('abr.download.pdf');
    Route::resource('abr', AbrController::class);

    // Org & Manpower Routes
    Route::get('/organization', [OrganizationController::class, 'index'])->name('organization.index');
    Route::post('/organization', [OrganizationController::class, 'store'])->name('organization.store');
    Route::put('/organization/{organization}', [OrganizationController::class, 'update'])->name('organization.update');
    Route::delete('/organization/{organization}', [OrganizationController::class, 'destroy'])->name('organization.destroy');
    Route::get('/manpower-budget', [ManpowerBudgetController::class, 'index'])->name('manpower-budget.index');

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
        Route::get('/database-schema/pdf', [DatabaseSchemaController::class, 'exportPdf'])->name('database-schema.pdf');
        Route::get('/api/database-schema', [DatabaseSchemaController::class, 'getSchema'])->name('api.database-schema');

        // Dynamic Settings
        Route::get('/settings/mail', [SettingController::class, 'index'])->name('settings.mail');
        Route::post('/settings/mail', [SettingController::class, 'update'])->name('settings.mail.update');
        

        // Reports (DomPDF)
        Route::get('/reports/users/pdf', [ReportController::class, 'usersPdf'])->name('reports.users.pdf');

        // Destructive Bulk Deletions (Protected from regular users)
        Route::delete('/units-delete-all', [UnitController::class, 'deleteAll'])->name('units.delete.all');
        Route::delete('/hour-meters-delete-all', [HourMeterController::class, 'deleteAll'])->name('hour-meters.delete.all');
        Route::delete('/monitoring-orderan/clear', [MonitoringOrderanController::class, 'destroyAll'])->name('monitoring-orderan.destroy-all');
        Route::delete('/pcr-uc/destroy-all', [PcrController::class, 'destroyAll'])->name('pcr-uc.destroy-all');
    });

    // Service Order Plant & Monitoring
    Route::get('/service-orders', [ServiceOrderController::class, 'index'])->name('service-orders.index');
    Route::post('/service-orders/bulk', [ServiceOrderController::class, 'storeBulk'])->name('service-orders.storeBulk');
    Route::put('/service-orders/{service_order}', [ServiceOrderController::class, 'update'])->name('service-orders.update');
    Route::delete('/service-orders/{service_order}', [ServiceOrderController::class, 'destroy'])->name('service-orders.destroy');
    // Work Orders Route
    Route::get('/work-orders/download-template', [WorkOrderController::class, 'downloadTemplate'])->name('work-orders.download-template');
    Route::get('/work-orders/export', [WorkOrderController::class, 'exportExcel'])->name('work-orders.export');
    Route::get('/work-orders/export-breakdown', [WorkOrderController::class, 'exportBreakdownExcel'])->name('work-orders.export-breakdown');
    Route::post('/work-orders/import', [WorkOrderController::class, 'importExcel'])->name('work-orders.import');
    Route::get('/work-orders/download-template-breakdown', [WorkOrderController::class, 'downloadTemplateBreakdown'])->name('work-orders.download-template-breakdown');
    Route::post('/work-orders/import-breakdown', [WorkOrderController::class, 'importExcelBreakdown'])->name('work-orders.import-breakdown');
    Route::get('/work-orders/download-template-last-service', [WorkOrderController::class, 'downloadTemplateLastService'])->name('work-orders.download-template-last-service');
    Route::post('/work-orders/import-last-service', [WorkOrderController::class, 'importLastService'])->name('work-orders.import-last-service');
    Route::get('/work-orders', [WorkOrderController::class, 'index'])->name('work-orders.index');
    Route::post('/work-orders', [WorkOrderController::class, 'store'])->name('work-orders.store');
    Route::get('/work-orders/suggest-number', [WorkOrderController::class, 'suggestNumber'])->name('work-orders.suggest-number');
    Route::get('/work-orders/create', [WorkOrderController::class, 'create'])->name('work-orders.create');
    Route::get('/work-orders/{id}', [WorkOrderController::class, 'show'])->name('work-orders.show');
    Route::get('/work-orders/{id}/edit', [WorkOrderController::class, 'edit'])->name('work-orders.edit');
    Route::put('/work-orders/{id}', [WorkOrderController::class, 'update'])->name('work-orders.update');
    Route::patch('/work-orders/{id}/status', [WorkOrderController::class, 'updateStatus'])->name('work-orders.update-status');
    Route::delete('/work-orders/{id}', [WorkOrderController::class, 'destroy'])->name('work-orders.destroy');
    Route::post('/work-orders/{id}/attach-order-parts', [WorkOrderController::class, 'attachOrderParts'])->name('work-orders.attach-order-parts');
    Route::post('/work-orders/{id}/parts', [WorkOrderController::class, 'storePart'])->name('work-orders.parts.store');
    Route::put('/work-orders/{id}/parts/{partId}', [WorkOrderController::class, 'updatePart'])->name('work-orders.parts.update');
    Route::delete('/work-orders/{id}/parts/{partId}', [WorkOrderController::class, 'destroyPart'])->name('work-orders.parts.destroy');
    Route::get('/work-orders/{id}/search-monitoring-orders', [WorkOrderController::class, 'searchMonitoringOrders'])->name('work-orders.search-monitoring-orders');

    // Form OHT 773 (PM Service Sheet Off Highway Truck 773E)
    Route::get('/form-oht773/download-pdf', [PlantFormController::class, 'downloadPdf'])->name('form-oht773.download-pdf');
    Route::get('/form-oht773/blank-print', [PlantFormController::class, 'blankPrint'])->name('form-oht773.blank-print');
    Route::get('/form-oht773/{id}/print', [PlantFormController::class, 'print'])->name('form-oht773.print');
    Route::resource('form-oht773', PlantFormController::class)->names([
        'index' => 'form-oht773.index',
        'create' => 'form-oht773.create',
        'store' => 'form-oht773.store',
        'show' => 'form-oht773.show',
        'edit' => 'form-oht773.edit',
        'update' => 'form-oht773.update',
        'destroy' => 'form-oht773.destroy',
    ]);

    // Form Service Dump Truck (PM Service Sheet Dump Truck)
    Route::get('/form-service-dump-truck/download-pdf', [DumpTruckServiceController::class, 'downloadPdf'])->name('form-service-dump-truck.download-pdf');
    Route::get('/form-service-dump-truck/blank-print', [DumpTruckServiceController::class, 'blankPrint'])->name('form-service-dump-truck.blank-print');
    Route::get('/form-service-dump-truck/{id}/print', [DumpTruckServiceController::class, 'print'])->name('form-service-dump-truck.print');
    Route::resource('form-service-dump-truck', DumpTruckServiceController::class)->names([
        'index' => 'form-service-dump-truck.index',
        'create' => 'form-service-dump-truck.create',
        'store' => 'form-service-dump-truck.store',
        'show' => 'form-service-dump-truck.show',
        'edit' => 'form-service-dump-truck.edit',
        'update' => 'form-service-dump-truck.update',
        'destroy' => 'form-service-dump-truck.destroy',
    ]);

    // Form Service Genset (PM Service Sheet Generator Set)
    Route::get('/form-service-genset/download-pdf', [GensetServiceController::class, 'downloadPdf'])->name('form-service-genset.download-pdf');
    Route::get('/form-service-genset/blank-print', [GensetServiceController::class, 'blankPrint'])->name('form-service-genset.blank-print');
    Route::get('/form-service-genset/{id}/print', [GensetServiceController::class, 'print'])->name('form-service-genset.print');
    Route::resource('form-service-genset', GensetServiceController::class)->names([
        'index' => 'form-service-genset.index',
        'create' => 'form-service-genset.create',
        'store' => 'form-service-genset.store',
        'show' => 'form-service-genset.show',
        'edit' => 'form-service-genset.edit',
        'update' => 'form-service-genset.update',
        'destroy' => 'form-service-genset.destroy',
    ]);

    // Form Washing Unit (Heavy Equipment Cleaning Check Sheet)
    Route::get('/form-washing-unit/download-pdf', [WashingFormController::class, 'downloadPdf'])->name('form-washing-unit.download-pdf');
    Route::get('/form-washing-unit/blank-print', [WashingFormController::class, 'blankPrint'])->name('form-washing-unit.blank-print');
    Route::get('/form-washing-unit/{id}/print', [WashingFormController::class, 'print'])->name('form-washing-unit.print');
    Route::resource('form-washing-unit', WashingFormController::class)->names([
        'index' => 'form-washing-unit.index',
        'create' => 'form-washing-unit.create',
        'store' => 'form-washing-unit.store',
        'show' => 'form-washing-unit.show',
        'edit' => 'form-washing-unit.edit',
        'update' => 'form-washing-unit.update',
        'destroy' => 'form-washing-unit.destroy',
    ]);

    // Form Penundaan Service (Service Postponement Form)
    Route::get('/form-penundaan-service/download-pdf', [PenundaanServiceController::class, 'downloadPdf'])->name('form-penundaan-service.download-pdf');
    Route::get('/form-penundaan-service/blank-print', [PenundaanServiceController::class, 'blankPrint'])->name('form-penundaan-service.blank-print');
    Route::get('/form-penundaan-service/{id}/print', [PenundaanServiceController::class, 'print'])->name('form-penundaan-service.print');
    Route::resource('form-penundaan-service', PenundaanServiceController::class)->names([
        'index' => 'form-penundaan-service.index',
        'create' => 'form-penundaan-service.create',
        'store' => 'form-penundaan-service.store',
        'show' => 'form-penundaan-service.show',
        'edit' => 'form-penundaan-service.edit',
        'update' => 'form-penundaan-service.update',
        'destroy' => 'form-penundaan-service.destroy',
    ]);

    // Form Inspection Bucket (Bucket Inspection & Monitoring Check Sheet)
    Route::get('/form-inspection-bucket/download-pdf', [BucketInspectionController::class, 'downloadPdf'])->name('form-inspection-bucket.download-pdf');
    Route::get('/form-inspection-bucket/blank-print', [BucketInspectionController::class, 'blankPrint'])->name('form-inspection-bucket.blank-print');
    Route::get('/form-inspection-bucket/{id}/print', [BucketInspectionController::class, 'print'])->name('form-inspection-bucket.print');
    Route::resource('form-inspection-bucket', BucketInspectionController::class)->names([
        'index' => 'form-inspection-bucket.index',
        'create' => 'form-inspection-bucket.create',
        'store' => 'form-inspection-bucket.store',
        'show' => 'form-inspection-bucket.show',
        'edit' => 'form-inspection-bucket.edit',
        'update' => 'form-inspection-bucket.update',
        'destroy' => 'form-inspection-bucket.destroy',
    ]);

    // Check Sheet Service
    Route::get('/form-check-sheet-service/download-pdf', [CheckSheetServiceController::class, 'downloadPdf'])->name('form-check-sheet-service.download-pdf');
    Route::get('/form-check-sheet-service/blank-print', [CheckSheetServiceController::class, 'blankPrint'])->name('form-check-sheet-service.blank-print');
    Route::get('/form-check-sheet-service/{id}/print', [CheckSheetServiceController::class, 'print'])->name('form-check-sheet-service.print');
    Route::resource('form-check-sheet-service', CheckSheetServiceController::class)->names([
        'index' => 'form-check-sheet-service.index',
        'create' => 'form-check-sheet-service.create',
        'store' => 'form-check-sheet-service.store',
        'show' => 'form-check-sheet-service.show',
        'edit' => 'form-check-sheet-service.edit',
        'update' => 'form-check-sheet-service.update',
        'destroy' => 'form-check-sheet-service.destroy',
    ]);

    // Check Sheet Service Dozer
    Route::get('/form-check-sheet-dozer/download-pdf', [CheckSheetDozerController::class, 'downloadPdf'])->name('form-check-sheet-dozer.download-pdf');
    Route::get('/form-check-sheet-dozer/blank-print', [CheckSheetDozerController::class, 'blankPrint'])->name('form-check-sheet-dozer.blank-print');
    Route::get('/form-check-sheet-dozer/{id}/print', [CheckSheetDozerController::class, 'print'])->name('form-check-sheet-dozer.print');
    Route::resource('form-check-sheet-dozer', CheckSheetDozerController::class)->names([
        'index' => 'form-check-sheet-dozer.index',
        'create' => 'form-check-sheet-dozer.create',
        'store' => 'form-check-sheet-dozer.store',
        'show' => 'form-check-sheet-dozer.show',
        'edit' => 'form-check-sheet-dozer.edit',
        'update' => 'form-check-sheet-dozer.update',
        'destroy' => 'form-check-sheet-dozer.destroy',
    ]);

    // Check Sheet Service Motorgrader
    Route::get('/form-check-sheet-motorgrader/download-pdf', [CheckSheetMotorgraderController::class, 'downloadPdf'])->name('form-check-sheet-motorgrader.download-pdf');
    Route::get('/form-check-sheet-motorgrader/blank-print', [CheckSheetMotorgraderController::class, 'blankPrint'])->name('form-check-sheet-motorgrader.blank-print');
    Route::get('/form-check-sheet-motorgrader/{id}/print', [CheckSheetMotorgraderController::class, 'print'])->name('form-check-sheet-motorgrader.print');
    Route::resource('form-check-sheet-motorgrader', CheckSheetMotorgraderController::class)->names([
        'index' => 'form-check-sheet-motorgrader.index',
        'create' => 'form-check-sheet-motorgrader.create',
        'store' => 'form-check-sheet-motorgrader.store',
        'show' => 'form-check-sheet-motorgrader.show',
        'edit' => 'form-check-sheet-motorgrader.edit',
        'update' => 'form-check-sheet-motorgrader.update',
        'destroy' => 'form-check-sheet-motorgrader.destroy',
    ]);

    // Pre Release Check List Report Track Unit
    Route::get('/form-pre-release-track-unit/download-pdf', [PreReleaseTrackUnitController::class, 'downloadPdf'])->name('form-pre-release-track-unit.download-pdf');
    Route::get('/form-pre-release-track-unit/blank-print', [PreReleaseTrackUnitController::class, 'blankPrint'])->name('form-pre-release-track-unit.blank-print');
    Route::get('/form-pre-release-track-unit/{id}/print', [PreReleaseTrackUnitController::class, 'print'])->name('form-pre-release-track-unit.print');
    Route::resource('form-pre-release-track-unit', PreReleaseTrackUnitController::class)->names([
        'index' => 'form-pre-release-track-unit.index',
        'create' => 'form-pre-release-track-unit.create',
        'store' => 'form-pre-release-track-unit.store',
        'show' => 'form-pre-release-track-unit.show',
        'edit' => 'form-pre-release-track-unit.edit',
        'update' => 'form-pre-release-track-unit.update',
        'destroy' => 'form-pre-release-track-unit.destroy',
    ]);

    // Request Asset Disposed Form
    Route::get('/form-request-asset-disposed/download-pdf', [RequestAssetDisposedController::class, 'downloadPdf'])->name('form-request-asset-disposed.download-pdf');
    Route::get('/form-request-asset-disposed/blank-print', [RequestAssetDisposedController::class, 'blankPrint'])->name('form-request-asset-disposed.blank-print');
    Route::get('/form-request-asset-disposed/{id}/print', [RequestAssetDisposedController::class, 'print'])->name('form-request-asset-disposed.print');
    Route::resource('form-request-asset-disposed', RequestAssetDisposedController::class)->names([
        'index' => 'form-request-asset-disposed.index',
        'create' => 'form-request-asset-disposed.create',
        'store' => 'form-request-asset-disposed.store',
        'show' => 'form-request-asset-disposed.show',
        'edit' => 'form-request-asset-disposed.edit',
        'update' => 'form-request-asset-disposed.update',
        'destroy' => 'form-request-asset-disposed.destroy',
    ]);

    // Surat Permintaan Komponen (Internal Memorandum)
    Route::match(['get', 'post'], '/form-surat-permintaan-komponen/download-pdf', [SuratPermintaanKomponenController::class, 'downloadPdf'])->name('form-surat-permintaan-komponen.download-pdf');
    Route::get('/form-surat-permintaan-komponen/blank-print', [SuratPermintaanKomponenController::class, 'blankPrint'])->name('form-surat-permintaan-komponen.blank-print');
    Route::get('/form-surat-permintaan-komponen/{id}/print', [SuratPermintaanKomponenController::class, 'print'])->name('form-surat-permintaan-komponen.print');
    Route::resource('form-surat-permintaan-komponen', SuratPermintaanKomponenController::class)->names([
        'index' => 'form-surat-permintaan-komponen.index',
        'create' => 'form-surat-permintaan-komponen.create',
        'store' => 'form-surat-permintaan-komponen.store',
        'show' => 'form-surat-permintaan-komponen.show',
        'edit' => 'form-surat-permintaan-komponen.edit',
        'update' => 'form-surat-permintaan-komponen.update',
        'destroy' => 'form-surat-permintaan-komponen.destroy',
    ]);

    // Form JSA (Job Safety Environmental Analysis - MAM-HSE-FORM-028)
    Route::get('/form-jsa/portal', [FormJsaController::class, 'portal'])->name('form-jsa.portal');
    Route::get('/form-jsa/download-pdf', [FormJsaController::class, 'downloadPdf'])->name('form-jsa.download-pdf');
    Route::get('/form-jsa/blank-print/{taskType?}', [FormJsaController::class, 'blankPrint'])->name('form-jsa.blank-print');
    Route::get('/form-jsa/{id}/print', [FormJsaController::class, 'print'])->name('form-jsa.print');
    Route::get('/form-jsa', [FormJsaController::class, 'index'])->name('form-jsa.index');
    Route::get('/form-jsa/{taskType}', [FormJsaController::class, 'index'])->name('form-jsa.by-task');
    Route::post('/form-jsa', [FormJsaController::class, 'store'])->name('form-jsa.store');
    Route::put('/form-jsa/{id}', [FormJsaController::class, 'update'])->name('form-jsa.update');
    Route::delete('/form-jsa/{id}', [FormJsaController::class, 'destroy'])->name('form-jsa.destroy');

    // Backward compatibility redirects & routes for legacy /form-plant
    Route::get('/form-plant', fn () => redirect('/form-oht773'))->name('form-plant.index');
    Route::get('/form-plant/download-pdf', [PlantFormController::class, 'downloadPdf'])->name('form-plant.download-pdf');
    Route::get('/form-plant/blank-print', [PlantFormController::class, 'blankPrint'])->name('form-plant.blank-print');
    Route::get('/form-plant/{id}/print', [PlantFormController::class, 'print'])->name('form-plant.print');
    Route::resource('form-plant', PlantFormController::class)->names([
        'create' => 'form-plant.create',
        'store' => 'form-plant.store',
        'show' => 'form-plant.show',
        'edit' => 'form-plant.edit',
        'update' => 'form-plant.update',
        'destroy' => 'form-plant.destroy',
    ]);

    // Historical Import Wizard
    Route::get('/import-historical', [HistoricalImportController::class, 'index'])->name('import-historical.index');
    Route::get('/import-historical/template/{type}', [HistoricalImportController::class, 'downloadTemplate'])->name('import-historical.template');
    Route::post('/import-historical/preview', [HistoricalImportController::class, 'preview'])->name('import-historical.preview');
    Route::post('/import-historical/process', [HistoricalImportController::class, 'process'])->name('import-historical.process');

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
    Route::get('/monitoring-orderan/export-excel', [MonitoringOrderanController::class, 'exportExcel'])->name('monitoring-orderan.export-excel');
    Route::get('/monitoring-orderan/export-pdf', [MonitoringOrderanController::class, 'exportPdfByQuery'])->name('monitoring-orderan.export-pdf');
    Route::get('/monitoring-orderan/{monitoring_orderan}/print', [MonitoringOrderanController::class, 'print'])->name('monitoring-orderan.print');
    Route::get('/monitoring-orderan/{monitoring_orderan}/pdf', [MonitoringOrderanController::class, 'exportPdf'])->name('monitoring-orderan.pdf');
    Route::get('/monitoring-orderan/{monitoring_orderan}/excel', [MonitoringOrderanController::class, 'exportExcelOrder'])->name('monitoring-orderan.excel');
    Route::get('/monitoring-orderan/{monitoring_orderan}/edit', [MonitoringOrderanController::class, 'edit'])->name('monitoring-orderan.edit');
    Route::get('/monitoring-orderan/part-lifetime', [MonitoringOrderanController::class, 'getPartLifetime'])->name('monitoring-orderan.part-lifetime');
    Route::post('/monitoring-orderan', [MonitoringOrderanController::class, 'store'])->name('monitoring-orderan.store');
    Route::put('/monitoring-orderan/{monitoring_orderan}', [MonitoringOrderanController::class, 'update'])->name('monitoring-orderan.update');
    Route::post('/monitoring-orderan/import', [MonitoringOrderanController::class, 'import'])->name('monitoring-orderan.import');
    Route::get('/monitoring-orderan/download-template', [MonitoringOrderanController::class, 'downloadTemplate'])->name('monitoring-orderan.download-template');
    Route::delete('/monitoring-orderan/{monitoring_orderan}', [MonitoringOrderanController::class, 'destroy'])->name('monitoring-orderan.destroy');

    // Smart Part Order & Part Lifetime Management
    Route::get('/part-order-lifetime', [PartOrderLifetimeController::class, 'index'])->name('part-order-lifetime.index');
    Route::post('/part-order-lifetime', [PartOrderLifetimeController::class, 'store'])->name('part-order-lifetime.store');
    Route::put('/part-order-lifetime/{partOrderLifetime}', [PartOrderLifetimeController::class, 'update'])->name('part-order-lifetime.update');
    Route::delete('/part-order-lifetime/{partOrderLifetime}', [PartOrderLifetimeController::class, 'destroy'])->name('part-order-lifetime.destroy');
    Route::put('/part-order-lifetime/{partOrderLifetime}/status', [PartOrderLifetimeController::class, 'updateStatus'])->name('part-order-lifetime.update-status');
    Route::post('/part-order-lifetime/{partOrderLifetime}/install', [PartOrderLifetimeController::class, 'install'])->name('part-order-lifetime.install');
    Route::post('/part-order-lifetime/{partOrderLifetime}/replace', [PartOrderLifetimeController::class, 'replace'])->name('part-order-lifetime.replace');
    Route::get('/api/part-order-lifetime/check-active', [PartOrderLifetimeController::class, 'checkActiveOrder'])->name('part-order-lifetime.check-active');
    Route::get('/api/part-order-lifetime/timeline', [PartOrderLifetimeController::class, 'timeline'])->name('part-order-lifetime.timeline');

    Route::put('/part-canibals/{part_canibal}/status', [PartCanibalController::class, 'updateStatus'])->name('part-canibals.updateStatus');
    Route::resource('part-canibals', PartCanibalController::class)->only(['index', 'store', 'update', 'destroy']);

    // Inspection Unit
    Route::get('/inspection-unit/export', [P2hController::class, 'export'])->name('inspection-unit.export');
    Route::get('/inspection-unit', [P2hController::class, 'index'])->name('inspection-unit.index');
    Route::post('/inspection-unit', [P2hController::class, 'store'])->name('inspection-unit.store');
    Route::match(['put', 'post'], '/inspection-unit/{id}', [P2hController::class, 'update'])->name('inspection-unit.update');
    Route::delete('/inspection-unit/{id}', [P2hController::class, 'destroy'])->name('inspection-unit.destroy');

    // Inspection Unit (alias /inspection-p2h)
    Route::get('/inspection-p2h/export', [P2hController::class, 'export'])->name('inspection-p2h.export');
    Route::get('/inspection-p2h', [P2hController::class, 'index'])->name('inspection-p2h.index');
    Route::post('/inspection-p2h', [P2hController::class, 'store'])->name('inspection-p2h.store');
    Route::put('/inspection-p2h/{id}', [P2hController::class, 'update'])->name('inspection-p2h.update');
    Route::delete('/inspection-p2h/{id}', [P2hController::class, 'destroy'])->name('inspection-p2h.destroy');
    Route::get('/monitoring/p2h', [P2hController::class, 'index'])->name('p2h.index');
    Route::post('/monitoring/p2h', [P2hController::class, 'store'])->name('p2h.store');
    Route::put('/monitoring/p2h/{id}', [P2hController::class, 'update'])->name('p2h.update');
    Route::delete('/monitoring/p2h/{id}', [P2hController::class, 'destroy'])->name('p2h.destroy');

    // PM Monitoring (Jatuh Tempo Service Unit)
    Route::get('/pm-monitoring', [PmMonitoringController::class, 'index'])->name('pm-monitoring.index');
    Route::post('/pm-monitoring/sync-hm', [PmMonitoringController::class, 'syncHm'])->name('pm-monitoring.sync-hm');

    // Plan Service & Master PM
    Route::get('/plan-service', [PlanServiceController::class, 'index'])->name('plan-service.index');
    Route::post('/plan-service/{unit}/complete', [PlanServiceController::class, 'complete'])->name('plan-service.complete');

    // Backlog (Dinonaktifkan / Dialihkan ke Work Orders)
    Route::get('/backlogs', function () {
        return redirect()->route('work-orders.index');
    })->name('backlogs.index');
    Route::any('/backlogs/{any}', function () {
        return redirect()->route('work-orders.index');
    })->where('any', '.*');

    // Failure Analysis (FAR)
    Route::get('/failure-analysis/{failure_analysis}/export-pdf', [FailureAnalysisController::class, 'exportPdf'])->name('failure-analysis.export-pdf');
    Route::resource('failure-analysis', FailureAnalysisController::class);

    // Historical Periodical Service
    Route::get('/historical-services', [HistoricalServiceController::class, 'index'])->name('historical-services.index');

    // Forecast PA Unit
    Route::get('/forecast-budget-monthly', [PdfForecastController::class, 'index'])->name('forecast-budget-monthly.index');
    Route::post('/forecast-budget-monthly', [PdfForecastController::class, 'store'])->name('forecast-budget-monthly.store');
    Route::put('/forecast-budget-monthly/{id}', [PdfForecastController::class, 'update'])->name('forecast-budget-monthly.update');
    Route::delete('/forecast-budget-monthly/{id}', [PdfForecastController::class, 'destroy'])->name('forecast-budget-monthly.destroy');

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
    Route::post('/roster/sync-manpower', [RosterController::class, 'syncManpower'])->name('roster.sync-manpower');
    Route::delete('/roster/clear-all', [RosterController::class, 'clearAll'])->name('roster.clear-all');
    Route::post('/roster/clear-all', [RosterController::class, 'clearAll'])->name('roster.clear-all.post');
    Route::get('/roster/template', [RosterController::class, 'downloadTemplate'])->name('roster.template');
    Route::post('/roster/import', [RosterController::class, 'importExcel'])->name('roster.import');
    Route::get('/roster/export', [RosterController::class, 'exportExcel'])->name('roster.export');

    // Absensi Harian Karyawan
    Route::get('/absensi', [AbsensiController::class, 'index'])->name('absensi.index');

    // Slip Gaji
    Route::get('/absensi/slip-gaji', [SlipGajiController::class, 'index'])->name('slip-gaji.index');

    // Manpower
    Route::get('/manpower', [ManpowerController::class, 'index'])->name('manpower.index');
    Route::get('/manpower/template', [ManpowerController::class, 'downloadTemplate'])->name('manpower.template');
    Route::post('/manpower/import', [ManpowerController::class, 'importExcel'])->name('manpower.import');
    Route::get('/manpower/export', [ManpowerController::class, 'exportExcel'])->name('manpower.export');
    Route::delete('/manpower/clear-all', [ManpowerController::class, 'clearAll'])->name('manpower.clear-all');
    Route::post('/manpower/clear-all', [ManpowerController::class, 'clearAll'])->name('manpower.clear-all.post');
    Route::get('/manpower/perhitungan', [PerhitunganManpowerController::class, 'index'])->name('manpower.perhitungan');
    Route::put('/manpower/perhitungan/{budget}', [PerhitunganManpowerController::class, 'update'])->name('manpower.perhitungan.update');
    Route::post('/manpower/perhitungan/reset', [PerhitunganManpowerController::class, 'resetToDefault'])->name('manpower.perhitungan.reset');

    // Cuti & Transportasi
    Route::get('/cuti/pengajuan', [PengajuanCutiController::class, 'create'])->name('cuti.pengajuan');
    Route::post('/cuti/pengajuan', [PengajuanCutiController::class, 'storePengajuan'])->name('cuti.pengajuan.store');
    Route::post('/cuti/historical', [PengajuanCutiController::class, 'storeHistorical'])->name('cuti.historical.store');
    Route::delete('/cuti/historical/{historical}', [PengajuanCutiController::class, 'destroyHistorical'])->name('cuti.historical.destroy');
    Route::get('/cuti/jadwal', [JadwalCutiController::class, 'index'])->name('cuti.jadwal');

    // Breakdown
    Route::get('/breakdown/daily/export', [BreakdownController::class, 'exportExcel'])->name('breakdown.export');
    Route::get('/breakdown/daily', [BreakdownController::class, 'daily'])->name('breakdown.daily');
    Route::post('/breakdown/daily/rename-category', [BreakdownController::class, 'renameCategory'])->name('breakdown.rename-category');
    Route::post('/breakdown/daily', [BreakdownController::class, 'store'])->name('breakdown.store');
    Route::put('/breakdown/daily/{breakdown}', [BreakdownController::class, 'update'])->name('breakdown.update');
    Route::delete('/breakdown/daily/{breakdown}', [BreakdownController::class, 'destroy'])->name('breakdown.destroy');

    // Repair & Maintenance (WO Outside Repair & Battery)
    Route::get('/repair/battery', [BatteryMonitoringController::class, 'index'])->name('repair.battery.index');
    Route::get('/repair/battery/export', [BatteryMonitoringController::class, 'exportExcel'])->name('repair.battery.export');
    Route::post('/repair/battery', [BatteryMonitoringController::class, 'store'])->name('repair.battery.store');
    Route::post('/repair/battery/{battery}', [BatteryMonitoringController::class, 'update'])->name('repair.battery.update');
    Route::post('/repair/battery/{battery}/replace', [BatteryMonitoringController::class, 'replace'])->name('repair.battery.replace');
    Route::delete('/repair/battery/{battery}', [BatteryMonitoringController::class, 'destroy'])->name('repair.battery.destroy');
    Route::get('/repair/job-outside', [JobOutsideRepairController::class, 'index'])->name('repair.job-outside');
    Route::post('/repair/job-outside', [JobOutsideRepairController::class, 'store'])->name('repair.job-outside.store');
    Route::post('/repair/job-outside/{wo}', [JobOutsideRepairController::class, 'update'])->name('repair.job-outside.update'); // using POST for file upload support
    Route::delete('/repair/job-outside/{wo}', [JobOutsideRepairController::class, 'destroy'])->name('repair.job-outside.destroy');
    Route::get('/repair/job-outside/{wo}/pdf', [JobOutsideRepairController::class, 'printPdf'])->name('repair.job-outside.pdf');
    Route::get('/repair/magnetic-plug/download-template', [MagneticPlugController::class, 'downloadTemplate'])->name('repair.magnetic-plug.download-template');
    Route::get('/repair/magnetic-plug/export', [MagneticPlugController::class, 'exportExcel'])->name('repair.magnetic-plug.export');
    Route::post('/repair/magnetic-plug/import', [MagneticPlugController::class, 'import'])->name('repair.magnetic-plug.import');
    Route::get('/repair/magnetic-plug', [MagneticPlugController::class, 'index'])->name('repair.magnetic-plug');
    Route::get('/repair/magnetic-plug/create', [MagneticPlugController::class, 'create'])->name('repair.magnetic-plug.create');
    Route::post('/repair/magnetic-plug', [MagneticPlugController::class, 'store'])->name('repair.magnetic-plug.store');

    // Tyre Management
    Route::post('tyres/bulk-store', [TyreController::class, 'bulkStore'])->name('tyres.bulk-store');
    Route::resource('tyres', TyreController::class)->except(['show']);
    Route::post('tyres/{tyre}/rotate', [TyreController::class, 'rotate'])->name('tyres.rotate');
    Route::post('tyres/{tyre}/install', [TyreController::class, 'install'])->name('tyres.install');
    Route::post('tyres/{tyre}/remove', [TyreController::class, 'remove'])->name('tyres.remove');
    Route::get('tyres/{tyre}/history', [TyreController::class, 'history'])->name('tyres.history');
    Route::get('/oil-consumption', [OilConsumptionController::class, 'index'])->name('oil-consumption.index');
    Route::post('/oil-consumption', [OilConsumptionController::class, 'store'])->name('oil-consumption.store');
    Route::put('/oil-consumption/{oilConsumption}', [OilConsumptionController::class, 'update'])->name('oil-consumption.update');
    Route::delete('/oil-consumption/{oilConsumption}', [OilConsumptionController::class, 'destroy'])->name('oil-consumption.destroy');
    Route::get('/oil-consumption/export', [OilConsumptionController::class, 'exportExcel'])->name('oil-consumption.export');
    Route::get('/oil-consumption/template', [OilConsumptionController::class, 'downloadTemplate'])->name('oil-consumption.template');
    Route::post('/oil-consumption/import', [OilConsumptionController::class, 'importExcel'])->name('oil-consumption.import');
    Route::redirect('/repair/oil-consumption', '/oil-consumption');

    // Master Control PM Service
    Route::get('/pcr-uc', [PcrController::class, 'index'])->name('pcr-uc.index');
    Route::get('/pcr-component', [PcrController::class, 'indexComponent'])->name('pcr-component.index');
    Route::get('/pcr-uc/template', [PcrController::class, 'downloadTemplate'])->name('pcr-uc.template');
    Route::get('/pcr-uc/export', [PcrController::class, 'export'])->name('pcr-uc.export');
    Route::get('/pcr-uc/export-pdf', [PcrController::class, 'exportPdf'])->name('pcr-uc.export-pdf');
    Route::get('/pcr-uc/components-by-unit', [PcrController::class, 'getComponentsByUnit'])->name('pcr-uc.components-by-unit');
    Route::post('/pcr-uc/bulk-store', [PcrController::class, 'bulkStore'])->name('pcr-uc.bulk-store');
    Route::post('/pcr-uc', [PcrController::class, 'store'])->name('pcr-uc.store');
    Route::post('/pcr-uc/import', [PcrController::class, 'import'])->name('pcr-uc.import');
    Route::put('/pcr-uc/{pcr_uc}', [PcrController::class, 'update'])->name('pcr-uc.update');
    // Conditions Component Report (CCR)
    Route::get('/ccr/{ccr}/export-pdf', [ConditionComponentReportController::class, 'exportPdf'])->name('ccr.export-pdf');
    Route::resource('ccr', ConditionComponentReportController::class);
    Route::redirect('/master-pm/condition-report', '/ccr')->name('pcr.condition-report');

    Route::redirect('/master-pm', '/pm-monitoring');

    // Plan Inspection
    Route::get('/plan-inspections', [PlanInspectionController::class, 'index'])->name('plan-inspections.index');
    Route::post('/plan-inspections/toggle', [PlanInspectionController::class, 'toggle'])->name('plan-inspections.toggle');
    Route::post('/plan-inspections/entry', [PlanInspectionController::class, 'storeEntry'])->name('plan-inspections.store-entry');
    Route::post('/plan-inspections/delete-entry', [PlanInspectionController::class, 'deleteEntry'])->name('plan-inspections.delete-entry');
    Route::get('/plan-inspections/dashboard', [PlanInspectionController::class, 'dashboard'])->name('plan-inspections.dashboard');
    Route::post('/plan-inspections/update-target', [PlanInspectionController::class, 'updateTarget'])->name('plan-inspections.update-target');
    Route::get('/plan-inspections/template', [PlanInspectionController::class, 'downloadTemplate'])->name('plan-inspections.download-template');
    Route::post('/plan-inspections/import-excel', [PlanInspectionController::class, 'importExcel'])->name('plan-inspections.import-excel');

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
