<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterPmController extends Controller
{
    public function index(Request $request)
    {
        // Paginasi unit asli untuk daftar dasar
        $unitsQuery = Unit::query();
        $paginatedUnits = $unitsQuery->paginate(10);

        // Transform the collection to include dummy data matching the new Decoupled PM schema
        $transformedData = $paginatedUnits->getCollection()->map(function ($unit, $index) {
            $baseHm = rand(1000, 15000);
            $ns1Hm = ceil($baseHm / 1000) * 1000 + (rand(0, 1) == 1 ? 500 : 0);
            $sisa1 = $ns1Hm - $baseHm;

            $ns1Status = $sisa1 < 0 ? 'OVERDUE' : ($sisa1 <= 500 ? 'DUE SOON' : 'ON SCHEDULE');

            $ns2Hm = $ns1Hm + (rand(0, 1) == 1 ? 1000 : 2000);
            $sisa2 = $ns2Hm - $baseHm;
            $ns2Status = 'ON SCHEDULE'; // Usually ns2 is on schedule

            return [
                'id' => $unit->id,
                'code_unit' => $unit->code_unit ?? ('ME0'.rand(10, 99)),
                'equipment' => $unit->equipment_capacity ?? 'EXCAVATOR '.rand(2, 5).'.0 M³',
                'current_hm' => $baseHm,
                'next_service_1' => [
                    'hm' => $ns1Hm,
                    'sisa_hm' => $sisa1,
                    'status' => $ns1Status,
                ],
                'next_service_2' => [
                    'hm' => $ns2Hm,
                    'sisa_hm' => $sisa2,
                    'status' => $ns2Status,
                ],
                'temuan' => rand(0, 3),
                'backlog' => rand(0, 2),
                'sos_pap' => rand(0, 1),
                'status_terakhir' => date('d/m/Y', strtotime('-'.rand(1, 60).' days')),
            ];
        });

        // Re-assign the transformed collection to the paginator
        $paginatedUnits->setCollection($transformedData);

        // Dummy stats for the top KPI cards
        $kpi = [
            'total_unit' => [
                'total' => 126,
                'aktif' => 118,
                'standby' => 6,
                'bd' => 2,
            ],
            'plan_service_due' => [
                'total' => 24,
                'due_soon' => 17,
                'overdue' => 7,
            ],
            'temuan' => [
                'total' => 17,
                'open' => 11,
                'process' => 4,
                'closed' => 2,
            ],
            'backlog' => [
                'total' => 23,
                'overdue' => 18,
                'on_schedule' => 5,
            ],
            'sos_pap' => [
                'total' => 12,
                'open' => 9,
                'process' => 3,
                'closed' => 0,
            ],
        ];

        // Chart Data
        $charts = [
            'status_plan' => [
                'on_schedule' => 93,
                'due_soon' => 17,
                'overdue' => 7,
            ],
            'sumber_pekerjaan' => [
                'temuan' => 17,
                'backlog' => 23,
                'sos_pap' => 12,
            ],
            'progress' => [
                'open' => 28,
                'plan' => 12,
                'waiting_part' => 7,
                'on_progress' => 9,
                'completed' => 15,
            ],
            'top_5_overdue' => [
                ['unit' => 'MSC001', 'current_hm' => 7550, 'overdue_hm' => 4000],
                ['unit' => 'ME053', 'current_hm' => 4800, 'overdue_hm' => 2000],
                ['unit' => 'ME056', 'current_hm' => 2200, 'overdue_hm' => 1000],
                ['unit' => 'ME052', 'current_hm' => 1800, 'overdue_hm' => 2000],
                ['unit' => 'ME059', 'current_hm' => 480, 'overdue_hm' => 2000],
            ],
        ];

        return Inertia::render('MasterPm/Index', [
            'units' => $paginatedUnits,
            'kpi' => $kpi,
            'charts' => $charts,
        ]);
    }
}
