import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { AnnouncementModal } from '@/components/announcement-modal';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { GoogleIcon } from '@/components/google-icon';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

const inputClassName =
    'border-amber-500/80 focus-visible:border-amber-500 focus-visible:ring-amber-500/30';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [phone, setPhone] = useState('');
    const [otpSending, setOtpSending] = useState(false);
    const [googleAnnouncementOpen, setGoogleAnnouncementOpen] = useState(false);
    const pageErrors = (usePage().props as { errors?: Record<string, string> }).errors ?? {};

    const sendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setOtpSending(true);
        router.post('/otp/send', { phone }, {
            onFinish: () => setOtpSending(false),
            onError: (errors) => {
                setOtpSending(false);
            },
        });
    };

    return (
        <AuthLayout
            title="Iniciar sesión"
            description="Entra con tu cuenta de Google o con email"
        >
            <Head title="Iniciar sesión" />

            <button
                type="button"
                onClick={() => setGoogleAnnouncementOpen(true)}
                className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border border-black/10 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
                <GoogleIcon className="size-5" />
                Continuar con Google
            </button>
            <AnnouncementModal
                open={googleAnnouncementOpen}
                onOpenChange={setGoogleAnnouncementOpen}
                title="Próximamente"
                description="Inicia sesión con Google próximamente. Usa email o teléfono."
            />

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">O con teléfono</span>
                </div>
            </div>

            <form onSubmit={sendOtp} className="mb-6 flex flex-col gap-4 rounded-lg border p-4">
                <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+34 600 000 000"
                        autoComplete="tel"
                        required
                        className={inputClassName}
                    />
                    <InputError message={pageErrors.phone} />
                </div>
                <Button type="submit" disabled={otpSending}>
                    {otpSending && <Spinner />}
                    Enviar código
                </Button>
            </form>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">O con email</span>
                </div>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className={inputClassName}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Contraseña"
                                    className={inputClassName}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
