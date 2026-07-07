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

const WEEKLY_VERSES = [
    { text: '"Go into all the world and preach the gospel to all creation."', ref: 'Mark 16:15' },
    { text: '"I can do all things through Christ who strengthens me."', ref: 'Philippians 4:13' },
    { text: '"For God so loved the world that he gave his one and only Son."', ref: 'John 3:16' },
    { text: '"Trust in the LORD with all your heart and lean not on your own understanding."', ref: 'Proverbs 3:5' },
    { text: '"The LORD is my shepherd; I shall not want."', ref: 'Psalm 23:1' },
    { text: '"But seek first his kingdom and his righteousness, and all these things will be given to you."', ref: 'Matthew 6:33' },
    { text: '"Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go."', ref: 'Joshua 1:9' },
    { text: '"And we know that in all things God works for the good of those who love him."', ref: 'Romans 8:28' },
    { text: '"The thief comes only to steal and kill and destroy; I have come that they may have life, and have it to the full."', ref: 'John 10:10' },
    { text: '"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."', ref: 'Philippians 4:6' },
    { text: '"For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you."', ref: 'Jeremiah 29:11' },
    { text: '"Come to me, all you who are weary and burdened, and I will give you rest."', ref: 'Matthew 11:28' },
    { text: '"The name of the LORD is a fortified tower; the righteous run to it and are safe."', ref: 'Proverbs 18:10' },
    { text: '"No weapon forged against you will prevail, and you will refute every tongue that accuses you."', ref: 'Isaiah 54:17' },
    { text: '"With man this is impossible, but with God all things are possible."', ref: 'Matthew 19:26' },
    { text: '"If God is for us, who can be against us?"', ref: 'Romans 8:31' },
    { text: '"Your word is a lamp for my feet, a light on my path."', ref: 'Psalm 119:105' },
    { text: '"The LORD bless you and keep you; the LORD make his face shine on you and be gracious to you."', ref: 'Numbers 6:24-25' },
    { text: '"Delight yourself in the LORD, and he will give you the desires of your heart."', ref: 'Psalm 37:4' },
    { text: '"Cast all your anxiety on him because he cares for you."', ref: '1 Peter 5:7' },
    { text: '"But those who hope in the LORD will renew their strength. They will soar on wings like eagles."', ref: 'Isaiah 40:31' },
    { text: '"Greater love has no one than this: to lay down one\'s life for one\'s friends."', ref: 'John 15:13' },
    { text: '"Let your light shine before others, that they may see your good deeds and glorify your Father in heaven."', ref: 'Matthew 5:16' },
    { text: '"Be still, and know that I am God."', ref: 'Psalm 46:10' },
    { text: '"And my God will meet all your needs according to the riches of his glory in Christ Jesus."', ref: 'Philippians 4:19' },
    { text: '"Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"', ref: '2 Corinthians 5:17' },
    { text: '"Love is patient, love is kind. It does not envy, it does not boast, it is not proud."', ref: '1 Corinthians 13:4' },
    { text: '"The LORD is close to the brokenhearted and saves those who are crushed in spirit."', ref: 'Psalm 34:18' },
    { text: '"Ask and it will be given to you; seek and you will find; knock and the door will be opened to you."', ref: 'Matthew 7:7' },
    { text: '"Give, and it will be given to you. A good measure, pressed down, shaken together and running over."', ref: 'Luke 6:38' },
    { text: '"Now faith is confidence in what we hope for and assurance about what we do not see."', ref: 'Hebrews 11:1' },
    { text: '"I am the way and the truth and the life. No one comes to the Father except through me."', ref: 'John 14:6' },
    { text: '"Not by might nor by power, but by my Spirit, says the LORD Almighty."', ref: 'Zechariah 4:6' },
    { text: '"The earth is the LORD\'s, and everything in it, the world, and all who live in it."', ref: 'Psalm 24:1' },
    { text: '"Do not conform to the pattern of this world, but be transformed by the renewing of your mind."', ref: 'Romans 12:2' },
    { text: '"Where two or three gather in my name, there am I with them."', ref: 'Matthew 18:20' },
    { text: '"Taste and see that the LORD is good; blessed is the one who takes refuge in him."', ref: 'Psalm 34:8' },
    { text: '"He who began a good work in you will carry it on to completion until the day of Christ Jesus."', ref: 'Philippians 1:6' },
    { text: '"Be completely humble and gentle; be patient, bearing with one another in love."', ref: 'Ephesians 4:2' },
    { text: '"The LORD your God is with you, the Mighty Warrior who saves."', ref: 'Zephaniah 3:17' },
    { text: '"For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline."', ref: '2 Timothy 1:7' },
    { text: '"I will praise you, LORD, with all my heart; before the gods I will sing your praise."', ref: 'Psalm 138:1' },
    { text: '"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."', ref: 'Galatians 6:9' },
    { text: '"Give thanks to the LORD, for he is good; his love endures forever."', ref: 'Psalm 107:1' },
    { text: '"For where your treasure is, there your heart will be also."', ref: 'Matthew 6:21' },
    { text: '"The weapons we fight with are not the weapons of the world. On the contrary, they have divine power."', ref: '2 Corinthians 10:4' },
    { text: '"I have been crucified with Christ and I no longer live, but Christ lives in me."', ref: 'Galatians 2:20' },
    { text: '"Rejoice always, pray continually, give thanks in all circumstances."', ref: '1 Thessalonians 5:16-18' },
    { text: '"The grass withers and the flowers fall, but the word of our God endures forever."', ref: 'Isaiah 40:8' },
    { text: '"As iron sharpens iron, so one person sharpens another."', ref: 'Proverbs 27:17' },
    { text: '"I am the resurrection and the life. The one who believes in me will live, even though they die."', ref: 'John 11:25' },
    { text: '"Blessed are the pure in heart, for they will see God."', ref: 'Matthew 5:8' },
];

function getVerseOfTheWeek() {
    // Use ISO week number so it changes every Monday
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return WEEKLY_VERSES[weekNum % WEEKLY_VERSES.length];
}

export default function Dashboard() {
    type DashProps = { stats: any; funnelData: any[]; financeMonthly: any[]; urgentFollowUps: any[]; openCareCases: any[]; openCareCasesCount: number; urgentCareCasesCount: number; activityFeed: any[]; churchName: string };
    const { stats, funnelData, financeMonthly, urgentFollowUps, openCareCases, openCareCasesCount, urgentCareCasesCount, activityFeed, churchName } = usePage<DashProps>().props;
    const unreadAlerts = openCareCases.filter((c: any) => c.priority === "urgent" || c.priority === "high").slice(0, 3);
    const verse = getVerseOfTheWeek();
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
                                Verse of the Week
                            </div>
                            <p className="text-sm font-medium leading-snug text-white/95 italic">{verse.text}</p>
                            <span className="text-xs text-yellow-300 font-semibold">{verse.ref}</span>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="relative mt-5 flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" className="h-8 gap-1.5 bg-white/15 text-white border-white/20 hover:bg-white/25" asChild>
                            <Link href="/finance?tab=service-entry">
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
                                    <h3 className="text-sm font-Hsemibold">Priority Follow-Ups</h3>
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


