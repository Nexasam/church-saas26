import { Head } from '@inertiajs/react';
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
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { mockDepartments, mockMembers, type Department } from '@/lib/mock-data';
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

function EditDepartmentModal({ dept, open, onClose }: {
    dept: Department | null;
    open: boolean;
    onClose: () => void;
}) {
    const [form, setForm] = useState({
        name:        dept?.name ?? '',
        description: dept?.description ?? '',
        leader:      dept?.leader ?? '',
        icon:        dept?.icon ?? 'Users',
        color:       dept?.color ?? 'blue',
    });

    const isNew = !dept;

    function save() {
        // When backend is wired: POST/PATCH /departments
        toast.success(isNew ? `Department "${form.name}" created.` : `"${form.name}" updated.`);
        onClose();
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
                        <Input value={form.leader} onChange={e => setForm(p => ({ ...p, leader: e.target.value }))} placeholder="e.g. Bro. Emmanuel" className="h-9" />
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

// ── Add Members Modal ─────────────────────────────────────────────────────────

function AddMembersModal({ dept, open, onClose }: {
    dept: Department | null;
    open: boolean;
    onClose: () => void;
}) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<string[]>([]);

    if (!dept) return null;

    const already = mockMembers.filter(m => m.departments.includes(dept.name)).map(m => m.id);
    const available = mockMembers.filter(m =>
        !m.departments.includes(dept.name) &&
        (m.name.toLowerCase().includes(search.toLowerCase()) ||
         m.phone.includes(search))
    );

    function toggle(id: string) {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    function save() {
        toast.success(`${selected.length} member${selected.length !== 1 ? 's' : ''} added to ${dept.name}.`);
        setSelected([]);
        setSearch('');
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={() => { setSelected([]); setSearch(''); onClose(); }}>
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
                            autoFocus
                        />
                    </div>

                    {/* Already in department */}
                    {already.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {already.length} member{already.length !== 1 ? 's' : ''} already in this department
                        </p>
                    )}

                    {/* Member list */}
                    <div className="flex flex-col gap-1 max-h-64 overflow-y-auto scrollbar-thin rounded-lg border border-border">
                        {available.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">
                                {search ? `No results for "${search}"` : 'All members are already in this department'}
                            </p>
                        ) : available.map(m => {
                            const isSelected = selected.includes(m.id);
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => toggle(m.id)}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50',
                                        isSelected && 'bg-primary/5',
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
                        })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-muted-foreground">
                            {selected.length > 0 ? `${selected.length} selected` : 'Select members to add'}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8" onClick={() => { setSelected([]); onClose(); }}>Cancel</Button>
                            <Button size="sm" className="h-8 gap-1.5" disabled={selected.length === 0} onClick={save}>
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

function ManageDepartmentSheet({ dept, open, onClose, onEdit, onAddMembers }: {
    dept: Department | null;
    open: boolean;
    onClose: () => void;
    onEdit: () => void;
    onAddMembers: () => void;
}) {
    const [memberSearch, setMemberSearch] = useState('');

    if (!dept) return null;

    const IconComponent = iconMap[dept.icon] || Users;
    const c = colorMap[dept.color];
    const deptMembers = mockMembers.filter(m => m.departments.includes(dept.name));
    const filtered = memberSearch
        ? deptMembers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
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
                        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs shrink-0" onClick={onEdit}>
                            <Pencil className="size-3" />
                            Edit
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Stats */}
                    <div className="px-5 py-4 border-b border-border">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold">{dept.memberCount}</p>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold text-emerald-600">{dept.activeCount}</p>
                                <p className="text-xs text-muted-foreground">Active</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold text-amber-600">{dept.memberCount - dept.activeCount}</p>
                                <p className="text-xs text-muted-foreground">Inactive</p>
                            </div>
                        </div>
                    </div>

                    {/* Leader */}
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

                    {/* Members */}
                    <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Members ({deptMembers.length})
                            </h4>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={onAddMembers}>
                                <UserPlus className="size-3" />
                                Add Members
                            </Button>
                        </div>

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
                                    <div key={m.id} className="flex items-center gap-2.5 rounded-lg hover:bg-muted/40 p-2 transition-base group">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                            {m.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{m.name}</p>
                                            <p className="text-xs text-muted-foreground">{m.phone}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{m.attendanceRate}%</span>
                                        <button
                                            className="opacity-0 group-hover:opacity-100 flex size-5 items-center justify-center rounded text-muted-foreground hover:text-destructive transition-all"
                                            title="Remove from department"
                                            onClick={() => toast.success(`${m.name} removed from ${dept.name}.`)}
                                        >
                                            <X className="size-3.5" />
                                        </button>
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
                    <Button className="flex-1 gap-1.5" size="sm" onClick={onAddMembers}>
                        <UserPlus className="size-3.5" />
                        Add Members
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
                        <Pencil className="size-3.5" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive hover:bg-destructive/10"
                        onClick={() => { toast.success(`${dept.name} deleted.`); onClose(); }}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ── Department Detail Sheet (old — kept for row click) ────────────────────────

function DepartmentDetailSheet({ dept, onClose }: { dept: Department | null; onClose: () => void }) {
    if (!dept) return null;
    const IconComponent = iconMap[dept.icon] || Users;
    const c = colorMap[dept.color];
    const deptMembers = mockMembers.filter((m) => m.departments.includes(dept.name));

    return (
        <Sheet open={!!dept} onOpenChange={(o) => !o && onClose()}>
            <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col overflow-hidden">
                <SheetHeader className="px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl border', c.bg, c.border)}>
                            <IconComponent className={cn('size-5', c.icon)} />
                        </div>
                        <div>
                            <SheetTitle className="text-base">{dept.name}</SheetTitle>
                            <p className="text-sm text-muted-foreground">{dept.description}</p>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Stats */}
                    <div className="px-5 py-4 border-b border-border">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold">{dept.memberCount}</p>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold text-emerald-600">{dept.activeCount}</p>
                                <p className="text-xs text-muted-foreground">Active</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold text-amber-600">{dept.memberCount - dept.activeCount}</p>
                                <p className="text-xs text-muted-foreground">Inactive</p>
                            </div>
                        </div>
                    </div>

                    {/* Leader */}
                    <div className="px-5 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Department Leader</h4>
                        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                                {dept.leader.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{dept.leader}</p>
                                <p className="text-xs text-muted-foreground">Department Leader</p>
                            </div>
                        </div>
                    </div>

                    {/* Members list */}
                    <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Members in this system</h4>
                            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                                <Plus className="size-3" />
                                Add
                            </Button>
                        </div>
                        {deptMembers.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {deptMembers.map((m) => (
                                    <div key={m.id} className="flex items-center gap-2.5 rounded-lg hover:bg-muted/40 p-2 transition-base">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                            {m.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{m.name}</p>
                                            <p className="text-xs text-muted-foreground">{m.phone}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{m.attendanceRate}% att.</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No members linked yet in this demo
                            </p>
                        )}
                    </div>
                </div>

                <div className="border-t border-border p-4 flex gap-2">
                    <Button className="flex-1" size="sm">Manage Department</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function Departments() {
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [manageDept, setManageDept]     = useState<Department | null>(null);
    const [editDept, setEditDept]         = useState<Department | null>(null);
    const [addMembersDept, setAddMembersDept] = useState<Department | null>(null);
    const [editOpen, setEditOpen]         = useState(false);
    const [addMembersOpen, setAddMembersOpen] = useState(false);
    const [manageOpen, setManageOpen]     = useState(false);
    const [newDeptOpen, setNewDeptOpen]   = useState(false);
    const [search, setSearch]             = useState('');

    const totalMembers = mockDepartments.reduce((s, d) => s + d.memberCount, 0);

    const filtered = mockDepartments.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.leader.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Head title="Departments" />
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Departments</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {mockDepartments.length} departments · {totalMembers} total assignments
                        </p>
                    </div>
                    <Button size="sm" className="h-8 gap-1.5" onClick={() => { setEditDept(null); setNewDeptOpen(true); }}>
                        <Plus className="size-3.5" />
                        New Department
                    </Button>
                </div>

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
                                const c = colorMap[dept.color];
                                const activePct = Math.round((dept.activeCount / dept.memberCount) * 100);

                                return (
                                    <tr
                                        key={dept.id}
                                        className="hover:bg-muted/20 transition-base cursor-pointer group"
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
                                            <div className="flex items-center gap-2">
                                                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                                    {dept.leader.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                                </div>
                                                <span className="text-sm text-muted-foreground">{dept.leader}</span>
                                            </div>
                                        </td>

                                        {/* Total members */}
                                        <td className="px-5 py-3.5 font-semibold tabular-nums">
                                            {dept.memberCount}
                                        </td>

                                        {/* Active */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm font-semibold text-emerald-600">{dept.activeCount}</span>
                                            <span className="text-xs text-muted-foreground ml-1">/ {dept.memberCount}</span>
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
                                            {dept.lastActivity}
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
                                                    <DropdownMenuItem onClick={() => { setEditDept(dept); setEditOpen(true); }}>Edit department</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setAddMembersDept(dept); setAddMembersOpen(true); }}>Add members</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => toast.success(`${dept.name} deleted.`)}>Delete</DropdownMenuItem>
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

            <DepartmentDetailSheet dept={selectedDept} onClose={() => setSelectedDept(null)} />
            <ManageDepartmentSheet
                dept={manageDept}
                open={manageOpen}
                onClose={() => setManageOpen(false)}
                onEdit={() => { setEditDept(manageDept); setEditOpen(true); }}
                onAddMembers={() => { setAddMembersDept(manageDept); setAddMembersOpen(true); }}
            />
            <EditDepartmentModal
                dept={editDept}
                open={editOpen || newDeptOpen}
                onClose={() => { setEditOpen(false); setNewDeptOpen(false); }}
            />
            <AddMembersModal
                dept={addMembersDept}
                open={addMembersOpen}
                onClose={() => setAddMembersOpen(false)}
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
