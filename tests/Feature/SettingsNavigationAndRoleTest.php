<?php

namespace Tests\Feature;

use App\Models\NavigationMenu;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsNavigationAndRoleTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $this->user->assignRole($superAdmin);
    }

    public function test_authenticated_user_can_view_menu_builder(): void
    {
        $response = $this->actingAs($this->user)->get(route('settings.menus.index'));

        $response->assertOk();
    }

    public function test_user_can_create_menu_and_submenu(): void
    {
        $response = $this->actingAs($this->user)->post(route('settings.menus.store'), [
            'portal_id' => 'plant-fleet',
            'name' => 'Test Fleet Menu',
            'href' => '/test-fleet',
            'section_label' => 'OPERATIONAL',
            'icon_key' => 'mcc',
            'is_active' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('navigation_menus', [
            'name' => 'Test Fleet Menu',
            'href' => '/test-fleet',
            'portal_id' => 'plant-fleet',
        ]);

        $parent = NavigationMenu::where('name', 'Test Fleet Menu')->first();

        $subResponse = $this->actingAs($this->user)->post(route('settings.menus.store'), [
            'portal_id' => 'plant-fleet',
            'parent_id' => $parent->id,
            'name' => 'Test Fleet Submenu',
            'href' => '/test-fleet/sub',
            'section_label' => 'OPERATIONAL',
            'icon_key' => 'planInspect',
            'is_active' => true,
        ]);

        $subResponse->assertSessionHas('success');
        $this->assertDatabaseHas('navigation_menus', [
            'name' => 'Test Fleet Submenu',
            'parent_id' => $parent->id,
        ]);
    }

    public function test_user_can_reorder_menus(): void
    {
        $menu1 = NavigationMenu::create([
            'portal_id' => 'plant-fleet',
            'name' => 'Menu 1',
            'href' => '/menu-1',
            'order' => 1,
            'is_active' => true,
        ]);

        $menu2 = NavigationMenu::create([
            'portal_id' => 'plant-fleet',
            'name' => 'Menu 2',
            'href' => '/menu-2',
            'order' => 2,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)->post(route('settings.menus.reorder'), [
            'items' => [
                ['id' => $menu1->id, 'order' => 2, 'parent_id' => null, 'section_label' => null],
                ['id' => $menu2->id, 'order' => 1, 'parent_id' => null, 'section_label' => null],
            ],
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals(2, $menu1->fresh()->order);
        $this->assertEquals(1, $menu2->fresh()->order);
    }

    public function test_user_can_quick_update_menu_icon(): void
    {
        $menu = NavigationMenu::create([
            'portal_id' => 'plant-fleet',
            'name' => 'Menu Tyre',
            'href' => '/tyre-monitoring',
            'icon_key' => 'mcc',
            'order' => 1,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)->patch(route('settings.menus.icon', $menu->id), [
            'icon_key' => 'tyre',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('tyre', $menu->fresh()->icon_key);
    }

    public function test_user_can_update_branding_settings(): void
    {
        $response = $this->actingAs($this->user)->post(route('settings.branding.update'), [
            'app_title_main' => 'MINE TECH PLANT',
            'app_title_sub' => 'ENTERPRISE',
            'app_tagline' => 'EQUIPMENT MANAGEMENT',
            'preset_logo' => '/images/planner_logo.jpg',
            'preset_favicon' => '/images/favicon.png',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('settings', [
            'key' => 'app_title_main',
            'value' => 'MINE TECH PLANT',
        ]);
        $this->assertDatabaseHas('settings', [
            'key' => 'app_title_sub',
            'value' => 'ENTERPRISE',
        ]);
        $this->assertDatabaseHas('settings', [
            'key' => 'app_tagline',
            'value' => 'EQUIPMENT MANAGEMENT',
        ]);
        $this->assertDatabaseHas('settings', [
            'key' => 'app_logo',
            'value' => '/images/planner_logo.jpg',
        ]);
        $this->assertDatabaseHas('settings', [
            'key' => 'app_favicon',
            'value' => '/images/favicon.png',
        ]);
    }

    public function test_authenticated_user_can_view_role_permission_hub(): void
    {
        $response = $this->actingAs($this->user)->get(route('settings.roles-permissions.index'));

        $response->assertOk();
    }

    public function test_user_can_create_role_and_sync_permissions(): void
    {
        $perm = Permission::firstOrCreate(['name' => 'work-orders.create', 'guard_name' => 'web']);

        $response = $this->actingAs($this->user)->post(route('settings.roles.store'), [
            'name' => 'planner-mechanic',
            'permissions' => [$perm->name],
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('roles', ['name' => 'planner-mechanic']);

        $role = Role::where('name', 'planner-mechanic')->first();
        $this->assertTrue($role->hasPermissionTo('work-orders.create'));
    }

    public function test_user_can_sync_roles_to_another_user(): void
    {
        $targetUser = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'planner', 'guard_name' => 'web']);

        $response = $this->actingAs($this->user)->post(route('settings.users.sync-roles', $targetUser->id), [
            'roles' => ['planner'],
        ]);

        $response->assertSessionHas('success');
        $this->assertTrue($targetUser->fresh()->hasRole('planner'));
    }
}
