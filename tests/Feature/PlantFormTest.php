<?php

namespace Tests\Feature;

use App\Models\PlantForm;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlantFormTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'super-admin']);
    }

    public function test_user_can_view_plant_forms_index_and_legacy_redirect(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        // New route /form-oht773
        $response = $this->actingAs($user)->get(route('form-oht773.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('PlantForm/Index'));

        // Legacy /form-plant redirects to /form-oht773
        $responseRedirect = $this->actingAs($user)->get('/form-plant');
        $responseRedirect->assertRedirect('/form-oht773');
    }

    public function test_user_can_view_plant_form_create_page(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'DT773-01',
            'model' => '773E',
            'type_unit' => 'OFF HIGHWAY TRUCK',
        ]);

        $response = $this->actingAs($user)->get(route('form-oht773.create', ['unit_id' => $unit->id]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('PlantForm/Create'));
    }

    public function test_user_can_store_plant_form(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'DT773-02',
            'model' => '773E',
            'type_unit' => 'OFF HIGHWAY TRUCK',
        ]);

        $defaultItems = PlantForm::getDefaultChecklistItems();

        $payload = [
            'form_type' => 'PM-773E',
            'form_number' => 'PLT/FRM/PM-773E/001',
            'project_id' => 'MAM',
            'unit_id' => $unit->id,
            'date' => '2026-09-21',
            'shift' => 'DS',
            'smu' => 1250.5,
            'service_type' => 'A',
            'oil_samples' => [
                'engine' => '21/09/2026',
                'transmission' => '21/09/2026',
                'differential_final_drive' => '21/09/2026',
                'hydraulic' => '21/09/2026',
            ],
            'items' => $defaultItems,
            'notes' => 'Inspeksi rutin berjalan lancar',
            'mechanic_name' => 'Budi Santoso',
            'supervisor_name' => 'Agus Prayitno',
            'status' => 'COMPLETED',
        ];

        $response = $this->actingAs($user)->post(route('form-oht773.store'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('plant_forms', [
            'form_number' => 'PLT/FRM/PM-773E/001',
            'unit_id' => $unit->id,
            'shift' => 'DS',
            'service_type' => 'A',
            'mechanic_name' => 'Budi Santoso',
        ]);
    }

    public function test_user_can_view_plant_form_show_and_print(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'DT773-03',
            'model' => '773E',
            'type_unit' => 'OFF HIGHWAY TRUCK',
        ]);

        $form = PlantForm::create([
            'form_type' => 'PM-773E',
            'form_number' => 'PLT/FRM/PM-773E/002',
            'project_id' => 'MAM',
            'unit_id' => $unit->id,
            'date' => '2026-09-21',
            'shift' => 'NS',
            'smu' => 2400.0,
            'service_type' => 'B',
            'items' => PlantForm::getDefaultChecklistItems(),
            'mechanic_name' => 'Eko Prasetyo',
            'supervisor_name' => 'Hendra',
            'status' => 'COMPLETED',
            'created_by' => $user->id,
        ]);

        // Show page
        $responseShow = $this->actingAs($user)->get(route('form-oht773.show', $form->id));
        $responseShow->assertStatus(200);
        $responseShow->assertInertia(fn ($page) => $page->component('PlantForm/Show'));

        // Print page (filled)
        $responsePrint = $this->actingAs($user)->get(route('form-oht773.print', $form->id));
        $responsePrint->assertStatus(200);
        $responsePrint->assertInertia(fn ($page) => $page->component('PlantForm/Print'));

        // Blank print page
        $responseBlank = $this->actingAs($user)->get(route('form-oht773.blank-print', ['unit_id' => $unit->id]));
        $responseBlank->assertStatus(200);
        $responseBlank->assertInertia(fn ($page) => $page->component('PlantForm/Print'));

        // Download PDF
        $responsePdf = $this->actingAs($user)->get(route('form-oht773.download-pdf', ['id' => $form->id]));
        $responsePdf->assertStatus(200);
        $responsePdf->assertHeader('content-type', 'application/pdf');
    }

    public function test_user_can_update_and_delete_plant_form(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'DT773-04',
            'model' => '773E',
            'type_unit' => 'OFF HIGHWAY TRUCK',
        ]);

        $form = PlantForm::create([
            'form_type' => 'PM-773E',
            'form_number' => 'PLT/FRM/PM-773E/003',
            'project_id' => 'MAM',
            'unit_id' => $unit->id,
            'date' => '2026-09-21',
            'shift' => 'DS',
            'smu' => 3000.0,
            'service_type' => 'C',
            'items' => PlantForm::getDefaultChecklistItems(),
            'mechanic_name' => 'Dedi',
            'supervisor_name' => 'Hendra',
            'status' => 'DRAFT',
            'created_by' => $user->id,
        ]);

        $updatePayload = [
            'project_id' => 'MAM REVISED',
            'unit_id' => $unit->id,
            'date' => '2026-09-21',
            'shift' => 'NS',
            'smu' => 3100.0,
            'service_type' => 'D',
            'items' => PlantForm::getDefaultChecklistItems(),
            'notes' => 'Updated after supervisor review',
            'mechanic_name' => 'Dedi Wijaya',
            'supervisor_name' => 'Hendra',
            'status' => 'COMPLETED',
        ];

        $responseUpdate = $this->actingAs($user)->put(route('form-oht773.update', $form->id), $updatePayload);
        $responseUpdate->assertRedirect(route('form-oht773.index', ['id' => $form->id]));

        $this->assertDatabaseHas('plant_forms', [
            'id' => $form->id,
            'shift' => 'NS',
            'service_type' => 'D',
            'mechanic_name' => 'Dedi Wijaya',
            'status' => 'COMPLETED',
        ]);

        // Test delete
        $responseDelete = $this->actingAs($user)->delete(route('form-oht773.destroy', $form->id));
        $responseDelete->assertRedirect(route('form-oht773.index'));
        $this->assertDatabaseMissing('plant_forms', ['id' => $form->id]);
    }
}
