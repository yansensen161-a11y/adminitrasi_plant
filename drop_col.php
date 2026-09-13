<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('breakdowns', function (Blueprint $table) {
    if (Schema::hasColumn('breakdowns', 'maintenance_order_id')) {
        $table->dropColumn('maintenance_order_id');
    }
});
echo 'Done';
