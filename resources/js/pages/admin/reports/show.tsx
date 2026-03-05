import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, ShoppingCart, Users, TrendingUp, Package, FileText, Eye } from 'lucide-react';

interface Owner {
    id: number;
    name: string;
    email: string;
}

interface Company {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
    owner: Owner | null;
}

interface SalesOverTime {
    date: string;
    total: number;
    count: number;
}

interface TopProduct {
    name: string;
    total_quantity: number;
    total_revenue: number;
}

interface Branch {
    id: number;
    name: string;
    total_orders: number;
    total_revenue: number | null;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    user: User | null;
    restaurant: { id: number; name: string } | null;
}

interface TopCustomer {
    user_id: number;
    total_orders: number;
    total_spent: number;
    user: User | null;
}

interface Summary {
    total_revenue: number;
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    average_order_value: number;
    unique_customers: number;
}

interface Props {
    company: Company;
    salesOverTime: SalesOverTime[];
    topProducts: TopProduct[];
    salesByBranch: Branch[];
    recentOrders: Order[];
    topCustomers: TopCustomer[];
    summary: Summary;
    period: string;
    startDate: string;
    endDate: string;
}

const periodLabels: Record<string, string> = {
    week: 'Última semana',
    month: 'Último mes',
    quarter: 'Último trimestre',
    year: 'Último año',
};

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

export default function ReportsShow({
    company,
    salesOverTime,
    topProducts,
    salesByBranch,
    recentOrders,
    topCustomers,
    summary,
    period,
}: Props) {
    const handlePeriodChange = (newPeriod: string) => {
        router.get(`/admin/reports/${company.id}`, { period: newPeriod }, { preserveState: true });
    };

    const formatCurrency = (value: number | null) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
        }).format(value ?? 0);
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Reportes', href: '/admin/reports' },
            { title: company.name, href: `/admin/reports/${company.id}` },
        ]}>
            <Head title={`Reportes: ${company.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/reports">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            {company.logo_url ? (
                                <img
                                    src={company.logo_url}
                                    alt={company.name}
                                    className="h-12 w-12 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                                    {company.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
                                <p className="text-muted-foreground">
                                    Reportes y métricas - {periodLabels[period]}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={period} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Última semana</SelectItem>
                                <SelectItem value="month">Último mes</SelectItem>
                                <SelectItem value="quarter">Último trimestre</SelectItem>
                                <SelectItem value="year">Último año</SelectItem>
                            </SelectContent>
                        </Select>
                        <Link href={`/admin/reports/${company.id}/orders`}>
                            <Button variant="outline">
                                <FileText className="mr-2 h-4 w-4" />
                                Ver Pedidos
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_revenue)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_orders}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completados</CardTitle>
                            <Package className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{summary.completed_orders}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
                            <Package className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{summary.cancelled_orders}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.average_order_value)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.unique_customers}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ventas por Día</CardTitle>
                            <CardDescription>
                                Evolución de ventas en el período
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {salesOverTime.length > 0 ? (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {salesOverTime.map((day) => (
                                        <div key={day.date} className="flex items-center justify-between py-2 border-b last:border-0">
                                            <div>
                                                <p className="font-medium">
                                                    {new Date(day.date).toLocaleDateString('es-ES', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {day.count} pedidos
                                                </p>
                                            </div>
                                            <p className="font-bold">{formatCurrency(day.total)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No hay ventas en este período
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ventas por Sucursal</CardTitle>
                            <CardDescription>
                                Rendimiento de cada sucursal
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {salesByBranch.length > 0 ? (
                                <div className="space-y-2">
                                    {salesByBranch.map((branch) => (
                                        <div key={branch.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                            <div>
                                                <p className="font-medium">{branch.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {branch.total_orders} pedidos
                                                </p>
                                            </div>
                                            <p className="font-bold">{formatCurrency(branch.total_revenue)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No hay sucursales registradas
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Productos</CardTitle>
                            <CardDescription>
                                Productos más vendidos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topProducts.length > 0 ? (
                                <div className="space-y-2">
                                    {topProducts.map((product, index) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {product.total_quantity} unidades
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-bold">{formatCurrency(product.total_revenue)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No hay productos vendidos en este período
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Clientes</CardTitle>
                            <CardDescription>
                                Clientes con mayor gasto
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topCustomers.length > 0 ? (
                                <div className="space-y-2">
                                    {topCustomers.map((customer, index) => (
                                        <div key={customer.user_id} className="flex items-center justify-between py-2 border-b last:border-0">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-medium">{customer.user?.name ?? 'Usuario eliminado'}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {customer.total_orders} pedidos
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-bold">{formatCurrency(customer.total_spent)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No hay clientes en este período
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pedidos Recientes</CardTitle>
                        <CardDescription>
                            Últimos 10 pedidos de la empresa
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length > 0 ? (
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
                                    {recentOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-mono">#{order.id}</TableCell>
                                            <TableCell>{order.user?.name ?? '-'}</TableCell>
                                            <TableCell>{order.restaurant?.name ?? '-'}</TableCell>
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
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No hay pedidos en este período
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
