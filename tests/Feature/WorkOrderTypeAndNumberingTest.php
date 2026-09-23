<?php

namespace Tests\Feature;

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
}
