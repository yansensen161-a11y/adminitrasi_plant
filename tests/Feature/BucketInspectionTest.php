<?php

namespace Tests\Feature;

use App\Models\PlantForm;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BucketInspectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'super-admin']);
    }

    public function test_user_can_view_bucket_inspection_index_page(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $response = $this->actingAs($user)->get(route('form-inspection-bucket.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('BucketInspection/Index'));
    }

    public function test_user_can_store_and_update_bucket_inspection_form(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'EX390-01',
            'model' => 'CAT 390F',
            'hm' => 6450.5,
        ]);

        $defaultItems = PlantForm::getBucketInspectionChecklistItems();
        $defaultItems[0]['mark'] = 'V';
        $defaultItems[0]['act'] = 'Good';

        $payload = [
            'form_number' => 'PLT/FRM/BKT/001',
            'project_id' => 'Harindo Wahana',
            'unit_id' => $unit->id,
            'date' => '2026-09-23',
            'smu' => 6450.5,
            'items' => $defaultItems,
            'results_data' => [
                'doc_number' => 'FM-PLT-BKT-01',
                'inspection_period' => 'Weekly',
                'brand' => 'Caterpillar',
            ],
            'notes' => 'Pemeriksaan bucket berkala mingguan.',
            'mechanic_name' => 'Budi Mekanik',
            'supervisor_name' => 'Agus SPV',
            'status' => 'COMPLETED',
        ];

        $response = $this->actingAs($user)->post(route('form-inspection-bucket.store'), $payload);
        $response->assertRedirect();

        $this->assertDatabaseHas('plant_forms', [
            'form_type' => 'BUCKET-INSPECTION',
            'form_number' => 'PLT/FRM/BKT/001',
            'unit_id' => $unit->id,
        ]);

        $form = PlantForm::where('form_type', 'BUCKET-INSPECTION')->first();
        $this->assertNotNull($form);

        // Test update
        $payload['notes'] = 'Update catatan bucket.';
        $updateResp = $this->actingAs($user)->put(route('form-inspection-bucket.update', $form->id), $payload);
        $updateResp->assertRedirect();

        $this->assertDatabaseHas('plant_forms', [
            'id' => $form->id,
            'notes' => 'Update catatan bucket.',
        ]);
    }

    public function test_user_can_view_print_and_blank_print(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'EX2000-02',
            'model' => 'PC2000-8',
        ]);

        $form = PlantForm::create([
            'form_type' => 'BUCKET-INSPECTION',
            'form_number' => 'PLT/FRM/BKT/002',
            'unit_id' => $unit->id,
            'date' => '2026-09-23',
            'items' => PlantForm::getBucketInspectionChecklistItems(),
            'created_by' => $user->id,
            'status' => 'COMPLETED',
        ]);

        // Regular print view
        $printResp = $this->actingAs($user)->get(route('form-inspection-bucket.print', $form->id));
        $printResp->assertStatus(200);
        $printResp->assertInertia(fn ($page) => $page->component('BucketInspection/Print'));

        // Blank print view
        $blankResp = $this->actingAs($user)->get(route('form-inspection-bucket.blank-print', ['unit_id' => $unit->id]));
        $blankResp->assertStatus(200);
        $blankResp->assertInertia(fn ($page) => $page->component('BucketInspection/Print'));
    }

    public function test_user_can_download_bucket_inspection_pdf(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'EX1250-01',
            'model' => 'PC1250-8',
        ]);

        $form = PlantForm::create([
            'form_type' => 'BUCKET-INSPECTION',
            'form_number' => 'PLT/FRM/BKT/003',
            'unit_id' => $unit->id,
            'date' => '2026-09-23',
            'items' => PlantForm::getBucketInspectionChecklistItems(),
            'created_by' => $user->id,
            'status' => 'COMPLETED',
        ]);

        $pdfResp = $this->actingAs($user)->get(route('form-inspection-bucket.download-pdf', ['id' => $form->id]));
        $pdfResp->assertStatus(200);
        $this->assertEquals('application/pdf', $pdfResp->headers->get('content-type'));
    }
}
