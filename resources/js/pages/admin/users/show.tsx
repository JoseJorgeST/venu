import { Head, Link } from '@inertiajs/react';
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
import { ArrowLeft, Pencil, Mail, Phone, Building2, ShoppingCart, Calendar, Wallet } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface Company {
    id: number;
    name: string;
    pivot?: {
        role: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    email_verified_at: string | null;
    wallet_points: number;
    created_at: string;
    roles: Role[];
    companies: Company[];
}

interface Stats {
    total_orders: number;
    total_spent: number;
    total_reservations: number;
    wallet_points: number;
}

interface Props {
    user: User;
    stats: Stats;
}

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    customer: 'Cliente',
};

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    super_admin: 'destructive',
    admin: 'default',
    customer: 'secondary',
};

export default function UsersShow({ user, stats }: Props) {
    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Usuarios', href: '/admin/users' },
            { title: user.name, href: `/admin/users/${user.id}` },
        ]}>
            <Head title={`Usuario: ${user.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/users">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    {user.roles.map((role) => (
                                        <Badge key={role.id} variant={roleBadgeVariant[role.name] ?? 'outline'}>
                                            {roleLabels[role.name] ?? role.name}
                                        </Badge>
                                    ))}
                                    <Badge variant={user.email_verified_at ? 'default' : 'secondary'}>
                                        {user.email_verified_at ? 'Verificado' : 'No verificado'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link href={`/admin/users/${user.id}/edit`}>
                        <Button>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_orders}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${stats.total_spent.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </div>
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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Puntos Wallet</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.wallet_points}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de contacto</CardTitle>
                            <CardDescription>Datos de contacto del usuario</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Correo electrónico</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Teléfono</p>
                                    <p className="font-medium">{user.phone ?? 'No registrado'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Fecha de registro</p>
                                    <p className="font-medium">
                                        {new Date(user.created_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Empresas asignadas</CardTitle>
                            <CardDescription>
                                Empresas que el usuario puede gestionar
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {user.companies.length > 0 ? (
                                <div className="space-y-3">
                                    {user.companies.map((company) => (
                                        <div key={company.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-medium">{company.name}</span>
                                            </div>
                                            {company.pivot?.role && (
                                                <Badge variant="outline">{company.pivot.role}</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">
                                    Este usuario no tiene empresas asignadas
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
