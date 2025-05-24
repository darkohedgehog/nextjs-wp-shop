'use client';

import { useCart, CartItem } from '@/store/cart';
import CartQty from '@/components/cart/CartQty';
import Link from 'next/link';

export default function CartPage() {
  const items = useCart((s) => s.items);

  const grandTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!items.length) {
    return <p className="p-4">Košarica je prazna.</p>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {items.map((item) => (
        <div key={item.product_id} className="flex justify-between items-center my-12">
          <div>
            <h2 className="font-semibold">{item.name}</h2>
            <p>{item.price.toFixed(2)} € x {item.quantity} = {(item.price * item.quantity).toFixed(2)} €</p>
          </div>
          <CartQty product_id={item.product_id} />
        </div>
      ))}

      <div className="mt-6 text-right font-bold">
        Ukupno: {grandTotal.toFixed(2)} €
      </div>

      {/* Dugme ka checkout-u */}
      <Link href={'/checkout'}>
      <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded">
        Na naplatu
      </button>
      </Link>
    </div>
  );
}
