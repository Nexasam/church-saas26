import { Form, Head } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <div className="mb-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                    {status}
                </div>
            )}

            <Form {...email.form()} className="flex flex-col gap-5">
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="off"
                                autoFocus
                                placeholder="admin@church.org"
                                className="h-10"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <Button className="w-full h-10 gap-2" disabled={processing} data-test="email-password-reset-link-button">
                            {processing ? <Spinner className="mr-2" /> : <Mail className="size-4" />}
                            Send reset link
                        </Button>
                    </>
                )}
            </Form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
                Remember it?{' '}
                <TextLink href={login()} className="font-medium text-foreground hover:underline">
                    Back to sign in
                </TextLink>
            </p>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Reset your password',
    description: "Enter your email and we'll send you a reset link",
};
