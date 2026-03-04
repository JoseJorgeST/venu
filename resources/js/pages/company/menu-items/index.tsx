import { Head, Link, router } from '@inertiajs/react';
import CompanyLayout from '@/layouts/company-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    Search, 
    Plus, 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    Package,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
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
    menuItems: {
        data: MenuItem[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    categories: string[];
    filters: {
        category?: string;
        search?: string;
    };
}

export default function MenuItemsIndex({ branch, restaurant, menuItems, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category || 'all');

    const basePath = branch ? `/company/branches/${branch.id}/menu-items` : '/company/menu';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        applyFilters({ category: newCategory });
    };

    const applyFilters = (overrides: Record<string, string> = {}) => {
        const params: Record<string, string> = {};
        const currentCategory = overrides.category ?? category;
        
        if (search) params.search = search;
        if (currentCategory && currentCategory !== 'all') params.category = currentCategory;
        
        router.get(basePath, params, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('all');
        router.get(basePath);
    };

    const handleDelete = (item: MenuItem) => {
        if (confirm(`¿Estás seguro de eliminar "${item.name}"?`)) {
            router.delete(`${basePath}/${item.id}`);
        }
    };

    const handleToggleAvailability = (item: MenuItem) => {
        router.post(`${basePath}/${item.id}/toggle-availability`);
    };

    const title = branch ? branch.name : (restaurant?.name ?? 'Menú');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const hasFilters = search || (category && category !== 'all');

    return (
        <CompanyLayout>
            <Head title={`Menú - ${title}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Menú / Productos</h1>
                        <p className="text-muted-foreground">
                            {branch ? `Productos de ${branch.name}` : (restaurant ? `Productos de ${restaurant.name}` : 'Gestiona tus productos')}
                        </p>
                    </div>
                    <Link href={`${basePath}/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Producto
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar productos..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </form>
                    <div className="flex gap-2">
                        <Select value={category} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasFilters && (
                            <Button variant="ghost" onClick={clearFilters}>
                                Limpiar
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-right">Precio</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {menuItems.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No hay productos</p>
                                            <Link href={`${basePath}/create`}>
                                                <Button variant="outline" size="sm">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Agregar primer producto
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                menuItems.data.map((item) => (
                                    <TableRow key={item.id} className={!item.is_available ? 'opacity-60' : ''}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        className="h-10 w-10 rounded-md object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                                        <Package className="h-5 w-5 text-muted-foreground" />
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
                                        <TableCell>
                                            {item.category ? (
                                                <Badge variant="outline">{item.category}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(item.price)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.is_available ? 'default' : 'secondary'}>
                                                {item.is_available ? 'Disponible' : 'No disponible'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`${basePath}/${item.id}/edit`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleAvailability(item)}>
                                                        {item.is_available ? (
                                                            <>
                                                                <ToggleLeft className="mr-2 h-4 w-4" />
                                                                Marcar no disponible
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ToggleRight className="mr-2 h-4 w-4" />
                                                                Marcar disponible
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(item)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {menuItems.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {menuItems.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CompanyLayout>
    );
}
