import { Head, usePage } from '@inertiajs/react';
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
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockDepartments, mockMembers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceType = 'sunday' | 'midweek' | 'special' | 'prayer' | 'home_church';
type AttendanceStatus = 'present' | 'absent' | 'excused';

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
    { value: 'sunday',      label: 'Sunday Service' },
    { value: 'midweek',     label: 'Midweek Service' },
    { value: 'special',     label: 'Special Service' },
    { value: 'prayer',      label: 'Prayer Meeting' },
    { value: 'home_church', label: 'Home Church' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getServiceDates(year: number, month: number, type: ServiceType): string[] {
    const dates: string[] = [];
    const days = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
        const dow = new Date(year, month, d).getDay();
        const str = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if (type === 'sunday'      && dow === 0) dates.push(str);
        if (type === 'midweek'     && dow === 3) dates.push(str);
        if (type === 'prayer'      && dow === 5) dates.push(str);
        if (type === 'special'     && d === 15)  dates.push(str);
        if (type === 'home_church' && dow === 6) dates.push(str);
    }
    return dates;
}

// seed mock data
function seedData(members: typeof mockMembers, dates: string[]) {
    const out: Record<string, Record<string, AttendanceStatus>> = {};
    members.forEach(m => {
        out[m.id] = {};
        dates.forEach(d => {
            const r = Math.random();
            out[m.id][d] = r > 0.25 ? 'present' : r > 0.1 ? 'absent' : 'excused';
        });
    });
    return out;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Attendance() {
    const now = new Date();

    const [year,        setYear]        = useState(now.getFullYear());
    const [month,       setMonth]       = useState(now.getMonth());
    const [serviceType, setServiceType] = useState<ServiceType>('sunday');
    const [deptFilter,  setDeptFilter]  = useState('all');
    const [search,      setSearch]      = useState('');
    const [view,        setView]        = useState<'take' | 'summary'>('take');

    // all session dates for the selected month + type
    const allDates = useMemo(() => getServiceDates(year, month, serviceType), [year, month, serviceType]);

    // active session = last date in list (most recent)
    const [activeDate, setActiveDate] = useState<string>(() => {
        const d = getServiceDates(now.getFullYear(), now.getMonth(), 'sunday');
        return d[d.length - 1] ?? '';
    });

    // seed attendance once
    const [attendance, setAttendance] = useState<Record<string, Record<string, AttendanceStatus>>>(() => {
        const dates = getServiceDates(now.getFullYear(), now.getMonth(), 'sunday');
        return seedData(mockMembers, dates);
    });

    // selected member IDs for bulk actions
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // filtered members
    const deptOptions = [{ value: 'all', label: 'All Members' }, ...mockDepartments.map(d => ({ value: d.name, label: d.name }))];
    const baseMembers = deptFilter === 'all' ? mockMembers : mockMembers.filter(m => m.departments.includes(deptFilter));
    const members     = search ? baseMembers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)) : baseMembers;

    // make sure activeDate is valid when dates change
    const currentDate = allDates.includes(activeDate) ? activeDate : allDates[allDates.length - 1] ?? '';

    function setStatus(memberId: string, date: string, status: AttendanceStatus) {
        setAttendance(prev => ({ ...prev, [memberId]: { ...(prev[memberId] ?? {}), [date]: status } }));
    }

    function bulkMark(status: AttendanceStatus) {
        if (selected.size === 0) return;
        setAttendance(prev => {
            const next = { ...prev };
            selected.forEach(id => { next[id] = { ...(next[id] ?? {}), [currentDate]: status }; });
            return next;
        });
        toast.success(`${selected.size} member${selected.size !== 1 ? 's' : ''} marked as ${status}.`);
        setSelected(new Set());
    }

    function markAll(status: AttendanceStatus) {
        setAttendance(prev => {
            const next = { ...prev };
            members.forEach(m => { next[m.id] = { ...(next[m.id] ?? {}), [currentDate]: status }; });
            return next;
        });
        toast.success(`All ${members.length} members marked as ${status}.`);
    }

    function toggleSelect(id: string) {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleSelectAll() {
        if (selected.size === members.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(members.map(m => m.id)));
        }
    }

    function prevMonth() {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    }
    function nextMonth() {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    }

    // stats for current date
    const presentCount = members.filter(m => attendance[m.id]?.[currentDate] === 'present').length;
    const absentCount  = members.filter(m => attendance[m.id]?.[currentDate] === 'absent').length;
    const excusedCount = members.filter(m => attendance[m.id]?.[currentDate] === 'excused').length;
    const unmarked     = members.filter(m => !attendance[m.id]?.[currentDate]).length;

    // per-member monthly stats for summary
    function memberMonthStats(id: string) {
        const present = allDates.filter(d => attendance[id]?.[d] === 'present').length;
        const total   = allDates.length;
        return { present, total, pct: total > 0 ? Math.round((present / total) * 100) : 0 };
    }

    return (
        <>
            <Head title="Attendance" />
            <div className="flex flex-col h-full overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Attendance</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {MONTHS[month]} {year} · {SERVICE_TYPES.find(s => s.value === serviceType)?.label}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                        <Download className="size-3.5" />
                        Export
                    </Button>
                </div>

                {/* ── Toolbar ── */}
                <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-border shrink-0">
                    {/* Month nav */}
                    <div className="flex items-center rounded-lg border border-border overflow-hidden">
                        <button onClick={prevMonth} className="flex size-8 items-center justify-center hover:bg-muted transition-colors">
                            <ChevronLeft className="size-4" />
                        </button>
                        <span className="px-3 text-sm font-medium">{MONTHS[month]} {year}</span>
                        <button onClick={nextMonth} className="flex size-8 items-center justify-center hover:bg-muted transition-colors">
                            <ChevronRight className="size-4" />
                        </button>
                    </div>

                    {/* Service type */}
                    <select value={serviceType} onChange={e => setServiceType(e.target.value as ServiceType)} className="h-8 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                        {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>

                    {/* Department */}
                    <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="h-8 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                        {deptOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>

                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input className="h-8 pl-8 text-sm bg-muted/50 border-transparent" placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5 ml-auto">
                        {([{ v: 'take', l: 'Take Attendance' }, { v: 'summary', l: 'Summary' }] as const).map(({ v, l }) => (
                            <button key={v} onClick={() => setView(v as typeof view)} className={cn('px-3 py-1 rounded-md text-xs font-medium transition-base', view === v ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                {view === 'take' && (
                    <>
                        {/* ── Session picker + stats ── */}
                        {allDates.length > 0 && (
                            <div className="px-6 py-3 border-b border-border bg-muted/20 shrink-0">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    {/* Date tabs */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-medium text-muted-foreground mr-1">Session:</span>
                                        {allDates.map(d => (
                                            <button
                                                key={d}
                                                onClick={() => { setActiveDate(d); setSelected(new Set()); }}
                                                className={cn(
                                                    'px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                                                    currentDate === d
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'border-border bg-background hover:border-primary/40 text-muted-foreground hover:text-foreground',
                                                )}
                                            >
                                                {d.slice(5)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Stats pills */}
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

                        {/* ── Bulk action bar (appears when items selected) ── */}
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

                        {/* ── Member list ── */}
                        {allDates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
                                <CalendarDays className="size-10 text-muted-foreground/30 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">No sessions in {MONTHS[month]} {year}</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto scrollbar-thin">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="border-b border-border bg-muted/80 backdrop-blur-sm">
                                            {/* Select all checkbox */}
                                            <th className="px-5 py-2.5 w-10">
                                                <button
                                                    onClick={toggleSelectAll}
                                                    className={cn(
                                                        'flex size-5 items-center justify-center rounded border-2 transition-all',
                                                        selected.size === members.length && members.length > 0
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-border hover:border-primary/60',
                                                    )}
                                                >
                                                    {selected.size === members.length && members.length > 0 && <Check className="size-3" />}
                                                </button>
                                            </th>
                                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 uppercase tracking-wider">Member</th>
                                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 uppercase tracking-wider hidden sm:table-cell">Department</th>
                                            <th className="text-center text-xs font-medium text-muted-foreground px-4 py-2.5 uppercase tracking-wider">Status</th>
                                            {/* Mark all buttons */}
                                            <th className="px-4 py-2.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <span className="text-[10px] text-muted-foreground mr-1">Mark all:</span>
                                                    <button onClick={() => markAll('present')} className="text-[10px] rounded-md px-2 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 transition-colors font-medium">✓ Present</button>
                                                    <button onClick={() => markAll('absent')}  className="text-[10px] rounded-md px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors font-medium">✗ Absent</button>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {members.map(member => {
                                            const status    = attendance[member.id]?.[currentDate] ?? null;
                                            const isSelected = selected.has(member.id);

                                            return (
                                                <tr
                                                    key={member.id}
                                                    className={cn('transition-colors', isSelected ? 'bg-primary/5' : 'hover:bg-muted/20')}
                                                >
                                                    {/* Checkbox */}
                                                    <td className="px-5 py-3">
                                                        <button
                                                            onClick={() => toggleSelect(member.id)}
                                                            className={cn(
                                                                'flex size-5 items-center justify-center rounded border-2 transition-all',
                                                                isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/60',
                                                            )}
                                                        >
                                                            {isSelected && <Check className="size-3" />}
                                                        </button>
                                                    </td>

                                                    {/* Member */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                                {member.initials}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{member.name}</p>
                                                                <p className="text-xs text-muted-foreground">{member.phone}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Dept */}
                                                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                                                        {member.departments[0] || '—'}
                                                    </td>

                                                    {/* Status toggle — 3 big buttons */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {([
                                                                { s: 'present', label: 'Present', active: 'bg-emerald-500 text-white border-emerald-500', idle: 'border-border text-muted-foreground hover:border-emerald-400 hover:text-emerald-600', icon: Check },
                                                                { s: 'absent',  label: 'Absent',  active: 'bg-red-500 text-white border-red-500',         idle: 'border-border text-muted-foreground hover:border-red-400 hover:text-red-600',    icon: X },
                                                                { s: 'excused', label: 'Excused', active: 'bg-amber-500 text-white border-amber-500',      idle: 'border-border text-muted-foreground hover:border-amber-400 hover:text-amber-600', icon: CalendarDays },
                                                            ] as const).map(({ s, label, active, idle, icon: Icon }) => (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => setStatus(member.id, currentDate, s)}
                                                                    className={cn(
                                                                        'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                                                                        status === s ? active : idle,
                                                                    )}
                                                                >
                                                                    <Icon className="size-3.5" />
                                                                    <span className="hidden sm:inline">{label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>

                                                    {/* Monthly rate */}
                                                    <td className="px-4 py-3 text-right">
                                                        {allDates.length > 0 && (() => {
                                                            const { pct } = memberMonthStats(member.id);
                                                            return (
                                                                <span className={cn('text-xs font-semibold tabular-nums', pct >= 70 ? 'text-emerald-600' : 'text-red-500')}>
                                                                    {pct}%
                                                                </span>
                                                            );
                                                        })()}
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
                                { label: 'Members',        value: members.length,  icon: Users,        color: 'text-primary' },
                                { label: 'Avg Attendance', value: `${Math.round(members.reduce((s, m) => s + memberMonthStats(m.id).pct, 0) / (members.length || 1))}%`, icon: TrendingUp, color: 'text-emerald-600' },
                                { label: 'Sessions',       value: allDates.length, icon: CalendarDays, color: 'text-blue-600' },
                                { label: 'Below 50%',      value: members.filter(m => memberMonthStats(m.id).pct < 50).length, icon: TrendingDown, color: 'text-red-500' },
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

                        {/* Member summary table */}
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
                                        const { present, total, pct } = memberMonthStats(m.id);
                                        const absent  = allDates.filter(d => attendance[m.id]?.[d] === 'absent').length;
                                        const excused = allDates.filter(d => attendance[m.id]?.[d] === 'excused').length;
                                        return (
                                            <tr key={m.id} className="hover:bg-muted/20 transition-base">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{m.initials}</div>
                                                        <p className="text-sm font-medium">{m.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-xs text-muted-foreground">{m.departments[0] || '—'}</td>
                                                <td className="px-5 py-3 text-emerald-600 font-semibold">{present}</td>
                                                <td className="px-5 py-3 text-red-500 font-semibold">{absent}</td>
                                                <td className="px-5 py-3 text-amber-600 font-semibold">{excused}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                                                            <div className={cn('h-full rounded-full', pct >= 70 ? 'bg-emerald-500' : 'bg-red-400')} style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className={cn('text-xs font-semibold tabular-nums', pct >= 70 ? 'text-emerald-600' : 'text-red-500')}>{pct}%</span>
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
