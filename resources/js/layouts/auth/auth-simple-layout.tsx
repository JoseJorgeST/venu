import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-black p-6 md:p-10">
            <style>{`
                @keyframes auth-float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(4%, -3%) scale(1.05); }
                    66% { transform: translate(-3%, 2%) scale(0.98); }
                }
                @keyframes auth-float-alt {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-5%, 4%) scale(1.08); }
                }
                @keyframes auth-glow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.65; }
                }
                @keyframes auth-shine {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
            {/* Fondo elegante: brillo animado + orbes que flotan */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                {/* Brillo suave que recorre la pantalla */}
                <div
                    className="absolute inset-0 opacity-90"
                    style={{
                        backgroundSize: '200% 200%',
                        backgroundImage: 'linear-gradient(115deg, transparent 0%, rgba(245,158,11,0.07) 25%, transparent 50%, rgba(212,175,55,0.05) 75%, transparent 100%)',
                        animation: 'auth-shine 12s ease-in-out infinite',
                    }}
                />
                {/* Rejilla sutil */}
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />
                {/* Orbe 1 — flotante */}
                <div
                    className="absolute -right-[20%] -top-[10%] h-[70vmax] w-[70vmax] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0.1) 45%, transparent 70%)',
                        filter: 'blur(50px)',
                        animation: 'auth-float 18s ease-in-out infinite',
                    }}
                />
                {/* Orbe 2 — flotante (retraso) */}
                <div
                    className="absolute -bottom-[15%] -left-[15%] h-[65vmax] w-[65vmax] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.35) 0%, rgba(212, 175, 55, 0.08) 50%, transparent 70%)',
                        filter: 'blur(55px)',
                        animation: 'auth-float-alt 22s ease-in-out infinite',
                        animationDelay: '-7s',
                    }}
                />
                {/* Orbe 3 — centro, pulso suave */}
                <div
                    className="absolute left-1/2 top-1/2 h-[55vmax] w-[55vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(201, 162, 39, 0.25) 0%, transparent 60%)',
                        filter: 'blur(45px)',
                        animation: 'auth-float 20s ease-in-out infinite',
                        animationDelay: '-3s',
                    }}
                />
                {/* Aura central que pulsa */}
                <div
                    className="absolute left-1/2 top-1/2 h-[40vmin] w-[40vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
                        filter: 'blur(30px)',
                        animation: 'auth-glow 6s ease-in-out infinite',
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
