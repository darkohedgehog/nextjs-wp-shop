'use client';

import AddToCartBtn from './AddToCart';

export default function AddToCartWrapper({
  product_id,
  name,
  price,
  image,
  imageAlt,
  disabled,
  quantity,
  sku,
  ean,
}: {
  product_id: number;
  name: string;
  price: number;
  image?: string;
  imageAlt?: string;
  disabled?: boolean;
  quantity?: number;
  sku?: string;
  ean?: string;
}) {
  return (
    <AddToCartBtn
      product_id={product_id}
      name={name}
      price={price}
      image={image}
      imageAlt={imageAlt}
      disabled={disabled}
      quantity={quantity}
      sku={sku}
      ean={ean}
    />
  );
}