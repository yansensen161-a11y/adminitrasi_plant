<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Unit;
use App\Models\UnitGatePass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnitGatePassTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_user_can_view_gatepass_unit_index(): void
    {
        $user = $this->createAdminUser();

        $response = $this
            ->actingAs($user)
            ->get(route('gatepass-unit.index'));

        $response->assertOk();
    }

    public function test_user_can_create_unit_gatepass(): void
    {
        $user = $this->createAdminUser();
        $unit = Unit::create([
            'code_unit' => 'DT-101',
            'model' => 'CAT 777D',
            'type_unit' => 'DUMP TRUCK',
        ]);

        $payload = [
            'gatepass_no' => 'GPU-20260919-999',
            'unit_id' => $unit->id,
            'code_unit' => 'DT-101',
            'model' => 'CAT 777D',
            'type_unit' => 'DUMP TRUCK',
            'driver_name' => 'Hendra Setiawan',
            'destination' => 'Vendor Workshop',
            'purpose' => 'Repair Hydraulic Cylinder',
            'exit_time' => now()->toDateTimeString(),
            'expected_return_time' => now()->addHours(5)->toDateTimeString(),
            'status' => 'ACTIVE',
            'approved_by' => 'SUPERINTENDENT',
        ];

        $response = $this
            ->actingAs($user)
            ->post(route('gatepass-unit.store'), $payload);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('unit_gate_passes', [
            'gatepass_no' => 'GPU-20260919-999',
            'code_unit' => 'DT-101',
            'driver_name' => 'Hendra Setiawan',
            'status' => 'ACTIVE',
        ]);
    }

    public function test_user_can_mark_unit_gatepass_as_returned(): void
    {
        $user = $this->createAdminUser();
        $gatepass = UnitGatePass::create([
            'gatepass_no' => 'GPU-20260919-888',
            'code_unit' => 'DT-102',
            'driver_name' => 'Bambang',
            'destination' => 'Site Pit 1',
            'purpose' => 'Hauling Operation',
            'exit_time' => now()->subHours(3),
            'status' => 'ACTIVE',
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('gatepass-unit.return', $gatepass->id));

        $response->assertSessionHasNoErrors();
        $gatepass->refresh();
        $this->assertSame('RECEIVED', $gatepass->status);
        $this->assertNotNull($gatepass->actual_return_time);
    }

    public function test_user_can_delete_unit_gatepass(): void
    {
        $user = $this->createAdminUser();
        $gatepass = UnitGatePass::create([
            'gatepass_no' => 'GPU-20260919-777',
            'code_unit' => 'DT-103',
            'driver_name' => 'Rudy',
            'destination' => 'Site Pit 2',
            'purpose' => 'Inspection',
            'exit_time' => now(),
            'status' => 'ACTIVE',
        ]);

        $response = $this
            ->actingAs($user)
            ->delete(route('gatepass-unit.destroy', $gatepass->id));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('unit_gate_passes', [
            'id' => $gatepass->id,
        ]);
    }

    public function test_user_can_export_pdf_despatch_report(): void
    {
        $user = $this->createAdminUser();
        $gatepass = UnitGatePass::create([
            'gatepass_no' => '01',
            'company_name' => 'PT. MITRA ABADI MAHAKAM',
            'code_unit' => 'MDT022',
            'driver_name' => 'Supardi Halim',
            'destination' => 'Mining Project SATUI',
            'purpose' => 'STOCK TRANSFER',
            'exit_time' => now(),
            'status' => 'ACTIVE',
            'radio_rig' => 'Radio Rig not Available',
            'approved_by_name' => 'Supardi Halim',
            'approved_by_title' => 'Project Manager',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('gatepass-unit.pdf', $gatepass->id));

        $response->assertOk();
        $this->assertSame('application/pdf', $response->headers->get('Content-Type'));
    }
}
