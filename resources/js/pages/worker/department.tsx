import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Award, CalendarCheck, CheckCircle2, Circle, Crown, Mail,
    MoreHorizontal, Phone, Plus, Search, Shield, Trash2,
    UserCheck, Users, UserX, Zap, ChevronRight, Info,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

type DeptMember = {
    id: number; name: string; initials: string;
    phone: string | null; email: string | null;
    role: string; is_active: boolean;
    joined_at: string | null; attendance_count: number; last_attended: string | null;
};
type Dept = { id: number; name: string; description: string | null; icon: string; color: string; leader: string | null };
type Stats = { total_members: number; active_members: number; attendance_rate: number; present_today: number };
type Worker = { role: string; is_leader: boolean; is_admin: boolean };

// ── Add Member Modal ──────────────────────────────────────────────────────────
function AddMemberModal({ deptId, onClose }: { deptId: number; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', email: '', role: 'worker' });
    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/worker/department/${deptId}/members`, {
            onSuccess: () => { toast.success('Member added.'); reset(); onClose(); },
        });
    }
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="size-4" />Add Member</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4 py-1">
                    <div>
                        <Label className="field-label mb-1.5 block">Full Name *</Label>
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. John Doe" className="h-9" required />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label className="field-label mb-1.5 block">Email (optional)</Label>
                        <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="john@example.com" className="h-9" />
                        <InputError message={errors.email} />
                    </div>
                    <div>
                        <Label className="field-label mb-1.5 block">Role</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['worker', 'leader'] as const).map(r => (
                                <button type="button" key={r} onClick={() => setData('role', r)}
                                    className={cn('rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all',
                                        data.role === r ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40')}>
                                    {r === 'leader' ? 'Leader' : 'Worker'}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">Workers are regular department members.</p>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" className="flex-1" disabled={processing}>Add Member</Button>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Attendance Modal ──────────────────────────────────────────────────────────
function AttendanceModal({ deptId, members, onClose }: { deptId: number; members: DeptMember[]; onClose: () => void }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState<Record<number, 'present' | 'absent'>>({});
    const [saving, setSaving] = useState(false);

    const activeMembers = members.filter(m => m.is_active);

    function toggle(id: number) {
        setStatus(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : 'present' }));
    }
    function markAll(s: 'present' | 'absent') {
        const obj: Record<number, 'present' | 'absent'> = {};
        activeMembers.forEach(m => { obj[m.id] = s; });
        setStatus(obj);
    }

    async function save() {
        setSaving(true);
        const presentIds = activeMembers.filter(m => status[m.id] === 'present').map(m => m.id);
        const absentIds  = activeMembers.filter(m => status[m.id] === 'absent').map(m => m.id);
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        const res = await fetch(`/worker/department/${deptId}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
            body: JSON.stringify({ service_date: date, present_ids: presentIds, absent_ids: absentIds }),
        });
        setSaving(false);
        if (res.ok) { toast.success('Attendance saved.'); onClose(); router.reload(); }
        else toast.error('Failed to save attendance.');
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarCheck className="size-4 text-primary" />Mark Attendance</DialogTitle></DialogHeader>
                <div className="flex flex-col gap-4 py-1">
                    <div>
                        <Label className="field-label mb-1.5 block">Service Date</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" />
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => markAll('present')}><CheckCircle2 className="size-3" />All Present</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => markAll('absent')}><UserX className="size-3" />All Absent</Button>
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto">
                        {activeMembers.map(m => {
                            const s = status[m.id];
                            return (
                                <button key={m.id} onClick={() => toggle(m.id)}
                                    className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left',
                                        s === 'present' ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20' :
                                        s === 'absent'  ? 'border-red-300 bg-red-50 dark:bg-red-950/20' :
                                        'border-border hover:border-primary/30')}>
                                    <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                        s === 'present' ? 'bg-emerald-100 text-emerald-700' :
                                        s === 'absent'  ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground')}>
                                        {m.initials}
                                    </div>
                                    <span className="flex-1 text-sm font-medium">{m.name}</span>
                                    {s === 'present' && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                                    {s === 'absent'  && <UserX className="size-4 text-red-500 shrink-0" />}
                                    {!s && <Circle className="size-4 text-muted-foreground/40 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-border">
                        <Button className="flex-1" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save Attendance'}</Button>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Member Detail Sheet ───────────────────────────────────────────────────────
function MemberSheet({ member, deptId, canManage, onClose }: {
    member: DeptMember; deptId: number; canManage: boolean; onClose: () => void;
}) {
    function changeRole(role: string) {
        router.patch(`/worker/department/${deptId}/member/${member.id}`, { role }, {
            onSuccess: () => { toast.success('Role updated.'); onClose(); },
        });
    }
    function remove() {
        if (!confirm(`Remove ${member.name} from this department?`)) return;
        router.delete(`/worker/department/${deptId}/member/${member.id}`, {
            onSuccess: () => { toast.success('Member removed.'); onClose(); },
        });
    }

    return (
        <Sheet open onOpenChange={o => !o && onClose()}>
            <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col">
                <SheetHeader className="px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-base font-bold">
                            {member.initials}
                        </div>
                        <div>
                            <SheetTitle className="text-base font-semibold">{member.name}</SheetTitle>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {member.role === 'leader' && <span className="flex items-center gap-1 text-xs text-amber-600 font-medium"><Crown className="size-3" />Leader</span>}
                                {member.role === 'worker' && <span className="text-xs text-muted-foreground">Worker</span>}
                                {!member.is_active && <Badge variant="outline" className="text-xs text-red-500 border-red-300">Inactive</Badge>}
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                    {/* Contact */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contact</h4>
                        <div className="flex flex-col gap-2">
                            {member.phone ? (
                                <a href={`tel:${member.phone}`} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600"><Phone className="size-4" /></div>
                                    <div className="flex-1"><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{member.phone}</p></div>
                                    <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                </a>
                            ) : <p className="text-xs text-muted-foreground px-1">No phone number</p>}

                            {member.phone && (
                                <a href={`https://wa.me/${member.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"><Zap className="size-4" /></div>
                                    <div className="flex-1"><p className="text-xs text-muted-foreground">WhatsApp</p><p className="text-sm font-medium">{member.phone}</p></div>
                                    <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                </a>
                            )}

                            {member.email ? (
                                <a href={`mailto:${member.email}`} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600"><Mail className="size-4" /></div>
                                    <div className="flex-1 min-w-0"><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium truncate">{member.email}</p></div>
                                    <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                </a>
                            ) : <p className="text-xs text-muted-foreground px-1">No email address</p>}
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Details</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-muted/40"><p className="text-xs text-muted-foreground">Role</p><p className="text-sm font-medium capitalize">{member.role}</p></div>
                            <div className="p-3 rounded-xl bg-muted/40"><p className="text-xs text-muted-foreground">Status</p><p className={cn('text-sm font-medium', member.is_active ? 'text-emerald-600' : 'text-red-500')}>{member.is_active ? 'Active' : 'Inactive'}</p></div>
                            <div className="p-3 rounded-xl bg-muted/40"><p className="text-xs text-muted-foreground">Joined</p><p className="text-sm font-medium">{member.joined_at ?? '—'}</p></div>
                            <div className="p-3 rounded-xl bg-muted/40"><p className="text-xs text-muted-foreground">Attendance</p><p className="text-sm font-medium">{member.attendance_count} sessions</p></div>
                        </div>
                    </div>

                    {/* Leader actions */}
                    {canManage && (
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Manage</h4>
                            <div className="flex flex-col gap-2">
                                {member.role !== 'leader' && (
                                    <Button variant="outline" size="sm" className="justify-start gap-2 h-9" onClick={() => changeRole('leader')}>
                                        <Crown className="size-4 text-amber-500" />Make Leader
                                    </Button>
                                )}
                                {member.role === 'leader' && (
                                    <Button variant="outline" size="sm" className="justify-start gap-2 h-9" onClick={() => changeRole('worker')}>
                                        <Shield className="size-4 text-blue-500" />Remove as Leader
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" className="justify-start gap-2 h-9 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={remove}>
                                    <Trash2 className="size-4" />Remove from Department
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ── Member Row ────────────────────────────────────────────────────────────────
function MemberRow({ member, deptId, canManage, onSelect }: {
    member: DeptMember; deptId: number; canManage: boolean; onSelect: () => void;
}) {
    return (
        <div className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors cursor-pointer group" onClick={onSelect}>
            <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                member.role === 'leader'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-primary/10 text-primary')}>
                {member.initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{member.name}</span>
                    {member.role === 'leader' && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium shrink-0">
                            <Crown className="size-3" />Leader
                        </span>
                    )}
                    {!member.is_active && (
                        <Badge variant="outline" className="text-xs text-red-500 border-red-200 shrink-0">Inactive</Badge>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {member.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{member.phone}</span>}
                    {member.email && <span className="flex items-center gap-1 truncate"><Mail className="size-3 shrink-0" /><span className="truncate">{member.email}</span></span>}
                </div>
            </div>
            {canManage && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 shrink-0">
                            <MoreHorizontal className="size-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); onSelect(); }}>View details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {member.role !== 'leader' && (
                            <DropdownMenuItem onClick={e => { e.stopPropagation();
                                router.patch(`/worker/department/${deptId}/member/${member.id}`, { role: 'leader' },
                                    { onSuccess: () => toast.success('Promoted to leader.') }); }}>
                                <Crown className="size-3.5 mr-2 text-amber-500" />Make Leader
                            </DropdownMenuItem>
                        )}
                        {member.role === 'leader' && (
                            <DropdownMenuItem onClick={e => { e.stopPropagation();
                                router.patch(`/worker/department/${deptId}/member/${member.id}`, { role: 'worker' },
                                    { onSuccess: () => toast.success('Demoted to worker.') }); }}>
                                <Shield className="size-3.5 mr-2 text-blue-500" />Remove as Leader
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation();
                            if (confirm(`Remove ${member.name} from department?`))
                                router.delete(`/worker/department/${deptId}/member/${member.id}`,
                                    { onSuccess: () => toast.success('Removed.') }); }}>
                            <Trash2 className="size-3.5 mr-2" />Remove
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WorkerDepartment() {
    const { department, members, current_worker, stats } =
        usePage<{ department: Dept; members: DeptMember[]; current_worker: Worker; stats: Stats }>().props;

    const canManage = current_worker.is_leader || current_worker.is_admin;
    const [search, setSearch]           = useState('');
    const [selected, setSelected]       = useState<DeptMember | null>(null);
    const [addOpen, setAddOpen]         = useState(false);
    const [attendOpen, setAttendOpen]   = useState(false);

    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone?.includes(search) ||
        m.email?.toLowerCase().includes(search.toLowerCase())
    );

    const workers = members.filter(m => m.role === 'worker');
    const deptLeaders = members.filter(m => m.role === 'leader');

    return (
        <>
            <Head title={`${department.name} — Worker Portal`} />
            <div className="flex flex-col gap-6 p-6">

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Link href="/worker/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                Worker Portal
                            </Link>
                            <span className="text-xs text-muted-foreground">/</span>
                            <span className="text-xs text-foreground font-medium">{department.name}</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">{department.name}</h1>
                        {department.description && (
                            <p className="text-sm text-muted-foreground">{department.description}</p>
                        )}
                    </div>
                    {canManage && (
                        <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setAttendOpen(true)}>
                            <CalendarCheck className="size-3.5" />Mark Attendance
                        </Button>
                        <Button size="sm" className="h-8 gap-1.5" onClick={() => setAddOpen(true)}>
                            <Plus className="size-3.5" />Add Member
                        </Button>
                    </div>
                    )}
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    {[
                        { label: 'Total Workers',  value: stats.total_members,  icon: Users,     color: 'text-primary' },
                        { label: 'Active',          value: stats.active_members, icon: UserCheck, color: 'text-emerald-600' },
                        { label: 'Leaders',         value: deptLeaders.length, icon: Crown, color: 'text-amber-600' },
                    ].map(s => (
                        <div key={s.label} className="card-base p-4 flex items-center gap-3">
                            <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted', s.color)}>
                                <s.icon className="size-4" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Member List ── */}
                <div className="card-base overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border gap-3">
                        <div className="flex items-center gap-2">
                            <Users className="size-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">Members</h2>
                            <Badge variant="secondary" className="h-5 px-1.5 text-xs">{members.length}</Badge>
                        </div>
                        <div className="relative max-w-xs w-full">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                            <Input className="h-8 pl-8 text-sm bg-muted/50 border-transparent" placeholder="Search members…"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>

                    {/* Leaders section */}
                    {filtered.filter(m => m.role === 'leader').length > 0 && (
                        <div>
                            <div className="px-5 py-2 bg-amber-50/60 dark:bg-amber-950/10 border-b border-border">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Crown className="size-3" />Leader{deptLeaders.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="divide-y divide-border">
                                {filtered.filter(m => m.role === 'leader').map(m => (
                                    <MemberRow key={m.id} member={m} deptId={department.id} canManage={canManage} onSelect={() => setSelected(m)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Workers section — everyone except leader */}
                    {filtered.filter(m => m.role !== 'leader').length > 0 && (
                        <div>
                            <div className="px-5 py-2 bg-blue-50/50 dark:bg-blue-950/10 border-b border-border">
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Shield className="size-3" />Workers
                                </p>
                            </div>
                            <div className="divide-y divide-border">
                                {filtered.filter(m => m.role !== 'leader').map(m => (
                                    <MemberRow key={m.id} member={m} deptId={department.id} canManage={canManage} onSelect={() => setSelected(m)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <Users className="size-8 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">{search ? 'No members match your search.' : 'No members yet.'}</p>
                        </div>
                    )}
                </div>

                {/* ── Department Info ── */}
                <div className="card-base p-5">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Info className="size-4 text-muted-foreground" />Department Info
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><p className="text-xs text-muted-foreground mb-0.5">Description</p><p className="text-sm">{department.description || '—'}</p></div>
                        <div><p className="text-xs text-muted-foreground mb-0.5">Department Leader</p><p className="text-sm font-medium">{department.leader || '—'}</p></div>
                        <div><p className="text-xs text-muted-foreground mb-0.5">Your Role</p>
                            <span className={cn('inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1',
                                current_worker.role === 'leader' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                current_worker.role === 'admin'  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                'bg-muted text-muted-foreground')}>
                                {current_worker.role === 'leader' && <Crown className="size-3" />}
                                {current_worker.role === 'admin'  && <Shield className="size-3" />}
                                <span className="capitalize">{current_worker.role}</span>
                            </span>
                        </div>
                        <div><p className="text-xs text-muted-foreground mb-0.5">Total Members</p><p className="text-sm font-medium">{stats.total_members}</p></div>
                    </div>
                </div>
            </div>

            {/* Modals & Sheets */}
            {addOpen    && <AddMemberModal deptId={department.id} onClose={() => setAddOpen(false)} />}
            {attendOpen && <AttendanceModal deptId={department.id} members={members} onClose={() => setAttendOpen(false)} />}
            {selected   && <MemberSheet member={selected} deptId={department.id} canManage={canManage} onClose={() => setSelected(null)} />}
        </>
    );
}

WorkerDepartment.layout = {
    breadcrumbs: [
        { title: 'Worker Portal', href: '/worker/dashboard' },
        { title: 'Department', href: '#' },
    ],
};
