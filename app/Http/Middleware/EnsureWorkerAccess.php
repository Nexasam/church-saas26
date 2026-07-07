<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkerAccess
{
    /**
     * Handle an incoming request.
     *
     * This middleware ensures that workers (non-admin users) can only access
     * worker-specific routes and are redirected to the worker dashboard if they
     * try to access other pages.
     *
     * Finance officers (role slug: 'finance') can access finance-related routes
     * and are redirected to the finance portal for everything else.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        // If user is not authenticated, let them proceed (auth middleware will handle)
        if (!$user) {
            return $next($request);
        }

        // Allow super admins and non-restricted roles to access all routes
        if ($user->is_super_admin || ($user->role && !in_array($user->role->slug, ['member', 'finance']))) {
            return $next($request);
        }

        $currentRoute = $request->route()?->getName();
        $roleSlug     = $user->role?->slug;

        // ── Finance Officer ──────────────────────────────────────────────
        if ($roleSlug === 'finance') {
            $financeAllowed = [
                'finance-portal.index',
                'finance.index',
                'finance.income.store',
                'finance.expense.store',
                'finance.service.store',
                'finance.service.reconcile',
                'finance.income.destroy',
                'finance.expense.destroy',
                'finance.export',
                'finance.attachments.store',
                'finance.attachments.destroy',
                'finance.attachments.show',
                'notifications.index',
                'notifications.read',
                'notifications.read-all',
                'notifications.destroy',
                'notifications.preferences',
                'notifications.update-preferences',
                // Settings routes (actual route names from settings.php)
                'profile.edit',
                'profile.update',
                'profile.destroy',
                'security.edit',
                'user-password.update',
                'appearance.edit',
                // Password confirmation (required by security page via RequirePassword middleware)
                'password.confirm',
                'password.confirmed',
                // Logout (registered by Fortify)
                'logout',
            ];

            if (!in_array($currentRoute, $financeAllowed)) {
                return redirect()->route('finance-portal.index');
            }

            return $next($request);
        }

        // ── Regular Workers (member role) ────────────────────────────────
        $allowedRoutes = [
            'dashboard',
            'worker.dashboard',
            'worker.department',
            'worker.member.update',
            'worker.member.remove',
            'worker.member.add',
            'worker.attendance.mark',
            'notifications.index',
            'notifications.read',
            'notifications.read-all',
            'notifications.destroy',
            'notifications.preferences',
            'notifications.update-preferences',
            // Settings routes
            'profile.edit',
            'profile.update',
            'profile.destroy',
            'security.edit',
            'user-password.update',
            'appearance.edit',
            // Password confirmation (required by security page via RequirePassword middleware)
            'password.confirm',
            'password.confirmed',
            // Logout
            'logout',
        ];

        if (!in_array($currentRoute, $allowedRoutes)) {
            return redirect()->route('worker.dashboard');
        }

        return $next($request);
    }
}
