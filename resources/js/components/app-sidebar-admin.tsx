import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePage, Link } from '@inertiajs/react';
import type { SharedData, NavItem } from '@/types';
import {
    LayoutDashboard,
    Building2,
    Users,
    BarChart3,
    Settings,
    ShieldCheck,
} from 'lucide-react';

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Empresas',
        href: '/admin/companies',
        icon: Building2,
    },
    {
        title: 'Usuarios',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Reportes',
        href: '/admin/reports',
        icon: BarChart3,
    },
];

export function AppSidebarAdmin({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<SharedData>().props;

    return (
        <Sidebar collapsible="icon" variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-600 text-white">
                                    <ShieldCheck className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Super Admin</span>
                                    <span className="truncate text-xs text-muted-foreground">Panel de Control</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={adminNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {auth.user && <NavUser user={auth.user} />}
            </SidebarFooter>
        </Sidebar>
    );
}
