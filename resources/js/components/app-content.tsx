import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import type { BreadcrumbItem } from '@/types';
import { Breadcrumbs } from '@/components/breadcrumbs';

type Props = React.ComponentProps<'main'> & {
    variant?: 'header' | 'sidebar' | 'admin' | 'company';
    breadcrumbs?: BreadcrumbItem[];
};

export function AppContent({ variant = 'header', breadcrumbs, children, ...props }: Props) {
    if (variant === 'sidebar') {
        return <SidebarInset {...props}>{children}</SidebarInset>;
    }

    if (variant === 'admin' || variant === 'company') {
        return (
            <main className="flex-1 p-6" {...props}>
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="mb-6">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                )}
                {children}
            </main>
        );
    }

    return (
        <main
            className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl"
            {...props}
        >
            {children}
        </main>
    );
}
