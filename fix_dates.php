<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\HourMeterLog;
use Carbon\Carbon;
use Illuminate\Contracts\Console\Kernel;

$logs = HourMeterLog::all();
$fixedCount = 0;

foreach ($logs as $log) {
    $date = Carbon::parse($log->log_date);
    if ($date->year == 2026 && $date->day == 8 && $date->month != 8) {
        $newDate = Carbon::createFromDate($date->year, 8, $date->month)->format('Y-m-d');
        $log->update(['log_date' => $newDate]);
        $fixedCount++;
    }
}

echo "Fixed $fixedCount records.";
