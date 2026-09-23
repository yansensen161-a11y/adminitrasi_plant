<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-backup semua data website & database setiap 5 menit
Schedule::command('app:backup-data --keep=24')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground();
