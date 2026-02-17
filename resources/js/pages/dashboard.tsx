import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    CalendarCheck,
    ChevronRight,
    Coins,
    UtensilsCrossed,
} from 'lucide-react';
import { RestaurantCard } from '@/components/restaurant-card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

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

type Props = {
    restaurants?: Restaurant[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
};

const quickLinks = [
    {
        href: '/restaurants',
        label: 'Explorar restaurantes',
        description: 'Descubre y reserva',
        icon: UtensilsCrossed,
    },
    {
        href: '/reservations',
        label: 'Mis reservas',
        description: 'Gestiona tus reservas',
        icon: CalendarCheck,
    },
    {
        href: '/loyalty/wallet',
        label: 'Mis puntos',
        description: 'Wallet y historial',
        icon: Coins,
    },
];

export default function Dashboard({ restaurants = [] }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=outfit:400,500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            {/* Mismo fondo elegante que inicio y restaurantes */}
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

                <div className="relative z-10 flex flex-col gap-10 p-6 md:p-8 lg:p-10">
                    {/* Header */}
                    <motion.header
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                            Tu espacio
                        </p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-white/60">
                            Accede rápido a restaurantes, reservas y puntos.
                        </p>
                    </motion.header>

                    {/* Accesos rápidos */}
                    <motion.section
                        className="grid gap-4 sm:grid-cols-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {quickLinks.map(({ href, label, description, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-amber-500/30 hover:bg-white/10"
                            >
                                <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/20 transition group-hover:bg-amber-500/30">
                                    <Icon className="size-6 text-amber-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="block font-semibold text-white">{label}</span>
                                    <span className="block text-sm text-white/60">{description}</span>
                                </div>
                                <ChevronRight className="size-5 shrink-0 text-white/40 transition group-hover:text-amber-400" />
                            </Link>
                        ))}
                    </motion.section>

                    {/* Restaurantes destacados */}
                    <motion.section
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="flex-1"
                    >
                        <div className="mb-5 flex items-end justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                                    Descubre
                                </p>
                                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Restaurantes destacados
                                </h2>
                            </div>
                            <Link
                                href="/restaurants"
                                className="text-sm font-medium text-white/60 transition hover:text-amber-400"
                            >
                                Ver todos →
                            </Link>
                        </div>

                        {restaurants.length === 0 ? (
                            <motion.div
                                variants={item}
                                className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-16 text-center backdrop-blur-sm"
                            >
                                <UtensilsCrossed className="size-12 text-white/30" />
                                <p className="mt-4 text-white/60">Aún no hay restaurantes destacados.</p>
                                <Link
                                    href="/restaurants"
                                    className="mt-5 rounded-full bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
                                >
                                    Explorar restaurantes
                                </Link>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {restaurants.map((restaurant) => (
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
                                            className="h-full border border-white/10 bg-white/5 text-white backdrop-blur-sm transition hover:border-amber-500/30 hover:bg-white/10 [&_h2]:text-white [&_p]:text-white/70 [&_.text-muted-foreground]:text-white/70 [&_span]:text-white/70 [&_.bg-muted]:bg-white/10"
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
