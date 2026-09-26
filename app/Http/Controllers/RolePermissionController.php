<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RolePermissionController extends Controller
{
    /**
     * Display the Role & Permission Management dashboard.
     */
    public function index(Request $request): Response
    {
        $roles = Role::with(['permissions'])
            ->withCount('users')
            ->orderBy('id', 'asc')
            ->get();

        $permissions = Permission::orderBy('name', 'asc')->get();

        $searchUser = $request->query('user_search');
        $usersQuery = User::with('roles')->orderBy('name', 'asc');

        if ($searchUser) {
            $usersQuery->where(function ($q) use ($searchUser) {
                $q->where('name', 'like', "%{$searchUser}%")
                    ->orWhere('email', 'like', "%{$searchUser}%")
                    ->orWhere('nrp', 'like', "%{$searchUser}%")
                    ->orWhere('department', 'like', "%{$searchUser}%");
            });
        }

        $users = $usersQuery->paginate(15)->withQueryString();

        // Categorize permissions by module prefix (e.g. "work-orders.view" -> "work-orders")
        $permissionGroups = [];
        foreach ($permissions as $permission) {
            $parts = explode('.', $permission->name);
            if (count($parts) > 1) {
                $group = ucwords(str_replace(['-', '_'], ' ', $parts[0]));
            } else {
                $parts = explode(' ', $permission->name);
                $group = count($parts) > 1 ? ucwords($parts[1]) : 'General';
            }

            if (! isset($permissionGroups[$group])) {
                $permissionGroups[$group] = [];
            }
            $permissionGroups[$group][] = $permission;
        }

        return Inertia::render('Settings/RolePermission', [
            'roles' => $roles,
            'permissions' => $permissions,
            'permissionGroups' => $permissionGroups,
            'users' => $users,
            'userSearch' => $searchUser ?? '',
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function storeRole(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
        ]);

        if (strtolower($request->name) === 'super-admin') {
            return redirect()->back()->withErrors(['name' => 'Role super-admin adalah role inti sistem.']);
        }

        $role = Role::create([
            'name' => strtolower(trim($request->name)),
            'guard_name' => 'web',
        ]);

        if ($request->filled('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->back()->with('success', "Role '{$role->name}' berhasil dibuat.");
    }

    /**
     * Update an existing role.
     */
    public function updateRole(Request $request, Role $role): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,'.$role->id],
        ]);

        if ($role->name === 'super-admin') {
            return redirect()->back()->withErrors(['name' => 'Nama role super-admin tidak boleh diubah.']);
        }

        $role->update([
            'name' => strtolower(trim($request->name)),
        ]);

        return redirect()->back()->with('success', 'Nama role berhasil diperbarui.');
    }

    /**
     * Delete a role.
     */
    public function destroyRole(Role $role): RedirectResponse
    {
        if ($role->name === 'super-admin') {
            return redirect()->back()->with('error', 'Role super-admin adalah role inti sistem dan tidak dapat dihapus.');
        }

        $roleName = $role->name;
        $role->delete();

        return redirect()->back()->with('success', "Role '{$roleName}' berhasil dihapus.");
    }

    /**
     * Synchronize permissions assigned to a role.
     */
    public function syncRolePermissions(Request $request, Role $role): RedirectResponse
    {
        $request->validate([
            'permissions' => ['present', 'array'],
        ]);

        $role->syncPermissions($request->permissions);

        return redirect()->back()->with('success', "Hak akses untuk role '{$role->name}' berhasil diperbarui.");
    }

    /**
     * Store a new permission.
     */
    public function storePermission(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name'],
        ]);

        $permissionName = strtolower(trim($request->name));

        Permission::create([
            'name' => $permissionName,
            'guard_name' => 'web',
        ]);

        // Auto grant to super-admin
        $superAdmin = Role::where('name', 'super-admin')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo($permissionName);
        }

        return redirect()->back()->with('success', "Permission '{$permissionName}' berhasil dibuat.");
    }

    /**
     * Delete a permission.
     */
    public function destroyPermission(Permission $permission): RedirectResponse
    {
        $permName = $permission->name;
        $permission->delete();

        return redirect()->back()->with('success', "Permission '{$permName}' berhasil dihapus.");
    }

    /**
     * Assign or sync roles for a user.
     */
    public function syncUserRoles(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'roles' => ['present', 'array'],
        ]);

        $currentUser = auth()->user();
        $isSuperAdmin = $currentUser?->hasRole('super-admin');

        // Prevent non-super-admin from assigning super-admin
        if (! $isSuperAdmin && in_array('super-admin', $request->roles)) {
            return redirect()->back()->with('error', 'Hanya super-admin yang dapat memberikan role super-admin.');
        }

        // Prevent removing super-admin from the last super-admin
        if ($user->hasRole('super-admin') && ! in_array('super-admin', $request->roles)) {
            $superAdminCount = User::role('super-admin')->count();
            if ($superAdminCount <= 1) {
                return redirect()->back()->with('error', 'Tidak dapat mencabut role super-admin dari super-admin terakhir di sistem.');
            }
        }

        $user->syncRoles($request->roles);

        return redirect()->back()->with('success', "Role untuk pengguna {$user->name} berhasil diperbarui.");
    }

    /**
     * Seed recommended system permissions for Plant & Tyre operations.
     */
    public function seedRecommendedPermissions(): RedirectResponse
    {
        $permissions = [
            // Work Orders & Maintenance
            'work-orders.view', 'work-orders.create', 'work-orders.edit', 'work-orders.delete', 'work-orders.import', 'work-orders.export',
            'monitoring-order.view', 'monitoring-order.manage',
            'oil-consumption.view', 'oil-consumption.manage',
            'failure-analysis.view', 'failure-analysis.manage',
            // Operational Forms
            'p2h.view', 'p2h.manage',
            'washing.view', 'washing.manage',
            'spk.view', 'spk.manage',
            'checksheets.view', 'checksheets.manage',
            'claim-warranty.view', 'claim-warranty.manage',
            // Master PM & Inspection
            'pm-monitoring.view', 'pm-monitoring.manage',
            'plan-inspections.view', 'plan-inspections.manage',
            'pcr.view', 'pcr.manage',
            'ccr.view', 'ccr.manage',
            // Tyres & TireVault
            'tyres.view', 'tyres.create', 'tyres.edit', 'tyres.delete', 'tyres.rotate', 'tyres.remove',
            'tirevault.view', 'tirevault.manage',
            'tyre-pressure.view', 'tyre-pressure.manage',
            'tyre-inspections.view', 'tyre-inspections.manage',
            // Tools & Warehouse
            'toolroom.view', 'toolroom.manage',
            'parts.view', 'parts.manage',
            // Settings & Master Data
            'master-data.view', 'master-data.manage',
            'manpower.view', 'manpower.manage',
            'roles.manage', 'permissions.manage', 'users.manage',
            'navigation-menu.manage', 'settings.manage',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Grant all permissions to super-admin
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        return redirect()->back()->with('success', 'Rekomendasi hak akses (permissions) berhasil diperbarui dan disinkronkan ke super-admin.');
    }
}
