import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image: string; // URL
  imageAlt: string;
  sku?: string;
};

type CartState = {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (product_id: number, qty: number) => void;
  removeItem: (product_id: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      addItem: (item) => {
        const exists = get().items.find((i) => i.product_id === item.product_id);
        if (exists) {
          set({
            items: get().items.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      updateQuantity: (product_id, qty) => {
        set({
          items: get().items.map((i) =>
            i.product_id === product_id ? { ...i, quantity: qty } : i
          ),
        });
      },

      removeItem: (product_id) => {
        set({ items: get().items.filter((i) => i.product_id !== product_id) });
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
