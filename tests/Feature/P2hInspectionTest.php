<?php

namespace Tests\Feature;

use App\Models\P2hInspection;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class P2hInspectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_p2h_monitoring_screen_can_be_rendered(): void
    {
        $user = User::first() ?? User::factory()->create();

        $response = $this->actingAs($user)->get('/inspection-unit');

        $response->assertStatus(200);
    }

    public function test_p2h_inspection_can_be_stored_and_deleted(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit = Unit::create([
            'id' => (string) Str::uuid(),
            'code_unit' => 'EX-999',
            'model' => 'Komatsu PC200',
            'hm' => 1234.5,
        ]);

        $response = $this->from('/inspection-unit')->actingAs($user)->post('/inspection-unit', [
            'unit_id' => $unit->id,
            'code_unit' => $unit->code_unit,
            'date' => now()->toDateString(),
            'hm' => 1234.5,
            'finding' => 'Baut track shoe kendur',
            'inspect_by' => 'Inspector Test',
            'action' => 'Kencangkan baut',
            'status' => 'OPEN',
        ]);

        $response->assertSessionHas('success');

        $inspection = P2hInspection::where('code_unit', 'EX-999')->latest('id')->first();
        $this->assertNotNull($inspection);
        $this->assertStringStartsWith('PLT/WO/INS/', $inspection->wo_number);

        $deleteResponse = $this->from('/inspection-unit')->actingAs($user)->delete("/inspection-unit/{$inspection->id}");
        $deleteResponse->assertSessionHas('success');
        $this->assertDatabaseMissing('p2h_inspections', ['id' => $inspection->id]);
    }

    public function test_p2h_inspection_can_be_stored_with_components_and_image(): void
    {
        Storage::fake('public');

        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit = Unit::create([
            'id' => (string) Str::uuid(),
            'code_unit' => 'DT-100',
            'model' => 'Hino 500',
            'hm' => 5000.0,
        ]);

        $fakeImage = UploadedFile::fake()->image('defect.jpg');

        $response = $this->from('/inspection-unit')->actingAs($user)->post('/inspection-unit', [
            'unit_id' => $unit->id,
            'code_unit' => $unit->code_unit,
            'date' => now()->toDateString(),
            'hm' => 5000.0,
            'component_group' => 'ENGINE',
            'component_name' => 'Turbocharger Seal',
            'priority' => 'P1',
            'finding' => 'Oli bocor pada intake turbocharger',
            'inspect_by' => 'Senior Mechanic',
            'action' => 'Ganti seal turbo',
            'status' => 'OPEN',
            'image' => $fakeImage,
        ]);

        $response->assertSessionHas('success');

        $inspection = P2hInspection::where('code_unit', 'DT-100')->latest('id')->first();
        $this->assertNotNull($inspection);
        $this->assertEquals('ENGINE', $inspection->component_group);
        $this->assertEquals('Turbocharger Seal', $inspection->component_name);
        $this->assertEquals('P1', $inspection->priority);
        $this->assertNotNull($inspection->image);
        $this->assertNotNull($inspection->image_url);
        Storage::disk('public')->assertExists($inspection->image);

        // Test updating with remove_image
        $updateResponse = $this->from('/inspection-unit')->actingAs($user)->post("/inspection-unit/{$inspection->id}", [
            '_method' => 'put',
            'wo_number' => $inspection->wo_number,
            'date' => now()->toDateString(),
            'hm' => 5050.0,
            'component_group' => 'ENGINE',
            'component_name' => 'Turbocharger Seal',
            'priority' => 'P2',
            'finding' => 'Oli bocor pada intake turbocharger - sudah dibersihkan',
            'inspect_by' => 'Senior Mechanic',
            'action' => 'Seal sudah diganti baru',
            'status' => 'CLOSED',
            'closed_by' => 'Foreman Plant',
            'remove_image' => true,
        ]);

        $updateResponse->assertSessionHas('success');
        $inspection->refresh();
        $this->assertEquals('CLOSED', $inspection->status);
        $this->assertEquals('P2', $inspection->priority);
        $this->assertNull($inspection->image);
    }

    public function test_p2h_export_can_be_downloaded(): void
    {
        $user = User::first() ?? User::factory()->create();

        $response = $this->actingAs($user)->get('/inspection-unit/export');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}
