import { Form, Head } from '@inertiajs/react';
import { Building2, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    invitation: {
        token: string;
        email: string;
        name: string | null;
        church_name: string;
        role_name: string | null;
    };
};

export default function AcceptInvitation({ invitation }: Props) {
    const actionUrl = `/admin/invitation/${invitation.token}`;

    return (
        <>
            <Head title="Accept Invitation" />

            {/* Church + role context */}
            <div className="mb-6 rounded-xl border border-border bg-muted/40 px-4 py-3.5 flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                </div>
                <div>
                    <p className="text-sm font-medium">{invitation.church_name}</p>
                    {invitation.role_name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="size-3" />
                            Role: {invitation.role_name}
                        </p>
                    )}
                </div>
            </div>

            <Form
                method="post"
                action={actionUrl}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    autoFocus
                                    defaultValue={invitation.name ?? ''}
                                    placeholder="Your full name"
                                    className="h-10"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={invitation.email}
                                    disabled
                                    className="h-10 bg-muted/50 text-muted-foreground"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password" className="text-sm font-medium">Create Password</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="h-10"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium">Confirm Password</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="h-10"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-10 font-medium" disabled={processing}>
                            {processing && <Spinner className="mr-2" />}
                            Set up my account
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

AcceptInvitation.layout = {
    title: "You're invited",
    description: 'Set up your account to get started',
};
