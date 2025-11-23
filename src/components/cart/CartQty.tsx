'use client';

import { useCart } from '@/store/cart';
import { MdDeleteForever } from 'react-icons/md';
import { TbShoppingCartMinus, TbShoppingCartPlus } from 'react-icons/tb';

export default function CartQty({ product_id }: { product_id: number }) {
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const qty = useCart((s) =>
    s.items.find((i) => i.product_id === product_id)?.quantity || 0
  );

  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex items-center rounded-lg bg-[#f8f9fa] border border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-3 mx-2">
      <button 
      type='button'
      onClick={() => updateQuantity(product_id, qty - 1)} disabled={qty <= 1}
      className="px-3 py-2 text-lg text-red-600 disabled:opacity-40">
        <TbShoppingCartMinus />
      </button>
      <span className='text-zinc-700'>{qty}</span>
      <button 
      type='button'
      onClick={() => updateQuantity(product_id, qty + 1)}
      className="px-3 py-2 text-lg text-green-400 disabled:opacity-40">
        <TbShoppingCartPlus />
        </button>
      <button onClick={() => removeItem(product_id)} className="px-3 py-2 text-lg text-red-600">
      <MdDeleteForever />
      </button>
      </div>
    </div>
  );
}
