import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { useCart } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const COMMISSION_RATE = 0.1;
const POINTS_PER_EUR = 100; // 100 pts = 1€

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Carrito', href: '/cart' },
    { title: 'Checkout', href: '/checkout' },
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    }).format(value);
}

type Props = {
    wallet_points: number;
};

export default function CheckoutIndex({ wallet_points }: Props) {
    const { items, subtotal } = useCart();
    const [usePoints, setUsePoints] = useState(false);

    const commission = subtotal * COMMISSION_RATE;
    const totalBeforePoints = subtotal + commission;
    const maxPointsToUse = Math.min(
        wallet_points,
        Math.floor(totalBeforePoints * POINTS_PER_EUR)
    );
    const pointsDiscountEur = usePoints ? maxPointsToUse / POINTS_PER_EUR : 0;
    const finalTotal = Math.max(0, totalBeforePoints - pointsDiscountEur);

    if (items.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Checkout" />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
                    <p className="text-muted-foreground">Tu carrito está vacío.</p>
                    <Button asChild>
                        <Link href="/cart">Ver carrito</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checkout" />
            <div className="flex flex-1 flex-col gap-6 p-4 pb-24 md:p-6 md:pb-24">
                <h1 className="text-2xl font-semibold">Checkout</h1>

                <div className={cn('max-w-md rounded-lg border bg-card p-4')}>
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

                        {wallet_points > 0 && (
                            <div className="flex items-center gap-2 border-t pt-3">
                                <Checkbox
                                    id="use-points"
                                    checked={usePoints}
                                    onCheckedChange={(checked) =>
                                        setUsePoints(checked === true)
                                    }
                                />
                                <label
                                    htmlFor="use-points"
                                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Usar puntos ({wallet_points} pts disponibles, 100 pts = 1€)
                                </label>
                            </div>
                        )}

                        {usePoints && maxPointsToUse > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                <dt>Descuento por puntos</dt>
                                <dd className="font-medium tabular-nums">
                                    -{formatCurrency(pointsDiscountEur)} (-{maxPointsToUse} pts)
                                </dd>
                            </div>
                        )}

                        <div className="flex justify-between border-t pt-2 text-base">
                            <dt className="font-semibold">Total</dt>
                            <dd className="font-semibold tabular-nums">
                                {formatCurrency(finalTotal)}
                            </dd>
                        </div>
                    </dl>
                </div>

                <Button asChild>
                    <Link href="/cart">Continuar al pago</Link>
                </Button>
            </div>
        </AppLayout>
    );
}
