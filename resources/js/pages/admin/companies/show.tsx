import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    Armchair,
    CreditCard,
    CheckCircle,
    XCircle,
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

interface TableLocation {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
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
    stripe_key: string | null;
    stripe_enabled: boolean;
    is_active: boolean;
    created_at: string;
    owner: Owner | null;
    branches: Branch[];
    users: CompanyUser[];
    table_locations: TableLocation[];
}

interface StripeStatus {
    has_secret: boolean;
    has_webhook: boolean;
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
    stripeStatus: StripeStatus;
}

const roleLabels: Record<string, string> = {
    owner: 'Propietario',
    manager: 'Gerente',
    staff: 'Personal',
};

export default function CompanyShow({ company, stats, stripeStatus }: Props) {
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [editingLocation, setEditingLocation] = useState<TableLocation | null>(null);

    const locationForm = useForm({
        name: '',
        description: '',
        is_active: true,
    });

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

    const openCreateLocation = () => {
        setEditingLocation(null);
        locationForm.reset();
        locationForm.setData({ name: '', description: '', is_active: true });
        setShowLocationModal(true);
    };

    const openEditLocation = (location: TableLocation) => {
        setEditingLocation(location);
        locationForm.setData({
            name: location.name,
            description: location.description || '',
            is_active: location.is_active,
        });
        setShowLocationModal(true);
    };

    const handleSaveLocation = () => {
        if (editingLocation) {
            locationForm.put(`/admin/companies/${company.id}/locations/${editingLocation.id}`, {
                onSuccess: () => {
                    setShowLocationModal(false);
                    locationForm.reset();
                },
            });
        } else {
            locationForm.post(`/admin/companies/${company.id}/locations`, {
                onSuccess: () => {
                    setShowLocationModal(false);
                    locationForm.reset();
                },
            });
        }
    };

    const handleDeleteLocation = (location: TableLocation) => {
        if (confirm(`¿Estás seguro de eliminar la ubicación "${location.name}"?`)) {
            router.delete(`/admin/companies/${company.id}/locations/${location.id}`);
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
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Configuración de Stripe
                        </CardTitle>
                        <CardDescription>
                            Estado de la integración de pagos con Stripe
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <span className="text-sm">Pagos habilitados</span>
                                {company.stripe_enabled ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <span className="text-sm">Publishable Key</span>
                                {company.stripe_key ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <span className="text-sm">Secret Key</span>
                                {stripeStatus?.has_secret ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <span className="text-sm">Webhook Secret</span>
                                {stripeStatus?.has_webhook ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                        </div>
                        {company.stripe_key && (
                            <div className="mt-4 p-3 rounded-lg bg-muted">
                                <p className="text-sm text-muted-foreground">Publishable Key:</p>
                                <p className="font-mono text-sm">{company.stripe_key.substring(0, 20)}...</p>
                            </div>
                        )}
                        {!company.stripe_key && !stripeStatus?.has_secret && (
                            <div className="mt-4 text-center py-4">
                                <p className="text-muted-foreground">
                                    Stripe no está configurado para esta empresa.
                                </p>
                                <Link href={`/admin/companies/${company.id}/edit`}>
                                    <Button variant="outline" className="mt-2">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Configurar Stripe
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Armchair className="h-5 w-5" />
                                Ubicaciones / Zonas
                            </CardTitle>
                            <CardDescription>
                                Zonas disponibles para reservaciones (ej: Terraza, VIP, Balcón)
                            </CardDescription>
                        </div>
                        <Button onClick={openCreateLocation}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Ubicación
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {company.table_locations && company.table_locations.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {company.table_locations.map((location) => (
                                    <div
                                        key={location.id}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${location.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                <Armchair className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{location.name}</p>
                                                {location.description && (
                                                    <p className="text-sm text-muted-foreground">{location.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={location.is_active ? 'default' : 'secondary'}>
                                                {location.is_active ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditLocation(location)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteLocation(location)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Armchair className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-2 text-muted-foreground">
                                    No hay ubicaciones configuradas
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Agrega zonas como Terraza, VIP, Sala principal, etc.
                                </p>
                                <Button variant="outline" className="mt-4" onClick={openCreateLocation}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear primera ubicación
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

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

            <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingLocation
                                ? 'Modifica los datos de la ubicación.'
                                : 'Agrega una nueva zona para reservaciones (ej: Terraza, VIP, Balcón).'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="location-name">Nombre *</Label>
                            <Input
                                id="location-name"
                                placeholder="Ej: Terraza, VIP, Balcón"
                                value={locationForm.data.name}
                                onChange={(e) => locationForm.setData('name', e.target.value)}
                            />
                            {locationForm.errors.name && (
                                <p className="text-sm text-destructive">{locationForm.errors.name}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location-description">Descripción</Label>
                            <Input
                                id="location-description"
                                placeholder="Ej: Zona al aire libre con vista al jardín"
                                value={locationForm.data.description}
                                onChange={(e) => locationForm.setData('description', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="location-active">Activa</Label>
                                <p className="text-sm text-muted-foreground">
                                    Las ubicaciones inactivas no aparecen en reservaciones
                                </p>
                            </div>
                            <Switch
                                id="location-active"
                                checked={locationForm.data.is_active}
                                onCheckedChange={(checked) => locationForm.setData('is_active', checked)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLocationModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveLocation} disabled={locationForm.processing}>
                            {editingLocation ? 'Guardar Cambios' : 'Crear Ubicación'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
