export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './tenant';

import type { Auth } from './auth';
import type { TenantContext } from './tenant';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    tenant: TenantContext | null;
    flash: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
};
