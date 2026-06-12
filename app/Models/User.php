<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Passkeys\PasskeyAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, PasskeyAuthenticatable;

    protected $guarded = [];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'last_login_at'      => 'datetime',
            'password'           => 'hashed',
            'is_super_admin'     => 'boolean',
            'is_platform_admin'  => 'boolean',
        ];
    }

    // ─── Relationships ─────────────────────────────────────────────────────

    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    // ─── Permission Helpers ────────────────────────────────────────────────

    /**
     * Check if user can perform an action on a module.
     * Super admins bypass all checks.
     *
     * Usage: $user->can('finance', 'reconcile')
     */
    public function hasPermission(string $module, string $action): bool
    {
        if ($this->is_super_admin) {
            return true;
        }

        if (! $this->role) {
            return false;
        }

        return $this->role->can($module, $action);
    }

    /**
     * Check if user has ANY permission on a module (for sidebar visibility).
     */
    public function canAccessModule(string $module): bool
    {
        if ($this->is_super_admin) {
            return true;
        }

        if (! $this->role) {
            return false;
        }

        $permissions = $this->role->permissions ?? [];
        return ! empty($permissions[$module] ?? []);
    }

    /**
     * Flat permissions array for the frontend.
     * e.g. ["finance.view", "finance.reconcile", "members.view"]
     */
    public function flatPermissions(): array
    {
        if ($this->is_super_admin) {
            return ['*'];
        }

        if (! $this->role) {
            return [];
        }

        $flat = [];
        foreach ($this->role->permissions ?? [] as $module => $actions) {
            foreach ($actions as $action) {
                $flat[] = "{$module}.{$action}";
            }
        }

        return $flat;
    }

    public function isSuperAdmin(): bool
    {
        return (bool) $this->is_super_admin;
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }
}
