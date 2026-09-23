<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Unit;
use App\Models\UnitApl;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WorkOrderMasterFormAndAplTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'super-admin']);
    }

    public function test_can_fetch_unit_apls_in_json(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'ME049',
            'model' => 'CAT 374',
            'type_unit' => 'EXCAVATOR',
        ]);

        UnitApl::create([
            'unit_id' => $unit->id,
            'part_number' => '1R-0716',
            'depart' => 'ENGINE',
            'description' => 'Engine Oil Filter',
            'qty' => 2,
            'satuan' => 'PCS',
            'ps_250' => '✓',
            'ps_500' => '✓',
            'price_rate' => 350000,
            'amount' => 700000,
        ]);

        $response = $this->actingAs($user)->getJson(route('units.apls.json', $unit->id));

        $response->assertOk()
            ->assertJsonPath('unit.code_unit', 'ME049')
            ->assertJsonCount(1, 'apls')
            ->assertJsonPath('apls.0.part_number', '1R-0716');
    }

    public function test_work_order_create_preloads_initial_apls_when_unit_id_provided(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'ME049',
            'model' => 'CAT 374',
            'type_unit' => 'EXCAVATOR',
        ]);

        UnitApl::create([
            'unit_id' => $unit->id,
            'part_number' => '1R-0716',
            'depart' => 'ENGINE',
            'description' => 'Engine Oil Filter',
            'qty' => 2,
            'satuan' => 'PCS',
            'ps_250' => '✓',
            'ps_500' => '✓',
            'price_rate' => 350000,
            'amount' => 700000,
        ]);

        $response = $this->actingAs($user)->get(route('work-orders.create', [
            'from' => 'pm-monitoring',
            'tipe_wo' => 'SCHEDULE',
            'unit_id' => $unit->id,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('WorkOrder/Create')
            ->has('initialApls', 1)
            ->where('initialApls.0.part_number', '1R-0716')
        );
    }

    public function test_master_forms_blank_print_routes_respond_ok(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'ME049',
            'model' => 'CAT 374',
            'type_unit' => 'EXCAVATOR',
        ]);

        // Washing Unit Print
        $resWashing = $this->actingAs($user)->get(route('form-washing-unit.blank-print', ['unit_id' => $unit->id]));
        $resWashing->assertOk();

        // Penundaan Service Print
        $resPenundaan = $this->actingAs($user)->get(route('form-penundaan-service.blank-print', ['unit_id' => $unit->id]));
        $resPenundaan->assertOk();
    }
}
