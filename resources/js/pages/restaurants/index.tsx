import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Search, UtensilsCrossed } from 'lucide-react';
import { RestaurantCard } from '@/components/restaurant-card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

export type Restaurant = {
    id: number;
    name: string;
    slug: string;
    category: string;
    image_url: string | null;
    description: string | null;
    rating: string | null;
    latitude: string | null;
    longitude: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

type Props = {
    restaurants?: Restaurant[];
};

const SKELETON_COUNT = 6;

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Restaurantes', href: '/restaurants' },
];

export default function RestaurantsIndex({ restaurants }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const list = restaurants ?? [];

    const categories = useMemo(() => {
        const set = new Set(list.map((r) => r.category).filter(Boolean));
        return Array.from(set).sort();
    }, [list]);

    const filteredRestaurants = useMemo(() => {
        return list.filter((restaurant) => {
            const matchesSearch = restaurant.name
                .toLowerCase()
                .includes(searchQuery.trim().toLowerCase());
            const matchesCategory =
                selectedCategory == null ||
                selectedCategory === '' ||
                restaurant.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [list, searchQuery, selectedCategory]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Restaurantes">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=outfit:400,500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            {/* Fondo elegante igual que inicio */}
            <div className="relative -mx-4 min-h-[calc(100vh-8rem)] flex-1 overflow-hidden rounded-xl bg-[#0a0a0a] font-['Outfit',sans-serif] md:-mx-6 lg:-mx-8">
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                    <div
                        className="absolute -left-1/4 top-0 h-[70vmin] w-[70vmin] rounded-full opacity-30"
                        style={{
                            background: 'radial-gradient(circle, rgba(212,160,23,0.35) 0%, transparent 70%)',
                            filter: 'blur(80px)',
                        }}
                    />
                    <div
                        className="absolute right-0 top-1/3 h-[50vmin] w-[50vmin] rounded-full opacity-25"
                        style={{
                            background: 'radial-gradient(circle, rgba(201,162,39,0.4) 0%, transparent 70%)',
                            filter: 'blur(60px)',
                        }}
                    />
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                            backgroundSize: '64px 64px',
                        }}
                    />
                </div>

                <div className="relative z-10 flex flex-col gap-8 p-6 md:p-8 lg:p-10">
                    {/* Header de la página */}
                    <motion.header
                        className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                                Descubre
                            </p>
                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Restaurantes
                            </h1>
                            <p className="mt-2 text-sm text-white/60">
                                {list.length} restaurante{list.length !== 1 ? 's' : ''} disponibles
                            </p>
                        </div>
                    </motion.header>

                    {/* Buscador y filtros */}
                    <motion.div
                        className="flex flex-col gap-4"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/40" />
                            <input
                                type="search"
                                placeholder="Buscar por nombre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4',
                                    'text-white placeholder:text-white/40',
                                    'focus:border-amber-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/30',
                                    'transition'
                                )}
                                aria-label="Buscar restaurantes por nombre"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory(null)}
                                className={cn(
                                    'rounded-full px-4 py-2 text-sm font-medium transition',
                                    selectedCategory === null
                                        ? 'bg-amber-500 text-black'
                                        : 'border border-white/20 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white'
                                )}
                            >
                                Todas
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() =>
                                        setSelectedCategory(selectedCategory === category ? null : category)
                                    }
                                    className={cn(
                                        'rounded-full px-4 py-2 text-sm font-medium transition',
                                        selectedCategory === category
                                            ? 'bg-amber-500 text-black'
                                            : 'border border-white/20 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white'
                                    )}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Grid de restaurantes */}
                    <motion.section
                        className="flex-1"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {restaurants === undefined ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                                    <div
                                        key={i}
                                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                                    >
                                        <div className="h-44 animate-pulse bg-white/10" />
                                        <div className="space-y-3 p-4">
                                            <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
                                            <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredRestaurants.length === 0 ? (
                            <motion.div
                                variants={item}
                                className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-20 text-center backdrop-blur-sm"
                            >
                                <UtensilsCrossed className="size-12 text-white/30" />
                                <p className="mt-4 text-white/70">
                                    {list.length === 0
                                        ? 'Aún no hay restaurantes.'
                                        : 'Ningún restaurante coincide con los filtros.'}
                                </p>
                                {list.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory(null);
                                        }}
                                        className="mt-4 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredRestaurants.map((restaurant) => (
                                    <motion.div
                                        key={restaurant.id}
                                        variants={item}
                                        whileHover={{ y: -4 }}
                                    >
                                        <RestaurantCard
                                            name={restaurant.name}
                                            slug={restaurant.slug}
                                            category={restaurant.category}
                                            image_url={restaurant.image_url}
                                            rating={restaurant.rating}
                                            is_active={restaurant.is_active}
                                            className={cn(
                                                'h-full border border-white/10 bg-white/5 text-white backdrop-blur-sm',
                                                'transition hover:border-amber-500/30 hover:bg-white/10',
                                                '[&_h2]:text-white [&_p]:text-white/70 [&_.text-muted-foreground]:text-white/70 [&_span]:text-white/70 [&_.bg-muted]:bg-white/10'
                                            )}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.section>
                </div>
            </div>
        </AppLayout>
    );
}
