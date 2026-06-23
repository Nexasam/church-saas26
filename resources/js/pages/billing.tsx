import { Head } from '@inertiajs/react';
import {
    ArrowUpRight,
    Check,
    CheckCircle2,
    CreditCard,
    Download,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

const plans = [
    {
        id: 'starter',
        name: 'Starter',
        price: 15000,
        period: 'month',
        description: 'Perfect for small churches getting started',
        members: 200,
        features: ['Up to 200 members', 'Follow-up tracking', 'Basic finance', 'SMS (100/month)', '1 admin user'],
        current: false,
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 35000,
        period: 'month',
        description: 'For growing churches with advanced needs',
        members: 1000,
        features: ['Up to 1,000 members', 'Full CRM follow-ups', 'Finance + reconciliation', 'SMS (500/month)', '5 admin users', 'Evangelism funnel', 'Care cases module', 'Department management'],
        current: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 85000,
        period: 'month',
        description: 'For multi-campus churches with full control',
        members: 99999,
        features: ['Unlimited members', 'Multi-campus support', 'Advanced analytics', 'Unlimited SMS', 'Unlimited admins', 'API access', 'Custom integrations', 'Dedicated support', 'White-label option'],
        current: false,
    },
];

const invoices = [
    { id: 'INV-2026-006', date: '2026-06-01', amount: 35000, status: 'paid', period: 'June 2026' },
    { id: 'INV-2026-005', date: '2026-05-01', amount: 35000, status: 'paid', period: 'May 2026' },
    { id: 'INV-2026-004', date: '2026-04-01', amount: 35000, status: 'paid', period: 'April 2026' },
    { id: 'INV-2026-003', date: '2026-03-01', amount: 35000, status: 'paid', period: 'March 2026' },
    { id: 'INV-2026-002', date: '2026-02-01', amount: 15000, status: 'paid', period: 'February 2026' },
];

export default function Billing() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const currentPlan = plans.find((p) => p.current)!;

    const formatNGN = (n: number) =>
        new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

    return (
        <>
            <Head title="Billing" />
            <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
                <div className="p-6 flex flex-col gap-8 max-w-5xl">

                    {/* Current Plan */}
                    <div className="card-base p-5 border-l-4 border-l-primary">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                    <Zap className="size-5 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{currentPlan.name} Plan</h3>
                                        <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">Current</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5">{currentPlan.description}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                        <span>Next billing: <strong className="text-foreground">July 1, 2026</strong></span>
                                        <span>Up to {currentPlan.members.toLocaleString()} members</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-2xl font-bold tabular-nums">{formatNGN(currentPlan.price)}</p>
                                <p className="text-xs text-muted-foreground">/ month</p>
                            </div>
                        </div>
                    </div>

                    {/* Billing cycle toggle */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold">Change Plan</h2>
                            <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={cn('px-3 py-1 rounded-md text-xs font-medium transition-base', billingCycle === 'monthly' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground')}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={cn('px-3 py-1 rounded-md text-xs font-medium transition-base flex items-center gap-1', billingCycle === 'yearly' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground')}
                                >
                                    Yearly
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded px-1">−20%</span>
                                </button>
                            </div>
                        </div>

                        {/* Plan cards */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {plans.map((plan) => {
                                const price = billingCycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price;
                                return (
                                    <div
                                        key={plan.id}
                                        className={cn(
                                            'card-base p-5 flex flex-col gap-4 relative transition-smooth',
                                            plan.current && 'border-primary/50 shadow-sm',
                                            plan.id === 'growth' && !plan.current && 'border-primary/30',
                                        )}
                                    >
                                        {plan.current && (
                                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium rounded-full px-3 py-0.5">
                                                Current Plan
                                            </div>
                                        )}
                                        {plan.id === 'enterprise' && (
                                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-medium rounded-full px-3 py-0.5">
                                                Best Value
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="font-semibold">{plan.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                                        </div>

                                        <div className="flex items-end gap-1">
                                            <span className="text-3xl font-bold tabular-nums">{formatNGN(price)}</span>
                                            <span className="text-xs text-muted-foreground mb-1">/{billingCycle === 'yearly' ? 'mo, billed annually' : 'month'}</span>
                                        </div>

                                        <ul className="flex flex-col gap-2 flex-1">
                                            {plan.features.map((f) => (
                                                <li key={f} className="flex items-start gap-2 text-xs">
                                                    <Check className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                                    <span className="text-muted-foreground">{f}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            variant={plan.current ? 'outline' : 'default'}
                                            className="w-full mt-2"
                                            size="sm"
                                            disabled={plan.current}
                                        >
                                            {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Payment method */}
                    <div className="card-base p-5">
                        <h3 className="text-sm font-semibold mb-4">Payment Method</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
                                    <CreditCard className="size-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Paystack · •••• 4521</p>
                                    <p className="text-xs text-muted-foreground">Expires 09/2028</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="h-8">Update</Button>
                        </div>
                    </div>

                    {/* Invoices */}
                    <div className="card-base overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                            <h3 className="text-sm font-semibold">Invoice History</h3>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
                                <Download className="size-3.5" />
                                Download all
                            </Button>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    {['Invoice', 'Period', 'Date', 'Amount', 'Status', ''].map((h) => (
                                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-muted/20 transition-base">
                                        <td className="px-5 py-3 font-medium text-primary">{inv.id}</td>
                                        <td className="px-5 py-3 text-muted-foreground">{inv.period}</td>
                                        <td className="px-5 py-3 text-muted-foreground">{inv.date}</td>
                                        <td className="px-5 py-3 font-semibold tabular-nums">{formatNGN(inv.amount)}</td>
                                        <td className="px-5 py-3">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <CheckCircle2 className="size-3" />
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Button variant="ghost" size="icon" className="size-7">
                                                <Download className="size-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

Billing.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Billing', href: '/billing' },
    ],
};
