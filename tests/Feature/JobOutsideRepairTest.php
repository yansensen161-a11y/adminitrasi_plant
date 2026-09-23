<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Models\WoOutsideRepair;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobOutsideRepairTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'super-admin']);
    }

    public function test_user_can_view_job_outside_index(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $response = $this->actingAs($user)->get(route('repair.job-outside'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Repair/JobOutside'));
    }

    public function test_user_can_create_work_order_for_outside_unit_with_custom_code(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $payload = [
            'wo_no' => '0410/WO/HW/IX/2026',
            'date' => '2026-09-22',
            'nama_bengkel' => 'AREMA DINAMO',
            'unit_id' => null, // Di Luar Unit (non-populasi)
            'kode_unit' => 'GENSET-01',
            'model_mesin' => 'DENYO 150 KVA',
            'serial_no_unit' => 'SN-GS-10023',
            'nama_komponen' => 'ALTERNATOR',
            'model_komponen' => 'ELECTRICAL',
            'sn_komponen' => 'ALT-DEN-998',
            'status' => 'DIKIRIM',
            'problem' => 'NO CHARGING / REGULATOR FAULTY',
            'job_instruction' => 'REWINDING & REPLACE REGULATOR',
        ];

        $response = $this->actingAs($user)->post(route('repair.job-outside.store'), $payload);

        $response->assertRedirect(route('repair.job-outside'));

        $this->assertDatabaseHas('wo_outside_repairs', [
            'wo_no' => '0410/WO/HW/IX/2026',
            'kode_unit' => 'GENSET-01',
            'model_mesin' => 'DENYO 150 KVA',
            'unit_id' => null,
            'nama_komponen' => 'ALTERNATOR',
        ]);
    }

    public function test_user_can_update_outside_unit_work_order(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $wo = WoOutsideRepair::create([
            'wo_no' => '0411/WO/HW/IX/2026',
            'date' => '2026-09-22',
            'nama_bengkel' => 'AREMA DINAMO',
            'unit_id' => null,
            'kode_unit' => 'PUMP-01',
            'model_mesin' => 'SYKES CP150',
            'nama_komponen' => 'IMPELLER PUMP',
            'status' => 'DIKIRIM',
        ]);

        $updatePayload = [
            'wo_no' => '0411/WO/HW/IX/2026',
            'date' => '2026-09-22',
            'nama_bengkel' => 'AREMA DINAMO',
            'unit_id' => null,
            'kode_unit' => 'PUMP-01-REVISED',
            'model_mesin' => 'SYKES CP150 DEWATERING',
            'nama_komponen' => 'IMPELLER PUMP',
            'status' => 'PROSES REPAIR',
        ];

        $response = $this->actingAs($user)->post(route('repair.job-outside.update', $wo->id), $updatePayload);

        $response->assertRedirect(route('repair.job-outside'));

        $this->assertDatabaseHas('wo_outside_repairs', [
            'id' => $wo->id,
            'kode_unit' => 'PUMP-01-REVISED',
            'model_mesin' => 'SYKES CP150 DEWATERING',
            'status' => 'PROSES REPAIR',
        ]);
    }

    public function test_user_can_generate_pdf_for_outside_unit(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $wo = WoOutsideRepair::create([
            'wo_no' => '0412/WO/HW/IX/2026',
            'date' => '2026-09-22',
            'nama_bengkel' => 'AREMA DINAMO',
            'unit_id' => null,
            'kode_unit' => 'TL-01',
            'model_mesin' => 'LIGHTING TOWER',
            'nama_komponen' => 'GENERATOR HEAD',
            'status' => 'DIKIRIM',
        ]);

        $response = $this->actingAs($user)->get(route('repair.job-outside.pdf', $wo->id));
        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }
}
