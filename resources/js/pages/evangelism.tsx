import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    Globe,
    Heart,
    MessageSquare,
    Plus,
    Star,
    Trash2,
    TrendingUp,
    UserCheck,
    Users,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type Stage = 'soul_won' | 'visited' | 'membership_class' | 'worker' | 'established';
type Source = 'invited' | 'outreach' | 'social_media' | 'service' | 'evangelism' | 'member' | 'self';

type EvangelismRecord = {
    id: number;
    name: string;
    initials: string;
    phone: string | null;
    email: string | null;
    location: string | null;
    source: Source;
    stage: Stage;
    status: string;
    date_won: string | null;
    notes: string | null;
    brought_by: string | null;
    brought_by_id: number | null;
    followed_up_by: string | null;
    followed_up_by_id: number | null;
    is_converted: boolean;
    converted_at: string | null;
    member_id: number | null;
    created_at: string;
};

type FunnelRow = { stage: Stage; count: number; pct: number };
type LeaderEntry = { member_id: number; name: string; initials: string; count: number };
type MemberOption = { id: number; name: string };

type PaginatedRecords = {
    data: EvangelismRecord[];
    current_page: number;
    last_page: number;
    total: number;
};

type PageProps = {
    funnelData: FunnelRow[];
    sourceBreakdown: Record<string, number>;
    records: PaginatedRecords;
    leaderboard: LeaderEntry[];
    members: MemberOption[];
    stats: { total: number; established: number; converted: number };
};

type Tab = 'funnel' | 'records' | 'leaderboard';

const STAGES: Stage[] = ['soul_won', 'visited', 'membership_class', 'worker', 'established'];

const stageConfig: Record<Stage, { label: string; color: string; bg: string }> = {
    soul_won:         { label: 'Members Reached', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    visited:          { label: 'Visited',          color: 'text-blue-700 dark:text-blue-400',       bg: 'bg-blue-100 dark:bg-blue-900/30' },
    membership_class: { label: 'Membership Class', color: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-900/30' },
    worker:           { label: 'Worker',           color: 'text-purple-700 dark:text-purple-400',   bg: 'bg-purple-100 dark:bg-purple-900/30' },
    established:      { label: 'Established',      color: 'text-teal-700 dark:text-teal-400',       bg: 'bg-teal-100 dark:bg-teal-900/30' },
};

const sourceConfig: Record<Source, { label: string; icon: React.ElementType }> = {
    invited:      { label: 'Invited',      icon: Heart },
    outreach:     { label: 'Outreach',     icon: Globe },
    social_media: { label: 'Social Media', icon: MessageSquare },
    service:      { label: 'Service',      icon: Users },
    evangelism:   { label: 'Evangelism',   icon: Zap },
    member:       { label: 'Member',       icon: Users },
    self:         { label: 'Self',         icon: Star },
};

const STAGE_COLORS: Record<Stage, string> = {
    soul_won:         'oklch(0.55 0.18 162)',
    visited:          'oklch(0.55 0.18 230)',
    membership_class: 'oklch(0.65 0.16 84)',
    worker:           'oklch(0.55 0.18 295)',
    established:      'oklch(0.52 0.15 162)',
};

const statusOptions = [
    { value: 'new',       label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'visited',   label: 'Visited' },
    { value: 'converted', label: 'Converted' },
    { value: 'inactive',  label: 'Inactive' },
];

const membershipTypes = [
    { value: 'full',    label: 'Full Member' },
    { value: 'visitor', label: 'Visitor' },
    { value: 'youth',   label: 'Youth' },
    { value: 'child',   label: 'Child' },
];

function sourceLabel(source: string): string {
    return sourceConfig[source as Source]?.label ?? source.replace(/_/g, ' ');
}

function NewConvertModal({
    open,
    onClose,
    members,
}: {
    open: boolean;
    onClose: () => void;
    members: MemberOption[];
}) {
    const today = new Date().toISOString().split('T')[0];
    const { data, setData, post, processing, errors, reset } = useForm({
        name:           '',
        phone:          '',
        email:          '',
        location:       '',
        source:         'outreach' as Source,
        date_won:       today,
        brought_by:     '' as string | number,
        followed_up_by: '' as string | number,
        notes:          '',
    });

    const noReferral = data.source === 'self' || data.source === 'outreach' || data.source === 'social_media';

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/evangelism', {
            onSuccess: () => {
                toast.success('Member reached logged successfully.');
                reset();
                onClose();
            },
        });
    }

    function handleClose() {
        reset();
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="size-4 text-emerald-500" />
                        Log Members Reached
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="flex flex-col gap-4 py-1">
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name *</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. John Doe"
                            className="h-9"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone</Label>
                            <Input
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="+234 800 000 0000"
                                className="h-9"
                            />
                            <InputError message={errors.phone} />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Date Won *</Label>
                            <Input
                                type="date"
                                value={data.date_won}
                                onChange={(e) => setData('date_won', e.target.value)}
                                className="h-9"
                                required
                            />
                            <InputError message={errors.date_won} />
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</Label>
                        <Input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="h-9"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Location / Address</Label>
                        <Input
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            placeholder="e.g. Lekki, Lagos"
                            className="h-9"
                        />
                        <InputError message={errors.location} />
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Channel *</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {(Object.keys(sourceConfig) as Source[]).map((s) => {
                                const cfg = sourceConfig[s];
                                const Icon = cfg.icon;
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => {
                                            setData('source', s);
                                            if (s === 'self' || s === 'outreach' || s === 'social_media') {
                                                setData('brought_by', '');
                                            }
                                        }}
                                        className={cn(
                                            'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-base',
                                            data.source === s
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border hover:border-primary/40 hover:bg-muted/50',
                                        )}
                                    >
                                        <Icon className={cn('size-4', data.source === s ? 'text-primary' : 'text-muted-foreground')} />
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                        <InputError message={errors.source} />
                    </div>

                    {!noReferral && (
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                                {data.source === 'member' ? 'Which Member Brought Them?' : 'Won / Invited By'}
                            </Label>
                            <select
                                value={data.brought_by}
                                onChange={(e) => setData('brought_by', e.target.value ? Number(e.target.value) : '')}
                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">Select member</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.brought_by} />
                        </div>
                    )}

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Assign Follow-Up To</Label>
                        <select
                            value={data.followed_up_by}
                            onChange={(e) => setData('followed_up_by', e.target.value ? Number(e.target.value) : '')}
                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <option value="">Unassigned</option>
                            {members.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.followed_up_by} />
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes</Label>
                        <textarea
                            className="w-full rounded-lg border border-border bg-muted/50 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={2}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Any additional notes..."
                        />
                        <InputError message={errors.notes} />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <Button type="submit" className="flex-1 gap-2" disabled={processing}>
                            <Star className="size-4" />
                            Log Members Reached
                        </Button>
                        <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function RecordDetailSheet({
    record,
    onClose,
    members,
}: {
    record: EvangelismRecord | null;
    onClose: () => void;
    members: MemberOption[];
}) {
    const [convertOpen, setConvertOpen] = useState(false);
    const [membershipType, setMembershipType] = useState('full');
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    useEffect(() => {
        if (record) {
            setNotes(record.notes ?? '');
        }
    }, [record]);

    if (!record) return null;

    const current = record;

    function patchRecord(
        payload: { stage?: Stage; status?: string; notes?: string; followed_up_by?: number | null },
        message: string,
    ) {
        router.patch(`/evangelism/${current.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => toast.success(message),
        });
    }

    function saveNotes() {
        setSavingNotes(true);
        router.patch(`/evangelism/${current.id}`, { notes }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Notes saved.'),
            onFinish: () => setSavingNotes(false),
        });
    }

    function convertToMember() {
        router.post(`/evangelism/${current.id}/convert`, { membership_type: membershipType }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${current.name} added to Members.`);
                setConvertOpen(false);
                onClose();
            },
        });
    }

    function deleteRecord() {
        if (!confirm(`Remove ${current.name} from evangelism records?`)) return;
        router.delete(`/evangelism/${current.id}`, {
            onSuccess: () => {
                toast.success(`${current.name} removed.`);
                onClose();
            },
        });
    }

    const sc = stageConfig[current.stage];
    const src = sourceConfig[current.source];
    const SrcIcon = src.icon;

    return (
        <Sheet open={!!current} onOpenChange={(o) => !o && onClose()}>
            <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col overflow-hidden">
                <SheetHeader className="px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-base font-bold">
                            {current.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <SheetTitle className="text-base font-semibold">{current.name}</SheetTitle>
                            {current.phone && <p className="text-sm text-muted-foreground">{current.phone}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={deleteRecord}>
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2 flex-wrap">
                        <span className={cn('text-xs font-medium rounded-full px-2.5 py-1', sc.bg, sc.color)}>{sc.label}</span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                            <SrcIcon className="size-3" />
                            {src.label}
                        </span>
                        {current.is_converted && (
                            <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Converted
                            </span>
                        )}
                    </div>

                    <div className="px-5 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Details</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Brought By</p>
                                <p className="text-sm font-medium">{current.brought_by ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Date Won</p>
                                <p className="text-sm font-medium">{current.date_won ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Follow-Up By</p>
                                <p className="text-sm font-medium">{current.followed_up_by ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="text-sm font-medium">{current.location ?? '—'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-4 border-b border-border flex flex-col gap-4">
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Stage</Label>
                            <select
                                value={current.stage}
                                onChange={(e) => patchRecord({ stage: e.target.value as Stage }, 'Stage updated.')}
                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {STAGES.map((s) => (
                                    <option key={s} value={s}>{stageConfig[s].label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Status</Label>
                            <select
                                value={current.status}
                                onChange={(e) => patchRecord({ status: e.target.value }, 'Status updated.')}
                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {statusOptions.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Assign Follow-Up To</Label>
                            <select
                                value={current.followed_up_by_id ?? ''}
                                onChange={(e) => patchRecord(
                                    { followed_up_by: e.target.value ? Number(e.target.value) : null },
                                    'Follow-up assignee updated.',
                                )}
                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">Unassigned</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="px-5 py-4">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes</Label>
                        <textarea
                            className="w-full rounded-lg border border-border bg-background text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Follow-up notes..."
                        />
                        <Button size="sm" className="mt-2 h-8" onClick={saveNotes} disabled={savingNotes}>
                            Save Notes
                        </Button>
                    </div>
                </div>

                <div className="border-t border-border p-4">
                    {current.is_converted ? (
                        <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Added to Members</span>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                            size="sm"
                            onClick={() => setConvertOpen(true)}
                        >
                            <UserCheck className="size-4" />
                            Convert to Member
                        </Button>
                    )}
                </div>

                <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <UserCheck className="size-4 text-emerald-600" />
                                Convert to Member
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-2">
                            <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border p-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                    {current.initials}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{current.name}</p>
                                    {current.phone && <p className="text-xs text-muted-foreground">{current.phone}</p>}
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Create a full member profile for <span className="font-medium text-foreground">{current.name}</span> and link it to this evangelism record.
                            </p>

                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Membership Type</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {membershipTypes.map((t) => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => setMembershipType(t.value)}
                                            className={cn(
                                                'rounded-lg border p-2 text-xs font-medium transition-all',
                                                membershipType === t.value
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border hover:border-primary/50 hover:bg-muted/50',
                                            )}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button
                                    className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={convertToMember}
                                >
                                    <UserCheck className="size-4" />
                                    Confirm & Add to Members
                                </Button>
                                <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </SheetContent>
        </Sheet>
    );
}

function FunnelTab({
    funnelData,
    sourceBreakdown,
    stats,
    leaderboard,
    onLogSoul,
}: {
    funnelData: FunnelRow[];
    sourceBreakdown: Record<string, number>;
    stats: PageProps['stats'];
    leaderboard: LeaderEntry[];
    onLogSoul: () => void;
}) {
    const maxCount = Math.max(...funnelData.map((f) => f.count), 1);
    const sourceTotal = Object.values(sourceBreakdown).reduce((sum, n) => sum + n, 0) || 1;
    const sourceRows = Object.entries(sourceBreakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([source, count]) => ({
            source: sourceLabel(source),
            count,
            pct: Math.round((count / sourceTotal) * 100),
        }));
    const convPct = stats.total > 0 ? Math.round((stats.established / stats.total) * 100) : 0;

    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-4">
                <div className="card-base p-5">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold">Conversion Funnel</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {stats.total} {stats.total === 1 ? 'person' : 'people'} tracked
                        </p>
                    </div>

                    {stats.total === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No evangelism records yet. Log your first soul won.</p>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3">
                                {funnelData.map((stage, i) => {
                                    const widthPct = Math.max(Math.round((stage.count / maxCount) * 100), stage.count > 0 ? 8 : 0);
                                    return (
                                        <div key={stage.stage}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2.5 rounded-sm" style={{ backgroundColor: STAGE_COLORS[stage.stage] }} />
                                                    <span className="text-sm font-medium">{stageConfig[stage.stage].label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">{stage.pct}%</span>
                                                    <span className="text-sm font-bold tabular-nums">{stage.count}</span>
                                                </div>
                                            </div>
                                            <div className="relative h-7 rounded-lg bg-muted overflow-hidden">
                                                <div
                                                    className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                                                    style={{
                                                        width: `${widthPct}%`,
                                                        backgroundColor: STAGE_COLORS[stage.stage],
                                                        transitionDelay: `${i * 100}ms`,
                                                        opacity: 0.85,
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center px-3">
                                                    <span className="text-xs font-semibold text-white drop-shadow-sm">{stage.count} people</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-muted/50 text-sm">
                                <span className="text-muted-foreground">Established rate</span>
                                <span className="font-bold text-primary">{convPct}%</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="card-base p-5">
                    <h4 className="text-sm font-semibold mb-4">Source Breakdown</h4>
                    {sourceRows.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">No source data yet</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {sourceRows.map((s) => (
                                <div key={s.source}>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-muted-foreground font-medium">{s.source}</span>
                                        <span className="font-semibold">{s.count}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full rounded-full bg-primary/70 transition-all duration-500" style={{ width: `${s.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="card-base p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="size-4 text-emerald-500" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Members Reached</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="card-base p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="size-4 text-primary" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Established</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.established}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {stats.converted} converted to members
                        </p>
                    </div>
                </div>

                <div className="card-base overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                            <Award className="size-4 text-amber-500" />
                            <h4 className="text-sm font-semibold">Top Evangelists</h4>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5" onClick={onLogSoul}>
                            <Plus className="size-3" /> Log Soul
                        </Button>
                    </div>
                    {leaderboard.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No leaderboard data yet</p>
                    ) : (
                        <div className="divide-y divide-border">
                            {leaderboard.slice(0, 5).map((l, i) => (
                                <div key={l.member_id} className="flex items-center gap-3 px-4 py-3">
                                    <div className={cn(
                                        'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                        i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        i === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                                    )}>#{i + 1}</div>
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{l.initials}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{l.name}</p>
                                    </div>
                                    <span className="text-sm font-bold tabular-nums">{l.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function RecordsTab({
    records,
    onLogSoul,
    onSelect,
}: {
    records: PaginatedRecords;
    onLogSoul: () => void;
    onSelect: (r: EvangelismRecord) => void;
}) {
    return (
        <div className="p-6 flex flex-col gap-4">
            <div className="card-base overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                    <h3 className="text-sm font-semibold">Potential members ({records.total})</h3>
                    <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={onLogSoul}>
                        <Plus className="size-3.5" />
                        Log New
                    </Button>
                </div>

                {records.data.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-12">No records yet. Log your first member reached.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    {['Person', 'Stage', 'Brought By', 'Date Won', 'Source', 'Status', 'Follow-Up'].map((h) => (
                                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {records.data.map((rec) => {
                                    const sc = stageConfig[rec.stage];
                                    const src = sourceConfig[rec.source];
                                    const SrcIcon = src.icon;
                                    return (
                                        <tr
                                            key={rec.id}
                                            className="hover:bg-muted/20 transition-base cursor-pointer"
                                            onClick={() => onSelect(rec)}
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{rec.initials}</div>
                                                    <div>
                                                        <span className="font-medium">{rec.name}</span>
                                                        {rec.phone && <p className="text-xs text-muted-foreground">{rec.phone}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={cn('text-xs font-medium rounded-full px-2.5 py-1', sc.bg, sc.color)}>{sc.label}</span>
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">{rec.brought_by ?? '—'}</td>
                                            <td className="px-5 py-3 text-muted-foreground">{rec.date_won ?? '—'}</td>
                                            <td className="px-5 py-3">
                                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <SrcIcon className="size-3.5" />{src.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 capitalize text-muted-foreground">{rec.status.replace(/_/g, ' ')}</td>
                                            <td className="px-5 py-3 text-muted-foreground">{rec.followed_up_by ?? '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {records.last_page > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={records.current_page === 1}
                        onClick={() => router.get('/evangelism', { page: records.current_page - 1 }, { preserveState: true })}
                    >
                        Previous
                    </Button>
                    <span className="text-xs px-2">{records.current_page} / {records.last_page}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={records.current_page === records.last_page}
                        onClick={() => router.get('/evangelism', { page: records.current_page + 1 }, { preserveState: true })}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

function LeaderboardTab({ leaderboard }: { leaderboard: LeaderEntry[] }) {
    const maxCount = leaderboard[0]?.count ?? 1;

    return (
        <div className="p-6">
            <div className="card-base overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border">
                    <h3 className="text-sm font-semibold">Evangelism Leaderboard</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Members who brought the most souls</p>
                </div>
                {leaderboard.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-12">No leaderboard data yet</p>
                ) : (
                    <div className="divide-y divide-border">
                        {leaderboard.map((l, i) => (
                            <div key={l.member_id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-base">
                                <div className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                                    i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                    i === 1 ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' :
                                    i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                    'bg-muted text-muted-foreground',
                                )}>#{i + 1}</div>
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">{l.initials}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium">{l.name}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-2xl font-bold tabular-nums">{l.count}</p>
                                    <p className="text-xs text-muted-foreground">Members Reached</p>
                                </div>
                                <div className="w-24 shrink-0">
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${(l.count / maxCount) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Evangelism() {
    const { funnelData, sourceBreakdown, records, leaderboard, members, stats } = usePage<PageProps>().props;
    const [tab, setTab] = useState<Tab>('funnel');
    const [newConvertOpen, setNewConvertOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<EvangelismRecord | null>(null);

    useEffect(() => {
        setSelectedRecord((current) => {
            if (!current) return null;
            return records.data.find((r) => r.id === current.id) ?? null;
        });
    }, [records]);

    const tabs: { id: Tab; label: string }[] = [
        { id: 'funnel', label: 'Funnel View' },
        { id: 'records', label: 'Records' },
        { id: 'leaderboard', label: 'Leaderboard' },
    ];

    return (
        <>
            <Head title="Evangelism" />
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Evangelism</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {stats.total} {stats.total === 1 ? 'soul' : 'souls'} tracked · {stats.established} established
                        </p>
                    </div>
                    <Button size="sm" className="h-8 gap-1.5" onClick={() => setNewConvertOpen(true)}>
                        <Plus className="size-3.5" />
                        Log Members Reached
                    </Button>
                </div>

                <div className="flex items-center gap-0 border-b border-border px-6 shrink-0">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={cn(
                                'relative px-4 py-3 text-sm font-medium transition-base',
                                tab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {t.label}
                            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {tab === 'funnel' && (
                        <FunnelTab
                            funnelData={funnelData}
                            sourceBreakdown={sourceBreakdown}
                            stats={stats}
                            leaderboard={leaderboard}
                            onLogSoul={() => setNewConvertOpen(true)}
                        />
                    )}
                    {tab === 'records' && (
                        <RecordsTab
                            records={records}
                            onLogSoul={() => setNewConvertOpen(true)}
                            onSelect={setSelectedRecord}
                        />
                    )}
                    {tab === 'leaderboard' && <LeaderboardTab leaderboard={leaderboard} />}
                </div>
            </div>

            <NewConvertModal open={newConvertOpen} onClose={() => setNewConvertOpen(false)} members={members} />
            <RecordDetailSheet
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
                members={members}
            />
        </>
    );
}

Evangelism.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Evangelism', href: '/evangelism' },
    ],
};
