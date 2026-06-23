import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CheckCircle2,
    ChevronDown,
    Clock,
    Download,
    Filter,
    Plus,
    Search,
    TrendingDown,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, type FinanceTransaction, type ServiceOffering } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type Tab = 'overview' | 'transactions' | 'service' | 'reconciliation';

const reconciliationStatusConfig = {
    matched: {
        label: 'Matched',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle2,
        iconColor: 'text-emerald-500',
    },
    variance: {
        label: 'Variance',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: AlertTriangle,
        iconColor: 'text-red-500',
    },
    pending: {
        label: 'Pending',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        icon: Clock,
        iconColor: 'text-amber-500',
    },
    investigating: {
        label: 'Investigating',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: Search,
        iconColor: 'text-purple-500',
    },
};

const methodConfig = {
    cash: { label: 'Cash', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    transfer: { label: 'Transfer', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    pos: { label: 'POS', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    cheque: { label: 'Cheque', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
};

function OverviewTab({ summary }: { summary: any }) {
    const fs = summary ?? { totalIncome: 0, totalExpenses: 0, netBalance: 0, cashAmount: 0, bankAmount: 0, lastUpdated: '', monthlyTrend: [] };
    const maxBar = Math.max(...fs.monthlyTrend.map((m) => Math.max(m.income, m.expenses)));

    return (
        <div className="p-6 flex flex-col gap-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="card-base p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Income</span>
                        <ArrowUpRight className="size-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatCurrency(fs.totalIncome)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>
                <div className="card-base p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Expenses</span>
                        <ArrowDownRight className="size-4 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-500 tabular-nums">
                        {formatCurrency(fs.totalExpenses)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>
                <div className="card-base p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Balance</span>
                        <TrendingUp className="size-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold tabular-nums">
                        {formatCurrency(fs.netBalance)}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">↑ Surplus</p>
                </div>
                <div className="card-base p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cash vs Bank</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Cash</span>
                            <span className="font-semibold tabular-nums">{formatCurrency(fs.cashAmount)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-amber-500"
                                style={{ width: `${(fs.cashAmount / (fs.cashAmount + fs.bankAmount)) * 100}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Bank</span>
                            <span className="font-semibold tabular-nums">{formatCurrency(fs.bankAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="card-base p-5">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold">Income vs Expenses — 2026</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary/80" />Income</span>
                        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-red-400" />Expenses</span>
                    </div>
                </div>
                <div className="flex items-end gap-3 h-40">
                    {fs.monthlyTrend.map((month) => (
                        <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: '120px' }}>
                                <div
                                    className="flex-1 rounded-t bg-primary/80 transition-all duration-500 min-w-0"
                                    style={{ height: `${(month.income / maxBar) * 100}%` }}
                                    title={formatCurrency(month.income)}
                                />
                                <div
                                    className="flex-1 rounded-t bg-red-400 transition-all duration-500 min-w-0"
                                    style={{ height: `${(month.expenses / maxBar) * 100}%` }}
                                    title={formatCurrency(month.expenses)}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">{month.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function TransactionsTab() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

    const { transactions: allTransactions } = usePage<any>().props;
    const filtered = (allTransactions ?? []).filter((t: any) => {
        const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase()) || t.category?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || t.type === typeFilter;
        return matchSearch && matchType;
    });

    return (
        <div className="flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-border">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input className="h-8 pl-8 text-sm bg-muted/50 border-transparent" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                    {(['all', 'income', 'expense'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={cn(
                                'px-3 py-1 rounded-md text-xs font-medium transition-base capitalize',
                                typeFilter === t
                                    ? 'bg-background shadow-xs text-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 ml-auto">
                    <Download className="size-3.5" />
                    Export
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Date</th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Description</th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Category</th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Method</th>
                            <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Amount</th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map((txn) => {
                            const mc = methodConfig[txn.method];
                            return (
                                <tr key={txn.id} className="hover:bg-muted/20 transition-base cursor-pointer group">
                                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{txn.date}</td>
                                    <td className="px-5 py-3">
                                        <div>
                                            <p className="font-medium text-foreground">{txn.description}</p>
                                            {txn.reference && <p className="text-xs text-muted-foreground">{txn.reference}</p>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-muted-foreground">{txn.category}</td>
                                    <td className="px-5 py-3">
                                        <span className={cn('text-xs rounded-md px-2 py-0.5 font-medium', mc.color)}>{mc.label}</span>
                                    </td>
                                    <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', txn.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={cn(
                                            'text-xs rounded-full px-2 py-0.5 font-medium',
                                            txn.status === 'reconciled' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            txn.status === 'confirmed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                        )}>
                                            {txn.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Offering Templates  ───────────────────────────────────────────────────────

type OfferingSection = {
    id: string;
    label: string;
    enabled: boolean;
    isSystem: boolean;
};

type OfferingTemplate = {
    id: string;
    name: string;
    sections: OfferingSection[];
};

const DEFAULT_TEMPLATES: OfferingTemplate[] = [
    {
        id: 'standard',
        name: 'Standard Sunday',
        sections: [
            { id: 'tithe',    label: 'Tithes',          enabled: true,  isSystem: true },
            { id: 'offering', label: 'Offering',         enabled: true,  isSystem: true },
            { id: 'special',  label: 'Special Offering', enabled: false, isSystem: false },
            { id: 'building', label: 'Building Project', enabled: false, isSystem: false },
        ],
    },
    {
        id: 'full',
        name: 'Full Service',
        sections: [
            { id: 'tithe',        label: 'Tithes',            enabled: true,  isSystem: true },
            { id: 'offering',     label: 'Offering',           enabled: true,  isSystem: true },
            { id: 'special',      label: 'Special Offering',   enabled: true,  isSystem: false },
            { id: 'building',     label: 'Building Project',   enabled: true,  isSystem: false },
            { id: 'thanksgiving', label: 'Thanksgiving',       enabled: true,  isSystem: false },
            { id: 'welfare',      label: 'Welfare',            enabled: false, isSystem: false },
        ],
    },
    {
        id: 'midweek',
        name: 'Midweek Service',
        sections: [
            { id: 'offering', label: 'Offering', enabled: true,  isSystem: true },
            { id: 'welfare',  label: 'Welfare',  enabled: false, isSystem: false },
        ],
    },
];

const PAYMENT_METHODS = ['Cash', 'Transfer', 'POS', 'Cheque'];

type SectionEntry = { cash: string; transfer: string; pos: string; cheque: string };

function ServiceEntryTab() {
    const { serviceOfferings } = usePage<any>().props;
    const [templates, setTemplates]         = useState<OfferingTemplate[]>(DEFAULT_TEMPLATES);
    const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATES[0].id);
    const [showTemplateEditor, setShowTemplateEditor] = useState(false);
    const [serviceName, setServiceName]     = useState('Sunday Service');
    const [serviceDate, setServiceDate]     = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance]       = useState('');
    const [entries, setEntries]             = useState<Record<string, SectionEntry>>({});
    const [newSectionName, setNewSectionName] = useState('');

    const template   = templates.find(t => t.id === selectedTemplate) ?? templates[0];
    const activeSections = template.sections.filter(s => s.enabled);

    function getEntry(sectionId: string): SectionEntry {
        return entries[sectionId] ?? { cash: '', transfer: '', pos: '', cheque: '' };
    }

    function setEntry(sectionId: string, method: string, value: string) {
        setEntries(prev => ({
            ...prev,
            [sectionId]: { ...getEntry(sectionId), [method.toLowerCase()]: value },
        }));
    }

    function sectionTotal(sectionId: string): number {
        const e = getEntry(sectionId);
        return ['cash', 'transfer', 'pos', 'cheque'].reduce((s, m) => s + parseFloat((e as any)[m] || '0'), 0);
    }

    const grandTotal = activeSections.reduce((s, sec) => s + sectionTotal(sec.id), 0);

    function toggleSection(templateId: string, sectionId: string) {
        setTemplates(prev => prev.map(t =>
            t.id !== templateId ? t : {
                ...t,
                sections: t.sections.map(s =>
                    s.id === sectionId ? { ...s, enabled: !s.enabled } : s
                ),
            }
        ));
    }

    function addSection(templateId: string) {
        if (!newSectionName.trim()) return;
        setTemplates(prev => prev.map(t =>
            t.id !== templateId ? t : {
                ...t,
                sections: [...t.sections, { id: `custom-${Date.now()}`, label: newSectionName.trim(), enabled: true, isSystem: false }],
            }
        ));
        setNewSectionName('');
    }

    function removeSection(templateId: string, sectionId: string) {
        setTemplates(prev => prev.map(t =>
            t.id !== templateId ? t : {
                ...t,
                sections: t.sections.filter(s => s.id !== sectionId || s.isSystem),
            }
        ));
    }

    return (
        <div className="p-6 flex flex-col gap-6">
            {/* Template + Service info bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Service Name</label>
                    <Input value={serviceName} onChange={e => setServiceName(e.target.value)} className="h-9" placeholder="e.g. Sunday Service" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Date</label>
                    <Input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} className="h-9" />
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Attendance</label>
                    <Input type="number" placeholder="e.g. 450" value={attendance} onChange={e => setAttendance(e.target.value)} className="h-9" />
                </div>
            </div>

            {/* Template picker */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Offering Template</label>
                    <button
                        onClick={() => setShowTemplateEditor(v => !v)}
                        className="text-xs text-primary hover:underline"
                    >
                        {showTemplateEditor ? 'Hide editor' : 'Customize templates'}
                    </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {templates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTemplate(t.id)}
                            className={cn(
                                'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                                selectedTemplate === t.id
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-border text-muted-foreground hover:border-primary/40',
                            )}
                        >
                            {t.name}
                            <span className="ml-1.5 text-muted-foreground font-normal">
                                ({t.sections.filter(s => s.enabled).length} sections)
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Template editor */}
            {showTemplateEditor && (
                <div className="card-base p-4 flex flex-col gap-3">
                    <p className="text-sm font-semibold">
                        Editing: {template.name}
                    </p>
                    <div className="flex flex-col gap-2">
                        {template.sections.map(section => (
                            <div key={section.id} className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleSection(template.id, section.id)}
                                    className={cn(
                                        'flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all',
                                        section.enabled ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                                    )}
                                    disabled={section.isSystem}
                                >
                                    {section.enabled && <CheckCircle2 className="size-3" />}
                                </button>
                                <span className={cn('text-sm flex-1', !section.enabled && 'text-muted-foreground line-through')}>{section.label}</span>
                                {section.isSystem
                                    ? <span className="text-xs text-muted-foreground">required</span>
                                    : (
                                        <button onClick={() => removeSection(template.id, section.id)} className="text-muted-foreground hover:text-destructive">
                                            <XCircle className="size-3.5" />
                                        </button>
                                    )
                                }
                            </div>
                        ))}
                    </div>
                    {/* Add custom section */}
                    <div className="flex gap-2 mt-1">
                        <Input
                            value={newSectionName}
                            onChange={e => setNewSectionName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addSection(template.id)}
                            placeholder="Add section e.g. Harvest Offering"
                            className="h-8 text-xs flex-1"
                        />
                        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => addSection(template.id)} disabled={!newSectionName.trim()}>
                            <Plus className="size-3" /> Add
                        </Button>
                    </div>
                </div>
            )}

            {/* Offering sections grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeSections.map(section => {
                    const total = sectionTotal(section.id);
                    const e     = getEntry(section.id);
                    return (
                        <div key={section.id} className="card-base p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">{section.label}</h4>
                                {total > 0 && (
                                    <span className="text-sm font-bold text-primary tabular-nums">
                                        {formatCurrency(total)}
                                    </span>
                                )}
                            </div>
                            {PAYMENT_METHODS.map(method => {
                                const key  = method.toLowerCase() as keyof SectionEntry;
                                const val  = (e as any)[key];
                                return (
                                    <div key={method}>
                                        <label className="text-xs text-muted-foreground mb-1 block">{method}</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={val}
                                            onChange={ev => setEntry(section.id, method, ev.target.value)}
                                            className="h-8 text-sm font-semibold"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Grand total + submit */}
            <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 p-5">
                <div>
                    <p className="text-sm text-muted-foreground">Grand Total Collected</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {activeSections.length} section{activeSections.length !== 1 ? 's' : ''} · {serviceName} · {serviceDate}
                    </p>
                </div>
                <span className="text-3xl font-bold text-primary tabular-nums">
                    {formatCurrency(grandTotal)}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="h-10 gap-2" disabled={grandTotal === 0}
                    onClick={() => router.post('/finance/service-entry', {
                        service_name: serviceName, service_date: serviceDate,
                        recorded_amount: grandTotal,
                        sections: activeSections.map(s => ({ label: s.label, amounts: getEntry(s.id) })),
                    }, { onSuccess: () => toast.success('Offering saved as draft.') })}>
                    <Download className="size-4" />
                    Save as Draft
                </Button>
                <Button className="h-10 font-semibold gap-2" disabled={grandTotal === 0}
                    onClick={() => router.post('/finance/service-entry', {
                        service_name: serviceName, service_date: serviceDate,
                        recorded_amount: grandTotal,
                        sections: activeSections.map(s => ({ label: s.label, amounts: getEntry(s.id) })),
                    }, { onSuccess: () => { toast.success('Offering recorded!'); setEntries({}); } })}>
                    Record Offering
                </Button>
            </div>

            {/* Recent offerings */}
            <div className="card-base overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border">
                    <h3 className="text-sm font-semibold">Recent Service Offerings</h3>
                </div>
                <div className="divide-y divide-border">
                    {(serviceOfferings ?? []).map((so: any) => {
                        const rc = reconciliationStatusConfig[so.reconciliation_status] ?? reconciliationStatusConfig.pending;
                        const RcIcon = rc.icon;
                        return (
                            <div key={so.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-base">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{so.service_name}</p>
                                    <p className="text-xs text-muted-foreground">{so.service_date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(so.recorded_amount)}</p>
                                    <span className={cn('text-xs font-medium rounded-full px-2 py-0.5', rc.color)}>
                                        {rc.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function ReconciliationTab() {
    const { serviceOfferings } = usePage<any>().props;
    const recons: any[] = serviceOfferings ?? [];

    const counts = {
        matched:      recons.filter(s => s.reconciliation_status === 'matched').length,
        pending:      recons.filter(s => s.reconciliation_status === 'pending').length,
        variance:     recons.filter(s => s.reconciliation_status === 'variance').length,
        investigating:recons.filter(s => s.reconciliation_status === 'investigating').length,
    };
    return (
        <div className="p-6 flex flex-col gap-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: 'Matched',       count: counts.matched,       color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800' },
                    { label: 'Pending',       count: counts.pending,       color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/20',     border: 'border-amber-200 dark:border-amber-800' },
                    { label: 'Variance',      count: counts.variance,      color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-950/20',         border: 'border-red-200 dark:border-red-800' },
                    { label: 'Investigating', count: counts.investigating, color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-950/20',   border: 'border-purple-200 dark:border-purple-800' },
                ].map((s) => (
                    <div key={s.label} className={cn('rounded-xl border p-4', s.bg, s.border)}>
                        <p className={cn('text-2xl font-bold', s.color)}>{s.count}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Reconciliation table */}
            <div className="card-base overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border">
                    <h3 className="text-sm font-semibold">Service Reconciliation Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Service</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Date</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Recorded</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Banked</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Variance</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-2.5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recons.map((so) => {
                                const rc = reconciliationStatusConfig[so.reconciliation_status as keyof typeof reconciliationStatusConfig] ?? reconciliationStatusConfig.pending;
                                const RcIcon = rc.icon;
                                return (
                                    <tr key={so.id} className="hover:bg-muted/20 transition-base">
                                        <td className="px-5 py-3.5 font-medium">{so.service_name}</td>
                                        <td className="px-5 py-3.5 text-muted-foreground">{so.service_date}</td>
                                        <td className="px-5 py-3.5 text-right tabular-nums font-medium">{formatCurrency(so.recorded_amount)}</td>
                                        <td className="px-5 py-3.5 text-right tabular-nums font-medium">
                                            {so.banked_amount ? formatCurrency(so.banked_amount) : <span className="text-muted-foreground">—</span>}
                                        </td>
                                        <td className={cn(
                                            'px-5 py-3.5 text-right tabular-nums font-semibold',
                                            so.variance && so.variance < 0 ? 'text-red-500' :
                                            so.variance && so.variance > 0 ? 'text-emerald-600' : 'text-muted-foreground',
                                        )}>
                                            {so.variance != null
                                                ? `${so.variance < 0 ? '−' : '+'}${formatCurrency(Math.abs(so.variance))}`
                                                : '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1', rc.color)}>
                                                <RcIcon className={cn('size-3', rc.iconColor)} />
                                                {rc.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {so.reconciliation_status === 'pending' && (
                                                <button
                                                    className="text-xs text-primary hover:underline"
                                                    onClick={() => {
                                                        const amt = prompt('Enter banked amount:');
                                                        if (!amt) return;
                                                        router.patch(`/finance/service-entry/${so.id}/reconcile`, {
                                                            banked_amount: parseFloat(amt),
                                                            banked_date: new Date().toISOString().split('T')[0],
                                                        }, { onSuccess: () => toast.success('Reconciled.') });
                                                    }}
                                                >
                                                    Reconcile
                                                </button>
                                            )}
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

export default function Finance() {
    const { summary } = usePage<any>().props;
    const [tab, setTab] = useState<Tab>('overview');

    const tabs: { id: Tab; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'transactions', label: 'Transactions' },
        { id: 'service', label: 'Service Entry' },
        { id: 'reconciliation', label: 'Reconciliation' },
    ];

    return (
        <>
            <Head title="Finance" />
            <div className="flex flex-col h-full overflow-hidden">
                {/* Tabs */}
                <div className="flex items-center gap-0 border-b border-border px-6 shrink-0">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={cn(
                                'relative px-4 py-3 text-sm font-medium transition-base',
                                tab === t.id
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {t.label}
                            {tab === t.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    { tab === 'overview' && <OverviewTab summary={summary} /> }
                    {tab === 'transactions' && <TransactionsTab />}
                    {tab === 'service' && <ServiceEntryTab />}
                    {tab === 'reconciliation' && <ReconciliationTab />}
                </div>
            </div>
        </>
    );
}

Finance.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Finance', href: '/finance' },
    ],
};


