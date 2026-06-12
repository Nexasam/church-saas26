<?php

namespace App\Http\Middleware;

use App\Models\Church;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingComplete
{
    /**
     * Routes that are accessible even if onboarding is not complete.
     */
    private array $except = [
        'onboarding',
        'onboarding/*',
        'platform',
        'platform/*',
        'logout',
        'settings/*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Platform admins bypass onboarding check entirely
        if ($user->is_platform_admin) {
            return $next($request);
        }

        // When impersonating, skip the onboarding check so platform admin
        // can view churches that haven't completed onboarding
        if ($request->session()->has('impersonating_as')) {
            return $next($request);
        }

        // Check if any except pattern matches
        foreach ($this->except as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        $church = Church::find($user->church_id);

        if (! $church?->onboarding_complete) {
            return redirect()->route('onboarding');
        }

        return $next($request);
    }
}
