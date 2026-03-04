import { usePage, router } from '@inertiajs/react';
import type { SharedData, TenantContext, CompanySummary, BranchSummary } from '@/types';

export function useTenant() {
    const { tenant } = usePage<SharedData>().props;

    const context: TenantContext = tenant ?? {
        companies: [],
        branches: [],
        currentCompany: null,
        currentBranch: null,
    };

    const switchCompany = (companyId: number) => {
        router.post('/context/company', { company_id: companyId }, {
            preserveScroll: true,
        });
    };

    const switchBranch = (branchId: number) => {
        router.post('/context/branch', { branch_id: branchId }, {
            preserveScroll: true,
        });
    };

    const hasMultipleCompanies = (): boolean => {
        return context.companies.length > 1;
    };

    const hasMultipleBranches = (): boolean => {
        return context.branches.length > 1;
    };

    const getCurrentCompanyName = (): string => {
        return context.currentCompany?.name ?? 'Sin empresa';
    };

    const getCurrentBranchName = (): string => {
        return context.currentBranch?.name ?? 'Sin sucursal';
    };

    return {
        ...context,
        switchCompany,
        switchBranch,
        hasMultipleCompanies,
        hasMultipleBranches,
        getCurrentCompanyName,
        getCurrentBranchName,
    };
}
