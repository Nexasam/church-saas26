import { usePage } from '@inertiajs/react';
import { hasPermission, canAccessModule, type User } from '@/types/auth';

/**
 * Hook for checking permissions in components.
 *
 * const { can, canAccess, isSuperAdmin } = usePermission();
 * can('finance', 'reconcile')  → true/false
 * canAccess('finance')         → true if user has any finance permission
 */
export function usePermission() {
    const { auth } = usePage().props as { auth: { user: User } };
    const user = auth?.user ?? null;

    return {
        user,
        isSuperAdmin: user?.is_super_admin ?? false,
        can: (module: string, action: string) => hasPermission(user, module, action),
        canAccess: (module: string) => canAccessModule(user, module),
    };
}
