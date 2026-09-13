<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ForecastPaController extends Controller
{
    public function index()
    {
        // KPI Cards
        $kpiBudget = [
            'total_forecast' => ['amount' => '12,650,000,000', 'vs_realisasi' => '8.5%', 'color' => '#3b82f6'],
            'planned_maintenance' => ['amount' => '7,820,000,000', 'pct' => '61.8%', 'color' => '#10b981'],
            'corrective_maintenance' => ['amount' => '3,950,000,000', 'pct' => '31.2%', 'color' => '#facc15'],
            'project_improvement' => ['amount' => '880,000,000', 'pct' => '7.0%', 'color' => '#ef4444'],
        ];

        // Charts Data
        $chartForecastRealisasi = [
            'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            'forecast' => [1000, 1030, 1060, 1090, 1060, 1100, 1100, 1140, 1120, 1070, 1040, 1010],
            'realisasi' => [920, 950, 980, 990, 970, 1000, 1010, 1050, 1020, 980, 960, 930],
        ];

        $chartDistribusiKategori = [
            ['name' => 'Planned Maintenance', 'value' => 7820, 'pct' => '61.8%', 'color' => '#10b981'],
            ['name' => 'Corrective Maintenance', 'value' => 3950, 'pct' => '31.2%', 'color' => '#3b82f6'],
            ['name' => 'Project / Improvement', 'value' => 880, 'pct' => '7.0%', 'color' => '#facc15'],
        ];

        $chartTopUnit = [
            ['name' => 'Excavator', 'value' => 3250, 'color' => '#10b981'],
            ['name' => 'Hauler', 'value' => 2480, 'color' => '#3b82f6'],
            ['name' => 'Dozer', 'value' => 1560, 'color' => '#facc15'],
            ['name' => 'Motor Grader', 'value' => 1120, 'color' => '#ef4444'],
            ['name' => 'Truck', 'value' => 980, 'color' => '#8b5cf6'],
        ];

        // Main Table: Detail Forecast Budget Monthly
        $tableDetailForecast = [
            ['no' => 1, 'bulan' => 'Jan', 'planned' => '620,000,000', 'corrective' => '310,000,000', 'project' => '70,000,000', 'total' => '1,000,000,000', 'realisasi' => '920,000,000', 'selisih' => '+8.7%', 'status' => 'On Track'],
            ['no' => 2, 'bulan' => 'Feb', 'planned' => '640,000,000', 'corrective' => '320,000,000', 'project' => '70,000,000', 'total' => '1,030,000,000', 'realisasi' => '950,000,000', 'selisih' => '+8.4%', 'status' => 'On Track'],
            ['no' => 3, 'bulan' => 'Mar', 'planned' => '650,000,000', 'corrective' => '340,000,000', 'project' => '70,000,000', 'total' => '1,060,000,000', 'realisasi' => '980,000,000', 'selisih' => '+8.2%', 'status' => 'On Track'],
            ['no' => 4, 'bulan' => 'Apr', 'planned' => '670,000,000', 'corrective' => '350,000,000', 'project' => '70,000,000', 'total' => '1,090,000,000', 'realisasi' => '990,000,000', 'selisih' => '+10.1%', 'status' => 'On Track'],
            ['no' => 5, 'bulan' => 'May', 'planned' => '660,000,000', 'corrective' => '330,000,000', 'project' => '70,000,000', 'total' => '1,060,000,000', 'realisasi' => '970,000,000', 'selisih' => '+9.3%', 'status' => 'On Track'],
            ['no' => 6, 'bulan' => 'Jun', 'planned' => '670,000,000', 'corrective' => '360,000,000', 'project' => '70,000,000', 'total' => '1,100,000,000', 'realisasi' => '1,000,000,000', 'selisih' => '+10.0%', 'status' => 'On Track'],
            ['no' => 7, 'bulan' => 'Jul', 'planned' => '680,000,000', 'corrective' => '350,000,000', 'project' => '70,000,000', 'total' => '1,100,000,000', 'realisasi' => '1,010,000,000', 'selisih' => '+8.9%', 'status' => 'On Track'],
            ['no' => 8, 'bulan' => 'Aug', 'planned' => '700,000,000', 'corrective' => '370,000,000', 'project' => '70,000,000', 'total' => '1,140,000,000', 'realisasi' => '1,050,000,000', 'selisih' => '+8.6%', 'status' => 'On Track'],
            ['no' => 9, 'bulan' => 'Sep', 'planned' => '690,000,000', 'corrective' => '360,000,000', 'project' => '70,000,000', 'total' => '1,120,000,000', 'realisasi' => '1,020,000,000', 'selisih' => '+9.8%', 'status' => 'On Track'],
            ['no' => 10, 'bulan' => 'Oct', 'planned' => '660,000,000', 'corrective' => '340,000,000', 'project' => '70,000,000', 'total' => '1,070,000,000', 'realisasi' => '980,000,000', 'selisih' => '+9.2%', 'status' => 'On Track'],
            ['no' => 11, 'bulan' => 'Nov', 'planned' => '650,000,000', 'corrective' => '320,000,000', 'project' => '70,000,000', 'total' => '1,040,000,000', 'realisasi' => '960,000,000', 'selisih' => '+8.3%', 'status' => 'On Track'],
            ['no' => 12, 'bulan' => 'Dec', 'planned' => '640,000,000', 'corrective' => '300,000,000', 'project' => '70,000,000', 'total' => '1,010,000,000', 'realisasi' => '930,000,000', 'selisih' => '+8.6%', 'status' => 'On Track'],
        ];

        // Bottom Panels
        $rekapDepartment = [
            ['no' => 1, 'dept' => 'Plant', 'forecast' => '8,950,000,000', 'pct' => '70.8%'],
            ['no' => 2, 'dept' => 'Workshop', 'forecast' => '2,150,000,000', 'pct' => '17.0%'],
            ['no' => 3, 'dept' => 'Tyre', 'forecast' => '980,000,000', 'pct' => '7.8%'],
            ['no' => 4, 'dept' => 'Electrical', 'forecast' => '570,000,000', 'pct' => '4.5%'],
        ];

        $rekapKategori = [
            ['no' => 1, 'kategori' => 'Planned Maintenance', 'forecast' => '7,820,000,000', 'pct' => '61.8%'],
            ['no' => 2, 'kategori' => 'Corrective Maintenance', 'forecast' => '3,950,000,000', 'pct' => '31.2%'],
            ['no' => 3, 'kategori' => 'Project / Improvement', 'forecast' => '880,000,000', 'pct' => '7.0%'],
        ];

        return Inertia::render('ForecastPa/Index', [
            'kpiBudget' => $kpiBudget,
            'chartForecastRealisasi' => $chartForecastRealisasi,
            'chartDistribusiKategori' => $chartDistribusiKategori,
            'chartTopUnit' => $chartTopUnit,
            'tableDetailForecast' => $tableDetailForecast,
            'rekapDepartment' => $rekapDepartment,
            'rekapKategori' => $rekapKategori,
        ]);
    }
}
