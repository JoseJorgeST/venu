import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Restaurant = {
    id: number;
    name: string;
    slug: string;
};

export type Reservation = {
    id: number;
    date: string;
    time: string;
    party_size: number;
    status: string;
    special_requests: string | null;
    restaurant: Restaurant;
};

type Props = {
    reservations: Reservation[];
    status?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mis reservas', href: '/reservations' },
];

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatTime(timeStr: string): string {
    if (!timeStr) return '--:--';
    const part = timeStr.slice(0, 5);
    return part;
}

export default function ReservationsIndex({ reservations, status }: Props) {
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const handleCancel = (id: number) => {
        if (!window.confirm('¿Cancelar esta reserva?')) return;
        setCancellingId(id);
        router.delete(`/reservations/${id}`, {
            onFinish: () => setCancellingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis reservas" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Mis reservas</h1>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/reservations/create">Nueva reserva</Link>
                    </Button>
                </div>

                {status && (
                    <p className="rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-400">
                        {status}
                    </p>
                )}

                {reservations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-12 text-center">
                        <Calendar className="size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No tienes reservas.</p>
                        <Button asChild>
                            <Link href="/reservations/create">Hacer una reserva</Link>
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {reservations.map((reservation) => (
                            <li
                                key={reservation.id}
                                className={cn(
                                    'flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between',
                                    reservation.status === 'cancelled' && 'opacity-60'
                                )}
                            >
                                <div>
                                    <p className="font-medium">{reservation.restaurant.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(reservation.date)} · {formatTime(reservation.time)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {reservation.party_size}{' '}
                                        {reservation.party_size === 1 ? 'persona' : 'personas'}
                                        {reservation.special_requests && (
                                            <> · {reservation.special_requests}</>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            reservation.status === 'confirmed'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {reservation.status === 'confirmed'
                                            ? 'Confirmada'
                                            : 'Cancelada'}
                                    </Badge>
                                    {reservation.status === 'confirmed' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleCancel(reservation.id)}
                                            disabled={cancellingId === reservation.id}
                                        >
                                            <Trash2 className="size-4" />
                                            Cancelar
                                        </Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}