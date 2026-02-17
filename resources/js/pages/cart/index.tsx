import { Head, Link } from '@inertiajs/react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { useCart } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const COMMISSION_RATE = 0.1;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Carrito', href: '/cart' },
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    }).format(value);
}

export default function CartIndex() {
    const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();

    const commission = subtotal * COMMISSION_RATE;
    const total = subtotal + commission;

    if (items.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Carrito" />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
                    <p className="text-muted-foreground">Tu carrito está vacío.</p>
                    <Button asChild>
                        <Link href="/restaurants">Explorar restaurantes</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Carrito" />
            <div className="flex flex-1 flex-col gap-6 p-4 pb-24 md:p-6 md:pb-24">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Carrito</h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearCart()}
                        className="text-muted-foreground"
                    >
                        Vaciar carrito
                    </Button>
                </div>

                <ul className="space-y-3">
                    {items.map((item) => (
                        <li
                            key={item.menuItemId}
                            className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex gap-3">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                                        Sin imagen
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground tabular-nums">
                                        {formatCurrency(item.price)} × {item.quantity} ={' '}
                                        {formatCurrency(item.price * item.quantity)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center rounded-lg border">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-r-none"
                                        onClick={() =>
                                            updateQuantity(
                                                item.menuItemId,
                                                item.quantity - 1
                                            )
                                        }
                                        disabled={item.quantity <= 1}
                                        aria-label="Reducir cantidad"
                                    >
                                        <Minus className="size-4" />
                                    </Button>
                                    <span className="min-w-8 text-center text-sm font-medium tabular-nums">
                                        {item.quantity}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-l-none"
                                        onClick={() =>
                                            updateQuantity(
                                                item.menuItemId,
                                                item.quantity + 1
                                            )
                                        }
                                        aria-label="Aumentar cantidad"
                                    >
                                        <Plus className="size-4" />
                                    </Button>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => removeItem(item.menuItemId)}
                                    aria-label="Eliminar"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className={cn('rounded-lg border bg-card p-4', 'mt-4 max-w-md')}>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Subtotal</dt>
                            <dd className="font-medium tabular-nums">
                                {formatCurrency(subtotal)}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">
                                Comisión ({(COMMISSION_RATE * 100).toFixed(0)}%)
                            </dt>
                            <dd className="font-medium tabular-nums">
                                {formatCurrency(commission)}
                            </dd>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-base">
                            <dt className="font-semibold">Total</dt>
                            <dd className="font-semibold tabular-nums">
                                {formatCurrency(total)}
                            </dd>
                        </div>
                    </dl>
                </div>
                <Button asChild>
                    <Link href="/checkout">Ir a checkout</Link>
                </Button>
            </div>
        </AppLayout>
    );
}
