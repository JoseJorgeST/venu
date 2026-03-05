import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';

export type RestaurantInfo = {
    id: number;
    name: string;
    slug: string;
};

export type MenuItemDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    menuItemId: number;
    name: string;
    description: string | null;
    price: string | number;
    image_url: string | null;
    restaurant: RestaurantInfo;
    onAddToCart?: (quantity: number) => void;
};

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

export function MenuItemDialog({
    open,
    onOpenChange,
    menuItemId,
    name,
    description,
    price,
    image_url,
    restaurant,
    onAddToCart,
}: MenuItemDialogProps) {
    const [quantity, setQuantity] = useState(MIN_QUANTITY);
    const { addItem } = useCart();

    const priceNum = typeof price === 'string' ? Number(price) : price;
    const formattedPrice =
        !Number.isNaN(priceNum) ? priceNum.toFixed(2) : String(price);
    const subtotal = !Number.isNaN(priceNum) ? (priceNum * quantity).toFixed(2) : '0.00';

    const handleOpenChange = (next: boolean) => {
        if (!next) setQuantity(MIN_QUANTITY);
        onOpenChange(next);
    };

    const handleAdd = () => {
        if (priceNum != null && !Number.isNaN(priceNum)) {
            addItem(
                { menuItemId, name, price: priceNum, image_url },
                quantity,
                restaurant
            );
        }
        onAddToCart?.(quantity);
        handleOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md overflow-hidden p-0 sm:max-w-lg">
                {/* Imagen grande */}
                {image_url ? (
                    <img
                        src={image_url}
                        alt={name}
                        className="h-48 w-full object-cover sm:h-56"
                    />
                ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-muted text-muted-foreground text-sm sm:h-56">
                        Sin imagen
                    </div>
                )}

                <div className="flex flex-col gap-4 p-6 pt-4">
                    <DialogHeader className="p-0">
                        <DialogTitle>{name}</DialogTitle>
                        <p className="text-lg font-semibold tabular-nums">
                            {formattedPrice} €
                        </p>
                        {description && (
                            <DialogDescription className="mt-2 text-left">
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    {/* Selector de cantidad */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                            Cantidad
                        </span>
                        <div className="flex items-center gap-1 rounded-lg border">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-r-none"
                                onClick={() =>
                                    setQuantity((q) =>
                                        Math.max(MIN_QUANTITY, q - 1)
                                    )
                                }
                                disabled={quantity <= MIN_QUANTITY}
                                aria-label="Reducir cantidad"
                            >
                                <Minus className="size-4" />
                            </Button>
                            <span
                                className="min-w-8 text-center font-medium tabular-nums"
                                aria-live="polite"
                            >
                                {quantity}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-l-none"
                                onClick={() =>
                                    setQuantity((q) =>
                                        Math.min(MAX_QUANTITY, q + 1)
                                    )
                                }
                                disabled={quantity >= MAX_QUANTITY}
                                aria-label="Aumentar cantidad"
                            >
                                <Plus className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="flex-row justify-between gap-2 border-t pt-4 sm:justify-end">
                        <p className="text-sm text-muted-foreground">
                            Total:{' '}
                            <span className="font-semibold text-foreground tabular-nums">
                                {subtotal} €
                            </span>
                        </p>
                        <Button onClick={handleAdd} className="gap-2">
                            <Plus className="size-4" />
                            Añadir al pedido
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
