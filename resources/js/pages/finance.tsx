import { Head, Link, router, usePage } from '@inertiajs/react';
import React from 'react';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CheckCircle2,
    ChevronDown,
    Clock,
    Download,
    FileText,
    Filter,
    Paperclip,
    Plus,
    Search,
    TrendingDown,
    TrendingUp,
    Trash2,
    Upload,
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

const methodConfig: Record<string, { label: string; color: string }> = {
    cash:     { label: 'Cash',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    transfer: { label: 'Transfer', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    pos:      { label: 'POS',      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    cheque:   { label: 'Cheque',   color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
    bank:     { label: 'Bank',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    offering: { label: 'Offering', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    online:   { label: 'Online',   color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
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

// ── Record Income Modal ───────────────────────────────────────────────────────
const DENOMS = [
    { key: 'cash',     label: 'Cash' },
    { key: 'transfer', label: 'Bank Transfer' },
    { key: 'pos',      label: 'POS / Card' },
    { key: 'cheque',   label: 'Cheque' },
];

function RecordIncomeModal({ onClose }: { onClose: () => void }) {
    const { incomeCategories } = usePage<any>().props;
    const [categoryId, setCategoryId] = useState('');
    const [date,       setDate]       = useState(new Date().toISOString().split('T')[0]);
    const [note,       setNote]       = useState('');
    const [denoms,     setDenoms]     = useState({ cash: '', transfer: '', pos: '', cheque: '' });
    const [saving,     setSaving]     = useState(false);

    const total = Object.values(denoms).reduce((s, v) => s + (parseFloat(v) || 0), 0);

    // Primary method = whichever denomination has the largest amount
    const primaryMethod = Object.entries(denoms)
        .filter(([, v]) => parseFloat(v) > 0)
        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))[0]?.[0] ?? 'cash';

    function save() {
        if (!categoryId || total === 0) return;
        setSaving(true);
        router.post('/finance/income', {
            income_category_id: categoryId,
            amount: total,
            source: primaryMethod,
            income_date: date,
            note: note || null,
            denominations: denoms,
        }, {
            onSuccess: () => { toast.success('Income recorded.'); onClose(); },
            onError: () => { toast.error('Failed to record income.'); setSaving(false); },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                        <ArrowUpRight className="size-4 text-emerald-500" />Record Income
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><XCircle className="size-4" /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <label className="field-label mb-1.5 block">Category *</label>
                        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                            <option value="">Select category...</option>
                            {(incomeCategories ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="field-label mb-1.5 block">Date *</label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" />
                    </div>
                </div>

                {/* Denomination breakdown */}
                <div>
                    <label className="field-label mb-2 block">Amount by Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                        {DENOMS.map(d => (
                            <div key={d.key}>
                                <label className="text-xs text-muted-foreground mb-1 block">{d.label}</label>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₦</span>
                                    <Input type="number" min="0" placeholder="0"
                                        value={(denoms as any)[d.key]}
                                        onChange={e => setDenoms(prev => ({ ...prev, [d.key]: e.target.value }))}
                                        className="h-9 pl-6 text-sm font-medium" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className={cn('flex items-center justify-between rounded-lg px-4 py-3 border',
                    total > 0 ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-muted/40 border-border')}>
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className={cn('text-lg font-bold tabular-nums', total > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
                        {formatCurrency(total)}
                    </span>
                </div>

                <div>
                    <label className="field-label mb-1.5 block">Note (optional)</label>
                    <Input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Sunday morning offering" className="h-9" />
                </div>

                <div className="flex gap-2 pt-1">
                    <Button className="flex-1 gap-2" disabled={!categoryId || total === 0 || saving} onClick={save}>
                        <ArrowUpRight className="size-4" />{saving ? 'Saving…' : `Record ${formatCurrency(total)}`}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}

// ── Record Expense Modal ──────────────────────────────────────────────────────
function RecordExpenseModal({ onClose }: { onClose: () => void }) {
    const { expenseCategories } = usePage<any>().props;
    const [categoryId, setCategoryId] = useState('');
    const [date,       setDate]       = useState(new Date().toISOString().split('T')[0]);
    const [note,       setNote]       = useState('');
    const [paidTo,     setPaidTo]     = useState('');
    const [denoms,     setDenoms]     = useState({ cash: '', transfer: '', pos: '', cheque: '' });
    const [saving,     setSaving]     = useState(false);

    const total = Object.values(denoms).reduce((s, v) => s + (parseFloat(v) || 0), 0);

    function save() {
        if (!categoryId || total === 0) return;
        setSaving(true);
        router.post('/finance/expense', {
            expense_category_id: categoryId,
            amount: total,
            paid_to: paidTo || null,
            expense_date: date,
            note: note || null,
            denominations: denoms,
        }, {
            onSuccess: () => { toast.success('Expense recorded.'); onClose(); },
            onError: () => { toast.error('Failed to record expense.'); setSaving(false); },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                        <ArrowDownRight className="size-4 text-red-500" />Record Expense
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><XCircle className="size-4" /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <label className="field-label mb-1.5 block">Category *</label>
                        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                            <option value="">Select category...</option>
                            {(expenseCategories ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="field-label mb-1.5 block">Date *</label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" />
                    </div>
                    <div>
                        <label className="field-label mb-1.5 block">Paid To</label>
                        <Input value={paidTo} onChange={e => setPaidTo(e.target.value)} placeholder="Vendor / Person" className="h-9" />
                    </div>
                </div>

                <div>
                    <label className="field-label mb-2 block">Amount by Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                        {DENOMS.map(d => (
                            <div key={d.key}>
                                <label className="text-xs text-muted-foreground mb-1 block">{d.label}</label>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₦</span>
                                    <Input type="number" min="0" placeholder="0"
                                        value={(denoms as any)[d.key]}
                                        onChange={e => setDenoms(prev => ({ ...prev, [d.key]: e.target.value }))}
                                        className="h-9 pl-6 text-sm font-medium" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={cn('flex items-center justify-between rounded-lg px-4 py-3 border',
                    total > 0 ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' : 'bg-muted/40 border-border')}>
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className={cn('text-lg font-bold tabular-nums', total > 0 ? 'text-red-600' : 'text-muted-foreground')}>
                        {formatCurrency(total)}
                    </span>
                </div>

                <div>
                    <label className="field-label mb-1.5 block">Note (optional)</label>
                    <Input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Generator fuel" className="h-9" />
                </div>

                <div className="flex gap-2 pt-1">
                    <Button className="flex-1 gap-2 bg-red-600 hover:bg-red-700" disabled={!categoryId || total === 0 || saving} onClick={save}>
                        <ArrowDownRight className="size-4" />{saving ? 'Saving…' : `Record ${formatCurrency(total)}`}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}

// ── Attachment Modal ──────────────────────────────────────────────────────────
function AttachmentModal({ txn, onClose }: { txn: any; onClose: () => void }) {
    const [files,   setFiles]   = useState<File[]>([]);
    const [note,    setNote]    = useState('');
    const [saving,  setSaving]  = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Parse type and id from transaction id (e.g. "inc-5" → income, 5)
    const [attachableType, attachableId] = txn.id.startsWith('inc-')
        ? ['income',  parseInt(txn.id.replace('inc-', ''))]
        : ['expense', parseInt(txn.id.replace('exp-', ''))];

    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) setFiles(Array.from(e.target.files));
    }

    function upload() {
        if (files.length === 0) return;
        setSaving(true);
        const form = new FormData();
        form.append('attachable_type', attachableType);
        form.append('attachable_id', String(attachableId));
        form.append('note', note);
        files.forEach(f => form.append('files[]', f));

        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        fetch('/finance/attachments', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
            body: form,
        }).then(r => {
            if (r.ok) { toast.success(`${files.length} file(s) uploaded.`); onClose(); router.reload(); }
            else toast.error('Upload failed.');
        }).finally(() => setSaving(false));
    }

    function deleteAttachment(id: number) {
        if (!confirm('Delete this attachment?')) return;
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        fetch(`/finance/attachments/${id}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
        }).then(() => { toast.success('Deleted.'); router.reload(); onClose(); });
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md p-5 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold flex items-center gap-2"><Paperclip className="size-4" />Attachments</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{txn.description} · {txn.date}</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><XCircle className="size-4" /></button>
                </div>

                {/* Existing attachments */}
                {(txn.attachments ?? []).length > 0 && (
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attached Files</p>
                        {(txn.attachments ?? []).map((a: any) => (
                            <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    {a.mime_type?.startsWith('image/') ? (
                                        <img src={a.url} alt={a.original_name} className="size-8 rounded-lg object-cover" />
                                    ) : (
                                        <FileText className="size-4" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <a href={a.url} target="_blank" rel="noreferrer"
                                        className="text-xs font-medium text-primary hover:underline truncate block">{a.original_name}</a>
                                    {a.note && <p className="text-xs text-muted-foreground truncate">{a.note}</p>}
                                    <p className="text-xs text-muted-foreground">{a.uploaded_by_name} · {Math.round(a.size / 1024)}KB</p>
                                </div>
                                <button onClick={() => deleteAttachment(a.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload new */}
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Upload New</p>
                    <div
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                        onClick={() => inputRef.current?.click()}>
                        <input ref={inputRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={onFileChange} />
                        <Paperclip className="size-6 text-muted-foreground/50 mx-auto mb-2" />
                        {files.length > 0 ? (
                            <p className="text-sm font-medium text-foreground">{files.length} file(s) selected</p>
                        ) : (
                            <p className="text-sm text-muted-foreground">Click to select images or PDFs<br/><span className="text-xs">Max 5MB per file</span></p>
                        )}
                    </div>
                    {files.length > 0 && (
                        <div>
                            <label className="field-label mb-1.5 block">Note (optional)</label>
                            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Bank transfer receipt" className="h-9" />
                        </div>
                    )}
                    <Button className="gap-2" disabled={files.length === 0 || saving} onClick={upload}>
                        <Upload className="size-4" />{saving ? 'Uploading…' : `Upload ${files.length > 0 ? files.length + ' file(s)' : ''}`}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function TransactionsTab() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [showIncome,    setShowIncome]    = useState(false);
    const [showExpense,   setShowExpense]   = useState(false);
    const [attachingTxn,  setAttachingTxn] = useState<any | null>(null);

    const { transactions: allTransactions } = usePage<any>().props;
    const filtered = (allTransactions ?? []).filter((t: any) => {
        const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase()) || t.category?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || t.type === typeFilter;
        return matchSearch && matchType;
    });

    return (
        <>
        {showIncome    && <RecordIncomeModal  onClose={() => setShowIncome(false)}  />}
        {showExpense   && <RecordExpenseModal onClose={() => setShowExpense(false)} />}
        {attachingTxn  && <AttachmentModal txn={attachingTxn} onClose={() => setAttachingTxn(null)} />}
        <div className="flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-border flex-wrap">
                <div className="relative flex-1 min-w-[160px] max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input className="h-8 pl-8 text-sm bg-muted/50 border-transparent" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                    {(['all', 'income', 'expense'] as const).map((t) => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={cn('px-3 py-1 rounded-md text-xs font-medium transition-base capitalize',
                                typeFilter === t ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <Button size="sm" className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowIncome(true)}>
                        <ArrowUpRight className="size-3.5" />Income
                    </Button>
                    <Button size="sm" className="h-8 gap-1.5 bg-red-600 hover:bg-red-700" onClick={() => setShowExpense(true)}>
                        <ArrowDownRight className="size-3.5" />Expense
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                        <Download className="size-3.5" />Export
                    </Button>
                </div>
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
                            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">Files</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map((txn) => {
                            const mc = methodConfig[txn.method]
                                ?? { label: txn.method ?? 'Other', color: 'bg-muted text-muted-foreground' };
                            const attachCount = (txn.attachments ?? []).length;
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
                                    <td className="px-5 py-3">
                                        <button onClick={() => setAttachingTxn(txn)}
                                            className={cn('flex items-center gap-1.5 text-xs rounded-lg px-2 py-1 transition-colors',
                                                attachCount > 0
                                                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
                                            <Paperclip className="size-3" />
                                            {attachCount > 0 ? attachCount : '+'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
        </>
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

// Nigerian currency denominations (notes + coins)
const NGN_DENOMS = [
    { value: 1000, label: '₦1,000' },
    { value: 500,  label: '₦500' },
    { value: 200,  label: '₦200' },
    { value: 100,  label: '₦100' },
    { value: 50,   label: '₦50' },
    { value: 20,   label: '₦20' },
    { value: 10,   label: '₦10' },
    { value: 5,    label: '₦5' },
];

type DenomCounts = Record<number, string>; // denomination value → count string
type SectionEntry = {
    cash: string; transfer: string; pos: string; cheque: string;
    cashDenoms: DenomCounts;  // note counting for cash
    showDenoms: boolean;
};

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
        return entries[sectionId] ?? { cash: '', transfer: '', pos: '', cheque: '', cashDenoms: {}, showDenoms: false };
    }

    function setEntry(sectionId: string, method: string, value: string) {
        setEntries(prev => ({
            ...prev,
            [sectionId]: { ...getEntry(sectionId), [method.toLowerCase()]: value },
        }));
    }

    function setDenomCount(sectionId: string, denomValue: number, count: string) {
        const entry = getEntry(sectionId);
        const newDenoms = { ...entry.cashDenoms, [denomValue]: count };
        // Auto-sum denominations into cash field
        const cashTotal = NGN_DENOMS.reduce((sum, d) => {
            return sum + (parseFloat(newDenoms[d.value] || '0') * d.value);
        }, 0);
        setEntries(prev => ({
            ...prev,
            [sectionId]: { ...entry, cashDenoms: newDenoms, cash: cashTotal > 0 ? String(cashTotal) : '' },
        }));
    }

    function toggleDenoms(sectionId: string) {
        const entry = getEntry(sectionId);
        setEntries(prev => ({
            ...prev,
            [sectionId]: { ...entry, showDenoms: !entry.showDenoms },
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
                                    <span className="text-sm font-bold text-primary tabular-nums">{formatCurrency(total)}</span>
                                )}
                            </div>

                            {/* 4 payment methods 2×2 */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs text-muted-foreground">Cash</label>
                                        <button type="button" onClick={() => toggleDenoms(section.id)}
                                            className="text-[10px] text-primary hover:underline">
                                            Count ₦
                                        </button>
                                    </div>
                                    <Input type="number" placeholder="0" value={e.cash}
                                        onChange={ev => setEntry(section.id, 'cash', ev.target.value)}
                                        className="h-8 text-sm font-semibold" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Transfer</label>
                                    <Input type="number" placeholder="0" value={e.transfer}
                                        onChange={ev => setEntry(section.id, 'transfer', ev.target.value)}
                                        className="h-8 text-sm font-semibold" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">POS</label>
                                    <Input type="number" placeholder="0" value={e.pos}
                                        onChange={ev => setEntry(section.id, 'pos', ev.target.value)}
                                        className="h-8 text-sm font-semibold" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Cheque</label>
                                    <Input type="number" placeholder="0" value={e.cheque}
                                        onChange={ev => setEntry(section.id, 'cheque', ev.target.value)}
                                        className="h-8 text-sm font-semibold" />
                                </div>
                            </div>

                            {/* Denomination modal */}
                            {e.showDenoms && (
                                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => toggleDenoms(section.id)}>
                                    <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-sm p-5 flex flex-col gap-4" onClick={ev => ev.stopPropagation()}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-semibold">Cash Count — {section.label}</h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">Enter the number of each note/coin</p>
                                            </div>
                                            <button onClick={() => toggleDenoms(section.id)} className="text-muted-foreground hover:text-foreground">
                                                <XCircle className="size-4" />
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            {/* Header */}
                                            <div className="grid grid-cols-3 gap-2 pb-1 border-b border-border">
                                                <span className="text-xs font-medium text-muted-foreground">Denom.</span>
                                                <span className="text-xs font-medium text-muted-foreground text-center">Qty</span>
                                                <span className="text-xs font-medium text-muted-foreground text-right">Amount</span>
                                            </div>
                                            {NGN_DENOMS.map(d => {
                                                const count    = e.cashDenoms[d.value] ?? '';
                                                const subtotal = (parseFloat(count) || 0) * d.value;
                                                return (
                                                    <div key={d.value} className="grid grid-cols-3 gap-2 items-center py-1 border-b border-border/50 last:border-0">
                                                        <span className="text-sm font-semibold">{d.label}</span>
                                                        <Input type="number" min="0" placeholder="0" value={count}
                                                            onChange={ev => setDenomCount(section.id, d.value, ev.target.value)}
                                                            className="h-8 text-sm text-center px-2" />
                                                        <span className={cn('text-sm text-right tabular-nums font-medium',
                                                            subtotal > 0 ? 'text-foreground' : 'text-muted-foreground/40')}>
                                                            {subtotal > 0 ? formatCurrency(subtotal) : '—'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                                            <span className="text-sm font-medium">Total Cash</span>
                                            <span className="text-lg font-bold text-primary tabular-nums">{formatCurrency(parseFloat(e.cash) || 0)}</span>
                                        </div>

                                        <Button className="w-full" onClick={() => toggleDenoms(section.id)}>
                                            Done — {formatCurrency(parseFloat(e.cash) || 0)} Cash
                                        </Button>
                                    </div>
                                </div>
                            )}
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

// ── Reconcile Modal ───────────────────────────────────────────────────────────
function ReconcileModal({ so, onClose }: { so: any; onClose: () => void }) {
    const isUpdate = so.reconciliation_status !== 'pending';
    const [bankedAmount, setBankedAmount] = useState(so.banked_amount ? String(so.banked_amount) : '');
    const [bankedDate,   setBankedDate]   = useState(so.banked_date ?? new Date().toISOString().split('T')[0]);
    const [note,         setNote]         = useState(so.reconciliation_note ?? '');
    const [saving,       setSaving]       = useState(false);

    const banked   = parseFloat(bankedAmount) || 0;
    const variance = banked - so.recorded_amount;
    const status   = Math.abs(variance) < 0.01 ? 'matched' : Math.abs(variance) > 5000 ? 'investigating' : 'variance';

    function save() {
        if (!banked) return;
        setSaving(true);
        router.patch(`/finance/service-entry/${so.id}/reconcile`, {
            banked_amount: banked, banked_date: bankedDate, reconciliation_note: note || null,
        }, {
            onSuccess: () => { toast.success('Reconciled.'); onClose(); },
            onError:   () => { toast.error('Failed to reconcile.'); setSaving(false); },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md p-5 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold">{isUpdate ? 'Update Reconciliation' : 'Reconcile Offering'}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{so.service_name} · {so.service_date}</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><XCircle className="size-4" /></button>
                </div>

                {/* Recorded amount reference */}
                <div className="rounded-lg bg-muted/40 border border-border px-4 py-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Recorded (counted)</span>
                        <span className="font-semibold tabular-nums">{formatCurrency(so.recorded_amount)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="field-label mb-1.5 block">Banked Amount *</label>
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₦</span>
                            <Input type="number" min="0" placeholder="0" value={bankedAmount}
                                onChange={e => setBankedAmount(e.target.value)}
                                className="h-9 pl-6 text-sm font-medium" autoFocus />
                        </div>
                    </div>
                    <div>
                        <label className="field-label mb-1.5 block">Banked Date *</label>
                        <Input type="date" value={bankedDate} onChange={e => setBankedDate(e.target.value)} className="h-9" />
                    </div>
                </div>

                {/* Live variance preview */}
                {banked > 0 && (
                    <div className={cn('rounded-lg border px-4 py-3 flex items-center justify-between',
                        status === 'matched'       ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' :
                        status === 'variance'      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' :
                        'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800')}>
                        <div>
                            <p className="text-xs text-muted-foreground">Variance</p>
                            <p className={cn('text-lg font-bold tabular-nums',
                                status === 'matched' ? 'text-emerald-600' :
                                status === 'variance' ? 'text-red-600' : 'text-purple-600')}>
                                {variance === 0 ? '₦0 — Matched!' : `${variance < 0 ? '−' : '+'}${formatCurrency(Math.abs(variance))}`}
                            </p>
                        </div>
                        <span className={cn('text-xs font-semibold rounded-full px-2.5 py-1 capitalize',
                            status === 'matched'  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            status === 'variance' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400')}>
                            {status}
                        </span>
                    </div>
                )}

                <div>
                    <label className="field-label mb-1.5 block">
                        {status === 'matched' ? 'Note (optional)' : 'Explanation for variance *'}
                    </label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                        placeholder={status === 'investigating' ? 'e.g. Large discrepancy — under review by treasurer' :
                                     status === 'variance'     ? 'e.g. ₦2,000 short — counting error corrected' :
                                     'Any additional notes...'}
                        className="w-full rounded-lg border border-border bg-background text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>

                {/* Variance guidance */}
                {status === 'variance' && banked > 0 && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
                        <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            Variance detected. Add an explanation note. This will be flagged for review.
                        </p>
                    </div>
                )}
                {status === 'investigating' && banked > 0 && (
                    <div className="flex items-start gap-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 px-4 py-3">
                        <AlertTriangle className="size-4 text-purple-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-purple-700 dark:text-purple-400">
                            Large discrepancy (&gt;₦5,000). This is marked as <strong>Investigating</strong> — a note is required and the record will be escalated.
                        </p>
                    </div>
                )}

                <div className="flex gap-2 pt-1">
                    <Button className="flex-1 gap-2" disabled={!banked || saving} onClick={save}>
                        <CheckCircle2 className="size-4" />{saving ? 'Saving…' : isUpdate ? 'Update' : 'Reconcile'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}

// ── Resolve Variance Modal ────────────────────────────────────────────────────
function ResolveModal({ so, onClose }: { so: any; onClose: () => void }) {
    const [resolution, setResolution] = useState('');
    const [saving, setSaving]         = useState(false);

    function resolve() {
        if (!resolution.trim()) return;
        setSaving(true);
        // Re-reconcile with same banked amount but mark as matched + add resolution note
        router.patch(`/finance/service-entry/${so.id}/reconcile`, {
            banked_amount: so.banked_amount,
            banked_date:   so.banked_date,
            reconciliation_note: `[RESOLVED] ${resolution}`,
            force_match: true,
        }, {
            onSuccess: () => { toast.success('Variance resolved.'); onClose(); },
            onError:   () => { toast.error('Failed.'); setSaving(false); },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md p-5 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold">Resolve Variance</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{so.service_name} · {so.service_date}</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><XCircle className="size-4" /></button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                        { label: 'Recorded', value: formatCurrency(so.recorded_amount), color: 'text-foreground' },
                        { label: 'Banked',   value: formatCurrency(so.banked_amount),   color: 'text-foreground' },
                        { label: 'Variance', value: `${so.variance < 0 ? '−' : '+'}${formatCurrency(Math.abs(so.variance))}`, color: so.variance < 0 ? 'text-red-600' : 'text-emerald-600' },
                    ].map(item => (
                        <div key={item.label} className="rounded-lg bg-muted/40 p-3">
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                            <p className={cn('text-sm font-bold tabular-nums mt-0.5', item.color)}>{item.value}</p>
                        </div>
                    ))}
                </div>

                <div>
                    <label className="field-label mb-1.5 block">Resolution explanation *</label>
                    <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3}
                        placeholder="e.g. Counting error was identified and corrected. ₦2,000 shortfall due to change given during offering. Approved by Pastor."
                        className="w-full rounded-lg border border-border bg-background text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring" autoFocus />
                    <p className="text-xs text-muted-foreground mt-1">This will mark the variance as resolved and log the explanation.</p>
                </div>

                <div className="flex gap-2">
                    <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={!resolution.trim() || saving} onClick={resolve}>
                        <CheckCircle2 className="size-4" />{saving ? 'Saving…' : 'Mark as Resolved'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}

function ReconciliationTab() {
    const { serviceOfferings } = usePage<any>().props;
    const recons: any[] = serviceOfferings ?? [];
    const [reconciling, setReconciling] = useState<any | null>(null);
    const [resolving,   setResolving]   = useState<any | null>(null);

    const counts = {
        matched:      recons.filter(s => s.reconciliation_status === 'matched').length,
        pending:      recons.filter(s => s.reconciliation_status === 'pending').length,
        variance:     recons.filter(s => s.reconciliation_status === 'variance').length,
        investigating:recons.filter(s => s.reconciliation_status === 'investigating').length,
    };

    return (
        <>
        {reconciling && <ReconcileModal so={reconciling} onClose={() => setReconciling(null)} />}
        {resolving   && <ResolveModal   so={resolving}   onClose={() => setResolving(null)} />}

        <div className="p-6 flex flex-col gap-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: 'Matched',       count: counts.matched,        color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800' },
                    { label: 'Pending',       count: counts.pending,        color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/20',     border: 'border-amber-200 dark:border-amber-800' },
                    { label: 'Variance',      count: counts.variance,       color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-950/20',         border: 'border-red-200 dark:border-red-800' },
                    { label: 'Investigating', count: counts.investigating,  color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-950/20',   border: 'border-purple-200 dark:border-purple-800' },
                ].map((s) => (
                    <div key={s.label} className={cn('rounded-xl border p-4', s.bg, s.border)}>
                        <p className={cn('text-2xl font-bold', s.color)}>{s.count}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Variance/Investigating alert banner */}
            {(counts.variance + counts.investigating) > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-4 py-3">
                    <AlertTriangle className="size-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                            {counts.variance + counts.investigating} record{(counts.variance + counts.investigating) > 1 ? 's' : ''} require attention
                        </p>
                        <p className="text-xs text-red-600/80 dark:text-red-500 mt-0.5">
                            Variance flagged entries must be reviewed and resolved before month-end close. Use "Resolve" to log your explanation.
                        </p>
                    </div>
                </div>
            )}

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
                                <th className="px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recons.map((so) => {
                                const rc = reconciliationStatusConfig[so.reconciliation_status as keyof typeof reconciliationStatusConfig] ?? reconciliationStatusConfig.pending;
                                const RcIcon = rc.icon;
                                const hasVariance = so.reconciliation_status === 'variance' || so.reconciliation_status === 'investigating';
                                const note = so.reconciliation_note;
                                return (
                                    <tr key={so.id} className={cn('hover:bg-muted/20 transition-base', hasVariance && 'bg-red-50/30 dark:bg-red-950/10')}>
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium">{so.service_name}</p>
                                            {note && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">{note}</p>}
                                        </td>
                                        <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{so.service_date}</td>
                                        <td className="px-5 py-3.5 text-right tabular-nums font-medium">{formatCurrency(so.recorded_amount)}</td>
                                        <td className="px-5 py-3.5 text-right tabular-nums font-medium">
                                            {so.banked_amount ? formatCurrency(so.banked_amount) : <span className="text-muted-foreground">—</span>}
                                        </td>
                                        <td className={cn('px-5 py-3.5 text-right tabular-nums font-semibold',
                                            so.variance && so.variance < 0 ? 'text-red-500' :
                                            so.variance && so.variance > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>
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
                                            <div className="flex items-center gap-2">
                                                {so.reconciliation_status === 'pending' && (
                                                    <button onClick={() => setReconciling(so)}
                                                        className="text-xs text-primary font-medium hover:underline whitespace-nowrap">
                                                        Reconcile
                                                    </button>
                                                )}
                                                {hasVariance && (
                                                    <>
                                                        <button onClick={() => setResolving(so)}
                                                            className="text-xs text-emerald-600 font-medium hover:underline whitespace-nowrap">
                                                            Resolve
                                                        </button>
                                                        <span className="text-muted-foreground/40">·</span>
                                                        <button onClick={() => setReconciling(so)}
                                                            className="text-xs text-muted-foreground hover:underline whitespace-nowrap">
                                                            Update
                                                        </button>
                                                    </>
                                                )}
                                                {so.reconciliation_status === 'matched' && (
                                                    <button onClick={() => setReconciling(so)}
                                                        className="text-xs text-muted-foreground hover:underline whitespace-nowrap">
                                                        Edit
                                                    </button>
                                                )}
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
        </>
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


