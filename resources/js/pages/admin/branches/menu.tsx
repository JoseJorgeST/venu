import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { ArrowLeft, Package, Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    category: string | null;
    image_url: string | null;
    is_available: boolean;
}

interface Restaurant {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
    restaurant: Restaurant | null;
}

interface Company {
    id: number;
    name: string;
}

interface Props {
    company: Company;
    branch: Branch;
    menuItems: {
        data: MenuItem[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: string[];
}

export default function BranchMenu({ company, branch, menuItems, categories }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const createForm = useForm({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        is_available: true,
    });

    const editForm = useForm({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        is_available: true,
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(`/admin/companies/${company.id}/branches/${branch.id}/menu`, {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        editForm.put(`/admin/companies/${company.id}/branches/${branch.id}/menu/${editingItem.id}`, {
            onSuccess: () => {
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (item: MenuItem) => {
        if (confirm(`¿Estás seguro de eliminar "${item.name}"?`)) {
            router.delete(`/admin/companies/${company.id}/branches/${branch.id}/menu/${item.id}`);
        }
    };

    const openEditDialog = (item: MenuItem) => {
        setEditingItem(item);
        editForm.setData({
            name: item.name,
            description: item.description ?? '',
            price: item.price.toString(),
            category: item.category ?? '',
            image_url: item.image_url ?? '',
            is_available: item.is_available,
        });
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin' },
            { title: 'Empresas', href: '/admin/companies' },
            { title: company.name, href: `/admin/companies/${company.id}` },
            { title: branch.name, href: `/admin/companies/${company.id}/branches/${branch.id}` },
            { title: 'Menú', href: `/admin/companies/${company.id}/branches/${branch.id}/menu` },
        ]}>
            <Head title={`Menú - ${branch.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/companies/${company.id}/branches/${branch.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Menú</h1>
                            <p className="text-muted-foreground">
                                {branch.name} - {company.name}
                            </p>
                        </div>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Producto
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Nuevo Producto</DialogTitle>
                                <DialogDescription>
                                    Agrega un nuevo producto al menú
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create-name">Nombre *</Label>
                                    <Input
                                        id="create-name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-description">Descripción</Label>
                                    <Textarea
                                        id="create-description"
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        rows={2}
                                    />
                                </div>
                                <div className="grid gap-4 grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="create-price">Precio *</Label>
                                        <Input
                                            id="create-price"
                                            type="number"
                                            step="0.01"
                                            value={createForm.data.price}
                                            onChange={(e) => createForm.setData('price', e.target.value)}
                                        />
                                        <InputError message={createForm.errors.price} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-category">Categoría</Label>
                                        <Input
                                            id="create-category"
                                            value={createForm.data.category}
                                            onChange={(e) => createForm.setData('category', e.target.value)}
                                            list="categories"
                                        />
                                        <datalist id="categories">
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-image">URL de Imagen</Label>
                                    <Input
                                        id="create-image"
                                        value={createForm.data.image_url}
                                        onChange={(e) => createForm.setData('image_url', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="create-available"
                                        checked={createForm.data.is_available}
                                        onCheckedChange={(checked) => createForm.setData('is_available', checked)}
                                    />
                                    <Label htmlFor="create-available">Disponible</Label>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={createForm.processing}>
                                        Crear
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Productos
                        </CardTitle>
                        <CardDescription>
                            {menuItems.data.length} productos en el menú
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {menuItems.data.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead className="text-right">Precio</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {menuItems.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {item.image_url ? (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.name}
                                                            className="h-12 w-12 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                                                            <Package className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        {item.description && (
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.category ?? '-'}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.price)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.is_available ? 'default' : 'secondary'}>
                                                    {item.is_available ? 'Disponible' : 'No disponible'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(item)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(item)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-2 text-muted-foreground">
                                    No hay productos en el menú
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Editar Producto</DialogTitle>
                            <DialogDescription>
                                Modifica los datos del producto
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nombre *</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                />
                                <InputError message={editForm.errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Descripción</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    rows={2}
                                />
                            </div>
                            <div className="grid gap-4 grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-price">Precio *</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        step="0.01"
                                        value={editForm.data.price}
                                        onChange={(e) => editForm.setData('price', e.target.value)}
                                    />
                                    <InputError message={editForm.errors.price} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-category">Categoría</Label>
                                    <Input
                                        id="edit-category"
                                        value={editForm.data.category}
                                        onChange={(e) => editForm.setData('category', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-image">URL de Imagen</Label>
                                <Input
                                    id="edit-image"
                                    value={editForm.data.image_url}
                                    onChange={(e) => editForm.setData('image_url', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="edit-available"
                                    checked={editForm.data.is_available}
                                    onCheckedChange={(checked) => editForm.setData('is_available', checked)}
                                />
                                <Label htmlFor="edit-available">Disponible</Label>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    Guardar
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
