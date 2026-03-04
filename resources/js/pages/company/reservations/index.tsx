import { Head, router } from '@inertiajs/react';
import CompanyLayout from '@/layouts/company-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Search, MoreHorizontal, Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, CalendarClock, MapPin } from 'lucide-react';
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
    table_number: string | null;
    table_location: string | null;
    status: string;
    special_requests: string | null;
    user: User | null;
    restaurant: Restaurant | null;
    created_at: string;
}

interface TableLocation {
    id: number;
    name: string;
    description: string | null;
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
    tableLocations: TableLocation[];
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

const rejectionReasons = [
    { id: 'full', label: 'Restaurante lleno en esa fecha/hora' },
    { id: 'closed', label: 'Restaurante cerrado en esa fecha' },
    { id: 'event', label: 'Evento privado programado' },
    { id: 'maintenance', label: 'Mantenimiento del local' },
    { id: 'capacity', label: 'Capacidad insuficiente para el grupo' },
    { id: 'other', label: 'Otro motivo' },
];

export default function ReservationsIndex({ reservations, filters, tableLocations }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [date, setDate] = useState(filters.date ?? '');
    
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionMessage, setRejectionMessage] = useState('');
    const [alternativeDate, setAlternativeDate] = useState('');
    const [alternativeTime, setAlternativeTime] = useState('');
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [tableLocation, setTableLocation] = useState('');

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

    const openConfirmModal = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setTableNumber('');
        setTableLocation('');
        setConfirmationMessage('');
        setShowConfirmModal(true);
    };

    const generateConfirmationMessage = () => {
        if (!selectedReservation) return '';
        let msg = `Estimado/a ${selectedReservation.user?.name || 'Cliente'},\n\n`;
        msg += `Nos complace confirmar su reservación:\n\n`;
        msg += `📅 Fecha: ${formatDate(selectedReservation.date)}\n`;
        msg += `🕐 Hora: ${formatTime(selectedReservation.time)}\n`;
        msg += `👥 Personas: ${selectedReservation.party_size}\n`;
        if (tableNumber) {
            msg += `🪑 Mesa asignada: ${tableNumber}`;
            if (tableLocation) {
                msg += ` (${tableLocation})`;
            }
            msg += `\n`;
        }
        msg += `\n¡Le esperamos!\n\nAtentamente,\nEl equipo del restaurante`;
        return msg;
    };

    const openRejectModal = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setRejectionReason('');
        setRejectionMessage('');
        setAlternativeDate('');
        setAlternativeTime('');
        setShowRejectModal(true);
    };

    const handleConfirm = () => {
        if (!selectedReservation || !tableNumber) return;
        
        const message = confirmationMessage || generateConfirmationMessage();
        
        router.patch(`/company/reservations/${selectedReservation.id}/status`, {
            status: 'confirmed',
            table_number: tableNumber,
            table_location: tableLocation || null,
            admin_message: message,
        }, { 
            preserveState: true,
            onSuccess: () => {
                setShowConfirmModal(false);
                setSelectedReservation(null);
                setConfirmationMessage('');
                setTableNumber('');
                setTableLocation('');
            }
        });
    };

    const handleReject = () => {
        if (!selectedReservation || !rejectionReason) return;
        
        const reasonLabel = rejectionReasons.find(r => r.id === rejectionReason)?.label || rejectionReason;
        
        let fullMessage = `Estimado/a ${selectedReservation.user?.name || 'Cliente'},\n\n`;
        fullMessage += `Lamentamos informarle que no podemos confirmar su reservación para la fecha y hora solicitadas.\n\n`;
        fullMessage += `Motivo: ${reasonLabel}\n`;
        
        if (rejectionMessage) {
            fullMessage += `\n${rejectionMessage}\n`;
        }
        
        if (alternativeDate || alternativeTime) {
            fullMessage += `\nComo alternativa, le sugerimos:\n`;
            if (alternativeDate) {
                const altDateFormatted = new Date(alternativeDate + 'T12:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                });
                fullMessage += `- Fecha: ${altDateFormatted}\n`;
            }
            if (alternativeTime) {
                fullMessage += `- Hora: ${alternativeTime}\n`;
            }
        }
        
        fullMessage += `\nPor favor, no dude en contactarnos para realizar una nueva reservación.\n\nAtentamente,\nEl equipo del restaurante`;
        
        router.patch(`/company/reservations/${selectedReservation.id}/status`, {
            status: 'cancelled',
            rejection_reason: rejectionReason,
            admin_message: fullMessage,
            alternative_date: alternativeDate || null,
            alternative_time: alternativeTime || null,
        }, { 
            preserveState: true,
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedReservation(null);
                setRejectionReason('');
                setRejectionMessage('');
                setAlternativeDate('');
                setAlternativeTime('');
            }
        });
    };

    const formatDate = (dateStr: string | null | undefined) => {
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
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return 'Fecha inválida';
        }
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
                                <TableHead>Mesa</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Notas</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservations.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
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
                                            {reservation.table_number ? (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{reservation.table_number}</span>
                                                    {reservation.table_location && (
                                                        <span className="text-xs text-muted-foreground">
                                                            ({reservation.table_location})
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
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
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => openConfirmModal(reservation)}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                Confirmar reservación
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => openRejectModal(reservation)}
                                                                className="text-destructive"
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Rechazar reservación
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                        </>
                                                    )}
                                                    {reservation.status === 'confirmed' && (
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
                                                                onClick={() => openRejectModal(reservation)}
                                                                className="text-destructive"
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Cancelar reservación
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

            {/* Modal de Confirmación */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="sm:max-w-[550px] border-2 border-orange-500">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-orange-500" />
                            Confirmar Reservación
                        </DialogTitle>
                        <DialogDescription>
                            Asigna una mesa y confirma la reservación del cliente.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedReservation && (
                        <div className="space-y-4">
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</p>
                                        <p className="font-semibold">{selectedReservation.user?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                                        <p className="font-semibold">{selectedReservation.user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Fecha</p>
                                        <p className="font-semibold">{formatDate(selectedReservation.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Hora</p>
                                        <p className="font-semibold">{formatTime(selectedReservation.time)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Personas</p>
                                        <p className="font-semibold">{selectedReservation.party_size}</p>
                                    </div>
                                    {selectedReservation.special_requests && (
                                        <div className="col-span-2">
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notas del cliente</p>
                                            <p className="font-semibold italic">"{selectedReservation.special_requests}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border-2 border-green-500 p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <Label className="text-base font-medium">Asignación de Mesa *</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tableNumber">Número de mesa *</Label>
                                        <Input
                                            id="tableNumber"
                                            value={tableNumber}
                                            onChange={(e) => setTableNumber(e.target.value)}
                                            placeholder="Ej: 5, A1, VIP-2"
                                            className="border-green-300 dark:border-green-700 focus:border-green-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tableLocation">Ubicación</Label>
                                        <Select value={tableLocation} onValueChange={setTableLocation}>
                                            <SelectTrigger className="border-green-300 dark:border-green-700">
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tableLocations.length === 0 ? (
                                                    <SelectItem value="general" disabled>
                                                        No hay ubicaciones configuradas
                                                    </SelectItem>
                                                ) : (
                                                    tableLocations.map((loc) => (
                                                        <SelectItem key={loc.id} value={loc.name}>
                                                            {loc.name}
                                                            {loc.description && (
                                                                <span className="text-muted-foreground ml-1">
                                                                    - {loc.description}
                                                                </span>
                                                            )}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {tableLocations.length === 0 && (
                                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                                Configura ubicaciones en Ajustes → Ubicaciones
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmationMessage">
                                    <MessageSquare className="inline h-4 w-4 mr-1" />
                                    Mensaje personalizado (opcional)
                                </Label>
                                <Textarea
                                    id="confirmationMessage"
                                    value={confirmationMessage}
                                    onChange={(e) => setConfirmationMessage(e.target.value)}
                                    rows={4}
                                    placeholder="Deja vacío para usar el mensaje automático con los detalles de la reservación..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Si no escribes un mensaje, se generará automáticamente con los detalles de la reservación y mesa asignada.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleConfirm} 
                            className="bg-green-600 hover:bg-green-700"
                            disabled={!tableNumber}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmar Reservación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Rechazo */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-destructive" />
                            Rechazar Reservación
                        </DialogTitle>
                        <DialogDescription>
                            Indica el motivo del rechazo y ofrece alternativas al cliente.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedReservation && (
                        <div className="space-y-4">
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</p>
                                        <p className="font-semibold">{selectedReservation.user?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Fecha solicitada</p>
                                        <p className="font-semibold">{formatDate(selectedReservation.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Hora solicitada</p>
                                        <p className="font-semibold">{formatTime(selectedReservation.time)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Personas</p>
                                        <p className="font-semibold">{selectedReservation.party_size}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rejectionReason">Motivo del rechazo *</Label>
                                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un motivo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rejectionReasons.map((reason) => (
                                            <SelectItem key={reason.id} value={reason.id}>
                                                {reason.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rejectionMessage">
                                    <MessageSquare className="inline h-4 w-4 mr-1" />
                                    Mensaje adicional (opcional)
                                </Label>
                                <Textarea
                                    id="rejectionMessage"
                                    value={rejectionMessage}
                                    onChange={(e) => setRejectionMessage(e.target.value)}
                                    rows={3}
                                    placeholder="Detalles adicionales o disculpas personalizadas..."
                                />
                            </div>

                            <div className="rounded-lg border-2 border-blue-500 p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <CalendarClock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                    <Label className="text-base font-medium">Ofrecer alternativa (recomendado)</Label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Sugiere una fecha y hora alternativa para que el cliente pueda reservar nuevamente.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="alternativeDate">Fecha alternativa</Label>
                                        <Input
                                            id="alternativeDate"
                                            type="date"
                                            value={alternativeDate}
                                            onChange={(e) => setAlternativeDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="border-blue-300 dark:border-blue-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="alternativeTime">Hora alternativa</Label>
                                        <Input
                                            id="alternativeTime"
                                            type="time"
                                            value={alternativeTime}
                                            onChange={(e) => setAlternativeTime(e.target.value)}
                                            className="border-blue-300 dark:border-blue-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleReject} 
                            variant="destructive"
                            disabled={!rejectionReason}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Rechazar Reservación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CompanyLayout>
    );
}
