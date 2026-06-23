import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    Clock,
    Crown,
    Eye,
    MoreHorizontal,
    Plus,
    Shield,
    ShieldCheck,
    Trash2,
    UserCheck,
    UserMinus,
    UserPlus,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

// ─── Types ────────────────────────────────────────────────────────────────────

type RoleData = {
    id: number;
    name: string;
    slug: string;
    is_system: boolean;
    permissions: Record<string, string[]> | null;
};

type AdminUser = {
    id: number;
    name: string;
    email: string;
    initials: string;
    is_super_admin: boolean;
    status: 'active' | 'suspended' | 'pending';
    last_login_at: string | null;
    created_at: string;
    role: { id: number; name: string; slug: string } | null;
};

type PendingInvitation = {
    id: number;
    email: string;
    name: string | null;
    role: { id: number; name: string; slug: string } | null;
    expires_at: string;
    created_at: string;
};

type PageProps = {
    admins: AdminUser[];
    roles: RoleData[];
    pendingInvitations: PendingInvitation[];
    modules: Record<string, string[]>;
    canManageRoles: boolean;
};

// ─── Role / Status config ─────────────────────────────────────────────────────

const slugIcons: Record<string, React.ElementType> = {
    super_admin: Crown,
    admin: ShieldCheck,
    pastor: Shield,
    finance: Check,
    worker: UserCheck,
    viewer: Eye,
};

const statusConfig = {
    active:    { label: 'Active',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
    suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',                 dot: 'bg-red-500' },
    pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',         dot: 'bg-amber-500' },
};

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({ open, onClose, roles }: { open: boolean; onClose: () => void; roles: RoleData[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        name: '',
        role_id: roles[1]?.id ?? roles[0]?.id ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/invite', {
            onSuccess: () => {
                toast.success('Invitation sent!');
                reset();
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite Admin</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4 py-2">
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name</Label>
                        <Input
                            placeholder="e.g. Bro. John Adeyemi"
                            className="h-9"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Email Address</Label>
                        <Input
                            type="email"
                            placeholder="john@church.org"
                            className="h-9"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} />
                    </div>
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Role</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {roles.filter(r => r.slug !== 'super_admin').map(role => {
                                const Icon = slugIcons[role.slug] ?? Shield;
                                const selected = data.role_id === role.id;
                                return (
                                    <button
                                        type="button"
                                        key={role.id}
                                        onClick={() => setData('role_id', role.id)}
                                        className={cn(
                                            'flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all hover:border-primary/50 hover:bg-muted/50',
                                            selected && 'border-primary bg-primary/5',
                                        )}
                                    >
                                        <Icon className="size-3.5 text-muted-foreground" />
                                        {role.name}
                                    </button>
                                );
                            })}
                        </div>
                        <InputError message={errors.role_id} />
                    </div>
                    <Button type="submit" className="w-full mt-2 gap-2" disabled={processing}>
                        <UserPlus className="size-4" />
                        Send Invitation
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Create Role Modal ────────────────────────────────────────────────────────

function CreateRoleModal({
    open,
    onClose,
    modules,
    editRole,
}: {
    open: boolean;
    onClose: () => void;
    modules: Record<string, string[]>;
    editRole?: RoleData | null;
}) {
    const isEdit = !!editRole;
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: editRole?.name ?? '',
        permissions: (editRole?.permissions ?? {}) as Record<string, string[]>,
    });

    function togglePermission(module: string, action: string) {
        const current = data.permissions[module] ?? [];
        const updated = current.includes(action)
            ? current.filter(a => a !== action)
            : [...current, action];
        setData('permissions', { ...data.permissions, [module]: updated });
    }

    function toggleModule(module: string, actions: string[]) {
        const current = data.permissions[module] ?? [];
        const allGranted = actions.every(a => current.includes(a));
        setData('permissions', {
            ...data.permissions,
            [module]: allGranted ? [] : [...actions],
        });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit && editRole) {
            patch(`/admin/roles/${editRole.id}`, {
                onSuccess: () => { toast.success('Role updated.'); reset(); onClose(); },
            });
        } else {
            post('/admin/roles', {
                onSuccess: () => { toast.success('Role created.'); reset(); onClose(); },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Role' : 'Create Custom Role'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4 overflow-hidden">
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Role Name</Label>
                        <Input
                            placeholder="e.g. Media Team"
                            className="h-9"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="overflow-y-auto scrollbar-thin flex-1">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Permissions</Label>
                        <div className="rounded-lg border border-border divide-y divide-border">
                            {Object.entries(modules).map(([module, actions]) => {
                                const granted = data.permissions[module] ?? [];
                                const allGranted = actions.every(a => granted.includes(a));
                                return (
                                    <div key={module} className="flex items-center gap-4 px-4 py-3">
                                        <div className="w-32 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => toggleModule(module, actions)}
                                                className="text-sm font-medium capitalize hover:text-primary transition-colors text-left"
                                            >
                                                {module}
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {actions.map(action => {
                                                const has = granted.includes(action);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={action}
                                                        onClick={() => togglePermission(module, action)}
                                                        className={cn(
                                                            'inline-flex items-center gap-1 text-xs rounded-md px-2 py-0.5 font-medium capitalize transition-all',
                                                            has
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                                        )}
                                                    >
                                                        {has ? <Check className="size-3" /> : <X className="size-3" />}
                                                        {action}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Button type="submit" className="w-full gap-2 shrink-0" disabled={processing}>
                        {isEdit ? 'Save Changes' : 'Create Role'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Change Role Modal ────────────────────────────────────────────────────────

function ChangeRoleModal({ open, onClose, user, roles }: { open: boolean; onClose: () => void; user: AdminUser | null; roles: RoleData[] }) {
    const { data, setData, patch, processing } = useForm({ role_id: user?.role?.id ?? '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        patch(`/admin/users/${user.id}/role`, {
            onSuccess: () => { toast.success('Role updated.'); onClose(); },
        });
    }

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Change Role — {user.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4 py-2">
                    <div className="grid grid-cols-1 gap-2">
                        {roles.filter(r => r.slug !== 'super_admin').map(role => {
                            const Icon = slugIcons[role.slug] ?? Shield;
                            const selected = data.role_id === role.id;
                            return (
                                <button
                                    type="button"
                                    key={role.id}
                                    onClick={() => setData('role_id', role.id)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-all hover:border-primary/50',
                                        selected && 'border-primary bg-primary/5',
                                    )}
                                >
                                    <Icon className="size-4 text-muted-foreground" />
                                    {role.name}
                                    {selected && <Check className="size-3.5 text-primary ml-auto" />}
                                </button>
                            );
                        })}
                    </div>
                    <Button type="submit" className="w-full" disabled={processing}>Save Role</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Admin() {
    const { admins, roles, pendingInvitations, modules, canManageRoles } = usePage<PageProps>().props;

    const [tab, setTab] = useState<'users' | 'roles'>('users');
    const [inviteOpen, setInviteOpen] = useState(false);
    const [createRoleOpen, setCreateRoleOpen] = useState(false);
    const [editRole, setEditRole] = useState<RoleData | null>(null);
    const [changeRoleUser, setChangeRoleUser] = useState<AdminUser | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<number>(roles[0]?.id ?? 0);

    const activeAdmins = admins.filter(u => u.status === 'active').length;

    function toggleStatus(user: AdminUser) {
        router.patch(`/admin/users/${user.id}/toggle-status`, {}, {
            onSuccess: () => toast.success(user.status === 'suspended' ? 'User reactivated.' : 'User suspended.'),
        });
    }

    function revokeInvitation(id: number) {
        router.delete(`/admin/invitations/${id}`, {
            onSuccess: () => toast.success('Invitation revoked.'),
        });
    }

    function deleteRole(role: RoleData) {
        router.delete(`/admin/roles/${role.id}`, {
            onSuccess: () => toast.success('Role deleted.'),
        });
    }

    const selectedRole = roles.find(r => r.id === selectedRoleId);

    return (
        <>
            <Head title="Admin" />
            <div className="flex flex-col h-full overflow-hidden">

                {/* Tabs */}
                <div className="flex items-center gap-0 border-b border-border px-6 shrink-0">
                    {[
                        { id: 'users' as const,  label: 'Admin Users' },
                        { id: 'roles' as const,  label: 'Roles & Permissions' },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={cn(
                                'relative px-4 py-3 text-sm font-medium transition-colors',
                                tab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {t.label}
                            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin">

                    {/* ── Users Tab ────────────────────────────────────── */}
                    {tab === 'users' && (
                        <div className="p-6 flex flex-col gap-6">

                            {/* Active admins table */}
                            <div className="card-base overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            {['User', 'Role', 'Last Login', 'Status', ''].map(h => (
                                                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {admins.map(user => {
                                            const Icon = user.is_super_admin ? Crown : (slugIcons[user.role?.slug ?? ''] ?? Shield);
                                            const sc = statusConfig[user.status];
                                            return (
                                                <tr key={user.id} className="hover:bg-muted/20 transition-colors group">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                                {user.initials}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium flex items-center gap-1.5">
                                                                    {user.name}
                                                                    {user.is_super_admin && (
                                                                        <Crown className="size-3 text-amber-500" />
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 bg-muted text-foreground">
                                                            <Icon className="size-3" />
                                                            {user.role?.name ?? '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                                                        {user.last_login_at
                                                            ? new Date(user.last_login_at).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                            : 'Never'}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1', sc.color)}>
                                                            <span className={cn('size-1.5 rounded-full', sc.dot)} />
                                                            {sc.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        {!user.is_super_admin && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
                                                                        <MoreHorizontal className="size-3.5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-40">
                                                                    {canManageRoles && (
                                                                        <DropdownMenuItem onClick={() => setChangeRoleUser(user)}>
                                                                            <Shield className="size-3.5 mr-2" />
                                                                            Change role
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className={user.status === 'suspended' ? 'text-emerald-600' : 'text-destructive'}
                                                                        onClick={() => toggleStatus(user)}
                                                                    >
                                                                        <UserMinus className="size-3.5 mr-2" />
                                                                        {user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pending invitations */}
                            {pendingInvitations.length > 0 && (
                                <div>
                                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <Clock className="size-4 text-amber-500" />
                                        Pending Invitations
                                    </h2>
                                    <div className="card-base overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30">
                                                    {['Email', 'Role', 'Sent', 'Expires', ''].map(h => (
                                                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {pendingInvitations.map(inv => (
                                                    <tr key={inv.id} className="hover:bg-muted/20 transition-colors group">
                                                        <td className="px-5 py-3.5">
                                                            <p className="font-medium">{inv.name ?? inv.email}</p>
                                                            {inv.name && <p className="text-xs text-muted-foreground">{inv.email}</p>}
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className="text-xs bg-muted rounded-full px-2.5 py-1">{inv.role?.name ?? '—'}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                                            {new Date(inv.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-xs text-amber-600 dark:text-amber-400">
                                                            {new Date(inv.expires_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-destructive opacity-0 group-hover:opacity-100"
                                                                onClick={() => revokeInvitation(inv.id)}
                                                            >
                                                                <X className="size-3 mr-1" />
                                                                Revoke
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Roles Tab ─────────────────────────────────────── */}
                    {tab === 'roles' && (
                        <div className="p-6 flex gap-6">

                            {/* Role list sidebar */}
                            <div className="w-56 shrink-0 flex flex-col gap-1">
                                {roles.map(role => {
                                    const Icon = slugIcons[role.slug] ?? Shield;
                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => setSelectedRoleId(role.id)}
                                            className={cn(
                                                'flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left',
                                                selectedRoleId === role.id
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Icon className="size-3.5" />
                                                {role.name}
                                            </span>
                                            {role.is_system && (
                                                <span className="text-xs opacity-60">system</span>
                                            )}
                                        </button>
                                    );
                                })}

                                {canManageRoles && (
                                    <button
                                        onClick={() => setCreateRoleOpen(true)}
                                        className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-all mt-2"
                                    >
                                        <Plus className="size-3.5" />
                                        New Role
                                    </button>
                                )}
                            </div>

                            {/* Permission matrix for selected role */}
                            {selectedRole && (
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-base font-semibold">{selectedRole.name}</h2>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {selectedRole.is_system ? 'System role — read only' : 'Custom role'}
                                            </p>
                                        </div>
                                        {canManageRoles && !selectedRole.is_system && (
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setEditRole(selectedRole)}>
                                                    Edit
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-destructive" onClick={() => deleteRole(selectedRole)}>
                                                    <Trash2 className="size-3" />
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-base overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30">
                                                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider w-36">Module</th>
                                                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Permissions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {Object.entries(modules).map(([module, actions]) => {
                                                    const granted = selectedRole.permissions?.[module] ?? [];
                                                    return (
                                                        <tr key={module} className="hover:bg-muted/20 transition-colors">
                                                            <td className="px-5 py-3 font-medium capitalize">{module}</td>
                                                            <td className="px-5 py-3">
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {actions.map(action => {
                                                                        const has = granted.includes(action);
                                                                        return (
                                                                            <span
                                                                                key={action}
                                                                                className={cn(
                                                                                    'inline-flex items-center gap-1 text-xs rounded-md px-2 py-0.5 font-medium capitalize',
                                                                                    has
                                                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                                        : 'bg-muted text-muted-foreground/50 line-through',
                                                                                )}
                                                                            >
                                                                                {has ? <Check className="size-3" /> : <X className="size-3" />}
                                                                                {action}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} roles={roles} />
            <CreateRoleModal open={createRoleOpen} onClose={() => setCreateRoleOpen(false)} modules={modules} />
            <CreateRoleModal open={!!editRole} onClose={() => setEditRole(null)} modules={modules} editRole={editRole} />
            <ChangeRoleModal open={!!changeRoleUser} onClose={() => setChangeRoleUser(null)} user={changeRoleUser} roles={roles} />
        </>
    );
}

Admin.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Admin', href: '/admin' },
    ],
};
