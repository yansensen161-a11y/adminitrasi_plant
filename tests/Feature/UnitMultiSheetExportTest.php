<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnitMultiSheetExportTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_user_can_export_multi_sheet_excel_for_selected_unit(): void
    {
        $user = $this->createAdminUser();
        $unit = Unit::create([
            'code_unit' => 'MDT-001',
            'model' => 'ACTROS 4043 AK',
            'type_unit' => 'DUMP TRUCK',
            'sn_chassis' => 'WDB9540321K',
            'hm' => 1250.5,
            'status' => 'Operational',
            'location' => 'Kubar',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('units.export.multi-sheet', ['unit_id' => $unit->id]));

        $response->assertOk();
        $this->assertSame(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            $response->headers->get('Content-Type')
        );
        $this->assertStringContainsString('Riwayat_Lengkap_MDT-001', $response->headers->get('Content-Disposition') ?? '');
    }

    public function test_user_can_export_multi_sheet_excel_without_unit_id_defaults_to_first_unit(): void
    {
        $user = $this->createAdminUser();
        Unit::create([
            'code_unit' => 'EX-200',
            'model' => 'PC200-8',
            'type_unit' => 'EXCAVATOR',
            'hm' => 5000,
            'status' => 'Operational',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('units.export.multi-sheet'));

        $response->assertOk();
        $this->assertSame(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            $response->headers->get('Content-Type')
        );
    }
}
