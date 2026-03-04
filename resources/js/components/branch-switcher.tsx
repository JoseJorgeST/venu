import { ChevronsUpDown, Store, Check, Star } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/hooks/use-tenant';

export function BranchSwitcher() {
    const { branches, currentBranch, switchBranch, hasMultipleBranches } = useTenant();

    if (!currentBranch || !hasMultipleBranches()) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                        <Store className="size-4" />
                        <span className="truncate">{currentBranch.name}</span>
                        {currentBranch.is_main && (
                            <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        )}
                    </div>
                    <ChevronsUpDown className="size-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Cambiar sucursal
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {branches.map((branch) => (
                    <DropdownMenuItem
                        key={branch.id}
                        onClick={() => switchBranch(branch.id)}
                        className="gap-2"
                    >
                        <Store className="size-4" />
                        <span className="flex-1">{branch.name}</span>
                        {branch.is_main && (
                            <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        )}
                        {branch.id === currentBranch.id && (
                            <Check className="size-4" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
