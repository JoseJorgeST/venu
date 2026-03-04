import { Head, router } from '@inertiajs/react';
import CompanyLayout from '@/layouts/company-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

interface Restaurant {
    id: number;
    name: string;
}

interface Reservation {
    id: number;
    date: string;
    time: string;
    party_size: number;
    status: string;
    special_requests: string | null;
    user: User | null;
    restaurant: Restaurant | null;
    created_at: string;
}

interface Props {
    reservations: {
        data: Reservation[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    filters: {
        status?: string;
        search?: string;
        date?: string;
    };
}

const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
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

export default function ReservationsIndex({ reservations, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [date, setDate] = useState(filters.date ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        applyFilters({ status: newStatus });
    };

    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        applyFilters({ date: newDate });
    };

    const applyFilters = (overrides: Record<string, string> = {}) => {
        const params: Record<string, string> = {};
        const currentStatus = overrides.status ?? status;
        const currentDate = overrides.date ?? date;
        
        if (search) params.search = search;
        if (currentStatus && currentStatus !== 'all') params.status = currentStatus;
        if (currentDate) params.date = currentDate;
        
        router.get('/company/reservations', params, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setDate('');
        router.get('/company/reservations');
    };

    const handleUpdateStatus = (reservation: Reservation, newStatus: string) => {
        router.patch(`/company/reservations/${reservation.id}/status`, {
            status: newStatus,
        }, { preserveState: true });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '--:--';
        return timeStr.slice(0, 5);
    };

    const hasFilters = search || (status && status !== 'all') || date;

    return (
        <CompanyLayout>
            <Head title="Reservaciones" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reservaciones</h1>
                        <p className="text-muted-foreground">
                            Gestiona las reservaciones de tu restaurante
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por cliente..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </form>
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="w-[160px]"
                        />
                        <Select value={status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="confirmed">Confirmada</SelectItem>
                                <SelectItem value="completed">Completada</SelectItem>
                                <SelectItem value="cancelled">Cancelada</SelectItem>
                                <SelectItem value="no_show">No asistió</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasFilters && (
                            <Button variant="ghost" onClick={clearFilters}>
                                Limpiar
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Personas</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Notas</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservations.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Calendar className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No hay reservaciones</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reservations.data.map((reservation) => (
                                    <TableRow key={reservation.id}>
                                        <TableCell>
                                            {reservation.user ? (
                                                <div>
                                                    <p className="font-medium">{reservation.user.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {reservation.user.email}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {formatDate(reservation.date)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                {formatTime(reservation.time)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                {reservation.party_size}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariants[reservation.status] ?? 'outline'}>
                                                {statusLabels[reservation.status] ?? reservation.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {reservation.special_requests ? (
                                                <span className="text-sm text-muted-foreground line-clamp-1">
                                                    {reservation.special_requests}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {reservation.status === 'pending' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateStatus(reservation, 'confirmed')}
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                            Confirmar
                                                        </DropdownMenuItem>
                                                    )}
                                                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => handleUpdateStatus(reservation, 'completed')}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Marcar completada
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleUpdateStatus(reservation, 'no_show')}
                                                            >
                                                                <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                                                                No asistió
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleUpdateStatus(reservation, 'cancelled')}
                                                                className="text-destructive"
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Cancelar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {reservations.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {reservations.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CompanyLayout>
    );
}
