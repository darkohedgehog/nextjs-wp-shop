'use client';

import { useCart } from '@/store/cart';
import Link from 'next/link';
import Image from 'next/image';
import CartQty from './CartQty';
import { TiShoppingCart } from 'react-icons/ti';
import BackButton from '../ui/BackButton';
import { GiPayMoney } from 'react-icons/gi';
import { TbMoodSad } from 'react-icons/tb';

export default function CartPage() {
  const items = useCart((s) => s.items);
  const image = '/assets/Add-to-Cart-amico.svg'

  const grandTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = 4.5;
  const totalWithShipping = grandTotal + shipping;

  if (!items.length) {
    return <div className="p-4 flex flex-col items-center justify-center my-28 gap-3">
      <Image
      src={image}
      alt='Prazna košarica'
      width={200}
      height={200}
      priority 
      className='max-w-2xl h-auto object-cover'/>
      <div className='text-3xl paragraph-color my-24 flex items-center justify-center gap-3'>
        Vaša košarica je prazna
        <span className='text-zinc-300'><TbMoodSad /></span>
      </div>
    <BackButton />
    </div>;
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className='flex items-center justify-center my-10 mx-auto max-w-6xl text-center text-3xl font-bold tracking-tight text-zinc-300 md:text-4xl lg:text-4xl gap-3'>
      Vaša košarica
      <span><TiShoppingCart className='text-[#adb5bd]' /></span>
        </h1>
        <div className="border border-[#adb5bd] shadow-lg shadow-[#adb5bd] bg-gradient-custom rounded-xl">
  {items.map((item) => (
    <div
      key={item.product_id}
      className="
        flex flex-col sm:flex-row
        sm:justify-between sm:items-center
        gap-4
        my-8 sm:my-12
        mx-3 sm:mx-6
        py-4 sm:py-0
        border-b border-white/10 last:border-b-0 bg-white/5 rounded-lg p-3
      "
    >
      {/* LEFT SIDE: image + info */}
      <div className="flex items-start gap-3 sm:gap-4 w-full">
        {item.image && item.image.length > 0 && (
          <Image
            src={item.image}
            alt={item.imageAlt || item.name}
            width={80}
            height={80}
            priority
            className="object-cover rounded w-20 h-20 shrink-0"
          />
        )}

        {/* INFO + mobile qty */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h2 className="font-semibold text-zinc-200 leading-snug wrap-break-word">
            {item.name}
          </h2>

          {item.sku && (
            <p className="text-xs text-zinc-300">
              SKU: {item.sku}
            </p>
          )}

          <p className="text-sm text-blue-950">
            {item.price.toFixed(2)} € x {item.quantity} ={" "}
            {(item.price * item.quantity).toFixed(2)} €
          </p>

          {/* MOBILE CartQty (below info) */}
          <div className="mt-2 sm:hidden">
            <CartQty product_id={item.product_id} />
          </div>
        </div>
      </div>

      {/* DESKTOP CartQty (right side) */}
      <div className="hidden sm:block">
        <CartQty product_id={item.product_id} />
      </div>
    </div>
  ))}

  {/* TOTALS */}
  <div className="flex flex-col items-stretch sm:items-end justify-end my-6 sm:my-8 mx-3 sm:mx-6 space-y-2">
    <div className="bg-[#f8f9fa] px-4 py-3 rounded-3xl border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] text-[#007bff] flex flex-col">
      <div className="flex items-center justify-between sm:justify-start sm:gap-2 py-1">
        <span>Cijena:</span>
        <span>{grandTotal.toFixed(2)} €</span>
      </div>

      <div className="flex items-center justify-between sm:justify-start sm:gap-2 py-1">
        <span>Dostava:</span>
        <span>{shipping.toFixed(2)} €</span>
      </div>

      <div className="flex items-center justify-between sm:justify-start sm:gap-2 py-1 font-bold">
        <span>Ukupno:</span>
        <span>{totalWithShipping.toFixed(2)} €</span>
      </div>

      <h1 className="text-zinc-400 text-sm mt-2">
        *PDV uključen u cijenu
      </h1>
    </div>
  </div>
</div>
      {/* Dugme ka checkout-u */}
      <div className="mt-4 flex items-center justify-center">
        <Link href="/checkout">
        <button
          type='button' 
          className='mt-8 bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer flex items-center px-4 py-2 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff]'>
          <span className='uppercase text-sm font-bold flex items-center justify-center gap-2'>
          <GiPayMoney className='w-5 h-5' />
           Plaćanje
            </span>
        </button>  
        </Link>
      </div>
      <BackButton />
    </div>
  );
}
