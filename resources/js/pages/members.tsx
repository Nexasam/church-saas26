import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    ChevronRight,
    Download,
    Filter,
    Mail,
    MoreHorizontal,
    Phone,
    Plus,
    Search,
    User,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { mockMembers, type Member } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

const statusConfig = {
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    new: { label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

const membershipConfig = {
    full: { label: 'Full Member', color: 'bg-primary/10 text-primary' },
    associate: { label: 'Associate', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    visitor: { label: 'Visitor', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

const timelineTypeIcon: Record<string, string> = {
    attendance: '📋',
    follow_up: '📞',
    note: '📝',
    prayer: '🙏',
    milestone: '🏆',
    task: '✅',
};

function MemberProfile({ member, onClose }: { member: Member | null; onClose: () => void }) {
    if (!member) return null;
    const sc = statusConfig[member.status];
    const mc = membershipConfig[member.membershipType];

    return (
        <Sheet open={!!member} onOpenChange={(o) => !o && onClose()}>
            <SheetContent side="right" className="w-full max-w-lg p-0 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-border">
                    <div className="flex items-start gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold">
                            {member.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base font-semibold">{member.name}</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">{member.occupation || 'No occupation listed'}</p>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                <span className={cn('text-xs font-medium rounded-full px-2.5 py-0.5', sc.color)}>{sc.label}</span>
                                <span className={cn('text-xs font-medium rounded-full px-2.5 py-0.5', mc.color)}>{mc.label}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {/* Contact Info */}
                    <div className="px-6 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contact</h4>
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2.5">
                                <Phone className="size-4 text-muted-foreground shrink-0" />
                                <span className="text-sm">{member.phone}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Mail className="size-4 text-muted-foreground shrink-0" />
                                <span className="text-sm">{member.email}</span>
                            </div>
                            {member.address && (
                                <div className="flex items-start gap-2.5">
                                    <User className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <span className="text-sm">{member.address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="px-6 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Membership Stats</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-lg font-bold">{member.attendanceRate}%</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Attendance</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-lg font-bold">{member.departments.length}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Departments</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xs font-medium truncate">{member.homeChurch || '—'}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Home Church</p>
                            </div>
                        </div>
                    </div>

                    {/* Departments */}
                    <div className="px-6 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Departments</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {member.departments.map((d) => (
                                <span key={d} className="text-xs bg-muted text-muted-foreground rounded-md px-2.5 py-1">
                                    {d}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="px-6 py-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Timeline</h4>
                        <div className="flex flex-col gap-0">
                            {member.timeline.map((event, i) => (
                                <div key={event.id} className="flex gap-3 group">
                                    <div className="flex flex-col items-center">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm">
                                            {timelineTypeIcon[event.type] || '📌'}
                                        </div>
                                        {i < member.timeline.length - 1 && (
                                            <div className="w-0.5 flex-1 bg-border my-1" />
                                        )}
                                    </div>
                                    <div className="pb-4 min-w-0">
                                        <p className="text-sm font-medium leading-snug">{event.title}</p>
                                        {event.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground/70 mt-1">
                                            {event.date} · by {event.actor}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border p-4 flex gap-2">
                    <Button className="flex-1" size="sm">
                        Edit Profile
                    </Button>
                    <Button variant="outline" className="flex-1 gap-1.5" size="sm">
                        <Phone className="size-3.5" />
                        Contact
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function Members() {
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'new'>('all');

    const filtered = mockMembers.filter((m) => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            m.phone.includes(search);
        const matchStatus = statusFilter === 'all' || m.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <>
            <Head title="Members" />
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Members</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {mockMembers.length} total · {mockMembers.filter((m) => m.status === 'active').length} active
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-1.5">
                            <Download className="size-3.5" />
                            Export
                        </Button>
                        <Button size="sm" className="h-8 gap-1.5">
                            <Plus className="size-3.5" />
                            Add Member
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                            className="h-8 pl-8 text-sm bg-muted/50 border-transparent"
                            placeholder="Search by name, email, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                        {(['all', 'active', 'inactive', 'new'] as const).map((s) => (
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
                                {s}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                        <Filter className="size-3.5" />
                        Filters
                    </Button>
                </div>

                {/* Members Table */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-border bg-muted/80 backdrop-blur-sm">
                                {['Member', 'Phone', 'Departments', 'Home Church', 'Attendance', 'Joined', 'Status', ''].map((h) => (
                                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((member) => {
                                const sc = statusConfig[member.status];
                                const mc = membershipConfig[member.membershipType];
                                return (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-muted/20 transition-base cursor-pointer group"
                                        onClick={() => setSelectedMember(member)}
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                    {member.initials}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{member.name}</p>
                                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-muted-foreground">{member.phone}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex gap-1 flex-wrap">
                                                {member.departments.slice(0, 2).map((d) => (
                                                    <span key={d} className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                                                        {d}
                                                    </span>
                                                ))}
                                                {member.departments.length > 2 && (
                                                    <span className="text-xs text-muted-foreground">+{member.departments.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-muted-foreground text-sm">
                                            {member.homeChurch || '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 max-w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-primary/70"
                                                        style={{ width: `${member.attendanceRate}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium tabular-nums">{member.attendanceRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-muted-foreground text-sm whitespace-nowrap">
                                            {member.joinedAt}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={cn('text-xs font-medium rounded-full px-2.5 py-0.5', sc.color)}>
                                                {sc.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-smooth">
                                                        <MoreHorizontal className="size-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => setSelectedMember(member)}>View profile</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit member</DropdownMenuItem>
                                                    <DropdownMenuItem>Add follow-up</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Users className="size-10 text-muted-foreground/30 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">No members found</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>

            <MemberProfile member={selectedMember} onClose={() => setSelectedMember(null)} />
        </>
    );
}

Members.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Members', href: '/members' },
    ],
};
