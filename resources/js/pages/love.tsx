import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Baby,
    BookOpen,
    Cake,
    CheckCircle2,
    Diamond,
    Edit,
    GraduationCap,
    Heart,
    HeartHandshake,
    Hospital,
    MessageSquare,
    MoreHorizontal,
    PartyPopper,
    Plus,
    Search,
    Settings,
    Smile,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { mockCareCases, mockMembers, type CareCase } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'care' | 'celebrations' | 'categories' | 'prayer';

type CelebrationCategory = {
    id: string;
    name: string;
    icon: string;
    color: string;
    isSystem: boolean;
    description: string;
};

type Celebration = {
    id: string;
    memberId: string;
    memberName: string;
    initials: string;
    categoryId: string;
    date: string;
    note?: string;
    acknowledged: boolean;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const careTypeConfig: Record<CareCase['type'], { label: string; icon: React.ElementType; color: string; bg: string }> = {
    hospital:    { label: 'Hospitalization', icon: Hospital,       color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30' },
    bereavement: { label: 'Bereavement',     icon: Heart,          color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-100 dark:bg-rose-900/30' },
    counseling:  { label: 'Counseling',      icon: BookOpen,       color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30' },
    crisis:      { label: 'Crisis',          icon: AlertTriangle,  color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30' },
    prayer:      { label: 'Prayer Need',     icon: HeartHandshake, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    general:     { label: 'General',         icon: Users,          color: 'text-slate-600 dark:text-slate-400',  bg: 'bg-slate-100 dark:bg-slate-800' },
};

const statusConfig: Record<CareCase['status'], { label: string; color: string }> = {
    open:        { label: 'Open',        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    resolved:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    escalated:   { label: 'Escalated',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const priorityConfig: Record<CareCase['priority'], { label: string; dot: string }> = {
    urgent: { label: 'Urgent', dot: 'bg-red-500' },
    high:   { label: 'High',   dot: 'bg-orange-500' },
    medium: { label: 'Medium', dot: 'bg-blue-500' },
    low:    { label: 'Low',    dot: 'bg-slate-400' },
};

const celebIconMap: Record<string, React.ElementType> = {
    Cake, Diamond, Baby, GraduationCap, PartyPopper, Heart, Smile, HeartHandshake,
};

const SYSTEM_CATEGORIES: CelebrationCategory[] = [
    { id: 'birthday',     name: 'Birthday',              icon: 'Cake',         color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',     isSystem: true,  description: 'Member birthdays' },
    { id: 'wedding',      name: 'Wedding Anniversary',   icon: 'Diamond',      color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',     isSystem: true,  description: 'Wedding anniversaries' },
    { id: 'baby',         name: 'New Baby',              icon: 'Baby',         color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',     isSystem: true,  description: 'New birth in the family' },
    { id: 'graduation',   name: 'Graduation',            icon: 'GraduationCap', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', isSystem: true,  description: 'Academic or work graduation' },
    { id: 'promotion',    name: 'Job Promotion',         icon: 'PartyPopper',  color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', isSystem: true, description: 'Career promotion or new job' },
];

const MOCK_CELEBRATIONS: Celebration[] = [
    { id: 'c1', memberId: 'm-001', memberName: 'Chidi Nwosu',     initials: 'CN', categoryId: 'birthday',   date: '2026-06-15', note: 'Turning 36!', acknowledged: false },
    { id: 'c2', memberId: 'm-002', memberName: 'Blessing Eze',    initials: 'BE', categoryId: 'wedding',    date: '2026-06-20', note: '5th anniversary',  acknowledged: true },
    { id: 'c3', memberId: 'm-003', memberName: 'Amaka Ugwu',      initials: 'AU', categoryId: 'baby',       date: '2026-06-10', note: 'Baby girl born!',  acknowledged: false },
    { id: 'c4', memberId: 'm-001', memberName: 'Ngozi Okonkwo',   initials: 'NO', categoryId: 'graduation', date: '2026-06-25', note: 'Masters degree',   acknowledged: false },
    { id: 'c5', memberId: 'm-002', memberName: 'Samuel Okafor',   initials: 'SO', categoryId: 'birthday',   date: '2026-07-01', note: 'Turning 45',       acknowledged: false },
];

const MOCK_PRAYERS = [
    { id: 'p1', memberName: 'Sis. Ada Nwosu',       initials: 'AN', request: 'Healing from kidney ailment — doctors have given a concerning report',  date: '2026-06-08', resolved: false },
    { id: 'p2', memberName: 'Bro. Tunde Alabi',     initials: 'TA', request: 'Job opportunity after 3 months of unemployment',                         date: '2026-06-06', resolved: false },
    { id: 'p3', memberName: 'Sis. Chiamaka Obi',    initials: 'CO', request: 'Family reconciliation — estranged from husband',                          date: '2026-06-05', resolved: true  },
    { id: 'p4', memberName: 'Bro. Emmanuel Eze',    initials: 'EE', request: 'Business breakthrough — company facing closure',                           date: '2026-06-03', resolved: false },
];

// ─── Care Case Detail Sheet ───────────────────────────────────────────────────

function CareCaseDetail({ careCase, onClose }: { careCase: CareCase | null; onClose: () => void }) {
    if (!careCase) return null;
    const tc = careTypeConfig[careCase.type];
    const sc = statusConfig[careCase.status];
    const pc = priorityConfig[careCase.priority];
    const TypeIcon = tc.icon;

    return (
        <Sheet open={!!careCase} onOpenChange={o => !o && onClose()}>
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
                    <div className="px-5 py-3.5 border-b border-border flex items-center gap-2 flex-wrap">
                        <span className={cn('text-xs font-medium rounded-full px-2.5 py-1', sc.color)}>{sc.label}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className={cn('size-2 rounded-full', pc.dot)} />
                            {pc.label} priority
                        </span>
                        <span className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1">{tc.label}</span>
                    </div>
                    <div className="px-5 py-4 border-b border-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</h4>
                        <p className="text-sm leading-relaxed">{careCase.description}</p>
                    </div>
                    {careCase.assignedTo && (
                        <div className="px-5 py-4 border-b border-border">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Assigned To</h4>
                            <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 p-2.5">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                    {careCase.assignedTo.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                </div>
                                <span className="text-sm font-medium">{careCase.assignedTo}</span>
                            </div>
                        </div>
                    )}
                    {careCase.notes.length > 0 && (
                        <div className="px-5 py-4 border-b border-border">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Notes</h4>
                            <div className="flex flex-col gap-2">
                                {careCase.notes.map((note, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-muted-foreground">{note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="px-5 py-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Add Note</h4>
                        <textarea className="w-full rounded-lg border border-border bg-muted/50 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring" rows={3} placeholder="Add a progress note..." />
                        <Button className="w-full mt-2" size="sm">Save Note</Button>
                    </div>
                </div>
                <div className="border-t border-border p-4 flex gap-2">
                    <Button className="flex-1 gap-1.5" size="sm">
                        <CheckCircle2 className="size-3.5" />
                        {careCase.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">Escalate</Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ─── Care Tab ─────────────────────────────────────────────────────────────────

function CareTab() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | CareCase['status']>('all');
    const [selectedCase, setSelectedCase] = useState<CareCase | null>(null);

    const filtered = mockCareCases.filter(c => {
        const matchSearch = c.memberName.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <>
            <div className="flex flex-col gap-0">
                <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input className="h-8 pl-8 text-sm bg-muted/50 border-transparent" placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                        {(['all', 'open', 'in_progress', 'resolved', 'escalated'] as const).map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1 rounded-md text-xs font-medium transition-base capitalize', statusFilter === s ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                                {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                    <Button size="sm" className="h-8 gap-1.5 ml-auto">
                        <Plus className="size-3.5" />New Case
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map(careCase => {
                            const tc = careTypeConfig[careCase.type];
                            const sc = statusConfig[careCase.status];
                            const pc = priorityConfig[careCase.priority];
                            const TypeIcon = tc.icon;
                            return (
                                <div key={careCase.id} onClick={() => setSelectedCase(careCase)} className={cn('card-base card-hover p-4 cursor-pointer group', careCase.priority === 'urgent' && 'border-l-4 border-l-red-500', careCase.priority === 'high' && 'border-l-4 border-l-orange-500')}>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', tc.bg)}>
                                            <TypeIcon className={cn('size-4', tc.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold line-clamp-1">{careCase.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{careCase.memberName}</p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="size-6 opacity-0 group-hover:opacity-100 shrink-0"><MoreHorizontal className="size-3.5" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View case</DropdownMenuItem>
                                                <DropdownMenuItem>Assign</DropdownMenuItem>
                                                <DropdownMenuItem>Mark resolved</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{careCase.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={cn('text-xs font-medium rounded-full px-2 py-0.5', sc.color)}>{sc.label}</span>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <span className={cn('size-1.5 rounded-full', pc.dot)} />
                                            {pc.label}
                                        </div>
                                    </div>
                                    {careCase.assignedTo && (
                                        <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border">
                                            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                                {careCase.assignedTo.split(' ').map(w => w[0]).join('').slice(0, 2)}
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

// ─── Celebrations Tab ─────────────────────────────────────────────────────────

function CelebrationsTab({ categories }: { categories: CelebrationCategory[] }) {
    const [celebrations, setCelebrations] = useState(MOCK_CELEBRATIONS);
    const [addOpen, setAddOpen] = useState(false);
    const [form, setForm] = useState({ memberName: '', categoryId: 'birthday', date: '', note: '' });

    const upcoming = celebrations.filter(c => new Date(c.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = celebrations.filter(c => new Date(c.date) < new Date());

    function acknowledge(id: string) {
        setCelebrations(prev => prev.map(c => c.id === id ? { ...c, acknowledged: true } : c));
        toast.success('Celebration acknowledged!');
    }

    function getCategoryById(id: string) {
        return categories.find(c => c.id === id);
    }

    function CelebCard({ cel }: { cel: Celebration }) {
        const cat = getCategoryById(cel.categoryId);
        if (!cat) return null;
        const Icon = celebIconMap[cat.icon] || PartyPopper;
        return (
            <div className={cn('flex items-center gap-3 rounded-xl border p-3.5 transition-all', cel.acknowledged ? 'opacity-60' : 'border-border bg-card')}>
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', cat.color.split(' ').slice(0, 2).join(' '))}>
                    <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{cel.memberName}</p>
                    <p className="text-xs text-muted-foreground">{cat.name} · {cel.date}</p>
                    {cel.note && <p className="text-xs text-muted-foreground/70 mt-0.5 italic">"{cel.note}"</p>}
                </div>
                {!cel.acknowledged ? (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 shrink-0" onClick={() => acknowledge(cel.id)}>
                        <MessageSquare className="size-3" />
                        Reach Out
                    </Button>
                ) : (
                    <span className="text-xs text-emerald-600 font-medium shrink-0">Acknowledged ✓</span>
                )}
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold">Upcoming Celebrations</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{upcoming.length} coming up · {past.length} past</p>
                </div>
                <Button size="sm" className="h-8 gap-1.5" onClick={() => setAddOpen(true)}>
                    <Plus className="size-3.5" />
                    Add Celebration
                </Button>
            </div>

            {/* Upcoming */}
            <div className="flex flex-col gap-2">
                {upcoming.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No upcoming celebrations</p>
                ) : upcoming.map(cel => <CelebCard key={cel.id} cel={cel} />)}
            </div>

            {/* Past */}
            {past.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Past</h4>
                    <div className="flex flex-col gap-2">
                        {past.map(cel => <CelebCard key={cel.id} cel={cel} />)}
                    </div>
                </div>
            )}

            {/* Add celebration dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PartyPopper className="size-4 text-primary" />
                            Log Celebration
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Member</Label>
                            <Input value={form.memberName} onChange={e => setForm(p => ({ ...p, memberName: e.target.value }))} placeholder="e.g. Bro. Samuel" className="h-9" />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Category</Label>
                            <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Date</Label>
                            <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="h-9" />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Note (optional)</Label>
                            <Input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="e.g. Turning 40!" className="h-9" />
                        </div>
                        <div className="flex gap-3 pt-1">
                            <Button className="flex-1" onClick={() => {
                                if (!form.memberName || !form.date) return;
                                setCelebrations(prev => [{
                                    id: `c${Date.now()}`, memberId: '', memberName: form.memberName,
                                    initials: form.memberName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
                                    categoryId: form.categoryId, date: form.date, note: form.note, acknowledged: false,
                                }, ...prev]);
                                setForm({ memberName: '', categoryId: 'birthday', date: '', note: '' });
                                setAddOpen(false);
                                toast.success('Celebration added!');
                            }}>Save</Button>
                            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab({ categories, setCategories }: {
    categories: CelebrationCategory[];
    setCategories: React.Dispatch<React.SetStateAction<CelebrationCategory[]>>;
}) {
    const [addOpen, setAddOpen] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', icon: 'PartyPopper', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' });

    const ICON_CHOICES = ['Cake', 'Diamond', 'Baby', 'GraduationCap', 'PartyPopper', 'Heart', 'Smile', 'HeartHandshake'];
    const COLOR_CHOICES = [
        { label: 'Pink',   value: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',       swatch: 'bg-pink-500' },
        { label: 'Rose',   value: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',       swatch: 'bg-rose-500' },
        { label: 'Blue',   value: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',       swatch: 'bg-blue-500' },
        { label: 'Amber',  value: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',   swatch: 'bg-amber-500' },
        { label: 'Green',  value: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', swatch: 'bg-emerald-500' },
        { label: 'Purple', value: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', swatch: 'bg-purple-500' },
    ];

    return (
        <div className="p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold">Celebration Categories</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{categories.filter(c => c.isSystem).length} system · {categories.filter(c => !c.isSystem).length} custom</p>
                </div>
                <Button size="sm" className="h-8 gap-1.5" onClick={() => setAddOpen(true)}>
                    <Plus className="size-3.5" />
                    Add Category
                </Button>
            </div>

            <div className="card-base overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            {['Category', 'Description', 'Type', ''].map(h => (
                                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {categories.map(cat => {
                            const Icon = celebIconMap[cat.icon] || PartyPopper;
                            return (
                                <tr key={cat.id} className="hover:bg-muted/20 transition-base group">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', cat.color.split(' ').slice(0, 2).join(' '))}>
                                                <Icon className="size-4" />
                                            </div>
                                            <span className="font-medium">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{cat.description}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={cn('text-xs rounded-full px-2.5 py-1 font-medium', cat.isSystem ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary')}>
                                            {cat.isSystem ? 'System' : 'Custom'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {!cat.isSystem && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <Button variant="ghost" size="icon" className="size-7">
                                                    <Edit className="size-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => {
                                                    setCategories(prev => prev.filter(c => c.id !== cat.id));
                                                    toast.success(`"${cat.name}" deleted.`);
                                                }}>
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Add category dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="size-4 text-primary" />
                            Add Custom Category
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Category Name *</Label>
                            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. House Blessing" className="h-9" />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</Label>
                            <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" className="h-9" />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Icon</Label>
                            <div className="flex flex-wrap gap-2">
                                {ICON_CHOICES.map(icon => {
                                    const Icon = celebIconMap[icon] || PartyPopper;
                                    return (
                                        <button key={icon} type="button" onClick={() => setForm(p => ({ ...p, icon }))} className={cn('flex size-9 items-center justify-center rounded-lg border transition-all', form.icon === icon ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}>
                                            <Icon className="size-4" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Colour</Label>
                            <div className="flex gap-2">
                                {COLOR_CHOICES.map(c => (
                                    <button key={c.label} type="button" onClick={() => setForm(p => ({ ...p, color: c.value }))} className={cn('flex size-7 items-center justify-center rounded-full border-2 transition-all', form.color === c.value ? 'border-foreground scale-110' : 'border-transparent')}>
                                        <span className={cn('size-5 rounded-full', c.swatch)} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3 pt-1">
                            <Button className="flex-1" disabled={!form.name} onClick={() => {
                                setCategories(prev => [...prev, { id: `custom-${Date.now()}`, name: form.name, description: form.description, icon: form.icon, color: form.color, isSystem: false }]);
                                setForm({ name: '', description: '', icon: 'PartyPopper', color: COLOR_CHOICES[0].value });
                                setAddOpen(false);
                                toast.success(`"${form.name}" category created.`);
                            }}>Create</Button>
                            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Prayer Board Tab ─────────────────────────────────────────────────────────

function PrayerTab() {
    const [prayers, setPrayers] = useState(MOCK_PRAYERS);
    const [addOpen, setAddOpen] = useState(false);
    const [form, setForm] = useState({ memberName: '', request: '' });
    const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

    const shown = prayers.filter(p => filter === 'all' ? true : filter === 'active' ? !p.resolved : p.resolved);

    function resolve(id: string) {
        setPrayers(prev => prev.map(p => p.id === id ? { ...p, resolved: true } : p));
        toast.success('Prayer request marked as answered!');
    }

    return (
        <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                    {(['all', 'active', 'resolved'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1 rounded-md text-xs font-medium transition-base capitalize', filter === f ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                            {f}
                        </button>
                    ))}
                </div>
                <Button size="sm" className="h-8 gap-1.5" onClick={() => setAddOpen(true)}>
                    <Plus className="size-3.5" />
                    Add Request
                </Button>
            </div>

            <div className="flex flex-col gap-3">
                {shown.map(prayer => (
                    <div key={prayer.id} className={cn('rounded-xl border p-4 transition-all', prayer.resolved ? 'opacity-60 bg-muted/30' : 'bg-card border-border')}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold">
                                    {prayer.initials}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{prayer.memberName}</p>
                                    <p className="text-xs text-muted-foreground">{prayer.date}</p>
                                </div>
                            </div>
                            {prayer.resolved && <span className="text-xs text-emerald-600 font-medium shrink-0">Answered ✓</span>}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{prayer.request}</p>
                        {!prayer.resolved && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => resolve(prayer.id)}>
                                <CheckCircle2 className="size-3.5 text-emerald-600" />
                                Mark Answered
                            </Button>
                        )}
                    </div>
                ))}
                {shown.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">No prayer requests</p>
                )}
            </div>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HeartHandshake className="size-4 text-purple-600" />
                            Add Prayer Request
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Member Name</Label>
                            <Input value={form.memberName} onChange={e => setForm(p => ({ ...p, memberName: e.target.value }))} placeholder="e.g. Sis. Ada" className="h-9" />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Prayer Request</Label>
                            <textarea value={form.request} onChange={e => setForm(p => ({ ...p, request: e.target.value }))} className="w-full rounded-lg border border-border bg-muted/50 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring" rows={3} placeholder="Describe the prayer need..." />
                        </div>
                        <div className="flex gap-3 pt-1">
                            <Button className="flex-1" disabled={!form.memberName || !form.request} onClick={() => {
                                setPrayers(prev => [{ id: `p${Date.now()}`, memberName: form.memberName, initials: form.memberName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(), request: form.request, date: new Date().toISOString().split('T')[0], resolved: false }, ...prev]);
                                setForm({ memberName: '', request: '' });
                                setAddOpen(false);
                                toast.success('Prayer request added.');
                            }}>Add Request</Button>
                            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Love() {
    const [tab, setTab] = useState<Tab>('care');
    const [categories, setCategories] = useState<CelebrationCategory[]>([...SYSTEM_CATEGORIES]);

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'care',         label: 'Care Cases',   icon: HeartHandshake },
        { id: 'celebrations', label: 'Celebrations', icon: PartyPopper },
        { id: 'categories',   label: 'Categories',   icon: Settings },
        { id: 'prayer',       label: 'Prayer Board', icon: Heart },
    ];

    const openCount   = mockCareCases.filter(c => c.status === 'open').length;
    const urgentCount = mockCareCases.filter(c => c.priority === 'urgent').length;
    const unackCelebrations = MOCK_CELEBRATIONS.filter(c => !c.acknowledged && new Date(c.date) >= new Date()).length;

    return (
        <>
            <Head title="Love System" />
            <div className="flex flex-col h-full overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                            <Heart className="size-5 text-rose-500" />
                            Love System
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {openCount} open cases
                            {urgentCount > 0 && <> · <span className="text-red-600 font-medium">{urgentCount} urgent</span></>}
                            {unackCelebrations > 0 && <> · <span className="text-amber-600 font-medium">{unackCelebrations} celebrations pending</span></>}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-0 border-b border-border px-6 shrink-0">
                    {tabs.map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={cn(
                                    'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                                    tab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <Icon className="size-3.5" />
                                {t.label}
                                {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {tab === 'care'         && <CareTab />}
                    {tab === 'celebrations' && <CelebrationsTab categories={categories} />}
                    {tab === 'categories'   && <CategoriesTab categories={categories} setCategories={setCategories} />}
                    {tab === 'prayer'       && <PrayerTab />}
                </div>
            </div>
        </>
    );
}

Love.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Love System', href: '/love' },
    ],
};
