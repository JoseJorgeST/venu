import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, UserCog } from 'lucide-react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
}

interface Company {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    email_verified_at: string | null;
    created_at: string;
    roles: Role[];
    companies: Company[];
}

interface Props {
    users: {
        data: User[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    roles: Role[];
    filters: {
        search?: string;
        role?: string;
    };
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

export default function UsersIndex({ users, roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search, role: filters.role }, { preserveState: true });
    };

    const handleRoleFilter = (role: string) => {
        router.get('/admin/users', { search: filters.search, role: role === 'all' ? undefined : role }, { preserveState: true });
    };

    const handleDelete = (user: User) => {
        if (confirm(`¿Estás seguro de eliminar a "${user.name}"?`)) {
            router.delete(`/admin/users/${user.id}`);
        }
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Usuarios', href: '/admin/users' },
        ]}>
            <Head title="Usuarios" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
                        <p className="text-muted-foreground">
                            Gestiona todos los usuarios de la plataforma
                        </p>
                    </div>
                    <Link href="/admin/users/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Usuario
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-1 max-w-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar usuarios..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </form>
                    <Select value={filters.role ?? 'all'} onValueChange={handleRoleFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los roles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={role.name}>
                                    {roleLabels[role.name] ?? role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Empresas</TableHead>
                                <TableHead>Verificado</TableHead>
                                <TableHead>Registro</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No se encontraron usuarios
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.roles.map((role) => (
                                                <Badge key={role.id} variant={roleBadgeVariant[role.name] ?? 'outline'}>
                                                    {roleLabels[role.name] ?? role.name}
                                                </Badge>
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            {user.companies.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.companies.slice(0, 2).map((company) => (
                                                        <Badge key={company.id} variant="outline">
                                                            {company.name}
                                                        </Badge>
                                                    ))}
                                                    {user.companies.length > 2 && (
                                                        <Badge variant="outline">+{user.companies.length - 2}</Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.email_verified_at ? 'default' : 'secondary'}>
                                                {user.email_verified_at ? 'Sí' : 'No'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString('es-ES')}
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
                                                        <Link href={`/admin/users/${user.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver detalles
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/users/${user.id}/edit`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/users/${user.id}/edit`}>
                                                            <UserCog className="mr-2 h-4 w-4" />
                                                            Cambiar rol
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(user)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {users.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {users.links.map((link, index) => (
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
