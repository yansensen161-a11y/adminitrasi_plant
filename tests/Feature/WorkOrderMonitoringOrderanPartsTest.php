<?php

namespace Tests\Feature;

use App\Models\MaintenanceOrder;
use App\Models\MaintenanceOrderPart;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkOrderMonitoringOrderanPartsTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'super-admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_can_view_work_order_with_unit_orders(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'MD041',
            'model' => 'MERCY 2528 AXOR',
            'type_unit' => 'DUMP TRUCK',
            'hm' => 5000,
        ]);

        $wo = WorkOrder::create([
            'no_wo' => 'PLT/WO/CM/2658',
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'PM - PREVENTIVE MAINTENANCE',
            'status_pengerjaan' => 'IN PROGRESS - SEDANG DIKERJAKAN',
            'downtime_code' => 'Unschedule',
            'site' => 'Site A',
            'unit_id' => $unit->id,
            'problem' => 'FLOATING SEAL FINAL DRIVE LH LEAK',
        ]);

        $order = MaintenanceOrder::create([
            'no_order' => 'HW-MOL-01475',
            'unit_id' => $unit->id,
            'tanggal' => '2026-09-15',
            'status' => 'CLOSED',
            'component' => 'FINAL DRIVE',
        ]);

        MaintenanceOrderPart::create([
            'maintenance_order_id' => $order->id,
            'part_number' => '14X-27-11531',
            'department' => 'BEARING',
            'qty' => 6,
            'pr' => 'PR.HW.2026.09.00173',
        ]);

        $response = $this->actingAs($user)->get(route('work-orders.show', $wo->id));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('WorkOrder/Show')
            ->has('workOrder')
            ->has('unitOrders', 1)
        );
    }

    public function test_can_attach_monitoring_order_parts_to_work_order(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'MD041',
            'model' => 'MERCY 2528 AXOR',
            'type_unit' => 'DUMP TRUCK',
        ]);

        $wo = WorkOrder::create([
            'no_wo' => 'PLT/WO/CM/2658',
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'OPEN',
            'status_pengerjaan' => 'OPEN',
            'downtime_code' => 'Unschedule',
            'site' => 'Site A',
            'unit_id' => $unit->id,
            'problem' => 'LEAK FINAL DRIVE',
        ]);

        $order = MaintenanceOrder::create([
            'no_order' => 'HW-MOL-01475',
            'unit_id' => $unit->id,
            'tanggal' => '2026-09-15',
            'status' => 'WAITING PART',
        ]);

        $part = MaintenanceOrderPart::create([
            'maintenance_order_id' => $order->id,
            'part_number' => '14X-27-11531',
            'department' => 'BEARING',
            'qty' => 6,
            'pr' => 'PR.HW.00173',
        ]);

        $payload = [
            'order_id' => $order->id,
            'no_order' => $order->no_order,
            'update_down_status' => true,
            'parts' => [
                [
                    'maintenance_order_part_id' => $part->id,
                    'no_order' => $order->no_order,
                    'part_number' => $part->part_number,
                    'description' => $part->department,
                    'qty_request' => $part->qty,
                    'qty_used' => 0,
                    'pr' => $part->pr,
                    'status' => 'ORDERED',
                ],
            ],
        ];

        $response = $this->actingAs($user)->post(route('work-orders.attach-order-parts', $wo->id), $payload);
        $response->assertRedirect();

        $this->assertDatabaseHas('wo_parts', [
            'work_order_id' => $wo->id,
            'maintenance_order_id' => $order->id,
            'no_order' => 'HW-MOL-01475',
            'part_number' => '14X-27-11531',
            'description' => 'BEARING',
            'qty_request' => 6,
            'pr' => 'PR.HW.00173',
        ]);

        $wo->refresh();
        $this->assertEquals('B1 - WAITING PARTS', $wo->downtime_code);
    }

    public function test_can_manually_add_and_delete_part(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'DT99',
            'model' => 'HINO 500',
            'type_unit' => 'DUMP TRUCK',
        ]);

        $wo = WorkOrder::create([
            'no_wo' => 'PLT/WO/CM/2659',
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'OPEN',
            'status_pengerjaan' => 'OPEN',
            'downtime_code' => 'Unschedule',
            'site' => 'Site A',
            'unit_id' => $unit->id,
        ]);

        $response = $this->actingAs($user)->post(route('work-orders.parts.store', $wo->id), [
            'part_number' => 'TEST-001',
            'description' => 'Filter Solar',
            'qty_request' => 2,
            'status' => 'REQUESTED',
        ]);
        $response->assertRedirect();

        $this->assertDatabaseHas('wo_parts', [
            'work_order_id' => $wo->id,
            'part_number' => 'TEST-001',
            'description' => 'Filter Solar',
            'qty_request' => 2,
        ]);

        $part = $wo->parts()->first();

        $deleteResponse = $this->actingAs($user)->delete(route('work-orders.parts.destroy', [$wo->id, $part->id]));
        $deleteResponse->assertRedirect();

        $this->assertDatabaseMissing('wo_parts', [
            'id' => $part->id,
        ]);
    }

    public function test_can_store_and_update_monitoring_order_with_parts_component_and_component_name(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'DT100',
            'model' => 'HINO 500',
            'type_unit' => 'DUMP TRUCK',
        ]);

        $storeResponse = $this->actingAs($user)->post(route('monitoring-orderan.store'), [
            'no_order' => 'HW-MOL-99999',
            'tanggal' => '2026-09-25',
            'unit_id' => $unit->id,
            'hm' => 1500,
            'lokasi' => 'Workshop',
            'priority' => 'P1',
            'status' => 'OPEN',
            'pic' => 'Ahmad',
            'root_cause' => 'Engine overheating issue',
            'action_taken' => 'Inspect and replace cooling parts',
            'parts' => [
                [
                    'component' => 'COOLING SYSTEM',
                    'component_name' => 'Water Pump',
                    'part_number' => 'WP-12345',
                    'description' => 'Water Pump Assembly',
                    'qty' => 1,
                    'life_time' => 2500,
                    'pr' => 'PR-001',
                    'po' => 'PO-001',
                ],
                [
                    'component' => 'ENGINE',
                    'component_name' => 'Thermostat',
                    'part_number' => 'TH-67890',
                    'description' => 'Thermostat 82C',
                    'qty' => 2,
                    'pr' => 'PR-002',
                    'po' => 'PO-002',
                ],
            ],
        ]);

        $storeResponse->assertRedirect(route('monitoring-orderan.index'));

        $order = MaintenanceOrder::where('no_order', 'HW-MOL-99999')->first();
        $this->assertNotNull($order);
        $this->assertEquals('COOLING SYSTEM', $order->component);
        $this->assertEquals('Water Pump', $order->component_name);

        $this->assertDatabaseHas('maintenance_order_parts', [
            'maintenance_order_id' => $order->id,
            'component' => 'COOLING SYSTEM',
            'component_name' => 'Water Pump',
            'part_number' => 'WP-12345',
            'department' => 'Water Pump Assembly',
            'qty' => 1,
        ]);

        $this->assertDatabaseHas('maintenance_order_parts', [
            'maintenance_order_id' => $order->id,
            'component' => 'ENGINE',
            'component_name' => 'Thermostat',
            'part_number' => 'TH-67890',
            'department' => 'Thermostat 82C',
            'qty' => 2,
        ]);

        // Test update
        $updateResponse = $this->actingAs($user)->put(route('monitoring-orderan.update', $order->id), [
            'tanggal' => '2026-09-25',
            'unit_id' => $unit->id,
            'hm' => 1550,
            'lokasi' => 'Workshop 2',
            'priority' => 'P2',
            'status' => 'IN PROGRESS',
            'pic' => 'Budi',
            'root_cause' => 'Engine overheating issue solved',
            'action_taken' => 'Replaced pump',
            'parts' => [
                [
                    'component' => 'HYDRAULIC',
                    'component_name' => 'Main Pump',
                    'part_number' => 'HYD-999',
                    'description' => 'Hydraulic Main Pump',
                    'qty' => 1,
                ],
            ],
        ]);

        $updateResponse->assertRedirect(route('monitoring-orderan.index'));

        $order->refresh();
        $this->assertEquals('HYDRAULIC', $order->component);
        $this->assertEquals('Main Pump', $order->component_name);

        $this->assertDatabaseHas('maintenance_order_parts', [
            'maintenance_order_id' => $order->id,
            'component' => 'HYDRAULIC',
            'component_name' => 'Main Pump',
            'part_number' => 'HYD-999',
            'department' => 'Hydraulic Main Pump',
        ]);
    }
}
