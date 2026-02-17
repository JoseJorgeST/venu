import { Link } from '@inertiajs/react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';

const COMMISSION_RATE = 0.1;

export function CartFloatingBar() {
    const { itemCount, subtotal } = useCart();

    if (itemCount === 0) return null;

    const commission = subtotal * COMMISSION_RATE;
    const total = subtotal + commission;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-muted-foreground">
                        Total:{' '}
                        <span className="font-semibold text-foreground tabular-nums">
                            {total.toFixed(2)} €
                        </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                    </span>
                </div>
                <Button asChild size="lg">
                    <Link href="/cart">Ver carrito</Link>
                </Button>
            </div>
        </div>
    );
}
