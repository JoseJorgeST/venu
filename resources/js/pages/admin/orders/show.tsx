import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, User, MapPin, Clock, CreditCard, Package, ChefHat, CheckCircle, XCircle, Banknote, UtensilsCrossed } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';

interface OrderItem {
    name: string;
    quantity: number;
    unit_price: string;
    total: number;
    menu_item_id: number;
}

interface Order {
    id: number;
    user_id: number;
    restaurant_id: number;
    items: OrderItem[];
    total_amount: string;
    commission: string;
    status: string;
    stripe_payment_id: string | null;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    restaurant: {
        id: number;
        name: string;
        slug: string;
    };
    loyalty_logs?: Array<{
        id: number;
        points_change: number;
        transaction_type: string;
        created_at: string;
    }>;
}

interface OrderStatus {
    value: string;
}

interface Props {
    order: Order;
    statuses: OrderStatus[];
}

const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    preparing: 'Preparando',
    ready: 'Listo',
    completed: 'Completado',
    cancelled: 'Cancelado',
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    paid: 'bg-blue-100 text-blue-800 border-blue-300',
    preparing: 'bg-orange-100 text-orange-800 border-orange-300',
    ready: 'bg-purple-100 text-purple-800 border-purple-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const statusFlow = ['pending', 'paid', 'preparing', 'ready', 'completed'];

const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    paid: <Banknote className="h-4 w-4" />,
    preparing: <ChefHat className="h-4 w-4" />,
    ready: <UtensilsCrossed className="h-4 w-4" />,
    completed: <CheckCircle className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />,
};

function getNextStatus(currentStatus: string): string | null {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) {
        return null;
    }
    return statusFlow[currentIndex + 1];
}

export default function OrderShow({ order, statuses }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Reportes', href: '/admin/reports' },
        { title: `Pedido #${order.id}`, href: `/admin/orders/${order.id}` },
    ];

    const handleStatusChange = (newStatus: string) => {
        router.put(`/admin/orders/${order.id}/status`, {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(Number(amount));
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pedido #${order.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Pedido #{order.id}</h1>
                            <p className="text-muted-foreground">
                                {formatDate(order.created_at)}
                            </p>
                        </div>
                    </div>
                    <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                        {statusLabels[order.status] || order.status}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Información del Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="font-medium">{order.user.name}</p>
                            <p className="text-sm text-muted-foreground">{order.user.email}</p>
                        </CardContent>
                    </Card>

                    {/* Información del Restaurante */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Restaurante
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="font-medium">{order.restaurant.name}</p>
                            <Link 
                                href={`/restaurants/${order.restaurant.slug}`}
                                className="text-sm text-primary hover:underline"
                            >
                                Ver restaurante
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Estado del Pedido */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Estado Actual
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className={`flex items-center gap-2 p-3 rounded-lg border-2 ${statusColors[order.status]}`}>
                                {statusIcons[order.status]}
                                <span className="font-semibold">{statusLabels[order.status]}</span>
                            </div>
                            {getNextStatus(order.status) && (
                                <Button 
                                    onClick={() => handleStatusChange(getNextStatus(order.status)!)}
                                    className="w-full"
                                    size="lg"
                                >
                                    {statusIcons[getNextStatus(order.status)!]}
                                    <span className="ml-2">
                                        Cambiar a {statusLabels[getNextStatus(order.status)!]}
                                    </span>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Flujo de Estados */}
                {order.status !== 'cancelled' && order.status !== 'completed' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Flujo del Pedido</CardTitle>
                            <CardDescription>Progreso del pedido a través de los estados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                {statusFlow.map((status, index) => {
                                    const currentIndex = statusFlow.indexOf(order.status);
                                    const isCompleted = index < currentIndex;
                                    const isCurrent = index === currentIndex;
                                    const isPending = index > currentIndex;

                                    return (
                                        <div key={status} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center">
                                                <button
                                                    onClick={() => !isPending && handleStatusChange(status)}
                                                    disabled={isPending}
                                                    className={`
                                                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                                                        ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                                                        ${isCurrent ? 'bg-blue-500 border-blue-500 text-white ring-4 ring-blue-200' : ''}
                                                        ${isPending ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
                                                    `}
                                                >
                                                    {statusIcons[status]}
                                                </button>
                                                <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-blue-600' : isPending ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {statusLabels[status]}
                                                </span>
                                            </div>
                                            {index < statusFlow.length - 1 && (
                                                <div className={`flex-1 h-1 mx-2 rounded ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Detalle de Productos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Productos
                        </CardTitle>
                        <CardDescription>
                            Detalle de los productos del pedido
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-center">Cantidad</TableHead>
                                    <TableHead className="text-right">Precio Unit.</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(item.unit_price)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(item.total)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <Separator className="my-4" />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>{formatCurrency(Number(order.total_amount) - Number(order.commission))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Comisión</span>
                                <span>{formatCurrency(order.commission)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Información de Pago */}
                {order.stripe_payment_id && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Información de Pago
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">ID de Pago Stripe</span>
                                    <code className="text-sm bg-muted px-2 py-1 rounded">
                                        {order.stripe_payment_id}
                                    </code>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Historial de Puntos */}
                {order.loyalty_logs && order.loyalty_logs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Puntos de Lealtad</CardTitle>
                            <CardDescription>
                                Movimientos de puntos asociados a este pedido
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="text-right">Puntos</TableHead>
                                        <TableHead className="text-right">Fecha</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.loyalty_logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <Badge variant={log.transaction_type === 'earn' ? 'default' : 'secondary'}>
                                                    {log.transaction_type === 'earn' ? 'Ganados' : 'Canjeados'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {log.transaction_type === 'earn' 
                                                    ? 'Puntos ganados por compra' 
                                                    : 'Puntos canjeados en compra'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                <span className={log.transaction_type === 'earn' ? 'text-green-600' : 'text-red-600'}>
                                                    {log.transaction_type === 'earn' ? '+' : '-'}{log.points_change}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {formatDate(log.created_at)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
