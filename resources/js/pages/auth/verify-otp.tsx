import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState, useCallback, useEffect } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';

const LENGTH = 6;

type Props = {
    phone: string;
};

export default function VerifyOtp({ phone }: Props) {
    const pageErrors = (usePage().props as { errors?: Record<string, string> }).errors ?? {};
    const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
    const [processing, setProcessing] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const focus = useCallback((index: number) => {
        const i = Math.max(0, Math.min(index, LENGTH - 1));
        inputRefs.current[i]?.focus();
    }, []);

    useEffect(() => {
        focus(0);
    }, [focus]);

    const setDigit = (index: number, value: string) => {
        if (value.length > 1) {
            const chars = value.replace(/\D/g, '').slice(0, LENGTH).split('');
            const next = [...digits];
            chars.forEach((char, i) => {
                const idx = index + i;
                if (idx < LENGTH) next[idx] = char;
            });
            setDigits(next);
            focus(index + chars.length);
            return;
        }
        const char = value.replace(/\D/g, '');
        const next = [...digits];
        next[index] = char;
        setDigits(next);
        if (char && index < LENGTH - 1) focus(index + 1);
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            focus(index + 1);
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            focus(index - 1);
        }
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            e.preventDefault();
            focus(index - 1);
            setDigit(index - 1, '');
        }
    };

    const code = digits.join('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== LENGTH) return;
        setProcessing(true);
        router.post('/otp/verify', { phone, code }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthLayout
            title="Verificar código"
            description="Introduce el código de 6 dígitos enviado a tu teléfono"
        >
            <Head title="Verificar código OTP" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label>Teléfono</Label>
                    <p className="text-sm text-muted-foreground">{phone || '—'}</p>
                </div>

                <div className="grid gap-2">
                    <Label>Código</Label>
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: LENGTH }, (_, i) => (
                            <Input
                                key={i}
                                ref={(el) => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                autoComplete="one-time-code"
                                value={digits[i]}
                                onChange={(e) => setDigit(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
                                    const next = [...digits];
                                    pasted.split('').forEach((char, j) => {
                                        if (i + j < LENGTH) next[i + j] = char;
                                    });
                                    setDigits(next);
                                    focus(i + pasted.length);
                                }}
                                className="h-12 w-11 text-center text-lg font-semibold tabular-nums"
                            />
                        ))}
                    </div>
                    <InputError message={pageErrors.code} className="text-center" />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={code.length !== LENGTH || processing}
                >
                    {processing && <Spinner />}
                    Verificar
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    ¿No recibiste el código?{' '}
                    <TextLink href={login()}>
                        Volver al login
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
