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
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Power } from 'lucide-react';
import type { Company } from '@/types/tenant';
import { useState } from 'react';

interface Props {
    companies: {
        data: Company[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function CompaniesIndex({ companies, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/companies', { search }, { preserveState: true });
    };

    const handleToggleStatus = (company: Company) => {
        router.post(`/admin/companies/${company.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (company: Company) => {
        if (confirm(`¿Estás seguro de eliminar "${company.name}"?`)) {
            router.delete(`/admin/companies/${company.id}`);
        }
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Empresas', href: '/admin/companies' },
        ]}>
            <Head title="Empresas" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
                        <p className="text-muted-foreground">
                            Gestiona todas las empresas de la plataforma
                        </p>
                    </div>
                    <Link href="/admin/companies/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Empresa
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-1 max-w-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar empresas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </form>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Propietario</TableHead>
                                <TableHead>Sucursales</TableHead>
                                <TableHead>Usuarios</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {companies.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No se encontraron empresas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                companies.data.map((company) => (
                                    <TableRow key={company.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {company.logo_url ? (
                                                    <img
                                                        src={company.logo_url}
                                                        alt={company.name}
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                                                        {company.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{company.name}</p>
                                                    <p className="text-sm text-muted-foreground">{company.slug}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{company.owner?.name}</p>
                                                <p className="text-sm text-muted-foreground">{company.owner?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{company.branches_count ?? 0}</TableCell>
                                        <TableCell>{company.users_count ?? 0}</TableCell>
                                        <TableCell>
                                            <Badge variant={company.is_active ? 'default' : 'secondary'}>
                                                {company.is_active ? 'Activa' : 'Inactiva'}
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
                                                        <Link href={`/admin/companies/${company.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver detalles
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/companies/${company.id}/edit`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(company)}>
                                                        <Power className="mr-2 h-4 w-4" />
                                                        {company.is_active ? 'Desactivar' : 'Activar'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDelete(company)}
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

                {companies.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {companies.links.map((link, index) => (
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
