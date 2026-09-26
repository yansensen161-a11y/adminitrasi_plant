<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalDeckTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_portal_deck(): void
    {
        $response = $this->get(route('portal.index'));
        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_accessing_portal_is_redirected_to_dashboard(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $response = $this->actingAs($user)->get(route('portal.index'));

        $response->assertRedirect(route('dashboard'));
    }
}
