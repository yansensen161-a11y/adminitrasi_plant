<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Tyre;
use App\Models\Unit;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WorkOrderTyreReplacementTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'super-admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_create_work_order_page_provides_stock_tyres(): void
    {
        $user = $this->createAdminUser();

        Tyre::create([
            'serial_number' => 'STK-001',
            'brand' => 'BRIDGESTONE',
            'size' => '24.00R35',
            'pattern' => 'E4',
            'condition' => 'STOCK',
            'position' => null,
            'unit_id' => null,
            'rtd' => 30,
        ]);

        $response = $this->actingAs($user)->get(route('work-orders.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('WorkOrder/Create')
            ->has('stockTyres')
            ->where('stockTyres.0.serial_number', 'STK-001')
        );
    }

    public function test_submitting_work_order_with_tyre_replacements_creates_and_updates_tyres(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'DT201',
            'model' => 'MERCEDES AXOR 2528',
            'type_unit' => 'DUMP TRUCK',
            'hm' => 1200,
        ]);

        $oldTyre = Tyre::create([
            'serial_number' => 'OLD-TYRE-101',
            'brand' => 'GITI',
            'size' => '12.00R20',
            'pattern' => 'GAM831',
            'condition' => 'ACTIVE',
            'position' => 'Pos 1',
            'unit_id' => $unit->id,
            'installed_hm' => 500,
            'hours_used' => 0,
            'rtd' => 18,
        ]);

        $payload = [
            'no_wo' => 'PLT/WO/TYRE/001',
            'tipe_wo' => 'BREAKDOWN',
            'downtime_code' => 'Unschedule',
            'site' => 'Harindo Wahana',
            'unit_id' => $unit->id,
            'hm_unit' => 1200,
            'hm_bd' => 1200,
            'problem' => 'Penggantian Tyre Posisi 1',
            'status_wo' => 'TYRE - TYRE REPLACEMENT',
            'status_pengerjaan' => 'OPEN',
            'component_group' => 'TYRE',
            'tyre_replacements' => [
                [
                    'position' => 'Pos 1',
                    'action' => 'REPLACE',
                    'old_tyre_id' => $oldTyre->id,
                    'old_tyre_serial' => 'OLD-TYRE-101',
                    'old_tyre_disposition' => 'SCRAP',
                    'old_tyre_rtd' => 6,
                    'removal_reason' => 'Cut sidewall akibat batuan tajam',
                    'is_new_record' => true,
                    'new_tyre_serial' => 'NEW-TYRE-202',
                    'brand' => 'BRIDGESTONE',
                    'size' => '12.00R20',
                    'pattern' => 'LUG',
                    'pressure' => 110,
                    'otd' => 25,
                    'rtd' => 25,
                ],
            ],
            'tasks' => [
                [
                    'group_component' => 'TYRE',
                    'component' => 'TYRE POS Pos 1',
                    'task_description' => 'Ganti ban Posisi 1',
                    'status' => 'B0 - On Progress',
                ],
            ],
        ];

        $response = $this->actingAs($user)->post(route('work-orders.store'), $payload);

        $response->assertRedirect(route('work-orders.index', ['tab' => 'breakdown']));

        $this->assertDatabaseHas('work_orders', [
            'no_wo' => 'PLT/WO/TYRE/001',
            'status_wo' => 'TYRE - TYRE REPLACEMENT',
        ]);

        $wo = WorkOrder::where('no_wo', 'PLT/WO/TYRE/001')->firstOrFail();

        // 1. Old tyre must be unmounted and set to SCRAP, total_hm accumulated (1200 - 500 = 700)
        $oldTyre->refresh();
        $this->assertNull($oldTyre->unit_id);
        $this->assertNull($oldTyre->position);
        $this->assertEquals('SCRAP', $oldTyre->condition);
        $this->assertEquals(700, $oldTyre->total_hm);
        $this->assertEquals(6, $oldTyre->rtd);

        // 2. New tyre must be registered and mounted to the unit
        $this->assertDatabaseHas('tyres', [
            'serial_number' => 'NEW-TYRE-202',
            'unit_id' => $unit->id,
            'position' => 'Pos 1',
            'condition' => 'ACTIVE',
            'installed_hm' => 1200,
            'type_size' => '12.00R20',
            'brand' => 'BRIDGESTONE',
        ]);

        // 3. Tyre histories logged for both tyres with WO reference in notes
        $this->assertDatabaseHas('tyre_histories', [
            'tyre_id' => $oldTyre->id,
            'event_type' => 'SCRAP',
            'unit_id' => $unit->id,
            'from_position' => 'Pos 1',
            'hm_at_event' => 1200,
        ]);

        $newTyre = Tyre::where('serial_number', 'NEW-TYRE-202')->firstOrFail();
        $this->assertDatabaseHas('tyre_histories', [
            'tyre_id' => $newTyre->id,
            'event_type' => 'INSTALL',
            'unit_id' => $unit->id,
            'to_position' => 'Pos 1',
            'hm_at_event' => 1200,
        ]);
    }

    public function test_updating_work_order_with_stock_tyre_installation(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'DT202',
            'model' => 'MERCEDES AXOR 2528',
            'type_unit' => 'DUMP TRUCK',
            'hm' => 1500,
        ]);

        $stockTyre = Tyre::create([
            'serial_number' => 'STK-AVAILABLE-99',
            'brand' => 'MICHELIN',
            'size' => '12.00R20',
            'pattern' => 'X-WORKS',
            'condition' => 'STOCK',
            'position' => null,
            'unit_id' => null,
            'rtd' => 22,
        ]);

        $wo = WorkOrder::create([
            'no_wo' => 'PLT/WO/TYRE/002',
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'TYRE - Tyre Replacement',
            'status_pengerjaan' => 'OPEN',
            'downtime_code' => 'Unschedule',
            'unit_id' => $unit->id,
            'site' => 'Harindo Wahana',
            'hm_unit' => 1500,
            'waktu_breakdown' => '2026-09-22 09:00:00',
        ]);

        $payload = [
            'no_wo' => $wo->no_wo,
            'tipe_wo' => $wo->tipe_wo,
            'downtime_code' => 'Unschedule',
            'site' => 'Harindo Wahana',
            'unit_id' => $unit->id,
            'hm_unit' => 1500,
            'status_wo' => 'TYRE - Tyre Replacement',
            'status_pengerjaan' => 'OPEN',
            'component_group' => 'TYRE',
            'tyre_replacements' => [
                [
                    'position' => 'Pos 2',
                    'action' => 'MOUNT_ONLY',
                    'is_new_record' => false,
                    'new_tyre_id' => $stockTyre->id,
                    'new_tyre_serial' => 'STK-AVAILABLE-99',
                    'pressure' => 115,
                ],
            ],
            'tasks' => [
                [
                    'id' => null,
                    'group_component' => 'TYRE',
                    'component' => 'TYRE POS Pos 2',
                    'task_description' => 'Pasang ban cadangan',
                    'status' => 'B0 - On Progress',
                ],
            ],
        ];

        $response = $this->actingAs($user)->put(route('work-orders.update', $wo->id), $payload);

        $response->assertRedirect(route('work-orders.show', $wo->id));

        $stockTyre->refresh();
        $this->assertEquals($unit->id, $stockTyre->unit_id);
        $this->assertEquals('Pos 2', $stockTyre->position);
        $this->assertEquals('ACTIVE', $stockTyre->condition);
        $this->assertEquals(1500, $stockTyre->installed_hm);
        $this->assertEquals(115, $stockTyre->psi);

        $this->assertDatabaseHas('tyre_histories', [
            'tyre_id' => $stockTyre->id,
            'event_type' => 'INSTALL',
            'unit_id' => $unit->id,
            'to_position' => 'Pos 2',
            'hm_at_event' => 1500,
        ]);
    }
}
