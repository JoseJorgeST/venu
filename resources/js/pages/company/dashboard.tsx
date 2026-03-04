import { Head } from '@inertiajs/react';
import CompanyLayout from '@/layouts/company-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, DollarSign, Clock, Store, TrendingUp, Calendar, Building2, MapPin } from 'lucide-react';
import type { Company, Branch, Order } from '@/types/tenant';

interface Props {
    company: Company;
    branch: Branch | null;
    stats: {
        today_orders: number;
        today_revenue: number;
        month_orders: number;
        month_revenue: number;
        pending_orders: number;
        total_branches: number;
    };
    recentOrders: Order[];
    pendingOrders: Order[];
}

export default function CompanyDashboard({ company, branch, stats, recentOrders, pendingOrders }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            ready: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        };
        return colors[status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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

    return (
        <CompanyLayout breadcrumbs={[{ title: 'Dashboard', href: '/company' }]}>
            <Head title={`Dashboard - ${branch ? branch.name : company.name}`} />

            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {branch ? branch.name : company.name}
                            </h1>
                            {branch && (
                                <Badge variant="secondary" className="text-sm">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    Sucursal
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {branch ? (
                                <>
                                    <span className="flex items-center gap-1">
                                        <Building2 className="h-4 w-4" />
                                        {company.name}
                                    </span>
                                </>
                            ) : (
                                'Vista general de todas las sucursales'
                            )}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.today_orders}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats.today_revenue)} en ventas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.month_orders}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats.month_revenue)} total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending_orders}</div>
                            <p className="text-xs text-muted-foreground">
                                Pedidos por procesar
                            </p>
                        </CardContent>
                    </Card>

                    {!branch && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sucursales</CardTitle>
                                <Store className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_branches}</div>
                                <p className="text-xs text-muted-foreground">
                                    Sucursales activas
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Pedidos Pendientes
                            </CardTitle>
                            <CardDescription>Pedidos que requieren atención</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingOrders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No hay pedidos pendientes
                                    </p>
                                ) : (
                                    pendingOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="space-y-1">
                                                <p className="font-medium">Pedido #{order.id}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.user?.name}
                                                </p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                                                <Badge className={getStatusColor(order.status)}>
                                                    {getStatusLabel(order.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Pedidos Recientes
                            </CardTitle>
                            <CardDescription>Últimos pedidos recibidos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentOrders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No hay pedidos recientes
                                    </p>
                                ) : (
                                    recentOrders.slice(0, 5).map((order) => (
                                        <div key={order.id} className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">#{order.id} - {order.user?.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleString('es-ES')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{formatCurrency(order.total_amount)}</p>
                                                <Badge variant="outline" className="text-xs">
                                                    {getStatusLabel(order.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CompanyLayout>
    );
}
