import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    CalendarCheck,
    ChevronRight,
    Coins,
    MapPin,
    ShoppingBag,
    UtensilsCrossed,
} from 'lucide-react';
import { RestaurantCard } from '@/components/restaurant-card';
import { Button, buttonVariants } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

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

type WelcomeProps = {
    canRegister?: boolean;
    restaurants?: Restaurant[];
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
};

const pointsSteps = [
    {
        step: '01',
        icon: ShoppingBag,
        title: 'Gana puntos',
        text: '1€ gastado = 1 punto en cada pedido completado. Más pedidos, más puntos.',
    },
    {
        step: '02',
        icon: Coins,
        title: 'Tu wallet',
        text: 'Saldo y historial siempre disponibles en tu cuenta.',
    },
    {
        step: '03',
        icon: CalendarCheck,
        title: 'Canjea',
        text: '100 pts = 1€. Descuenta en checkout cuando quieras.',
    },
];

export default function Welcome({
    canRegister = true,
    restaurants = [],
}: WelcomeProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Bevenut — Reserva y pide">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=outfit:400,500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-[#0a0a0a] font-['Outfit',sans-serif] text-white">
                {/* Mesh gradient background */}
                <div className="pointer-events-none fixed inset-0" aria-hidden>
                    <div
                        className="absolute -left-1/4 top-0 h-[80vmin] w-[80vmin] rounded-full opacity-40"
                        style={{
                            background: 'radial-gradient(circle, rgba(212,160,23,0.35) 0%, transparent 70%)',
                            filter: 'blur(80px)',
                        }}
                    />
                    <div
                        className="absolute right-0 top-1/4 h-[60vmin] w-[60vmin] rounded-full opacity-30"
                        style={{
                            background: 'radial-gradient(circle, rgba(201,162,39,0.4) 0%, transparent 70%)',
                            filter: 'blur(60px)',
                        }}
                    />
                    <div
                        className="absolute bottom-1/4 left-1/3 h-[50vmin] w-[50vmin] rounded-full opacity-20"
                        style={{
                            background: 'radial-gradient(circle, rgba(184,134,11,0.35) 0%, transparent 70%)',
                            filter: 'blur(70px)',
                        }}
                    />
                    {/* Grid overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                            backgroundSize: '64px 64px',
                        }}
                    />
                </div>

                {/* Header */}
                <header className="relative z-20 flex w-full items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
                    <Link
                        href="/"
                        className="text-xl font-bold tracking-tight text-white"
                    >
                        Bevenut
                    </Link>
                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className={cn(
                                    buttonVariants({ variant: 'default', size: 'sm' }),
                                    'rounded-full bg-white px-5 font-semibold text-[#0a0a0a] hover:bg-white/90'
                                )}
                            >
                                Mi cuenta
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-full px-5 py-2 text-sm font-medium text-white/80 transition hover:text-white"
                                >
                                    Iniciar sesión
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0a0a0a] transition hover:bg-white/90"
                                    >
                                        Registrarse
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <main className="relative z-10 flex flex-1 flex-col px-4 pb-12 sm:px-6 lg:px-10">
                    <div className="mx-auto w-full max-w-6xl">
                        {/* Hero */}
                        <motion.section
                            className="relative flex flex-col items-center gap-12 pt-8 pb-20 sm:pt-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:pb-28"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="max-w-2xl text-center lg:text-left">
                                <motion.p
                                    className="mb-4 inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Tu mesa, a un toque
                                </motion.p>
                                <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                                    <span className="block text-white">Reserva mesa.</span>
                                    <span
                                        className="mt-1 block bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent"
                                        style={{ backgroundSize: '200% auto' }}
                                    >
                                        Pide a domicilio.
                                    </span>
                                    <span className="mt-1 block text-white">Disfruta.</span>
                                </h1>
                                <p className="mt-6 max-w-md text-base leading-relaxed text-white/60 lg:mx-0">
                                    Descubre restaurantes, reserva en segundos y acumula puntos en cada pedido.
                                </p>
                                <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Link
                                            href="/restaurants"
                                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_-8px_rgba(245,158,11,0.6)] transition hover:shadow-[0_0_50px_-8px_rgba(245,158,11,0.7)]"
                                        >
                                            Explorar restaurantes
                                            <ChevronRight className="size-5" />
                                        </Link>
                                    </motion.div>
                                    <Link
                                        href="/restaurants"
                                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-4 text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/10 hover:border-white/30"
                                    >
                                        <MapPin className="size-5 text-amber-400" />
                                        Ver en mapa
                                    </Link>
                                </div>
                            </div>
                            <motion.figure
                                className="relative flex-shrink-0"
                                initial={{ opacity: 0, scale: 0.95, rotateY: -8 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50">
                                    <div
                                        className="absolute -inset-px rounded-3xl opacity-60"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(245,158,11,0.4), transparent 40%, transparent 60%, rgba(245,158,11,0.2))',
                                        }}
                                    />
                                    <img
                                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=90"
                                        alt="Ambiente de restaurante"
                                        className="relative aspect-[4/3] w-full max-w-lg object-cover"
                                        width={900}
                                        height={600}
                                        fetchPriority="high"
                                    />
                                </div>
                            </motion.figure>
                        </motion.section>

                        {/* Destacados */}
                        <motion.section
                            className="py-16"
                            variants={container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: '-80px' }}
                        >
                            <div className="mb-8 flex items-end justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                                        Descubre
                                    </p>
                                    <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                                        Destacados
                                    </h2>
                                </div>
                                {restaurants.length > 0 && (
                                    <Link
                                        href="/restaurants"
                                        className="text-sm font-medium text-white/60 transition hover:text-amber-400"
                                    >
                                        Ver todos →
                                    </Link>
                                )}
                            </div>

                            {restaurants.length === 0 ? (
                                <motion.div
                                    variants={item}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm"
                                >
                                    <p className="text-white/60">No hay restaurantes destacados aún.</p>
                                    <Link
                                        href="/restaurants"
                                        className="mt-6 inline-flex rounded-full bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600"
                                    >
                                        Explorar restaurantes
                                    </Link>
                                </motion.div>
                            ) : (
                                <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
                                    {restaurants.map((restaurant) => (
                                        <motion.div
                                            key={restaurant.id}
                                            variants={item}
                                            className="min-w-[300px] snap-start sm:min-w-0"
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

                        {/* Qué es Bevenut - full width statement */}
                        <motion.section
                            className="py-20"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-10 backdrop-blur-sm sm:p-14 lg:p-20">
                                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                                    Sobre nosotros
                                </p>
                                <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                                    Una sola app para{' '}
                                    <span className="text-amber-400">reservar</span>,{' '}
                                    <span className="text-amber-400">pedir</span> y{' '}
                                    <span className="text-amber-400">disfrutar</span>.
                                </h2>
                                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
                                    Bevenut reúne restaurantes, reservas y pedidos a domicilio. Explora cartas,
                                    acumula puntos en cada compra y canjéalos por descuentos. Todo en un solo lugar.
                                </p>
                            </div>
                        </motion.section>

                        {/* Cómo funcionan los puntos */}
                        <motion.section
                            className="py-20"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                                Programa de puntos
                            </p>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                                Cómo funcionan los puntos
                            </h2>
                            <div className="mt-12 grid gap-6 sm:grid-cols-3">
                                {pointsSteps.map(({ step, icon: Icon, title, text }, i) => (
                                    <motion.div
                                        key={step}
                                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:border-amber-500/30 hover:bg-white/10"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -2 }}
                                    >
                                        <div
                                            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 transition group-hover:opacity-100"
                                            aria-hidden
                                        />
                                        <span className="text-4xl font-extrabold text-amber-500/30">
                                            {step}
                                        </span>
                                        <div className="mt-6 flex size-14 items-center justify-center rounded-2xl bg-amber-500/20">
                                            <Icon className="size-7 text-amber-400" />
                                        </div>
                                        <h3 className="mt-6 text-xl font-bold text-white">{title}</h3>
                                        <p className="mt-3 text-sm leading-relaxed text-white/60">
                                            {text}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                            {auth.user && (
                                <p className="mt-8">
                                    <Link
                                        href="/loyalty/wallet"
                                        className="inline-flex items-center gap-2 font-semibold text-amber-400 transition hover:text-amber-300"
                                    >
                                        Ver mi wallet de puntos
                                        <ChevronRight className="size-4" />
                                    </Link>
                                </p>
                            )}
                        </motion.section>
                    </div>
                </main>

                {/* Footer - dark with gradient top */}
                <footer className="relative z-10 border-t border-white/10 bg-black/50 px-4 py-16 backdrop-blur-sm sm:px-6 lg:px-10">
                    <div
                        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
                        aria-hidden
                    />
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="lg:col-span-2">
                                <Link href="/" className="text-2xl font-bold text-white">
                                    Bevenut
                                </Link>
                                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
                                    Reserva mesa, pide a domicilio y acumula puntos. Todo en una app.
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                                    Navegación
                                </p>
                                <nav className="mt-4 flex flex-col gap-3 text-sm">
                                    <Link href="/restaurants" className="text-white/70 transition hover:text-amber-400">
                                        Restaurantes
                                    </Link>
                                    <Link href="/dashboard" className="text-white/70 transition hover:text-amber-400">
                                        Dashboard
                                    </Link>
                                    {auth.user && (
                                        <>
                                            <Link href="/reservations" className="text-white/70 transition hover:text-amber-400">
                                                Mis reservas
                                            </Link>
                                            <Link href="/loyalty/wallet" className="text-white/70 transition hover:text-amber-400">
                                                Puntos
                                            </Link>
                                        </>
                                    )}
                                </nav>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                                    Legal
                                </p>
                                <p className="mt-4 text-sm text-white/50">
                                    © {new Date().getFullYear()} Bevenut
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
