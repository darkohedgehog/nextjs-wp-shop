'use client';

import { useCart } from '@/store/cart';
import Image from 'next/image';
import { TiShoppingCart } from "react-icons/ti";

export default function AddToCartBtn(props: {
  product_id: number;
  name: string;
  price: number;
  image?: string;
  imageAlt?: string;
  disabled?: boolean;
  quantity?: number;
  sku?: string;
}) {
  const { product_id, name, price, image, imageAlt, disabled, quantity, sku } = props;
  const addItem = useCart((s) => s.addItem);
  const items = useCart((s) => s.items);
  const existingQty = items.find((i) => i.product_id === product_id)?.quantity || 0;

  const handleAdd = () => {
    if (disabled) return;

    // ako nije proslijeđena količina, default je 1
    const qtyToAdd = quantity && quantity > 0 ? quantity : 1;

    addItem({
      product_id,
      name,
      price,
      quantity: qtyToAdd,
      image: image ?? '',
      imageAlt: imageAlt ?? name,
      sku: sku ?? '',
    });
  };

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className={`
        flex items-center px-4 py-2 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd]
        ${disabled
          ? 'bg-gray-500 cursor-not-allowed opacity-60'
          : 'bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer'}
      `}
    >
      {image && image.trim() !== '' && (
        <Image
          src={image}
          alt={imageAlt || name}
          width={24}
          height={24}
          priority
          className="object-cover w-4 h-4 rounded mr-2 border border-[#adb5bd]"
        />
      )}

      <span className="flex items-center justify-center gap-2 text-[#007bff]">
        Dodaj u <TiShoppingCart className='text-[#343a40]' /> {existingQty > 0 && `(${existingQty})`}
      </span>
    </button>
  );
}