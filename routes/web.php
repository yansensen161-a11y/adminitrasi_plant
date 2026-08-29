<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\HourMeterController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\PlanServiceController;
use App\Http\Controllers\AbrController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\ManpowerBudgetController;

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
    // Plan Service
    Route::get('/plan-service', [App\Http\Controllers\PlanServiceController::class, 'index'])->name('plan-service.index');
    Route::post('/plan-service/{unit}/complete', [App\Http\Controllers\PlanServiceController::class, 'complete'])->name('plan-service.complete');

    // ABR
    Route::resource('abr', App\Http\Controllers\AbrController::class);
});

require __DIR__.'/auth.php';
