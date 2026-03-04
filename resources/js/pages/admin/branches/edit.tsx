import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import InputError from '@/components/input-error';
import { ArrowLeft, Store, MapPin } from 'lucide-react';

interface Restaurant {
    id: number;
    name: string;
    category: string | null;
    description: string | null;
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

interface Props {
    company: Company;
    branch: Branch;
}

export default function EditBranch({ company, branch }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: branch.name,
        code: branch.code ?? '',
        is_main: branch.is_main,
        is_active: branch.is_active,
        restaurant_name: branch.restaurant?.name ?? '',
        restaurant_category: branch.restaurant?.category ?? '',
        restaurant_description: branch.restaurant?.description ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/companies/${company.id}/branches/${branch.id}`);
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Empresas', href: '/admin/companies' },
            { title: company.name, href: `/admin/companies/${company.id}` },
            { title: branch.name, href: `/admin/companies/${company.id}/branches/${branch.id}` },
            { title: 'Editar', href: `/admin/companies/${company.id}/branches/${branch.id}/edit` },
        ]}>
            <Head title={`Editar: ${branch.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/companies/${company.id}/branches/${branch.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Editar Sucursal</h1>
                        <p className="text-muted-foreground">
                            Modificar {branch.name} de {company.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Información de la Sucursal
                            </CardTitle>
                            <CardDescription>
                                Datos de identificación de la sucursal
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre de la Sucursal *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Código</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                    />
                                    <InputError message={errors.code} />
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="is_main"
                                        checked={data.is_main}
                                        onCheckedChange={(checked) => setData('is_main', checked)}
                                    />
                                    <Label htmlFor="is_main">Sucursal principal</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Sucursal activa</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Información del Restaurante
                            </CardTitle>
                            <CardDescription>
                                Datos del restaurante asociado a esta sucursal
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="restaurant_name">Nombre del Restaurante *</Label>
                                    <Input
                                        id="restaurant_name"
                                        value={data.restaurant_name}
                                        onChange={(e) => setData('restaurant_name', e.target.value)}
                                    />
                                    <InputError message={errors.restaurant_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="restaurant_category">Categoría</Label>
                                    <Input
                                        id="restaurant_category"
                                        value={data.restaurant_category}
                                        onChange={(e) => setData('restaurant_category', e.target.value)}
                                    />
                                    <InputError message={errors.restaurant_category} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="restaurant_description">Descripción</Label>
                                <Textarea
                                    id="restaurant_description"
                                    value={data.restaurant_description}
                                    onChange={(e) => setData('restaurant_description', e.target.value)}
                                    rows={3}
                                />
                                <InputError message={errors.restaurant_description} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={`/admin/companies/${company.id}/branches/${branch.id}`}>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
