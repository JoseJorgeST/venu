import { Head, Link, useForm } from '@inertiajs/react';
import CompanyLayout from '@/layouts/company-layout';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { ArrowLeft, Package } from 'lucide-react';
import { useState } from 'react';

interface Branch {
    id: number;
    name: string;
}

interface Restaurant {
    id: number;
    name: string;
}

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    category: string | null;
    image_url: string | null;
    is_available: boolean;
}

interface Props {
    branch: Branch | null;
    restaurant?: Restaurant | null;
    menuItem: MenuItem;
    existingCategories: string[];
}

export default function EditMenuItem({ branch, restaurant, menuItem, existingCategories }: Props) {
    const categoryExists = menuItem.category && existingCategories.includes(menuItem.category);
    const [useNewCategory, setUseNewCategory] = useState(!categoryExists && !!menuItem.category);
    
    const basePath = branch ? `/company/branches/${branch.id}/menu-items` : '/company/menu';
    const title = branch?.name ?? restaurant?.name ?? 'Menú';
    
    const { data, setData, put, processing, errors } = useForm({
        name: menuItem.name,
        description: menuItem.description ?? '',
        price: menuItem.price.toString(),
        category: menuItem.category ?? '',
        image_url: menuItem.image_url ?? '',
        is_available: menuItem.is_available,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`${basePath}/${menuItem.id}`);
    };

    const handleCategoryChange = (value: string) => {
        if (value === 'new') {
            setUseNewCategory(true);
            setData('category', '');
        } else {
            setUseNewCategory(false);
            setData('category', value);
        }
    };

    return (
        <CompanyLayout>
            <Head title={`Editar: ${menuItem.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={basePath}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
                        <p className="text-muted-foreground">
                            Modificar {menuItem.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Información del Producto
                            </CardTitle>
                            <CardDescription>
                                Datos básicos del producto
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
                                        placeholder="Hamburguesa Clásica"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Precio *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="9.99"
                                    />
                                    <InputError message={errors.price} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Descripción del producto..."
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    {existingCategories.length > 0 && !useNewCategory ? (
                                        <Select
                                            value={data.category || 'new'}
                                            onValueChange={handleCategoryChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar categoría..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">+ Nueva categoría</SelectItem>
                                                {existingCategories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="space-y-2">
                                            <Input
                                                value={data.category}
                                                onChange={(e) => setData('category', e.target.value)}
                                                placeholder="Ej: Hamburguesas, Bebidas, Postres..."
                                            />
                                            {existingCategories.length > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setUseNewCategory(false)}
                                                >
                                                    Usar categoría existente
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    <InputError message={errors.category} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image_url">URL de Imagen</Label>
                                    <Input
                                        id="image_url"
                                        type="url"
                                        value={data.image_url}
                                        onChange={(e) => setData('image_url', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    <InputError message={errors.image_url} />
                                </div>
                            </div>

                            {data.image_url && (
                                <div className="space-y-2">
                                    <Label>Vista previa</Label>
                                    <img
                                        src={data.image_url}
                                        alt={data.name}
                                        className="h-32 w-32 rounded-lg object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Switch
                                    id="is_available"
                                    checked={data.is_available}
                                    onCheckedChange={(checked) => setData('is_available', checked)}
                                />
                                <Label htmlFor="is_available">Disponible para venta</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={basePath}>
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
        </CompanyLayout>
    );
}
