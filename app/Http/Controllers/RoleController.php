<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    /**
     * Create a new custom role.
     */
    public function store(Request $request)
    {
        $this->authorizeRoleManagement();

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'permissions' => ['required', 'array'],
        ]);

        $slug = Str::slug($validated['name'], '_');

        // Ensure slug is unique within the church
        $exists = Role::withoutGlobalScopes()
            ->where('church_id', auth()->user()->church_id)
            ->where('slug', $slug)
            ->exists();

        if ($exists) {
            return back()->withErrors(['name' => 'A role with this name already exists.']);
        }

        Role::create([
            'name'        => $validated['name'],
            'slug'        => $slug,
            'permissions' => $validated['permissions'],
            'is_system'   => false,
        ]);

        return back()->with('success', "Role \"{$validated['name']}\" created.");
    }

    /**
     * Update an existing custom role's permissions.
     */
    public function update(Request $request, Role $role)
    {
        $this->authorizeRoleManagement();
        $this->assertSameChurch($role);

        if ($role->is_system) {
            return back()->withErrors(['role' => 'System roles cannot be modified.']);
        }

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:100'],
            'permissions' => ['required', 'array'],
        ]);

        $role->update($validated);

        return back()->with('success', 'Role updated.');
    }

    /**
     * Delete a custom role.
     */
    public function destroy(Role $role)
    {
        $this->authorizeRoleManagement();
        $this->assertSameChurch($role);

        if ($role->is_system) {
            return back()->withErrors(['role' => 'System roles cannot be deleted.']);
        }

        // Unassign the role from any users first
        $role->users()->update(['role_id' => null]);

        $role->delete();

        return back()->with('success', 'Role deleted.');
    }

    private function authorizeRoleManagement(): void
    {
        $user = auth()->user();
        if (! $user->isSuperAdmin() && ! $user->hasPermission('admin', 'manage_roles')) {
            abort(403);
        }
    }

    private function assertSameChurch(Role $role): void
    {
        if ($role->church_id !== auth()->user()->church_id) {
            abort(403);
        }
    }
}
