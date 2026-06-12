import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    ChevronRight,
    Filter,
    MessageSquare,
    MoreHorizontal,
    Phone,
    Plus,
    Search,
    User,
    UserCheck,
    UserPlus,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    mockFollowUpCards,
    mockFollowUpTasks,
    mockAutomationEvents,
    type FollowUpCard,
    type FollowUpStage,
    type FollowUpTask,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

// ── Config ────────────────────────────────────────────────────────────────────

const stageConfig: Record<FollowUpStage, {
    label: string; color: string; bg: string; border: string;
    icon: React.ElementType; description: string;
}> = {
    visitor:          { label: 'Visitor',          color: 'text-slate-700 dark:text-slate-300',   bg: 'bg-slate-100 dark:bg-slate-800/50',       border: 'border-slate-200 dark:border-slate-700',   icon: UserPlus,  description: 'First time visitors' },
    first_contact:    { label: 'First Contact',    color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-950/30',          border: 'border-blue-200 dark:border-blue-800',     icon: Phone,     description: 'Initial contact made' },
    follow_up:        { label: 'Follow-Up',        color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30',      border: 'border-purple-200 dark:border-purple-800', icon: MessageSquare, description: 'Active follow-up in progress' },
    membership_class: { label: 'Membership Class', color: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-950/30',        border: 'border-amber-200 dark:border-amber-800',   icon: Users,     description: 'Attending new members class' },
    worker:           { label: 'Worker',           color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', icon: UserCheck, description: 'Active church worker' },
    established:      { label: 'Established',      color: 'text-teal-700 dark:text-teal-400',     bg: 'bg-teal-50 dark:bg-teal-950/30',          border: 'border-teal-200 dark:border-teal-800',     icon: User,      description: 'Fully established member' },
};

const priorityConfig = {
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',       dot: 'bg-red-500' },
    high:   { label: 'High',   color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dot: 'bg-orange-500' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   dot: 'bg-blue-500' },
    low:    { label: 'Low',    color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',  dot: 'bg-slate-400' },
};

const taskTypeConfig: Record<FollowUpTask['type'], { label: string; icon: React.ElementType; color: string }> = {
    call:              { label: 'Call',              icon: Phone,        color: 'text-blue-600' },
    visit:             { label: 'Home Visit',        icon: User,         color: 'text-purple-600' },
    prayer_meeting:    { label: 'Prayer Meeting',    icon: Zap,          color: 'text-amber-600' },
    invite_to_service: { label: 'Invite to Service', icon: UserPlus,     color: 'text-emerald-600' },
    message:           { label: 'Message',           icon: MessageSquare, color: 'text-slate-600' },
};

const stages: FollowUpStage[] = ['visitor', 'first_contact', 'follow_up', 'membership_class', 'worker', 'established'];

// ── Task Modal ────────────────────────────────────────────────────────────────

function CreateTaskModal({
    open,
    onClose,
    defaultPerson = '',
}: {
    open: boolean;
    onClose: () => void;
    defaultPerson?: string;
}) {
    const [type, setType] = useState<FollowUpTask['type']>('call');
    const [priority, setPriority] = useState<FollowUpTask['priority']>('medium');

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Follow-Up Task</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Person</Label>
                        <Input placeholder="Person name" className="h-9" defaultValue={defaultPerson} />
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Task Type</Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {(Object.keys(taskTypeConfig) as FollowUpTask['type'][]).map((t) => {
                                const cfg = taskTypeConfig[t];
                                const Icon = cfg.icon;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={cn(
                                            'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-base',
                                            type === t
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border hover:border-primary/40 hover:bg-muted/50',
                                        )}
                                    >
                                        <Icon className={cn('size-3.5', type === t ? 'text-primary' : cfg.color)} />
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Assigned To</Label>
                            <Input placeholder="e.g. Bro. Samuel" className="h-9" />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Due Date</Label>
                            <Input type="date" className="h-9" />
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Priority</Label>
                        <div className="flex items-center gap-1.5">
                            {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className={cn(
                                        'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-base',
                                        priority === p
                                            ? priorityConfig[p].color + ' ring-1 ring-current'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/70',
                                    )}
                                >
                                    <span className={cn('size-1.5 rounded-full', priority === p ? priorityConfig[p].dot : 'bg-muted-foreground/40')} />
                                    {priorityConfig[p].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes (optional)</Label>
                        <textarea
                            className="w-full rounded-lg border border-border bg-muted/50 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={2}
                            placeholder="Add notes about this task..."
                        />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <Button className="flex-1 gap-2" onClick={onClose}>
                            <Plus className="size-4" />
                            Create Task
                        </Button>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Automation Panel ──────────────────────────────────────────────────────────

function AutomationPanel() {
    const escalationColors = {
        0: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        1: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        2: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const escalationLabel = { 0: 'Worker', 1: 'Dept. Head', 2: 'Pastor' };

    return (
        <div className="p-6 flex flex-col gap-6">
            {/* Logic explanation */}
            <div className="card-base p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="size-4 text-amber-500" />
                    <h3 className="text-sm font-semibold">Automation Rules</h3>
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
                <div className="flex flex-col gap-3">
                    {[
                        { trigger: 'Member misses 2 services', action: 'Auto-create follow-up task → assign to zone worker', level: 0 },
                        { trigger: 'Follow-up unresolved for 5 days', action: 'Escalate to Department Head', level: 1 },
                        { trigger: 'Still unresolved after escalation', action: 'Escalate to Pastor', level: 2 },
                        { trigger: 'Members Reached (evangelism)', action: 'Auto-generate 5-point follow-up schedule (Day 1, 3, 7, 14, 30)', level: 0 },
                    ].map((rule, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-3">
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground mt-0.5">
                                {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">IF: <span className="text-foreground">{rule.trigger}</span></p>
                                <p className="text-xs text-muted-foreground mt-0.5">THEN: <span className="text-foreground">{rule.action}</span></p>
                            </div>
                            <span className={cn('text-xs font-medium rounded-full px-2 py-0.5 shrink-0', escalationColors[rule.level as 0 | 1 | 2])}>
                                {escalationLabel[rule.level as 0 | 1 | 2]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent automation events */}
            <div className="card-base overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border">
                    <h3 className="text-sm font-semibold">Recent Automation Events</h3>
                </div>
                <div className="divide-y divide-border">
                    {mockAutomationEvents.map((event) => (
                        <div key={event.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/20 transition-base">
                            <div className={cn(
                                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5',
                                event.escalationLevel === 2 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                event.escalationLevel === 1 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                            )}>
                                L{event.escalationLevel}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{event.personName}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{event.action}</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    {new Date(event.triggeredAt).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className="shrink-0">
                                {event.resolved ? (
                                    <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full px-2 py-0.5">Resolved</span>
                                ) : (
                                    <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full px-2 py-0.5">Pending</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Tasks Panel ───────────────────────────────────────────────────────────────

function TasksPanel({ onCreateTask }: { onCreateTask: () => void }) {
    return (
        <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{mockFollowUpTasks.length} tasks across all follow-ups</p>
                <Button size="sm" className="h-8 gap-1.5" onClick={onCreateTask}>
                    <Plus className="size-3.5" />
                    New Task
                </Button>
            </div>
            <div className="card-base overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {['Person', 'Type', 'Assigned To', 'Due', 'Priority', 'Status'].map((h) => (
                                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {mockFollowUpTasks.map((task) => {
                                const tc = taskTypeConfig[task.type];
                                const pc = priorityConfig[task.priority];
                                const TaskIcon = tc.icon;
                                return (
                                    <tr key={task.id} className="hover:bg-muted/20 transition-base cursor-pointer">
                                        <td className="px-5 py-3 font-medium">{task.personName}</td>
                                        <td className="px-5 py-3">
                                            <span className="flex items-center gap-1.5 text-xs">
                                                <TaskIcon className={cn('size-3.5', tc.color)} />
                                                {tc.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-muted-foreground">{task.assignedTo}</td>
                                        <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{task.dueDate}</td>
                                        <td className="px-5 py-3">
                                            <span className={cn('inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 font-medium', pc.color)}>
                                                <span className={cn('size-1.5 rounded-full', pc.dot)} />
                                                {pc.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={cn(
                                                'text-xs rounded-full px-2 py-0.5 font-medium',
                                                task.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                task.status === 'escalated' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-muted text-muted-foreground',
                                            )}>
                                                {task.status.replace('_', ' ')}
                                            </span>
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

// ── Follow-Up Card (Sortable) ─────────────────────────────────────────────────

function SortableCard({
    card,
    onSelect,
    onCreateTask,
}: {
    card: FollowUpCard;
    onSelect: (c: FollowUpCard) => void;
    onCreateTask: (name: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 };
    const pc = priorityConfig[card.priority];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={cn(
                'group relative rounded-xl border bg-card p-3.5 shadow-xs cursor-grab active:cursor-grabbing',
                'hover:shadow-sm hover:border-border/80 hover:-translate-y-0.5 transition-all duration-200',
                card.priority === 'urgent' && 'border-l-4 border-l-red-500',
                card.priority === 'high' && 'border-l-4 border-l-orange-500',
                isDragging && 'shadow-lg ring-2 ring-primary/20',
            )}
        >
            {/* Drag handle — entire card is draggable */}
            <div {...listeners} className="absolute inset-0 rounded-xl" />

            {/* Content — above drag layer */}
            <div className="relative pointer-events-none">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {card.initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate leading-tight">{card.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{card.phone}</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1.5 mb-2.5 line-clamp-1">
                    → {card.nextAction}
                </p>
                <div className="flex items-center justify-between gap-2">
                    <span className={cn('inline-flex items-center gap-1 text-xs rounded-full px-1.5 py-0.5 font-medium shrink-0', pc.color)}>
                        <span className={cn('size-1.5 rounded-full', pc.dot)} />
                        {pc.label}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Calendar className="size-3" />
                        {card.lastContact}
                    </div>
                </div>
                {card.prayerRequest && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                        <span className="size-1.5 rounded-full bg-rose-500" />
                        Prayer request
                    </div>
                )}
            </div>

            {/* Action buttons (pointer-events re-enabled) */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-auto">
                <button
                    className="flex size-6 items-center justify-center rounded-md bg-muted hover:bg-muted/70 transition-base"
                    title="Create task"
                    onClick={(e) => { e.stopPropagation(); onCreateTask(card.name); }}
                >
                    <Plus className="size-3.5 text-muted-foreground" />
                </button>
                <button
                    className="flex size-6 items-center justify-center rounded-md bg-muted hover:bg-muted/70 transition-base"
                    title="View profile"
                    onClick={(e) => { e.stopPropagation(); onSelect(card); }}
                >
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                </button>
            </div>
        </div>
    );
}

// ── Profile Drawer ────────────────────────────────────────────────────────────

function ProfileDrawer({ card, onClose, onCreateTask }: { card: FollowUpCard | null; onClose: () => void; onCreateTask: (name: string) => void }) {
    if (!card) return null;
    const stage = stageConfig[card.stage];
    const pc = priorityConfig[card.priority];

    return (
        <Sheet open={!!card} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col overflow-hidden">
                <SheetHeader className="px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-base font-bold">
                            {card.initials}
                        </div>
                        <div>
                            <SheetTitle className="text-base font-semibold">{card.name}</SheetTitle>
                            <p className="text-sm text-muted-foreground">{card.phone}</p>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <div className="px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1', stage.bg, stage.color)}>
                                <stage.icon className="size-3.5" />
                                {stage.label}
                            </span>
                            <span className={cn('inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-1 font-medium', pc.color)}>
                                <span className={cn('size-1.5 rounded-full', pc.dot)} />
                                {pc.label} priority
                            </span>
                            <span className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1">{card.daysInStage}d in stage</span>
                        </div>
                    </div>

                    <div className="px-5 py-4 border-b border-border space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            <div><p className="text-xs text-muted-foreground">Source</p><p className="text-sm font-medium">{card.source}</p></div>
                            <div><p className="text-xs text-muted-foreground">Assigned To</p><p className="text-sm font-medium">{card.assignedTo}</p></div>
                            <div><p className="text-xs text-muted-foreground">Last Contact</p><p className="text-sm font-medium">{card.lastContact}</p></div>
                            <div><p className="text-xs text-muted-foreground">Days in Stage</p><p className="text-sm font-medium">{card.daysInStage} days</p></div>
                        </div>
                    </div>

                    <div className="px-5 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Next Action</h4>
                        <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                            <ArrowRight className="size-4 text-primary mt-0.5 shrink-0" />
                            <p className="text-sm">{card.nextAction}</p>
                        </div>
                    </div>

                    {card.prayerRequest && (
                        <div className="px-5 py-4 border-b border-border">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Prayer Request</h4>
                            <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/20 rounded-lg p-3 border border-rose-200/50 dark:border-rose-800/50">
                                <span className="size-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                <p className="text-sm text-rose-700 dark:text-rose-400">{card.prayerRequest}</p>
                            </div>
                        </div>
                    )}

                    {card.notes && (
                        <div className="px-5 py-4 border-b border-border">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{card.notes}</p>
                        </div>
                    )}

                    {/* Tasks for this person */}
                    <div className="px-5 py-4 border-b border-border">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tasks</h4>
                            <button
                                onClick={() => onCreateTask(card.name)}
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                                <Plus className="size-3" /> Add Task
                            </button>
                        </div>
                        {mockFollowUpTasks.filter((t) => t.followUpId === card.id).length > 0 ? (
                            <div className="flex flex-col gap-1.5">
                                {mockFollowUpTasks.filter((t) => t.followUpId === card.id).map((task) => {
                                    const tc = taskTypeConfig[task.type];
                                    const TaskIcon = tc.icon;
                                    return (
                                        <div key={task.id} className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2">
                                            <TaskIcon className={cn('size-3.5 shrink-0', tc.color)} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium">{tc.label}</p>
                                                <p className="text-xs text-muted-foreground">{task.assignedTo} · Due {task.dueDate}</p>
                                            </div>
                                            <span className={cn(
                                                'text-xs rounded-full px-1.5 py-0.5',
                                                task.status === 'escalated' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-muted text-muted-foreground',
                                            )}>
                                                {task.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">No tasks yet</p>
                        )}
                    </div>

                    <div className="px-5 py-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {card.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-muted text-muted-foreground rounded-md px-2 py-1">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-border p-4 flex gap-2">
                    <Button className="flex-1 gap-2" size="sm">
                        <Phone className="size-3.5" />
                        Log Contact
                    </Button>
                    <Button variant="outline" className="gap-2" size="sm" onClick={() => onCreateTask(card.name)}>
                        <Plus className="size-3.5" />
                        Task
                    </Button>
                    <Button variant="outline" className="gap-2" size="sm">
                        <ChevronRight className="size-3.5" />
                        Move
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Tab = 'kanban' | 'tasks' | 'automation';

export default function Followups() {
    const [cards, setCards] = useState<FollowUpCard[]>(mockFollowUpCards);
    const [selectedCard, setSelectedCard] = useState<FollowUpCard | null>(null);
    const [activeCard, setActiveCard] = useState<FollowUpCard | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [tab, setTab] = useState<Tab>('kanban');
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [taskDefaultPerson, setTaskDefaultPerson] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    );

    const filtered = searchQuery
        ? cards.filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : cards;

    const getCardsForStage = (stage: FollowUpStage) => filtered.filter((c) => c.stage === stage);

    function handleDragStart(event: DragStartEvent) {
        const card = cards.find((c) => c.id === event.active.id);
        if (card) setActiveCard(card);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveCard(null);
        if (!over) return;

        const overId = over.id as string;
        // Check if dropped over a stage column
        if (stages.includes(overId as FollowUpStage)) {
            setCards((prev) =>
                prev.map((c) => c.id === active.id ? { ...c, stage: overId as FollowUpStage } : c),
            );
            return;
        }
        // Check if dropped over another card — move to that card's stage
        const targetCard = cards.find((c) => c.id === overId);
        if (targetCard && targetCard.id !== active.id) {
            setCards((prev) =>
                prev.map((c) => c.id === active.id ? { ...c, stage: targetCard.stage } : c),
            );
        }
    }

    function openCreateTask(name = '') {
        setTaskDefaultPerson(name);
        setTaskModalOpen(true);
    }

    const totalCards = cards.length;
    const urgentCards = cards.filter((c) => c.priority === 'urgent').length;

    const tabs: { id: Tab; label: string; count?: number }[] = [
        { id: 'kanban', label: 'Kanban Board' },
        { id: 'tasks', label: 'Tasks', count: mockFollowUpTasks.filter((t) => t.status !== 'done').length },
        { id: 'automation', label: 'Automation', count: mockAutomationEvents.filter((e) => !e.resolved).length },
    ];

    return (
        <>
            <Head title="Follow-Ups" />
            <div className="flex flex-col h-full overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Follow-Ups</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {totalCards} people tracked
                            {urgentCards > 0 && (
                                <> · <span className="text-red-600 dark:text-red-400 font-medium">{urgentCards} urgent</span></>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-48 hidden sm:block">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                            <Input className="h-8 pl-8 text-sm bg-muted/50 border-transparent" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5">
                            <Filter className="size-3.5" />
                            Filter
                        </Button>
                        <Button size="sm" className="h-8 gap-1.5" onClick={() => openCreateTask()}>
                            <Plus className="size-3.5" />
                            Add Task
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-0 border-b border-border px-6 shrink-0">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={cn(
                                'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-base',
                                tab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {t.label}
                            {t.count !== undefined && t.count > 0 && (
                                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                                    {t.count}
                                </span>
                            )}
                            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>

                {/* Stage summary (kanban only) */}
                {tab === 'kanban' && (
                    <div className="flex items-center gap-1 px-6 py-2.5 border-b border-border overflow-x-auto scrollbar-thin shrink-0">
                        {stages.map((stage) => {
                            const cfg = stageConfig[stage];
                            const count = getCardsForStage(stage).length;
                            return (
                                <div key={stage} className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shrink-0', cfg.bg, cfg.color)}>
                                    <cfg.icon className="size-3" />
                                    {cfg.label}
                                    <span className="font-bold">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Content */}
                {tab === 'tasks' && <TasksPanel onCreateTask={() => openCreateTask()} />}
                {tab === 'automation' && <AutomationPanel />}

                {tab === 'kanban' && (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 py-4">
                            <div className="flex gap-3 h-full" style={{ minWidth: '1100px' }}>
                                {stages.map((stage) => {
                                    const cfg = stageConfig[stage];
                                    const stageCards = getCardsForStage(stage);
                                    const StageIcon = cfg.icon;

                                    return (
                                        <div
                                            key={stage}
                                            className="flex flex-col w-56 shrink-0 rounded-xl bg-muted/30 border border-border/50"
                                        >
                                            <div className={cn('flex items-center justify-between px-3 py-2.5 rounded-t-xl border-b', cfg.border)}>
                                                <div className="flex items-center gap-2">
                                                    <StageIcon className={cn('size-3.5', cfg.color)} />
                                                    <span className={cn('text-xs font-semibold', cfg.color)}>{cfg.label}</span>
                                                </div>
                                                <span className={cn('text-xs font-bold rounded-full px-1.5 py-0.5', cfg.bg, cfg.color)}>
                                                    {stageCards.length}
                                                </span>
                                            </div>

                                            {/* Drop zone for the stage itself */}
                                            <SortableContext
                                                id={stage}
                                                items={stageCards.map((c) => c.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="flex-1 overflow-y-auto scrollbar-thin p-2 flex flex-col gap-2 min-h-20">
                                                    {stageCards.map((card) => (
                                                        <SortableCard
                                                            key={card.id}
                                                            card={card}
                                                            onSelect={setSelectedCard}
                                                            onCreateTask={openCreateTask}
                                                        />
                                                    ))}
                                                    {stageCards.length === 0 && (
                                                        <div className="flex flex-col items-center justify-center h-24 text-center rounded-lg border-2 border-dashed border-border/30">
                                                            <StageIcon className="size-5 text-muted-foreground/20 mb-1" />
                                                            <p className="text-xs text-muted-foreground/40">Drop here</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </SortableContext>

                                            <div className="p-2 border-t border-border/50">
                                                <button
                                                    className="w-full flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-2 py-1.5 transition-base"
                                                    onClick={() => openCreateTask()}
                                                >
                                                    <Plus className="size-3" />
                                                    Add to {cfg.label}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Drag overlay */}
                        <DragOverlay>
                            {activeCard && (
                                <div className={cn(
                                    'rounded-xl border bg-card p-3.5 shadow-xl w-56 rotate-1',
                                    activeCard.priority === 'urgent' && 'border-l-4 border-l-red-500',
                                    activeCard.priority === 'high' && 'border-l-4 border-l-orange-500',
                                )}>
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                            {activeCard.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{activeCard.name}</p>
                                            <p className="text-xs text-muted-foreground">{activeCard.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>

            <ProfileDrawer card={selectedCard} onClose={() => setSelectedCard(null)} onCreateTask={openCreateTask} />
            <CreateTaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} defaultPerson={taskDefaultPerson} />
        </>
    );
}

Followups.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Follow-Ups', href: '/followups' },
    ],
};
