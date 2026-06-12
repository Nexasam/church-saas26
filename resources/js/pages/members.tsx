import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    Check,
    ChevronRight,
    Download,
    FileUp,
    Filter,
    Mail,
    MoreHorizontal,
    Phone,
    Plus,
    Search,
    User,
    Users,
    X,
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

// ── Attendance Log ────────────────────────────────────────────────────────────

type AttendanceEntry = {
    id: string;
    date: string;
    service: string;
    attended: boolean;
    markedBy?: string;
};

function AttendanceLog({ member }: { member: Member }) {
    const [tab, setTab] = useState<'attended' | 'absent'>('attended');
    const [markOpen, setMarkOpen] = useState(false);
    const [newService, setNewService] = useState('Sunday Service');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [search, setSearch] = useState('');

    const [entries, setEntries] = useState<AttendanceEntry[]>([
        { id: 'a1', date: '2026-06-08', service: 'Sunday Service',  attended: true,  markedBy: 'System' },
        { id: 'a2', date: '2026-06-04', service: 'Midweek Service', attended: false, markedBy: 'Sis. Admin' },
        { id: 'a3', date: '2026-06-01', service: 'Sunday Service',  attended: true,  markedBy: 'System' },
        { id: 'a4', date: '2026-05-25', service: 'Sunday Service',  attended: true,  markedBy: 'System' },
        { id: 'a5', date: '2026-05-22', service: 'Midweek Service', attended: false, markedBy: 'Sis. Admin' },
        { id: 'a6', date: '2026-05-18', service: 'Sunday Service',  attended: true,  markedBy: 'System' },
    ]);

    const attended = entries.filter(e => e.attended);
    const absent   = entries.filter(e => !e.attended);
    const base     = tab === 'attended' ? attended : absent;
    const shown    = search
        ? base.filter(e =>
            e.service.toLowerCase().includes(search.toLowerCase()) ||
            e.date.includes(search) ||
            e.markedBy?.toLowerCase().includes(search.toLowerCase())
          )
        : base;

    function markAttendance(attended: boolean) {
        setEntries(prev => [{
            id: `a${Date.now()}`,
            date: newDate,
            service: newService,
            attended,
            markedBy: 'You',
        }, ...prev]);
        setMarkOpen(false);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attendance</h4>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => setMarkOpen(true)}>
                    <Plus className="size-3" />
                    Mark Attendance
                </Button>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5 mb-3">
                <button
                    onClick={() => { setTab('attended'); setSearch(''); }}
                    className={cn(
                        'flex items-center gap-1.5 flex-1 justify-center py-1 rounded-md text-xs font-medium transition-all',
                        tab === 'attended' ? 'bg-background shadow-xs text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    <Check className="size-3 text-emerald-600" />
                    Attended
                    <span className="font-bold">{attended.length}</span>
                </button>
                <button
                    onClick={() => { setTab('absent'); setSearch(''); }}
                    className={cn(
                        'flex items-center gap-1.5 flex-1 justify-center py-1 rounded-md text-xs font-medium transition-all',
                        tab === 'absent' ? 'bg-background shadow-xs text-red-600 dark:text-red-400' : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    <X className="size-3 text-red-500" />
                    Not Attended
                    <span className="font-bold">{absent.length}</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                    className="h-8 pl-8 text-xs bg-muted/50 border-transparent"
                    placeholder="Search by service, date, marked by..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <button className="absolute right-2.5 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}>
                        <X className="size-3.5 text-muted-foreground" />
                    </button>
                )}
            </div>

            {/* Entries */}
            <div className="flex flex-col gap-2">
                {shown.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                        {search ? `No results for "${search}"` : 'No records'}
                    </p>
                ) : shown.map(entry => (
                    <div key={entry.id} className={cn(
                        'flex items-center gap-3 rounded-xl border p-3',
                        entry.attended
                            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20'
                            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
                    )}>
                        <div className={cn(
                            'flex size-7 shrink-0 items-center justify-center rounded-full',
                            entry.attended ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40',
                        )}>
                            {entry.attended
                                ? <Check className="size-3.5 text-emerald-600" />
                                : <X className="size-3.5 text-red-500" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">{entry.service}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.date} · by {entry.markedBy}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mark Attendance Dialog */}
            <Dialog open={markOpen} onOpenChange={setMarkOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="size-4 text-primary" />
                            Mark Attendance — {member.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Service</label>
                            <select
                                value={newService}
                                onChange={e => setNewService(e.target.value)}
                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option>Sunday Service</option>
                                <option>Midweek Service</option>
                                <option>Special Service</option>
                                <option>Prayer Meeting</option>
                                <option>Home Church</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Date</label>
                            <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="h-9" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => markAttendance(true)}>
                                <Check className="size-4" /> Attended
                            </Button>
                            <Button variant="outline" className="gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400" onClick={() => markAttendance(false)}>
                                <X className="size-4" /> Not Attended
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────

function EditProfileModal({ member, open, onClose }: { member: Member; open: boolean; onClose: () => void }) {
    const [form, setForm] = useState({
        name:           member.name,
        phone:          member.phone,
        email:          member.email,
        dob:            member.dob ?? '',
        gender:         member.gender,
        occupation:     member.occupation ?? '',
        address:        member.address ?? '',
        homeChurch:     member.homeChurch ?? '',
        membershipType: member.membershipType,
        status:         member.status,
    });

    function set(key: string, val: string) {
        setForm(prev => ({ ...prev, [key]: val }));
    }

    function save() {
        // When backend is wired: PATCH /members/{id}
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="size-4 text-primary" />
                        Edit Profile — {member.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Name */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name *</label>
                        <Input value={form.name} onChange={e => set('name', e.target.value)} className="h-9" />
                    </div>

                    {/* Phone + Email */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone</label>
                            <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234 800 000 0000" className="h-9" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
                            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="h-9" />
                        </div>
                    </div>

                    {/* DOB + Gender */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Date of Birth</label>
                            <Input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className="h-9" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Gender</label>
                            <select
                                value={form.gender}
                                onChange={e => set('gender', e.target.value)}
                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    {/* Occupation */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Occupation</label>
                        <Input value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="e.g. Software Engineer" className="h-9" />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Address</label>
                        <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. 14 Church Street, Lagos" className="h-9" />
                    </div>

                    {/* Home Church */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Home Church / Zone</label>
                        <Input value={form.homeChurch} onChange={e => set('homeChurch', e.target.value)} placeholder="e.g. Zone 5 HC" className="h-9" />
                    </div>

                    {/* Membership Type + Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Membership Type</label>
                            <select
                                value={form.membershipType}
                                onChange={e => set('membershipType', e.target.value)}
                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="full">Full Member</option>
                                <option value="associate">Associate</option>
                                <option value="visitor">Visitor</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Status</label>
                            <select
                                value={form.status}
                                onChange={e => set('status', e.target.value)}
                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="new">New</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <Button className="flex-1" onClick={save}>Save Changes</Button>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Member Profile ────────────────────────────────────────────────────────────

function MemberProfile({ member, onClose, attendancePeriod }: {
    member: Member | null;
    onClose: () => void;
    attendancePeriod: 'monthly' | 'quarterly';
}) {
    if (!member) return null;
    const sc = statusConfig[member.status];
    const mc = membershipConfig[member.membershipType];
    const [editOpen, setEditOpen] = useState(false);

    const getAttendanceRate = (base: number) => {
        if (attendancePeriod === 'quarterly') return Math.min(100, Math.round(base * 0.92));
        return base;
    };

    return (
        <>
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
                                <p className="text-lg font-bold">{getAttendanceRate(member.attendanceRate)}%</p>
                                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{attendancePeriod}</p>
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

                    {/* Attendance Log */}
                    <div className="px-6 py-4">
                        <AttendanceLog member={member} />
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border p-4 flex gap-2">
                    <Button className="flex-1" size="sm" onClick={() => setEditOpen(true)}>
                        Edit Profile
                    </Button>
                    <Button variant="outline" className="flex-1 gap-1.5" size="sm">
                        <Phone className="size-3.5" />
                        Contact
                    </Button>
                </div>
            </SheetContent>
        </Sheet>

        <EditProfileModal member={member} open={editOpen} onClose={() => setEditOpen(false)} />
        </>
    );
}

// ── Import Modal ──────────────────────────────────────────────────────────────

function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string[][]>([]);
    const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');

    function handleFile(f: File) {
        setFile(f);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.trim().split('\n').map(r => r.split(',').map(c => c.replace(/^"|"$/g, '').trim()));
            setPreview(rows.slice(0, 6)); // show first 5 rows + header
            setStep('preview');
        };
        reader.readAsText(f);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) handleFile(f);
    }

    function reset() {
        setFile(null);
        setPreview([]);
        setStep('upload');
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileUp className="size-4 text-primary" />
                        Import Members
                    </DialogTitle>
                </DialogHeader>

                {step === 'upload' && (
                    <div className="flex flex-col gap-4 py-2">
                        {/* Drop zone */}
                        <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            className={cn(
                                'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer',
                                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30',
                            )}
                            onClick={() => document.getElementById('member-file-input')?.click()}
                        >
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <FileUp className="size-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Drop your file here or click to browse</p>
                                <p className="text-xs text-muted-foreground mt-1">Supports CSV and Excel (.xlsx)</p>
                            </div>
                            <input
                                id="member-file-input"
                                type="file"
                                accept=".csv,.xlsx"
                                className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                            />
                        </div>

                        {/* Template download */}
                        <div className="flex items-center justify-between rounded-lg bg-muted/50 border border-border px-4 py-3">
                            <div>
                                <p className="text-xs font-medium">Need a template?</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Download the CSV template with required columns</p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1.5 shrink-0"
                                onClick={() => {
                                    const header = 'first_name,last_name,email,phone,gender,dob,address,occupation,membership_type,joined_at,departments,home_church\n';
                                    const example = 'John,Doe,john@example.com,+234 800 000 0000,male,1990-01-01,Lagos,Engineer,full,2024-01-01,Ushering,Zone 1 HC\n';
                                    const blob = new Blob([header + example], { type: 'text/csv' });
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(blob);
                                    a.download = 'members_template.csv';
                                    a.click();
                                }}
                            >
                                <Download className="size-3" />
                                Template
                            </Button>
                        </div>

                        {/* Column guide */}
                        <div className="rounded-lg border border-border overflow-hidden">
                            <div className="px-3 py-2 bg-muted/50 border-b border-border">
                                <p className="text-xs font-semibold">Required columns</p>
                            </div>
                            <div className="p-3 grid grid-cols-2 gap-1.5">
                                {['first_name', 'last_name', 'email', 'phone', 'gender', 'membership_type'].map(col => (
                                    <div key={col} className="flex items-center gap-1.5 text-xs">
                                        <Check className="size-3 text-emerald-500 shrink-0" />
                                        <code className="text-muted-foreground">{col}</code>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 'preview' && preview.length > 0 && (
                    <div className="flex flex-col gap-4 py-2">
                        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
                            <Check className="size-4 text-emerald-600 shrink-0" />
                            <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                <span className="font-medium">{file?.name}</span> — {preview.length - 1} member{preview.length - 1 !== 1 ? 's' : ''} detected
                            </p>
                        </div>

                        <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        {preview[0]?.map((col, i) => (
                                            <th key={i} className="text-left px-3 py-2 font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {preview.slice(1).map((row, i) => (
                                        <tr key={i} className="hover:bg-muted/20">
                                            {row.map((cell, j) => (
                                                <td key={j} className="px-3 py-2 text-muted-foreground whitespace-nowrap">{cell || '—'}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="gap-1.5" onClick={reset}>
                                <X className="size-3.5" />
                                Change file
                            </Button>
                            <Button
                                className="flex-1 gap-2"
                                onClick={() => setStep('done')}
                            >
                                <FileUp className="size-4" />
                                Import {preview.length - 1} Members
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'done' && (
                    <div className="flex flex-col items-center gap-4 py-8 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <Check className="size-7 text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-emerald-700 dark:text-emerald-400">Import successful!</p>
                            <p className="text-sm text-muted-foreground mt-1">{preview.length - 1} members have been added to the list.</p>
                        </div>
                        <Button onClick={() => { reset(); onClose(); }}>Done</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ── Export helper ─────────────────────────────────────────────────────────────

function exportMembersCSV(members: typeof mockMembers) {
    const header = ['Name', 'Email', 'Phone', 'Gender', 'Status', 'Membership Type', 'Departments', 'Home Church', 'Joined At', 'Attendance Rate'];
    const rows = members.map(m => [
        m.name, m.email, m.phone, m.gender, m.status, m.membershipType,
        m.departments.join(' | '), m.homeChurch ?? '', m.joinedAt, `${m.attendanceRate}%`,
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `members_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

export default function Members() {
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'new'>('all');
    const [attendancePeriod, setAttendancePeriod] = useState<'monthly' | 'quarterly'>('monthly');
    const [importOpen, setImportOpen] = useState(false);

    // Simulate different attendance rates per period
    const getAttendanceRate = (base: number, period: 'monthly' | 'quarterly') => {
        if (period === 'quarterly') return Math.min(100, Math.round(base * 0.92));
        return base;
    };

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
                        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => setImportOpen(true)}>
                            <FileUp className="size-3.5" />
                            Import
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => exportMembersCSV(filtered)}>
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
                    {/* Attendance period toggle */}
                    <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5 ml-auto">
                        {(['monthly', 'quarterly'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setAttendancePeriod(p)}
                                className={cn(
                                    'px-3 py-1 rounded-md text-xs font-medium transition-base capitalize',
                                    attendancePeriod === p
                                        ? 'bg-background shadow-xs text-foreground'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {p}
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
                                {['Member', 'Departments', 'Home Church', `Attendance (${attendancePeriod === 'monthly' ? 'Monthly' : 'Quarterly'})`, 'Joined', 'Status', ''].map((h) => (
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
                                                    <p className="text-xs text-muted-foreground">{member.phone}</p>
                                                </div>
                                            </div>
                                        </td>
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
                                                        style={{ width: `${getAttendanceRate(member.attendanceRate, attendancePeriod)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium tabular-nums">{getAttendanceRate(member.attendanceRate, attendancePeriod)}%</span>
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

            <MemberProfile member={selectedMember} onClose={() => setSelectedMember(null)} attendancePeriod={attendancePeriod} />
            <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
        </>
    );
}

Members.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Members', href: '/members' },
    ],
};
