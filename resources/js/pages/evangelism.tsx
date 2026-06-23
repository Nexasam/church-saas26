import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Award, Check, CheckCircle2, Globe, Heart,
    MessageSquare, MoreHorizontal, Phone, Plus,
    Search, Star, TrendingUp, Trash2, UserCheck, Users, Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

// ─── Types ───────────────────────────────────────────────────────────────────
type Stage  = 'soul_won' | 'visited' | 'membership_class' | 'worker' | 'established';
type Source = 'invited' | 'outreach' | 'social_media' | 'service' | 'evangelism' | 'member' | 'self';
type Tab    = 'funnel' | 'records' | 'leaderboard';

type ERecord = {
    id: number; name: string; initials: string; phone: string | null;
    email: string | null; location: string | null; source: Source; stage: Stage;
    status: string; date_won: string | null; notes: string | null;
    brought_by: string | null; brought_by_id: number | null;
    followed_up_by: string | null; followed_up_by_id: number | null;
    is_converted: boolean; converted_at: string | null;
    member_id: number | null; created_at: string;
};

type ActivityLog = {
    id: number; type: 'call' | 'message'; channel: string | null;
    note: string | null; logged_by: string; created_at: string;
};

type FunnelRow    = { stage: Stage; count: number; pct: number };
type LeaderEntry  = { member_id: number; name: string; initials: string; count: number };
type MemberOption = { id: number; name: string };
type Paginated    = { data: ERecord[]; current_page: number; last_page: number; total: number };

type PageProps = {
    funnelData: FunnelRow[]; sourceBreakdown: Record<string, number>;
    records: Paginated; leaderboard: LeaderEntry[];
    members: MemberOption[];
    stats: { total: number; established: number; converted: number };
    filters: { month: number; year: number; search: string; stage: string };
};

// ─── Config ───────────────────────────────────────────────────────────────────
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

const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];

// ─── Log New Convert Modal ───────────────────────────────────────────────────
function NewConvertModal({ open, onClose, members }: {
    open: boolean; onClose: () => void; members: MemberOption[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', phone: '', email: '', location: '',
        source: 'outreach' as Source,
        date_won: new Date().toISOString().split('T')[0],
        brought_by: '', followed_up_by: '', notes: '',
    });

    const noReferral = data.source === 'self' || data.source === 'outreach' || data.source === 'social_media';
    const noReferralNote: Record<string, string> = {
        self: 'Self walk-in – no referral to record.',
        outreach: 'Won during a church outreach event.',
        social_media: 'Found the church online.',
    };

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/evangelism', {
            onSuccess: () => { toast.success(`${data.name} logged!`); reset(); onClose(); },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="size-4 text-emerald-500" />Log New Convert
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4 py-1">
                    <div>
                        <Label className="field-label mb-1.5 block">Full Name *</Label>
                        <Input value={data.name} onChange={e => setData('name', e.target.value)}
                            placeholder="e.g. John Doe" className="h-9" required />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="field-label mb-1.5 block">Phone</Label>
                            <Input value={data.phone} onChange={e => setData('phone', e.target.value)}
                                placeholder="+234 800 000 0000" className="h-9" />
                        </div>
                        <div>
                            <Label className="field-label mb-1.5 block">Date Won *</Label>
                            <Input type="date" value={data.date_won}
                                onChange={e => setData('date_won', e.target.value)} className="h-9" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="field-label mb-1.5 block">Email</Label>
                            <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                placeholder="email@example.com" className="h-9" />
                        </div>
                        <div>
                            <Label className="field-label mb-1.5 block">Location</Label>
                            <Input value={data.location} onChange={e => setData('location', e.target.value)}
                                placeholder="e.g. Lekki, Lagos" className="h-9" />
                        </div>
                    </div>
                    <div>
                        <Label className="field-label mb-1.5 block">Channel they came through *</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {(Object.keys(sourceConfig) as Source[]).map(s => {
                                const cfg = sourceConfig[s]; const Icon = cfg.icon;
                                return (
                                    <button type="button" key={s} onClick={() => setData('source', s)}
                                        className={cn('flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all',
                                            data.source === s
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border hover:border-primary/40')}>
                                        <Icon className={cn('size-4', data.source === s ? 'text-primary' : 'text-muted-foreground')} />
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {noReferral ? (
                        <div className="rounded-lg bg-muted/50 border border-border px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground capitalize">{sourceConfig[data.source].label}</span>
                                {' – '}{noReferralNote[data.source]}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <Label className="field-label mb-1.5 block">
                                {data.source === 'member' ? 'Which Member Brought Them? *' : 'Won / Invited By *'}
                            </Label>
                            <select value={data.brought_by} onChange={e => setData('brought_by', e.target.value)}
                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                                <option value="">Select member...</option>
                                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <Label className="field-label mb-1.5 block">Assign Follow-Up To</Label>
                        <select value={data.followed_up_by} onChange={e => setData('followed_up_by', e.target.value)}
                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                            <option value="">Select member...</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label className="field-label mb-1.5 block">Notes</Label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2}
                            className="w-full rounded-lg border border-border bg-background text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="Any additional notes..." />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" className="flex-1 gap-2" disabled={processing}>
                            <Star className="size-4" />Log Soul Won
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Edit Record Modal ────────────────────────────────────────────────────────
function EditRecordModal({ record, members, onClose }: {
    record: ERecord; members: MemberOption[]; onClose: () => void;
}) {
    const { data, setData, patch, processing, errors } = useForm({
        name:           record.name,
        phone:          record.phone ?? '',
        email:          record.email ?? '',
        location:       record.location ?? '',
        notes:          record.notes ?? '',
        brought_by:     record.brought_by_id ? String(record.brought_by_id) : '',
        followed_up_by: record.followed_up_by_id ? String(record.followed_up_by_id) : '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(`/evangelism/${record.id}`, {
            onSuccess: () => { toast.success('Record updated.'); onClose(); },
        });
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4 py-1">
                    <div>
                        <Label className="field-label mb-1.5 block">Full Name *</Label>
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} required className="h-9" />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="field-label mb-1.5 block">Phone</Label>
                            <Input value={data.phone} onChange={e => setData('phone', e.target.value)} className="h-9" />
                        </div>
                        <div>
                            <Label className="field-label mb-1.5 block">Email</Label>
                            <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="h-9" />
                        </div>
                    </div>
                    <div>
                        <Label className="field-label mb-1.5 block">Location</Label>
                        <Input value={data.location} onChange={e => setData('location', e.target.value)} className="h-9" />
                    </div>
                    <div>
                        <Label className="field-label mb-1.5 block">Won / Brought By</Label>
                        <select value={data.brought_by} onChange={e => setData('brought_by', e.target.value)}
                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                            <option value="">None</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label className="field-label mb-1.5 block">Follow-Up Assigned To</Label>
                        <select value={data.followed_up_by} onChange={e => setData('followed_up_by', e.target.value)}
                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                            <option value="">None</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label className="field-label mb-1.5 block">Notes</Label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3}
                            className="w-full rounded-lg border border-border bg-background text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" className="flex-1" disabled={processing}>Save Changes</Button>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Record Detail Sheet ──────────────────────────────────────────────────────
function RecordDetailSheet({ record, members, onClose }: {
    record: ERecord | null; members: MemberOption[]; onClose: () => void;
}) {
    const [logTab, setLogTab]       = useState<'calls' | 'messages'>('calls');
    const [showLogForm, setShowLogForm] = useState(false);
    const [logNote, setLogNote]     = useState('');
    const [logChannel, setLogChannel] = useState('WhatsApp');
    const [convertOpen, setConvertOpen] = useState(false);
    const [editOpen, setEditOpen]   = useState(false);
    const [converted, setConverted] = useState(record?.is_converted ?? false);
    const [logs, setLogs]           = useState<ActivityLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [saving, setSaving]       = useState(false);

    // Sync converted state when record changes
    useEffect(() => { setConverted(record?.is_converted ?? false); }, [record?.id, record?.is_converted]);

    // Fetch logs whenever the sheet opens or tab changes
    useEffect(() => {
        if (!record) return;
        setLogsLoading(true);
        fetch(`/evangelism/${record.id}/logs`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => r.json())
            .then(data => { setLogs(data); setLogsLoading(false); })
            .catch(() => setLogsLoading(false));
    }, [record?.id, logTab]);

    if (!record) return null;

    const sc      = stageConfig[record.stage] ?? stageConfig.soul_won;
    const srcCfg  = sourceConfig[record.source as Source] ?? { label: record.source, icon: Star };
    const SrcIcon = srcCfg.icon;

    const filteredLogs = logs.filter(l =>
        logTab === 'calls' ? l.type === 'call' : l.type === 'message'
    );

    function updateStage(stage: Stage) {
        router.patch(`/evangelism/${record!.id}`, { stage }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Stage updated.'),
        });
    }

    function doConvert(membershipType: string) {
        router.post(`/evangelism/${record!.id}/convert`, { membership_type: membershipType }, {
            onSuccess: () => { setConverted(true); setConvertOpen(false); toast.success(`${record!.name} added to Members!`); onClose(); },
        });
    }

    async function saveLog() {
        if (!record) return;
        setSaving(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
            const res = await fetch(`/evangelism/${record.id}/logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    type:    logTab === 'calls' ? 'call' : 'message',
                    channel: logTab === 'messages' ? logChannel : null,
                    note:    logNote,
                }),
            });
            if (res.ok) {
                toast.success('Log saved.');
                setShowLogForm(false);
                setLogNote('');
                // Refresh logs
                const updated = await fetch(`/evangelism/${record.id}/logs`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
                setLogs(await updated.json());
            }
        } finally {
            setSaving(false);
        }
    }

    async function deleteLog(logId: number) {
        if (!record) return;
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        await fetch(`/evangelism/${record.id}/logs/${logId}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
        });
        setLogs(prev => prev.filter(l => l.id !== logId));
        toast.success('Log deleted.');
    }

    return (
        <>
        <Sheet open={!!record} onOpenChange={o => !o && onClose()}>
            <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col overflow-hidden">
                <SheetHeader className="px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-base font-bold">
                            {record.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <SheetTitle className="text-base font-semibold">{record.name}</SheetTitle>
                            {record.phone && <p className="text-sm text-muted-foreground">{record.phone}</p>}
                        </div>
                        <button onClick={() => setEditOpen(true)}
                            className="text-xs text-primary hover:underline shrink-0">Edit</button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Stage / Source badges */}
                    <div className="px-5 py-3.5 border-b border-border flex items-center gap-2 flex-wrap">
                        <span className={cn('text-xs font-medium rounded-full px-2.5 py-1', sc.bg, sc.color)}>{sc.label}</span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                            <SrcIcon className="size-3" />{srcCfg.label}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="px-5 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Details</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div><p className="text-xs text-muted-foreground">Won By</p><p className="text-sm font-medium">{record.brought_by ?? '–'}</p></div>
                            <div><p className="text-xs text-muted-foreground">Date Won</p><p className="text-sm font-medium">{record.date_won ?? '–'}</p></div>
                            <div><p className="text-xs text-muted-foreground">Follow-Up</p><p className="text-sm font-medium">{record.followed_up_by ?? '–'}</p></div>
                            <div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm font-medium">{record.location ?? '–'}</p></div>
                        </div>
                        {record.notes && (
                            <div className="mt-3 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">{record.notes}</div>
                        )}
                    </div>

                    {/* Move Stage */}
                    <div className="px-5 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Move Stage</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {(Object.keys(stageConfig) as Stage[]).map(s => (
                                <button key={s} onClick={() => updateStage(s)}
                                    className={cn('text-xs rounded-full px-2.5 py-1 font-medium border transition-all',
                                        record.stage === s
                                            ? `${stageConfig[s].bg} ${stageConfig[s].color} border-current`
                                            : 'border-border text-muted-foreground hover:border-primary/40')}>
                                    {record.stage === s && <Check className="size-2.5 inline mr-1" />}
                                    {stageConfig[s].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Activity Logs */}
                    <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-0 rounded-lg bg-muted p-0.5">
                                {(['calls', 'messages'] as const).map(t => (
                                    <button key={t} onClick={() => setLogTab(t)}
                                        className={cn('flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all capitalize',
                                            logTab === t ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                                        {t === 'calls' ? <Phone className="size-3" /> : <MessageSquare className="size-3" />}
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowLogForm(v => !v)}
                                className="text-xs text-primary hover:underline flex items-center gap-1">
                                <Plus className="size-3" />Log {logTab === 'calls' ? 'Call' : 'Message'}
                            </button>
                        </div>

                        {showLogForm && (
                            <div className="mb-3 rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-2">
                                {logTab === 'messages' && (
                                    <div className="flex gap-2">
                                        {['WhatsApp', 'SMS', 'Email'].map(ch => (
                                            <button key={ch} onClick={() => setLogChannel(ch)}
                                                className={cn('text-xs rounded-full px-2.5 py-1 font-medium border transition-all',
                                                    logChannel === ch ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background hover:border-primary/40')}>
                                                {ch}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <textarea className="w-full rounded-lg border border-border bg-background text-xs p-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                                    rows={2} placeholder="Add a note..." value={logNote} onChange={e => setLogNote(e.target.value)} />
                                <div className="flex gap-2">
                                    <Button size="sm" className="h-7 text-xs flex-1" onClick={saveLog} disabled={saving}>
                                        {saving ? 'Saving…' : 'Save Log'}
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setShowLogForm(false); setLogNote(''); }}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {logsLoading ? (
                            <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>
                        ) : filteredLogs.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">
                                No {logTab} logged yet. Use the button above to add one.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {filteredLogs.map(log => (
                                    <div key={log.id} className="group rounded-lg border border-border bg-muted/20 p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                {log.channel && (
                                                    <span className="text-xs font-medium text-primary mr-1.5">{log.channel}</span>
                                                )}
                                                <span className="text-xs text-muted-foreground">{log.created_at} · {log.logged_by}</span>
                                                {log.note && <p className="text-xs mt-1 text-foreground">{log.note}</p>}
                                            </div>
                                            <button onClick={() => deleteLog(log.id)}
                                                className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-opacity shrink-0">
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-border p-4 flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button className="flex-1 gap-1.5" size="sm" onClick={() => { setShowLogForm(true); setLogTab('calls'); }}>
                            <Phone className="size-3.5" />Log Call
                        </Button>
                        <Button variant="outline" className="flex-1 gap-1.5" size="sm" onClick={() => { setShowLogForm(true); setLogTab('messages'); }}>
                            <MessageSquare className="size-3.5" />Log Message
                        </Button>
                    </div>
                    {converted ? (
                        <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Added to Members</span>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm"
                            className="w-full gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 dark:border-emerald-700 dark:text-emerald-400"
                            onClick={() => setConvertOpen(true)}>
                            <UserCheck className="size-4" />Convert to Member
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>

        {/* Convert Dialog */}
        <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCheck className="size-4 text-emerald-600" />Convert to Member
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <p className="text-sm text-muted-foreground">
                        This will create a full member profile for{' '}
                        <span className="font-medium text-foreground">{record.name}</span>.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {[{ v: 'full', l: 'Full Member' }, { v: 'visitor', l: 'Visitor' }, { v: 'youth', l: 'Youth' }].map(t => (
                            <button key={t.v} onClick={() => doConvert(t.v)}
                                className="rounded-lg border border-border p-2.5 text-xs font-medium hover:border-primary/50 hover:bg-muted/50 transition-all text-center">
                                {t.l}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        {editOpen && (
            <EditRecordModal record={record} members={members} onClose={() => setEditOpen(false)} />
        )}
        </>
    );
}

// ─── Funnel Tab ───────────────────────────────────────────────────────────────
function FunnelTab({ funnelData, sourceBreakdown, stats, leaderboard, filters, onLogSoul }: {
    funnelData: FunnelRow[]; sourceBreakdown: Record<string, number>;
    stats: PageProps['stats']; leaderboard: LeaderEntry[];
    filters: PageProps['filters']; onLogSoul: () => void;
}) {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(filters.month - 1); // 0-indexed for display
    const [selectedYear,  setSelectedYear]  = useState(filters.year);

    function applyFilter(month0indexed: number, year: number) {
        router.get('/evangelism', { month: month0indexed + 1, year }, { preserveState: true, replace: true });
    }

    const total    = stats.total || 1;
    const convRate = total > 0 ? ((stats.established / total) * 100).toFixed(1) : '0.0';

    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-4">
                {/* Funnel card */}
                <div className="card-base p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold">Conversion Funnel</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{MONTHS[selectedMonth]} {selectedYear}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <select value={selectedMonth}
                                onChange={e => { const m = Number(e.target.value); setSelectedMonth(m); applyFilter(m, selectedYear); }}
                                className="h-7 rounded-lg border border-border bg-background px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring">
                                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                            </select>
                            <select value={selectedYear}
                                onChange={e => { const y = Number(e.target.value); setSelectedYear(y); applyFilter(selectedMonth, y); }}
                                className="h-7 rounded-lg border border-border bg-background px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring">
                                {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {funnelData.map(row => (
                            <div key={row.stage}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2.5 rounded-sm" style={{ backgroundColor: STAGE_COLORS[row.stage] }} />
                                        <span className="text-sm font-medium">{stageConfig[row.stage].label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{row.pct}%</span>
                                        <span className="text-sm font-bold tabular-nums">{row.count}</span>
                                    </div>
                                </div>
                                <div className="relative h-7 rounded-lg bg-muted overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                                        style={{ width: `${Math.max(row.pct, row.count > 0 ? 4 : 0)}%`, backgroundColor: STAGE_COLORS[row.stage], opacity: 0.85 }} />
                                    <div className="absolute inset-0 flex items-center px-3">
                                        <span className="text-xs font-semibold text-white drop-shadow-sm">{row.count} people</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-muted/50 text-sm">
                        <span className="text-muted-foreground">Overall conversion rate (all-time)</span>
                        <span className="font-bold text-primary">{convRate}%</span>
                    </div>
                </div>

                {/* Source breakdown */}
                <div className="card-base p-5">
                    <h4 className="text-sm font-semibold mb-4">Source Breakdown</h4>
                    {Object.keys(sourceBreakdown).length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">No data yet</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1]).map(([src, count]) => {
                                const maxCount = Math.max(...Object.values(sourceBreakdown));
                                const cfg = sourceConfig[src as Source];
                                return (
                                    <div key={src}>
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-muted-foreground font-medium capitalize flex items-center gap-1.5">
                                                {cfg && <cfg.icon className="size-3" />}
                                                {cfg?.label ?? src.replace('_', ' ')}
                                            </span>
                                            <span className="font-semibold">{count}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full rounded-full bg-primary/70 transition-all duration-500"
                                                style={{ width: `${(count / maxCount) * 100}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="card-base p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="size-4 text-emerald-500" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Reached</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="card-base p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="size-4 text-primary" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Established</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.established}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{convRate}%</p>
                    </div>
                    <div className="card-base p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <UserCheck className="size-4 text-blue-500" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Converted</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.converted}</p>
                    </div>
                </div>

                {/* Top Evangelists */}
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
                    <div className="divide-y divide-border">
                        {leaderboard.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">No records yet</p>
                        ) : leaderboard.slice(0, 5).map((l, i) => (
                            <div key={l.member_id} className="flex items-center gap-3 px-4 py-3">
                                <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                    i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                    i === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                    i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                    'bg-muted text-muted-foreground')}>#{i + 1}</div>
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{l.initials}</div>
                                <p className="flex-1 text-xs font-medium truncate">{l.name}</p>
                                <span className="text-sm font-bold tabular-nums">{l.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Records Tab ──────────────────────────────────────────────────────────────
function RecordsTab({ records, filters, onSelect }: {
    records: Paginated; filters: PageProps['filters']; onSelect: (r: ERecord) => void;
}) {
    const [search, setSearch]   = useState(filters.search);
    const [stage,  setStage]    = useState(filters.stage);
    const searchRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced server-side search
    const doSearch = useCallback((s: string, st: string) => {
        if (searchRef.current) clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => {
            router.get('/evangelism', { search: s, stage: st, month: filters.month, year: filters.year },
                { preserveState: true, replace: true });
        }, 350);
    }, [filters.month, filters.year]);

    function handleSearch(val: string) { setSearch(val); doSearch(val, stage); }
    function handleStage(val: string)  { setStage(val);  doSearch(search, val); }

    function goPage(page: number) {
        router.get('/evangelism', { search, stage, month: filters.month, year: filters.year, page },
            { preserveState: true, replace: true });
    }

    return (
        <div className="p-6">
            <div className="card-base overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border flex-wrap">
                    <div className="relative flex-1 min-w-[180px] max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input className="h-8 pl-8 text-sm bg-muted/50 border-transparent"
                            placeholder="Search name, phone, email…"
                            value={search} onChange={e => handleSearch(e.target.value)} />
                    </div>
                    <select value={stage} onChange={e => handleStage(e.target.value)}
                        className="h-8 rounded-lg border border-border bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring">
                        <option value="">All stages</option>
                        {(Object.keys(stageConfig) as Stage[]).map(s => (
                            <option key={s} value={s}>{stageConfig[s].label}</option>
                        ))}
                    </select>
                    <span className="text-xs text-muted-foreground ml-auto">{records.total} total</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {['Person', 'Stage', 'Won By', 'Date', 'Source', 'Status', ''].map(h => (
                                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {records.data.map(rec => {
                                const sc      = stageConfig[rec.stage] ?? stageConfig.soul_won;
                                const srcCfg  = sourceConfig[rec.source as Source] ?? { label: rec.source, icon: Star };
                                const SrcIcon = srcCfg.icon;
                                return (
                                    <tr key={rec.id} className="hover:bg-muted/20 transition-colors cursor-pointer group" onClick={() => onSelect(rec)}>
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
                                            <span className={cn('text-xs font-medium rounded-full px-2.5 py-1 whitespace-nowrap', sc.bg, sc.color)}>{sc.label}</span>
                                        </td>
                                        <td className="px-5 py-3 text-muted-foreground text-sm whitespace-nowrap">{rec.brought_by ?? '–'}</td>
                                        <td className="px-5 py-3 text-muted-foreground text-sm whitespace-nowrap">{rec.date_won ?? '–'}</td>
                                        <td className="px-5 py-3">
                                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                                                <SrcIcon className="size-3.5 shrink-0" />{srcCfg.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {rec.is_converted ? (
                                                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full px-2.5 py-1 font-medium whitespace-nowrap">Converted</span>
                                            ) : (
                                                <span className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1 font-medium capitalize whitespace-nowrap">{rec.status}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="size-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => onSelect(rec)}>View details</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive"
                                                        onClick={e => { e.stopPropagation(); router.delete(`/evangelism/${rec.id}`, { onSuccess: () => toast.success(`${rec.name} removed.`) }); }}>
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {records.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Star className="size-8 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">
                                {search || stage ? 'No records match your filters.' : 'No records yet. Log your first soul won!'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {records.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                            Page {records.current_page} of {records.last_page}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                                disabled={records.current_page === 1}
                                onClick={() => goPage(records.current_page - 1)}>
                                Previous
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                                disabled={records.current_page === records.last_page}
                                onClick={() => goPage(records.current_page + 1)}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Leaderboard Tab ──────────────────────────────────────────────────────────
function LeaderboardTab({ leaderboard }: { leaderboard: LeaderEntry[] }) {
    return (
        <div className="p-6">
            <div className="card-base overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border">
                    <h3 className="text-sm font-semibold">Evangelism Leaderboard</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Members ranked by souls they brought in</p>
                </div>
                {leaderboard.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Award className="size-8 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">No data yet. Start logging souls won!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {leaderboard.map((l, i) => {
                            const barWidth = `${(l.count / (leaderboard[0]?.count || 1)) * 100}%`;
                            return (
                                <div key={l.member_id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                                    <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                                        i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        i === 1 ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' :
                                        i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                        'bg-muted text-muted-foreground')}>#{i + 1}</div>
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                        {l.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{l.name}</p>
                                        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full rounded-full bg-primary/70 transition-all duration-500"
                                                style={{ width: barWidth }} />
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-2xl font-bold tabular-nums">{l.count}</p>
                                        <p className="text-xs text-muted-foreground">souls won</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Evangelism() {
    const { funnelData, sourceBreakdown, records, leaderboard, members, stats, filters } =
        usePage<PageProps>().props;

    const [tab,             setTab]             = useState<Tab>('funnel');
    const [newConvertOpen,  setNewConvertOpen]   = useState(false);
    const [selectedRecord,  setSelectedRecord]  = useState<ERecord | null>(null);

    const tabs: { id: Tab; label: string }[] = [
        { id: 'funnel',      label: 'Funnel View' },
        { id: 'records',     label: 'Records' },
        { id: 'leaderboard', label: 'Leaderboard' },
    ];

    return (
        <>
            <Head title="Evangelism" />
            <div className="flex flex-col h-full overflow-hidden">
                {/* Tabs */}
                <div className="flex items-center gap-0 border-b border-border px-6 shrink-0">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={cn('relative px-4 py-3 text-sm font-medium transition-colors',
                                tab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                            {t.label}
                            {tab === t.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {tab === 'funnel' && (
                        <FunnelTab
                            funnelData={funnelData}
                            sourceBreakdown={sourceBreakdown}
                            stats={stats}
                            leaderboard={leaderboard}
                            filters={filters}
                            onLogSoul={() => setNewConvertOpen(true)}
                        />
                    )}
                    {tab === 'records' && (
                        <RecordsTab
                            records={records}
                            filters={filters}
                            onSelect={setSelectedRecord}
                        />
                    )}
                    {tab === 'leaderboard' && (
                        <LeaderboardTab leaderboard={leaderboard} />
                    )}
                </div>
            </div>

            <NewConvertModal
                open={newConvertOpen}
                onClose={() => setNewConvertOpen(false)}
                members={members}
            />
            <RecordDetailSheet
                record={selectedRecord}
                members={members}
                onClose={() => setSelectedRecord(null)}
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
