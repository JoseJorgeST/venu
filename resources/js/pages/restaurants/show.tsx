import { Head, Link } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { MenuItemCard } from '@/components/menu-item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const MENU_TABS = [
    { value: 'entradas', label: 'Entradas' },
    { value: 'principales', label: 'Principales' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'postres', label: 'Postres' },
] as const;

const CATEGORY_TO_TAB: Record<string, (typeof MENU_TABS)[number]['value']> = {
    Entrantes: 'entradas',
    Ensaladas: 'entradas',
    'Platos principales': 'principales',
    Pizzas: 'principales',
    Hamburguesas: 'principales',
    Tacos: 'principales',
    Burritos: 'principales',
    Sushi: 'principales',
    Sashimi: 'principales',
    Ramen: 'principales',
    Bebidas: 'bebidas',
    Acompañamientos: 'principales',
    Postres: 'postres',
};

export type Restaurant = {
    id: number;
    name: string;
    slug: string;
    category: string;
    image_url: string | null;
    description: string | null;
    rating: string | null;
    is_active: boolean;
};

export type MenuItem = {
    id: number;
    name: string;
    description: string | null;
    price: string;
    image_url: string | null;
    category: string;
    is_available: boolean;
};

type MenuCategory = {
    category: string;
    items: MenuItem[];
};

type Props = {
    restaurant: Restaurant;
    menuItemsByCategory: MenuCategory[];
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
                        'size-5',
                        i < filled ? 'fill-[#d4a017] text-[#d4a017]' : 'text-white/50'
                    )}
                    aria-hidden
                />
            ))}
        </span>
    );
}

function getItemsByTab(
    menuItemsByCategory: MenuCategory[],
    tab: (typeof MENU_TABS)[number]['value']
): MenuItem[] {
    return menuItemsByCategory.flatMap(({ category, items }) =>
        (CATEGORY_TO_TAB[category] ?? 'principales') === tab ? items : []
    );
}

export default function RestaurantShow({ restaurant, menuItemsByCategory }: Props) {
    const ratingNum = restaurant.rating != null ? Number(restaurant.rating) : null;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Restaurantes', href: '/restaurants' },
        { title: restaurant.name, href: `/restaurants/${restaurant.slug}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={restaurant.name} />

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {/* Hero section */}
                <section className="relative min-h-[280px] w-full overflow-hidden rounded-xl bg-muted md:min-h-[340px]">
                    {restaurant.image_url ? (
                        <img
                            src={restaurant.image_url}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="eager"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-muted" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
                    <div className="relative flex min-h-[280px] flex-col justify-end p-6 md:min-h-[340px] md:p-8">
                        <div className="max-w-3xl">
                            <p className="mb-1 text-sm font-medium text-white/90">
                                {restaurant.category}
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                                {restaurant.name}
                            </h1>
                            {ratingNum != null && !Number.isNaN(ratingNum) && (
                                <div className="mt-2 flex items-center gap-2 text-white">
                                    <RatingStars rating={ratingNum} />
                                    <span className="text-sm font-medium">
                                        {ratingNum.toFixed(1)}
                                    </span>
                                </div>
                            )}
                            {restaurant.description && (
                                <p className="mt-3 line-clamp-2 text-base text-white/90 md:line-clamp-3">
                                    {restaurant.description}
                                </p>
                            )}
                            <Link
                                href={`/reservations/create?restaurant_id=${restaurant.id}`}
                                className={cn(buttonVariants({ size: 'lg' }), 'mt-6')}
                            >
                                Hacer reserva
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Menu by category - Tabs */}
                <div className="flex flex-1 flex-col gap-6 bg-background p-4 md:p-6">
                {menuItemsByCategory.length > 0 && (
                    <section>
                        <h2 className="mb-4 text-xl font-semibold">Menú</h2>
                        <Tabs defaultValue="entradas" className="w-full">
                            <TabsList className="w-full justify-start overflow-x-auto sm:inline-flex">
                                {MENU_TABS.map(({ value, label }) => (
                                    <TabsTrigger key={value} value={value}>
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {MENU_TABS.map(({ value, label }) => {
                                const items = getItemsByTab(menuItemsByCategory, value);
                                return (
                                    <TabsContent key={value} value={value} className="mt-4">
                                        {items.length > 0 ? (
                                            <ul className="grid gap-3 sm:grid-cols-2">
                                                {items.map((item) => (
                                                    <li key={item.id}>
                                                        <MenuItemCard
                                                            menuItemId={item.id}
                                                            name={item.name}
                                                            description={item.description}
                                                            price={item.price}
                                                            image_url={item.image_url}
                                                            disabled={!item.is_available}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="py-6 text-center text-sm text-muted-foreground">
                                                No hay platos en {label.toLowerCase()}.
                                            </p>
                                        )}
                                    </TabsContent>
                                );
                            })}
                        </Tabs>
                    </section>
                )}
                </div>
            </div>
        </AppLayout>
    );
}
