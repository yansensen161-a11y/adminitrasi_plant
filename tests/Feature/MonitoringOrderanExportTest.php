<?php

namespace Tests\Feature;

use App\Models\MaintenanceOrder;
use App\Models\MaintenanceOrderPart;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MonitoringOrderanExportTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $role = Role::firstOrCreate(['name' => 'super-admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function createSampleOrder(): MaintenanceOrder
    {
        $unit = Unit::create([
            'code_unit' => 'EX393',
            'type_unit' => 'EXCAVATOR',
            'model' => 'HITACHI ZX200',
            'hm' => 5400.0,
        ]);

        $order = MaintenanceOrder::create([
            'no_order' => 'HW-MOL-01475',
            'unit_id' => $unit->id,
            'tanggal' => '2026-09-20',
            'hm' => 5400.0,
            'lokasi' => 'Pit West',
            'component' => 'HYDRAULIC',
            'component_name' => 'Cylinder Arm',
            'priority' => 'P1',
            'status' => 'WAITING PART',
            'pic' => 'Yansen',
            'root_cause' => 'Bocor seal rod',
            'action_taken' => 'Penggantian seal kit',
        ]);

        MaintenanceOrderPart::create([
            'maintenance_order_id' => $order->id,
            'part_number' => '4658930',
            'department' => 'SEAL KIT CYL ARM',
            'qty' => 2,
            'pr' => 'PR.HW.2026.09.00012',
            'po' => 'PO.MAM.2026.09.05620',
            'due_date_part' => '2026-09-28',
        ]);

        return $order;
    }

    public function test_can_download_pdf_by_order_id(): void
    {
        $user = $this->createAdminUser();
        $order = $this->createSampleOrder();

        $response = $this->actingAs($user)->get(route('monitoring-orderan.pdf', $order->id));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_can_download_pdf_by_no_order(): void
    {
        $user = $this->createAdminUser();
        $order = $this->createSampleOrder();

        $response = $this->actingAs($user)->get(route('monitoring-orderan.export-pdf', [
            'no_order' => $order->no_order,
        ]));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_can_download_excel_by_order_id(): void
    {
        $user = $this->createAdminUser();
        $order = $this->createSampleOrder();

        $response = $this->actingAs($user)->get(route('monitoring-orderan.excel', $order->id));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_can_download_excel_by_no_order(): void
    {
        $user = $this->createAdminUser();
        $order = $this->createSampleOrder();

        $response = $this->actingAs($user)->get(route('monitoring-orderan.export-excel', [
            'no_order' => $order->no_order,
        ]));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_can_export_filtered_excel_list(): void
    {
        $user = $this->createAdminUser();
        $this->createSampleOrder();

        $response = $this->actingAs($user)->get(route('monitoring-orderan.export-excel', [
            'status' => 'WAITING PART',
        ]));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}
