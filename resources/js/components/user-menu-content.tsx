import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings, Store, Check, Building2 } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User, SharedData } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { tenant } = usePage<SharedData>().props;

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const handleSwitchBranch = (branchId: number | null) => {
        cleanup();
        // Limpiar toda la caché de Inertia antes de cambiar de contexto
        router.flushAll();
        router.post('/context/branch', { branch_id: branchId }, {
            preserveState: false,
            preserveScroll: false,
        });
    };

    const isAdmin = user.roles?.includes('admin');
    const currentBranch = tenant?.currentBranch;
    const currentCompany = tenant?.currentCompany;
    const branches = tenant?.branches || [];
    const hasBranches = branches.length > 0;

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>

            {isAdmin && currentCompany && hasBranches && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Store className="mr-2 h-4 w-4" />
                                <span>{currentBranch ? 'Cambiar' : 'Sucursales'}</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="min-w-[220px]">
                                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                                    Empresa
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => handleSwitchBranch(null)}
                                    className="cursor-pointer"
                                >
                                    <Building2 className="mr-2 h-4 w-4" />
                                    <span className="flex-1">{currentCompany.name} (Principal)</span>
                                    {!currentBranch && (
                                        <Check className="ml-2 h-4 w-4 text-primary" />
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                                    Sucursales
                                </DropdownMenuLabel>
                                {branches.map((branch) => (
                                    <DropdownMenuItem
                                        key={branch.id}
                                        onClick={() => handleSwitchBranch(branch.id)}
                                        className="cursor-pointer"
                                    >
                                        <Store className="mr-2 h-4 w-4" />
                                        <span className="flex-1">{branch.name}</span>
                                        {currentBranch?.id === branch.id && (
                                            <Check className="ml-2 h-4 w-4 text-primary" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
