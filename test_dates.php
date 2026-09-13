<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$dates = \App\Models\HourMeterLog::selectRaw('DATE(log_date) as date, count(*) as c')
    ->groupBy('date')
    ->orderBy('date', 'desc')
    ->get();
foreach($dates as $d) echo $d->date . ' : ' . $d->c . "\n";
