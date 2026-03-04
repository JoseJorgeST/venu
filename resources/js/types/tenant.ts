export type Company = {
    id: number;
    name: string;
    slug: string;
    owner_id: number;
    logo_url?: string | null;
    description?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    tax_id?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    owner?: {
        id: number;
        name: string;
        email: string;
    };
    branches?: Branch[];
    branches_count?: number;
    users_count?: number;
};

export type Branch = {
    id: number;
    company_id: number;
    restaurant_id?: number | null;
    name: string;
    code?: string | null;
    is_main: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    company?: Company;
    restaurant?: Restaurant;
};

export type Restaurant = {
    id: number;
    company_id?: number | null;
    name: string;
    slug: string;
    category?: string | null;
    image_url?: string | null;
    description?: string | null;
    rating?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type TenantContext = {
    companies: CompanySummary[];
    branches: BranchSummary[];
    currentCompany: CompanySummary | null;
    currentBranch: BranchSummary | null;
};

export type CompanySummary = {
    id: number;
    name: string;
    slug: string;
    logo_url?: string | null;
};

export type BranchSummary = {
    id: number;
    name: string;
    code?: string | null;
    is_main: boolean;
};

export type MenuItem = {
    id: number;
    restaurant_id: number;
    name: string;
    description?: string | null;
    price: number;
    category?: string | null;
    image_url?: string | null;
    is_available: boolean;
    created_at: string;
    updated_at: string;
};

export type Order = {
    id: number;
    user_id: number;
    restaurant_id: number;
    items: OrderItem[];
    total_amount: number;
    commission?: number | null;
    status: OrderStatus;
    stripe_payment_id?: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    restaurant?: Restaurant;
};

export type OrderItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
};

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'ready' | 'completed';

export type Reservation = {
    id: number;
    user_id: number;
    restaurant_id: number;
    date: string;
    time: string;
    party_size: number;
    status: ReservationStatus;
    special_requests?: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    restaurant?: Restaurant;
};

export type ReservationStatus = 'confirmed' | 'cancelled';
