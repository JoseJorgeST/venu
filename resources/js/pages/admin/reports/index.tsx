import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, ShoppingCart, DollarSign, ChevronRight } from 'lucide-react';

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
    is_active: boolean;
    owner: Owner | null;
    branches_count: number;
    users_count: number;
    total_orders: number;
    total_revenue: number | null;
}

interface GlobalStats {
    total_companies: number;
    total_orders: number;
    total_revenue: number;
    total_users: number;
}

interface Props {
    companies: Company[];
    globalStats: GlobalStats;
}

export default function ReportsIndex({ companies, globalStats }: Props) {
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
        ]}>
            <Head title="Reportes" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
                    <p className="text-muted-foreground">
                        Selecciona una empresa para ver sus reportes detallados
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{globalStats.total_companies}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{globalStats.total_orders.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(globalStats.total_revenue)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{globalStats.total_users.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Seleccionar Empresa</CardTitle>
                        <CardDescription>
                            Haz clic en una empresa para ver sus reportes detallados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {companies.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No hay empresas registradas
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {companies.map((company) => (
                                    <Link
                                        key={company.id}
                                        href={`/admin/reports/${company.id}`}
                                        className="block"
                                    >
                                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
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
                                                            <p className="font-semibold">{company.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {company.branches_count} sucursales
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Pedidos</p>
                                                        <p className="font-semibold">{company.total_orders}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Ingresos</p>
                                                        <p className="font-semibold">{formatCurrency(company.total_revenue)}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
