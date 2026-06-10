export type UserRole = {
    id: number;
    name: string;
    slug: string;
};

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    church_id: number;
    is_super_admin: boolean;
    status: 'active' | 'suspended' | 'pending';
    role: UserRole | null;
    /** Flat permission strings e.g. ["finance.view", "members.create"] or ["*"] for super admin */
    permissions: string[];
    last_login_at?: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

/**
 * Helper to check if a user has a permission.
 * Supports wildcard "*" for super admins.
 */
export function hasPermission(user: User | null, module: string, action: string): boolean {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(`${module}.${action}`);
}

/**
 * Check if a user can access a module at all (has any permission in it).
 */
export function canAccessModule(user: User | null, module: string): boolean {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.some((p) => p.startsWith(`${module}.`));
}
