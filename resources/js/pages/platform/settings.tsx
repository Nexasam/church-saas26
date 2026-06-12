import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    Check,
    CreditCard,
    Globe,
    Key,
    MessageSquare,
    Palette,
    Save,
    Settings,
    Shield,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import PlatformLayout from '@/layouts/platform/platform-layout';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = {
    id: string;
    name: string;
    price: number;
    sms_limit: number;
    member_limit: number;
    admin_limit: number;
};

type PageProps = {
    adminUser:      { id: number; name: string; email: string };
    platformConfig: { app_name: string; support_email: string; app_url: string };
    plans:          Plan[];
    smsConfig:      { provider: string; termii_key: string; sender_id: string };
};

type Tab = 'profile' | 'platform' | 'plans' | 'sms' | 'announcement' | 'security';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile',      label: 'My Profile',     icon: User },
    { id: 'platform',     label: 'Platform',        icon: Globe },
    { id: 'plans',        label: 'Plans & Pricing', icon: CreditCard },
    { id: 'sms',          label: 'SMS Config',      icon: MessageSquare },
    { id: 'announcement', label: 'Announcement',    icon: Bell },
    { id: 'security',     label: 'Security',        icon: Shield },
];

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ adminUser }: { adminUser: PageProps['adminUser'] }) {
    const { data, setData, patch, processing, errors } = useForm({
        name:  adminUser.name,
        email: adminUser.email,
    });

    return (
        <form onSubmit={e => { e.preventDefault(); patch('/platform/settings/profile', { onSuccess: () => toast.success('Profile updated.') }); }} className="flex flex-col gap-5 max-w-md">
            <div>
                <Label className="field-label mb-1.5 block">Full Name</Label>
                <Input value={data.name} onChange={e => setData('name', e.target.value)} className="h-10" />
                <InputError message={errors.name} />
            </div>
            <div>
                <Label className="field-label mb-1.5 block">Email Address</Label>
                <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="h-10" />
                <InputError message={errors.email} />
            </div>
            <Button type="submit" className="w-fit gap-2" disabled={processing}>
                <Save className="size-4" /> Save Profile
            </Button>
        </form>
    );
}

// ─── Platform Config Tab ──────────────────────────────────────────────────────

function PlatformTab({ config }: { config: PageProps['platformConfig'] }) {
    const { data, setData, patch, processing, errors } = useForm({
        app_name:      config.app_name,
        support_email: config.support_email,
    });

    return (
        <form onSubmit={e => { e.preventDefault(); patch('/platform/settings/platform', { onSuccess: () => toast.success('Platform config updated.') }); }} className="flex flex-col gap-5 max-w-md">
            <div>
                <Label className="field-label mb-1.5 block">Platform Name</Label>
                <Input value={data.app_name} onChange={e => setData('app_name', e.target.value)} className="h-10" placeholder="Church OS" />
                <InputError message={errors.app_name} />
            </div>
            <div>
                <Label className="field-label mb-1.5 block">Support Email</Label>
                <Input type="email" value={data.support_email} onChange={e => setData('support_email', e.target.value)} className="h-10" placeholder="support@churchos.app" />
                <InputError message={errors.support_email} />
            </div>
            <div>
                <Label className="field-label mb-1.5 block">App URL</Label>
                <Input value={config.app_url} disabled className="h-10 bg-muted/50 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-1">Set via APP_URL in .env</p>
            </div>
            <Button type="submit" className="w-fit gap-2" disabled={processing}>
                <Save className="size-4" /> Save Config
            </Button>
        </form>
    );
}

// ─── Plans Tab ────────────────────────────────────────────────────────────────

function PlansTab({ plans: initialPlans }: { plans: Plan[] }) {
    const [plans, setPlans] = useState(initialPlans);
    const [saving, setSaving] = useState(false);

    function update(id: string, field: keyof Plan, value: number | string) {
        setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    }

    function save() {
        setSaving(true);
        router.patch('/platform/settings/plans', { plans }, {
            onSuccess: () => { toast.success('Plans updated.'); setSaving(false); },
            onError:   () => setSaving(false),
        });
    }

    return (
        <div className="flex flex-col gap-5">
            <p className="text-sm text-muted-foreground">Configure pricing plans visible on the billing page for all churches.</p>

            <div className="flex flex-col gap-4">
                {plans.map(plan => (
                    <div key={plan.id} className="card-base p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                                {plan.name.charAt(0)}
                            </div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{plan.id}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <Label className="field-label mb-1.5 block">Price (₦/mo)</Label>
                                <Input
                                    type="number"
                                    value={plan.price}
                                    onChange={e => update(plan.id, 'price', Number(e.target.value))}
                                    className="h-9"
                                />
                            </div>
                            <div>
                                <Label className="field-label mb-1.5 block">SMS / Month</Label>
                                <Input
                                    type="number"
                                    value={plan.sms_limit}
                                    onChange={e => update(plan.id, 'sms_limit', Number(e.target.value))}
                                    className="h-9"
                                />
                            </div>
                            <div>
                                <Label className="field-label mb-1.5 block">Member Limit</Label>
                                <Input
                                    type="number"
                                    value={plan.member_limit}
                                    onChange={e => update(plan.id, 'member_limit', Number(e.target.value))}
                                    className="h-9"
                                    placeholder="0 = unlimited"
                                />
                                <p className="text-[10px] text-muted-foreground mt-0.5">0 = unlimited</p>
                            </div>
                            <div>
                                <Label className="field-label mb-1.5 block">Admin Limit</Label>
                                <Input
                                    type="number"
                                    value={plan.admin_limit}
                                    onChange={e => update(plan.id, 'admin_limit', Number(e.target.value))}
                                    className="h-9"
                                    placeholder="0 = unlimited"
                                />
                                <p className="text-[10px] text-muted-foreground mt-0.5">0 = unlimited</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button className="w-fit gap-2" onClick={save} disabled={saving}>
                <Save className="size-4" /> Save Plans
            </Button>
        </div>
    );
}

// ─── SMS Config Tab ───────────────────────────────────────────────────────────

function SmsTab({ config }: { config: PageProps['smsConfig'] }) {
    const { data, setData, patch, processing, errors } = useForm({
        provider:  config.provider,
        api_key:   '',
        sender_id: config.sender_id,
    });

    const PROVIDERS = [
        { value: 'termii',   label: 'Termii',   desc: 'Recommended for Nigeria' },
        { value: 'twilio',   label: 'Twilio',   desc: 'International coverage' },
        { value: 'smsbulk',  label: 'SMSBulk',  desc: 'Nigerian bulk SMS' },
    ];

    return (
        <form onSubmit={e => { e.preventDefault(); patch('/platform/settings/sms', { onSuccess: () => toast.success('SMS config saved.') }); }} className="flex flex-col gap-5 max-w-md">
            <div>
                <Label className="field-label mb-2 block">SMS Provider</Label>
                <div className="flex flex-col gap-2">
                    {PROVIDERS.map(p => (
                        <button
                            type="button"
                            key={p.value}
                            onClick={() => setData('provider', p.value)}
                            className={cn(
                                'flex items-center justify-between rounded-xl border p-3.5 text-left transition-all',
                                data.provider === p.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                            )}
                        >
                            <div>
                                <p className="text-sm font-medium">{p.label}</p>
                                <p className="text-xs text-muted-foreground">{p.desc}</p>
                            </div>
                            {data.provider === p.value && <Check className="size-4 text-primary" />}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <Label className="field-label mb-1.5 block">API Key</Label>
                <Input
                    type="password"
                    value={data.api_key}
                    onChange={e => setData('api_key', e.target.value)}
                    placeholder={config.termii_key || 'Enter new API key'}
                    className="h-10"
                />
                {config.termii_key && <p className="text-xs text-muted-foreground mt-1">Key is set. Enter a new value to replace it.</p>}
                <InputError message={errors.api_key} />
            </div>

            <div>
                <Label className="field-label mb-1.5 block">Sender ID</Label>
                <Input value={data.sender_id} onChange={e => setData('sender_id', e.target.value)} placeholder="ChurchOS" className="h-10" maxLength={11} />
                <p className="text-xs text-muted-foreground mt-1">Max 11 characters. Shown as sender name on recipients' phones.</p>
                <InputError message={errors.sender_id} />
            </div>

            <Button type="submit" className="w-fit gap-2" disabled={processing}>
                <Save className="size-4" /> Save SMS Config
            </Button>
        </form>
    );
}

// ─── Announcement Tab ─────────────────────────────────────────────────────────

function AnnouncementTab() {
    const { data, setData, post, processing, reset } = useForm({
        title:   '',
        message: '',
        type:    'info' as 'info' | 'warning' | 'success',
    });

    const TYPES = [
        { value: 'info',    label: 'Info',    color: 'bg-blue-100 text-blue-700' },
        { value: 'warning', label: 'Warning', color: 'bg-amber-100 text-amber-700' },
        { value: 'success', label: 'Success', color: 'bg-emerald-100 text-emerald-700' },
    ];

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                post('/platform/settings/announcement', {
                    onSuccess: () => { toast.success('Announcement broadcast to all churches.'); reset(); },
                });
            }}
            className="flex flex-col gap-5 max-w-lg"
        >
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
                <p className="text-sm text-amber-800 dark:text-amber-400">
                    This will display a banner notification to <strong>all churches</strong> the next time they log in.
                </p>
            </div>

            <div>
                <Label className="field-label mb-2 block">Type</Label>
                <div className="flex gap-2">
                    {TYPES.map(t => (
                        <button
                            type="button"
                            key={t.value}
                            onClick={() => setData('type', t.value as typeof data.type)}
                            className={cn(
                                'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                                data.type === t.value ? `${t.color} border-current` : 'border-border text-muted-foreground hover:border-primary/40',
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <Label className="field-label mb-1.5 block">Title</Label>
                <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="e.g. Scheduled Maintenance" className="h-10" required />
            </div>

            <div>
                <Label className="field-label mb-1.5 block">Message</Label>
                <textarea
                    value={data.message}
                    onChange={e => setData('message', e.target.value)}
                    rows={4}
                    placeholder="Write the announcement message..."
                    className="w-full rounded-lg border border-border bg-background text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                />
                <p className="text-xs text-muted-foreground mt-1">{data.message.length}/1000</p>
            </div>

            {/* Preview */}
            {(data.title || data.message) && (
                <div className={cn(
                    'rounded-xl border p-4',
                    data.type === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800' :
                    data.type === 'success' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' :
                    'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
                )}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Preview</p>
                    {data.title && <p className="text-sm font-semibold">{data.title}</p>}
                    {data.message && <p className="text-sm text-muted-foreground mt-0.5">{data.message}</p>}
                </div>
            )}

            <Button type="submit" className="w-fit gap-2" disabled={processing || !data.title || !data.message}>
                <Bell className="size-4" /> Broadcast to All Churches
            </Button>
        </form>
    );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
    const { data, setData, patch, processing, errors, reset } = useForm({
        current_password:       '',
        password:               '',
        password_confirmation:  '',
    });

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                patch('/platform/settings/password', {
                    onSuccess: () => { toast.success('Password updated.'); reset(); },
                });
            }}
            className="flex flex-col gap-5 max-w-md"
        >
            <div>
                <Label className="field-label mb-1.5 block">Current Password</Label>
                <PasswordInput
                    value={data.current_password}
                    onChange={e => setData('current_password', e.target.value)}
                    className="h-10"
                    placeholder="••••••••"
                />
                <InputError message={errors.current_password} />
            </div>
            <Separator />
            <div>
                <Label className="field-label mb-1.5 block">New Password</Label>
                <PasswordInput
                    value={data.password}
                    onChange={e => setData('password', e.target.value)}
                    className="h-10"
                    placeholder="••••••••"
                />
                <InputError message={errors.password} />
            </div>
            <div>
                <Label className="field-label mb-1.5 block">Confirm New Password</Label>
                <PasswordInput
                    value={data.password_confirmation}
                    onChange={e => setData('password_confirmation', e.target.value)}
                    className="h-10"
                    placeholder="••••••••"
                />
                <InputError message={errors.password_confirmation} />
            </div>
            <Button type="submit" className="w-fit gap-2" disabled={processing}>
                <Key className="size-4" /> Update Password
            </Button>
        </form>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlatformSettings() {
    const { adminUser, platformConfig, plans, smsConfig } = usePage<PageProps>().props;
    const [tab, setTab] = useState<Tab>('profile');

    const current = TABS.find(t => t.id === tab)!;

    return (
        <>
            <Head title="Platform Settings — Church OS" />
            <div className="flex h-full">

                {/* Settings sidebar */}
                <aside className="w-52 shrink-0 border-r border-border p-3 flex flex-col gap-0.5">
                    {TABS.map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors',
                                    tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <Icon className="size-4" />
                                {t.label}
                            </button>
                        );
                    })}
                </aside>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">{current.label}</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {tab === 'profile'      && 'Update your platform admin profile'}
                            {tab === 'platform'     && 'Configure global platform settings'}
                            {tab === 'plans'        && 'Manage subscription plans and pricing'}
                            {tab === 'sms'          && 'Configure the SMS gateway used by all churches'}
                            {tab === 'announcement' && 'Broadcast a message to all churches on the platform'}
                            {tab === 'security'     && 'Update your password and security settings'}
                        </p>
                    </div>

                    {tab === 'profile'      && <ProfileTab adminUser={adminUser} />}
                    {tab === 'platform'     && <PlatformTab config={platformConfig} />}
                    {tab === 'plans'        && <PlansTab plans={plans} />}
                    {tab === 'sms'          && <SmsTab config={smsConfig} />}
                    {tab === 'announcement' && <AnnouncementTab />}
                    {tab === 'security'     && <SecurityTab />}
                </div>
            </div>
        </>
    );
}

PlatformSettings.layout = (page: React.ReactNode) => <PlatformLayout>{page}</PlatformLayout>;
