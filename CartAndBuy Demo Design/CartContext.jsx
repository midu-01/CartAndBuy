import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existing = state.items.find((item) => item.id === action.payload.id);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map((item) =>
                        item.id === action.payload.id 
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    ),
                };
            }
            return { ...state, items: [...state.items, action.payload] };
        }
        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
        case 'CLEAR_CART':
            return { items: [] };
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [] }, (initialState) => {
        try {
            const saved = localStorage.getItem('ecommerce_cart');
            return saved ? JSON.parse(saved) : initialState;
        } catch (error) {
            return initialState;
        }
    });

    useEffect(() => {
        localStorage.setItem('ecommerce_cart', JSON.stringify(state));
    }, [state]);

    const totals = useMemo(() => {
        const subtotal = state.items.reduce((acc, item) => acc + (item.sale_price || item.price) * item.quantity, 0);
        const tax = subtotal * 0.08; // 8% hypothetical tax
        return { subtotal, tax, total: subtotal + tax };
    }, [state.items]);

    return (
        <CartContext.Provider value={{ cart: state, dispatch, ...totals }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);