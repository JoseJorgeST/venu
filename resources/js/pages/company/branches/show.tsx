import { Head, Link } from '@inertiajs/react';
import CompanyLayout from '@/layouts/company-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Store, MapPin, DollarSign, ShoppingCart, CalendarDays, UtensilsCrossed } from 'lucide-react';
import type { Branch } from '@/types/tenant';

interface Props {
    branch: Branch & {
        restaurant?: {
            id: number;
            name: string;
            category: string | null;
            description: string | null;
            latitude: number | null;
            longitude: number | null;
        };
    };
    stats: {
        total_orders: number;
        total_revenue: number;
        total_reservations: number;
        menu_items: number;
    };
}

export default function BranchShow({ branch, stats }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <CompanyLayout breadcrumbs={[
            { title: 'Dashboard', href: '/company' },
            { title: 'Sucursales', href: '/company/branches' },
            { title: branch.name, href: `/company/branches/${branch.id}` },
        ]}>
            <Head title={branch.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/company/branches">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight">{branch.name}</h1>
                                {branch.is_main && (
                                    <Badge variant="secondary">Principal</Badge>
                                )}
                                <Badge variant={branch.is_active ? 'default' : 'outline'}>
                                    {branch.is_active ? 'Activa' : 'Inactiva'}
                                </Badge>
                            </div>
                            {branch.code && (
                                <p className="text-muted-foreground">Código: {branch.code}</p>
                            )}
                        </div>
                    </div>
                    <Link href={`/company/branches/${branch.id}/edit`}>
                        <Button>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_orders}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reservaciones</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_reservations}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Productos</CardTitle>
                            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.menu_items}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Información del Restaurante
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {branch.restaurant ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nombre</p>
                                        <p className="font-medium">{branch.restaurant.name}</p>
                                    </div>
                                    {branch.restaurant.category && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Categoría</p>
                                            <p className="font-medium">{branch.restaurant.category}</p>
                                        </div>
                                    )}
                                    {branch.restaurant.description && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Descripción</p>
                                            <p className="font-medium">{branch.restaurant.description}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground">No hay restaurante asociado</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Ubicación
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {branch.restaurant?.latitude && branch.restaurant?.longitude ? (
                                <div>
                                    <p className="text-sm text-muted-foreground">Coordenadas</p>
                                    <p className="font-medium">
                                        {branch.restaurant.latitude}, {branch.restaurant.longitude}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No hay ubicación configurada</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-4">
                    <Link href={`/company/branches/${branch.id}/menu-items`}>
                        <Button variant="outline">
                            <UtensilsCrossed className="mr-2 h-4 w-4" />
                            Ver Menú
                        </Button>
                    </Link>
                </div>
            </div>
        </CompanyLayout>
    );
}
