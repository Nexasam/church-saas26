import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Download,
    FileUp,
    Palette,
    Plus,
    Sparkles,
    Upload,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ChurchData = {
    id: number;
    name: string;
    address: string;
    phone: string;
    city: string;
    country: string;
    size: 'small' | 'medium' | 'large' | 'mega';
    theme_color: 'blue' | 'purple' | 'emerald' | 'rose' | 'amber' | 'slate';
};

type PageProps = {
    church: ChurchData;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const STEPS = [
    { id: 1, label: 'Church Profile', icon: Building2 },
    { id: 2, label: 'Departments',    icon: Users },
    { id: 3, label: 'Theme',          icon: Palette },
    { id: 4, label: 'Import Members', icon: Upload },
    { id: 5, label: 'Choose Plan',    icon: CreditCard },
];

const CHURCH_SIZES = [
    { value: 'small',      label: 'Small',      desc: 'Under 100 members' },
    { value: 'medium',     label: 'Medium',     desc: '100 – 500 members' },
    { value: 'large',      label: 'Large',      desc: '500 – 2,000 members' },
    { value: 'mega',       label: 'Mega Church', desc: '2,000+ members' },
];

const THEME_OPTIONS = [
    {
        value: 'blue',
        label: 'Royal Blue',
        desc: 'Classic and professional',
        primary: 'bg-blue-600',
        ring: 'ring-blue-500',
        preview: ['bg-blue-600', 'bg-blue-100', 'bg-blue-50'],
    },
    {
        value: 'purple',
        label: 'Royal Purple',
        desc: 'Bold and spiritual',
        primary: 'bg-purple-600',
        ring: 'ring-purple-500',
        preview: ['bg-purple-600', 'bg-purple-100', 'bg-purple-50'],
    },
    {
        value: 'emerald',
        label: 'Kingdom Green',
        desc: 'Fresh and vibrant',
        primary: 'bg-emerald-600',
        ring: 'ring-emerald-500',
        preview: ['bg-emerald-600', 'bg-emerald-100', 'bg-emerald-50'],
    },
    {
        value: 'rose',
        label: 'Passion Red',
        desc: 'Warm and passionate',
        primary: 'bg-rose-600',
        ring: 'ring-rose-500',
        preview: ['bg-rose-600', 'bg-rose-100', 'bg-rose-50'],
    },
    {
        value: 'amber',
        label: 'Golden Glory',
        desc: 'Rich and radiant',
        primary: 'bg-amber-500',
        ring: 'ring-amber-400',
        preview: ['bg-amber-500', 'bg-amber-100', 'bg-amber-50'],
    },
    {
        value: 'slate',
        label: 'Deep Navy',
        desc: 'Elegant and trustworthy',
        primary: 'bg-slate-700',
        ring: 'ring-slate-600',
        preview: ['bg-slate-700', 'bg-slate-200', 'bg-slate-100'],
    },
];

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: '₦15,000',
        period: '/mo',
        desc: 'Small churches getting started',
        members: 'Up to 200 members',
        highlight: false,
        features: [
            'Dashboard & KPIs',
            'Follow-up tracking',
            'Basic finance recording',
            'SMS (100/mo)',
            '1 admin user',
        ],
    },
    {
        id: 'growth',
        name: 'Growth',
        price: '₦35,000',
        period: '/mo',
        desc: 'Growing churches with full needs',
        members: 'Up to 1,000 members',
        highlight: true,
        badge: 'Most Popular',
        features: [
            'Everything in Starter',
            'Full CRM follow-ups',
            'Finance + reconciliation',
            'SMS (500/mo)',
            '5 admin users',
            'Evangelism funnel',
            'Pastoral care cases',
            'Departments management',
        ],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '₦85,000',
        period: '/mo',
        desc: 'Multi-campus churches',
        members: 'Unlimited members',
        highlight: false,
        features: [
            'Everything in Growth',
            'Multi-campus support',
            'Unlimited SMS',
            'Unlimited admins',
            'API access',
            'Custom integrations',
            'Dedicated support',
        ],
    },
];

const SUGGESTED_DEPARTMENTS = [
    'Ushering', 'Choir & Music', 'Children Ministry', 'Youth Ministry',
    'Evangelism', 'Technical Team', 'Women Ministry', 'Men Ministry',
    'Prayer Team', 'Media & Communications', 'Welfare', 'Finance',
];

// ─── Step 1: Church Profile ───────────────────────────────────────────────────

function StepChurch({ church, onNext }: { church: ChurchData; onNext: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        name:    church.name,
        address: church.address,
        phone:   church.phone,
        city:    church.city,
        country: church.country,
        size:    church.size,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/onboarding/church', {
            onSuccess: () => onNext(),
        });
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <Label className="field-label">Church Name <span className="text-destructive">*</span></Label>
                    <Input
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        placeholder="Grace Assembly"
                        className="h-10 mt-1.5"
                        required
                        autoFocus
                    />
                    <InputError message={errors.name} />
                </div>

                <div>
                    <Label className="field-label">Phone Number</Label>
                    <Input
                        value={data.phone}
                        onChange={e => setData('phone', e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="h-10 mt-1.5"
                    />
                    <InputError message={errors.phone} />
                </div>

                <div>
                    <Label className="field-label">City</Label>
                    <Input
                        value={data.city}
                        onChange={e => setData('city', e.target.value)}
                        placeholder="Lagos"
                        className="h-10 mt-1.5"
                    />
                    <InputError message={errors.city} />
                </div>

                <div className="sm:col-span-2">
                    <Label className="field-label">Address</Label>
                    <Input
                        value={data.address}
                        onChange={e => setData('address', e.target.value)}
                        placeholder="14 Church Street, Victoria Island"
                        className="h-10 mt-1.5"
                    />
                    <InputError message={errors.address} />
                </div>
            </div>

            {/* Church size */}
            <div>
                <Label className="field-label mb-2 block">Church Size <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {CHURCH_SIZES.map(s => (
                        <button
                            type="button"
                            key={s.value}
                            onClick={() => setData('size', s.value as typeof data.size)}
                            className={cn(
                                'flex flex-col items-start rounded-xl border p-3.5 text-left transition-all',
                                data.size === s.value
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border hover:border-primary/40 hover:bg-muted/50',
                            )}
                        >
                            <span className="text-sm font-semibold">{s.label}</span>
                            <span className="text-xs text-muted-foreground mt-0.5">{s.desc}</span>
                            {data.size === s.value && (
                                <Check className="size-3.5 text-primary mt-2" />
                            )}
                        </button>
                    ))}
                </div>
                <InputError message={errors.size} />
            </div>

            <Button type="submit" className="w-full h-10 gap-2" disabled={processing}>
                {processing ? <Spinner /> : null}
                Save & Continue
                <ArrowRight className="size-4" />
            </Button>
        </form>
    );
}

// ─── Step 2: Departments ──────────────────────────────────────────────────────

function StepDepartments({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
    const [departments, setDepartments] = useState<string[]>(['']);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<string>('');

    function addDepartment() {
        setDepartments(prev => [...prev, '']);
    }

    function removeDepartment(index: number) {
        setDepartments(prev => prev.filter((_, i) => i !== index));
    }

    function updateDepartment(index: number, value: string) {
        setDepartments(prev => prev.map((d, i) => i === index ? value : d));
    }

    function addSuggested(name: string) {
        const filled = departments.filter(d => d.trim());
        if (filled.includes(name)) return;
        // fill empty slot or add new
        const emptyIdx = departments.findIndex(d => !d.trim());
        if (emptyIdx !== -1) {
            updateDepartment(emptyIdx, name);
        } else {
            setDepartments(prev => [...prev, name]);
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const filled = departments.filter(d => d.trim());
        if (filled.length === 0) {
            setErrors('Add at least one department to continue.');
            return;
        }
        setErrors('');
        setProcessing(true);

        router.post('/onboarding/departments', { departments: filled }, {
            onSuccess: () => { setProcessing(false); onNext(); },
            onError: () => setProcessing(false),
        });
    }

    const filledDepts = departments.filter(d => d.trim());
    const usedSuggestions = filledDepts.map(d => d.toLowerCase());

    return (
        <form onSubmit={submit} className="flex flex-col gap-6">
            {/* Input rows */}
            <div className="flex flex-col gap-2">
                <Label className="field-label">
                    Departments <span className="text-destructive">*</span>
                    <span className="text-muted-foreground font-normal ml-1">(at least one required)</span>
                </Label>
                {departments.map((dept, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Input
                            value={dept}
                            onChange={e => updateDepartment(i, e.target.value)}
                            placeholder={`e.g. ${SUGGESTED_DEPARTMENTS[i] ?? 'Department name'}`}
                            className="h-10 flex-1"
                        />
                        {departments.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeDepartment(i)}
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/40 transition-colors"
                            >
                                <X className="size-3.5 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                ))}
                {errors && <p className="text-xs text-destructive mt-1">{errors}</p>}

                <button
                    type="button"
                    onClick={addDepartment}
                    className="flex items-center gap-2 mt-1 text-sm text-primary hover:underline w-fit"
                >
                    <Plus className="size-3.5" />
                    Add another department
                </button>
            </div>

            {/* Quick-add suggestions */}
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">
                    Quick add common departments
                </p>
                <div className="flex flex-wrap gap-2">
                    {SUGGESTED_DEPARTMENTS.map(name => {
                        const used = usedSuggestions.includes(name.toLowerCase());
                        return (
                            <button
                                type="button"
                                key={name}
                                onClick={() => !used && addSuggested(name)}
                                disabled={used}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                                    used
                                        ? 'border-primary/30 bg-primary/5 text-primary cursor-default'
                                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground cursor-pointer',
                                )}
                            >
                                {used && <Check className="size-3" />}
                                {name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Count badge */}
            {filledDepts.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        <span className="font-semibold">{filledDepts.length}</span> department{filledDepts.length !== 1 ? 's' : ''} ready to be created
                    </p>
                </div>
            )}

            <div className="flex gap-3">
                <Button type="button" variant="outline" className="h-10 gap-2" onClick={onBack}>
                    <ArrowLeft className="size-4" />
                    Back
                </Button>
                <Button type="submit" className="flex-1 h-10 gap-2" disabled={processing}>
                    {processing ? <Spinner /> : null}
                    Save & Continue
                    <ArrowRight className="size-4" />
                </Button>
            </div>
        </form>
    );
}

// ─── Step 3: Theme ────────────────────────────────────────────────────────────

function StepTheme({ church, onNext, onBack, onSkip }: {
    church: ChurchData;
    onNext: () => void;
    onBack: () => void;
    onSkip: () => void;
}) {
    const { data, setData, post, processing } = useForm({
        theme_color: church.theme_color ?? 'blue',
    });

    // Apply current selection to <html> on mount so it matches their saved choice
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', data.theme_color);
    }, []);

    // Apply theme live to <html> so they see it instantly
    function selectTheme(value: string) {
        setData('theme_color', value as typeof data.theme_color);
        document.documentElement.setAttribute('data-theme', value);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/onboarding/theme', { onSuccess: () => onNext() });
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {THEME_OPTIONS.map(theme => {
                    const selected = data.theme_color === theme.value;
                    return (
                        <button
                            type="button"
                            key={theme.value}
                            onClick={() => selectTheme(theme.value)}
                            className={cn(
                                'relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all',
                                selected
                                    ? `border-2 ${theme.ring} ring-2 ring-offset-1 ring-offset-background`
                                    : 'border-border hover:border-border/80 hover:bg-muted/30',
                            )}
                        >
                            {selected && (
                                <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Check className="size-3" />
                                </span>
                            )}

                            {/* Color swatches */}
                            <div className="flex gap-1.5 mb-3">
                                {theme.preview.map((c, i) => (
                                    <div
                                        key={i}
                                        className={cn('rounded-md', c, i === 0 ? 'size-8' : i === 1 ? 'size-6 self-end' : 'size-4 self-end')}
                                    />
                                ))}
                            </div>

                            {/* Mini UI preview */}
                            <div className="w-full rounded-lg border border-border bg-background p-2 mb-3 space-y-1.5">
                                <div className={cn('h-2 w-3/4 rounded-full', theme.preview[0])} />
                                <div className="h-1.5 w-full rounded-full bg-muted" />
                                <div className="h-1.5 w-2/3 rounded-full bg-muted" />
                                <div className={cn('mt-2 h-5 w-full rounded-md', theme.preview[0])} />
                            </div>

                            <p className="text-sm font-semibold">{theme.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{theme.desc}</p>
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <Button type="button" variant="outline" className="h-10 gap-2" onClick={onBack}>
                    <ArrowLeft className="size-4" />
                    Back
                </Button>
                <Button type="submit" className="flex-1 h-10 gap-2" disabled={processing}>
                    {processing ? <Spinner /> : null}
                    Apply Theme
                    <ArrowRight className="size-4" />
                </Button>
            </div>

            <button
                type="button"
                onClick={onSkip}
                className="text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                Skip for now — use default theme
            </button>
        </form>
    );
}

// ─── Step 4: Import Members (optional) ───────────────────────────────────────

function StepImport({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string[][]>([]);
    const [imported, setImported] = useState(false);

    function handleFile(f: File) {
        setFile(f);
        const reader = new FileReader();
        reader.onload = e => {
            const text = e.target?.result as string;
            const rows = text.trim().split('\n').map(r =>
                r.split(',').map(c => c.replace(/^"|"$/g, '').trim())
            );
            setPreview(rows.slice(0, 5));
        };
        reader.readAsText(f);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }

    function downloadTemplate() {
        const header = 'first_name,last_name,email,phone,gender,dob,address,occupation,membership_type,joined_at,departments,home_church\n';
        const example = 'John,Doe,john@example.com,+234 800 000 0000,male,1990-01-01,Lagos,Engineer,full,2024-01-01,Ushering,Zone 1 HC\n';
        const blob = new Blob([header + example], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'members_template.csv';
        a.click();
    }

    function confirmImport() {
        // When backend is wired: POST /onboarding/import-members
        setImported(true);
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Optional badge */}
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
                <Zap className="size-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-400">
                    <span className="font-semibold">Optional</span> — you can always import members later from the Members page.
                </p>
            </div>

            {imported ? (
                /* Success state */
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <CheckCircle2 className="size-7 text-emerald-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">Members imported!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {preview.length > 1 ? `${preview.length - 1} member${preview.length - 1 !== 1 ? 's' : ''} will be added.` : 'Your members are ready.'}
                        </p>
                    </div>
                    <Button className="gap-2" onClick={onNext}>
                        Continue to Plan
                        <ArrowRight className="size-4" />
                    </Button>
                </div>
            ) : (
                <>
                    {/* Drop zone */}
                    {!file ? (
                        <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('ob-file-input')?.click()}
                            className={cn(
                                'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all',
                                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30',
                            )}
                        >
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <FileUp className="size-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Drop your CSV or Excel file here</p>
                                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                            </div>
                            <input
                                id="ob-file-input"
                                type="file"
                                accept=".csv,.xlsx"
                                className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                            />
                        </div>
                    ) : (
                        /* Preview table */
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
                                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 flex-1">
                                    <span className="font-semibold">{file.name}</span> — {preview.length > 1 ? `${preview.length - 1} member${preview.length - 1 !== 1 ? 's' : ''} detected` : 'file loaded'}
                                </p>
                                <button onClick={() => { setFile(null); setPreview([]); }} className="text-muted-foreground hover:text-foreground">
                                    <X className="size-3.5" />
                                </button>
                            </div>
                            <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
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
                                            <tr key={i}>
                                                {row.map((cell, j) => (
                                                    <td key={j} className="px-3 py-2 text-muted-foreground whitespace-nowrap">{cell || '—'}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Template download */}
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 border border-border px-4 py-3">
                        <div>
                            <p className="text-xs font-medium">Need the template?</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Download a pre-formatted CSV with all required columns</p>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 shrink-0" onClick={downloadTemplate}>
                            <Download className="size-3" />
                            Template
                        </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="h-10 gap-2" onClick={onBack}>
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        {file ? (
                            <Button className="flex-1 h-10 gap-2" onClick={confirmImport}>
                                <FileUp className="size-4" />
                                Import {preview.length > 1 ? `${preview.length - 1} Members` : 'Members'}
                            </Button>
                        ) : (
                            <Button className="flex-1 h-10 gap-2" onClick={onNext}>
                                Skip for now
                                <ArrowRight className="size-4" />
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Step 5: Plan + Payment Simulation ───────────────────────────────────────

function StepPlan({ onBack }: { onBack: () => void }) {
    const [selectedPlan, setSelectedPlan] = useState<string>('growth');
    const [payStep, setPayStep] = useState<'select' | 'pay' | 'processing' | 'success'>('select');
    const [processing, setProcessing] = useState(false);

    // Simulated card fields
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    function formatCard(val: string) {
        return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    function formatExpiry(val: string) {
        return val.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2');
    }

    function handlePay(e: React.FormEvent) {
        e.preventDefault();
        setPayStep('processing');
        // Simulate 2s payment processing
        setTimeout(() => {
            setPayStep('success');
            setTimeout(() => {
                router.post('/onboarding/plan', { plan: selectedPlan }, {
                    onStart: () => setProcessing(true),
                });
            }, 1200);
        }, 2000);
    }

    if (payStep === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-5">
                <div className="relative flex size-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <CreditCard className="size-6 text-primary" />
                </div>
                <div className="text-center">
                    <p className="font-semibold">Processing payment...</p>
                    <p className="text-sm text-muted-foreground mt-1">Please don't close this window</p>
                </div>
            </div>
        );
    }

    if (payStep === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-5">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
                <div className="text-center">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">Payment successful!</p>
                    <p className="text-sm text-muted-foreground mt-1">Setting up your church dashboard...</p>
                </div>
                <Spinner className="text-primary" />
            </div>
        );
    }

    if (payStep === 'pay') {
        const plan = PLANS.find(p => p.id === selectedPlan)!;
        return (
            <div className="flex flex-col gap-6">
                {/* Order summary */}
                <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold">{plan.name} Plan</p>
                        <p className="text-xs text-muted-foreground mt-0.5">14-day free trial, then billed monthly</p>
                    </div>
                    <p className="text-xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                </div>

                {/* Trial note */}
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
                    <Sparkles className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-400">14-day free trial</p>
                        <p className="text-xs text-amber-700/80 dark:text-amber-500 mt-0.5">
                            You won't be charged today. Your card is saved for after the trial ends.
                        </p>
                    </div>
                </div>

                {/* Simulated payment form */}
                <form onSubmit={handlePay} className="flex flex-col gap-4">
                    <div>
                        <Label className="field-label">Card Number</Label>
                        <div className="relative mt-1.5">
                            <Input
                                value={cardNumber}
                                onChange={e => setCardNumber(formatCard(e.target.value))}
                                placeholder="0000 0000 0000 0000"
                                className="h-10 pr-12 font-mono"
                                required
                                maxLength={19}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                <div className="size-4 rounded-full bg-red-500 opacity-80" />
                                <div className="size-4 rounded-full bg-amber-400 opacity-80 -ml-2" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="field-label">Expiry</Label>
                            <Input
                                value={expiry}
                                onChange={e => setExpiry(formatExpiry(e.target.value))}
                                placeholder="MM/YY"
                                className="h-10 mt-1.5 font-mono"
                                required
                                maxLength={5}
                            />
                        </div>
                        <div>
                            <Label className="field-label">CVV</Label>
                            <Input
                                value={cvv}
                                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                placeholder="000"
                                className="h-10 mt-1.5 font-mono"
                                type="password"
                                required
                                maxLength={3}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="h-10 gap-2" onClick={() => setPayStep('select')}>
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                        <Button type="submit" className="flex-1 h-10 gap-2">
                            <CreditCard className="size-4" />
                            Start free trial
                        </Button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                        <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Secured by 256-bit SSL encryption
                    </p>
                </form>
            </div>
        );
    }

    // Plan selection view
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {PLANS.map(plan => (
                    <button
                        type="button"
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={cn(
                            'relative flex flex-col text-left rounded-2xl border p-4 transition-all',
                            selectedPlan === plan.id
                                ? 'border-primary ring-2 ring-primary ring-offset-1 ring-offset-background bg-primary/[0.02]'
                                : 'border-border hover:border-primary/40',
                        )}
                    >
                        {plan.badge && (
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
                                {plan.badge}
                            </span>
                        )}
                        {selectedPlan === plan.id && (
                            <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="size-3" />
                            </span>
                        )}

                        <p className="text-sm font-bold">{plan.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 mb-2">{plan.desc}</p>
                        <div className="flex items-end gap-0.5 mb-3">
                            <span className="text-xl font-bold">{plan.price}</span>
                            <span className="text-xs text-muted-foreground mb-1">{plan.period}</span>
                        </div>
                        <p className="text-xs font-medium text-primary mb-2">{plan.members}</p>
                        <ul className="flex flex-col gap-1.5 mt-auto">
                            {plan.features.slice(0, 4).map(f => (
                                <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                    <Check className="size-3 text-emerald-500 shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                            {plan.features.length > 4 && (
                                <li className="text-xs text-muted-foreground pl-4.5">
                                    +{plan.features.length - 4} more...
                                </li>
                            )}
                        </ul>
                    </button>
                ))}
            </div>

            <div className="flex gap-3">
                <Button type="button" variant="outline" className="h-10 gap-2" onClick={onBack}>
                    <ArrowLeft className="size-4" />
                    Back
                </Button>
                <Button
                    type="button"
                    className="flex-1 h-10 gap-2"
                    onClick={() => setPayStep('pay')}
                >
                    Continue to payment
                    <ArrowRight className="size-4" />
                </Button>
            </div>

            <button
                type="button"
                onClick={() => router.post('/onboarding/plan', { plan: selectedPlan })}
                className="text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                Skip payment — explore with 14-day free trial
            </button>
        </div>
    );
}

// ─── Progress Stepper ─────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-0 mb-8">
            {STEPS.map((step, i) => {
                const done = step.id < current;
                const active = step.id === current;
                const Icon = step.icon;
                return (
                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={cn(
                                'flex size-9 items-center justify-center rounded-full border-2 transition-all',
                                done   ? 'border-primary bg-primary text-primary-foreground' :
                                active ? 'border-primary bg-background text-primary' :
                                         'border-border bg-background text-muted-foreground',
                            )}>
                                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
                            </div>
                            <span className={cn(
                                'text-[10px] font-medium whitespace-nowrap hidden sm:block',
                                active ? 'text-foreground' : done ? 'text-primary' : 'text-muted-foreground',
                            )}>
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={cn(
                                'flex-1 h-px mx-2 mb-5 transition-colors',
                                done ? 'bg-primary' : 'bg-border',
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Onboarding() {
    const { church } = usePage<PageProps>().props;
    const [step, setStep] = useState(1);

    const stepTitles: Record<number, { title: string; desc: string }> = {
        1: { title: 'Set up your church profile',  desc: 'Tell us about your church so we can personalise your experience.' },
        2: { title: 'Create your departments',      desc: 'Add at least one department. You can always add more later.' },
        3: { title: 'Choose a theme colour',        desc: 'Pick the primary colour for your Church OS dashboard.' },
        4: { title: 'Import your members',          desc: 'Upload an existing member list. Completely optional — skip if starting fresh.' },
        5: { title: 'Choose your plan',             desc: 'Start with a 14-day free trial. No charge today.' },
    };

    const current = stepTitles[step];

    return (
        <>
            <Head title="Set up your church — Church OS" />

            <div className="min-h-svh flex bg-background">
                {/* Left panel */}
                <div className="hidden lg:flex lg:w-[380px] xl:w-[420px] shrink-0 flex-col justify-between bg-primary p-10 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.06]" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }} />
                    <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-amber-400 opacity-10 blur-3xl -translate-x-1/2 -translate-y-1/2" />

                    {/* Logo */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-white font-bold text-sm border border-white/20">G</div>
                        <div>
                            <p className="text-white font-semibold text-sm">Church OS</p>
                            <p className="text-white/60 text-xs">Setup wizard</p>
                        </div>
                    </div>

                    {/* Steps progress */}
                    <div className="relative z-10 space-y-3">
                        <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-5">Setup checklist</p>
                        {STEPS.map(s => {
                            const done = s.id < step;
                            const active = s.id === step;
                            const Icon = s.icon;
                            return (
                                <div key={s.id} className={cn(
                                    'flex items-center gap-3 rounded-xl p-3 transition-all',
                                    active ? 'bg-white/15' : done ? 'bg-white/5' : 'opacity-50',
                                )}>
                                    <div className={cn(
                                        'flex size-7 shrink-0 items-center justify-center rounded-full',
                                        done ? 'bg-emerald-400 text-white' : active ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50',
                                    )}>
                                        {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                                    </div>
                                    <div>
                                        <p className={cn('text-sm font-medium', active ? 'text-white' : done ? 'text-white/80' : 'text-white/50')}>
                                            {s.label}
                                        </p>
                                        {done && <p className="text-xs text-emerald-400">Completed</p>}
                                        {active && <p className="text-xs text-white/60">In progress</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <p className="relative z-10 text-white/35 text-xs">© {new Date().getFullYear()} Church OS</p>
                </div>

                {/* Right panel */}
                <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto">
                    <div className="w-full max-w-lg">
                        {/* Mobile logo */}
                        <div className="flex items-center gap-2 mb-6 lg:hidden">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">G</div>
                            <span className="font-semibold text-sm">Church OS</span>
                        </div>

                        {/* Stepper (top, desktop) */}
                        <Stepper current={step} />

                        {/* Heading */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-muted-foreground">Step {step} of {STEPS.length}</span>
                            </div>
                            <h1 className="text-xl font-semibold tracking-tight">{current.title}</h1>
                            <p className="text-sm text-muted-foreground mt-1">{current.desc}</p>
                        </div>

                        {/* Step content */}
                        {step === 1 && (
                            <StepChurch church={church} onNext={() => setStep(2)} />
                        )}
                        {step === 2 && (
                            <StepDepartments onNext={() => setStep(3)} onBack={() => setStep(1)} />
                        )}
                        {step === 3 && (
                            <StepTheme
                                church={church}
                                onNext={() => setStep(4)}
                                onBack={() => setStep(2)}
                                onSkip={() => setStep(4)}
                            />
                        )}
                        {step === 4 && (
                            <StepImport onNext={() => setStep(5)} onBack={() => setStep(3)} />
                        )}
                        {step === 5 && (
                            <StepPlan onBack={() => setStep(4)} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
