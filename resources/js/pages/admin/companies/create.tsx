import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import { ArrowLeft, Building2, User, Armchair, Plus, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
    admins: { id: number; name: string; email: string }[];
    availableAdmins: { id: number; name: string; email: string }[];
}

interface LocationInput {
    name: string;
    description: string;
}

export default function CreateCompany({ admins, availableAdmins }: Props) {
    const [locations, setLocations] = useState<LocationInput[]>([]);
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationDescription, setNewLocationDescription] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        owner_id: '',
        owner_name: '',
        owner_email: '',
        logo_url: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        tax_id: '',
        is_active: true,
        locations: [] as LocationInput[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('locations', locations);
        post('/admin/companies', {
            data: { ...data, locations },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
        });
    };

    const addLocation = () => {
        if (newLocationName.trim()) {
            setLocations([...locations, { name: newLocationName.trim(), description: newLocationDescription.trim() }]);
            setNewLocationName('');
            setNewLocationDescription('');
        }
    };

    const removeLocation = (index: number) => {
        setLocations(locations.filter((_, i) => i !== index));
    };

    const useExistingOwner = data.owner_id !== '';

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Empresas', href: '/admin/companies' },
            { title: 'Nueva Empresa', href: '/admin/companies/create' },
        ]}>
            <Head title="Nueva Empresa" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/companies">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Nueva Empresa</h1>
                        <p className="text-muted-foreground">
                            Crea una nueva empresa en la plataforma
                        </p>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                        <div className="text-sm text-red-700 dark:text-red-400">
                            <p className="font-medium">Por favor corrige los siguientes errores:</p>
                            <ul className="mt-2 list-disc list-inside">
                                {Object.entries(errors).map(([key, message]) => (
                                    <li key={key}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Información de la Empresa
                            </CardTitle>
                            <CardDescription>
                                Datos básicos de la empresa
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
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
                                    placeholder="Descripción de la empresa..."
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

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
                                        placeholder="+34 600 000 000"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
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
                                <div className="space-y-2">
                                    <Label htmlFor="tax_id">NIF/CIF</Label>
                                    <Input
                                        id="tax_id"
                                        value={data.tax_id}
                                        onChange={(e) => setData('tax_id', e.target.value)}
                                        placeholder="B12345678"
                                    />
                                    <InputError message={errors.tax_id} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logo_url">URL del Logo</Label>
                                <Input
                                    id="logo_url"
                                    value={data.logo_url}
                                    onChange={(e) => setData('logo_url', e.target.value)}
                                    placeholder="https://..."
                                />
                                <InputError message={errors.logo_url} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Empresa activa</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Propietario
                            </CardTitle>
                            <CardDescription>
                                Selecciona un administrador existente o crea uno nuevo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Administrador existente</Label>
                                <Select
                                    value={data.owner_id || 'new'}
                                    onValueChange={(value) => setData('owner_id', value === 'new' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar administrador..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">Crear nuevo administrador</SelectItem>
                                        {availableAdmins.filter(admin => admin.id).map((admin) => (
                                            <SelectItem key={admin.id} value={String(admin.id)}>
                                                {admin.name} ({admin.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {!useExistingOwner && (
                                <>
                                    <Separator />
                                    <p className="text-sm text-muted-foreground">
                                        Crear nuevo administrador:
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="owner_name">Nombre *</Label>
                                            <Input
                                                id="owner_name"
                                                value={data.owner_name}
                                                onChange={(e) => setData('owner_name', e.target.value)}
                                                placeholder="Juan García"
                                            />
                                            <InputError message={errors.owner_name} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="owner_email">Email *</Label>
                                            <Input
                                                id="owner_email"
                                                type="email"
                                                value={data.owner_email}
                                                onChange={(e) => setData('owner_email', e.target.value)}
                                                placeholder="juan@empresa.com"
                                            />
                                            <InputError message={errors.owner_email} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Armchair className="h-5 w-5" />
                                Ubicaciones / Zonas
                            </CardTitle>
                            <CardDescription>
                                Configura las zonas disponibles para reservaciones (ej: Terraza, VIP, Balcón, Sala principal)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="new_location_name">Nombre de la zona</Label>
                                    <Input
                                        id="new_location_name"
                                        value={newLocationName}
                                        onChange={(e) => setNewLocationName(e.target.value)}
                                        placeholder="Ej: Terraza, VIP, Balcón"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addLocation();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="new_location_desc">Descripción (opcional)</Label>
                                    <Input
                                        id="new_location_desc"
                                        value={newLocationDescription}
                                        onChange={(e) => setNewLocationDescription(e.target.value)}
                                        placeholder="Ej: Zona al aire libre"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addLocation();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button type="button" onClick={addLocation} disabled={!newLocationName.trim()}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {locations.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Ubicaciones agregadas:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {locations.map((location, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="flex items-center gap-1 px-3 py-1.5"
                                            >
                                                <Armchair className="h-3 w-3" />
                                                <span>{location.name}</span>
                                                {location.description && (
                                                    <span className="text-muted-foreground">({location.description})</span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeLocation(index)}
                                                    className="ml-1 hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {locations.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No hay ubicaciones configuradas. Puedes agregarlas ahora o después desde la configuración de la empresa.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href="/admin/companies">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            Crear Empresa
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
