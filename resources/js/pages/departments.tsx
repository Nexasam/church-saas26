import { Head } from '@inertiajs/react';
import {
    Globe,
    Heart,
    LayoutGrid,
    Monitor,
    MoreHorizontal,
    Music,
    Plus,
    Shield,
    Star,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { mockDepartments, mockMembers, type Department } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

const iconMap: Record<string, React.ElementType> = {
    Users,
    Music,
    Heart,
    Monitor,
    Globe,
    Star,
    Shield,
    Zap,
    LayoutGrid,
};

const colorMap: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800', icon: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-200 dark:border-pink-800', icon: 'text-pink-600 dark:text-pink-400', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
    green: { bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800', icon: 'text-green-600 dark:text-green-400', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800', icon: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    slate: { bg: 'bg-slate-50 dark:bg-slate-900/20', border: 'border-slate-200 dark:border-slate-800', icon: 'text-slate-600 dark:text-slate-400', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-800', icon: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
};

function DepartmentDetailSheet({ dept, onClose }: { dept: Department | null; onClose: () => void }) {
    if (!dept) return null;
    const IconComponent = iconMap[dept.icon] || Users;
    const c = colorMap[dept.color];
    const deptMembers = mockMembers.filter((m) => m.departments.includes(dept.name));

    return (
        <Sheet open={!!dept} onOpenChange={(o) => !o && onClose()}>
            <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col overflow-hidden">
                <SheetHeader className="px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl border', c.bg, c.border)}>
                            <IconComponent className={cn('size-5', c.icon)} />
                        </div>
                        <div>
                            <SheetTitle className="text-base">{dept.name}</SheetTitle>
                            <p className="text-sm text-muted-foreground">{dept.description}</p>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Stats */}
                    <div className="px-5 py-4 border-b border-border">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold">{dept.memberCount}</p>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold text-emerald-600">{dept.activeCount}</p>
                                <p className="text-xs text-muted-foreground">Active</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold text-amber-600">{dept.memberCount - dept.activeCount}</p>
                                <p className="text-xs text-muted-foreground">Inactive</p>
                            </div>
                        </div>
                    </div>

                    {/* Leader */}
                    <div className="px-5 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Department Leader</h4>
                        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                                {dept.leader.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{dept.leader}</p>
                                <p className="text-xs text-muted-foreground">Department Leader</p>
                            </div>
                        </div>
                    </div>

                    {/* Members list */}
                    <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Members in this system</h4>
                            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                                <Plus className="size-3" />
                                Add
                            </Button>
                        </div>
                        {deptMembers.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {deptMembers.map((m) => (
                                    <div key={m.id} className="flex items-center gap-2.5 rounded-lg hover:bg-muted/40 p-2 transition-base">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                            {m.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{m.name}</p>
                                            <p className="text-xs text-muted-foreground">{m.phone}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{m.attendanceRate}% att.</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No members linked yet in this demo
                            </p>
                        )}
                    </div>
                </div>

                <div className="border-t border-border p-4 flex gap-2">
                    <Button className="flex-1" size="sm">Manage Department</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function Departments() {
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);

    const totalMembers = mockDepartments.reduce((s, d) => s + d.memberCount, 0);

    return (
        <>
            <Head title="Departments" />
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Departments</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {mockDepartments.length} departments · {totalMembers} total assignments
                        </p>
                    </div>
                    <Button size="sm" className="h-8 gap-1.5">
                        <Plus className="size-3.5" />
                        New Department
                    </Button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {mockDepartments.map((dept) => {
                            const IconComponent = iconMap[dept.icon] || Users;
                            const c = colorMap[dept.color];
                            const activePct = Math.round((dept.activeCount / dept.memberCount) * 100);

                            return (
                                <div
                                    key={dept.id}
                                    onClick={() => setSelectedDept(dept)}
                                    className={cn(
                                        'card-base card-hover p-5 cursor-pointer group',
                                        'hover:shadow-md transition-all duration-200',
                                    )}
                                >
                                    {/* Icon + Menu */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn('flex size-10 items-center justify-center rounded-xl border transition-smooth group-hover:scale-105', c.bg, c.border)}>
                                            <IconComponent className={cn('size-5', c.icon)} />
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-smooth -mr-1">
                                                    <MoreHorizontal className="size-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem>View details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit department</DropdownMenuItem>
                                                <DropdownMenuItem>Add members</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Name & desc */}
                                    <h3 className="font-semibold text-sm mb-0.5">{dept.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{dept.description}</p>

                                    {/* Members count */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="size-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            {dept.activeCount} active
                                            <span className="text-muted-foreground/60"> / {dept.memberCount} total</span>
                                        </span>
                                    </div>

                                    {/* Activity bar */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Activity</span>
                                            <span className="font-medium">{activePct}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={cn('h-full rounded-full transition-all duration-500', c.icon.replace('text-', 'bg-').replace(' dark:text-', ' dark:bg-').split(' ')[0])}
                                                style={{ width: `${activePct}%`, opacity: 0.8 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                                {dept.leader.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate max-w-24">{dept.leader}</span>
                                        </div>
                                        <span className={cn('text-xs font-medium rounded-full px-2 py-0.5', c.badge)}>
                                            Active
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Department Card */}
                        <div
                            className="card-base border-dashed border-2 p-5 cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-smooth flex flex-col items-center justify-center gap-3 min-h-48 group"
                            onClick={() => {}}
                        >
                            <div className="flex size-10 items-center justify-center rounded-xl bg-muted group-hover:bg-muted/70 transition-smooth">
                                <Plus className="size-5 text-muted-foreground group-hover:text-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-base">New Department</p>
                                <p className="text-xs text-muted-foreground/60 mt-0.5">Create a new department</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DepartmentDetailSheet dept={selectedDept} onClose={() => setSelectedDept(null)} />
        </>
    );
}

Departments.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Departments', href: '/departments' },
    ],
};
