'use client';

import { useCart } from '@/store/cart';

export default function CartQty({ product_id }: { product_id: number }) {
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const qty = useCart((s) =>
    s.items.find((i) => i.product_id === product_id)?.quantity || 0
  );

  return (
    <div className="flex items-center space-x-2">
      <button onClick={() => updateQuantity(product_id, qty - 1)} disabled={qty <= 1}>
        –
      </button>
      <span>{qty}</span>
      <button onClick={() => updateQuantity(product_id, qty + 1)}>＋</button>
      <button onClick={() => removeItem(product_id)} className="ml-2 text-red-600">
        ×
      </button>
    </div>
  );
}
