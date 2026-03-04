import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarAdmin } from '@/components/app-sidebar-admin';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';

interface AdminLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AdminLayout({ children, breadcrumbs = [] }: AdminLayoutProps) {
    const { sidebarOpen } = usePage<{ sidebarOpen: boolean }>().props;

    return (
        <SidebarProvider defaultOpen={sidebarOpen}>
            <AppSidebarAdmin />
            <SidebarInset>
                <AppShell variant="admin">
                    <AppContent variant="admin" breadcrumbs={breadcrumbs}>
                        {children}
                    </AppContent>
                </AppShell>
            </SidebarInset>
        </SidebarProvider>
    );
}
