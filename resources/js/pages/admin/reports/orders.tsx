import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Filter, Eye } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Restaurant {
    id: number;
    name: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    user: User | null;
    restaurant: Restaurant | null;
}

interface Company {
    id: number;
    name: string;
}

interface Props {
    company: Company;
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    filters: {
        status?: string;
        start_date?: string;
        end_date?: string;
    };
}

const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    completed: 'Completado',
    cancelled: 'Cancelado',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    paid: 'default',
    confirmed: 'secondary',
    preparing: 'secondary',
    ready: 'default',
    delivered: 'default',
    completed: 'default',
    cancelled: 'destructive',
};

export default function ReportsOrders({ company, orders, filters }: Props) {
    const [localFilters, setLocalFilters] = useState({
        status: filters.status || 'all',
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
    });

    const handleFilter = () => {
        const params: Record<string, string> = {};
        if (localFilters.status && localFilters.status !== 'all') params.status = localFilters.status;
        if (localFilters.start_date) params.start_date = localFilters.start_date;
        if (localFilters.end_date) params.end_date = localFilters.end_date;
        router.get(`/admin/reports/${company.id}/orders`, params, { preserveState: true });
    };

    const clearFilters = () => {
        setLocalFilters({ status: 'all', start_date: '', end_date: '' });
        router.get(`/admin/reports/${company.id}/orders`);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Reportes', href: '/admin/reports' },
            { title: company.name, href: `/admin/reports/${company.id}` },
            { title: 'Pedidos', href: `/admin/reports/${company.id}/orders` },
        ]}>
            <Head title={`Pedidos: ${company.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/reports/${company.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pedidos de {company.name}</h1>
                        <p className="text-muted-foreground">
                            Historial completo de pedidos
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="font-medium">Filtros</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select
                                value={localFilters.status}
                                onValueChange={(value) => setLocalFilters({ ...localFilters, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {Object.entries(statusLabels).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Desde</Label>
                            <Input
                                type="date"
                                value={localFilters.start_date}
                                onChange={(e) => setLocalFilters({ ...localFilters, start_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Hasta</Label>
                            <Input
                                type="date"
                                value={localFilters.end_date}
                                onChange={(e) => setLocalFilters({ ...localFilters, end_date: e.target.value })}
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={handleFilter}>Filtrar</Button>
                            <Button variant="outline" onClick={clearFilters}>Limpiar</Button>
                        </div>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pedido</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Sucursal</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
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
                                        <TableCell>
                                            <span className="font-mono font-medium">#{order.order_number}</span>
                                        </TableCell>
                                        <TableCell>
                                            {order.user ? (
                                                <div>
                                                    <p className="font-medium">{order.user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{order.user.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {order.restaurant?.name ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariants[order.status] ?? 'outline'}>
                                                {statusLabels[order.status] ?? order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatCurrency(order.total_amount)}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(order.created_at).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Ver
                                                </Button>
                                            </Link>
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
        </AdminLayout>
    );
}
