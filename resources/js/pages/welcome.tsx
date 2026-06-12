import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    HeartHandshake,
    LayoutDashboard,
    MessageSquare,
    Shield,
    Star,
    TrendingUp,
    Users,
    UserSearch,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── tiny inline components so file stays self-contained ─── */
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium', className)}>
            {children}
        </span>
    );
}

function Btn({
    href,
    variant = 'primary',
    children,
    className,
}: {
    href: string;
    variant?: 'primary' | 'outline' | 'ghost';
    children: React.ReactNode;
    className?: string;
}) {
    const base = 'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-150';
    const styles = {
        primary: 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm',
        outline: 'border border-border bg-background hover:bg-muted text-foreground',
        ghost: 'text-muted-foreground hover:text-foreground',
    };
    return (
        <Link href={href} className={cn(base, styles[variant], className)}>
            {children}
        </Link>
    );
}

/* ─── Data ─── */
const features = [
    {
        icon: LayoutDashboard,
        title: 'Live Dashboard',
        desc: 'KPI cards, activity feed, and church health metrics refresh in real-time.',
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
        icon: UserSearch,
        title: 'CRM Follow-Ups',
        desc: 'Kanban pipeline from first visit to established member. Never lose a soul.',
        color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    },
    {
        icon: TrendingUp,
        title: 'Evangelism Funnel',
        desc: 'Visual funnel tracking every Members Reached through to full establishment.',
        color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
        icon: CreditCard,
        title: 'Finance Intelligence',
        desc: 'Service offering entry, bank reconciliation with variance detection.',
        color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    },
    {
        icon: HeartHandshake,
        title: 'Pastoral Care',
        desc: 'Track hospital visits, bereavement, counseling, and prayer needs.',
        color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30',
    },
    {
        icon: Users,
        title: 'Member CRM',
        desc: 'Full profiles with timeline, attendance rate, departments, and notes.',
        color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30',
    },
    {
        icon: MessageSquare,
        title: 'Bulk SMS',
        desc: 'Personalized campaigns to any segment — members, workers, visitors.',
        color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
    },
    {
        icon: Shield,
        title: 'Roles & Permissions',
        desc: 'Fine-grained access for admins, pastors, finance officers, and workers.',
        color: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
    },
];

const plans = [
    {
        name: 'Starter',
        price: '₦15,000',
        period: '/mo',
        desc: 'Small churches getting started',
        members: 'Up to 200 members',
        features: ['Dashboard & KPIs', 'Follow-up tracking', 'Basic finance', 'SMS (100/mo)', '1 admin user'],
        cta: 'Get started',
        highlight: false,
    },
    {
        name: 'Growth',
        price: '₦35,000',
        period: '/mo',
        desc: 'Growing churches with full needs',
        members: 'Up to 1,000 members',
        features: ['Everything in Starter', 'Full CRM follow-ups', 'Finance + reconciliation', 'SMS (500/mo)', '5 admins', 'Evangelism funnel', 'Care cases', 'Departments'],
        cta: 'Start free trial',
        highlight: true,
    },
    {
        name: 'Enterprise',
        price: '₦85,000',
        period: '/mo',
        desc: 'Multi-campus churches',
        members: 'Unlimited members',
        features: ['Everything in Growth', 'Multi-campus support', 'Unlimited SMS', 'Unlimited admins', 'API access', 'Custom integrations', 'Dedicated support'],
        cta: 'Contact us',
        highlight: false,
    },
];

const stats = [
    { value: '2,400+', label: 'Churches' },
    { value: '820K+', label: 'Members tracked' },
    { value: '₦1.2B+', label: 'Finance recorded' },
    { value: '99.9%', label: 'Uptime SLA' },
];

const testimonials = [
    {
        quote: "Church OS transformed how we manage follow-ups. We haven't missed a single soul since.",
        name: 'Pastor Michael Adeyemi',
        church: 'Grace Assembly, Lagos',
        initials: 'MA',
    },
    {
        quote: "The finance reconciliation feature alone saved us hours every Sunday. Absolutely essential.",
        name: 'Deacon Samuel Okafor',
        church: 'Lighthouse Church, Abuja',
        initials: 'SO',
    },
    {
        quote: "From the Kanban follow-up board to the evangelism funnel — it's exactly what a modern church needs.",
        name: 'Pastor Ruth Okonkwo',
        church: 'New Life Assembly, PH',
        initials: 'RO',
    },
];

export default function Welcome() {
    const { auth } = usePage().props as { auth: { user?: { name: string } } };

    return (
        <>
            <Head title="Church OS — Enterprise Church Management Platform" />

            <div className="min-h-screen bg-background text-foreground antialiased">

                {/* ── NAV ── */}
                <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">G</div>
                            <span className="font-semibold text-sm tracking-tight">Church OS</span>
                        </Link>

                        {/* Links */}
                        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
                            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <Btn href="/dashboard" variant="primary">
                                    Dashboard <ArrowRight className="size-3.5" />
                                </Btn>
                            ) : (
                                <>
                                    <Btn href="/login" variant="ghost" className="hidden sm:inline-flex">Sign in</Btn>
                                    <Btn href="/register" variant="primary">
                                        Get started free
                                    </Btn>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section className="relative overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                        <div
                            className="absolute inset-0 opacity-[0.025]"
                            style={{
                                backgroundImage: `radial-gradient(oklch(0.5 0.1 265) 1px, transparent 1px)`,
                                backgroundSize: '32px 32px',
                            }}
                        />
                    </div>

                    <div className="mx-auto max-w-5xl px-6 pt-20 pb-20 text-center">
                        <Badge className="mb-6 border-primary/30 bg-primary/5 text-primary">
                            <Zap className="size-3" />
                            Enterprise Church Management
                        </Badge>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
                            Run your church like a{' '}
                            <span className="text-primary">top-tier organisation</span>
                        </h1>

                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed mb-10">
                            The complete operating system for modern churches. CRM follow-ups, finance intelligence,
                            evangelism tracking, pastoral care, and bulk SMS — all in one place.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Btn href="/register" variant="primary" className="h-11 px-8 text-base">
                                Start for free <ArrowRight className="size-4" />
                            </Btn>
                            <Btn href="/login" variant="outline" className="h-11 px-8 text-base">
                                Sign in to dashboard
                            </Btn>
                        </div>

                        <p className="mt-4 text-xs text-muted-foreground">No credit card required · 14-day free trial</p>

                        {/* Stats strip */}
                        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
                            {stats.map((s) => (
                                <div key={s.label} className="bg-background py-5 px-6 text-center">
                                    <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── DASHBOARD PREVIEW ── */}
                <section className="mx-auto max-w-5xl px-6 pb-20">
                    <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden shadow-xl">
                        {/* Fake browser chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/80">
                            <div className="flex gap-1.5">
                                <div className="size-3 rounded-full bg-red-400/70" />
                                <div className="size-3 rounded-full bg-amber-400/70" />
                                <div className="size-3 rounded-full bg-emerald-400/70" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="h-5 max-w-48 mx-auto rounded-md bg-muted flex items-center justify-center">
                                    <span className="text-[10px] text-muted-foreground">localhost:8000/dashboard</span>
                                </div>
                            </div>
                        </div>
                        {/* Dashboard preview content */}
                        <div className="p-5 grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {[
                                { label: 'Members Reached', val: '47', color: 'text-emerald-600', trend: '↑12.5%' },
                                { label: 'Active Members', val: '842', color: 'text-primary', trend: '↑4.2%' },
                                { label: 'Follow-Ups', val: '38', color: 'text-amber-600', trend: '↓8.3%' },
                                { label: 'Monthly Income', val: '₦4.2M', color: 'text-amber-600', trend: '↑18.7%' },
                                { label: 'Conversion', val: '68.4%', color: 'text-purple-600', trend: '↑5.2%' },
                                { label: 'Attendance', val: '634', color: 'text-blue-600', trend: '↑2.8%' },
                            ].map((k) => (
                                <div key={k.label} className="rounded-xl border border-border bg-card p-3">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">{k.label}</p>
                                    <p className={cn('text-lg font-bold tabular-nums', k.color)}>{k.val}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{k.trend}</p>
                                </div>
                            ))}
                        </div>
                        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Activity feed preview */}
                            <div className="sm:col-span-2 rounded-xl border border-border bg-card p-4">
                                <p className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Live Activity</p>
                                {[
                                    { dot: 'bg-emerald-500', text: 'Bro. Samuel won 2 souls at Friday outreach', time: '16:30' },
                                    { dot: 'bg-amber-500', text: 'Sunday offering ₦1,160,000 recorded and banked', time: '14:00' },
                                    { dot: 'bg-blue-500', text: '634 members attended Sunday service', time: '13:00' },
                                    { dot: 'bg-rose-500', text: 'New care case: Bro. Eze — hospitalization', time: '18:00' },
                                ].map((item) => (
                                    <div key={item.text} className="flex items-start gap-2.5 py-1.5">
                                        <div className={cn('size-1.5 rounded-full mt-1.5 shrink-0', item.dot)} />
                                        <p className="text-xs text-muted-foreground flex-1 leading-relaxed line-clamp-1">{item.text}</p>
                                        <span className="text-[10px] text-muted-foreground/60 shrink-0">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Funnel preview */}
                            <div className="rounded-xl border border-border bg-card p-4">
                                <p className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Evangelism Funnel</p>
                                {[
                                    { stage: 'Members Reached', count: 47, pct: 100, color: 'bg-primary' },
                                    { stage: 'Visited', count: 38, pct: 81, color: 'bg-blue-500' },
                                    { stage: 'Member Class', count: 29, pct: 62, color: 'bg-emerald-500' },
                                    { stage: 'Worker', count: 22, pct: 47, color: 'bg-amber-500' },
                                    { stage: 'Established', count: 18, pct: 38, color: 'bg-teal-500' },
                                ].map((s) => (
                                    <div key={s.stage} className="mb-2">
                                        <div className="flex justify-between text-[10px] mb-0.5">
                                            <span className="text-muted-foreground">{s.stage}</span>
                                            <span className="font-medium">{s.count}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div className={cn('h-full rounded-full', s.color)} style={{ width: `${s.pct}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ── */}
                <section id="features" className="mx-auto max-w-5xl px-6 py-20">
                    <div className="text-center mb-14">
                        <Badge className="mb-4 border-border bg-muted text-muted-foreground">Platform</Badge>
                        <h2 className="text-3xl font-bold tracking-tight mb-3">Everything your church needs</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Built for how modern churches actually operate — from Sunday service to midweek follow-up.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={f.title}
                                    className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-default"
                                >
                                    <div className={cn('flex size-9 items-center justify-center rounded-lg mb-3 transition-transform duration-200 group-hover:scale-105', f.color)}>
                                        <Icon className="size-4" />
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section className="bg-muted/40 border-y border-border py-20">
                    <div className="mx-auto max-w-5xl px-6">
                        <div className="text-center mb-14">
                            <Badge className="mb-4 border-border bg-background text-muted-foreground">Workflow</Badge>
                            <h2 className="text-3xl font-bold tracking-tight mb-3">From Members Reached to established member</h2>
                            <p className="text-muted-foreground">The complete lifecycle, tracked automatically.</p>
                        </div>
                        <div className="relative">
                            {/* connector line */}
                            <div className="absolute top-6 left-0 right-0 h-px bg-border hidden sm:block mx-10" />
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative">
                                {[
                                    { step: '01', icon: Star, label: 'Members Reached', desc: 'Logged by evangelist', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                                    { step: '02', icon: UserSearch, label: 'First Visit', desc: 'Auto follow-up created', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                                    { step: '03', icon: MessageSquare, label: 'Follow-Up', desc: 'CRM tracks contacts', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
                                    { step: '04', icon: Users, label: 'Membership Class', desc: 'Progress tracked live', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
                                    { step: '05', icon: CheckCircle2, label: 'Established', desc: 'Full member profile', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
                                ].map((s) => {
                                    const Icon = s.icon;
                                    return (
                                        <div key={s.step} className="flex flex-col items-center text-center gap-3">
                                            <div className={cn('relative z-10 flex size-12 items-center justify-center rounded-full border-2 border-background shadow-sm', s.color)}>
                                                <Icon className="size-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium">{s.step}</p>
                                                <p className="text-sm font-semibold mt-0.5">{s.label}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ── */}
                <section id="testimonials" className="mx-auto max-w-5xl px-6 py-20">
                    <div className="text-center mb-14">
                        <Badge className="mb-4 border-border bg-muted text-muted-foreground">Testimonials</Badge>
                        <h2 className="text-3xl font-bold tracking-tight mb-3">Trusted by church leaders</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        {testimonials.map((t) => (
                            <div key={t.name} className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.quote}"</p>
                                <div className="flex items-center gap-3 pt-3 border-t border-border">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                        {t.initials}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">{t.church}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── PRICING ── */}
                <section id="pricing" className="bg-muted/40 border-y border-border py-20">
                    <div className="mx-auto max-w-5xl px-6">
                        <div className="text-center mb-14">
                            <Badge className="mb-4 border-border bg-background text-muted-foreground">Pricing</Badge>
                            <h2 className="text-3xl font-bold tracking-tight mb-3">Simple, honest pricing</h2>
                            <p className="text-muted-foreground">No surprises. Cancel anytime.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 max-w-4xl mx-auto">
                            {plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={cn(
                                        'relative rounded-xl border p-6 flex flex-col gap-5 bg-card',
                                        plan.highlight ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-border',
                                    )}
                                >
                                    {plan.highlight && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold rounded-full px-3 py-0.5">
                                            Most popular
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-base">{plan.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
                                        <div className="flex items-end gap-1 mt-3">
                                            <span className="text-3xl font-bold tabular-nums">{plan.price}</span>
                                            <span className="text-sm text-muted-foreground mb-1">{plan.period}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">{plan.members}</p>
                                    </div>

                                    <ul className="flex flex-col gap-2 flex-1">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-start gap-2 text-xs">
                                                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground">{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href="/login"
                                        className={cn(
                                            'flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium transition-all',
                                            plan.highlight
                                                ? 'bg-primary text-primary-foreground hover:opacity-90'
                                                : 'border border-border hover:bg-muted',
                                        )}
                                    >
                                        {plan.cta} <ChevronRight className="size-3.5" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA BAND ── */}
                <section className="mx-auto max-w-5xl px-6 py-20">
                    <div className="relative rounded-2xl overflow-hidden bg-[oklch(0.14_0.04_265)] p-12 text-center">
                        {/* glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/30 blur-3xl -translate-y-1/2 pointer-events-none" />
                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                                Ready to transform your church operations?
                            </h2>
                            <p className="text-[oklch(0.6_0.05_265)] mb-8 max-w-lg mx-auto">
                                Join over 2,400 churches already running on Church OS. Get started in minutes.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 h-11 px-8 rounded-xl bg-white text-[oklch(0.14_0.04_265)] font-semibold text-sm hover:bg-white/90 transition-colors"
                                >
                                    Create free account <ArrowRight className="size-4" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 h-11 px-8 rounded-xl border border-white/20 text-white font-medium text-sm hover:bg-white/10 transition-colors"
                                >
                                    Sign in instead
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="border-t border-border bg-muted/20">
                    <div className="mx-auto max-w-5xl px-6 py-10">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">G</div>
                                <span className="font-semibold text-sm">Church OS</span>
                            </div>
                            <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                                <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
                                <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
                                <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                © {new Date().getFullYear()} Church OS. Built for the Kingdom.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
