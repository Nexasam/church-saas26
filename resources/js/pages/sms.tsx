import { Head, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    MessageSquare,
    Plus,
    Search,
    Send,
    User,
    Users,
    X,
    XCircle,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockMembers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

// ─── Plan Limits ──────────────────────────────────────────────────────────────

const PLAN_LIMITS: Record<string, { monthly: number; label: string }> = {
    starter:    { monthly: 300,   label: 'Starter' },
    growth:     { monthly: 500,   label: 'Growth' },
    enterprise: { monthly: 1000,  label: 'Enterprise' },
    free:       { monthly: 50,    label: 'Free' },
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockSmsHistory = [
    { id: 'sms-001', title: 'Sunday Service Reminder',    message: 'Dear beloved, join us this Sunday at 9AM for a powerful service. God bless you!', recipients: 842, sent: 836, failed: 6, status: 'sent' as const,    date: '2026-06-07 08:00', type: 'bulk' },
    { id: 'sms-002', title: 'Evangelism Outreach Notice', message: 'Evangelism team meets Saturday at 8AM. Please be at the church premises. God bless!', recipients: 30, sent: 30, failed: 0, status: 'sent' as const,    date: '2026-06-05 07:30', type: 'bulk' },
    { id: 'sms-003', title: 'Follow-up Check-in Batch',   message: 'Hi [name], we missed you last Sunday. We hope to see you this week. God loves you!', recipients: 38, sent: 0,   failed: 0, status: 'pending' as const, date: '2026-06-09 09:00', type: 'bulk' },
    { id: 'sms-004', title: 'Chidi Nwosu',                message: 'Bro. Chidi, just checking in on you. God loves you and so does the church!',         recipients: 1,  sent: 1,   failed: 0, status: 'sent' as const,    date: '2026-06-08 11:30', type: 'individual' },
];

const recipientGroups = [
    { id: 'all',        label: 'All Members',          count: 842, icon: Users },
    { id: 'active',     label: 'Active Members',       count: 728, icon: Users },
    { id: 'followup',   label: 'Follow-Up List',       count: 38,  icon: Users },
    { id: 'evangelism', label: 'Evangelism Dept',      count: 30,  icon: Users },
    { id: 'workers',    label: 'All Workers',          count: 156, icon: Users },
    { id: 'homeChurch', label: 'Home Church Leaders',  count: 24,  icon: Users },
];

const statusConfig = {
    sent:    { label: 'Sent',      icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    pending: { label: 'Scheduled', icon: Clock,        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    failed:  { label: 'Failed',    icon: XCircle,      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const MAX_SMS = 160;

// ─── Quota Bar ────────────────────────────────────────────────────────────────

function QuotaBar({ used, limit, plan }: { used: number; limit: number; plan: string }) {
    const pct     = Math.min(100, Math.round((used / limit) * 100));
    const isLow   = pct >= 80;
    const isEmpty = false; // all plans now have a defined limit

    return (
        <div className={cn(
            'flex items-center gap-3 rounded-xl border px-4 py-3',
            isLow ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20' : 'border-border bg-muted/30',
        )}>
            <Zap className={cn('size-4 shrink-0', isLow ? 'text-amber-600' : 'text-primary')} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium">
                        {`${used.toLocaleString()} / ${limit.toLocaleString()} SMS used`}
                    </p>
                    <span className="text-xs text-muted-foreground">{plan} plan</span>
                </div>
                {!isEmpty && (
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className={cn('h-full rounded-full transition-all', isLow ? 'bg-amber-500' : 'bg-primary')}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                )}
            </div>
            {isLow && !isEmpty && (
                <button className="text-xs text-amber-700 dark:text-amber-400 font-medium hover:underline shrink-0">
                    Upgrade
                </button>
            )}
        </div>
    );
}

// ─── Individual Member SMS ────────────────────────────────────────────────────

function IndividualSms({ quotaLeft, onSend }: { quotaLeft: number; onSend: (count: number) => void }) {
    const [search, setSearch]     = useState('');
    const [selected, setSelected] = useState<typeof mockMembers[0] | null>(null);
    const [message, setMessage]   = useState('');
    const [sent, setSent]         = useState(false);

    const results = search.length > 1
        ? mockMembers.filter(m =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.phone.includes(search)
          ).slice(0, 6)
        : [];

    const charsLeft = MAX_SMS - message.length;
    const canSend   = !!selected && message.trim().length > 0 && quotaLeft > 0;

    function send() {
        if (!canSend) return;
        setSent(true);
        onSend(1);
        toast.success(`SMS sent to ${selected!.name}`);
        setTimeout(() => { setSent(false); setSelected(null); setMessage(''); setSearch(''); }, 2000);
    }

    if (sent) {
        return (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle2 className="size-6 text-emerald-600" />
                </div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">SMS Sent!</p>
                <p className="text-sm text-muted-foreground">Your message was delivered to {selected?.name}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Member search */}
            <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Send To (search member)
                </Label>
                {selected ? (
                    <div className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 px-3 py-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {selected.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{selected.name}</p>
                            <p className="text-xs text-muted-foreground">{selected.phone}</p>
                        </div>
                        <button onClick={() => { setSelected(null); setSearch(''); }} className="text-muted-foreground hover:text-foreground">
                            <X className="size-4" />
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                            className="h-9 pl-8"
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                        />
                        {results.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-md z-10 overflow-hidden">
                                {results.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => { setSelected(m); setSearch(''); }}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-accent text-left transition-colors"
                                    >
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                            {m.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{m.name}</p>
                                            <p className="text-xs text-muted-foreground">{m.phone}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {search.length > 1 && results.length === 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-md z-10 px-3 py-4 text-center text-sm text-muted-foreground">
                                No members found
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Message */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Message</Label>
                    <span className={cn('text-xs', charsLeft < 20 ? 'text-red-500' : 'text-muted-foreground')}>
                        {charsLeft} chars left
                    </span>
                </div>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, MAX_SMS))}
                    placeholder={`Hi ${selected?.name?.split(' ')[0] ?? '[name]'}, ...`}
                    rows={4}
                    className="w-full rounded-lg border border-input bg-background text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
            </div>

            {/* Quick templates */}
            <div>
                <p className="text-xs text-muted-foreground mb-2">Quick templates:</p>
                <div className="flex flex-wrap gap-2">
                    {[
                        `Hi [name], we missed you last Sunday. God loves you! 🙏`,
                        `Dear [name], you're invited to this Sunday's service at 9AM. God bless!`,
                        `[name], the church is praying for you. Reach out if you need anything. ❤️`,
                    ].map((t, i) => (
                        <button
                            key={i}
                            onClick={() => setMessage(t.replace('[name]', selected?.name?.split(' ')[0] ?? '[name]'))}
                            className="text-xs rounded-lg border border-border px-3 py-1.5 hover:border-primary/40 hover:bg-muted/50 transition-all text-muted-foreground text-left line-clamp-1 max-w-64"
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {quotaLeft <= 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3">
                    <AlertTriangle className="size-4 text-red-600 shrink-0" />
                    <p className="text-xs text-red-700 dark:text-red-400">You've used all your SMS quota for this month. Upgrade your plan to send more.</p>
                </div>
            )}

            <Button className="w-full gap-2" disabled={!canSend} onClick={send}>
                <Send className="size-4" />
                Send SMS to {selected?.name ?? '...'}
            </Button>
        </div>
    );
}

// ─── Bulk SMS Compose ─────────────────────────────────────────────────────────

function BulkCompose({ quotaLeft, onSend }: { quotaLeft: number; onSend: (count: number) => void }) {
    const [title,         setTitle]         = useState('');
    const [message,       setMessage]       = useState('');
    const [selectedGroup, setSelectedGroup] = useState('active');

    const group       = recipientGroups.find(g => g.id === selectedGroup)!;
    const charsLeft   = MAX_SMS - message.length;
    const smsCount    = Math.ceil(message.length / MAX_SMS) || 1;
    const totalSms    = group.count * smsCount;
    const wouldExceed = totalSms > quotaLeft;
    const canSend     = !!title && message.trim().length > 0 && !wouldExceed && quotaLeft > 0;

    function send() {
        if (!canSend) return;
        onSend(totalSms);
        toast.success(`Campaign "${title}" sent to ${group.count} members.`);
        setTitle(''); setMessage('');
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: form */}
            <div className="card-base p-5 flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Bulk Campaign</h3>

                <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Campaign Title</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sunday Service Reminder" className="h-9" />
                </div>

                <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Recipients</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {recipientGroups.map(g => (
                            <button
                                key={g.id}
                                onClick={() => setSelectedGroup(g.id)}
                                className={cn(
                                    'flex items-center justify-between rounded-lg border p-2.5 text-xs transition-all',
                                    selectedGroup === g.id ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30 hover:bg-muted/50',
                                )}
                            >
                                <span className="font-medium">{g.label}</span>
                                <span className={cn('font-bold', selectedGroup === g.id ? 'text-primary' : 'text-muted-foreground')}>{g.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Message</Label>
                        <span className={cn('text-xs', charsLeft < 20 ? 'text-red-500' : 'text-muted-foreground')}>
                            {charsLeft} chars · {smsCount} SMS
                        </span>
                    </div>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value.slice(0, MAX_SMS * 3))}
                        placeholder="Type your message. Use [name] to personalise."
                        rows={5}
                        className="w-full rounded-lg border border-input bg-background text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Use <code className="bg-muted px-1 rounded text-xs">[name]</code> to personalise each message
                    </p>
                </div>

                {wouldExceed && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3">
                        <AlertTriangle className="size-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-medium text-red-700 dark:text-red-400">Quota exceeded</p>
                            <p className="text-xs text-red-600/80 dark:text-red-500 mt-0.5">
                                This campaign needs {totalSms.toLocaleString()} SMS but you only have {quotaLeft.toLocaleString()} remaining. Upgrade your plan or reduce recipients.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2" size="sm" disabled={!canSend}>
                        <Clock className="size-3.5" /> Schedule
                    </Button>
                    <Button className="flex-1 gap-2" size="sm" disabled={!canSend} onClick={send}>
                        <Send className="size-3.5" /> Send Now
                    </Button>
                </div>
            </div>

            {/* Right: summary + preview */}
            <div className="flex flex-col gap-4">
                <div className="card-base p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Campaign Summary</h4>
                    <div className="flex flex-col gap-2.5">
                        {[
                            { label: 'Recipients',       value: group.count.toLocaleString() },
                            { label: 'SMS per person',   value: smsCount },
                            { label: 'Total SMS needed', value: totalSms.toLocaleString(), highlight: wouldExceed },
                            { label: 'Quota remaining',  value: quotaLeft.toLocaleString(), green: !wouldExceed },
                        ].map(row => (
                            <div key={row.label} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{row.label}</span>
                                <span className={cn('font-semibold', row.highlight ? 'text-red-500' : row.green ? 'text-emerald-600' : '')}>
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-base p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Preview</h4>
                    <div className="rounded-xl bg-muted/50 border border-border p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">GA</div>
                            <span className="text-xs font-medium text-muted-foreground">Your Church</span>
                        </div>
                        <div className="rounded-xl bg-background border border-border p-3">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {message
                                    ? message.replace('[name]', 'Chidi')
                                    : <span className="italic text-muted-foreground/40">Your message will appear here...</span>
                                }
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground/40 mt-2 text-right">{message.length}/{MAX_SMS}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Sms() {
    const { church } = usePage<{ church?: { plan?: string } }>().props;
    const plan        = church?.plan ?? 'growth';
    const planConfig  = PLAN_LIMITS[plan] ?? PLAN_LIMITS.growth;

    // mock: how many have been used this month
    const [used, setUsed] = useState(247);
    const quotaLeft = Math.max(0, planConfig.monthly - used);

    const [tab,     setTab]     = useState<'bulk' | 'individual' | 'history'>('bulk');
    const [history, setHistory] = useState(mockSmsHistory);

    function onSend(count: number) {
        setUsed(u => u + count);
        if (tab !== 'history') {
            setHistory(prev => [{
                id:          `sms-${Date.now()}`,
                title:       tab === 'individual' ? 'Individual SMS' : 'New Campaign',
                message:     '',
                recipients:  count,
                sent:        count,
                failed:      0,
                status:      'sent' as const,
                date:        new Date().toLocaleString('en-NG'),
                type:        tab,
            }, ...prev]);
        }
    }

    const tabs = [
        { id: 'bulk' as const,       label: 'Bulk Send',   icon: Users },
        { id: 'individual' as const, label: 'To a Member', icon: User },
        { id: 'history' as const,    label: 'History',     icon: MessageSquare },
    ];

    return (
        <>
            <Head title="SMS" />
            <div className="flex flex-col h-full overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">SMS</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {planConfig.monthly.toLocaleString()} SMS remaining this month
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-0 border-b border-border px-6 shrink-0">
                    {tabs.map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={cn(
                                    'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-base',
                                    tab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <Icon className="size-3.5" />
                                {t.label}
                                {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin p-6">

                    {/* Quota bar — always visible on compose tabs */}
                    {tab !== 'history' && (
                        <div className="mb-5 max-w-2xl">
                            <QuotaBar used={used} limit={planConfig.monthly} plan={planConfig.label} />
                        </div>
                    )}

                    {tab === 'bulk' && (
                        <BulkCompose quotaLeft={quotaLeft} onSend={onSend} />
                    )}

                    {tab === 'individual' && (
                        <div className="card-base p-5 max-w-lg">
                            <h3 className="text-sm font-semibold mb-4">Send to a Specific Member</h3>
                            <IndividualSms quotaLeft={quotaLeft} onSend={onSend} />
                        </div>
                    )}

                    {tab === 'history' && (
                        <div className="flex flex-col gap-4 max-w-3xl">
                            {history.map(sms => {
                                const sc = statusConfig[sms.status];
                                const StatusIcon = sc.icon;
                                const rate = sms.recipients > 0 ? Math.round((sms.sent / sms.recipients) * 100) : 0;
                                return (
                                    <div key={sms.id} className="card-base p-5">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-sm">{sms.title}</h3>
                                                    <span className={cn('inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5', sc.color)}>
                                                        <StatusIcon className="size-3" />
                                                        {sc.label}
                                                    </span>
                                                    <span className={cn('text-xs rounded-full px-2 py-0.5 font-medium', sms.type === 'individual' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-muted text-muted-foreground')}>
                                                        {sms.type === 'individual' ? 'Individual' : 'Bulk'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{sms.date}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold">{sms.recipients}</p>
                                                <p className="text-xs text-muted-foreground">{sms.recipients === 1 ? 'recipient' : 'recipients'}</p>
                                            </div>
                                        </div>
                                        {sms.message && (
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-1 italic">"{sms.message}"</p>
                                        )}
                                        {sms.status === 'sent' && sms.recipients > 1 && (
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="flex items-center gap-1.5 text-emerald-600">
                                                    <CheckCircle2 className="size-3.5" />{sms.sent} delivered
                                                </span>
                                                <span className="flex items-center gap-1.5 text-red-500">
                                                    <XCircle className="size-3.5" />{sms.failed} failed
                                                </span>
                                                <div className="flex items-center gap-1.5 ml-auto">
                                                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                                                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${rate}%` }} />
                                                    </div>
                                                    <span className="font-medium">{rate}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Sms.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'SMS', href: '/sms' },
    ],
};
