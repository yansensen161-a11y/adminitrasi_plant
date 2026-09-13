<?php

use App\Models\MaintenanceOrder;
use App\Models\Unit;
use Illuminate\Contracts\Console\Kernel;

require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

try {
    $unit = Unit::first();
    $order = MaintenanceOrder::create([
        'no_order' => 'TEST',
        'tanggal' => '2026-09-08',
        'unit_id' => $unit->id,
        'hm' => '100',
        'lokasi' => '-',
        'component' => '-',
        'priority' => 'BACKLOG',
        'status' => 'WAITING PART',
        'pic' => '-',
        'root_cause' => '-',
        'action_taken' => '-',
    ]);
    echo 'Created: '.$order->id."\n";
} catch (Exception $e) {
    echo 'Error: '.$e->getMessage()."\n";
}
