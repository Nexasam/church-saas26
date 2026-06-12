<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user()?->load('church', 'role');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id'               => $user->id,
                    'name'             => $user->name,
                    'email'            => $user->email,
                    'church_id'        => $user->church_id,
                    'is_super_admin'   => $user->is_super_admin,
                    'is_platform_admin'=> $user->is_platform_admin,
                    'status'           => $user->status,
                    'role'           => $user->role ? [
                        'id'   => $user->role->id,
                        'name' => $user->role->name,
                        'slug' => $user->role->slug,
                    ] : null,
                    'permissions'    => $user->flatPermissions(),
                ] : null,
            ],
            'church' => $user
                ? [
                    'id'                  => $user->church_id,
                    'name'                => $user->church?->name ?? 'My Church',
                    'theme_color'         => $user->church?->theme_color ?? 'blue',
                    'plan'                => $user->church?->payment_category ?? 'free',
                    'onboarding_complete' => (bool) $user->church?->onboarding_complete,
                ]
                : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'impersonating' => $request->session()->has('impersonating_as'),
        ];
    }
}
