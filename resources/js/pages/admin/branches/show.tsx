import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Pencil,
    Store,
    ShoppingCart,
    DollarSign,
    Package,
    Plus,
    Trash2,
    CreditCard,
    CheckCircle,
    XCircle,
} from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    category: string | null;
    image_url: string | null;
    is_available: boolean;
}

interface Restaurant {
    id: number;
    name: string;
    slug: string;
    category: string | null;
    description: string | null;
    is_active: boolean;
    menu_items: MenuItem[];
}

interface Branch {
    id: number;
    name: string;
    code: string | null;
    is_main: boolean;
    is_active: boolean;
    restaurant: Restaurant | null;
}

interface Company {
    id: number;
    name: string;
}

interface Stats {
    total_orders: number;
    total_revenue: number;
    menu_items: number;
}

interface StripeStatus {
    has_key: boolean;
    has_secret: boolean;
    has_webhook: boolean;
    enabled: boolean;
}

interface Props {
    company: Company;
    branch: Branch;
    stats: Stats;
    stripeStatus: StripeStatus;
}

export default function BranchShow({ company, branch, stats, stripeStatus }: Props) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const handleDeleteMenuItem = (menuItem: MenuItem) => {
        if (confirm(`¿Estás seguro de eliminar "${menuItem.name}"?`)) {
            router.delete(`/admin/companies/${company.id}/branches/${branch.id}/menu/${menuItem.id}`);
        }
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Empresas', href: '/admin/companies' },
            { title: company.name, href: `/admin/companies/${company.id}` },
            { title: branch.name, href: `/admin/companies/${company.id}/branches/${branch.id}` },
        ]}>
            <Head title={`${branch.name} - ${company.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/companies/${company.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight">{branch.name}</h1>
                                {branch.is_main && <Badge>Principal</Badge>}
                                <Badge variant={branch.is_active ? 'default' : 'secondary'}>
                                    {branch.is_active ? 'Activa' : 'Inactiva'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">{company.name}</p>
                        </div>
                    </div>
                    <Link href={`/admin/companies/${company.id}/branches/${branch.id}/edit`}>
                        <Button>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
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
                            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Productos</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.menu_items}</div>
                        </CardContent>
                    </Card>
                </div>

                {branch.restaurant && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Restaurante
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid gap-4 sm:grid-cols-2">
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
                            </div>
                            {branch.restaurant.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Descripción</p>
                                    <p>{branch.restaurant.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Configuración de Stripe
                        </CardTitle>
                        <CardDescription>
                            Estado de la integración de pagos para esta sucursal
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                                {stripeStatus.enabled ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                                <span>Stripe {stripeStatus.enabled ? 'habilitado' : 'deshabilitado'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {stripeStatus.has_key ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                                <span>Publishable Key {stripeStatus.has_key ? 'configurada' : 'no configurada'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {stripeStatus.has_secret ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                                <span>Secret Key {stripeStatus.has_secret ? 'configurada' : 'no configurada'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {stripeStatus.has_webhook ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                                <span>Webhook {stripeStatus.has_webhook ? 'configurado' : 'no configurado'}</span>
                            </div>
                        </div>
                        {!stripeStatus.enabled && (
                            <p className="mt-4 text-sm text-destructive">
                                ⚠️ Esta sucursal no tiene método de pago configurado. Los clientes no podrán realizar compras.
                            </p>
                        )}
                        <div className="mt-4">
                            <Link href={`/admin/companies/${company.id}/branches/${branch.id}/edit`}>
                                <Button variant="outline" size="sm">
                                    Configurar Stripe
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Menú
                            </CardTitle>
                            <CardDescription>
                                Productos disponibles en esta sucursal
                            </CardDescription>
                        </div>
                        <Link href={`/admin/companies/${company.id}/branches/${branch.id}/menu`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Gestionar Menú
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {branch.restaurant?.menu_items && branch.restaurant.menu_items.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead className="text-right">Precio</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="w-[70px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {branch.restaurant.menu_items.slice(0, 10).map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {item.image_url ? (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.name}
                                                            className="h-10 w-10 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                                            <Package className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        {item.description && (
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.category ?? '-'}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.price)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.is_available ? 'default' : 'secondary'}>
                                                    {item.is_available ? 'Disponible' : 'No disponible'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteMenuItem(item)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-2 text-muted-foreground">
                                    No hay productos en el menú
                                </p>
                                <Link href={`/admin/companies/${company.id}/branches/${branch.id}/menu`}>
                                    <Button variant="outline" className="mt-4">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Agregar productos
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
