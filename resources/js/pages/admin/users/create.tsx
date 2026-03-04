import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface Company {
    id: number;
    name: string;
}

interface Props {
    roles: Role[];
    companies: Company[];
}

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    customer: 'Cliente',
};

export default function UsersCreate({ roles, companies }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer',
        company_ids: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users');
    };

    const toggleCompany = (companyId: number) => {
        setData('company_ids', 
            data.company_ids.includes(companyId)
                ? data.company_ids.filter(id => id !== companyId)
                : [...data.company_ids, companyId]
        );
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Usuarios', href: '/admin/users' },
            { title: 'Crear', href: '/admin/users/create' },
        ]}>
            <Head title="Crear Usuario" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Crear Usuario</h1>
                        <p className="text-muted-foreground">
                            Añade un nuevo usuario a la plataforma
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información básica</CardTitle>
                            <CardDescription>
                                Datos principales del usuario
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre completo</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Juan Pérez"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="juan@ejemplo.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono (opcional)</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+58 412 123 4567"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive">{errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña (opcional)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Dejar vacío para generar automáticamente"
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rol y permisos</CardTitle>
                            <CardDescription>
                                Define el nivel de acceso del usuario
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol</Label>
                                <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {roleLabels[role.name] ?? role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-sm text-destructive">{errors.role}</p>
                                )}
                            </div>

                            {data.role === 'admin' && companies.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Empresas asignadas</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona las empresas que este administrador podrá gestionar
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {companies.map((company) => (
                                            <div key={company.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`company-${company.id}`}
                                                    checked={data.company_ids.includes(company.id)}
                                                    onCheckedChange={() => toggleCompany(company.id)}
                                                />
                                                <label
                                                    htmlFor={`company-${company.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {company.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.company_ids && (
                                        <p className="text-sm text-destructive">{errors.company_ids}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creando...' : 'Crear Usuario'}
                        </Button>
                        <Link href="/admin/users">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
