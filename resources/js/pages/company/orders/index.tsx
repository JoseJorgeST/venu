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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Eye, ChevronRight } from 'lucide-react';
import type { Order, Branch } from '@/types/tenant';
import { useState } from 'react';

interface Props {
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    branches: Branch[];
    currentBranch: Branch | null;
    filters: {
        status?: string;
        search?: string;
        start_date?: string;
        end_date?: string;
    };
    statuses: { value: string; name: string }[];
}

export default function OrdersIndex({ orders, branches, currentBranch, filters, statuses }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status || 'all');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-blue-100 text-blue-800',
            preparing: 'bg-purple-100 text-purple-800',
            ready: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
        };
        return colors[status] ?? 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Pendiente',
            paid: 'Pagado',
            preparing: 'Preparando',
            ready: 'Listo',
            completed: 'Completado',
        };
        return labels[status] ?? status;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status && status !== 'all') params.status = status;
        router.get('/company/orders', params, { preserveState: true });
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (newStatus && newStatus !== 'all') params.status = newStatus;
        router.get('/company/orders', params, { preserveState: true });
    };

    const handleUpdateStatus = (order: Order, newStatus: string) => {
        router.patch(`/company/orders/${order.id}/status`, { status: newStatus }, {
            preserveScroll: true,
        });
    };

    return (
        <CompanyLayout breadcrumbs={[
            { title: 'Dashboard', href: '/company' },
            { title: 'Pedidos', href: '/company/orders' },
        ]}>
            <Head title="Pedidos" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
                    <p className="text-muted-foreground">
                        {currentBranch ? `Sucursal: ${currentBranch.name}` : 'Todos los pedidos'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 max-w-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por # o cliente..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </form>
                    <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="paid">Pagado</SelectItem>
                            <SelectItem value="preparing">Preparando</SelectItem>
                            <SelectItem value="ready">Listo</SelectItem>
                            <SelectItem value="completed">Completado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pedido</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Restaurante</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No se encontraron pedidos
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.data.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">#{order.id}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{order.user?.name}</p>
                                                <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{order.restaurant?.name}</TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(order.total_amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(order.status)}>
                                                {getStatusLabel(order.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString('es-ES')}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <a href={`/company/orders/${order.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver detalles
                                                        </a>
                                                    </DropdownMenuItem>
                                                    {order.status !== 'completed' && (
                                                        <>
                                                            {order.status === 'pending' && (
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order, 'paid')}>
                                                                    <ChevronRight className="mr-2 h-4 w-4" />
                                                                    Marcar como Pagado
                                                                </DropdownMenuItem>
                                                            )}
                                                            {order.status === 'paid' && (
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order, 'preparing')}>
                                                                    <ChevronRight className="mr-2 h-4 w-4" />
                                                                    Marcar como Preparando
                                                                </DropdownMenuItem>
                                                            )}
                                                            {order.status === 'preparing' && (
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order, 'ready')}>
                                                                    <ChevronRight className="mr-2 h-4 w-4" />
                                                                    Marcar como Listo
                                                                </DropdownMenuItem>
                                                            )}
                                                            {order.status === 'ready' && (
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order, 'completed')}>
                                                                    <ChevronRight className="mr-2 h-4 w-4" />
                                                                    Marcar como Completado
                                                                </DropdownMenuItem>
                                                            )}
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

                {orders.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {orders.links.map((link, index) => (
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
