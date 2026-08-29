<?php

namespace Database\Seeders;

use App\Models\HourMeterLog;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class HourMeterSeeder extends Seeder
{
    public function run(): void
    {
        $currentMonthYear = date('Y-m');

        $sampleLogs = [
            [
                'code_unit' => 'EX-201',
                'log_date' => "{$currentMonthYear}-10",
                'hm_start' => 4512.0,
                'hm_end' => 4520.5,
                'hm_total' => 8.5,
                'shift' => 'Shift 1',
                'operator_name' => 'Budi Santoso',
                'location' => 'Site Sangatta',
                'remarks' => 'Operasi normal loading overburden',
            ],
            [
                'code_unit' => 'EX-201',
                'log_date' => "{$currentMonthYear}-09",
                'hm_start' => 4504.0,
                'hm_end' => 4512.0,
                'hm_total' => 8.0,
                'shift' => 'Shift 1',
                'operator_name' => 'Budi Santoso',
                'location' => 'Site Sangatta',
                'remarks' => 'Operasi normal',
            ],
            [
                'code_unit' => 'EX-201',
                'log_date' => "{$currentMonthYear}-08",
                'hm_start' => 4496.0,
                'hm_end' => 4504.0,
                'hm_total' => 8.0,
                'shift' => 'Shift 1',
                'operator_name' => 'Budi Santoso',
                'location' => 'Site Sangatta',
                'remarks' => 'Operasi normal',
            ],
            [
                'code_unit' => 'DT-101',
                'log_date' => "{$currentMonthYear}-10",
                'hm_start' => 8132.0,
                'hm_end' => 8140.0,
                'hm_total' => 8.0,
                'shift' => 'Shift 1',
                'operator_name' => 'Ahmad Dani',
                'location' => 'Pit Central',
                'remarks' => 'Hauling batu bara ke ROM stockpile',
            ],
            [
                'code_unit' => 'DT-101',
                'log_date' => "{$currentMonthYear}-09",
                'hm_start' => 8124.0,
                'hm_end' => 8132.0,
                'hm_total' => 8.0,
                'shift' => 'Shift 1',
                'operator_name' => 'Ahmad Dani',
                'location' => 'Pit Central',
                'remarks' => 'Hauling material normal',
            ],
            [
                'code_unit' => 'DT-101',
                'log_date' => "{$currentMonthYear}-08",
                'hm_start' => 8116.0,
                'hm_end' => 8124.0,
                'hm_total' => 8.0,
                'shift' => 'Shift 1',
                'operator_name' => 'Ahmad Dani',
                'location' => 'Pit Central',
                'remarks' => 'Hauling material normal',
            ],
            [
                'code_unit' => 'DZ-005',
                'log_date' => "{$currentMonthYear}-10",
                'hm_start' => 6320.2,
                'hm_end' => 6320.2,
                'hm_total' => 0.0,
                'shift' => 'Day Shift',
                'operator_name' => 'Joko Purwanto',
                'location' => 'Workshop Central',
                'remarks' => 'Breakdown menunggu seal cylinder lift',
            ],
            [
                'code_unit' => 'WL-012',
                'log_date' => "{$currentMonthYear}-10",
                'hm_start' => 5112.0,
                'hm_end' => 5120.0,
                'hm_total' => 8.0,
                'shift' => 'Shift 2',
                'operator_name' => 'Hendro Siswanto',
                'location' => 'Port Loading Area',
                'remarks' => 'Loading batu bara ke tongkang',
            ],
            [
                'code_unit' => 'WL-012',
                'log_date' => "{$currentMonthYear}-09",
                'hm_start' => 5104.0,
                'hm_end' => 5112.0,
                'hm_total' => 8.0,
                'shift' => 'Shift 2',
                'operator_name' => 'Hendro Siswanto',
                'location' => 'Port Loading Area',
                'remarks' => 'Loading batu bara ke tongkang',
            ],
            [
                'code_unit' => 'WL-012',
                'log_date' => "{$currentMonthYear}-08",
                'hm_start' => 5096.0,
                'hm_end' => 5104.0,
                'hm_total' => 8.0,
                'shift' => 'Shift 2',
                'operator_name' => 'Hendro Siswanto',
                'location' => 'Port Loading Area',
                'remarks' => 'Loading batu bara ke tongkang',
            ],
        ];

        foreach ($sampleLogs as $log) {
            $unit = Unit::where('code_unit', $log['code_unit'])->first();
            $log['unit_id'] = $unit?->id;
            HourMeterLog::create($log);
        }
    }
}
