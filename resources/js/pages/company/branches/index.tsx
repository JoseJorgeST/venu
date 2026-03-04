import { Head, Link, router } from '@inertiajs/react';
import CompanyLayout from '@/layouts/company-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Power, Store, MapPin } from 'lucide-react';
import type { Company, Branch } from '@/types/tenant';

interface Props {
    branches: {
        data: Branch[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    company: Company;
}

export default function BranchesIndex({ branches, company }: Props) {
    const handleToggleStatus = (branch: Branch) => {
        router.post(`/company/branches/${branch.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (branch: Branch) => {
        if (confirm(`¿Estás seguro de eliminar la sucursal "${branch.name}"?`)) {
            router.delete(`/company/branches/${branch.id}`);
        }
    };

    return (
        <CompanyLayout breadcrumbs={[
            { title: 'Dashboard', href: '/company' },
            { title: 'Sucursales', href: '/company/branches' },
        ]}>
            <Head title="Sucursales" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sucursales</h1>
                        <p className="text-muted-foreground">
                            Gestiona las sucursales de {company.name}
                        </p>
                    </div>
                    <Link href="/company/branches/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Sucursal
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {branches.data.length === 0 ? (
                        <Card className="col-span-full">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Store className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold">No hay sucursales adicionales</h3>
                                <p className="text-muted-foreground text-center mb-4 max-w-md">
                                    Tu empresa opera con un solo local. Si deseas expandirte a múltiples ubicaciones, 
                                    puedes crear sucursales aquí. Cada sucursal tendrá su propio menú y gestión.
                                </p>
                                <Link href="/company/branches/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Crear Nueva Sucursal
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        branches.data.map((branch) => (
                            <Card key={branch.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            {branch.name}
                                            {branch.is_main && (
                                                <Badge variant="secondary">Principal</Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription>
                                            {branch.code && `Código: ${branch.code}`}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/company/branches/${branch.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Ver detalles
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/company/branches/${branch.id}/edit`}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(branch)}>
                                                <Power className="mr-2 h-4 w-4" />
                                                {branch.is_active ? 'Desactivar' : 'Activar'}
                                            </DropdownMenuItem>
                                            {!branch.is_main && (
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(branch)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {branch.restaurant && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Store className="h-4 w-4 text-muted-foreground" />
                                                <span>{branch.restaurant.name}</span>
                                            </div>
                                        )}
                                        {branch.restaurant?.category && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>{branch.restaurant.category}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-2">
                                            <Badge variant={branch.is_active ? 'default' : 'secondary'}>
                                                {branch.is_active ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                            <Link href={`/company/branches/${branch.id}/menu-items`}>
                                                <Button variant="outline" size="sm">
                                                    Ver Menú
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </CompanyLayout>
    );
}
