import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  setQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
};

function sameLine(a: CartItem, productId: string, variantId?: string) {
  return a.productId === productId && (a.variantId ?? "") === (variantId ?? "");
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      addItem: (item) => {
        const items = [...get().items];
        const idx = items.findIndex((i) =>
          sameLine(i, item.productId, item.variantId),
        );
        if (idx >= 0) {
          const nextQty = Math.min(
            items[idx].maxStock,
            items[idx].quantity + item.quantity,
          );
          items[idx] = { ...items[idx], quantity: nextQty };
        } else {
          items.push(item);
        }
        set({ items, isOpen: true });
      },
      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter((i) => !sameLine(i, productId, variantId)),
        });
      },
      setQuantity: (productId, quantity, variantId) => {
        set({
          items: get().items
            .map((i) =>
              sameLine(i, productId, variantId)
                ? {
                    ...i,
                    quantity: Math.max(1, Math.min(i.maxStock, quantity)),
                  }
                : i,
            )
            .filter((i) => i.quantity > 0),
        });
      },
      clear: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "accesorios-magi-cart" },
  ),
);
