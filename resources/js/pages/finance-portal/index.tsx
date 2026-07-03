import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, AlertTriangle, TrendingUp, CreditCard, Wallet, BarChart3, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

export default function FinancePortal() {
    const { summary, recentTransactions, pendingReconciliations, user } = usePage<any>().props;

    const fs = summary ?? { totalIncome: 0, totalExpenses: 0, netBalance: 0, cashAmount: 0, bankAmount: 0 };

    return (
        <>
            <Head title="Finance Portal" />
            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Finance Portal</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Welcome back, {user?.name?.split(' ')[0]} · Finance Officer
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/finance"
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                            Open Finance Module <ChevronRight className="size-3.5" />
                        </Link>
                    </div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        { label: 'Total Income',   value: formatCurrency(fs.totalIncome),   icon: ArrowUpRight,   color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                        { label: 'Total Expenses', value: formatCurrency(fs.totalExpenses), icon: ArrowDownRight, color: 'text-red-500',     bg: 'bg-red-100 dark:bg-red-900/30' },
                        { label: 'Net Balance',    value: formatCurrency(fs.netBalance),    icon: Wallet,         color: 'text-primary',     bg: 'bg-primary/10' },
                        { label: 'Cash on Hand',   value: formatCurrency(fs.cashAmount),    icon: CreditCard,     color: 'text-amber-600',   bg: 'bg-amber-100 dark:bg-amber-900/30' },
                    ].map(s => (
                        <div key={s.label} className="card-base p-4 flex items-center gap-3">
                            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', s.bg)}>
                                <s.icon className={cn('size-5', s.color)} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                                <p className={cn('text-lg font-bold tabular-nums truncate', s.color)}>{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending reconciliations */}
                    <div className="card-base overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="size-4 text-amber-500" />
                                <h3 className="text-sm font-semibold">Pending Reconciliation</h3>
                                {(pendingReconciliations ?? []).length > 0 && (
                                    <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                                        {(pendingReconciliations ?? []).length}
                                    </span>
                                )}
                            </div>
                            <Link href="/finance?tab=reconciliation" className="text-xs text-primary hover:underline">View all</Link>
                        </div>
                        <div className="divide-y divide-border">
                            {(pendingReconciliations ?? []).length === 0 ? (
                                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                                    <CheckCircle2 className="size-4 text-emerald-500" />
                                    <p className="text-sm">All offerings reconciled</p>
                                </div>
                            ) : (pendingReconciliations ?? []).map((r: any) => (
                                <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20">
                                    <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg',
                                        r.reconciliation_status === 'investigating' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>
                                        <Clock className={cn('size-4', r.reconciliation_status === 'investigating' ? 'text-purple-600' : 'text-amber-600')} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{r.service_name}</p>
                                        <p className="text-xs text-muted-foreground">{r.service_date}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-semibold tabular-nums">{formatCurrency(r.recorded_amount)}</p>
                                        {r.variance != null && (
                                            <p className={cn('text-xs font-medium tabular-nums', r.variance < 0 ? 'text-red-500' : 'text-emerald-600')}>
                                                {r.variance < 0 ? '−' : '+'}{formatCurrency(Math.abs(r.variance))}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent transactions */}
                    <div className="card-base overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="size-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold">Recent Transactions</h3>
                            </div>
                            <Link href="/finance" className="text-xs text-primary hover:underline">View all</Link>
                        </div>
                        <div className="divide-y divide-border">
                            {(recentTransactions ?? []).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
                            ) : (recentTransactions ?? []).slice(0, 8).map((txn: any) => (
                                <div key={txn.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/20">
                                    <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg text-xs',
                                        txn.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500')}>
                                        {txn.type === 'income' ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{txn.description}</p>
                                        <p className="text-xs text-muted-foreground">{txn.category} · {txn.date}</p>
                                    </div>
                                    <span className={cn('text-sm font-semibold tabular-nums shrink-0',
                                        txn.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

FinancePortal.layout = {
    breadcrumbs: [{ title: 'Finance Portal', href: '/finance-portal' }],
};
