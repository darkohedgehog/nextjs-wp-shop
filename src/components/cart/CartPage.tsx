'use client';

import { useCart } from '@/store/cart';
import Link from 'next/link';
import Image from 'next/image';
import CartQty from './CartQty';

export default function CartPage() {
  const items = useCart((s) => s.items);

  const grandTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!items.length) {
    return <p className="p-4">Košarica je prazna.</p>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {items.map((item) => (
        <div
          key={item.product_id}
          className="flex justify-between items-center my-12"
        >
          <div className="flex items-center space-x-4">
            {item.image && item.image.length > 0 && (
              <Image
                src={item.image}
                alt={item.imageAlt || item.name}
                width={80}
                height={80}
                className="object-cover rounded"
              />
            )}
            <div>
              <h2 className="font-semibold">{item.name}</h2>
              {item.sku && (
             <p className="text-xs text-zinc-500">SKU: {item.sku}</p>
               )}
              <p>
                {item.price.toFixed(2)} € x {item.quantity} ={' '}
                {(item.price * item.quantity).toFixed(2)} €
              </p>
            </div>
          </div>
          <CartQty product_id={item.product_id} />
        </div>
      ))}

      <div className="mt-6 text-right font-bold">
        Ukupno: {grandTotal.toFixed(2)} €
      </div>

      {/* Dugme ka checkout-u */}
      <div className="mt-4 text-center">
        <Link href="/checkout">
          <button className="bg-green-600 text-white px-6 py-2 rounded">
            Na naplatu
          </button>
        </Link>
      </div>
    </div>
  );
}
