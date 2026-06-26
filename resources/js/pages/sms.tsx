import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle, Building2, CheckCircle2, Clock, Crown,
    MessageSquare, Plus, Search, Send, User, Users, X, XCircle, Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

const MAX_SMS = 160;

const PLAN_LIMITS: Record<string, { monthly: number; label: string }> = {
    starter:    { monthly: 1000,  label: 'Starter' },
    growth:     { monthly: 5000,  label: 'Growth' },
    enterprise: { monthly: 50000, label: 'Enterprise' },
    free:       { monthly: 10000, label: 'Free' },
    paid:       { monthly: 10000, label: 'Paid' },
};

const statusConfig = {
    sent:    { label: 'Sent',      icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    pending: { label: 'Scheduled', icon: Clock,        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    failed:  { label: 'Failed',    icon: XCircle,      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

type SmsPageProps = {
    plan: string; smsLimit: number; smsUsed: number;
    history: Array<{ id: number; title: string; message: string; recipients: number; sent: number; failed: number; status: 'sent'|'pending'|'failed'; date: string; type: string }>;
    recipientGroups: Array<{ id: string; label: string; count: number; group_type: string }>;
    departments: Array<{ id: number; name: string; member_count: number; leader_name: string | null }>;
    members: Array<{ id: number; name: string; initials: string; phone: string | null }>;
};

// ── Quota Bar ─────────────────────────────────────────────────────────────────
function QuotaBar({ used, limit, plan }: { used: number; limit: number; plan: string }) {
    const pct   = Math.min(100, Math.round((used / limit) * 100));
    const isLow = pct >= 80;
    return (
        <div className={cn('flex items-center gap-3 rounded-xl border px-4 py-3', isLow ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20' : 'border-border bg-muted/30')}>
            <Zap className={cn('size-4 shrink-0', isLow ? 'text-amber-600' : 'text-primary')} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium">{used.toLocaleString()} / {limit.toLocaleString()} SMS used</p>
                    <span className="text-xs text-muted-foreground capitalize">{plan} plan</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', isLow ? 'bg-amber-500' : 'bg-primary')} style={{ width: `${pct}%` }} />
                </div>
            </div>
            {isLow && <button className="text-xs text-amber-700 dark:text-amber-400 font-medium hover:underline shrink-0">Upgrade</button>}
        </div>
    );
}

// ── Recipient Picker ──────────────────────────────────────────────────────────
type RecipientTarget =
    | { type: 'group';      id: string; label: string; count: number }
    | { type: 'department'; id: number; label: string; count: number }
    | { type: 'leader';     id: number; label: string; count: number }   // dept leader only
    | { type: 'member';     id: number; label: string; phone: string };

function RecipientPicker({ groups, departments, members, value, onChange }: {
    groups: SmsPageProps['recipientGroups'];
    departments: SmsPageProps['departments'];
    members: SmsPageProps['members'];
    value: RecipientTarget | null;
    onChange: (r: RecipientTarget | null) => void;
}) {
    const [search, setSearch] = useState('');
    const [memberSearch, setMemberSearch] = useState('');
    const [mode, setMode] = useState<'groups' | 'departments' | 'member'>('groups');

    const memberResults = memberSearch.length > 1
        ? members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone?.includes(memberSearch)).slice(0, 6)
        : [];

    if (value) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-3 py-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {value.type === 'member' ? (value.label.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()) : value.type === 'leader' ? <Crown className="size-3.5" /> : <Users className="size-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{value.label}</p>
                    <p className="text-xs text-muted-foreground">
                        {value.type === 'member' ? value.phone : `${(value as any).count} recipient${(value as any).count !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <button onClick={() => onChange(null)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Mode tabs */}
            <div className="flex rounded-lg bg-muted p-0.5 gap-0.5">
                {([['groups','Groups'],['departments','Departments'],['member','Specific Person']] as const).map(([m, l]) => (
                    <button key={m} onClick={() => setMode(m)}
                        className={cn('flex-1 rounded-md py-1.5 text-xs font-medium transition-all',
                            mode === m ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                        {l}
                    </button>
                ))}
            </div>

            {mode === 'groups' && (
                <div className="grid grid-cols-2 gap-2">
                    {groups.map(g => (
                        <button key={g.id} onClick={() => onChange({ type: 'group', id: g.id, label: g.label, count: g.count })}
                            className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs hover:border-primary/40 hover:bg-muted/50 transition-all text-left gap-2">
                            <span className="font-medium">{g.label}</span>
                            <span className="font-bold text-muted-foreground">{g.count}</span>
                        </button>
                    ))}
                </div>
            )}

            {mode === 'departments' && (
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                    {departments.map(d => (
                        <div key={d.id} className="rounded-lg border border-border overflow-hidden">
                            <button onClick={() => onChange({ type: 'department', id: d.id, label: `${d.name} (all)`, count: d.member_count })}
                                className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-left">
                                <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{d.name}</p>
                                    <p className="text-xs text-muted-foreground">{d.member_count} workers</p>
                                </div>
                                <span className="text-xs text-primary font-medium">All workers</span>
                            </button>
                            {d.leader_name && (
                                <button onClick={() => onChange({ type: 'leader', id: d.id, label: `${d.name} leader (${d.leader_name})`, count: 1 })}
                                    className="flex items-center gap-2 w-full px-3 py-2 border-t border-border hover:bg-amber-50/50 dark:hover:bg-amber-950/10 transition-colors text-left">
                                    <Crown className="size-3.5 text-amber-500 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400">{d.leader_name}</p>
                                        <p className="text-xs text-muted-foreground">Department Leader</p>
                                    </div>
                                    <span className="text-xs text-amber-600 font-medium">Leader only</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {mode === 'member' && (
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input className="h-9 pl-8" placeholder="Search by name or phone..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} autoFocus />
                    {memberResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-md z-20 overflow-hidden">
                            {memberResults.map(m => (
                                <button key={m.id} onClick={() => { onChange({ type: 'member', id: m.id, label: m.name, phone: m.phone ?? '' }); setMemberSearch(''); }}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-accent text-left transition-colors">
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{m.initials}</div>
                                    <div><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.phone ?? 'No phone'}</p></div>
                                </button>
                            ))}
                        </div>
                    )}
                    {memberSearch.length > 1 && memberResults.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-md z-20 px-3 py-4 text-center text-sm text-muted-foreground">No members found</div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Compose Tab ───────────────────────────────────────────────────────────────
function ComposeTab({ quotaLeft, onSend, groups, departments, members }: {
    quotaLeft: number; onSend: (n: number) => void;
    groups: SmsPageProps['recipientGroups'];
    departments: SmsPageProps['departments'];
    members: SmsPageProps['members'];
}) {
    const [title,     setTitle]     = useState('');
    const [message,   setMessage]   = useState('');
    const [recipient, setRecipient] = useState<RecipientTarget | null>(null);
    const [sending,   setSending]   = useState(false);

    const charsLeft  = MAX_SMS - message.length;
    const smsCount   = Math.ceil(message.length / MAX_SMS) || 1;
    const recipCount = recipient ? (recipient.type === 'member' ? 1 : (recipient as any).count ?? 0) : 0;
    const totalSms   = recipCount * smsCount;
    const wouldExceed = totalSms > quotaLeft;
    const isMember = recipient?.type === 'member';
    const canSend = (isMember || !!title.trim()) && !!message.trim() && !!recipient && !wouldExceed && quotaLeft > 0 && recipCount > 0;

    const templates = [
        'Dear [name], join us this Sunday at 9AM for a powerful service. God bless you!',
        'Hi [name], we missed you last Sunday. We hope to see you this week. God loves you!',
        '[name], the church is praying for you. Reach out if you need anything. ❤️',
        'Dear [name], you are invited to our special programme this Saturday at 10AM. Bring a friend!',
    ];

    function send() {
        if (!canSend || !recipient) return;
        setSending(true);

        if (recipient.type === 'member') {
            const firstName = recipient.label.split(' ')[0];
            const finalMessage = message.replace(/\[name\]/gi, firstName);
            router.post('/sms/individual', { member_id: recipient.id, message: finalMessage }, {
                onSuccess: () => { toast.success(`SMS sent to ${recipient.label}`); onSend(1); setTitle(''); setMessage(''); setRecipient(null); setSending(false); },
                onError: () => { toast.error('Failed to send SMS.'); setSending(false); },
            });
        } else {
            const groupId = recipient.type === 'department' ? `dept:${recipient.id}` :
                            recipient.type === 'leader'     ? `leader:${recipient.id}` :
                            recipient.id as string;
            router.post('/sms/bulk', { title, message, recipient_group: groupId, recipients_count: recipCount, sms_units: totalSms }, {
                onSuccess: () => { toast.success(`Campaign "${title}" sent!`); onSend(totalSms); setTitle(''); setMessage(''); setRecipient(null); setSending(false); },
                onError: () => { toast.error('Failed to send campaign.'); setSending(false); },
            });
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: form */}
            <div className="lg:col-span-3 card-base p-5 flex flex-col gap-5">
                {/* Recipients */}
                <div>
                    <Label className="field-label mb-2 block">Send To *</Label>
                    <RecipientPicker groups={groups} departments={departments} members={members} value={recipient} onChange={setRecipient} />
                </div>

                {/* Title — only for bulk */}
                {recipient && recipient.type !== 'member' && (
                    <div>
                        <Label className="field-label mb-1.5 block">Campaign Title *</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sunday Service Reminder" className="h-9" />
                    </div>
                )}

                {/* Message */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <Label className="field-label">Message *</Label>
                        <span className={cn('text-xs', charsLeft < 20 ? 'text-red-500' : 'text-muted-foreground')}>
                            {charsLeft} chars · {smsCount} SMS
                        </span>
                    </div>
                    <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, MAX_SMS * 3))}
                        placeholder={isMember
                            ? `Hi ${(recipient as any)?.label?.split(' ')[0] ?? '[name]'}, ...`
                            : 'Type your message. Use [name] to personalise.'}
                        rows={5} className="w-full rounded-lg border border-input bg-background text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
                    <p className="text-xs text-muted-foreground mt-1">
                        {isMember
                            ? <><code className="bg-muted px-1 rounded text-xs">[name]</code> will be replaced with <strong>{(recipient as any)?.label?.split(' ')[0]}</strong></>
                            : <>Use <code className="bg-muted px-1 rounded text-xs">[name]</code> to personalise each message</>
                        }
                    </p>
                </div>

                {/* Templates */}
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Quick templates:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {templates.map((t, i) => (
                            <button key={i} onClick={() => setMessage(t)}
                                className="text-xs rounded-lg border border-border px-3 py-2 hover:border-primary/40 hover:bg-muted/50 transition-all text-muted-foreground text-left line-clamp-2">
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {wouldExceed && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3">
                        <AlertTriangle className="size-4 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 dark:text-red-400">
                            This campaign needs <strong>{totalSms}</strong> SMS but you only have <strong>{quotaLeft}</strong> remaining.
                        </p>
                    </div>
                )}

                <Button className="gap-2" disabled={!canSend || sending} onClick={send}>
                    <Send className="size-4" />
                    {sending ? 'Sending…' : recipient?.type === 'member' ? `Send to ${recipient.label}` : 'Send Campaign'}
                </Button>
            </div>

            {/* Right: summary + preview */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="card-base p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Summary</h4>
                    <div className="flex flex-col gap-2.5">
                        {[
                            { label: 'Recipients',       value: recipCount > 0 ? recipCount.toLocaleString() : '—' },
                            { label: 'SMS per person',   value: smsCount },
                            { label: 'Total SMS needed', value: totalSms > 0 ? totalSms.toLocaleString() : '—', highlight: wouldExceed },
                            { label: 'Quota remaining',  value: quotaLeft.toLocaleString(), green: quotaLeft > 0 && !wouldExceed },
                        ].map(row => (
                            <div key={row.label} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{row.label}</span>
                                <span className={cn('font-semibold tabular-nums', row.highlight ? 'text-red-500' : row.green ? 'text-emerald-600' : '')}>{row.value}</span>
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
                            <p className="text-sm leading-relaxed">
                                {message
                                    ? message.replace('[name]', isMember
                                        ? (recipient as any).label.split(' ')[0]
                                        : 'Chidi')
                                    : <span className="italic text-muted-foreground/40">Your message will appear here...</span>}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground/40 mt-2 text-right">{message.length}/{MAX_SMS}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Sms() {
    const { plan, smsLimit, smsUsed, history: initialHistory, recipientGroups, departments, members } =
        usePage<SmsPageProps>().props;

    const planConfig = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
    const [used, setUsed] = useState(smsUsed);
    const [history]       = useState(initialHistory);
    const [tab, setTab]   = useState<'compose' | 'history'>('compose');
    const quotaLeft       = Math.max(0, smsLimit - used);

    return (
        <>
            <Head title="SMS" />
            <div className="flex flex-col h-full overflow-hidden">
                {/* Tabs */}
                <div className="flex items-center gap-0 border-b border-border px-6 shrink-0">
                    {([['compose', 'Compose', Send], ['history', 'History', MessageSquare]] as const).map(([id, label, Icon]) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={cn('relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                                tab === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                            <Icon className="size-3.5" />{label}
                            {tab === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                    {/* Quota always visible on compose */}
                    {tab === 'compose' && (
                        <div className="mb-5 max-w-2xl">
                            <QuotaBar used={used} limit={planConfig.monthly} plan={planConfig.label} />
                        </div>
                    )}

                    {tab === 'compose' && (
                        <ComposeTab quotaLeft={quotaLeft} onSend={n => setUsed(u => u + n)}
                            groups={recipientGroups} departments={departments} members={members} />
                    )}

                    {tab === 'history' && (
                        <div className="flex flex-col gap-4 max-w-3xl">
                            {history.length === 0 && (
                                <div className="card-base p-12 text-center">
                                    <MessageSquare className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No SMS campaigns yet.</p>
                                </div>
                            )}
                            {history.map(sms => {
                                const sc = statusConfig[sms.status] ?? statusConfig.sent;
                                const StatusIcon = sc.icon;
                                const rate = sms.recipients > 0 ? Math.round((sms.sent / sms.recipients) * 100) : 0;
                                return (
                                    <div key={sms.id} className="card-base p-5">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-sm">{sms.title}</h3>
                                                    <span className={cn('inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5', sc.color)}>
                                                        <StatusIcon className="size-3" />{sc.label}
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
                                        {sms.message && <p className="text-sm text-muted-foreground mb-3 line-clamp-1 italic">"{sms.message}"</p>}
                                        {sms.status === 'sent' && sms.recipients > 1 && (
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="size-3.5" />{sms.sent} delivered</span>
                                                <span className="flex items-center gap-1.5 text-red-500"><XCircle className="size-3.5" />{sms.failed} failed</span>
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
