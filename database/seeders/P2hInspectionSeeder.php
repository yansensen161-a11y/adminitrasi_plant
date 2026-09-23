<?php

namespace Database\Seeders;

use App\Models\P2hInspection;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class P2hInspectionSeeder extends Seeder
{
    public function run(): void
    {
        $units = Unit::where('code_unit', 'not like', 'BOX%')
            ->where('code_unit', 'not like', 'Chainsaw%')
            ->get()
            ->keyBy('code_unit');

        $sampleFindings = [
            [
                'code_unit' => 'A-07',
                'date' => Carbon::now()->subDays(1)->format('Y-m-d'),
                'hm' => 142812.0,
                'component_group' => 'UNDERCARRIAGE',
                'component_name' => 'Track Shoe Bolt',
                'priority' => 'P2',
                'finding' => 'Baut track shoe longgar sebelah kiri',
                'inspect_by' => 'Mekanik Rian',
                'action' => 'Kencangkan baut track shoe sesuai torsi',
                'closed_by' => null,
                'status' => 'OPEN',
            ],
            [
                'code_unit' => 'A-08',
                'date' => Carbon::now()->subDays(4)->format('Y-m-d'),
                'hm' => 8450.5,
                'component_group' => 'HYDRAULIC SYSTEM',
                'component_name' => 'Hydraulic Tank / Level Gauge',
                'priority' => 'P1',
                'finding' => 'Level oli hydraulic di bawah batas LOW & indikator menyala',
                'inspect_by' => 'Supardi',
                'action' => 'Tambah oli hydraulic Tellus 46 & cek potensi kebocoran hose',
                'closed_by' => null,
                'status' => 'OPEN',
            ],
            [
                'code_unit' => 'B-02',
                'date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'hm' => 11200.0,
                'component_group' => 'ELECTRIC SYSTEM',
                'component_name' => 'Working Lamp Front Left',
                'priority' => 'P3',
                'finding' => 'Lampu kerja depan kiri mati saat dinyalakan',
                'inspect_by' => 'Agus P.',
                'action' => 'Ganti bohlam LED 24V dan cek fuse',
                'closed_by' => 'Foreman Budi',
                'status' => 'CLOSED',
            ],
            [
                'code_unit' => 'B-10',
                'date' => Carbon::now()->subDays(3)->format('Y-m-d'),
                'hm' => 9630.0,
                'component_group' => 'HYDRAULIC SYSTEM',
                'component_name' => 'Hose Tilt Cylinder',
                'priority' => 'P1',
                'finding' => 'Kebocoran oli pada hose tilt cylinder saat boom beroperasi',
                'inspect_by' => 'Joko S.',
                'action' => 'Perbaiki sambungan fitting hose dan ganti seal o-ring',
                'closed_by' => null,
                'status' => 'PROGRESS',
            ],
            [
                'code_unit' => 'B-16',
                'date' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'hm' => 12500.2,
                'component_group' => 'TYRE',
                'component_name' => 'Front Right Tyre',
                'priority' => 'P2',
                'finding' => 'Tekanan angin ban depan kanan kurang (35 PSI) dari standar 50 PSI',
                'inspect_by' => 'Mekanik Rian',
                'action' => 'Tambah tekanan angin ban dan periksa pentil tubeless',
                'closed_by' => 'Supervisor Dian',
                'status' => 'CLOSED',
            ],
            [
                'code_unit' => 'D-09',
                'date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'hm' => 7800.0,
                'component_group' => 'ENGINE',
                'component_name' => 'Engine Assembly / Valve',
                'priority' => 'P1',
                'finding' => 'Suara knocking abnormal pada area engine saat rpm tinggi',
                'inspect_by' => 'Supardi',
                'action' => 'Lakukan pengecekan valve clearance dan filter solar',
                'closed_by' => null,
                'status' => 'PROGRESS',
            ],
            [
                'code_unit' => 'D-19',
                'date' => Carbon::now()->subDays(1)->format('Y-m-d'),
                'hm' => 6540.8,
                'component_group' => 'AC SYSTEM',
                'component_name' => 'Cabin AC Blower / Filter',
                'priority' => 'P3',
                'finding' => 'AC kabin kurang dingin & filter kabin kotor berdebu',
                'inspect_by' => 'Agus P.',
                'action' => 'Bersihkan filter AC kabin dan cek freon',
                'closed_by' => null,
                'status' => 'OPEN',
            ],
            [
                'code_unit' => 'D-21',
                'date' => Carbon::now()->subDays(6)->format('Y-m-d'),
                'hm' => 13410.0,
                'component_group' => 'ATTACHMENT',
                'component_name' => 'Bucket Bracket',
                'priority' => 'P2',
                'finding' => 'Retak halus pada bracket bucket samping kanan',
                'inspect_by' => 'Mekanik Hendra',
                'action' => 'Lakukan gouging dan pengelasan ulang dengan elektroda LB-52',
                'closed_by' => 'Foreman Budi',
                'status' => 'CLOSED',
            ],
            [
                'code_unit' => 'E-02',
                'date' => Carbon::now()->subDays(2)->format('Y-m-d'),
                'hm' => 8900.5,
                'component_group' => 'COOLING SYSTEM',
                'component_name' => 'Radiator Coolant',
                'priority' => 'P2',
                'finding' => 'Kondisi air radiator keruh & level reservoir dekat batas bawah',
                'inspect_by' => 'Joko S.',
                'action' => 'Drain radiator dan isi ulang coolant ethylene glycol 50:50',
                'closed_by' => null,
                'status' => 'PROGRESS',
            ],
            [
                'code_unit' => 'F-05',
                'date' => Carbon::now()->subDays(7)->format('Y-m-d'),
                'hm' => 10210.0,
                'component_group' => 'GREASING',
                'component_name' => 'Arm Pin Grease Nipple',
                'priority' => 'P3',
                'finding' => 'Grease nipple arm pin patah saat pemompaan grease rutin',
                'inspect_by' => 'Supardi',
                'action' => 'Ganti grease nipple 1/8 inch baru dan beri grease EP-2',
                'closed_by' => 'Foreman Budi',
                'status' => 'CLOSED',
            ],
        ];

        $num = 1;
        foreach ($sampleFindings as $item) {
            $unit = $units->get($item['code_unit']) ?? Unit::where('code_unit', $item['code_unit'])->first();
            $woNumber = 'PLT/WO/INS/'.str_pad($num, 3, '0', STR_PAD_LEFT);

            P2hInspection::create([
                'wo_number' => $woNumber,
                'date' => $item['date'],
                'unit_id' => $unit?->id,
                'code_unit' => $item['code_unit'],
                'model' => $unit?->model ?: 'Heavy Equipment',
                'component_group' => $item['component_group'],
                'component_name' => $item['component_name'],
                'priority' => $item['priority'],
                'hm' => $item['hm'],
                'hour_meter' => number_format((float) $item['hm'], 1),
                'finding' => $item['finding'],
                'inspect_by' => $item['inspect_by'],
                'action' => $item['action'],
                'closed_by' => $item['closed_by'],
                'closed_at' => $item['status'] === 'CLOSED' ? Carbon::now()->subDays(1)->format('Y-m-d') : null,
                'status' => $item['status'],
                'shift' => 'Shift 1',
                'notes' => $item['finding'],
            ]);

            $num++;
        }
    }
}
