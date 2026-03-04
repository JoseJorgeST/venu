export type User = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    wallet_points: number;
    current_company_id?: number | null;
    current_branch_id?: number | null;
    roles: string[];
    permissions: string[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

export type Role = 'super_admin' | 'admin' | 'customer';

export type CompanyRole = 'owner' | 'manager' | 'staff';
