import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type RestaurantCardProps = {
    name: string;
    slug: string;
    category: string;
    image_url: string | null;
    rating: string | number | null;
    is_active: boolean;
    className?: string;
};

const MAX_STARS = 5;

function RatingStars({ rating }: { rating: number }) {
    const filled = Math.min(MAX_STARS, Math.max(0, Math.round(rating)));

    return (
        <span className="flex items-center gap-0.5" aria-label={`Valoración: ${rating} de ${MAX_STARS}`}>
            {Array.from({ length: MAX_STARS }, (_, i) => (
                <Star
                    key={i}
                    className={cn(
                        'size-4',
                        i < filled ? 'fill-[#d4a017] text-[#d4a017]' : 'text-muted-foreground/50'
                    )}
                    aria-hidden
                />
            ))}
        </span>
    );
}

export function RestaurantCard({
    name,
    slug,
    category,
    image_url,
    rating,
    is_active,
    className,
}: RestaurantCardProps) {
    const ratingNum = rating != null ? Number(rating) : null;
    const href = `/restaurants/${slug}`;

    return (
        <Link href={href} className="block transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-xl">
            <Card className={cn('overflow-hidden h-full', className)}>
                <div className="relative">
                    {image_url ? (
                        <img
                            src={image_url}
                            alt={name}
                            loading="lazy"
                            className="h-40 w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-40 w-full items-center justify-center bg-muted text-muted-foreground text-sm">
                            Sin imagen
                        </div>
                    )}
                    <Badge
                        variant={is_active ? 'default' : 'secondary'}
                        className="absolute right-2 top-2"
                    >
                        {is_active ? 'Disponible' : 'No disponible'}
                    </Badge>
                </div>
                <CardHeader className="pb-1 pt-3">
                    <h2 className="font-semibold leading-tight">{name}</h2>
                    <p className="text-sm text-muted-foreground">{category}</p>
                </CardHeader>
                <CardContent className="flex items-center gap-2 pt-0">
                    {ratingNum != null && !Number.isNaN(ratingNum) ? (
                        <>
                            <RatingStars rating={ratingNum} />
                            <span className="text-sm text-muted-foreground">
                                {ratingNum.toFixed(1)}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-muted-foreground">Sin valoración</span>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
