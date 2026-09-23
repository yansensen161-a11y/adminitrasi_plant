<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->latest()->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        $isSuperAdmin = auth()->user()?->hasRole('super-admin');
        $roles = $isSuperAdmin ? Role::all() : Role::where('name', '!=', 'super-admin')->get();

        return Inertia::render('Users/Create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'roles' => 'array',
        ]);

        $isSuperAdmin = auth()->user()?->hasRole('super-admin');

        // Prevent non-super-admin from assigning super-admin role
        if (! $isSuperAdmin && in_array('super-admin', $request->roles ?? [])) {
            abort(403, 'Akses ditolak: Hanya super-admin yang dapat menetapkan role super-admin.');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return redirect()->route('users.index')->with('message', 'User created successfully.');
    }

    public function edit(User $user)
    {
        $currentUser = auth()->user();
        $isSuperAdmin = $currentUser?->hasRole('super-admin');

        // Non-super-admin cannot edit a super-admin user
        if ($user->hasRole('super-admin') && ! $isSuperAdmin) {
            abort(403, 'Akses ditolak: Hanya super-admin yang dapat mengedit data pengguna super-admin.');
        }

        $user->load('roles');
        $roles = $isSuperAdmin ? Role::all() : Role::where('name', '!=', 'super-admin')->get();

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $currentUser = auth()->user();
        $isSuperAdmin = $currentUser?->hasRole('super-admin');

        // Prevent non-super-admin from editing a super-admin user
        if ($user->hasRole('super-admin') && ! $isSuperAdmin) {
            abort(403, 'Akses ditolak: Hanya super-admin yang dapat mengedit data pengguna super-admin.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'roles' => 'array',
        ]);

        // Prevent non-super-admin from granting or removing super-admin role
        if (! $isSuperAdmin && in_array('super-admin', $request->roles ?? [])) {
            abort(403, 'Akses ditolak: Hanya super-admin yang dapat menetapkan role super-admin.');
        }

        // Prevent removing super-admin from the last super-admin in the system
        if ($user->hasRole('super-admin') && ! in_array('super-admin', $request->roles ?? [])) {
            $superAdminCount = User::role('super-admin')->count();
            if ($superAdminCount <= 1) {
                return redirect()->back()->withErrors(['roles' => 'Tidak dapat mencabut role super-admin terakhir di sistem.']);
            }
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['confirmed', Rules\Password::defaults()],
            ]);
            $user->update(['password' => Hash::make($request->password)]);
        }

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return redirect()->route('users.index')->with('message', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Cannot delete yourself.');
        }

        $isSuperAdmin = auth()->user()?->hasRole('super-admin');

        // Non-super-admin cannot delete a super-admin
        if ($user->hasRole('super-admin') && ! $isSuperAdmin) {
            abort(403, 'Akses ditolak: Hanya super-admin yang dapat menghapus akun super-admin.');
        }

        // Prevent deleting the last super-admin
        if ($user->hasRole('super-admin')) {
            $superAdminCount = User::role('super-admin')->count();
            if ($superAdminCount <= 1) {
                return redirect()->back()->with('error', 'Tidak dapat menghapus super-admin terakhir di sistem.');
            }
        }

        $user->delete();

        return redirect()->route('users.index')->with('message', 'User deleted successfully.');
    }
}
