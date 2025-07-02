'use client';

import AddToCartBtn from './AddToCart';

export default function AddToCartWrapper(props: {
  product_id: number;
  name: string;
  price: number;
  image?: string;
  imageAlt?: string;
}) {
  return <AddToCartBtn {...props} />;
}