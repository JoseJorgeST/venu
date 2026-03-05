import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
import { MenuItemDialog } from '@/components/menu-item-dialog';
import { cn } from '@/lib/utils';

export type RestaurantInfo = {
    id: number;
    name: string;
    slug: string;
};

export type MenuItemCardProps = {
    menuItemId: number;
    name: string;
    description: string | null;
    price: string | number;
    image_url: string | null;
    restaurant: RestaurantInfo;
    onAdd?: () => void;
    onAddToCart?: (quantity: number) => void;
    disabled?: boolean;
    className?: string;
};

export function MenuItemCard({
    menuItemId,
    name,
    description,
    price,
    image_url,
    restaurant,
    onAdd,
    onAddToCart,
    disabled = false,
    className,
}: MenuItemCardProps) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const priceNum = typeof price === 'string' ? Number(price) : price;
    const formattedPrice =
        !Number.isNaN(priceNum) ? priceNum.toFixed(2) : String(price);

    const handleAddClick = () => {
        setDialogOpen(true);
    };

    const handleAddToCart = (quantity: number) => {
        onAddToCart?.(quantity);
        if (quantity === 1) onAdd?.();
    };

    return (
        <>
            <Card className={cn('overflow-hidden', className)}>
                <div className="flex gap-4 p-4">
                    {image_url ? (
                        <img
                            src={image_url}
                            alt={name}
                            loading="lazy"
                            className="h-24 w-24 shrink-0 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs">
                            Sin imagen
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <CardHeader className="p-0 pb-1">
                            <p className="font-semibold leading-tight">{name}</p>
                            {description && (
                                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-2 p-0 pt-2">
                            <span className="font-medium tabular-nums">
                                {formattedPrice} €
                            </span>
                            <motion.button
                                type="button"
                                className={cn(
                                    buttonVariants({ size: 'icon', variant: 'default' }),
                                    'size-8 shrink-0'
                                )}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleAddClick}
                                disabled={disabled}
                                aria-label={`Añadir ${name}`}
                            >
                                <Plus className="size-4" />
                            </motion.button>
                        </CardContent>
                    </div>
                </div>
            </Card>

            <MenuItemDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                menuItemId={menuItemId}
                name={name}
                description={description}
                price={price}
                image_url={image_url}
                restaurant={restaurant}
                onAddToCart={handleAddToCart}
            />
        </>
    );
}
