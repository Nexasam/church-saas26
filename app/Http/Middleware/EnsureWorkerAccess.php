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
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        
        // If user is not authenticated, let them proceed (auth middleware will handle)
        if (!$user) {
            return $next($request);
        }
        
        // Allow super admins and non-member roles to access all routes
        if ($user->is_super_admin || ($user->role && $user->role->slug !== 'member')) {
            return $next($request);
        }

        // Workers can only access worker-specific routes
        $allowedRoutes = [
            'dashboard',
            'worker.dashboard',
            'worker.department',
            'worker.member.update',
            'worker.member.remove',
            'notifications.index',
            'notifications.read',
            'notifications.read-all',
            'notifications.destroy',
            'notifications.preferences',
            'notifications.update-preferences',
        ];

        $currentRoute = $request->route()?->getName();

        if (!in_array($currentRoute, $allowedRoutes)) {
            return redirect()->route('worker.dashboard');
        }

        return $next($request);
    }
}
