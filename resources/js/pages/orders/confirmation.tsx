import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Confirmación', href: '/orders/confirmation' },
];

const CONFETTI_COUNT = 60;
const COLORS = [
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
];

function Confetti({ run }: { run: boolean }) {
    const [pieces] = useState(() =>
        Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
            id: i,
            x: Math.random() * 100 - 50,
            delay: Math.random() * 0.4,
            duration: 1.2 + Math.random() * 0.8,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: 6 + Math.random() * 6,
            rotation: Math.random() * 360,
        }))
    );

    if (!run) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {pieces.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute left-1/2 top-1/2 size-2 rounded-sm"
                    style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        boxShadow: '0 0 4px rgba(0,0,0,0.2)',
                    }}
                    initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                    animate={{
                        opacity: [1, 1, 0],
                        x: p.x * 8,
                        y: 400 + Math.random() * 200,
                        rotate: p.rotation + 720,
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    );
}

type Props = {
    points_earned: number;
};

export default function OrdersConfirmation({ points_earned }: Props) {
    const [confettiRun, setConfettiRun] = useState(false);

    useEffect(() => {
        if (points_earned > 0) {
            setConfettiRun(true);
            const t = setTimeout(() => setConfettiRun(false), 2500);
            return () => clearTimeout(t);
        }
    }, [points_earned]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedido confirmado" />
            <Confetti run={confettiRun} />
            <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="flex size-20 items-center justify-center rounded-full bg-green-500/20">
                        <CheckCircle2 className="size-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold">¡Pedido completado!</h1>
                </motion.div>

                {points_earned > 0 && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 180 }}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border-2 border-[#d4a017] bg-[#fef3c7] px-6 py-4'
                        )}
                    >
                        <Coins className="size-8 text-[#b8860b]" />
                        <div>
                            <p className="text-sm font-medium text-[#92400e]">
                                Puntos ganados
                            </p>
                            <p className="text-2xl font-bold tabular-nums text-[#78350f]">
                                +{points_earned} pts
                            </p>
                        </div>
                    </motion.div>
                )}

                <div className="flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href="/dashboard">Volver al inicio</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/loyalty/wallet">Ver mi wallet</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
