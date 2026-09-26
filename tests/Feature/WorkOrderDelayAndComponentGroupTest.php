<?php

namespace Tests\Feature;

use App\Imports\BreakdownImport;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderTask;
use App\Services\WorkOrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkOrderDelayAndComponentGroupTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'super-admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_work_order_stores_delay_and_task_component_group(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'EX01',
            'model' => 'CAT 320D',
            'type_unit' => 'EXCAVATOR',
            'hm' => 1000,
        ]);

        $payload = [
            'no_wo' => 'PLT/WO/CM/991',
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'CM - CORRECTIVE MAINTENANCE',
            'status_pengerjaan' => 'OPEN',
            'downtime_code' => 'Unschedule',
            'unit_id' => $unit->id,
            'site' => 'Site A',
            'waktu_breakdown' => '2026-09-21 08:00:00',
            'waktu_rfu' => '2026-09-21 18:00:00',
            'durasi_hrs' => 10.0,
            'problem' => 'Engine overheated',
            'tasks' => [
                [
                    'group_component' => 'ENGINE',
                    'component' => 'ENGINE',
                    'task_description' => 'Check radiator coolant',
                    'problem' => 'Coolant low',
                    'activity_progress' => 'Refilled coolant and pressure tested',
                    'mechanic' => 'John Doe',
                    'start_date' => '2026-09-21 09:00',
                    'end_date' => '2026-09-21 13:00',
                    'downtime_hrs' => 4.0,
                    'status' => 'B0 - On Progress',
                ],
                [
                    'group_component' => 'COOLING SYSTEM',
                    'component' => 'COOLING SYSTEM',
                    'task_description' => 'Replace thermostat',
                    'problem' => 'Thermostat stuck closed',
                    'activity_progress' => 'Replaced with new thermostat',
                    'mechanic' => 'Jane Smith',
                    'start_date' => '2026-09-21 13:00',
                    'end_date' => '2026-09-21 15:30',
                    'downtime_hrs' => 2.5,
                    'status' => 'B0 - On Progress',
                ],
            ],
        ];

        $response = $this->actingAs($user)->post(route('work-orders.store'), $payload);
        $response->assertRedirect();

        $wo = WorkOrder::where('no_wo', 'PLT/WO/CM/991')->firstOrFail();
        // Total downtime = 10, total pekerjaan = 4 + 2.5 = 6.5 => delay = 3.5
        $this->assertEquals(3.5, (float) $wo->delay);
        $this->assertEquals('ENGINE', $wo->component);

        $this->assertCount(2, $wo->tasks);
        $this->assertEquals('ENGINE', $wo->tasks[0]->group_component);
        $this->assertEquals('COOLING SYSTEM', $wo->tasks[1]->group_component);
    }

    public function test_work_order_update_recalculates_delay(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'EX02',
            'model' => 'CAT 320D',
            'type_unit' => 'EXCAVATOR',
            'hm' => 1200,
        ]);

        $wo = WorkOrder::create([
            'no_wo' => 'PLT/WO/CM/992',
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'CM - CORRECTIVE MAINTENANCE',
            'status_pengerjaan' => 'OPEN',
            'downtime_code' => 'Unschedule',
            'unit_id' => $unit->id,
            'site' => 'Site A',
            'waktu_breakdown' => '2026-09-21 08:00:00',
            'waktu_rfu' => '2026-09-21 16:00:00',
            'durasi_hrs' => 8.0,
            'delay' => 2.0,
            'component' => 'HYDRAULIC SYSTEM',
        ]);

        $task = WorkOrderTask::create([
            'work_order_id' => $wo->id,
            'group_component' => 'HYDRAULIC SYSTEM',
            'component' => 'HYDRAULIC SYSTEM',
            'task_description' => 'Fix hose',
            'problem' => 'Hose leaking',
            'activity_progress' => 'Replaced hose',
            'mechanic' => 'John Doe',
            'downtime_hrs' => 6.0,
            'status' => 'B0 - On Progress',
        ]);

        // Update with durasi_hrs = 12, total pekerjaan = 6 => delay should become 6.0
        $updatePayload = [
            'no_wo' => 'PLT/WO/CM/992',
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'CM - CORRECTIVE MAINTENANCE',
            'status_pengerjaan' => 'OPEN',
            'downtime_code' => 'Unschedule',
            'unit_id' => $unit->id,
            'site' => 'Site A',
            'waktu_breakdown' => '2026-09-21 08:00:00',
            'waktu_rfu' => '2026-09-21 20:00:00',
            'durasi_hrs' => 12.0,
            'tasks' => [
                [
                    'id' => $task->id,
                    'group_component' => 'HYDRAULIC SYSTEM',
                    'component' => 'HYDRAULIC SYSTEM',
                    'task_description' => 'Fix hose',
                    'problem' => 'Hose leaking',
                    'activity_progress' => 'Replaced hose',
                    'mechanic' => 'John Doe',
                    'downtime_hrs' => 6.0,
                    'status' => 'B0 - On Progress',
                ],
            ],
        ];

        $response = $this->actingAs($user)->put(route('work-orders.update', $wo->id), $updatePayload);
        $response->assertRedirect();

        $wo->refresh();
        $this->assertEquals(6.0, (float) $wo->delay);
    }

    public function test_download_template_breakdown_can_be_downloaded(): void
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)->get(route('work-orders.download-template-breakdown'));
        $response->assertOk();
        $this->assertTrue(str_contains(
            $response->headers->get('content-disposition', ''),
            'Template_Import_Breakdown.xlsx'
        ));
    }

    public function test_breakdown_import_saves_component_group_into_work_order_and_task(): void
    {
        $unit = Unit::create([
            'code_unit' => 'EX99',
            'model' => 'CAT 330D',
            'type_unit' => 'EXCAVATOR',
            'hm' => 8500,
        ]);

        $import = new BreakdownImport;
        $import->collection(collect([
            [
                'code_unit' => 'EX99',
                'tipe_wo' => 'CM - CORRECTIVE MAINTENANCE',
                'status_wo' => 'IN PROGRESS - SEDANG DIKERJAKAN',
                'down_status' => 'B0 - ON PROGRESS',
                'component_group' => 'HYDRAULIC SYSTEM',
                'tanggal' => '2026-09-24',
                'jam_breakdown' => '10:00',
                'jam_ready' => '14:30',
                'hm_unit' => 8500,
                'problem' => 'Boom cylinder seal leaking',
                'corrective_action' => 'Replace cylinder seal kit',
                'downtime_code' => 'Unschedule',
                'site' => 'Harindo Wahana',
                'pic' => 'Ahmad Mekanik',
            ],
        ]));

        $wo = WorkOrder::where('unit_id', $unit->id)->latest('id')->firstOrFail();
        $this->assertEquals('HYDRAULIC SYSTEM', $wo->component);
        $this->assertEquals('HYDRAULIC SYSTEM', $wo->component_group);

        $task = $wo->tasks->first();
        $this->assertNotNull($task);
        $this->assertEquals('HYDRAULIC SYSTEM', $task->group_component);
        $this->assertEquals('HYDRAULIC SYSTEM', $task->component);
    }

    public function test_breakdown_import_normalizes_indonesian_component_group(): void
    {
        $unit = Unit::create([
            'code_unit' => 'DT88',
            'model' => 'FM 440',
            'type_unit' => 'DUMP TRUCK',
            'hm' => 4500,
        ]);

        $import = new BreakdownImport;
        $import->collection(collect([
            [
                'code_unit' => 'DT88',
                'component_group' => 'transmisi',
                'tanggal' => '2026-09-24',
                'jam_breakdown' => '08:00',
                'problem' => 'Slip gigi 3',
            ],
        ]));

        $wo = WorkOrder::where('unit_id', $unit->id)->latest('id')->firstOrFail();
        $this->assertEquals('TRANSMISSION', $wo->component);
        $this->assertEquals('TRANSMISSION', $wo->component_group);
        $this->assertEquals('TRANSMISSION', $wo->tasks->first()?->group_component);
    }

    public function test_breakdown_import_supports_date_rfu_and_calculates_cross_day_duration(): void
    {
        $unit = Unit::create([
            'code_unit' => 'EX77',
            'model' => 'PC200',
            'type_unit' => 'EXCAVATOR',
            'hm' => 6000,
        ]);

        $import = new BreakdownImport;
        $import->collection(collect([
            [
                'code_unit' => 'EX77',
                'tipe_wo' => 'CM - CORRECTIVE MAINTENANCE',
                'status_wo' => 'COMPLETED - PEKERJAAN SELESAI',
                'down_status' => 'B0 - ON PROGRESS',
                'component_group' => 'ENGINE',
                'tanggal' => '2026-09-20',
                'jam_breakdown' => '08:00',
                'date_rfu' => '2026-09-22',
                'jam_ready' => '12:00',
                'problem' => 'Engine overhaul',
            ],
        ]));

        $wo = WorkOrder::where('unit_id', $unit->id)->latest('id')->firstOrFail();
        $this->assertNotNull($wo->waktu_rfu);
        $this->assertEquals('2026-09-22 12:00:00', $wo->waktu_rfu->format('Y-m-d H:i:s'));
        $this->assertEquals(52.0, (float) $wo->durasi_hrs);
        $this->assertEquals('COMPLETED - PEKERJAAN SELESAI', $wo->status_pengerjaan);

        $task = $wo->tasks->first();
        $this->assertEquals('2026-09-22 12:00:00', $task->end_date->format('Y-m-d H:i:s'));
    }

    public function test_breakdown_import_ignores_trailing_empty_rows_silently(): void
    {
        $unit = Unit::create([
            'code_unit' => 'DT-55',
            'model' => 'HINO 500',
            'type_unit' => 'DUMP TRUCK',
            'hm' => 1200,
        ]);

        $import = new BreakdownImport;
        $import->collection(collect([
            [
                'code_unit' => 'DT-55',
                'problem' => 'Oil leak',
                'tanggal' => '2026-09-24',
            ],
            // Trailing empty rows that Excel often includes
            [
                'code_unit' => null,
                'problem' => null,
                'tanggal' => null,
            ],
            [
                'code_unit' => '',
                'problem' => '',
                'tanggal' => '',
            ],
            [
                'code_unit' => '   ',
                'problem' => null,
                'tanggal' => '',
            ],
        ]));

        $this->assertEquals(1, $import->getImportedCount());
        $this->assertEquals(0, $import->getSkippedCount());
        $this->assertEquals('Berhasil mengimpor 1 data Breakdown.', $import->getSummaryMessage());
    }

    public function test_breakdown_import_reports_unregistered_units_clearly(): void
    {
        $import = new BreakdownImport;
        $import->collection(collect([
            [
                'code_unit' => 'NON-EXISTENT-UNIT-99',
                'problem' => 'Brake issue',
                'tanggal' => '2026-09-24',
            ],
        ]));

        $this->assertEquals(0, $import->getImportedCount());
        $this->assertEquals(1, $import->getSkippedCount());
        $this->assertStringContainsString('NON-EXISTENT-UNIT-99', $import->getSummaryMessage());
        $this->assertStringContainsString('belum terdaftar di master Unit', $import->getSummaryMessage());
    }

    public function test_completed_breakdown_work_order_moves_to_historical_and_not_in_active_monitoring(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'EX-ACTIVE-1',
            'model' => 'PC200',
            'type_unit' => 'EXCAVATOR',
            'hm' => 3000,
        ]);

        $activeWo = WorkOrderService::createWorkOrder([
            'no_wo' => 'WO-ACTIVE-01',
            'tipe_wo' => 'BREAKDOWN',
            'unit_id' => $unit->id,
            'status_wo' => 'OPEN',
            'status_pengerjaan' => 'PLANNING - PERENCANAAN PEKERJAAN',
            'problem' => 'Engine check',
            'downtime_code' => 'Unschedule',
            'site' => 'Site A',
        ]);

        $completedWo = WorkOrderService::createWorkOrder([
            'no_wo' => 'WO-COMPLETED-01',
            'tipe_wo' => 'BREAKDOWN',
            'unit_id' => $unit->id,
            'status_wo' => 'CM - CORRECTIVE MAINTENANCE',
            'status_pengerjaan' => 'COMPLETED - PEKERJAAN SELESAI',
            'problem' => 'Overhaul finished',
            'downtime_code' => 'Unschedule',
            'site' => 'Site A',
            'waktu_rfu' => now(),
            'close_date' => now(),
        ]);

        // Default tab=breakdown should only contain active breakdowns
        $response = $this->actingAs($user)->get(route('work-orders.index', ['tab' => 'breakdown']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('WorkOrder/Index')
            ->where('breakdown.kpi.total_wo', 1)
            ->where('breakdown.data.data.0.no_wo', 'WO-ACTIVE-01')
            ->where('historical.data.data.0.no_wo', 'WO-COMPLETED-01')
        );
    }
}
