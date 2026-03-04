import { Head, router, useForm } from '@inertiajs/react';
import CompanyLayout from '@/layouts/company-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, MapPin, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface TableLocation {
    id: number;
    name: string;
    description: string | null;
    capacity: number | null;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    locations: TableLocation[];
}

export default function TableLocationsIndex({ locations }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingLocation, setEditingLocation] = useState<TableLocation | null>(null);

    const createForm = useForm({
        name: '',
        description: '',
        capacity: '',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        description: '',
        capacity: '',
        is_active: true,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/company/settings/locations', {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLocation) return;
        
        editForm.put(`/company/settings/locations/${editingLocation.id}`, {
            onSuccess: () => {
                setShowEditModal(false);
                setEditingLocation(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (location: TableLocation) => {
        if (!confirm(`¿Eliminar la ubicación "${location.name}"?`)) return;
        router.delete(`/company/settings/locations/${location.id}`);
    };

    const openEditModal = (location: TableLocation) => {
        setEditingLocation(location);
        editForm.setData({
            name: location.name,
            description: location.description || '',
            capacity: location.capacity?.toString() || '',
            is_active: location.is_active,
        });
        setShowEditModal(true);
    };

    return (
        <CompanyLayout>
            <Head title="Ubicaciones de Mesas" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Ubicaciones de Mesas</h1>
                        <p className="text-muted-foreground">
                            Configura las zonas disponibles para asignar mesas (terraza, interior, jardín, etc.)
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Ubicación
                    </Button>
                </div>

                {locations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-12 text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground" />
                        <div>
                            <p className="font-medium">No hay ubicaciones configuradas</p>
                            <p className="text-sm text-muted-foreground">
                                Agrega ubicaciones como "Terraza", "Interior", "Jardín" para asignar mesas.
                            </p>
                        </div>
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Crear primera ubicación
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Capacidad</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.map((location) => (
                                    <TableRow key={location.id}>
                                        <TableCell>
                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{location.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {location.description || (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {location.capacity ? (
                                                <span>{location.capacity} mesas</span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={location.is_active ? 'default' : 'secondary'}>
                                                {location.is_active ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(location)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(location)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Modal Crear */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Ubicación</DialogTitle>
                        <DialogDescription>
                            Agrega una nueva zona para asignar mesas a los clientes.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Ej: Terraza, Interior, Jardín"
                            />
                            {createForm.errors.name && (
                                <p className="text-sm text-destructive">{createForm.errors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                placeholder="Ej: Zona al aire libre con vista al jardín"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Cantidad de mesas disponibles</Label>
                            <Input
                                id="capacity"
                                type="number"
                                min="1"
                                value={createForm.data.capacity}
                                onChange={(e) => createForm.setData('capacity', e.target.value)}
                                placeholder="Ej: 10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_active"
                                checked={createForm.data.is_active}
                                onCheckedChange={(checked) => createForm.setData('is_active', checked)}
                            />
                            <Label htmlFor="is_active">Ubicación activa</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Crear Ubicación
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Editar */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Ubicación</DialogTitle>
                        <DialogDescription>
                            Modifica los datos de la ubicación.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre *</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                placeholder="Ej: Terraza, Interior, Jardín"
                            />
                            {editForm.errors.name && (
                                <p className="text-sm text-destructive">{editForm.errors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Descripción</Label>
                            <Input
                                id="edit-description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                placeholder="Ej: Zona al aire libre con vista al jardín"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-capacity">Cantidad de mesas disponibles</Label>
                            <Input
                                id="edit-capacity"
                                type="number"
                                min="1"
                                value={editForm.data.capacity}
                                onChange={(e) => editForm.setData('capacity', e.target.value)}
                                placeholder="Ej: 10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="edit-is_active"
                                checked={editForm.data.is_active}
                                onCheckedChange={(checked) => editForm.setData('is_active', checked)}
                            />
                            <Label htmlFor="edit-is_active">Ubicación activa</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </CompanyLayout>
    );
}
