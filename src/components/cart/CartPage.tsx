'use client';

import { useCart } from '@/store/cart';
import Link from 'next/link';
import Image from 'next/image';
import CartQty from './CartQty';
import { TiShoppingCart } from 'react-icons/ti';

export default function CartPage() {
  const items = useCart((s) => s.items);

  const grandTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!items.length) {
    return <p className="p-4">Košarica je prazna.</p>;
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className='flex items-center justify-center my-10 mx-auto max-w-6xl text-center text-3xl font-bold tracking-tight text-zinc-300 md:text-4xl lg:text-4xl gap-3'>
      Vaša košarica
      <span><TiShoppingCart className='text-[#adb5bd]' /></span>
        </h1>
        <div className='border border-[#adb5bd] shadow-lg shadow-[#adb5bd] bg-gradient-custom rounded-xl'>
      {items.map((item) => (
        <div
          key={item.product_id}
          className="flex justify-between items-center my-12 mx-6"
        >
          <div className="flex items-center space-x-4">
            {item.image && item.image.length > 0 && (
              <Image
                src={item.image}
                alt={item.imageAlt || item.name}
                width={80}
                height={80}
                priority
                className="object-cover rounded w-20 h-20"
              />
            )}
            <div className='grid grid-rows-3 items-center justify-center'>
              <h2 className="font-semibold text-zinc-200">{item.name}</h2>
              {item.sku && (
             <p className="text-xs text-zinc-300">SKU: {item.sku}</p>
               )}
              <p className='text-sm text-blue-950'>
                {item.price.toFixed(2)} € x {item.quantity} ={' '}
                {(item.price * item.quantity).toFixed(2)} €
              </p>
            </div>
          </div>
          <CartQty product_id={item.product_id} />
        </div>
      ))}
       </div>
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
