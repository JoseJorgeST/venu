import {
    createContext,
    useCallback,
    useContext,
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
    items: CartItem[];
};

type CartAction =
    | { type: 'ADD_ITEM'; payload: { item: Omit<CartItem, 'quantity'>; quantity: number } }
    | { type: 'REMOVE_ITEM'; payload: { menuItemId: number } }
    | { type: 'UPDATE_QUANTITY'; payload: { menuItemId: number; quantity: number } }
    | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { item, quantity } = action.payload;
            const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
            if (existing) {
                return {
                    items: state.items.map((i) =>
                        i.menuItemId === item.menuItemId
                            ? { ...i, quantity: i.quantity + quantity }
                            : i
                    ),
                };
            }
            return {
                items: [...state.items, { ...item, quantity }],
            };
        }
        case 'REMOVE_ITEM': {
            return {
                items: state.items.filter((i) => i.menuItemId !== action.payload.menuItemId),
            };
        }
        case 'UPDATE_QUANTITY': {
            const { menuItemId, quantity } = action.payload;
            if (quantity <= 0) {
                return { items: state.items.filter((i) => i.menuItemId !== menuItemId) };
            }
            return {
                items: state.items.map((i) =>
                    i.menuItemId === menuItemId ? { ...i, quantity } : i
                ),
            };
        }
        case 'CLEAR_CART':
            return { items: [] };
        default:
            return state;
    }
}

type CartContextValue = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
    removeItem: (menuItemId: number) => void;
    updateQuantity: (menuItemId: number, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const initialState: CartState = { items: [] };

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    const addItem = useCallback(
        (item: Omit<CartItem, 'quantity'>, quantity: number) => {
            dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
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
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            itemCount,
            subtotal,
        }),
        [state.items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal]
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
