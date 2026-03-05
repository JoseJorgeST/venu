import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import InputError from '@/components/input-error';
import { ArrowLeft, Store, MapPin, CreditCard, Eye, EyeOff, Info } from 'lucide-react';

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

interface StripeStatus {
    has_key: boolean;
    has_secret: boolean;
    has_webhook: boolean;
    enabled: boolean;
}

interface Props {
    company: Company;
    branch: Branch;
    stripeStatus: StripeStatus;
}

export default function EditBranch({ company, branch, stripeStatus }: Props) {
    const [showSecret, setShowSecret] = useState(false);
    const [showWebhook, setShowWebhook] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: branch.name,
        code: branch.code ?? '',
        is_main: branch.is_main,
        is_active: branch.is_active,
        restaurant_name: branch.restaurant?.name ?? '',
        restaurant_category: branch.restaurant?.category ?? '',
        restaurant_description: branch.restaurant?.description ?? '',
        stripe_key: '',
        stripe_secret: '',
        stripe_webhook_secret: '',
        stripe_enabled: stripeStatus.enabled,
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Configuración de Stripe
                            </CardTitle>
                            <CardDescription>
                                Credenciales de pago para esta sucursal (opcional - si no se configura, usará las de la empresa)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="stripe_enabled"
                                    checked={data.stripe_enabled}
                                    onCheckedChange={(checked) => setData('stripe_enabled', checked)}
                                />
                                <Label htmlFor="stripe_enabled">Habilitar Stripe para esta sucursal</Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stripe_key">Publishable Key</Label>
                                <Input
                                    id="stripe_key"
                                    value={data.stripe_key}
                                    onChange={(e) => setData('stripe_key', e.target.value)}
                                    placeholder={stripeStatus.has_key ? 'pk_test_••••••••••••••••' : 'pk_test_...'}
                                />
                                <InputError message={errors.stripe_key} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stripe_secret">Secret Key</Label>
                                <div className="relative">
                                    <Input
                                        id="stripe_secret"
                                        type={showSecret ? 'text' : 'password'}
                                        value={data.stripe_secret}
                                        onChange={(e) => setData('stripe_secret', e.target.value)}
                                        placeholder={stripeStatus.has_secret ? '••••••••••••••••' : 'sk_test_...'}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full"
                                        onClick={() => setShowSecret(!showSecret)}
                                    >
                                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <InputError message={errors.stripe_secret} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stripe_webhook_secret">Webhook Secret (opcional)</Label>
                                <div className="relative">
                                    <Input
                                        id="stripe_webhook_secret"
                                        type={showWebhook ? 'text' : 'password'}
                                        value={data.stripe_webhook_secret}
                                        onChange={(e) => setData('stripe_webhook_secret', e.target.value)}
                                        placeholder={stripeStatus.has_webhook ? '••••••••••••••••' : 'whsec_...'}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full"
                                        onClick={() => setShowWebhook(!showWebhook)}
                                    >
                                        {showWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <InputError message={errors.stripe_webhook_secret} />
                            </div>

                            <Alert variant="destructive">
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Importante:</strong> Cada sucursal debe tener su propia cuenta de Stripe configurada para poder recibir pagos.
                                    Sin estas credenciales, los clientes no podrán pagar en esta sucursal.
                                    Para obtener las keys, ve a tu{' '}
                                    <a
                                        href="https://dashboard.stripe.com/apikeys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        Dashboard de Stripe
                                    </a>.
                                </AlertDescription>
                            </Alert>
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
