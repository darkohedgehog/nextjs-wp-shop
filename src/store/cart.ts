import { create } from 'zustand';

type CartItem = {
  id: string;
  name: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
};

export const useCart = create<CartStore>((set) => ({
  items: [],
  addToCart: (item) =>
    set((state) => {
      const exists = state.items.find((i) => i.id === item.id);
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      } else {
        return { items: [...state.items, item] };
      }
    }),
  removeFromCart: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
}));
