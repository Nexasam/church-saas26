import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    Check,
    CheckCircle2,
    CreditCard,
    Eye,
    MoreHorizontal,
    Palette,
    RefreshCw,
    Search,
    Shield,
    Trash2,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import PlatformLayout from '@/layouts/platform/platform-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ChurchRecord = {
    id: number;
    name: string;
    address: string | null;
    city: string | null;
    size: 'small' | 'medium' | 'large' | 'mega';
    plan: 'free' | 'paid';
    onboarding_complete: boolean;
    subscription_expiry: string | null;
    members_count: number;
    theme_color: string;
    created_at: string;
    super_admin: {
        name: string;
        email: string;
        last_login_at: string | null;
        status: string;
    } | null;
};

type Stats = {
    total_churches: number;
    active_churches: number;
    paid_churches: number;
    total_members: number;
};

type PageProps = {
    churches: ChurchRecord[];
    stats: Stats;
};

const sizeLabel: Record<string, string> = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    mega: 'Mega',
};

const planConfig = {
    free: { label: 'Free',  color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    paid: { label: 'Paid',  color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

// ─── Theme Change Dialog ──────────────────────────────────────────────────────

function ThemeDialog({ church, open, onClose }: { church: ChurchRecord | null; open: boolean; onClose: () => void }) {
    const [theme, setTheme] = useState<string>(church?.theme_color ?? 'blue');

    if (!church) return null;

    const THEMES = [
        { value: 'blue',    label: 'Royal Blue',    swatch: 'bg-blue-600',    ring: 'ring-blue-500' },
        { value: 'purple',  label: 'Royal Purple',  swatch: 'bg-purple-600',  ring: 'ring-purple-500' },
        { value: 'emerald', label: 'Kingdom Green', swatch: 'bg-emerald-600', ring: 'ring-emerald-500' },
    ];

    function save() {
        router.patch(`/platform/churches/${church.id}/theme`, { theme_color: theme }, {
            onSuccess: () => { toast.success(`${church.name} theme updated.`); onClose(); },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Palette className="size-4 text-primary" />
                        Change Theme — {church.name}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <div className="grid grid-cols-3 gap-3">
                        {THEMES.map(t => (
                            <button
                                key={t.value}
                                onClick={() => setTheme(t.value)}
                                className={cn(
                                    'flex flex-col items-center gap-2 rounded-xl border p-3 transition-all',
                                    theme === t.value ? `border-2 ${t.ring} ring-2 ring-offset-1` : 'border-border hover:border-primary/40',
                                )}
                            >
                                <span className={cn('size-8 rounded-full', t.swatch)} />
                                <span className="text-xs font-medium">{t.label}</span>
                                {theme === t.value && <Check className="size-3 text-primary" />}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3 pt-1">
                        <Button className="flex-1" onClick={save}>Apply Theme</Button>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({ church, open, onClose }: { church: ChurchRecord | null; open: boolean; onClose: () => void }) {
    const [confirm, setConfirm] = useState('');
    if (!church) return null;

    function handleDelete() {
        router.delete(`/platform/churches/${church.id}`, {
            onSuccess: () => { toast.success(`${church.name} deleted.`); onClose(); },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <Trash2 className="size-4" />
                        Delete Church
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">{church.name}</p>
                        <p className="text-xs text-red-600/80 dark:text-red-500 mt-1">
                            This will permanently delete this church and all its data. This action cannot be undone.
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Type <strong>{church.name}</strong> to confirm
                        </label>
                        <Input
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            placeholder={church.name}
                            className="h-9"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="destructive"
                            className="flex-1"
                            disabled={confirm !== church.name}
                            onClick={handleDelete}
                        >
                            Delete Permanently
                        </Button>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function PlatformDashboard() {
    const { churches, stats } = usePage<PageProps>().props;

    const [search,       setSearch]       = useState('');
    const [planFilter,   setPlanFilter]   = useState<'all' | 'free' | 'paid'>('all');
    const [deleteTarget, setDeleteTarget] = useState<ChurchRecord | null>(null);
    const [deleteOpen,   setDeleteOpen]   = useState(false);
    const [themeTarget,  setThemeTarget]  = useState<ChurchRecord | null>(null);
    const [themeOpen,    setThemeOpen]    = useState(false);

    const filtered = churches.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.super_admin?.email.toLowerCase().includes(search.toLowerCase()) ||
            (c.city ?? '').toLowerCase().includes(search.toLowerCase());
        const matchPlan = planFilter === 'all' || c.plan === planFilter;
        return matchSearch && matchPlan;
    });

    function suspendChurch(c: ChurchRecord) {
        router.patch(`/platform/churches/${c.id}/suspend`, {}, {
            onSuccess: () => toast.success(`${c.name} suspended.`),
        });
    }

    function reactivateChurch(c: ChurchRecord) {
        router.patch(`/platform/churches/${c.id}/reactivate`, {}, {
            onSuccess: () => toast.success(`${c.name} reactivated.`),
        });
    }

    function impersonate(c: ChurchRecord) {
        router.post(`/platform/churches/${c.id}/impersonate`, {}, {
            onSuccess: () => toast.success(`Now viewing as ${c.name}`),
        });
    }

    function togglePlan(c: ChurchRecord) {
        router.patch(`/platform/churches/${c.id}/plan`, {}, {
            onSuccess: () => toast.success(`${c.name} plan updated.`),
        });
    }

    const isSuspended = (c: ChurchRecord) => c.super_admin?.status === 'suspended';

    return (
        <>
            <Head title="Platform Admin — Church OS" />
            <div className="flex flex-col h-full">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-border">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Platform Overview</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">All churches on Church OS</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => router.reload()}>
                        <RefreshCw className="size-3.5" />
                        Refresh
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-8 py-6 border-b border-border">
                    {[
                        { label: 'Total Churches',  value: stats.total_churches,  icon: Building2,   color: 'text-primary' },
                        { label: 'Active Churches', value: stats.active_churches, icon: CheckCircle2, color: 'text-emerald-600' },
                        { label: 'Paid Plans',      value: stats.paid_churches,   icon: CreditCard,   color: 'text-blue-600' },
                        { label: 'Total Members',   value: stats.total_members.toLocaleString(), icon: Users, color: 'text-purple-600' },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="card-base p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon className={cn('size-4', s.color)} />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
                                </div>
                                <p className={cn('text-2xl font-bold tabular-nums', s.color)}>{s.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 px-8 py-3 border-b border-border">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                            className="h-8 pl-8 text-sm bg-muted/50 border-transparent"
                            placeholder="Search church, email, city..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                        {(['all', 'free', 'paid'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setPlanFilter(p)}
                                className={cn(
                                    'px-3 py-1 rounded-md text-xs font-medium transition-base capitalize',
                                    planFilter === p ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">{filtered.length} churches</span>
                </div>

                {/* Churches Table */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-border bg-muted/80 backdrop-blur-sm">
                                {['Church', 'Super Admin', 'Members', 'Size', 'Plan', 'Onboarding', 'Created', ''].map(h => (
                                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map(church => {
                                const pc          = planConfig[church.plan];
                                const suspended   = isSuspended(church);
                                const initials    = church.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                                return (
                                    <tr key={church.id} className={cn('hover:bg-muted/20 transition-base group', suspended && 'opacity-60')}>
                                        {/* Church */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
                                                    style={{ backgroundColor: church.theme_color === 'blue' ? '#2563eb' : church.theme_color === 'purple' ? '#7c3aed' : '#059669' }}
                                                >
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="font-medium flex items-center gap-1.5">
                                                        {church.name}
                                                        {suspended && <span className="text-[10px] bg-red-100 text-red-600 rounded px-1.5 py-0.5 font-medium">Suspended</span>}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{church.city ?? church.address ?? '—'}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Super admin */}
                                        <td className="px-5 py-3.5">
                                            {church.super_admin ? (
                                                <div>
                                                    <p className="text-sm font-medium">{church.super_admin.name}</p>
                                                    <p className="text-xs text-muted-foreground">{church.super_admin.email}</p>
                                                    {church.super_admin.last_login_at && (
                                                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                                            Last login: {new Date(church.super_admin.last_login_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </td>

                                        {/* Members */}
                                        <td className="px-5 py-3.5 font-semibold tabular-nums">{church.members_count}</td>

                                        {/* Size */}
                                        <td className="px-5 py-3.5 text-muted-foreground text-xs">{sizeLabel[church.size] ?? '—'}</td>

                                        {/* Plan */}
                                        <td className="px-5 py-3.5">
                                            <span className={cn('text-xs font-medium rounded-full px-2.5 py-1', pc.color)}>
                                                {pc.label}
                                            </span>
                                            {church.subscription_expiry && (
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    Expires {church.subscription_expiry}
                                                </p>
                                            )}
                                        </td>

                                        {/* Onboarding */}
                                        <td className="px-5 py-3.5">
                                            {church.onboarding_complete
                                                ? <CheckCircle2 className="size-4 text-emerald-500" />
                                                : <AlertTriangle className="size-4 text-amber-500" />
                                            }
                                        </td>

                                        {/* Created */}
                                        <td className="px-5 py-3.5 text-xs text-muted-foreground">{church.created_at}</td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="size-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => impersonate(church)}>
                                                        <Eye className="size-3.5 mr-2 text-blue-600" />
                                                        View as church
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => { setThemeTarget(church); setThemeOpen(true); }}>
                                                        <Palette className="size-3.5 mr-2 text-purple-600" />
                                                        Change theme colour
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => togglePlan(church)}>
                                                        <CreditCard className="size-3.5 mr-2" />
                                                        Toggle plan ({church.plan === 'free' ? '→ Paid' : '→ Free'})
                                                    </DropdownMenuItem>
                                                    {suspended ? (
                                                        <DropdownMenuItem onClick={() => reactivateChurch(church)}>
                                                            <CheckCircle2 className="size-3.5 mr-2 text-emerald-600" />
                                                            Reactivate church
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => suspendChurch(church)} className="text-amber-600">
                                                            <XCircle className="size-3.5 mr-2" />
                                                            Suspend church
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => { setDeleteTarget(church); setDeleteOpen(true); }}
                                                    >
                                                        <Trash2 className="size-3.5 mr-2" />
                                                        Delete church
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-5 py-16 text-center text-sm text-muted-foreground">
                                        No churches found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DeleteDialog church={deleteTarget} open={deleteOpen} onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }} />
            <ThemeDialog  church={themeTarget}  open={themeOpen}  onClose={() => { setThemeOpen(false);  setThemeTarget(null);  }} />
        </>
    );
}

PlatformDashboard.layout = (page: React.ReactNode) => <PlatformLayout>{page}</PlatformLayout>;
