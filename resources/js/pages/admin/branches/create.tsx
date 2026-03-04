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

interface Company {
    id: number;
    name: string;
}

interface Props {
    company: Company;
}

export default function CreateBranch({ company }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        is_main: false,
        restaurant_name: '',
        restaurant_category: '',
        restaurant_description: '',
        restaurant_address: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/companies/${company.id}/branches`);
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Empresas', href: '/admin/companies' },
            { title: company.name, href: `/admin/companies/${company.id}` },
            { title: 'Nueva Sucursal', href: `/admin/companies/${company.id}/branches/create` },
        ]}>
            <Head title="Nueva Sucursal" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/companies/${company.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Nueva Sucursal</h1>
                        <p className="text-muted-foreground">
                            Crear sucursal para {company.name}
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
                                        placeholder="Sucursal Centro"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Código (opcional)</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="SUC-001"
                                    />
                                    <InputError message={errors.code} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    id="is_main"
                                    checked={data.is_main}
                                    onCheckedChange={(checked) => setData('is_main', checked)}
                                />
                                <Label htmlFor="is_main">Sucursal principal</Label>
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
                                        placeholder="Mi Restaurante"
                                    />
                                    <InputError message={errors.restaurant_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="restaurant_category">Categoría</Label>
                                    <Input
                                        id="restaurant_category"
                                        value={data.restaurant_category}
                                        onChange={(e) => setData('restaurant_category', e.target.value)}
                                        placeholder="Italiana, Mexicana, etc."
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
                                    placeholder="Descripción del restaurante..."
                                    rows={3}
                                />
                                <InputError message={errors.restaurant_description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="restaurant_address">Dirección</Label>
                                <Input
                                    id="restaurant_address"
                                    value={data.restaurant_address}
                                    onChange={(e) => setData('restaurant_address', e.target.value)}
                                    placeholder="Calle Principal 123"
                                />
                                <InputError message={errors.restaurant_address} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={`/admin/companies/${company.id}`}>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            Crear Sucursal
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
