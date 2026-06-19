import { Head, router, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Download,
    Search,
    TrendingDown,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceType = 'sunday' | 'midweek' | 'special' | 'prayer' | 'home_church';
type AttendanceStatus = 'present' | 'absent' | 'excused';

type MemberRow = {
    id: number;
    name: string;
    initials: string;
    phone: string | null;
    departments: string[];
};

type Department = { id: number; name: string };

type Summary = Record<string, { present: number; absent: number; excused: number; total: number }>;

type PageProps = {
    members:       MemberRow[];
    dates:         string[];
    attendanceMap: Record<number, Record<string, AttendanceStatus>>;
    departments:   Department[];
    summary:       Summary;
    filters: {
        year:         number;
        month:        number;
        service_type: string;
        department:   string;
    };
};

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
    { value: 'sunday',      label: 'Sunday Service' },
    { value: 'midweek',     label: 'Midweek Service' },
    { value: 'special',     label: 'Special Service' },
    { value: 'prayer',      label: 'Prayer Meeting' },
    { value: 'home_church', label: 'Home Church' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Attendance() {
    const { members, dates, attendanceMap: initialMap, departments, summary, filters } = usePage<PageProps>().props;

    const [search,   setSearch]   = useState('');
    const [view,     setView]     = useState<'take' | 'summary'>('take');
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [activeDate, setActiveDate] = useState<string>(dates[dates.length - 1] ?? '');

    // Local attendance state — starts from server data, updated optimistically
    const [attendance, setAttendance] = useState<Record<number, Record<string, AttendanceStatus>>>(() => {
        const map: Record<number, Record<string, AttendanceStatus>> = {};
        for (const [mid, dates] of Object.entries(initialMap)) {
            map[Number(mid)] = dates as Record<string, AttendanceStatus>;
        }
        return map;
    });

    const currentDate    = dates.includes(activeDate) ? activeDate : dates[dates.length - 1] ?? '';
    const serviceName    = SERVICE_TYPES.find(s => s.value === filters.service_type)?.label ?? 'Service';
    const deptOptions    = [{ value: 'all', label: 'All Members' }, ...departments.map(d => ({ value: d.name, label: d.name }))];
    const filteredMembers = search
        ? members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || (m.phone ?? '').includes(search))
        : members;

    // ── Navigation ──────────────────────────────────────────────────────────

    function navigate(params: Partial<typeof filters>) {
        setSelected(new Set());
        router.get('/attendance', { ...filters, ...params }, { preserveScroll: true });
    }

    function prevMonth() {
        const m = filters.month === 1 ? 12 : filters.month - 1;
        const y = filters.month === 1 ? filters.year - 1 : filters.year;
        navigate({ year: y, month: m });
    }

    function nextMonth() {
        const m = filters.month === 12 ? 1 : filters.month + 1;
        const y = filters.month === 12 ? filters.year + 1 : filters.year;
        navigate({ year: y, month: m });
    }

    // ── Attendance actions ───────────────────────────────────────────────────

    function setStatus(memberId: number, date: string, status: AttendanceStatus) {
        // Optimistic update
        setAttendance(prev => ({
            ...prev,
            [memberId]: { ...(prev[memberId] ?? {}), [date]: status },
        }));

        router.post('/attendance/mark', {
            member_id:    memberId,
            service_date: date,
            service_name: serviceName,
            status,
        }, { preserveScroll: true });
    }

    function bulkMark(status: AttendanceStatus) {
        if (selected.size === 0 || !currentDate) return;
        const ids = Array.from(selected);

        // Optimistic update
        setAttendance(prev => {
            const next = { ...prev };
            ids.forEach(id => { next[id] = { ...(next[id] ?? {}), [currentDate]: status }; });
            return next;
        });

        router.post('/attendance/bulk-mark', {
            member_ids:   ids,
            service_date: currentDate,
            service_name: serviceName,
            status,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${ids.length} member${ids.length !== 1 ? 's' : ''} marked as ${status}.`);
                setSelected(new Set());
            },
        });
    }

    function markAll(status: AttendanceStatus) {
        const ids = filteredMembers.map(m => m.id);
        setAttendance(prev => {
            const next = { ...prev };
            ids.forEach(id => { next[id] = { ...(next[id] ?? {}), [currentDate]: status }; });
            return next;
        });

        router.post('/attendance/bulk-mark', {
            member_ids:   ids,
            service_date: currentDate,
            service_name: serviceName,
            status,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(`All ${ids.length} members marked as ${status}.`),
        });
    }

    function toggleSelect(id: number) {
        setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    }

    function toggleSelectAll() {
        setSelected(prev =>
            prev.size === filteredMembers.length
                ? new Set()
                : new Set(filteredMembers.map(m => m.id))
        );
    }

    // ── Stats for current date ───────────────────────────────────────────────

    const presentCount = filteredMembers.filter(m => attendance[m.id]?.[currentDate] === 'present').length;
    const absentCount  = filteredMembers.filter(m => attendance[m.id]?.[currentDate] === 'absent').length;
    const excusedCount = filteredMembers.filter(m => attendance[m.id]?.[currentDate] === 'excused').length;
    const unmarked     = filteredMembers.filter(m => !attendance[m.id]?.[currentDate]).length;

    function memberRate(id: number) {
        if (dates.length === 0) return 0;
        const present = dates.filter(d => attendance[id]?.[d] === 'present').length;
        return Math.round((present / dates.length) * 100);
    }

    return (
        <>
            <Head title="Attendance" />
            <div className="flex flex-col h-full overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Attendance</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {MONTHS[filters.month - 1]} {filters.year} · {serviceName}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5"
                        onClick={() => window.location.href = `/attendance/export?${new URLSearchParams({ year: String(filters.year), month: String(filters.month), service_type: filters.service_type })}`}>
                        <Download className="size-3.5" />
                        Export
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-border shrink-0">
                    {/* Month nav */}
                    <div className="flex items-center rounded-lg border border-border overflow-hidden">
                        <button onClick={prevMonth} className="flex size-8 items-center justify-center hover:bg-muted transition-colors">
                            <ChevronLeft className="size-4" />
                        </button>
                        <span className="px-3 text-sm font-medium">{MONTHS[filters.month - 1]} {filters.year}</span>
                        <button onClick={nextMonth} className="flex size-8 items-center justify-center hover:bg-muted transition-colors">
                            <ChevronRight className="size-4" />
                        </button>
                    </div>

                    {/* Service type */}
                    <select value={filters.service_type} onChange={e => navigate({ service_type: e.target.value })}
                        className="h-8 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                        {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>

                    {/* Department */}
                    <select value={filters.department} onChange={e => navigate({ department: e.target.value })}
                        className="h-8 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                        {deptOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>

                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input className="h-8 pl-8 text-sm bg-muted/50 border-transparent" placeholder="Search members..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5 ml-auto">
                        {([{ v: 'take', l: 'Take Attendance' }, { v: 'summary', l: 'Summary' }] as const).map(({ v, l }) => (
                            <button key={v} onClick={() => setView(v as typeof view)}
                                className={cn('px-3 py-1 rounded-md text-xs font-medium transition-base', view === v ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                {view === 'take' && (
                    <>
                        {/* Session date picker + stats */}
                        {dates.length > 0 && (
                            <div className="px-6 py-3 border-b border-border bg-muted/20 shrink-0">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-medium text-muted-foreground mr-1">Session:</span>
                                        {dates.map(d => (
                                            <button key={d} onClick={() => { setActiveDate(d); setSelected(new Set()); }}
                                                className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                                                    currentDate === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background hover:border-primary/40 text-muted-foreground')}>
                                                {d.slice(5)}
                                            </button>
                                        ))}
                                    </div>
                                    {currentDate && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 font-medium">
                                                <Check className="size-3" /> {presentCount} Present
                                            </span>
                                            <span className="flex items-center gap-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 font-medium">
                                                <X className="size-3" /> {absentCount} Absent
                                            </span>
                                            <span className="flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 font-medium">
                                                <CalendarDays className="size-3" /> {excusedCount} Excused
                                            </span>
                                            {unmarked > 0 && (
                                                <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-1 font-medium">
                                                    {unmarked} unmarked
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Bulk action bar */}
                        {selected.size > 0 && (
                            <div className="flex items-center gap-3 px-6 py-2.5 bg-primary/5 border-b border-primary/20 shrink-0">
                                <span className="text-sm font-medium text-primary">{selected.size} selected</span>
                                <div className="flex items-center gap-2 ml-2">
                                    <Button size="sm" className="h-7 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs" onClick={() => bulkMark('present')}>
                                        <Check className="size-3.5" /> Mark Present
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-7 gap-1.5 border-red-300 text-red-600 hover:bg-red-50 text-xs" onClick={() => bulkMark('absent')}>
                                        <X className="size-3.5" /> Mark Absent
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-7 gap-1.5 border-amber-300 text-amber-600 hover:bg-amber-50 text-xs" onClick={() => bulkMark('excused')}>
                                        <CalendarDays className="size-3.5" /> Mark Excused
                                    </Button>
                                </div>
                                <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
                                    Clear selection
                                </button>
                            </div>
                        )}

                        {/* Member list */}
                        {dates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
                                <CalendarDays className="size-10 text-muted-foreground/30 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">No {serviceName.toLowerCase()} sessions in {MONTHS[filters.month - 1]} {filters.year}</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto scrollbar-thin">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="border-b border-border bg-muted/80 backdrop-blur-sm">
                                            <th className="px-5 py-2.5 w-10">
                                                <button onClick={toggleSelectAll}
                                                    className={cn('flex size-5 items-center justify-center rounded border-2 transition-all',
                                                        selected.size === filteredMembers.length && filteredMembers.length > 0
                                                            ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/60')}>
                                                    {selected.size === filteredMembers.length && filteredMembers.length > 0 && <Check className="size-3" />}
                                                </button>
                                            </th>
                                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 uppercase tracking-wider">Member</th>
                                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 uppercase tracking-wider hidden sm:table-cell">Dept</th>
                                            <th className="text-center text-xs font-medium text-muted-foreground px-4 py-2.5 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-2.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <span className="text-[10px] text-muted-foreground mr-1">Mark all:</span>
                                                    <button onClick={() => markAll('present')} className="text-[10px] rounded-md px-2 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium">✓ Present</button>
                                                    <button onClick={() => markAll('absent')} className="text-[10px] rounded-md px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 font-medium">✗ Absent</button>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredMembers.map(member => {
                                            const status     = attendance[member.id]?.[currentDate] ?? null;
                                            const isSelected = selected.has(member.id);
                                            const rate       = memberRate(member.id);

                                            const statusConfig = {
                                                present: { active: 'bg-emerald-500 text-white border-emerald-500', idle: 'border-border text-muted-foreground hover:border-emerald-400 hover:text-emerald-600', icon: Check },
                                                absent:  { active: 'bg-red-500 text-white border-red-500',     idle: 'border-border text-muted-foreground hover:border-red-400 hover:text-red-600',     icon: X },
                                                excused: { active: 'bg-amber-500 text-white border-amber-500', idle: 'border-border text-muted-foreground hover:border-amber-400 hover:text-amber-600', icon: CalendarDays },
                                            };

                                            return (
                                                <tr key={member.id} className={cn('transition-colors', isSelected ? 'bg-primary/5' : 'hover:bg-muted/20')}>
                                                    <td className="px-5 py-3">
                                                        <button onClick={() => toggleSelect(member.id)}
                                                            className={cn('flex size-5 items-center justify-center rounded border-2 transition-all',
                                                                isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/60')}>
                                                            {isSelected && <Check className="size-3" />}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                                {member.initials}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{member.name}</p>
                                                                <p className="text-xs text-muted-foreground">{member.phone ?? ''}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                                                        {member.departments[0] ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {(['present', 'absent', 'excused'] as const).map(s => {
                                                                const cfg  = statusConfig[s];
                                                                const Icon = cfg.icon;
                                                                return (
                                                                    <button key={s} onClick={() => setStatus(member.id, currentDate, s)}
                                                                        className={cn('flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all capitalize',
                                                                            status === s ? cfg.active : cfg.idle)}>
                                                                        <Icon className="size-3.5" />
                                                                        <span className="hidden sm:inline">{s}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={cn('text-xs font-semibold tabular-nums', rate >= 70 ? 'text-emerald-600' : 'text-red-500')}>
                                                            {rate}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {view === 'summary' && (
                    <div className="flex-1 overflow-y-auto scrollbar-thin p-6 flex flex-col gap-5">
                        {/* KPI cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Members',       value: members.length,                                                          icon: Users,        color: 'text-primary' },
                                { label: 'Avg Rate',      value: `${Math.round(members.reduce((s, m) => s + memberRate(m.id), 0) / (members.length || 1))}%`, icon: TrendingUp, color: 'text-emerald-600' },
                                { label: 'Sessions',      value: dates.length,                                                            icon: CalendarDays,  color: 'text-blue-600' },
                                { label: 'Below 50%',     value: members.filter(m => memberRate(m.id) < 50).length,                       icon: TrendingDown,  color: 'text-red-500' },
                            ].map(s => {
                                const Icon = s.icon;
                                return (
                                    <div key={s.label} className="card-base p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className={cn('size-4', s.color)} />
                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
                                        </div>
                                        <p className={cn('text-2xl font-bold tabular-nums', s.color)}>{s.value}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Per-member table */}
                        <div className="card-base overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        {['Member', 'Dept', 'Present', 'Absent', 'Excused', 'Rate'].map(h => (
                                            <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {members.map(m => {
                                        const present = dates.filter(d => attendance[m.id]?.[d] === 'present').length;
                                        const absent  = dates.filter(d => attendance[m.id]?.[d] === 'absent').length;
                                        const excused = dates.filter(d => attendance[m.id]?.[d] === 'excused').length;
                                        const rate    = memberRate(m.id);
                                        return (
                                            <tr key={m.id} className="hover:bg-muted/20 transition-base">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{m.initials}</div>
                                                        <p className="text-sm font-medium">{m.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-xs text-muted-foreground">{m.departments[0] ?? '—'}</td>
                                                <td className="px-5 py-3 text-emerald-600 font-semibold">{present}</td>
                                                <td className="px-5 py-3 text-red-500 font-semibold">{absent}</td>
                                                <td className="px-5 py-3 text-amber-600 font-semibold">{excused}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                                                            <div className={cn('h-full rounded-full', rate >= 70 ? 'bg-emerald-500' : 'bg-red-400')} style={{ width: `${rate}%` }} />
                                                        </div>
                                                        <span className={cn('text-xs font-semibold tabular-nums', rate >= 70 ? 'text-emerald-600' : 'text-red-500')}>{rate}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Attendance.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Attendance', href: '/attendance' },
    ],
};
