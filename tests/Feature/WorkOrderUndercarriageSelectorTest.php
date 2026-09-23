<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkOrderUndercarriageSelectorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'super-admin']);
    }

    public function test_pcr_uc_components_by_unit_endpoint_returns_data(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'MD041',
            'model' => 'KOMATSU D85ESS',
            'type_unit' => 'BULLDOZER',
            'hm' => 7379,
        ]);

        $response = $this->actingAs($user)->getJson('/pcr-uc/components-by-unit?unit_id='.$unit->id);

        $response->assertOk()
            ->assertJsonStructure([
                'unit' => ['id', 'code_unit', 'model'],
                'pcr_records',
            ]);
    }

    public function test_can_create_work_order_with_undercarriage_components_and_tasks(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'MD041',
            'model' => 'KOMATSU D85ESS',
            'type_unit' => 'BULLDOZER',
            'hm' => 7379,
        ]);

        $postData = [
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'OPEN',
            'downtime_code' => 'Unschedule',
            'site' => 'Harindo Wahana',
            'unit_id' => $unit->id,
            'component_group' => 'UNDERCARRIAGE',
            'model_system' => 'Carrier Roller RHF, Segment RH',
            'problem' => 'Penggantian / Perbaikan Komponen Undercarriage: Carrier Roller RHF, Segment RH',
            'tasks' => [
                [
                    'group_component' => 'UNDERCARRIAGE',
                    'component' => 'Carrier Roller RHF',
                    'task_description' => 'Pemeriksaan & Penggantian Carrier Roller RHF (14X-30-00142) - Status: NEW',
                    'mechanic' => 'Mekanik A',
                    'tools' => [],
                    'status' => 'Open',
                ],
                [
                    'group_component' => 'UNDERCARRIAGE',
                    'component' => 'Segment RH',
                    'task_description' => 'Pemeriksaan & Penggantian Segment RH (14X-27-15112) - Status: NEW',
                    'mechanic' => 'Mekanik B',
                    'tools' => [],
                    'status' => 'Open',
                ],
            ],
        ];

        $response = $this->actingAs($user)->post(route('work-orders.store'), $postData);

        $response->assertRedirect(route('work-orders.index', ['tab' => 'breakdown']));

        $this->assertDatabaseHas('work_orders', [
            'unit_id' => $unit->id,
            'component' => 'UNDERCARRIAGE',
            'component_model' => 'Carrier Roller RHF, Segment RH',
        ]);

        $this->assertDatabaseHas('work_order_tasks', [
            'group_component' => 'UNDERCARRIAGE',
            'component' => 'Carrier Roller RHF',
        ]);

        $this->assertDatabaseHas('work_order_tasks', [
            'group_component' => 'UNDERCARRIAGE',
            'component' => 'Segment RH',
        ]);
    }
}
