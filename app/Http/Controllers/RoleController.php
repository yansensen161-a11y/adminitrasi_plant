<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->latest()->get();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
        ]);
    }

    public function create()
    {
        $permissions = Permission::all();

        return Inertia::render('Roles/Create', [
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array',
        ]);

        if (strtolower($request->name) === 'super-admin') {
            return redirect()->back()->withErrors(['name' => 'Role super-admin adalah role inti sistem.']);
        }

        $role = Role::create(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('roles.index')->with('message', 'Role created successfully.');
    }

    public function edit(Role $role)
    {
        if ($role->name === 'super-admin' && ! auth()->user()?->hasRole('super-admin')) {
            abort(403, 'Akses ditolak: Hanya super-admin yang dapat mengedit role super-admin.');
        }

        $role->load('permissions');
        $permissions = Permission::all();

        return Inertia::render('Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,'.$role->id,
            'permissions' => 'array',
        ]);

        if ($role->name === 'super-admin' && ! auth()->user()?->hasRole('super-admin')) {
            abort(403, 'Akses ditolak: Hanya super-admin yang dapat mengedit role super-admin.');
        }

        if ($role->name === 'super-admin' && $request->name !== 'super-admin') {
            return redirect()->back()->withErrors(['name' => 'Nama role super-admin tidak boleh diubah.']);
        }

        $role->update(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('roles.index')->with('message', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'super-admin') {
            return redirect()->back()->with('error', 'Role super-admin adalah role inti sistem dan tidak dapat dihapus.');
        }

        if (! auth()->user()?->hasRole('super-admin')) {
            abort(403, 'Akses ditolak: Hanya super-admin yang dapat menghapus role.');
        }

        $role->delete();

        return redirect()->route('roles.index')->with('message', 'Role deleted successfully.');
    }
}
