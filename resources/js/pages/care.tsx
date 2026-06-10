import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    Heart,
    HeartHandshake,
    Hospital,
    MoreHorizontal,
    Plus,
    Search,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { mockCareCases, type CareCase } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

const typeConfig: Record<CareCase['type'], { label: string; icon: React.ElementType; color: string; bg: string }> = {
    hospital: { label: 'Hospitalization', icon: Hospital, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    bereavement: { label: 'Bereavement', icon: Heart, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    counseling: { label: 'Counseling', icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    crisis: { label: 'Crisis', icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    prayer: { label: 'Prayer Need', icon: HeartHandshake, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    general: { label: 'General', icon: Users, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
};

const statusConfig: Record<CareCase['status'], { label: string; color: string }> = {
    open: { label: 'Open', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    escalated: { label: 'Escalated', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const priorityConfig: Record<CareCase['priority'], { label: string; dot: string }> = {
    urgent: { label: 'Urgent', dot: 'bg-red-500' },
    high: { label: 'High', dot: 'bg-orange-500' },
    medium: { label: 'Medium', dot: 'bg-blue-500' },
    low: { label: 'Low', dot: 'bg-slate-400' },
};

function CareCaseDetail({ careCase, onClose }: { careCase: CareCase | null; onClose: () => void }) {
    if (!careCase) return null;
    const tc = typeConfig[careCase.type];
    const sc = statusConfig[careCase.status];
    const pc = priorityConfig[careCase.priority];
    const TypeIcon = tc.icon;

    return (
        <Sheet open={!!careCase} onOpenChange={(o) => !o && onClose()}>
            <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col overflow-hidden">
                <SheetHeader className="px-5 py-4 border-b border-border">
                    <div className="flex items-start gap-3">
                        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', tc.bg)}>
                            <TypeIcon className={cn('size-5', tc.color)} />
                        </div>
                        <div>
                            <SheetTitle className="text-base leading-snug">{careCase.title}</SheetTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">{careCase.memberName}</p>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Status row */}
                    <div className="px-5 py-3.5 border-b border-border flex items-center gap-2 flex-wrap">
                        <span className={cn('text-xs font-medium rounded-full px-2.5 py-1', sc.color)}>{sc.label}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className={cn('size-2 rounded-full', pc.dot)} />
                            {pc.label} priority
                        </span>
                        <span className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1">{tc.label}</span>
                    </div>

                    {/* Description */}
                    <div className="px-5 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</h4>
                        <p className="text-sm text-foreground leading-relaxed">{careCase.description}</p>
                    </div>

                    {/* Assigned */}
                    {careCase.assignedTo && (
                        <div className="px-5 py-4 border-b border-border">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Assigned To</h4>
                            <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 p-2.5">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                    {careCase.assignedTo.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                                </div>
                                <span className="text-sm font-medium">{careCase.assignedTo}</span>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {careCase.notes.length > 0 && (
                        <div className="px-5 py-4 border-b border-border">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Notes ({careCase.notes.length})</h4>
                            <div className="flex flex-col gap-2">
                                {careCase.notes.map((note, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-muted-foreground leading-relaxed">{note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add note */}
                    <div className="px-5 py-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Add Note</h4>
                        <textarea
                            className="w-full rounded-lg border border-border bg-muted/50 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={3}
                            placeholder="Add a progress note..."
                        />
                        <Button className="w-full mt-2" size="sm">Save Note</Button>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border p-4 flex gap-2">
                    <Button
                        className="flex-1 gap-1.5"
                        size="sm"
                        variant={careCase.status === 'resolved' ? 'outline' : 'default'}
                    >
                        <CheckCircle2 className="size-3.5" />
                        {careCase.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                    </Button>
                    <Button variant="outline" className="flex-1 gap-1.5" size="sm">
                        Escalate
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function Care() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | CareCase['status']>('all');
    const [selectedCase, setSelectedCase] = useState<CareCase | null>(null);

    const filtered = mockCareCases.filter((c) => {
        const matchSearch = c.memberName.toLowerCase().includes(search.toLowerCase()) ||
            c.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const openCount = mockCareCases.filter((c) => c.status === 'open').length;
    const urgentCount = mockCareCases.filter((c) => c.priority === 'urgent').length;

    return (
        <>
            <Head title="Care Cases" />
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Care Cases</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {openCount} open{urgentCount > 0 && ` · `}
                            {urgentCount > 0 && (
                                <span className="text-red-600 dark:text-red-400 font-medium">{urgentCount} urgent</span>
                            )}
                        </p>
                    </div>
                    <Button size="sm" className="h-8 gap-1.5">
                        <Plus className="size-3.5" />
                        New Case
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                            className="h-8 pl-8 text-sm bg-muted/50 border-transparent"
                            placeholder="Search cases..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                        {(['all', 'open', 'in_progress', 'resolved', 'escalated'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                    'px-3 py-1 rounded-md text-xs font-medium transition-base capitalize',
                                    statusFilter === s
                                        ? 'bg-background shadow-xs text-foreground'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cases Grid */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((careCase) => {
                            const tc = typeConfig[careCase.type];
                            const sc = statusConfig[careCase.status];
                            const pc = priorityConfig[careCase.priority];
                            const TypeIcon = tc.icon;

                            return (
                                <div
                                    key={careCase.id}
                                    onClick={() => setSelectedCase(careCase)}
                                    className={cn(
                                        'card-base card-hover p-4 cursor-pointer group',
                                        careCase.priority === 'urgent' && 'border-l-4 border-l-red-500',
                                        careCase.priority === 'high' && 'border-l-4 border-l-orange-500',
                                    )}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', tc.bg)}>
                                            <TypeIcon className={cn('size-4', tc.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold leading-snug line-clamp-1">{careCase.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{careCase.memberName}</p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="size-6 opacity-0 group-hover:opacity-100 shrink-0">
                                                    <MoreHorizontal className="size-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View case</DropdownMenuItem>
                                                <DropdownMenuItem>Assign</DropdownMenuItem>
                                                <DropdownMenuItem>Mark resolved</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                                        {careCase.description}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn('inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5', sc.color)}>
                                                {sc.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <span className={cn('size-1.5 rounded-full', pc.dot)} />
                                            {pc.label}
                                        </div>
                                    </div>

                                    {/* Assigned */}
                                    {careCase.assignedTo && (
                                        <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border">
                                            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                                {careCase.assignedTo.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate">{careCase.assignedTo}</span>
                                            <span className="ml-auto text-xs text-muted-foreground/60">{careCase.createdAt}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <HeartHandshake className="size-10 text-muted-foreground/30 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">No care cases found</p>
                        </div>
                    )}
                </div>
            </div>

            <CareCaseDetail careCase={selectedCase} onClose={() => setSelectedCase(null)} />
        </>
    );
}

Care.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Care Cases', href: '/care' },
    ],
};
