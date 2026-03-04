import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export function useRole() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const hasRole = (role: string): boolean => {
        return user?.roles?.includes(role) ?? false;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        return roles.some((role) => hasRole(role));
    };

    const hasAllRoles = (roles: string[]): boolean => {
        return roles.every((role) => hasRole(role));
    };

    const hasPermission = (permission: string): boolean => {
        return user?.permissions?.includes(permission) ?? false;
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        return permissions.some((permission) => hasPermission(permission));
    };

    const isSuperAdmin = (): boolean => hasRole('super_admin');
    const isAdmin = (): boolean => hasRole('admin');
    const isCustomer = (): boolean => hasRole('customer');

    const canAccessAdmin = (): boolean => isSuperAdmin();
    const canAccessCompany = (): boolean => isSuperAdmin() || isAdmin();

    return {
        user,
        roles: user?.roles ?? [],
        permissions: user?.permissions ?? [],
        hasRole,
        hasAnyRole,
        hasAllRoles,
        hasPermission,
        hasAnyPermission,
        isSuperAdmin,
        isAdmin,
        isCustomer,
        canAccessAdmin,
        canAccessCompany,
    };
}
