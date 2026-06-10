<?php

namespace App\Http\Controllers;

use App\Models\AdminInvitation;
use App\Models\Role;
use App\Models\User;
use App\Notifications\AdminInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * List all admin users + roles for this church.
     */
    public function index()
    {
        $this->authorizeAdmin();

        $admins = User::with('role')
            ->withoutGlobalScopes()
            ->where('church_id', auth()->user()->church_id)
            ->orderByDesc('is_super_admin')
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => $this->formatUser($u));

        $roles = Role::withoutGlobalScopes()
            ->where('church_id', auth()->user()->church_id)
            ->orderBy('name')
            ->get();

        $pendingInvitations = AdminInvitation::with('role')
            ->where('church_id', auth()->user()->church_id)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($inv) => [
                'id'         => $inv->id,
                'email'      => $inv->email,
                'name'       => $inv->name,
                'role'       => $inv->role?->only(['id', 'name', 'slug']),
                'expires_at' => $inv->expires_at->toDateTimeString(),
                'created_at' => $inv->created_at->toDateTimeString(),
            ]);

        return Inertia::render('admin', [
            'admins'             => $admins,
            'roles'              => $roles,
            'pendingInvitations' => $pendingInvitations,
            'modules'            => Role::allModules(),
            'canManageRoles'     => auth()->user()->isSuperAdmin() || auth()->user()->hasPermission('admin', 'manage_roles'),
        ]);
    }

    /**
     * Invite a new admin user.
     */
    public function invite(Request $request)
    {
        $this->authorizeAdmin('invite');

        $validated = $request->validate([
            'email'   => ['required', 'email', 'max:255'],
            'name'    => ['nullable', 'string', 'max:255'],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
        ]);

        $churchId = auth()->user()->church_id;

        // Check if user already exists in this church
        $existing = User::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->where('email', $validated['email'])
            ->first();

        if ($existing) {
            return back()->withErrors(['email' => 'This user is already an admin of your church.']);
        }

        // Upsert invitation (re-invite if previous expired)
        $invitation = AdminInvitation::updateOrCreate(
            ['church_id' => $churchId, 'email' => $validated['email']],
            [
                'invited_by'  => auth()->id(),
                'role_id'     => $validated['role_id'],
                'name'        => $validated['name'],
                'token'       => AdminInvitation::generateToken(),
                'accepted_at' => null,
                'expires_at'  => now()->addDays(7),
            ]
        );

        // Send invitation email via anonymous notifiable
        \Illuminate\Support\Facades\Notification::route('mail', $invitation->email)
            ->notify(new AdminInvitationNotification($invitation));

        return back()->with('success', "Invitation sent to {$validated['email']}.");
    }

    /**
     * Accept an invitation and set up the user account.
     */
    public function acceptInvitation(Request $request, string $token)
    {
        $invitation = AdminInvitation::with(['church', 'role'])
            ->where('token', $token)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        if ($request->isMethod('get')) {
            return Inertia::render('auth/accept-invitation', [
                'invitation' => [
                    'token'       => $token,
                    'email'       => $invitation->email,
                    'name'        => $invitation->name,
                    'church_name' => $invitation->church->name,
                    'role_name'   => $invitation->role?->name,
                ],
            ]);
        }

        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // Check if user with this email already exists (Google sign-in etc.)
        $user = User::withoutGlobalScopes()->firstOrCreate(
            ['email' => $invitation->email],
            [
                'name'              => $validated['name'],
                'password'          => Hash::make($validated['password']),
                'church_id'         => $invitation->church_id,
                'role_id'           => $invitation->role_id,
                'is_super_admin'    => false,
                'status'            => 'active',
                'email_verified_at' => now(),
            ]
        );

        // If user existed, update church + role
        if (! $user->wasRecentlyCreated) {
            $user->update([
                'church_id'   => $invitation->church_id,
                'role_id'     => $invitation->role_id,
                'status'      => 'active',
            ]);
        }

        $invitation->update(['accepted_at' => now()]);

        auth()->login($user, true);

        return redirect()->route('dashboard')->with('success', 'Welcome! Your account has been set up.');
    }

    /**
     * Update a user's role.
     */
    public function updateRole(Request $request, User $user)
    {
        $this->authorizeAdmin('manage_roles');
        $this->assertSameChurch($user);

        $validated = $request->validate([
            'role_id' => ['required', 'integer', 'exists:roles,id'],
        ]);

        // Can't change super admin's role via this endpoint
        if ($user->is_super_admin) {
            return back()->withErrors(['role_id' => 'Cannot change the super admin role.']);
        }

        $user->update(['role_id' => $validated['role_id']]);

        return back()->with('success', 'Role updated.');
    }

    /**
     * Suspend or reactivate a user.
     */
    public function toggleStatus(User $user)
    {
        $this->authorizeAdmin();
        $this->assertSameChurch($user);

        if ($user->is_super_admin) {
            return back()->withErrors(['status' => 'Cannot suspend the super admin.']);
        }

        $user->update([
            'status' => $user->status === 'suspended' ? 'active' : 'suspended',
        ]);

        return back()->with('success', $user->status === 'active' ? 'User reactivated.' : 'User suspended.');
    }

    /**
     * Revoke a pending invitation.
     */
    public function revokeInvitation(AdminInvitation $invitation)
    {
        $this->authorizeAdmin('invite');

        if ($invitation->church_id !== auth()->user()->church_id) {
            abort(403);
        }

        $invitation->delete();

        return back()->with('success', 'Invitation revoked.');
    }

    // ─── Private Helpers ───────────────────────────────────────────────────

    private function authorizeAdmin(string $permission = 'view'): void
    {
        $user = auth()->user();
        if (! $user->isSuperAdmin() && ! $user->hasPermission('admin', $permission)) {
            abort(403, 'You do not have permission to access admin management.');
        }
    }

    private function assertSameChurch(User $target): void
    {
        if ($target->church_id !== auth()->user()->church_id) {
            abort(403);
        }
    }

    private function formatUser(User $u): array
    {
        return [
            'id'            => $u->id,
            'name'          => $u->name,
            'email'         => $u->email,
            'initials'      => $this->initials($u->name),
            'is_super_admin'=> $u->is_super_admin,
            'status'        => $u->status,
            'last_login_at' => $u->last_login_at?->toDateTimeString(),
            'created_at'    => $u->created_at->toDateTimeString(),
            'role'          => $u->role ? [
                'id'   => $u->role->id,
                'name' => $u->role->name,
                'slug' => $u->role->slug,
            ] : null,
        ];
    }

    private function initials(string $name): string
    {
        $parts = explode(' ', trim($name));
        $initials = '';
        foreach (array_slice($parts, 0, 2) as $part) {
            $initials .= strtoupper(substr($part, 0, 1));
        }
        return $initials;
    }
}
