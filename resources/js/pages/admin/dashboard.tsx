import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, ShoppingCart, DollarSign, TrendingUp, Store } from 'lucide-react';
import type { Company, Order } from '@/types/tenant';

interface Props {
    stats: {
        total_companies: number;
        active_companies: number;
        total_users: number;
        total_admins: number;
        total_customers: number;
        total_orders: number;
        total_revenue: number;
    };
    recentCompanies: Company[];
    recentOrders: Order[];
}

export default function AdminDashboard({ stats, recentCompanies, recentOrders }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    return (
        <AdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin' }]}>
            <Head title="Panel de Administración" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Super Admin</h1>
                    <p className="text-muted-foreground">
                        Vista general de toda la plataforma
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_companies}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_companies} activas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.total_admins} admins, {stats.total_customers} clientes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_orders}</div>
                            <p className="text-xs text-muted-foreground">
                                Total de pedidos
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                Total facturado
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Empresas Recientes</CardTitle>
                            <CardDescription>Últimas empresas registradas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentCompanies.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No hay empresas registradas</p>
                                ) : (
                                    recentCompanies.map((company) => (
                                        <div key={company.id} className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <Store className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">{company.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {company.owner?.name ?? 'Sin propietario'}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                company.is_active 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {company.is_active ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pedidos Recientes</CardTitle>
                            <CardDescription>Últimos pedidos en la plataforma</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentOrders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No hay pedidos</p>
                                ) : (
                                    recentOrders.slice(0, 5).map((order) => (
                                        <div key={order.id} className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <ShoppingCart className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    Pedido #{order.id}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.user?.name} - {order.restaurant?.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{formatCurrency(order.total_amount)}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
