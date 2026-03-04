import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarCompany } from '@/components/app-sidebar-company';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';

interface CompanyLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function CompanyLayout({ children, breadcrumbs = [] }: CompanyLayoutProps) {
    const { sidebarOpen } = usePage<{ sidebarOpen: boolean }>().props;

    return (
        <SidebarProvider defaultOpen={sidebarOpen}>
            <AppSidebarCompany />
            <SidebarInset>
                <AppShell variant="company">
                    <AppContent variant="company" breadcrumbs={breadcrumbs}>
                        {children}
                    </AppContent>
                </AppShell>
            </SidebarInset>
        </SidebarProvider>
    );
}
