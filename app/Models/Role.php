<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $guarded = [];

    protected $casts = [
        'permissions' => 'array',
        'is_system'   => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new ChurchScope);

        // Auto-inject church_id on creation
        static::creating(function (self $role) {
            if (! $role->church_id && auth()->check()) {
                $role->church_id = auth()->user()->church_id;
            }
        });
    }

    // ─── Relationships ─────────────────────────────────────────────────────

    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    /**
     * Check if this role has a specific permission on a module.
     * e.g. $role->can('finance', 'reconcile')
     */
    public function can(string $module, string $action): bool
    {
        $permissions = $this->permissions ?? [];
        return in_array($action, $permissions[$module] ?? []);
    }

    /**
     * All available modules and their possible actions.
     */
    public static function allModules(): array
    {
        return [
            'dashboard'   => ['view'],
            'members'     => ['view', 'create', 'edit', 'delete'],
            'followups'   => ['view', 'create', 'edit', 'delete', 'assign'],
            'evangelism'  => ['view', 'create', 'edit'],
            'finance'     => ['view', 'create', 'edit', 'delete', 'reconcile'],
            'departments' => ['view', 'create', 'edit', 'delete'],
            'care'        => ['view', 'create', 'edit', 'assign', 'close'],
            'sms'         => ['view', 'send'],
            'admin'       => ['view', 'invite', 'manage_roles'],
            'settings'    => ['view', 'edit'],
        ];
    }

    /**
     * Seed default system roles for a newly onboarded church.
     */
    public static function seedForChurch(int $churchId): void
    {
        $defaults = [
            [
                'name'        => 'Super Admin',
                'slug'        => 'super_admin',
                'is_system'   => true,
                'permissions' => collect(self::allModules())
                    ->map(fn ($actions) => $actions)
                    ->all(),
            ],
            [
                'name'      => 'Admin',
                'slug'      => 'admin',
                'is_system' => true,
                'permissions' => [
                    'dashboard'   => ['view'],
                    'members'     => ['view', 'create', 'edit'],
                    'followups'   => ['view', 'create', 'edit', 'assign'],
                    'evangelism'  => ['view', 'create', 'edit'],
                    'finance'     => ['view'],
                    'departments' => ['view', 'create', 'edit'],
                    'care'        => ['view', 'create', 'edit', 'assign'],
                    'sms'         => ['view', 'send'],
                    'admin'       => ['view'],
                    'settings'    => ['view'],
                ],
            ],
            [
                'name'      => 'Pastor',
                'slug'      => 'pastor',
                'is_system' => true,
                'permissions' => [
                    'dashboard'   => ['view'],
                    'members'     => ['view', 'edit'],
                    'followups'   => ['view', 'edit'],
                    'evangelism'  => ['view'],
                    'finance'     => ['view'],
                    'departments' => ['view'],
                    'care'        => ['view', 'create', 'edit', 'assign', 'close'],
                    'sms'         => ['view'],
                    'admin'       => [],
                    'settings'    => ['view'],
                ],
            ],
            [
                'name'      => 'Finance Officer',
                'slug'      => 'finance',
                'is_system' => true,
                'permissions' => [
                    'dashboard'   => ['view'],
                    'members'     => ['view'],
                    'followups'   => [],
                    'evangelism'  => [],
                    'finance'     => ['view', 'create', 'edit', 'reconcile'],
                    'departments' => [],
                    'care'        => [],
                    'sms'         => [],
                    'admin'       => [],
                    'settings'    => [],
                ],
            ],
            [
                'name'      => 'Worker',
                'slug'      => 'worker',
                'is_system' => true,
                'permissions' => [
                    'dashboard'   => ['view'],
                    'members'     => ['view'],
                    'followups'   => ['view', 'create', 'edit'],
                    'evangelism'  => ['view', 'create'],
                    'finance'     => [],
                    'departments' => ['view'],
                    'care'        => ['view'],
                    'sms'         => [],
                    'admin'       => [],
                    'settings'    => [],
                ],
            ],
            [
                'name'      => 'Viewer',
                'slug'      => 'viewer',
                'is_system' => true,
                'permissions' => [
                    'dashboard'   => ['view'],
                    'members'     => ['view'],
                    'followups'   => ['view'],
                    'evangelism'  => ['view'],
                    'finance'     => [],
                    'departments' => ['view'],
                    'care'        => ['view'],
                    'sms'         => [],
                    'admin'       => [],
                    'settings'    => [],
                ],
            ],
        ];

        foreach ($defaults as $data) {
            self::withoutGlobalScopes()->firstOrCreate(
                ['church_id' => $churchId, 'slug' => $data['slug']],
                array_merge($data, ['church_id' => $churchId])
            );
        }
    }
}
