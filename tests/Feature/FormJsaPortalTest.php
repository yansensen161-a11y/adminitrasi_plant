<?php

namespace Tests\Feature;

use App\Models\PlantForm;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FormJsaPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_jsa_portal(): void
    {
        $response = $this->get(route('form-jsa.portal'));
        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_jsa_portal_with_valid_cards(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit = Unit::create([
            'code_unit' => 'DT101',
            'type_unit' => 'DUMP TRUCK',
            'model' => 'HINO 500',
            'hm' => 5000.0,
        ]);

        // Create sample JSA form
        PlantForm::create([
            'form_type' => 'FORM-JSA',
            'form_number' => 'JSA/TEST/2026/001',
            'service_type' => 'overhaul-starting-motor',
            'unit_id' => $unit->id,
            'date' => now()->toDateString(),
            'shift' => '1',
            'items' => [],
            'results_data' => [
                'task_slug' => 'overhaul-starting-motor',
                'task_name' => 'OVERHAUL STARTING MOTOR',
            ],
            'status' => 'COMPLETED',
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->get(route('form-jsa.portal'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('FormJsa/Portal')
            ->has('stats')
            ->has('cards', 4)
            ->where('cards.0.slug', 'overhaul-starting-motor')
            ->where('cards.1.slug', 'maintenance-ac-dump-truck')
            ->where('cards.2.slug', 'radiator-medium-truck')
            ->where('cards.3.slug', 'welding-chasis-medium-truck')
            ->has('recentForms')
            ->has('allPresets')
        );
    }
}
