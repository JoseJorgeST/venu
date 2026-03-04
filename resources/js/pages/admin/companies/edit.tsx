import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Alert,
    AlertDescription,
} from '@/components/ui/alert';
import InputError from '@/components/input-error';
import { ArrowLeft, Building2, User, AlertTriangle } from 'lucide-react';

interface Admin {
    id: number;
    name: string;
    email: string;
}

interface Company {
    id: number;
    name: string;
    slug: string;
    owner_id: number;
    logo_url: string | null;
    description: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    tax_id: string | null;
    is_active: boolean;
}

interface Props {
    company: Company;
    admins: Admin[];
}

export default function EditCompany({ company, admins }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: company.name,
        slug: company.slug,
        owner_id: company.owner_id.toString(),
        logo_url: company.logo_url ?? '',
        description: company.description ?? '',
        email: company.email ?? '',
        phone: company.phone ?? '',
        address: company.address ?? '',
        tax_id: company.tax_id ?? '',
        is_active: company.is_active,
        remove_previous_owner: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/companies/${company.id}`);
    };

    const ownerChanged = data.owner_id !== company.owner_id.toString();
    const currentOwner = admins.find(a => a.id === company.owner_id);

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Empresas', href: '/admin/companies' },
            { title: company.name, href: `/admin/companies/${company.id}` },
            { title: 'Editar', href: `/admin/companies/${company.id}/edit` },
        ]}>
            <Head title={`Editar: ${company.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/companies/${company.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Editar Empresa</h1>
                        <p className="text-muted-foreground">
                            Modifica la información de {company.name}
                        </p>
                    </div>
                </div>

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
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug (URL)</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
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
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
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
                                    />
                                    <InputError message={errors.address} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax_id">NIF/CIF</Label>
                                    <Input
                                        id="tax_id"
                                        value={data.tax_id}
                                        onChange={(e) => setData('tax_id', e.target.value)}
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
                                Administrador responsable de la empresa
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Propietario actual</Label>
                                {currentOwner && (
                                    <p className="text-sm text-muted-foreground">
                                        {currentOwner.name} ({currentOwner.email})
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Nuevo propietario</Label>
                                <Select
                                    value={data.owner_id}
                                    onValueChange={(value) => {
                                        setData('owner_id', value);
                                        if (value === company.owner_id.toString()) {
                                            setData('remove_previous_owner', false);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar propietario..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {admins.filter(admin => admin.id).map((admin) => (
                                            <SelectItem key={admin.id} value={String(admin.id)}>
                                                {admin.name} ({admin.email})
                                                {admin.id === company.owner_id && ' (actual)'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.owner_id} />
                            </div>

                            {ownerChanged && currentOwner && (
                                <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <AlertDescription className="space-y-3">
                                        <p className="text-sm">
                                            Estás cambiando el propietario de <strong>{currentOwner.name}</strong> a{' '}
                                            <strong>{admins.find(a => a.id.toString() === data.owner_id)?.name}</strong>.
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remove_previous_owner"
                                                checked={data.remove_previous_owner}
                                                onCheckedChange={(checked) => 
                                                    setData('remove_previous_owner', checked === true)
                                                }
                                            />
                                            <label
                                                htmlFor="remove_previous_owner"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Remover a {currentOwner.name} de la empresa
                                            </label>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {data.remove_previous_owner
                                                ? `${currentOwner.name} será removido completamente de la empresa.`
                                                : `${currentOwner.name} permanecerá como gerente de la empresa.`}
                                        </p>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={`/admin/companies/${company.id}`}>
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
