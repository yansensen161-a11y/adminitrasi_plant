<?php

namespace Tests\Feature;

use App\Models\OrganizationNode;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_organization_page_is_displayed_for_authenticated_user(): void
    {
        $user = $this->createAdminUser();

        $response = $this
            ->actingAs($user)
            ->get(route('organization.index'));

        $response->assertOk();
    }

    public function test_user_can_create_organization_node_with_vacant_members(): void
    {
        $user = $this->createAdminUser();

        $payload = [
            'jabatan' => 'SERVICEMAN II',
            'parent_id' => null,
            'members' => [
                ['name' => 'Budi', 'is_vacant' => false],
                ['name' => 'Vacant', 'is_vacant' => true],
            ],
        ];

        $response = $this
            ->actingAs($user)
            ->post(route('organization.store'), $payload);

        $response->assertSessionHasNoErrors();

        $node = OrganizationNode::where('jabatan', 'SERVICEMAN II')->first();
        $this->assertNotNull($node);
        $this->assertCount(2, $node->members);
        $this->assertFalse($node->members[0]['is_vacant']);
        $this->assertSame('Budi', $node->members[0]['name']);
        $this->assertTrue($node->members[1]['is_vacant']);
        $this->assertSame('Vacant', $node->members[1]['name']);
        $this->assertFalse($node->is_vacant);
        $this->assertSame('Budi', $node->name);
    }

    public function test_user_can_update_organization_node_and_toggle_vacant(): void
    {
        $user = $this->createAdminUser();
        $node = OrganizationNode::create([
            'jabatan' => 'SERVICEMAN I',
            'name' => 'Anto',
            'is_vacant' => false,
            'members' => [
                ['name' => 'Anto', 'is_vacant' => false],
            ],
        ]);

        $payload = [
            'jabatan' => 'SERVICEMAN I',
            'parent_id' => null,
            'members' => [
                ['name' => 'Vacant', 'is_vacant' => true],
            ],
        ];

        $response = $this
            ->actingAs($user)
            ->put(route('organization.update', $node->id), $payload);

        $response->assertSessionHasNoErrors();

        $node->refresh();
        $this->assertTrue($node->is_vacant);
        $this->assertSame('Vacant', $node->name);
        $this->assertTrue($node->members[0]['is_vacant']);
        $this->assertSame('Vacant', $node->members[0]['name']);
    }

    public function test_user_can_unvacant_member_and_assign_real_name(): void
    {
        $user = $this->createAdminUser();
        $node = OrganizationNode::create([
            'jabatan' => 'INSPECTOR',
            'name' => 'Vacant',
            'is_vacant' => true,
            'members' => [
                ['name' => 'Vacant', 'is_vacant' => true],
            ],
        ]);

        $payload = [
            'jabatan' => 'INSPECTOR',
            'parent_id' => null,
            'members' => [
                ['name' => 'John Doe', 'is_vacant' => false],
            ],
        ];

        $response = $this
            ->actingAs($user)
            ->put(route('organization.update', $node->id), $payload);

        $response->assertSessionHasNoErrors();

        $node->refresh();
        $this->assertFalse($node->is_vacant);
        $this->assertSame('John Doe', $node->name);
        $this->assertFalse($node->members[0]['is_vacant']);
        $this->assertSame('John Doe', $node->members[0]['name']);
    }
}
