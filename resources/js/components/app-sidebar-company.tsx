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
    BarChart3,
    Settings,
    CalendarDays,
    Package,
    MapPin,
} from 'lucide-react';

export function AppSidebarCompany({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth, tenant } = usePage<SharedData>().props;
    const { hasMultipleBranches } = useTenant();

    const currentBranch = tenant?.currentBranch;

    const branchNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/company',
            icon: LayoutDashboard,
        },
        {
            title: 'Menú / Productos',
            href: '/company/menu',
            icon: Package,
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
        {
            title: 'Configuración',
            href: '/company/settings',
            icon: Settings,
        },
    ];

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
            title: 'Menú / Productos',
            href: '/company/menu',
            icon: Package,
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
        {
            title: 'Configuración',
            href: '/company/settings',
            icon: Settings,
        },
        {
            title: 'Ubicaciones',
            href: '/company/settings/locations',
            icon: MapPin,
        },
    ];

    const navItems = currentBranch ? branchNavItems : companyNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset" {...props}>
            <SidebarHeader>
                <CompanySwitcher />
            </SidebarHeader>

            <SidebarContent>
                {hasMultipleBranches() && !currentBranch && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Sucursal Activa</SidebarGroupLabel>
                        <div className="px-2">
                            <BranchSwitcher />
                        </div>
                    </SidebarGroup>
                )}
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                {auth.user && <NavUser user={auth.user} />}
            </SidebarFooter>
        </Sidebar>
    );
}
