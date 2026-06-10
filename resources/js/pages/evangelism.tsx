import { Head } from '@inertiajs/react';
import {
    Award,
    CalendarCheck,
    CheckCircle2,
    Circle,
    Clock,
    Globe,
    Heart,
    MessageSquare,
    Plus,
    Star,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
import {
    mockEvangelismFunnelData,
    mockEvangelismRecords,
    type EvangelismRecord,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type Tab = 'funnel' | 'records' | 'leaderboard';

// ── Config ────────────────────────────────────────────────────────────────────

const stageConfig: Record<EvangelismRecord['stage'], { label: string; color: string; bg: string }> = {
    soul_won:         { label: 'Soul Won',         color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    visited:          { label: 'Visited',          color: 'text-blue-700 dark:text-blue-400',       bg: 'bg-blue-100 dark:bg-blue-900/30' },
    membership_class: { label: 'Membership Class', color: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-900/30' },
    worker:           { label: 'Worker',           color: 'text-purple-700 dark:text-purple-400',   bg: 'bg-purple-100 dark:bg-purple-900/30' },
    established:      { label: 'Established',      color: 'text-teal-700 dark:text-teal-400',       bg: 'bg-teal-100 dark:bg-teal-900/30' },
};

const sourceConfig: Record<EvangelismRecord['source'], { label: string; icon: React.ElementType }> = {
    invited:      { label: 'Invited',      icon: Heart },
    outreach:     { label: 'Outreach',     icon: Globe },
    social_media: { label: 'Social Media', icon: MessageSquare },
    service:      { label: 'Service',      icon: Users },
    evangelism:   { label: 'Evangelism',   icon: Zap },
};

const leaderboard = [
    { name: 'Bro. Samuel Okafor', count: 14, avatar: 'SO', trend: '+3 this week' },
    { name: 'Sis. Ruth Okonkwo',  count: 11, avatar: 'RO', trend: '+2 this week' },
    { name: 'Bro. James Eze',     count: 9,  avatar: 'JE', trend: '+1 this week' },
    { name: 'Bro. David Martins', count: 7,  avatar: 'DM', trend: 'Same as last week' },
    { name: 'Sis. Grace Emeka',   count: 6,  avatar: 'GE', trend: '+2 this week' },
];

// ── New Convert Form ──────────────────────────────────────────────────────────

function NewConvertModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [source, setSource] = useState<EvangelismRecord['source']>('outreach');
    const today = new Date().toISOString().split('T')[0];

    const schedulePreview = [
        { day: 1,  label: 'Welcome Call',           date: '+1 day' },
        { day: 3,  label: 'Check-in Message',       date: '+3 days' },
        { day: 7,  label: 'Home Visit',             date: '+1 week' },
        { day: 14, label: 'Membership Class Invite', date: '+2 weeks' },
        { day: 30, label: 'Progress Review',        date: '+1 month' },
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="size-4 text-emerald-500" />
                        Log New Convert
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-1">
                    {/* Personal Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name *</Label>
                            <Input placeholder="e.g. John Doe" className="h-9" />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone Number</Label>
                            <Input placeholder="+234 800 000 0000" className="h-9" />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Date Won *</Label>
                            <Input type="date" className="h-9" defaultValue={today} />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Location / Address</Label>
                            <Input placeholder="e.g. Lekki, Lagos" className="h-9" />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Won By *</Label>
                            <Input placeholder="e.g. Bro. Samuel" className="h-9" />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Assign Follow-Up To</Label>
                            <Input placeholder="e.g. Sis. Ruth" className="h-9" />
                        </div>
                    </div>

                    {/* Source */}
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">How Were They Won? *</Label>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {(Object.keys(sourceConfig) as EvangelismRecord['source'][]).map((s) => {
                                const cfg = sourceConfig[s];
                                const Icon = cfg.icon;
                                return (
                                    <button
                                        key={s}
                                        onClick={() => setSource(s)}
                                        className={cn(
                                            'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-base',
                                            source === s
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border hover:border-primary/40 hover:bg-muted/50',
                                        )}
                                    >
                                        <Icon className={cn('size-4', source === s ? 'text-primary' : 'text-muted-foreground')} />
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Auto-schedule preview */}
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CalendarCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                Auto Follow-Up Schedule
                            </p>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">Auto-generated</Badge>
                        </div>
                        <div className="flex flex-col gap-2">
                            {schedulePreview.map((item) => (
                                <div key={item.day} className="flex items-center gap-2.5">
                                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                                        {item.day}
                                    </div>
                                    <p className="text-xs font-medium flex-1">{item.label}</p>
                                    <span className="text-xs text-muted-foreground">{item.date}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-3 opacity-80">
                            Tasks will be created automatically and assigned to the follow-up person above.
                        </p>
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes (optional)</Label>
                        <textarea
                            className="w-full rounded-lg border border-border bg-muted/50 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={2}
                            placeholder="Any additional notes about this person..."
                        />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <Button className="flex-1 gap-2" onClick={onClose}>
                            <Star className="size-4" />
                            Log Soul Won
                        </Button>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Record Detail Sheet ───────────────────────────────────────────────────────

function RecordDetailSheet({ record, onClose }: { record: EvangelismRecord | null; onClose: () => void }) {
    if (!record) return null;
    const sc = stageConfig[record.stage];
    const src = sourceConfig[record.source];
    const SrcIcon = src.icon;

    return (
        <Sheet open={!!record} onOpenChange={(o) => !o && onClose()}>
            <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col overflow-hidden">
                <SheetHeader className="px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-base font-bold">
                            {record.initials}
                        </div>
                        <div>
                            <SheetTitle className="text-base font-semibold">{record.name}</SheetTitle>
                            {record.phone && <p className="text-sm text-muted-foreground">{record.phone}</p>}
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Stage + Source */}
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2 flex-wrap">
                        <span className={cn('text-xs font-medium rounded-full px-2.5 py-1', sc.bg, sc.color)}>{sc.label}</span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                            <SrcIcon className="size-3" />
                            {src.label}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="px-5 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Details</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div><p className="text-xs text-muted-foreground">Won By</p><p className="text-sm font-medium">{record.wonBy}</p></div>
                            <div><p className="text-xs text-muted-foreground">Date Won</p><p className="text-sm font-medium">{record.wonDate}</p></div>
                            <div><p className="text-xs text-muted-foreground">Follow-ups Done</p><p className="text-sm font-bold">{record.followUps}</p></div>
                            <div><p className="text-xs text-muted-foreground">Last Follow-Up</p><p className="text-sm font-medium">{record.lastFollowUp || '—'}</p></div>
                        </div>
                    </div>

                    {/* Auto follow-up schedule */}
                    {record.autoSchedule && (
                        <div className="px-5 py-4">
                            <div className="flex items-center gap-2 mb-4">
                                <CalendarCheck className="size-4 text-primary" />
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Follow-Up Schedule</h4>
                            </div>
                            <div className="relative flex flex-col gap-0">
                                {record.autoSchedule.map((item, i) => {
                                    const isLast = i === record.autoSchedule!.length - 1;
                                    return (
                                        <div key={item.day} className="flex gap-3 group">
                                            <div className="flex flex-col items-center">
                                                <div className={cn(
                                                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                                    item.status === 'done'    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    item.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-muted text-muted-foreground',
                                                )}>
                                                    {item.status === 'done' ? (
                                                        <CheckCircle2 className="size-4" />
                                                    ) : item.status === 'overdue' ? (
                                                        <Clock className="size-4" />
                                                    ) : (
                                                        <Circle className="size-4 opacity-40" />
                                                    )}
                                                </div>
                                                {!isLast && <div className="w-0.5 flex-1 bg-border my-1 min-h-4" />}
                                            </div>
                                            <div className={cn('pb-4 min-w-0 flex-1', isLast && 'pb-0')}>
                                                <div className="flex items-center justify-between">
                                                    <p className={cn(
                                                        'text-sm font-medium',
                                                        item.status === 'done'    ? 'text-emerald-700 dark:text-emerald-400' :
                                                        item.status === 'overdue' ? 'text-red-600 dark:text-red-400 line-through' :
                                                        'text-foreground',
                                                    )}>
                                                        {item.label}
                                                    </p>
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn(
                                                            'text-[10px] h-4 px-1.5 ml-2',
                                                            item.status === 'done'    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            item.status === 'overdue' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                            '',
                                                        )}
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{item.dueDate}</p>
                                                {item.completedBy && (
                                                    <p className="text-xs text-muted-foreground/70 mt-0.5">by {item.completedBy}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-border p-4 flex gap-2">
                    <Button className="flex-1" size="sm">Log Follow-Up</Button>
                    <Button variant="outline" size="sm">Move Stage</Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ── Funnel Tab ────────────────────────────────────────────────────────────────

function FunnelTab({ onLogSoul }: { onLogSoul: () => void }) {
    const total = mockEvangelismFunnelData[0].count;
    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-base p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-semibold">Conversion Funnel</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Tracking {total} souls this month</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{new Date().toLocaleString('en-NG', { month: 'long', year: 'numeric' })}</Badge>
                </div>

                <div className="flex flex-col gap-4">
                    {mockEvangelismFunnelData.map((stage, i) => {
                        const prevCount = i === 0 ? stage.count : mockEvangelismFunnelData[i - 1].count;
                        const dropOff = i === 0 ? 0 : prevCount - stage.count;
                        return (
                            <div key={stage.stage}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2.5 rounded-sm" style={{ backgroundColor: stage.color }} />
                                        <span className="text-sm font-medium">{stage.stage}</span>
                                        {dropOff > 0 && <span className="text-xs text-muted-foreground">(−{dropOff} dropped)</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{stage.pct}%</span>
                                        <span className="text-sm font-bold tabular-nums">{stage.count}</span>
                                    </div>
                                </div>
                                <div className="relative h-8 rounded-lg bg-muted overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                                        style={{ width: `${stage.pct}%`, backgroundColor: stage.color, transitionDelay: `${i * 100}ms`, opacity: 0.85 }}
                                    />
                                    <div className="absolute inset-0 flex items-center px-3">
                                        <span className="text-xs font-semibold text-white drop-shadow-sm">{stage.count} people</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-5 flex items-center justify-between p-3 rounded-xl bg-muted/50 text-sm">
                    <span className="text-muted-foreground">Overall conversion rate</span>
                    <span className="font-bold text-primary">{((mockEvangelismFunnelData[4].count / total) * 100).toFixed(1)}%</span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="card-base p-4">
                        <div className="flex items-center gap-2 mb-2"><Star className="size-4 text-emerald-500" /><span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Souls Won</span></div>
                        <p className="text-2xl font-bold">{total}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">↑ 12.5% vs last month</p>
                    </div>
                    <div className="card-base p-4">
                        <div className="flex items-center gap-2 mb-2"><TrendingUp className="size-4 text-primary" /><span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Established</span></div>
                        <p className="text-2xl font-bold">{mockEvangelismFunnelData[4].count}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{((mockEvangelismFunnelData[4].count / total) * 100).toFixed(0)}% conversion</p>
                    </div>
                </div>

                <div className="card-base p-5">
                    <h4 className="text-sm font-semibold mb-4">Source Breakdown</h4>
                    <div className="flex flex-col gap-3">
                        {[
                            { source: 'Outreach', count: 18, pct: 38 },
                            { source: 'Invited', count: 14, pct: 30 },
                            { source: 'Evangelism', count: 8, pct: 17 },
                            { source: 'Social Media', count: 5, pct: 11 },
                            { source: 'Service', count: 2, pct: 4 },
                        ].map((s) => (
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
                </div>

                <div className="card-base overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2"><Award className="size-4 text-amber-500" /><h4 className="text-sm font-semibold">Top Evangelists</h4></div>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5" onClick={onLogSoul}>
                            <Plus className="size-3" /> Log Soul
                        </Button>
                    </div>
                    <div className="divide-y divide-border">
                        {leaderboard.slice(0, 3).map((l, i) => (
                            <div key={l.name} className="flex items-center gap-3 px-4 py-3">
                                <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                    i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                    i === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                                )}>#{i + 1}</div>
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{l.avatar}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{l.name}</p>
                                    <p className="text-xs text-muted-foreground">{l.trend}</p>
                                </div>
                                <span className="text-sm font-bold tabular-nums">{l.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Records Tab ───────────────────────────────────────────────────────────────

function RecordsTab({ onLogSoul, onSelect }: { onLogSoul: () => void; onSelect: (r: EvangelismRecord) => void }) {
    return (
        <div className="p-6">
            <div className="card-base overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                    <h3 className="text-sm font-semibold">Evangelism Records</h3>
                    <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={onLogSoul}>
                        <Plus className="size-3" /> Log Soul Won
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {['Person', 'Stage', 'Won By', 'Date', 'Source', 'Schedule', 'Follow-ups'].map((h) => (
                                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {mockEvangelismRecords.map((rec) => {
                                const sc = stageConfig[rec.stage];
                                const src = sourceConfig[rec.source];
                                const SrcIcon = src.icon;
                                const doneCount = rec.autoSchedule?.filter((s) => s.status === 'done').length ?? 0;
                                const totalSchedule = rec.autoSchedule?.length ?? 0;
                                const overdueCount = rec.autoSchedule?.filter((s) => s.status === 'overdue').length ?? 0;
                                return (
                                    <tr key={rec.id} className="hover:bg-muted/20 transition-base cursor-pointer" onClick={() => onSelect(rec)}>
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
                                        <td className="px-5 py-3 text-muted-foreground">{rec.wonBy}</td>
                                        <td className="px-5 py-3 text-muted-foreground">{rec.wonDate}</td>
                                        <td className="px-5 py-3">
                                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <SrcIcon className="size-3.5" />{src.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {totalSchedule > 0 ? (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="flex items-center gap-0.5">
                                                        {rec.autoSchedule!.map((s, i) => (
                                                            <div key={i} className={cn(
                                                                'size-2 rounded-full',
                                                                s.status === 'done'    ? 'bg-emerald-500' :
                                                                s.status === 'overdue' ? 'bg-red-500' :
                                                                'bg-muted-foreground/30',
                                                            )} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{doneCount}/{totalSchedule}</span>
                                                    {overdueCount > 0 && <span className="text-xs text-red-500">{overdueCount} overdue</span>}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-semibold">{rec.followUps}</span>
                                                <span className="text-xs text-muted-foreground">follow-ups</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ── Leaderboard Tab ───────────────────────────────────────────────────────────

function LeaderboardTab() {
    return (
        <div className="p-6">
            <div className="card-base overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border">
                    <h3 className="text-sm font-semibold">Evangelism Leaderboard — June 2026</h3>
                </div>
                <div className="divide-y divide-border">
                    {leaderboard.map((l, i) => (
                        <div key={l.name} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-base">
                            <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                                i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                i === 1 ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' :
                                i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                'bg-muted text-muted-foreground',
                            )}>#{i + 1}</div>
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">{l.avatar}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium">{l.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{l.trend}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-2xl font-bold tabular-nums">{l.count}</p>
                                <p className="text-xs text-muted-foreground">souls won</p>
                            </div>
                            <div className="w-24 shrink-0">
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${(l.count / leaderboard[0].count) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Evangelism() {
    const [tab, setTab] = useState<Tab>('funnel');
    const [newConvertOpen, setNewConvertOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<EvangelismRecord | null>(null);

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
                            {mockEvangelismFunnelData[0].count} souls tracked this month
                        </p>
                    </div>
                    <Button size="sm" className="h-8 gap-1.5" onClick={() => setNewConvertOpen(true)}>
                        <Plus className="size-3.5" />
                        Log Soul Won
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
                    {tab === 'funnel'      && <FunnelTab onLogSoul={() => setNewConvertOpen(true)} />}
                    {tab === 'records'     && <RecordsTab onLogSoul={() => setNewConvertOpen(true)} onSelect={setSelectedRecord} />}
                    {tab === 'leaderboard' && <LeaderboardTab />}
                </div>
            </div>

            <NewConvertModal open={newConvertOpen} onClose={() => setNewConvertOpen(false)} />
            <RecordDetailSheet record={selectedRecord} onClose={() => setSelectedRecord(null)} />
        </>
    );
}

Evangelism.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Evangelism', href: '/evangelism' },
    ],
};
