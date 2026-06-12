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
    Phone,
    Plus,
    Star,
    TrendingUp,
    UserCheck,
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
    soul_won:         { label: 'Members Reached',         color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
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
    member:       { label: 'Member',       icon: Users },
    self:         { label: 'Self',         icon: Star },
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

    const noReferral = source === 'self' || source === 'outreach' || source === 'social_media';

    const schedulePreview = [
        { day: 1,  label: 'Welcome Call',            date: '+1 day' },
        { day: 3,  label: 'Check-in Message',        date: '+3 days' },
        { day: 7,  label: 'Home Visit',              date: '+1 week' },
        { day: 14, label: 'Membership Class Invite', date: '+2 weeks' },
        { day: 30, label: 'Progress Review',         date: '+1 month' },
    ];

    const noReferralNote: Record<string, string> = {
        self:         'Self walk-in — came on their own. No referral to record.',
        outreach:     'Won during a church outreach event. No individual referral needed.',
        social_media: 'Found the church online. No individual referral needed.',
    };

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

                    {/* Row 1: Name */}
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name *</Label>
                        <Input placeholder="e.g. John Doe" className="h-9" />
                    </div>

                    {/* Row 2: Phone + Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone Number</Label>
                            <Input placeholder="+234 800 000 0000" className="h-9" />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Date Won *</Label>
                            <Input type="date" className="h-9" defaultValue={today} />
                        </div>
                    </div>

                    {/* Row 3: Location */}
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Location / Address</Label>
                        <Input placeholder="e.g. Lekki, Lagos" className="h-9" />
                    </div>

                    {/* Row 4: Channel */}
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Channel they came through *</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {(Object.keys(sourceConfig) as EvangelismRecord['source'][]).map((s) => {
                                const cfg = sourceConfig[s];
                                const Icon = cfg.icon;
                                return (
                                    <button
                                        key={s}
                                        type="button"
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

                    {/* Row 5: Referral — reactive to channel */}
                    {noReferral ? (
                        <div className="rounded-lg bg-muted/50 border border-border px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground capitalize">{sourceConfig[source].label}</span>
                                {' '}— {noReferralNote[source]}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                                {source === 'member' ? 'Which Member Brought Them? *' : 'Won / Invited By *'}
                            </Label>
                            <Input
                                placeholder={source === 'member' ? 'e.g. Bro. Samuel' : 'e.g. Bro. Samuel'}
                                className="h-9"
                            />
                            {source === 'member' && (
                                <p className="text-xs text-muted-foreground mt-1">The church member who brought this person.</p>
                            )}
                        </div>
                    )}

                    {/* Row 6: Assign Follow-Up */}
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Assign Follow-Up To</Label>
                        <Input placeholder="e.g. Sis. Ruth" className="h-9" />
                    </div>

                    {/* Auto-schedule preview — commented out, using call/message logs instead */}
                    {/* <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-4">
                        ...
                    </div> */}

                    {/* Notes */}
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes (optional)</Label>
                        <textarea
                            className="w-full rounded-lg border border-border bg-muted/50 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={2}
                            placeholder="Any additional notes about this person..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <Button className="flex-1 gap-2" onClick={onClose}>
                            <Star className="size-4" />
                            Log Members Reached
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

    const [logTab, setLogTab] = useState<'calls' | 'messages'>('calls');
    const [showLogForm, setShowLogForm] = useState(false);
    const [logNote, setLogNote] = useState('');
    const [convertOpen, setConvertOpen] = useState(false);
    const [converted, setConverted] = useState(false);

    // Mock logs — will be replaced with real data when backend is wired
    const callLogs = [
        { id: 1, by: 'Bro. Samuel', date: '2026-06-08', time: '10:30 AM', outcome: 'answered', note: 'Spoke briefly, invited to Sunday service' },
        { id: 2, by: 'Sis. Ruth',   date: '2026-06-05', time: '4:00 PM',  outcome: 'no_answer', note: 'No answer, will try again' },
        { id: 3, by: 'Bro. James',  date: '2026-06-01', time: '9:00 AM',  outcome: 'answered', note: 'Confirmed attending membership class' },
    ];
    const messageLogs = [
        { id: 1, by: 'Sis. Ruth',   date: '2026-06-07', channel: 'WhatsApp', note: 'Sent welcome message and church address' },
        { id: 2, by: 'Bro. Samuel', date: '2026-06-03', channel: 'SMS',      note: 'Reminder for Sunday service sent' },
    ];

    const outcomeConfig = {
        answered:  { label: 'Answered',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
        no_answer: { label: 'No Answer',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
        busy:      { label: 'Busy',       color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };

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
                            <div><p className="text-xs text-muted-foreground">Total Contacts</p><p className="text-sm font-bold">{record.followUps}</p></div>
                            <div><p className="text-xs text-muted-foreground">Last Contact</p><p className="text-sm font-medium">{record.lastFollowUp || '—'}</p></div>
                        </div>
                    </div>

                    {/* Call & Message Logs */}
                    <div className="px-5 py-4">
                        {/* Tab switcher */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-0 rounded-lg bg-muted p-0.5">
                                <button
                                    onClick={() => setLogTab('calls')}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
                                        logTab === 'calls' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    <Phone className="size-3" />
                                    Calls
                                    <span className={cn('text-[10px] font-bold rounded-full px-1', logTab === 'calls' ? 'text-primary' : 'text-muted-foreground')}>
                                        {callLogs.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setLogTab('messages')}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
                                        logTab === 'messages' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    <MessageSquare className="size-3" />
                                    Messages
                                    <span className={cn('text-[10px] font-bold rounded-full px-1', logTab === 'messages' ? 'text-primary' : 'text-muted-foreground')}>
                                        {messageLogs.length}
                                    </span>
                                </button>
                            </div>
                            <button
                                onClick={() => setShowLogForm(v => !v)}
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                                <Plus className="size-3" />
                                Log {logTab === 'calls' ? 'Call' : 'Message'}
                            </button>
                        </div>

                        {/* Inline log form */}
                        {showLogForm && (
                            <div className="mb-3 rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-2">
                                {logTab === 'calls' && (
                                    <div className="flex gap-2">
                                        {(['answered', 'no_answer', 'busy'] as const).map(o => (
                                            <button key={o} className={cn('text-xs rounded-full px-2.5 py-1 font-medium border transition-all', outcomeConfig[o].color, 'border-transparent')}>
                                                {outcomeConfig[o].label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {logTab === 'messages' && (
                                    <div className="flex gap-2">
                                        {['WhatsApp', 'SMS', 'Email'].map(ch => (
                                            <button key={ch} className="text-xs rounded-full px-2.5 py-1 font-medium border border-border bg-background hover:border-primary/40 transition-all">
                                                {ch}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <textarea
                                    className="w-full rounded-lg border border-border bg-background text-xs p-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                                    rows={2}
                                    placeholder="Add a note..."
                                    value={logNote}
                                    onChange={e => setLogNote(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" className="h-7 text-xs flex-1" onClick={() => { setShowLogForm(false); setLogNote(''); }}>Save Log</Button>
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowLogForm(false)}>Cancel</Button>
                                </div>
                            </div>
                        )}

                        {/* Call logs */}
                        {logTab === 'calls' && (
                            <div className="flex flex-col gap-2">
                                {callLogs.map(log => {
                                    const oc = outcomeConfig[log.outcome as keyof typeof outcomeConfig];
                                    return (
                                        <div key={log.id} className="rounded-xl border border-border bg-card p-3">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                                        {log.by.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <span className="text-xs font-medium">{log.by}</span>
                                                </div>
                                                <span className={cn('text-[10px] font-medium rounded-full px-2 py-0.5', oc.color)}>
                                                    {oc.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{log.note}</p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1.5">{log.date} · {log.time}</p>
                                        </div>
                                    );
                                })}
                                {callLogs.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">No call logs yet</p>
                                )}
                            </div>
                        )}

                        {/* Message logs */}
                        {logTab === 'messages' && (
                            <div className="flex flex-col gap-2">
                                {messageLogs.map(log => (
                                    <div key={log.id} className="rounded-xl border border-border bg-card p-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                                    {log.by.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                                </div>
                                                <span className="text-xs font-medium">{log.by}</span>
                                            </div>
                                            <span className="text-[10px] font-medium rounded-full px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {log.channel}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{log.note}</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-1.5">{log.date}</p>
                                    </div>
                                ))}
                                {messageLogs.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">No message logs yet</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-border p-4 flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button className="flex-1 gap-1.5" size="sm" onClick={() => { setShowLogForm(true); setLogTab('calls'); }}>
                            <Phone className="size-3.5" />
                            Log Call
                        </Button>
                        <Button variant="outline" className="flex-1 gap-1.5" size="sm" onClick={() => { setShowLogForm(true); setLogTab('messages'); }}>
                            <MessageSquare className="size-3.5" />
                            Log Message
                        </Button>
                    </div>

                    {/* Convert to Member — the key action */}
                    {converted ? (
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

                {/* Convert to Member confirmation dialog */}
                <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <UserCheck className="size-4 text-emerald-600" />
                                Convert to Member
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-2">
                            {/* Person summary */}
                            <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border p-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                    {record.initials}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{record.name}</p>
                                    {record.phone && <p className="text-xs text-muted-foreground">{record.phone}</p>}
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                This will create a full member profile for <span className="font-medium text-foreground">{record.name}</span> and add them to the Members list. Their evangelism record will remain linked.
                            </p>

                            {/* Membership type */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Membership Type</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'full',      label: 'Full Member' },
                                        { value: 'associate', label: 'Associate' },
                                        { value: 'visitor',   label: 'Visitor' },
                                    ].map(t => (
                                        <button
                                            key={t.value}
                                            className="rounded-lg border border-border p-2 text-xs font-medium hover:border-primary/50 hover:bg-muted/50 transition-all first:border-primary first:bg-primary/5"
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button
                                    className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => {
                                        setConverted(true);
                                        setConvertOpen(false);
                                    }}
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

// ── Funnel Tab ────────────────────────────────────────────────────────────────

function FunnelTab({ onLogSoul }: { onLogSoul: () => void }) {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const currentMonth = new Date().getMonth();
    const currentYear  = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const monthlyData: Record<number, {
        soulsWon: number; established: number; trend: string; convRate: number;
        sources: { source: string; count: number; pct: number }[];
    }> = {
        0:  { soulsWon: 21, established: 8,  trend: '↑ 5.2%',  convRate: 38.1, sources: [{ source: 'Outreach', count: 9, pct: 43 },{ source: 'Invited', count: 6, pct: 29 },{ source: 'Evangelism', count: 4, pct: 19 },{ source: 'Service', count: 1, pct: 5 },{ source: 'Social Media', count: 1, pct: 5 }] },
        1:  { soulsWon: 18, established: 6,  trend: '↓ 2.1%',  convRate: 33.3, sources: [{ source: 'Outreach', count: 7, pct: 39 },{ source: 'Invited', count: 5, pct: 28 },{ source: 'Evangelism', count: 4, pct: 22 },{ source: 'Social Media', count: 2, pct: 11 }] },
        2:  { soulsWon: 25, established: 9,  trend: '↑ 8.4%',  convRate: 36.0, sources: [{ source: 'Outreach', count: 11, pct: 44 },{ source: 'Invited', count: 7, pct: 28 },{ source: 'Evangelism', count: 4, pct: 16 },{ source: 'Member', count: 2, pct: 8 },{ source: 'Self', count: 1, pct: 4 }] },
        3:  { soulsWon: 31, established: 11, trend: '↑ 11.2%', convRate: 35.5, sources: [{ source: 'Outreach', count: 13, pct: 42 },{ source: 'Invited', count: 9, pct: 29 },{ source: 'Evangelism', count: 5, pct: 16 },{ source: 'Social Media', count: 3, pct: 10 },{ source: 'Self', count: 1, pct: 3 }] },
        4:  { soulsWon: 38, established: 14, trend: '↑ 9.7%',  convRate: 36.8, sources: [{ source: 'Outreach', count: 15, pct: 39 },{ source: 'Invited', count: 11, pct: 29 },{ source: 'Evangelism', count: 7, pct: 18 },{ source: 'Social Media', count: 4, pct: 11 },{ source: 'Member', count: 1, pct: 3 }] },
        5:  { soulsWon: 47, established: 18, trend: '↑ 12.5%', convRate: 38.3, sources: [{ source: 'Outreach', count: 18, pct: 38 },{ source: 'Invited', count: 14, pct: 30 },{ source: 'Evangelism', count: 8, pct: 17 },{ source: 'Social Media', count: 5, pct: 11 },{ source: 'Service', count: 2, pct: 4 }] },
        6:  { soulsWon: 0, established: 0, trend: '—', convRate: 0, sources: [] },
        7:  { soulsWon: 0, established: 0, trend: '—', convRate: 0, sources: [] },
        8:  { soulsWon: 0, established: 0, trend: '—', convRate: 0, sources: [] },
        9:  { soulsWon: 0, established: 0, trend: '—', convRate: 0, sources: [] },
        10: { soulsWon: 0, established: 0, trend: '—', convRate: 0, sources: [] },
        11: { soulsWon: 0, established: 0, trend: '—', convRate: 0, sources: [] },
    };

    const d = monthlyData[selectedMonth];
    const isFuture = selectedMonth > currentMonth;
    const convPct = d.soulsWon > 0 ? Math.round((d.established / d.soulsWon) * 100) : 0;

    const funnelBars = [
        { stage: 'Members Reached',    count: d.soulsWon,    pct: 100,     color: 'oklch(0.55 0.18 265)' },
        { stage: 'Established', count: d.established, pct: convPct, color: 'oklch(0.52 0.15 162)' },
    ];

    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* ── Left: Funnel + Source Breakdown ── */}
            <div className="flex flex-col gap-4">
                <div className="card-base p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold">Conversion Funnel</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isFuture ? 'No data yet' : `Tracking ${d.soulsWon} souls`}
                            </p>
                        </div>
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                            className="h-7 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            {months.map((m, i) => (
                                <option key={m} value={i}>{m} {currentYear}</option>
                            ))}
                        </select>
                    </div>

                    {isFuture ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No data for future months</p>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3">
                                {funnelBars.map((stage, i) => (
                                    <div key={stage.stage}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="size-2.5 rounded-sm" style={{ backgroundColor: stage.color }} />
                                                <span className="text-sm font-medium">{stage.stage}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">{stage.pct}%</span>
                                                <span className="text-sm font-bold tabular-nums">{stage.count}</span>
                                            </div>
                                        </div>
                                        <div className="relative h-7 rounded-lg bg-muted overflow-hidden">
                                            <div
                                                className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                                                style={{ width: `${stage.pct}%`, backgroundColor: stage.color, transitionDelay: `${i * 100}ms`, opacity: 0.85 }}
                                            />
                                            <div className="absolute inset-0 flex items-center px-3">
                                                <span className="text-xs font-semibold text-white drop-shadow-sm">{stage.count} people</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-muted/50 text-sm">
                                <span className="text-muted-foreground">Overall conversion rate</span>
                                <span className="font-bold text-primary">{d.convRate.toFixed(1)}%</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Source Breakdown */}
                <div className="card-base p-5">
                    <h4 className="text-sm font-semibold mb-4">Source Breakdown</h4>
                    {isFuture || d.sources.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">No data for this month</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {d.sources.map(s => (
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

            {/* ── Right: Stats + Top Evangelists ── */}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="card-base p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="size-4 text-emerald-500" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Members Reached</span>
                        </div>
                        <p className="text-2xl font-bold">{d.soulsWon}</p>
                        <p className={cn('text-xs mt-0.5', d.trend.startsWith('↑') ? 'text-emerald-600' : d.trend.startsWith('↓') ? 'text-red-500' : 'text-muted-foreground')}>
                            {d.trend} vs last month
                        </p>
                    </div>
                    <div className="card-base p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="size-4 text-primary" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Established</span>
                        </div>
                        <p className="text-2xl font-bold">{d.established}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {d.soulsWon > 0 ? `${convPct}% conversion` : '—'}
                        </p>
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
                    <h3 className="text-sm font-semibold">Potential members</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {['Person', 'Stage', 'Invited By', 'Date', 'Source', 'Schedule', 'Follow-ups'].map((h) => (
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
                                <p className="text-xs text-muted-foreground">Members Reached</p>
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
