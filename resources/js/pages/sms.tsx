import { Head } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    MessageSquare,
    Plus,
    Send,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

const mockSmsHistory = [
    { id: 'sms-001', title: 'Sunday Service Reminder', message: 'Dear beloved, join us this Sunday at 9AM for a powerful service. God bless you!', recipients: 842, sent: 836, failed: 6, status: 'sent' as const, date: '2026-06-07 08:00', category: 'service' },
    { id: 'sms-002', title: 'Evangelism Outreach Notice', message: 'Evangelism team meets Saturday at 8AM. Please be at the church premises. God bless!', recipients: 30, sent: 30, failed: 0, status: 'sent' as const, date: '2026-06-05 07:30', category: 'ministry' },
    { id: 'sms-003', title: 'Follow-up Check-in Batch', message: 'Hi [name], we missed you last Sunday. We hope to see you this week. God loves you!', recipients: 38, sent: 0, failed: 0, status: 'pending' as const, date: '2026-06-09 09:00', category: 'followup' },
    { id: 'sms-004', title: 'Care — Bereavement Support', message: 'The church family is praying for the Obi family during this difficult time.', recipients: 200, sent: 198, failed: 2, status: 'sent' as const, date: '2026-06-05 12:00', category: 'care' },
];

const recipientGroups = [
    { id: 'all', label: 'All Members', count: 842 },
    { id: 'active', label: 'Active Members', count: 728 },
    { id: 'followup', label: 'Follow-Up List', count: 38 },
    { id: 'evangelism', label: 'Evangelism Dept', count: 30 },
    { id: 'workers', label: 'All Workers', count: 156 },
    { id: 'homeChurch', label: 'Home Church Leaders', count: 24 },
];

const statusConfig = {
    sent: { label: 'Sent', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    pending: { label: 'Scheduled', icon: Clock, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    failed: { label: 'Failed', icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const MAX_SMS = 160;

export default function Sms() {
    const [tab, setTab] = useState<'compose' | 'history'>('compose');
    const [message, setMessage] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('active');
    const [title, setTitle] = useState('');

    const charsLeft = MAX_SMS - message.length;
    const smsCount = Math.ceil(message.length / MAX_SMS) || 1;
    const selectedGroupData = recipientGroups.find((g) => g.id === selectedGroup);

    const tabs = [
        { id: 'compose' as const, label: 'Compose' },
        { id: 'history' as const, label: 'History' },
    ];

    return (
        <>
            <Head title="SMS" />
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">SMS</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Send bulk SMS to members and groups</p>
                    </div>
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

                <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                    {tab === 'compose' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
                            {/* Compose Form */}
                            <div className="card-base p-6 flex flex-col gap-4">
                                <h3 className="text-sm font-semibold">New SMS Campaign</h3>

                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Campaign Title</Label>
                                    <Input
                                        placeholder="e.g. Sunday Service Reminder"
                                        className="h-9"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Recipients</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {recipientGroups.map((group) => (
                                            <button
                                                key={group.id}
                                                onClick={() => setSelectedGroup(group.id)}
                                                className={cn(
                                                    'flex items-center justify-between rounded-lg border p-2.5 text-xs transition-base',
                                                    selectedGroup === group.id
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-border hover:border-primary/30 hover:bg-muted/50',
                                                )}
                                            >
                                                <span className="font-medium">{group.label}</span>
                                                <span className={cn('font-bold', selectedGroup === group.id ? 'text-primary' : 'text-muted-foreground')}>
                                                    {group.count}
                                                </span>
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
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your SMS message here. Use [name] to personalize."
                                        rows={5}
                                        className="w-full rounded-lg border border-input bg-background text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Tip: Use <code className="bg-muted px-1 rounded">[name]</code> to personalize each message
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" className="flex-1 gap-2" size="sm">
                                        <Clock className="size-3.5" />
                                        Schedule
                                    </Button>
                                    <Button className="flex-1 gap-2" size="sm" disabled={!message || !title}>
                                        <Send className="size-3.5" />
                                        Send Now
                                    </Button>
                                </div>
                            </div>

                            {/* Preview Panel */}
                            <div className="flex flex-col gap-4">
                                {/* Cost estimate */}
                                <div className="card-base p-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Campaign Summary</h4>
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Recipients</span>
                                            <span className="font-semibold">{selectedGroupData?.count || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">SMS per person</span>
                                            <span className="font-semibold">{smsCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Total SMS</span>
                                            <span className="font-semibold">{(selectedGroupData?.count || 0) * smsCount}</span>
                                        </div>
                                        <div className="h-px bg-border" />
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Remaining balance</span>
                                            <span className="font-semibold text-emerald-600">500 units</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone preview */}
                                <div className="card-base p-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Message Preview</h4>
                                    <div className="rounded-xl bg-muted/50 p-4 border border-border">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">GA</div>
                                            <span className="text-xs font-medium text-muted-foreground">Grace Assembly</span>
                                        </div>
                                        <div className="rounded-xl bg-background border border-border p-3">
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                {message
                                                    ? message.replace('[name]', 'Chidi')
                                                    : <span className="italic text-muted-foreground/50">Your message will appear here...</span>
                                                }
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground/50 mt-2 text-right">
                                            {message.length}/{MAX_SMS} characters
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'history' && (
                        <div className="flex flex-col gap-4 max-w-4xl">
                            {mockSmsHistory.map((sms) => {
                                const sc = statusConfig[sms.status];
                                const StatusIcon = sc.icon;
                                const deliveryRate = sms.sent > 0 ? Math.round((sms.sent / sms.recipients) * 100) : 0;

                                return (
                                    <div key={sms.id} className="card-base p-5 hover:shadow-sm transition-smooth cursor-pointer">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm">{sms.title}</h3>
                                                    <span className={cn('inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5', sc.color)}>
                                                        <StatusIcon className="size-3" />
                                                        {sc.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{sms.date}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold">{sms.recipients}</p>
                                                <p className="text-xs text-muted-foreground">recipients</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{sms.message}</p>

                                        {sms.status === 'sent' && (
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                                                    <span>{sms.sent} delivered</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <XCircle className="size-3.5 text-red-500" />
                                                    <span>{sms.failed} failed</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-auto">
                                                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-emerald-500"
                                                            style={{ width: `${deliveryRate}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-medium">{deliveryRate}%</span>
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
