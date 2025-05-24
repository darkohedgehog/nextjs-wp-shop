'use client';

import { useCart, CartItem } from '@/store/cart';

export default function AddToCartBtn(props: {
  product_id: number;
  name: string;
  price: number;
}) {
  const { product_id, name, price } = props;
  const addItem = useCart((s) => s.addItem);
  const items = useCart((s) => s.items);
  const existingQty = items.find((i) => i.product_id === product_id)?.quantity || 0;

  const handleAdd = () => {
    addItem({
      product_id,
      name,
      price,
      quantity: 1,
    });
  };

  return (
    <button
      onClick={handleAdd}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Dodaj u košaricu {existingQty > 0 && `(${existingQty})`}
    </button>
  );
}
