import { Head, Link, usePage } from '@inertiajs/react';
import {
    Users, Music, Heart, Monitor, Globe, Star, Shield, Zap, LayoutGrid,
    Crown, User, MessageSquare, CheckCircle2, Clock, XCircle, Building2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = { Users, Music, Heart, Monitor, Globe, Star, Shield, Zap, LayoutGrid };

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-950/20',   border: 'border-blue-200 dark:border-blue-800',   icon: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/20',border: 'border-purple-200 dark:border-purple-800',icon: 'text-purple-600 dark:text-purple-400' },
    pink:   { bg: 'bg-pink-50 dark:bg-pink-950/20',   border: 'border-pink-200 dark:border-pink-800',   icon: 'text-pink-600 dark:text-pink-400' },
    green:  { bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800', icon: 'text-green-600 dark:text-green-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/20',border: 'border-orange-200 dark:border-orange-800',icon: 'text-orange-600 dark:text-orange-400' },
    rose:   { bg: 'bg-rose-50 dark:bg-rose-950/20',   border: 'border-rose-200 dark:border-rose-800',   icon: 'text-rose-600 dark:text-rose-400' },
    slate:  { bg: 'bg-slate-50 dark:bg-slate-900/20', border: 'border-slate-200 dark:border-slate-800', icon: 'text-slate-600 dark:text-slate-400' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/20',border: 'border-yellow-200 dark:border-yellow-800',icon: 'text-yellow-600 dark:text-yellow-400' },
};

const statusConfig = {
    sent:    { icon: CheckCircle2, color: 'text-emerald-600' },
    pending: { icon: Clock,        color: 'text-amber-600' },
    failed:  { icon: XCircle,      color: 'text-red-500' },
};

type Message = { id: number; title: string; message: string; type: string; group: string; recipients: number; sent_at: string; status: string };
type Dept    = { id: number; name: string; description: string; icon: string; color: string; leader: string | null; role: string; is_leader: boolean; member_count: number; is_admin: boolean };

function groupLabel(group: string): string {
    if (group.startsWith('dept:'))   return 'Department';
    if (group.startsWith('leader:')) return 'Department Leader';
    if (group === 'all')    return 'All Members';
    if (group === 'active') return 'Active Members';
    if (group === 'workers')return 'All Workers';
    if (group === 'individual') return 'Individual';
    return group;
}

export default function WorkerDashboard() {
    const { departments, messages, user } = usePage().props as { departments: Dept[]; messages: Message[]; user: any };
    const [tab, setTab] = useState<'departments' | 'messages'>('departments');

    return (
        <>
            <Head title="Worker Portal" />
            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Worker Portal</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Welcome back, {user?.name?.split(' ')[0]}
                        {user?.is_admin && <span className="ml-2 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full px-2 py-0.5 font-medium">Admin</span>}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="card-base p-4 flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2 className="size-4" /></div>
                        <div><p className="text-2xl font-bold">{departments.length}</p><p className="text-xs text-muted-foreground">Departments</p></div>
                    </div>
                    <div className="card-base p-4 flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30"><Crown className="size-4" /></div>
                        <div><p className="text-2xl font-bold">{departments.filter(d => d.is_leader).length}</p><p className="text-xs text-muted-foreground">Leading</p></div>
                    </div>
                    <div className="card-base p-4 flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30"><MessageSquare className="size-4" /></div>
                        <div><p className="text-2xl font-bold">{messages.length}</p><p className="text-xs text-muted-foreground">Messages</p></div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-0 border-b border-border">
                    {([['departments','Departments'], ['messages','Messages']] as const).map(([id, label]) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={cn('relative px-4 py-2.5 text-sm font-medium transition-colors',
                                tab === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                            {label}
                            {id === 'messages' && messages.length > 0 && (
                                <span className="ml-1.5 inline-flex items-center justify-center size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{messages.length}</span>
                            )}
                            {tab === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>

                {/* Departments */}
                {tab === 'departments' && (
                    departments.length === 0 ? (
                        <div className="card-base p-12 text-center">
                            <User className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                            <h3 className="text-sm font-semibold mb-1">No Departments Assigned</h3>
                            <p className="text-xs text-muted-foreground mb-4">Contact your administrator to be assigned to a department.</p>
                            <Link href="/dashboard"><Button variant="outline" size="sm">Return to Dashboard</Button></Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {departments.map(dept => {
                                const IconComponent = iconMap[dept.icon] || Users;
                                const c = colorMap[dept.color] || colorMap.blue;
                                return (
                                    <Link key={dept.id} href={`/worker/department/${dept.id}`} className="group">
                                        <div className="card-base p-5 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer h-full flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={cn('flex size-11 items-center justify-center rounded-xl border', c.bg, c.border)}>
                                                    <IconComponent className={cn('size-5', c.icon)} />
                                                </div>
                                                {dept.is_leader && (
                                                    <Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                                                        <Crown className="size-3" />Leader
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="font-semibold mb-1">{dept.name}</h3>
                                            <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">{dept.description || 'No description'}</p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5"><Users className="size-3" />{dept.member_count} workers</span>
                                                {dept.leader && <span className="truncate max-w-28">Leader: {dept.leader}</span>}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )
                )}

                {/* Messages */}
                {tab === 'messages' && (
                    <div className="flex flex-col gap-3 max-w-2xl">
                        {messages.length === 0 ? (
                            <div className="card-base p-12 text-center">
                                <MessageSquare className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No messages yet. Messages sent to your department will appear here.</p>
                            </div>
                        ) : messages.map(msg => {
                            const sc = statusConfig[msg.status as keyof typeof statusConfig] ?? statusConfig.sent;
                            const StatusIcon = sc.icon;
                            return (
                                <div key={msg.id} className="card-base p-5">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <MessageSquare className="size-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{msg.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <span className="text-xs text-muted-foreground">{msg.sent_at}</span>
                                                    <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">{groupLabel(msg.group)}</span>
                                                    <StatusIcon className={cn('size-3.5', sc.color)} />
                                                </div>
                                            </div>
                                        </div>
                                        {msg.recipients > 1 && (
                                            <span className="text-xs text-muted-foreground shrink-0">{msg.recipients} recipients</span>
                                        )}
                                    </div>
                                    <div className="rounded-lg bg-muted/50 border border-border p-3 ml-12">
                                        <p className="text-sm leading-relaxed">{msg.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

WorkerDashboard.layout = {
    breadcrumbs: [{ title: 'Worker Portal', href: '/worker/dashboard' }],
};
