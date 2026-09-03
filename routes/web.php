<?php

use App\Http\Controllers\AbrController;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\BacklogController;
use App\Http\Controllers\BreakdownController;
use App\Http\Controllers\ClaimWarrantyController;
use App\Http\Controllers\ConditionComponentReportController;
use App\Http\Controllers\ForecastPaController;
use App\Http\Controllers\HistoricalServiceController;
use App\Http\Controllers\HistoricalTyreController;
use App\Http\Controllers\HourMeterController;
use App\Http\Controllers\JadwalCutiController;
use App\Http\Controllers\JobOutsideRepairController;
use App\Http\Controllers\ListPopulasiController;
use App\Http\Controllers\MagneticPlugController;
use App\Http\Controllers\MaintenanceOrderController;
use App\Http\Controllers\ManpowerBudgetController;
use App\Http\Controllers\ManpowerController;
use App\Http\Controllers\MasterPmController;
use App\Http\Controllers\OilConsumptionController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\P2hController;
use App\Http\Controllers\PartCanibalController;
use App\Http\Controllers\PcrController;
use App\Http\Controllers\PengajuanCutiController;
use App\Http\Controllers\PerhitunganManpowerController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PlanServiceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RosterController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SlipGajiController;
use App\Http\Controllers\SosPapController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
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

    // Hour Meter Daily Logs (Plant Operations)
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

    // User & Access Management
    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);

    // Audit & Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');

    // Dynamic Settings
    Route::get('/settings/mail', [SettingController::class, 'index'])->name('settings.mail');
    Route::post('/settings/mail', [SettingController::class, 'update'])->name('settings.mail.update');
    Route::post('/settings/test-mail', [SettingController::class, 'sendTestMail'])->name('settings.mail.test');

    // Reports (DomPDF)
    Route::get('/reports/users/pdf', [ReportController::class, 'usersPdf'])->name('reports.users.pdf');

    // Service Order Plant & Monitoring
    Route::get('/service-orders', [ServiceOrderController::class, 'index'])->name('service-orders.index');

    Route::get('/monitoring-orders/check-history', [MaintenanceOrderController::class, 'checkHistory'])->name('monitoring-orders.check-history');
    Route::get('/monitoring-orders/find-by-no', [MaintenanceOrderController::class, 'findByNo'])->name('monitoring-orders.find-by-no');
    Route::get('/monitoring-orders', [MaintenanceOrderController::class, 'index'])->name('monitoring-orders.index');
    Route::post('/monitoring-orders', [MaintenanceOrderController::class, 'store'])->name('monitoring-orders.store');
    Route::post('/monitoring-orders/{monitoring_order}', [MaintenanceOrderController::class, 'update'])->name('monitoring-orders.update');
    Route::delete('/monitoring-orders/{monitoring_order}', [MaintenanceOrderController::class, 'destroy'])->name('monitoring-orders.destroy');
    Route::post('/monitoring-orders/import', [MaintenanceOrderController::class, 'import'])->name('monitoring-orders.import');
    Route::get('/monitoring-orders/download-template', [MaintenanceOrderController::class, 'downloadTemplate'])->name('monitoring-orders.download-template');

    Route::get('/part-canibals', [PartCanibalController::class, 'index'])->name('part-canibals.index');
    Route::post('/part-canibals', [PartCanibalController::class, 'store'])->name('part-canibals.store');
    Route::get('/monitoring/p2h', [P2hController::class, 'index'])->name('p2h.index');

    // Plan Service & Master PM
    Route::get('/plan-service', [PlanServiceController::class, 'index'])->name('plan-service.index');
    Route::post('/plan-service/{unit}/complete', [PlanServiceController::class, 'complete'])->name('plan-service.complete');

    // Backlog
    Route::resource('backlogs', BacklogController::class);

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
    Route::get('/repair/oil-consumption', [OilConsumptionController::class, 'index'])->name('repair.oil-consumption');

    // Master Control PM Service
    Route::get('/pcr-uc', [PcrController::class, 'index'])->name('pcr-uc.index');
    Route::get('/master-pm/condition-report', [ConditionComponentReportController::class, 'index'])->name('pcr.condition-report');

    Route::get('/master-pm', [MasterPmController::class, 'index'])->name('master-pm.index');
    Route::post('/master-pm/{master_pm}/toggle', [MasterPmController::class, 'toggle'])->name('master-pm.toggle');

    // ABR
    Route::resource('abr', AbrController::class);
});

require __DIR__.'/auth.php';
