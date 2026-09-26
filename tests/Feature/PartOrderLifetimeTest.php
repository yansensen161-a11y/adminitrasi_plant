<?php

namespace Tests\Feature;

use App\Models\PartOrderLifetime;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartOrderLifetimeTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'super-admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_prevents_duplicate_part_number_within_same_maintenance_order(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'EX01',
            'model' => 'PC200-8',
            'type_unit' => 'EXCAVATOR',
            'hm' => 5000,
        ]);

        $payload = [
            'unit_id' => $unit->id,
            'no_order' => 'HW-MOL-99991',
            'tanggal' => '2026-09-25',
            'status' => 'REQUEST',
            'priority' => 'P1',
            'parts' => [
                [
                    'part_number' => '6732-71-6120',
                    'department' => 'FILTER FUEL',
                    'qty' => 1,
                ],
                [
                    'part_number' => '6732-71-6120', // Duplicate part number!
                    'department' => 'FILTER FUEL DUPLICATE',
                    'qty' => 2,
                ],
            ],
        ];

        $response = $this->actingAs($user)->post(route('monitoring-orderan.store'), $payload);

        $response->assertSessionHasErrors('parts');
    }

    public function test_check_active_order_api_returns_warning_when_active_order_exists(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'DT05',
            'model' => 'VOLVO FMX 440',
            'type_unit' => 'DUMP TRUCK',
            'hm' => 12000,
        ]);

        PartOrderLifetime::create([
            'unit_id' => $unit->id,
            'unit_code' => 'DT05',
            'part_number' => '20512345',
            'part_name' => 'BRAKE LINING',
            'no_order' => 'ORD-001',
            'qty' => 4,
            'status' => PartOrderLifetime::STATUS_ORDERED,
            'order_date' => '2026-09-20',
        ]);

        $response = $this->actingAs($user)->getJson(route('part-order-lifetime.check-active', [
            'unit_id' => $unit->id,
            'unit_code' => 'DT05',
            'part_number' => '20512345',
        ]));

        $response->assertOk();
        $response->assertJson([
            'has_active_order' => true,
        ]);
        $this->assertNotEmpty($response->json('active_orders'));
    }

    public function test_part_lifetime_install_calculates_remaining_life_and_percentage(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'HD785-01',
            'model' => 'HD785-7',
            'type_unit' => 'HAUL DUMP',
            'hm' => 6200,
        ]);

        $partOrder = PartOrderLifetime::create([
            'unit_id' => $unit->id,
            'unit_code' => 'HD785-01',
            'part_number' => '569-43-81110',
            'part_name' => 'FINAL DRIVE HUB',
            'no_order' => 'ORD-002',
            'qty' => 1,
            'status' => PartOrderLifetime::STATUS_RECEIVED,
            'expected_lifetime' => 2000,
        ]);

        $installPayload = [
            'installed_date' => '2026-09-25',
            'installed_hm' => 6000,
            'expected_lifetime' => 2000,
        ];

        $response = $this->actingAs($user)->postJson(route('part-order-lifetime.install', $partOrder->id), $installPayload);

        $response->assertOk();

        $partOrder->refresh();
        $this->assertEquals(PartOrderLifetime::STATUS_INSTALLED, $partOrder->status);
        $this->assertEquals(6000, $partOrder->installed_hm);
        // Current life = Unit HM (6200) - Installed HM (6000) = 200
        $this->assertEquals(200, $partOrder->current_life);
        $this->assertEquals(1800, $partOrder->remaining_life);
        $this->assertEquals(10.0, $partOrder->life_used_percentage);
        $this->assertEquals('NORMAL', $partOrder->lifetime_status);
    }

    public function test_part_lifetime_replace_creates_new_record_and_archives_old(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'HD785-02',
            'model' => 'HD785-7',
            'type_unit' => 'HAUL DUMP',
            'hm' => 8500,
        ]);

        $oldPart = PartOrderLifetime::create([
            'unit_id' => $unit->id,
            'unit_code' => 'HD785-02',
            'part_number' => '175-15-41100',
            'part_name' => 'TRANSMISSION PUMP',
            'no_order' => 'ORD-OLD',
            'qty' => 1,
            'status' => PartOrderLifetime::STATUS_INSTALLED,
            'installed_date' => '2026-01-10',
            'installed_hm' => 6000,
            'expected_lifetime' => 2000,
        ]);

        $replacePayload = [
            'removed_date' => '2026-09-25',
            'removed_hm' => 8500,
            'failure_reason' => 'Low Pressure & Wear',
            'create_replacement' => true,
            'replacement_no_order' => 'ORD-NEW-01',
            'replacement_expected_lifetime' => 2500,
        ];

        $response = $this->actingAs($user)->postJson(route('part-order-lifetime.replace', $oldPart->id), $replacePayload);

        $response->assertOk();

        $oldPart->refresh();
        $this->assertEquals(PartOrderLifetime::STATUS_CLOSED, $oldPart->status);
        $this->assertEquals(8500, $oldPart->removed_hm);
        $this->assertEquals(2500, $oldPart->actual_lifetime); // 8500 - 6000 = 2500
        $this->assertEquals('Low Pressure & Wear', $oldPart->failure_reason);

        // Check new replacement record
        $this->assertDatabaseHas('part_order_lifetimes', [
            'unit_id' => $unit->id,
            'part_number' => '175-15-41100',
            'no_order' => 'ORD-NEW-01',
            'status' => PartOrderLifetime::STATUS_INSTALLED,
            'expected_lifetime' => 2500,
        ]);
    }

    public function test_part_order_lifetime_index_page_loads_with_metrics(): void
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)->get(route('part-order-lifetime.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('PartOrderLifetime/Index')
            ->has('metrics')
            ->has('records')
            ->has('units')
            ->has('statuses')
        );
    }
}
