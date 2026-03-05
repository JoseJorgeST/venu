import { Head, router } from '@inertiajs/react';
import { Star, StarOff, Building2, Store, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type BreadcrumbItem } from '@/types';

interface Restaurant {
    id: number;
    name: string;
    slug: string;
}

interface Company {
    id: number;
    name: string;
    is_active: boolean;
    is_featured: boolean;
    featured_order: number;
    main_restaurant?: Restaurant;
}

interface Branch {
    id: number;
    name: string;
    is_active: boolean;
    is_featured: boolean;
    featured_order: number;
    company: {
        id: number;
        name: string;
    };
    restaurant?: Restaurant;
}

interface Props {
    featuredCompanies: Company[];
    featuredBranches: Branch[];
    availableCompanies: Company[];
    availableBranches: Branch[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Destacados', href: '/admin/featured' },
];

export default function FeaturedIndex({
    featuredCompanies,
    featuredBranches,
    availableCompanies,
    availableBranches,
}: Props) {
    const [localFeaturedCompanies, setLocalFeaturedCompanies] = useState(featuredCompanies);
    const [localFeaturedBranches, setLocalFeaturedBranches] = useState(featuredBranches);
    const [isSaving, setIsSaving] = useState(false);

    const toggleCompanyFeatured = (companyId: number) => {
        router.post(`/admin/featured/company/${companyId}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const toggleBranchFeatured = (branchId: number) => {
        router.post(`/admin/featured/branch/${branchId}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const moveCompany = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= localFeaturedCompanies.length) return;

        const newList = [...localFeaturedCompanies];
        [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
        setLocalFeaturedCompanies(newList);
    };

    const moveBranch = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= localFeaturedBranches.length) return;

        const newList = [...localFeaturedBranches];
        [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
        setLocalFeaturedBranches(newList);
    };

    const saveOrder = () => {
        setIsSaving(true);
        router.post('/admin/featured/reorder', {
            companies: localFeaturedCompanies.map((c, i) => ({ id: c.id, order: i })),
            branches: localFeaturedBranches.map((b, i) => ({ id: b.id, order: i })),
        }, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false),
        });
    };

    const hasOrderChanged = () => {
        const companiesChanged = localFeaturedCompanies.some((c, i) => 
            featuredCompanies[i]?.id !== c.id
        );
        const branchesChanged = localFeaturedBranches.some((b, i) => 
            featuredBranches[i]?.id !== b.id
        );
        return companiesChanged || branchesChanged;
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestionar Destacados" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Gestionar Destacados</h1>
                        <p className="text-muted-foreground">
                            Controla qué empresas y sucursales aparecen como destacados para los clientes
                        </p>
                    </div>
                    {hasOrderChanged() && (
                        <Button onClick={saveOrder} disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Orden'}
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="featured" className="w-full">
                    <TabsList>
                        <TabsTrigger value="featured">
                            <Star className="mr-2 h-4 w-4" />
                            Destacados ({localFeaturedCompanies.length + localFeaturedBranches.length})
                        </TabsTrigger>
                        <TabsTrigger value="available">
                            <StarOff className="mr-2 h-4 w-4" />
                            Disponibles ({availableCompanies.length + availableBranches.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="featured" className="space-y-6">
                        {/* Empresas Destacadas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Empresas Destacadas
                                </CardTitle>
                                <CardDescription>
                                    Empresas que aparecen en la sección de destacados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {localFeaturedCompanies.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">
                                        No hay empresas destacadas
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {localFeaturedCompanies.map((company, index) => (
                                            <div
                                                key={company.id}
                                                className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => moveCompany(index, 'up')}
                                                            disabled={index === 0}
                                                        >
                                                            <ArrowUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => moveCompany(index, 'down')}
                                                            disabled={index === localFeaturedCompanies.length - 1}
                                                        >
                                                            <ArrowDown className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{company.name}</p>
                                                        {company.main_restaurant && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Restaurante: {company.main_restaurant.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">#{index + 1}</Badge>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleCompanyFeatured(company.id)}
                                                    >
                                                        <StarOff className="mr-2 h-4 w-4" />
                                                        Quitar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Sucursales Destacadas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="h-5 w-5" />
                                    Sucursales Destacadas
                                </CardTitle>
                                <CardDescription>
                                    Sucursales que aparecen en la sección de destacados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {localFeaturedBranches.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">
                                        No hay sucursales destacadas
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {localFeaturedBranches.map((branch, index) => (
                                            <div
                                                key={branch.id}
                                                className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => moveBranch(index, 'up')}
                                                            disabled={index === 0}
                                                        >
                                                            <ArrowUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => moveBranch(index, 'down')}
                                                            disabled={index === localFeaturedBranches.length - 1}
                                                        >
                                                            <ArrowDown className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{branch.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Empresa: {branch.company.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">#{index + 1}</Badge>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleBranchFeatured(branch.id)}
                                                    >
                                                        <StarOff className="mr-2 h-4 w-4" />
                                                        Quitar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="available" className="space-y-6">
                        {/* Empresas Disponibles */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Empresas Disponibles
                                </CardTitle>
                                <CardDescription>
                                    Empresas activas que pueden agregarse a destacados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {availableCompanies.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">
                                        No hay empresas disponibles
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {availableCompanies.map((company) => (
                                            <div
                                                key={company.id}
                                                className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-medium">{company.name}</p>
                                                    {company.main_restaurant && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Restaurante: {company.main_restaurant.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => toggleCompanyFeatured(company.id)}
                                                >
                                                    <Star className="mr-2 h-4 w-4" />
                                                    Destacar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Sucursales Disponibles */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="h-5 w-5" />
                                    Sucursales Disponibles
                                </CardTitle>
                                <CardDescription>
                                    Sucursales activas que pueden agregarse a destacados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {availableBranches.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">
                                        No hay sucursales disponibles
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {availableBranches.map((branch) => (
                                            <div
                                                key={branch.id}
                                                className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-medium">{branch.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Empresa: {branch.company.name}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => toggleBranchFeatured(branch.id)}
                                                >
                                                    <Star className="mr-2 h-4 w-4" />
                                                    Destacar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
