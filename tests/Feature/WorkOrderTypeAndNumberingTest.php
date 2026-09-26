<?php

namespace Tests\Feature;

use App\Imports\BreakdownImport;
use App\Imports\WorkOrderImport;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkOrderTypeAndNumberingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'super-admin']);
    }

    public function test_suggest_number_endpoint_returns_expected_prefix(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $types = [
            'PM' => 'PLT/WO/PM/001',
            'CM' => 'PLT/WO/CM/001',
            'INS' => 'PLT/WO/INSP/001',
            'OVH' => 'PLT/WO/OVH/001',
            'REPL' => 'PLT/WO/REPL/001',
            'UC' => 'PLT/WO/UC/001',
            'TYRE' => 'PLT/WO/TYRE/001',
        ];

        foreach ($types as $code => $expected) {
            $response = $this->actingAs($user)->getJson('/work-orders/suggest-number?type='.$code);
            $response->assertOk();
            $this->assertEquals($expected, $response->json('no_wo'));
        }
    }

    public function test_can_create_work_order_with_repl_and_tyre_types(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'EX01',
            'model' => 'PC200',
            'type_unit' => 'EXCAVATOR',
        ]);

        // Create REPL work order
        $response = $this->actingAs($user)->post('/work-orders', [
            'no_wo' => 'PLT/WO/REPL/001',
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'REPL - COMPONENT REPLACEMENT',
            'downtime_code' => 'Unschedule',
            'unit_id' => $unit->id,
            'site' => 'Harindo Wahana',
            'problem' => 'Ganti filter',
        ]);

        $this->assertDatabaseHas('work_orders', [
            'no_wo' => 'PLT/WO/REPL/001',
            'status_wo' => 'REPL - COMPONENT REPLACEMENT',
        ]);

        // Next auto-generated REPL number should now be 002
        $suggestResponse = $this->actingAs($user)->getJson('/work-orders/suggest-number?type=REPL');
        $this->assertEquals('PLT/WO/REPL/002', $suggestResponse->json('no_wo'));
    }

    public function test_can_download_templates(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $responseWo = $this->actingAs($user)->get('/work-orders/download-template');
        $responseWo->assertOk();
        $this->assertStringContainsString('Template_Import_Work_Order.xlsx', $responseWo->headers->get('content-disposition'));

        $responseBd = $this->actingAs($user)->get('/work-orders/download-template-breakdown');
        $responseBd->assertOk();
        $this->assertStringContainsString('Template_Import_Breakdown.xlsx', $responseBd->headers->get('content-disposition'));
    }

    public function test_work_order_import_and_breakdown_import_collections(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'EX02',
            'model' => 'PC200',
            'type_unit' => 'EXCAVATOR',
            'hm' => 12000,
        ]);

        // Test WorkOrderImport with new options
        $importWo = new WorkOrderImport;
        $importWo->collection(collect([
            [
                'code_unit' => 'EX02',
                'tipe_wo' => 'PM - PREVENTIVE MAINTENANCE',
                'status_wo' => 'COMPLETED - PEKERJAAN SELESAI',
                'down_status' => 'B10 - WAITING RAIN / SLIPPERY CONDITION',
                'tanggal_request' => '2026-09-20 08:00',
                'tanggal_selesai' => '2026-09-20 14:00',
                'hm_unit' => 12100,
                'problem' => 'PS 250 H Periodic Service',
                'tindakan_perbaikan' => 'Ganti filter solar & oli',
                'pic' => 'Agus',
            ],
        ]));

        $this->assertDatabaseHas('work_orders', [
            'unit_id' => $unit->id,
            'status_wo' => 'PM - PREVENTIVE MAINTENANCE',
            'status_pengerjaan' => 'COMPLETED - PEKERJAAN SELESAI',
            'tipe_wo' => 'SCHEDULE',
        ]);

        $this->assertDatabaseHas('work_order_tasks', [
            'status' => 'B10 - WAITING RAIN / SLIPPERY CONDITION',
            'mechanic' => 'Agus',
        ]);

        // Test BreakdownImport with new options
        $importBd = new BreakdownImport;
        $importBd->collection(collect([
            [
                'code_unit' => 'EX02',
                'tipe_wo' => 'CM - CORRECTIVE MAINTENANCE',
                'status_wo' => 'IN PROGRESS - SEDANG DIKERJAKAN',
                'down_status' => 'B1 - WAITING PARTS',
                'tanggal' => '2026-09-22',
                'jam_breakdown' => '09:00',
                'jam_ready' => '',
                'hm_unit' => 12150,
                'problem' => 'Hose boom pecah',
                'corrective_action' => 'Menunggu spare hose',
                'pic' => 'Budi',
            ],
        ]));

        $this->assertDatabaseHas('work_orders', [
            'unit_id' => $unit->id,
            'status_wo' => 'CM - CORRECTIVE MAINTENANCE',
            'status_pengerjaan' => 'IN PROGRESS - SEDANG DIKERJAKAN',
            'tipe_wo' => 'BREAKDOWN',
        ]);

        $this->assertDatabaseHas('work_order_tasks', [
            'status' => 'B1 - WAITING PARTS',
            'mechanic' => 'Budi',
        ]);
    }
}
