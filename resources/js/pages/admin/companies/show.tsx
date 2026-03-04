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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    Pencil,
    Building2,
    Mail,
    Phone,
    MapPin,
    Users,
    ShoppingCart,
    DollarSign,
    Calendar,
    Plus,
    MoreHorizontal,
    Eye,
    Power,
    Trash2,
    Store,
} from 'lucide-react';

interface Owner {
    id: number;
    name: string;
    email: string;
}

interface Restaurant {
    id: number;
    name: string;
    slug: string;
    category: string | null;
    is_active: boolean;
}

interface Branch {
    id: number;
    name: string;
    code: string | null;
    is_main: boolean;
    is_active: boolean;
    restaurant: Restaurant | null;
}

interface CompanyUser {
    id: number;
    name: string;
    email: string;
    pivot: {
        role: string;
    };
}

interface Company {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    tax_id: string | null;
    is_active: boolean;
    created_at: string;
    owner: Owner | null;
    branches: Branch[];
    users: CompanyUser[];
}

interface Stats {
    total_branches: number;
    total_orders: number;
    total_revenue: number;
    total_reservations: number;
}

interface Props {
    company: Company;
    stats: Stats;
}

const roleLabels: Record<string, string> = {
    owner: 'Propietario',
    manager: 'Gerente',
    staff: 'Personal',
};

export default function CompanyShow({ company, stats }: Props) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const handleDeleteBranch = (branch: Branch) => {
        if (confirm(`¿Estás seguro de eliminar la sucursal "${branch.name}"?`)) {
            router.delete(`/admin/companies/${company.id}/branches/${branch.id}`);
        }
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Empresas', href: '/admin/companies' },
            { title: company.name, href: `/admin/companies/${company.id}` },
        ]}>
            <Head title={company.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/companies">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            {company.logo_url ? (
                                <img
                                    src={company.logo_url}
                                    alt={company.name}
                                    className="h-16 w-16 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary text-2xl font-bold">
                                    {company.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
                                    <Badge variant={company.is_active ? 'default' : 'secondary'}>
                                        {company.is_active ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground">{company.slug}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/admin/reports/${company.id}`}>
                            <Button variant="outline">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Ver Reportes
                            </Button>
                        </Link>
                        <Link href={`/admin/companies/${company.id}/edit`}>
                            <Button>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sucursales</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_branches}</div>
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
                            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reservaciones</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_reservations}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Información de la Empresa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {company.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Descripción</p>
                                    <p>{company.description}</p>
                                </div>
                            )}
                            <div className="grid gap-4 sm:grid-cols-2">
                                {company.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{company.email}</span>
                                    </div>
                                )}
                                {company.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{company.phone}</span>
                                    </div>
                                )}
                                {company.address && (
                                    <div className="flex items-center gap-2 sm:col-span-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{company.address}</span>
                                    </div>
                                )}
                            </div>
                            {company.tax_id && (
                                <div>
                                    <p className="text-sm text-muted-foreground">NIF/CIF</p>
                                    <p className="font-mono">{company.tax_id}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha de registro</p>
                                <p>{new Date(company.created_at).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Equipo
                            </CardTitle>
                            <CardDescription>
                                Usuarios con acceso a esta empresa
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {company.users.length > 0 ? (
                                <div className="space-y-3">
                                    {company.users.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <Badge variant={user.pivot.role === 'owner' ? 'default' : 'outline'}>
                                                {roleLabels[user.pivot.role] ?? user.pivot.role}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-4">
                                    No hay usuarios asignados
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Sucursales
                            </CardTitle>
                            <CardDescription>
                                Restaurantes y sucursales de la empresa
                            </CardDescription>
                        </div>
                        <Link href={`/admin/companies/${company.id}/branches/create`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Sucursal
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {company.branches.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sucursal</TableHead>
                                        <TableHead>Restaurante</TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="w-[70px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {company.branches.map((branch) => (
                                        <TableRow key={branch.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{branch.name}</span>
                                                    {branch.is_main && (
                                                        <Badge variant="outline">Principal</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {branch.restaurant ? (
                                                    <div>
                                                        <p>{branch.restaurant.name}</p>
                                                        {branch.restaurant.category && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {branch.restaurant.category}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {branch.code ? (
                                                    <span className="font-mono">{branch.code}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={branch.is_active ? 'default' : 'secondary'}>
                                                    {branch.is_active ? 'Activa' : 'Inactiva'}
                                                </Badge>
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
                                                            <Link href={`/admin/companies/${company.id}/branches/${branch.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Ver detalles
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/companies/${company.id}/branches/${branch.id}/edit`}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteBranch(branch)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <Store className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-2 text-muted-foreground">
                                    Esta empresa no tiene sucursales
                                </p>
                                <Link href={`/admin/companies/${company.id}/branches/create`}>
                                    <Button variant="outline" className="mt-4">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Crear primera sucursal
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
