import { Head, Link } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { Coins, History } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Wallet', href: '/loyalty/wallet' },
];

type Log = {
    id: number;
    points_change: number;
    transaction_type: string;
    created_at: string;
    restaurant: { id: number; name: string } | null;
};

type Props = {
    user: { id: number; name: string } | null;
    wallet_points: number;
    logs: Log[];
};

export default function LoyaltyWallet({ user, wallet_points, logs }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet de puntos" />
            <div className="flex flex-1 flex-col gap-6 p-4 pb-24 md:p-6 md:pb-24">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Wallet de puntos</h1>
                    <Link
                        href="/dashboard"
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                        Volver al inicio
                    </Link>
                </div>

                <section className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                                <Coins className="size-7 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Balance actual</p>
                                <p className="text-3xl font-bold tabular-nums">{wallet_points} pts</p>
                            </div>
                        </div>
                        {user && (
                            <div className="flex flex-col items-center gap-2 rounded-lg border border-sidebar-border/70 bg-muted/30 p-4 dark:border-sidebar-border">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Tu código de usuario
                                </p>
                                <QRCodeSVG value={String(user.id)} size={120} level="M" />
                                <p className="text-xs tabular-nums text-muted-foreground">
                                    ID: {user.id}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <div className="flex items-center gap-2 border-b border-sidebar-border/70 px-4 py-3 dark:border-sidebar-border">
                        <History className="size-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Historial de puntos</h2>
                    </div>
                    <ul className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                        {logs.length === 0 ? (
                            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Aún no tienes movimientos.
                            </li>
                        ) : (
                            logs.map((log) => (
                                <li
                                    key={log.id}
                                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium">
                                            {log.transaction_type === 'earn'
                                                ? 'Puntos ganados'
                                                : 'Puntos redimidos'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(log.created_at).toLocaleString('es-ES', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                            {log.restaurant && ` · ${log.restaurant.name}`}
                                        </span>
                                    </div>
                                    <span
                                        className={cn(
                                            'tabular-nums font-semibold',
                                            log.points_change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        )}
                                    >
                                        {log.points_change >= 0 ? '+' : ''}
                                        {log.points_change} pts
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </section>
            </div>
        </AppLayout>
    );
}
