import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    CreditCard,
    HandHeart,
    HeartHandshake,
    Sparkles,
    Star,
    TrendingUp,
    Users,
    UserSearch,
    Zap,
} from 'lucide-react';
import { KpiCard } from '@/components/kpi-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber, type ActivityFeedItem } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

const activityTypeConfig: Record<ActivityFeedItem['type'], { color: string; bg: string; icon: string }> = {
    soul_won:      { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: '✝' },
    finance:       { color: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-100 dark:bg-amber-900/30',   icon: '₦' },
    attendance:    { color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-900/30',     icon: '🙌' },
    follow_up:     { color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: '↗' },
    care:          { color: 'text-rose-700 dark:text-rose-400',     bg: 'bg-rose-100 dark:bg-rose-900/30',     icon: '♥' },
    member_joined: { color: 'text-teal-700 dark:text-teal-400',     bg: 'bg-teal-100 dark:bg-teal-900/30',     icon: '+' },
    department:    { color: 'text-slate-700 dark:text-slate-400',   bg: 'bg-slate-100 dark:bg-slate-800',      icon: '◈' },
};

const priorityConfig = {
    urgent: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',       dot: 'bg-red-500' },
    high:   { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dot: 'bg-orange-500' },
    medium: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   dot: 'bg-blue-500' },
    low:    { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',  dot: 'bg-slate-400' },
};

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

const verseOfTheDay = {
    text: '"Go into all the world and preach the gospel to all creation."',
    ref: 'Mark 16:15',
};

export default function Dashboard() {
    type DashProps = { stats: any; funnelData: any[]; financeMonthly: any[]; urgentFollowUps: any[]; openCareCases: any[]; openCareCasesCount: number; urgentCareCasesCount: number; activityFeed: any[]; churchName: string };
    const { stats, funnelData, financeMonthly, urgentFollowUps, openCareCases, openCareCasesCount, urgentCareCasesCount, activityFeed, churchName } = usePage<DashProps>().props;
    const unreadAlerts = openCareCases.filter((c: any) => c.priority === "urgent" || c.priority === "high").slice(0, 3);
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6 animate-fade-up">

                {/* ── Welcome Banner ─────────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-amber-700 p-6 text-white shadow-lg">
                    {/* decorative circles */}
                    <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/5" />
                    <div className="pointer-events-none absolute -bottom-8 right-24 size-32 rounded-full bg-white/5" />

                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-yellow-300" />
                                <span className="text-sm font-medium text-white/80">
                                    {getGreeting()}, Pastor Admin
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{churchName}</h1>
                            <p className="text-sm text-white/70">
                                {new Date().toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · Main Campus
                            </p>
                        </div>

                        {/* Verse of the day */}
                        <div className="flex max-w-xs flex-col gap-1 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                            <div className="flex items-center gap-1.5 text-xs text-white/70">
                                <BookOpen className="size-3" />
                                Verse of the Day
                            </div>
                            <p className="text-sm font-medium leading-snug text-white/95 italic">{verseOfTheDay.text}</p>
                            <span className="text-xs text-yellow-300 font-semibold">{verseOfTheDay.ref}</span>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="relative mt-5 flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" className="h-8 gap-1.5 bg-white/15 text-white border-white/20 hover:bg-white/25" asChild>
                            <Link href="/finance/service-entry">
                                <Zap className="size-3.5" />
                                Service Entry
                            </Link>
                        </Button>
                        <Button size="sm" variant="secondary" className="h-8 gap-1.5 bg-white/15 text-white border-white/20 hover:bg-white/25" asChild>
                            <Link href="/evangelism">
                                <HandHeart className="size-3.5" />
                                Log Members Reached
                            </Link>
                        </Button>
                        <Button size="sm" variant="secondary" className="h-8 gap-1.5 bg-white/15 text-white border-white/20 hover:bg-white/25" asChild>
                            <Link href="/members?create=1">
                                <Users className="size-3.5" />
                                Add Member
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── KPI Grid ───────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6 stagger-children">
                    <KpiCard
                        title="Members Reached"
                        value={formatNumber(stats.soulsWon?.value ?? 0)}
                        trend={stats.soulsWon?.trend ?? 0}
                        trendLabel="vs last month"
                        sparkline={[]}
                        sparklineColor="oklch(0.52 0.18 162)"
                        icon={Star}
                        badge="This Month"
                        badgeColor="green"
                    />
                    <KpiCard
                        title="Active Members"
                        value={formatNumber(stats.activeMembers?.value ?? 0)}
                        trend={stats.activeMembers?.trend ?? 0}
                        trendLabel="vs last month"
                        sparkline={[]}
                        sparklineColor="oklch(0.55 0.20 265)"
                        icon={Users}
                    />
                    <KpiCard
                        title="Pending Follow-Ups"
                        value={formatNumber(stats.pendingFollowUps?.value ?? 0)}
                        trend={stats.pendingFollowUps?.trend ?? 0}
                        trendLabel="vs last week"
                        icon={UserSearch}
                        badge={`${stats.pendingFollowUps?.urgent ?? 0} Urgent`}
                        badgeColor="red"
                        subtitle="Requires attention"
                    />
                    <KpiCard
                        title="Monthly Income"
                        value={formatCurrency(stats.monthlyIncome?.value ?? 0)}
                        trend={stats.monthlyIncome?.trend ?? 0}
                        trendLabel="vs last month"
                        sparkline={[]}
                        sparklineColor="oklch(0.65 0.16 84)"
                        icon={CreditCard}
                    />
                    <KpiCard
                        title="Conversion Rate"
                        value={`${stats.conversionRate?.value ?? 0}%`}
                        trend={stats.conversionRate?.trend ?? 0}
                        trendLabel="vs last month"
                        icon={TrendingUp}
                        subtitle="Members Reached → Established"
                    />
                    <KpiCard
                        title="Attendance"
                        value={formatNumber(stats.attendance?.value ?? 0)}
                        trend={stats.attendance?.trend ?? 0}
                        trendLabel="vs last Sunday"
                        sparkline={stats.attendance?.sparkline ?? []}
                        sparklineColor="oklch(0.60 0.15 230)"
                        icon={Users}
                        subtitle="Last Sunday service"
                    />
                </div>

                {/* ── Main Content Grid ──────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Left 2 cols */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Escalation Alerts */}
                        {unreadAlerts.length > 0 && (
                            <div className="card-base p-4 border-l-4 border-l-red-500 bg-red-50/60 dark:bg-red-950/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="size-4 text-red-500" />
                                    <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                                        {unreadAlerts.length} Alerts Requiring Attention
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {unreadAlerts.map((n: any) => (
                                        <div key={n.id} className="flex items-start gap-2.5">
                                            <div className="size-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                            <div className="min-w-0">
                                                <span className="text-sm font-medium text-foreground">{n.name}: </span>
                                                <span className="text-sm text-muted-foreground capitalize">{n.type?.replace('_', ' ')} — {n.priority} priority</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" size="sm" className="mt-3 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950/40 gap-1.5 px-2">
                                    View all alerts <ArrowRight className="size-3" />
                                </Button>
                            </div>
                        )}

                        {/* Priority Follow-Ups */}
                        <div className="card-base overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <UserSearch className="size-4 text-muted-foreground" />
                                    <h3 className="text-sm font-semibold">Priority Follow-Ups</h3>
                                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                        {urgentFollowUps.length}
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
                                    <Link href="/followups">
                                        View all <ArrowRight className="size-3" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="divide-y divide-border">
                                {urgentFollowUps.map((fu: any) => {
                                    const pc = priorityConfig[fu.priority as keyof typeof priorityConfig] ?? priorityConfig.medium;
                                    return (
                                        <div key={fu.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-base cursor-pointer group">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                {fu.initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium truncate">{fu.name}</span>
                                                    <span className={cn('inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 font-medium', pc.color)}>
                                                        <span className={cn('size-1.5 rounded-full', pc.dot)} />
                                                        {fu.priority}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                    {fu.next_action} · Assigned: {fu.assigned_to}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-xs text-muted-foreground">{fu.last_contact}</span>
                                                <p className="text-xs text-muted-foreground mt-0.5">{fu.days_in_stage}d in stage</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Live Activity Feed */}
                        <div className="card-base overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <Zap className="size-4 text-muted-foreground" />
                                    <h3 className="text-sm font-semibold">Live Activity</h3>
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                        <span className="size-1.5 rounded-full bg-emerald-500 pulse-dot" />
                                        Live
                                    </span>
                                </div>
                            </div>
                            <div className="divide-y divide-border">
                                {activityFeed.map((item: any) => {
                                    const cfg = activityTypeConfig[item.type as ActivityFeedItem['type']] ?? activityTypeConfig.member_joined;
                                    return (
                                        <div key={item.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/20 transition-base">
                                            <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold mt-0.5', cfg.bg, cfg.color)}>
                                                {cfg.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium leading-snug">{item.title}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                                                <p className="text-xs text-muted-foreground/70 mt-1">
                                                    by {item.actor} · {new Date(item.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right col */}
                    <div className="flex flex-col gap-6">

                        {/* Evangelism Funnel */}
                        <div className="card-base overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="size-4 text-muted-foreground" />
                                    <h3 className="text-sm font-semibold">Evangelism Funnel</h3>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
                                    <Link href="/evangelism">
                                        View <ArrowRight className="size-3" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="p-5 flex flex-col gap-3">
                                {funnelData.map((stage: any, i: number) => (
                                    <div key={stage.stage} className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground font-medium">{stage.label ?? stage.stage}</span>
                                            <span className="font-semibold tabular-nums">{stage.count}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700 ease-out"
                                                style={{
                                                    width: `${stage.pct}%`,
                                                    backgroundColor: stage.color,
                                                    transitionDelay: `${i * 80}ms`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                                    <span>Total tracked this month</span>
                                    <span className="font-semibold text-foreground">{funnelData[0]?.count ?? 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Finance Snapshot */}
                        <div className="card-base overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="size-4 text-muted-foreground" />
                                    <h3 className="text-sm font-semibold">Finance Snapshot</h3>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
                                    <Link href="/finance">View <ArrowRight className="size-3" /></Link>
                                </Button>
                            </div>
                            <div className="p-5 flex flex-col gap-4">
                                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Income</p>
                                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                                            {formatCurrency(stats.monthlyIncome?.value ?? 0)}
                                        </p>
                                    </div>
                                    <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                        <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Expenses', value: formatCurrency(stats.monthlyExpenses?.value ?? 0), cls: 'text-red-500' },
                                        { label: 'Net Balance', value: formatCurrency(((stats.monthlyIncome?.value ?? 0) - (stats.monthlyExpenses?.value ?? 0))), cls: 'text-primary' },
                                        { label: 'Cash', value: formatCurrency(0), cls: 'text-foreground' },
                                        { label: 'Bank', value: formatCurrency(0), cls: 'text-foreground' },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-xl bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">{item.label}</p>
                                            <p className={cn('text-sm font-bold tabular-nums mt-0.5', item.cls)}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Care Cases */}
                        <div className="card-base overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <HeartHandshake className="size-4 text-rose-500" />
                                    <h3 className="text-sm font-semibold">Open Care Cases</h3>
                                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">{openCareCasesCount}</Badge>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
                                    <Link href="/care">View <ArrowRight className="size-3" /></Link>
                                </Button>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                {openCareCases.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">No open care cases</p>
                                ) : openCareCases.map((c: any) => {
                                    const pc = priorityConfig[c.priority as keyof typeof priorityConfig] ?? priorityConfig.medium;
                                    return (
                                        <div key={c.id} className="flex items-center gap-2.5 rounded-xl hover:bg-muted/40 px-3 py-2 transition-base cursor-pointer">
                                            <div className={cn('size-2 rounded-full shrink-0', pc.dot)} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{c.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{c.type?.replace('_', ' ')}</p>
                                            </div>
                                            <span className={cn('text-xs rounded-full px-2 py-0.5 font-medium', pc.color)}>
                                                {c.priority}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};


