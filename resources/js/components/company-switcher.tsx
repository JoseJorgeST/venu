import { ChevronsUpDown, Building2, Check, Store } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useTenant } from '@/hooks/use-tenant';

export function CompanySwitcher() {
    const { isMobile } = useSidebar();
    const { companies, currentCompany, currentBranch, switchCompany, hasMultipleCompanies } = useTenant();

    if (!currentCompany) {
        return null;
    }

    const displayName = currentBranch ? currentBranch.name : currentCompany.name;
    const displayLabel = currentBranch ? `Sucursal · ${currentCompany.name}` : 'Empresa';
    const DisplayIcon = currentBranch ? Store : Building2;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                {!currentBranch && currentCompany.logo_url ? (
                                    <img
                                        src={currentCompany.logo_url}
                                        alt={currentCompany.name}
                                        className="size-6 rounded"
                                    />
                                ) : (
                                    <DisplayIcon className="size-4" />
                                )}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{displayName}</span>
                                <span className="truncate text-xs text-muted-foreground">{displayLabel}</span>
                            </div>
                            {hasMultipleCompanies() && (
                                <ChevronsUpDown className="ml-auto size-4" />
                            )}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    {hasMultipleCompanies() && (
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            align="start"
                            side={isMobile ? 'bottom' : 'right'}
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Cambiar empresa
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {companies.map((company) => (
                                <DropdownMenuItem
                                    key={company.id}
                                    onClick={() => switchCompany(company.id)}
                                    className="gap-2 p-2"
                                >
                                    <div className="flex size-6 items-center justify-center rounded-sm border">
                                        {company.logo_url ? (
                                            <img
                                                src={company.logo_url}
                                                alt={company.name}
                                                className="size-4 rounded-sm"
                                            />
                                        ) : (
                                            <Building2 className="size-3" />
                                        )}
                                    </div>
                                    <span className="flex-1">{company.name}</span>
                                    {company.id === currentCompany.id && (
                                        <Check className="size-4" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    )}
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
