<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuratPermintaanKomponenTest extends TestCase
{
    use RefreshDatabase;

    public function test_surat_permintaan_komponen_index_renders_successfully(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit = Unit::create([
            'code_unit' => 'EX393',
            'type_unit' => 'EXCAVATOR',
            'model' => 'HITACHI ZX200',
            'hm' => 5000.0,
        ]);

        $response = $this->actingAs($user)->get(route('form-surat-permintaan-komponen.index'));

        $response->assertStatus(200);
    }

    public function test_download_pdf_via_get_returns_pdf_stream(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit = Unit::create([
            'code_unit' => 'EX393',
            'type_unit' => 'EXCAVATOR',
            'model' => 'HITACHI ZX200',
            'hm' => 5000.0,
        ]);

        $response = $this->actingAs($user)->get(route('form-surat-permintaan-komponen.download-pdf', [
            'unit_id' => $unit->id,
            'form_number' => 'MEMO/TEST/2026/001',
        ]));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_download_pdf_via_post_with_custom_items_returns_pdf(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit = Unit::create([
            'code_unit' => 'EX393',
            'type_unit' => 'EXCAVATOR',
            'model' => 'HITACHI ZX200',
            'hm' => 5000.0,
        ]);

        $items = [
            [
                'component_name' => 'Cylinder Arm Assembly',
                'part_number' => '4658930',
                'unit_request' => 'HITACHI ZX200 – EX393',
                'unit_source' => 'EX395 - Site BBE',
                'qty' => 1,
            ],
        ];

        $resultsData = [
            'perihal' => 'Permohonan Permintaan Parts / Komponen',
            'recipient_name' => 'Bpk. Slamet',
            'recipient_company' => 'PT MAM Site BBE',
            'sig_maker_name' => 'Yansen',
            'sig_maker_role' => 'Planner',
        ];

        $response = $this->actingAs($user)->post(route('form-surat-permintaan-komponen.download-pdf'), [
            'unit_id' => $unit->id,
            'form_number' => 'MEMO/PLT/2026/099',
            'items' => json_encode($items),
            'results_data' => json_encode($resultsData),
        ]);

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }
}
