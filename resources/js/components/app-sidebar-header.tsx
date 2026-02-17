import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCart } from '@/contexts/cart-context';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { itemCount } = useCart();

    return (
        <header className="venu-header-dark relative z-30 flex h-16 shrink-0 items-center gap-2 border-b border-white/10 bg-black px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <Link
                href="/cart"
                className="relative flex items-center justify-center rounded-md p-2 text-white/70 transition hover:bg-white/10 hover:text-amber-400"
                aria-label="Ver carrito"
            >
                <ShoppingCart className="size-5" />
                {itemCount > 0 && (
                    <Badge
                        variant="default"
                        className="absolute -right-1 -top-1 size-5 min-w-0 justify-center rounded-full border-0 bg-amber-500 px-0 py-0 text-xs text-black"
                    >
                        {itemCount > 99 ? '99+' : itemCount}
                    </Badge>
                )}
            </Link>
        </header>
    );
}
