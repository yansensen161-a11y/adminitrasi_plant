<?php

use App\Models\MaintenanceOrder;
use App\Models\Unit;
use Illuminate\Contracts\Console\Kernel;

require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

try {
    $unit1 = Unit::where('code_unit', 'OHT120')->first();
    $unit2 = Unit::where('code_unit', 'OHT070')->first();

    $order1 = MaintenanceOrder::create([
        'no_order' => 'HW MOL 01368',
        'tanggal' => '2026-09-01',
        'unit_id' => $unit1->id,
        'hm' => null,
        'lokasi' => '-',
        'component' => '-',
        'priority' => 'BACKLOG',
        'status' => 'COMPLETED',
        'pic' => '-',
        'root_cause' => '-',
        'action_taken' => 'TEST',
    ]);
    echo 'Order1 Created: '.$order1->id."\n";

    $order2 = MaintenanceOrder::create([
        'no_order' => 'HW MOL 01375',
        'tanggal' => '2026-09-01',
        'unit_id' => $unit2->id,
        'hm' => null,
        'lokasi' => '-',
        'component' => '-',
        'priority' => 'BACKLOG',
        'status' => 'WAITING PART',
        'pic' => '-',
        'root_cause' => '-',
        'action_taken' => 'TEST',
    ]);
    echo 'Order2 Created: '.$order2->id."\n";

    echo 'Total orders: '.MaintenanceOrder::count()."\n";

} catch (Exception $e) {
    echo 'Error: '.$e->getMessage()."\n";
}
