import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { CompanySwitcher } from '@/components/company-switcher';
import { BranchSwitcher } from '@/components/branch-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import type { SharedData, NavItem } from '@/types';
import { useTenant } from '@/hooks/use-tenant';
import {
    LayoutDashboard,
    Store,
    ShoppingCart,
    UtensilsCrossed,
    BarChart3,
    Settings,
    CalendarDays,
} from 'lucide-react';

const companyNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/company',
        icon: LayoutDashboard,
    },
    {
        title: 'Sucursales',
        href: '/company/branches',
        icon: Store,
    },
    {
        title: 'Pedidos',
        href: '/company/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Reservaciones',
        href: '/company/reservations',
        icon: CalendarDays,
    },
    {
        title: 'Reportes',
        href: '/company/reports',
        icon: BarChart3,
    },
];

export function AppSidebarCompany({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<SharedData>().props;
    const { hasMultipleBranches } = useTenant();

    return (
        <Sidebar collapsible="icon" variant="inset" {...props}>
            <SidebarHeader>
                <CompanySwitcher />
            </SidebarHeader>

            <SidebarContent>
                {hasMultipleBranches() && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Sucursal Activa</SidebarGroupLabel>
                        <div className="px-2">
                            <BranchSwitcher />
                        </div>
                    </SidebarGroup>
                )}
                <NavMain items={companyNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {auth.user && <NavUser user={auth.user} />}
            </SidebarFooter>
        </Sidebar>
    );
}
