import { Head, router, usePage } from '@inertiajs/react';
import {
    Check,
    Globe,
    Heart,
    LayoutGrid,
    Monitor,
    MoreHorizontal,
    Music,
    Pencil,
    Plus,
    Search,
    Shield,
    Star,
    Trash2,
    UserPlus,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { type Department } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

const iconMap: Record<string, React.ElementType> = {
    Users,
    Music,
    Heart,
    Monitor,
    Globe,
    Star,
    Shield,
    Zap,
    LayoutGrid,
};

const colorMap: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800', icon: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-200 dark:border-pink-800', icon: 'text-pink-600 dark:text-pink-400', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
    green: { bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800', icon: 'text-green-600 dark:text-green-400', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800', icon: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    slate: { bg: 'bg-slate-50 dark:bg-slate-900/20', border: 'border-slate-200 dark:border-slate-800', icon: 'text-slate-600 dark:text-slate-400', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-800', icon: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
};

// ── Edit Department Modal ─────────────────────────────────────────────────────

const ICON_OPTIONS = ['Users', 'Music', 'Heart', 'Monitor', 'Globe', 'Star', 'Shield', 'Zap', 'LayoutGrid'];
const COLOR_OPTIONS = [
    { value: 'blue',   label: 'Blue',   swatch: 'bg-blue-500' },
    { value: 'purple', label: 'Purple', swatch: 'bg-purple-500' },
    { value: 'pink',   label: 'Pink',   swatch: 'bg-pink-500' },
    { value: 'green',  label: 'Green',  swatch: 'bg-green-500' },
    { value: 'orange', label: 'Orange', swatch: 'bg-orange-500' },
    { value: 'rose',   label: 'Rose',   swatch: 'bg-rose-500' },
    { value: 'slate',  label: 'Slate',  swatch: 'bg-slate-500' },
    { value: 'yellow', label: 'Yellow', swatch: 'bg-yellow-500' },
];

function EditDepartmentModal({ dept, open, onClose, allMembers }: {
    dept: Department | null;
    open: boolean;
    onClose: () => void;
    allMembers: any[];
}) {
    const [form, setForm] = useState({
        name:        dept?.name ?? '',
        description: dept?.description ?? '',
        leader:      dept?.leader ?? '',
        leader_id:   dept?.leader_id ?? null,
        icon:        dept?.icon ?? 'Users',
        color:       dept?.color ?? 'blue',
    });

    // Reset form when dept changes
    useEffect(() => {
        setForm({
            name:        dept?.name ?? '',
            description: dept?.description ?? '',
            leader:      dept?.leader ?? '',
            leader_id:   dept?.leader_id ?? null,
            icon:        dept?.icon ?? 'Users',
            color:       dept?.color ?? 'blue',
        });
    }, [dept]);

    const isNew = !dept;

    function save() {
        if (isNew) {
            router.post('/departments', form, { onSuccess: () => { toast.success(`Department "${form.name}" created.`); onClose(); } });
        } else {
            router.patch(`/departments/${dept!.id}`, form, { onSuccess: () => { toast.success(`"${form.name}" updated.`); onClose(); } });
        }
    }

    const PreviewIcon = iconMap[form.icon] || Users;
    const previewColor = colorMap[form.color];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isNew ? <Plus className="size-4 text-primary" /> : <Pencil className="size-4 text-primary" />}
                        {isNew ? 'New Department' : `Edit — ${dept?.name}`}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Preview */}
                    <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border p-3">
                        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl border', previewColor.bg, previewColor.border)}>
                            <PreviewIcon className={cn('size-5', previewColor.icon)} />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{form.name || 'Department Name'}</p>
                            <p className="text-xs text-muted-foreground">{form.description || 'Description'}</p>
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Department Name *</Label>
                        <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ushering" className="h-9" />
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</Label>
                        <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this department" className="h-9" />
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Department Leader</Label>
                        <div className="space-y-2">
                            <select
                                value={form.leader_id ?? ''}
                                onChange={e => {
                                    const member = allMembers.find((m: any) => m.id === Number(e.target.value));
                                    setForm(p => ({ 
                                        ...p, 
                                        leader_id: Number(e.target.value) || null,
                                        leader: member?.name || ''
                                    }));
                                }}
                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">Select a member as leader</option>
                                {allMembers.map((m: any) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <Input
                                value={form.leader}
                                onChange={e => setForm(p => ({ ...p, leader: e.target.value }))}
                                placeholder="Or enter custom leader name"
                                className="h-9"
                            />
                        </div>
                    </div>

                    {/* Icon picker */}
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Icon</Label>
                        <div className="flex flex-wrap gap-2">
                            {ICON_OPTIONS.map(icon => {
                                const Icon = iconMap[icon] || Users;
                                return (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, icon }))}
                                        className={cn(
                                            'flex size-9 items-center justify-center rounded-lg border transition-all',
                                            form.icon === icon
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:border-primary/40 text-muted-foreground',
                                        )}
                                    >
                                        <Icon className="size-4" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Color picker */}
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Colour</Label>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_OPTIONS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, color: c.value }))}
                                    className={cn(
                                        'flex size-7 items-center justify-center rounded-full border-2 transition-all',
                                        form.color === c.value ? 'border-foreground scale-110' : 'border-transparent',
                                    )}
                                >
                                    <span className={cn('size-5 rounded-full', c.swatch)} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <Button className="flex-1" onClick={save} disabled={!form.name}>
                            {isNew ? 'Create Department' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Invite Worker Modal ─────────────────────────────────────────────────────

function InviteWorkerModal({ dept, open, onClose, allMembers }: {
    dept: Department | null;
    open: boolean;
    onClose: () => void;
    allMembers: any[];
}) {
    const [form, setForm] = useState({ email: '', name: '', role: 'worker', user_id: null as number | null });
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState<any | null>(null);

    if (!dept) return null;

    const availableMembers = allMembers.filter((m: any) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (m.phone ?? '').includes(search)
    );

    function selectMember(member: any) {
        setSelectedMember(member);
        setForm({
            email: member.email || '',
            name: member.name,
            role: form.role,
            user_id: member.id,
        });
    }

    function invite() {
        if (!dept) return;
        
        const payload = {
            department_id: dept.id,
            email: form.email,
            name: form.name,
            role: form.role,
        };

        router.post('/workers/invite', payload, {
            onSuccess: () => {
                toast.success(`${form.name} has been added as a ${form.role} to ${dept.name}.`);
                setForm({ email: '', name: '', role: 'worker', user_id: null });
                setSelectedMember(null);
                setSearch('');
                onClose();
            },
            onError: () => {
                toast.error('Failed to add member.');
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="size-4 text-primary" />
                        Add Member — {dept.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Search existing members */}
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Select from existing members
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                            <Input
                                className="h-9 pl-8 text-sm"
                                placeholder="Search members..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        {search && (
                            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border">
                                {availableMembers.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">
                                        No members found
                                    </p>
                                ) : (
                                    availableMembers.map((m: any) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => selectMember(m)}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                {m.initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{m.name}</p>
                                                <p className="text-xs text-muted-foreground">{m.email}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border pt-4">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Or enter new person details
                        </Label>
                        <div>
                            <Label className="text-sm font-medium">Name *</Label>
                            <Input
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="Full name"
                                className="mt-1.5 h-9"
                            />
                        </div>
                        <div className="mt-3">
                            <Label className="text-sm font-medium">Email (optional)</Label>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="email@example.com"
                                className="mt-1.5 h-9"
                            />
                        </div>
                        <div className="mt-3">
                            <Label className="text-sm font-medium">Role</Label>
                            <select
                                value={form.role}
                                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                                className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            >
                                <option value="member">Member</option>
                                <option value="worker">Worker</option>
                                <option value="leader">Leader</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <Button className="flex-1" onClick={invite} disabled={!form.name}>
                            Add to Department
                        </Button>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Add Members Modal ─────────────────────────────────────────────────────────

function AddMembersModal({ dept, open, onClose, allMembers, onMembersAdded }: {
    dept: Department | null;
    open: boolean;
    onClose: () => void;
    allMembers: any[];
    onMembersAdded: () => void;
}) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [deptMembers, setDeptMembers] = useState<number[]>([]);

    // ⚠️ hooks must be before any conditional return
    useEffect(() => {
        if (!dept || !open) return;
        setLoading(true);
        fetch(`/departments/${dept.id}/members`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
            .then((data: any[]) => setDeptMembers(data.map((m: any) => m.id)))
            .catch(() => setDeptMembers([]))
            .finally(() => setLoading(false));
    }, [dept?.id, open]);

    if (!dept) return null;

    const available = allMembers.filter((m: any) =>
        !deptMembers.includes(m.id) &&
        (m.name.toLowerCase().includes(search.toLowerCase()) ||
         (m.phone ?? '').includes(search))
    );

    function toggle(id: number) {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    function save() {
        if (selected.length === 0) return;
        
        setLoading(true);
        router.post(`/departments/${dept!.id}/members`, { member_ids: selected }, {
            onSuccess: () => { 
                toast.success(`${selected.length} member(s) added to ${dept!.name}.`); 
                setSelected([]); 
                setSearch(''); 
                onClose(); 
                onMembersAdded();
            },
            onError: () => {
                toast.error('Failed to add members. Please try again.');
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    }

    function handleClose() {
        setSelected([]);
        setSearch('');
        setDeptMembers([]);
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="size-4 text-primary" />
                        Add Members — {dept.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                            className="h-9 pl-8 text-sm"
                            placeholder="Search members..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Member list */}
                    <div className="flex flex-col gap-1 max-h-64 overflow-y-auto scrollbar-thin rounded-lg border border-border">
                        {loading ? (
                            <p className="text-xs text-muted-foreground text-center py-6">
                                Loading members...
                            </p>
                        ) : available.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">
                                {search ? `No results for "${search}"` : 'All members are already in this department'}
                            </p>
                        ) : (
                            available.map(m => {
                                const isSelected = selected.includes(m.id);
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => toggle(m.id)}
                                        disabled={loading}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50',
                                            isSelected && 'bg-primary/5',
                                            loading && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                        {m.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{m.name}</p>
                                        <p className="text-xs text-muted-foreground">{m.phone}</p>
                                    </div>
                                    <div className={cn(
                                        'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                                        isSelected ? 'border-primary bg-primary' : 'border-border',
                                    )}>
                                        {isSelected && <Check className="size-3 text-primary-foreground" />}
                                    </div>
                                </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-muted-foreground">
                            {selected.length > 0 ? `${selected.length} selected` : 'Select members to add'}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8" onClick={handleClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button 
                                size="sm" 
                                className="h-8 gap-1.5" 
                                disabled={selected.length === 0 || loading} 
                                onClick={save}
                            >
                                <UserPlus className="size-3.5" />
                                Add {selected.length > 0 ? selected.length : ''} Members
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Manage Department Sheet ───────────────────────────────────────────────────

function ManageDepartmentSheet({ dept, open, onClose, onEdit, onAddMembers, onInviteWorker, allMembers, onMembersAdded, refreshKey, isAdmin, isLeader }: {
    dept: Department | null;
    open: boolean;
    onClose: () => void;
    onEdit: () => void;
    onAddMembers: () => void;
    onInviteWorker: () => void;
    allMembers: any[];
    onMembersAdded: () => void;
    refreshKey: number;
    isAdmin: boolean;
    isLeader: boolean;
}) {
    const [memberSearch, setMemberSearch] = useState('');
    const [deptMembers, setDeptMembers]   = useState<any[]>([]);

    // Fetch real members for this department when sheet opens
    useEffect(() => {
        if (dept && open) {
            fetch(`/departments/${dept.id}/members`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
                .then(r => r.json()).then(setDeptMembers).catch(() => {});
        }
    }, [dept, open, refreshKey]);

    if (!dept) return null;

    const IconComponent = iconMap[dept.icon] || Users;
    const c = colorMap[dept.color] ?? colorMap.blue;
    const filtered = memberSearch
        ? deptMembers.filter((m: any) => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
        : deptMembers;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col overflow-hidden">
                <SheetHeader className="px-5 py-4 border-b border-border">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl border', c.bg, c.border)}>
                                <IconComponent className={cn('size-5', c.icon)} />
                            </div>
                            <div>
                                <SheetTitle className="text-base">{dept.name}</SheetTitle>
                                <p className="text-xs text-muted-foreground">{dept.description}</p>
                            </div>
                        </div>
                        {(isAdmin || isLeader) && (
                            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs shrink-0" onClick={onEdit}>
                                <Pencil className="size-3" />
                                Edit
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Stats */}
                    <div className="px-5 py-4 border-b border-border">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold">{dept.member_count}</p>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold text-emerald-600">{dept.active_count}</p>
                                <p className="text-xs text-muted-foreground">Active</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold text-amber-600">{dept.member_count - dept.active_count}</p>
                                <p className="text-xs text-muted-foreground">Inactive</p>
                            </div>
                        </div>
                    </div>

                    {/* Leader */}
                    {dept.leader && (
                        <div className="px-5 py-4 border-b border-border">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Department Leader</h4>
                            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                                    {dept.leader.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{dept.leader}</p>
                                    <p className="text-xs text-muted-foreground">Department Leader</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Members */}
                    <div className="px-5 py-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Members ({deptMembers.length})
                        </h4>

                        {/* Member search */}
                        {deptMembers.length > 0 && (
                            <div className="relative mb-3">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                <Input
                                    className="h-8 pl-8 text-xs bg-muted/50 border-transparent"
                                    placeholder="Search members..."
                                    value={memberSearch}
                                    onChange={e => setMemberSearch(e.target.value)}
                                />
                            </div>
                        )}

                        {filtered.length > 0 ? (
                            <div className="flex flex-col gap-1.5">
                                {filtered.map(m => (
                                    <div key={m.id} className="flex items-center gap-2.5 rounded-lg hover:bg-muted/40 p-2 transition-all group">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                            {m.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{m.name}</p>
                                            <p className="text-xs text-muted-foreground">{m.phone}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {m.role && (
                                                <span className={cn(
                                                    'text-xs font-medium rounded-full px-2 py-0.5',
                                                    m.role === 'leader' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    m.role === 'worker' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                                )}>
                                                    {m.role}
                                                </span>
                                            )}
                                            <span className={cn(
                                                'text-xs font-medium rounded-full px-2 py-0.5',
                                                m.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            )}>
                                                {m.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {(isAdmin || isLeader) && (
                                            <button
                                                className="opacity-0 group-hover:opacity-100 flex size-5 items-center justify-center rounded text-muted-foreground hover:text-destructive transition-all"
                                                title="Remove from department"
                                                onClick={() => {
                                                    router.delete(`/departments/${dept.id}/members/${m.id}`, {
                                                        onSuccess: () => {
                                                            toast.success(`${m.name} removed from ${dept.name}.`);
                                                            setDeptMembers(prev => prev.filter(x => x.id !== m.id));
                                                        },
                                                        onError: () => toast.error('Failed to remove member.')
                                                    });
                                                }}
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-6">
                                {memberSearch ? `No results for "${memberSearch}"` : 'No members yet. Add some above.'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4 flex gap-2">
                    {(isAdmin || isLeader) && (
                        <Button className="flex-1 gap-1.5" size="sm" onClick={onAddMembers}>
                            <UserPlus className="size-3.5" />
                            Add Members
                        </Button>
                    )}
                    {isAdmin && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                                if (confirm(`Are you sure you want to delete "${dept.name}"? This will remove all members from this department.`)) {
                                    router.delete(`/departments/${dept.id}`, {
                                        onSuccess: () => { toast.success(`${dept.name} deleted.`); onClose(); },
                                        onError: () => { toast.error('Failed to delete department.'); }
                                    });
                                }
                            }}
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ── Department Detail Sheet (removed - using ManageDepartmentSheet instead) ────────────────────────

export default function Departments() {
    type DeptMember = { id: number; name: string; initials: string; phone: string | null };
    type DeptPageProps = { departments: Department[]; members: DeptMember[]; is_admin: boolean };
    const { departments: allDepts, members: allMembers, is_admin: isAdmin } = usePage<DeptPageProps>().props;

    const [manageDept, setManageDept]     = useState<Department | null>(null);
    const [editDept, setEditDept]         = useState<Department | null>(null);
    const [addMembersDept, setAddMembersDept] = useState<Department | null>(null);
    const [inviteWorkerDept, setInviteWorkerDept] = useState<Department | null>(null);
    const [editOpen, setEditOpen]         = useState(false);
    const [addMembersOpen, setAddMembersOpen] = useState(false);
    const [inviteWorkerOpen, setInviteWorkerOpen] = useState(false);
    const [manageOpen, setManageOpen]     = useState(false);
    const [newDeptOpen, setNewDeptOpen]   = useState(false);
    const [search, setSearch]             = useState('');
    const [refreshKey, setRefreshKey]     = useState(0);

    const totalMembers = allDepts.reduce((s, d) => s + (d.member_count ?? 0), 0);

    const filtered = allDepts.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.leader ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const handleMembersAdded = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Check if user is a leader of a specific department
    const isDeptLeader = (deptId: number) => {
        const dept = allDepts.find(d => d.id === deptId);
        return dept?.user_role === 'leader' || dept?.user_role === 'admin';
    };

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden">
                {/* Search bar */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                            className="h-8 pl-8 text-sm bg-muted/50 border-transparent"
                            placeholder="Search departments or leaders..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {isAdmin && (
                        <Button size="sm" className="h-8 gap-1.5" onClick={() => { setEditDept(null); setNewDeptOpen(true); }}>
                            <Plus className="size-3.5" />
                            New Department
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-border bg-muted/80 backdrop-blur-sm">
                                {['Department', 'Leader', 'Members', 'Active', 'Activity', 'Last Activity', ''].map(h => (
                                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map(dept => {
                                const IconComponent = iconMap[dept.icon] || Users;
                                const c = colorMap[dept.color] ?? colorMap.blue;
                                const activePct = dept.member_count > 0 ? Math.round((dept.active_count / dept.member_count) * 100) : 0;

                                return (
                                    <tr
                                        key={dept.id}
                                        className="hover:bg-muted/20 transition-all cursor-pointer group"
                                        onClick={() => { setManageDept(dept); setManageOpen(true); }}
                                    >
                                        {/* Department */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg border', c.bg, c.border)}>
                                                    <IconComponent className={cn('size-4', c.icon)} />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{dept.name}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{dept.description}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Leader */}
                                        <td className="px-5 py-3.5">
                                            {dept.leader ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                                        {dept.leader.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">{dept.leader}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </td>

                                        {/* Total members */}
                                        <td className="px-5 py-3.5 font-semibold tabular-nums">
                                            {dept.member_count}
                                        </td>

                                        {/* Active */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm font-semibold text-emerald-600">{dept.active_count}</span>
                                            <span className="text-xs text-muted-foreground ml-1">/ {dept.member_count}</span>
                                        </td>

                                        {/* Activity bar */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2 min-w-24">
                                                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-primary/70 transition-all"
                                                        style={{ width: `${activePct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium tabular-nums w-8 shrink-0">{activePct}%</span>
                                            </div>
                                        </td>

                                        {/* Last activity */}
                                        <td className="px-5 py-3.5 text-muted-foreground text-xs">
                                            {dept.last_activity}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="size-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => { setManageDept(dept); setManageOpen(true); }}>View details</DropdownMenuItem>
                                                    {(isAdmin || isDeptLeader(dept.id)) && (
                                                        <DropdownMenuItem onClick={() => { setEditDept(dept); setEditOpen(true); }}>Edit department</DropdownMenuItem>
                                                    )}
                                                    {(isAdmin || isDeptLeader(dept.id)) && (
                                                        <DropdownMenuItem onClick={() => { setAddMembersDept(dept); setAddMembersOpen(true); }}>Add members</DropdownMenuItem>
                                                    )}
                                                    {isAdmin && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm(`Are you sure you want to delete "${dept.name}"? This will remove all members from this department.`)) {
                                                                    router.delete(`/departments/${dept.id}`, {
                                                                        onSuccess: () => { toast.success(`${dept.name} deleted.`); },
                                                                        onError: () => { toast.error('Failed to delete department.'); }
                                                                    });
                                                                }
                                                            }}>Delete</DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">
                                        No departments found for "{search}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ManageDepartmentSheet
                dept={manageDept}
                open={manageOpen}
                onClose={() => setManageOpen(false)}
                onEdit={() => { setEditDept(manageDept); setEditOpen(true); }}
                onAddMembers={() => { setAddMembersDept(manageDept); setAddMembersOpen(true); }}
                onInviteWorker={() => { setInviteWorkerDept(manageDept); setInviteWorkerOpen(true); }}
                allMembers={allMembers}
                onMembersAdded={handleMembersAdded}
                refreshKey={refreshKey}
                isAdmin={isAdmin}
                isLeader={manageDept ? isDeptLeader(manageDept.id) : false}
            />
            <EditDepartmentModal
                dept={editDept}
                open={editOpen || newDeptOpen}
                onClose={() => { setEditOpen(false); setNewDeptOpen(false); }}
                allMembers={allMembers}
            />
            <AddMembersModal
                dept={addMembersDept}
                open={addMembersOpen}
                onClose={() => setAddMembersOpen(false)}
                allMembers={allMembers}
                onMembersAdded={handleMembersAdded}
            />
            <InviteWorkerModal
                dept={inviteWorkerDept}
                open={inviteWorkerOpen}
                onClose={() => setInviteWorkerOpen(false)}
                allMembers={allMembers}
            />
        </>
    );
}

Departments.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Departments', href: '/departments' },
    ],
};



