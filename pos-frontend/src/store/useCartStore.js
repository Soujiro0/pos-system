import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
    persist(
        (set, get) => ({
            cartItems: [],
            totals: {
                subtotal: 0,
                tax: 0,
                discount: 0,
                total: 0,
            },

            setTotals: (totals) => set({ totals }),

            addItem: (product) =>
                set((state) => {
                    const existingItem = state.cartItems.find(
                        (item) => item.id === product.id
                    );

                    if (existingItem) {
                        return {
                            cartItems: state.cartItems.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                        };
                    }

                    return {
                        cartItems: [
                            ...state.cartItems,
                            { ...product, quantity: 1 },
                        ],
                    };
                }),

            removeItem: (productId) =>
                set((state) => ({
                    cartItems: state.cartItems.filter(
                        (item) => item.id !== productId
                    ),
                })),

            updateQuantity: (productId, quantity) =>
                set((state) => {
                    if (quantity <= 0) {
                        return {
                            cartItems: state.cartItems.filter(
                                (item) => item.id !== productId
                            ),
                        };
                    }

                    return {
                        cartItems: state.cartItems.map((item) =>
                            item.id === productId ? { ...item, quantity } : item
                        ),
                    };
                }),

            clearCart: () =>
                set({
                    cartItems: [],
                    totals: { subtotal: 0, tax: 0, discount: 0, total: 0 },
                }),

            // Selectors (derived state can be calculated in components, but helpers are nice)
            getCartTotal: () => {
                const { cartItems } = get();
                return cartItems.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },

            getItemCount: () => {
                const { cartItems } = get();
                return cartItems.reduce(
                    (count, item) => count + item.quantity,
                    0
                );
            },
        }),
        {
            name: "pos-cart-storage", // unique name for localStorage
        }
    )
);
