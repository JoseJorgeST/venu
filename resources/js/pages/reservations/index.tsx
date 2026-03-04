import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, Trash2, Clock, Users, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
    table_number: string | null;
    table_location: string | null;
    status: string;
    special_requests: string | null;
    admin_message: string | null;
    restaurant: Restaurant;
};

const statusLabels: Record<string, string> = {
    pending: 'Pendiente de confirmación',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
    no_show: 'No asistió',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    confirmed: 'default',
    cancelled: 'destructive',
    completed: 'secondary',
    no_show: 'destructive',
};

type Props = {
    reservations: Reservation[];
    status?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mis reservas', href: '/reservations' },
];

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'Sin fecha';
    
    try {
        let date: Date;
        
        if (dateStr.includes('T')) {
            date = new Date(dateStr);
        } else if (dateStr.includes('-')) {
            date = new Date(dateStr + 'T12:00:00');
        } else {
            date = new Date(dateStr);
        }
        
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return 'Fecha inválida';
    }
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
                    <div className="space-y-4">
                        {reservations.map((reservation) => (
                            <Card
                                key={reservation.id}
                                className={cn(
                                    reservation.status === 'cancelled' && 'opacity-60',
                                    reservation.status === 'pending' && 'border-amber-300 dark:border-amber-700'
                                )}
                            >
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold">{reservation.restaurant.name}</h3>
                                                <Badge variant={statusVariants[reservation.status] ?? 'outline'}>
                                                    {statusLabels[reservation.status] ?? reservation.status}
                                                </Badge>
                                            </div>
                                            
                                            <div className="grid gap-2 text-sm sm:grid-cols-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span>{formatDate(reservation.date)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span>{formatTime(reservation.time)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>
                                                        {reservation.party_size}{' '}
                                                        {reservation.party_size === 1 ? 'persona' : 'personas'}
                                                    </span>
                                                </div>
                                                {reservation.table_number && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium text-green-700 dark:text-green-400">
                                                            Mesa {reservation.table_number}
                                                            {reservation.table_location && (
                                                                <span className="font-normal text-muted-foreground">
                                                                    {' '}({reservation.table_location})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {reservation.special_requests && (
                                                <p className="text-sm text-muted-foreground italic">
                                                    "{reservation.special_requests}"
                                                </p>
                                            )}

                                            {reservation.status === 'pending' && (
                                                <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200">
                                                    <p className="font-medium">⏳ Esperando confirmación del restaurante</p>
                                                    <p className="text-xs mt-1">Te notificaremos cuando el restaurante confirme tu reservación.</p>
                                                </div>
                                            )}

                                            {reservation.admin_message && reservation.status === 'confirmed' && (
                                                <div className="rounded-md bg-green-50 dark:bg-green-950/30 p-3 text-sm">
                                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium mb-1">
                                                        <MessageSquare className="h-4 w-4" />
                                                        Mensaje del restaurante
                                                    </div>
                                                    <p className="text-green-800 dark:text-green-200 whitespace-pre-line text-xs">
                                                        {reservation.admin_message}
                                                    </p>
                                                </div>
                                            )}

                                            {reservation.admin_message && reservation.status === 'cancelled' && (
                                                <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 text-sm">
                                                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-1">
                                                        <MessageSquare className="h-4 w-4" />
                                                        Mensaje del restaurante
                                                    </div>
                                                    <p className="text-red-800 dark:text-red-200 whitespace-pre-line text-xs">
                                                        {reservation.admin_message}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex sm:flex-col gap-2">
                                            {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => handleCancel(reservation.id)}
                                                    disabled={cancellingId === reservation.id}
                                                >
                                                    <Trash2 className="size-4 mr-1" />
                                                    Cancelar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}