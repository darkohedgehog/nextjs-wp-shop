'use client';

import AddToCartBtn from './AddToCart';

export default function AddToCartWrapper(props: {
  product_id: number;
  name: string;
  price: number;
  image?: string;
  imageAlt?: string;
  disabled?: boolean;
  quantity?: number;
  sku?: string;
}) {
  return <AddToCartBtn {...props} />;
}