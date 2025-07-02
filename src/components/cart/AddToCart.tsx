'use client';

import { useCart } from '@/store/cart';
import Image from 'next/image';

export default function AddToCartBtn(props: {
  product_id: number;
  name: string;
  price: number;
  image?: string;
  imageAlt?: string;
}) {
  const { product_id, name, price, image, imageAlt } = props;
  const addItem = useCart((s) => s.addItem);
  const items = useCart((s) => s.items);
  const existingQty = items.find((i) => i.product_id === product_id)?.quantity || 0;

  const handleAdd = () => {
    addItem({
      product_id,
      name,
      price,
      quantity: 1,
      image: image ?? '',
      imageAlt: imageAlt ?? name,
    });
  };

  return (
    <button
      onClick={handleAdd}
      className="flex items-center bg-blue-600 text-white px-4 py-2 rounded"
    >
      {image && image.trim() !== '' && (
        <Image
          src={image}
          alt={imageAlt || name}
          width={24}
          height={24}
          className="object-cover rounded mr-2"
        />
      )}
      <span>Dodaj u košaricu{existingQty > 0 && ` (${existingQty})`}</span>
    </button>
  );
}