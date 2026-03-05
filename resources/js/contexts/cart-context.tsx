import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    type ReactNode,
} from 'react';

export type CartItem = {
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
    image_url: string | null;
};

type CartState = {
    restaurantId: number | null;
    restaurantName: string | null;
    restaurantSlug: string | null;
    items: CartItem[];
};

type CartAction =
    | { type: 'ADD_ITEM'; payload: { item: Omit<CartItem, 'quantity'>; quantity: number; restaurant: { id: number; name: string; slug: string } } }
    | { type: 'REMOVE_ITEM'; payload: { menuItemId: number } }
    | { type: 'UPDATE_QUANTITY'; payload: { menuItemId: number; quantity: number } }
    | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { item, quantity, restaurant } = action.payload;
            
            // Si el carrito tiene items de otro restaurante, lo limpiamos
            if (state.restaurantId && state.restaurantId !== restaurant.id) {
                return {
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    restaurantSlug: restaurant.slug,
                    items: [{ ...item, quantity }],
                };
            }
            
            const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
            if (existing) {
                return {
                    ...state,
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    restaurantSlug: restaurant.slug,
                    items: state.items.map((i) =>
                        i.menuItemId === item.menuItemId
                            ? { ...i, quantity: i.quantity + quantity }
                            : i
                    ),
                };
            }
            return {
                ...state,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                restaurantSlug: restaurant.slug,
                items: [...state.items, { ...item, quantity }],
            };
        }
        case 'REMOVE_ITEM': {
            const newItems = state.items.filter((i) => i.menuItemId !== action.payload.menuItemId);
            if (newItems.length === 0) {
                return { restaurantId: null, restaurantName: null, restaurantSlug: null, items: [] };
            }
            return { ...state, items: newItems };
        }
        case 'UPDATE_QUANTITY': {
            const { menuItemId, quantity } = action.payload;
            if (quantity <= 0) {
                const newItems = state.items.filter((i) => i.menuItemId !== menuItemId);
                if (newItems.length === 0) {
                    return { restaurantId: null, restaurantName: null, restaurantSlug: null, items: [] };
                }
                return { ...state, items: newItems };
            }
            return {
                ...state,
                items: state.items.map((i) =>
                    i.menuItemId === menuItemId ? { ...i, quantity } : i
                ),
            };
        }
        case 'CLEAR_CART':
            return { restaurantId: null, restaurantName: null, restaurantSlug: null, items: [] };
        default:
            return state;
    }
}

type CartContextValue = {
    items: CartItem[];
    restaurantId: number | null;
    restaurantName: string | null;
    restaurantSlug: string | null;
    addItem: (item: Omit<CartItem, 'quantity'>, quantity: number, restaurant: { id: number; name: string; slug: string }) => void;
    removeItem: (menuItemId: number) => void;
    updateQuantity: (menuItemId: number, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = 'venu_cart';

const initialState: CartState = { 
    restaurantId: null, 
    restaurantName: null, 
    restaurantSlug: null, 
    items: [] 
};

function loadCartFromStorage(): CartState {
    if (typeof window === 'undefined') return initialState;
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Ignore errors
    }
    return initialState;
}

function saveCartToStorage(state: CartState) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Ignore errors
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState, loadCartFromStorage);

    useEffect(() => {
        saveCartToStorage(state);
    }, [state]);

    const addItem = useCallback(
        (item: Omit<CartItem, 'quantity'>, quantity: number, restaurant: { id: number; name: string; slug: string }) => {
            dispatch({ type: 'ADD_ITEM', payload: { item, quantity, restaurant } });
        },
        []
    );

    const removeItem = useCallback((menuItemId: number) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { menuItemId } });
    }, []);

    const updateQuantity = useCallback((menuItemId: number, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItemId, quantity } });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const itemCount = useMemo(
        () => state.items.reduce((sum, i) => sum + i.quantity, 0),
        [state.items]
    );

    const subtotal = useMemo(
        () => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        [state.items]
    );

    const value = useMemo<CartContextValue>(
        () => ({
            items: state.items,
            restaurantId: state.restaurantId,
            restaurantName: state.restaurantName,
            restaurantSlug: state.restaurantSlug,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            itemCount,
            subtotal,
        }),
        [state, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return ctx;
}
