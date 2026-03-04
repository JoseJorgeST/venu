import { Head, useForm } from '@inertiajs/react';
import CompanyLayout from '@/layouts/company-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Phone, MapPin, Store, UtensilsCrossed } from 'lucide-react';
import InputError from '@/components/input-error';
import type { Company, Branch } from '@/types/tenant';

interface Props {
    company: Company & {
        description: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        tax_id: string | null;
        logo_url: string | null;
    };
    branch: (Branch & {
        address?: string | null;
        phone?: string | null;
        email?: string | null;
        restaurant?: {
            id: number;
            name: string;
            category: string | null;
            description: string | null;
            image_url: string | null;
        } | null;
    }) | null;
    mode: 'company' | 'branch';
}

export default function CompanySettings({ company, branch, mode }: Props) {
    if (mode === 'branch' && branch) {
        return <BranchSettings company={company} branch={branch} />;
    }

    return <CompanySettingsForm company={company} />;
}

function CompanySettingsForm({ company }: { company: Props['company'] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: company.name,
        slug: company.slug || '',
        description: company.description || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        tax_id: company.tax_id || '',
        logo_url: company.logo_url || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/company/settings');
    };

    return (
        <CompanyLayout breadcrumbs={[
            { title: 'Dashboard', href: '/company' },
            { title: 'Configuración', href: '/company/settings' },
        ]}>
            <Head title="Configuración de Empresa" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración de Empresa</h1>
                    <p className="text-muted-foreground">
                        Administra la información de tu empresa
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Información General
                            </CardTitle>
                            <CardDescription>
                                Datos básicos de tu empresa
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre de la Empresa *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Mi Empresa"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug (URL)</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="mi-empresa"
                                    />
                                    <InputError message={errors.slug} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Descripción de tu empresa..."
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logo_url">URL del Logo</Label>
                                <Input
                                    id="logo_url"
                                    value={data.logo_url}
                                    onChange={(e) => setData('logo_url', e.target.value)}
                                    placeholder="https://ejemplo.com/logo.png"
                                />
                                <InputError message={errors.logo_url} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Contacto
                            </CardTitle>
                            <CardDescription>
                                Información de contacto de tu empresa
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="contacto@empresa.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+1 234 567 8900"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Ubicación y Fiscal
                            </CardTitle>
                            <CardDescription>
                                Dirección y datos fiscales
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Calle Principal 123, Ciudad"
                                />
                                <InputError message={errors.address} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tax_id">NIF/CIF/RUC</Label>
                                <Input
                                    id="tax_id"
                                    value={data.tax_id}
                                    onChange={(e) => setData('tax_id', e.target.value)}
                                    placeholder="12345678-9"
                                />
                                <InputError message={errors.tax_id} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </CompanyLayout>
    );
}

function BranchSettings({ company, branch }: { company: Props['company']; branch: NonNullable<Props['branch']> }) {
    const { data, setData, put, processing, errors } = useForm({
        name: branch.name,
        code: branch.code || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        restaurant_name: branch.restaurant?.name || '',
        restaurant_category: branch.restaurant?.category || '',
        restaurant_description: branch.restaurant?.description || '',
        restaurant_image_url: branch.restaurant?.image_url || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/company/settings');
    };

    return (
        <CompanyLayout breadcrumbs={[
            { title: 'Dashboard', href: '/company' },
            { title: 'Configuración', href: '/company/settings' },
        ]}>
            <Head title={`Configuración - ${branch.name}`} />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración de Sucursal</h1>
                    <p className="text-muted-foreground">
                        Administra la información de la sucursal <strong>{branch.name}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Información de la Sucursal
                            </CardTitle>
                            <CardDescription>
                                Datos básicos de esta sucursal
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
                                    <Label htmlFor="code">Código</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="SUC-001"
                                    />
                                    <InputError message={errors.code} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Calle Principal 123"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+1 234 567 8900"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="sucursal@empresa.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {branch.restaurant && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UtensilsCrossed className="h-5 w-5" />
                                    Restaurante
                                </CardTitle>
                                <CardDescription>
                                    Información del restaurante de esta sucursal
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="restaurant_name">Nombre del Restaurante</Label>
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
                                    <Label htmlFor="restaurant_image_url">URL de Imagen</Label>
                                    <Input
                                        id="restaurant_image_url"
                                        value={data.restaurant_image_url}
                                        onChange={(e) => setData('restaurant_image_url', e.target.value)}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                    />
                                    <InputError message={errors.restaurant_image_url} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </CompanyLayout>
    );
}
