'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// 1. Tipovi za narudžbu i stavke
type OrderLineItem = {
  id: number | string;
  name: string;
  quantity: number;
  total: string | number;
  image?: { src?: string } | Array<{ src: string }>;
};

type Order = {
  id: number | string;
  status: string;
  currency: string;
  line_items: OrderLineItem[];
  shipping_total: string | number;
  total: string | number;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    email: string;
  };
};

export default function OrderSuccessClient() {
  const search = useSearchParams();
  const orderId = search.get('order_id');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Nema ID narudžbe');
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Ne može doći do narudžbe');
        return res.json();
      })
      .then((data) => setOrder(data))
      .catch((e) => setError(e.message));
  }, [orderId]);

  if (error) {
    return <p className="p-4 text-red-600">Greška: {error}</p>;
  }
  if (!order) return <p className="p-4">Učitavanje narudžbe…</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Hvala na narudžbi #{order.id}!</h1>
      <p>Status: {order.status}</p>
      <h2 className="mt-4 font-semibold">Stavke:</h2>
      {order.line_items.map((li) => (
        <div key={li.id} className="flex items-center border-b py-2">
          {/* 2. Next.js <Image> */}
          {li.image &&
  (Array.isArray(li.image)
    ? li.image[0]?.src
    : li.image.src) && (
    <Image
      src={
        Array.isArray(li.image)
          ? li.image[0]?.src ?? "/placeholder.png"
          : li.image?.src ?? "/placeholder.png"
      }
      alt={li.name}
      width={64}
      height={64}
      className="w-16 h-16 object-cover rounded mr-4"
    />
  )}
          <div>
            <p>
              {li.name} × {li.quantity} = {li.total} {order.currency}
            </p>
          </div>
        </div>
      ))}

      <p className="font-semibold">
        Dostava: {order.shipping_total} {order.currency}
      </p>
      <p className="font-bold">
        Ukupno: {order.total} {order.currency}
      </p>

      <h2 className="mt-6 font-semibold">Podaci o naplati:</h2>
      <p>
        {order.billing.first_name} {order.billing.last_name}
      </p>
      <p>
        {order.billing.address_1}, {order.billing.city}
      </p>
      <p>{order.billing.email}</p>

      <Link href="/" className="text-blue-600 hover:underline">
        Nastavi s kupovinom
      </Link>
    </div>
  );
}