import { Head, Link, useForm } from '@inertiajs/react';
import CompanyLayout from '@/layouts/company-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Store, MapPin } from 'lucide-react';
import type { Company } from '@/types/tenant';
import InputError from '@/components/input-error';

interface Props {
    company: Company;
}

export default function BranchCreate({ company }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        is_main: false,
        restaurant_name: '',
        restaurant_category: '',
        restaurant_image_url: '',
        restaurant_description: '',
        restaurant_rating: '',
        restaurant_latitude: '',
        restaurant_longitude: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/company/branches');
    };

    return (
        <CompanyLayout breadcrumbs={[
            { title: 'Dashboard', href: '/company' },
            { title: 'Sucursales', href: '/company/branches' },
            { title: 'Nueva Sucursal', href: '/company/branches/create' },
        ]}>
            <Head title="Nueva Sucursal" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/company/branches">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Nueva Sucursal</h1>
                        <p className="text-muted-foreground">
                            Crea una nueva sucursal para {company.name}
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
                                Datos básicos de la sucursal
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
                                <Store className="h-5 w-5" />
                                Información del Restaurante
                            </CardTitle>
                            <CardDescription>
                                Cada sucursal tiene su propio restaurante asociado
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
                                        placeholder="Mi Restaurante - Centro"
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

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="restaurant_image_url">URL de Imagen</Label>
                                    <Input
                                        id="restaurant_image_url"
                                        value={data.restaurant_image_url}
                                        onChange={(e) => setData('restaurant_image_url', e.target.value)}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                    />
                                    <InputError message={errors.restaurant_image_url} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="restaurant_rating">Calificación (0-5)</Label>
                                    <Input
                                        id="restaurant_rating"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={data.restaurant_rating}
                                        onChange={(e) => setData('restaurant_rating', e.target.value)}
                                        placeholder="4.5"
                                    />
                                    <InputError message={errors.restaurant_rating} />
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
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Ubicación
                            </CardTitle>
                            <CardDescription>
                                Coordenadas geográficas del restaurante (opcional)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="restaurant_latitude">Latitud</Label>
                                    <Input
                                        id="restaurant_latitude"
                                        type="number"
                                        step="any"
                                        value={data.restaurant_latitude}
                                        onChange={(e) => setData('restaurant_latitude', e.target.value)}
                                        placeholder="19.4326"
                                    />
                                    <InputError message={errors.restaurant_latitude} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="restaurant_longitude">Longitud</Label>
                                    <Input
                                        id="restaurant_longitude"
                                        type="number"
                                        step="any"
                                        value={data.restaurant_longitude}
                                        onChange={(e) => setData('restaurant_longitude', e.target.value)}
                                        placeholder="-99.1332"
                                    />
                                    <InputError message={errors.restaurant_longitude} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href="/company/branches">
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
        </CompanyLayout>
    );
}
