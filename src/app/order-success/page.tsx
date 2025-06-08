'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Order = any; // definirajte tip po potrebi

export default function OrderSuccess() {
  const search = useSearchParams();
  const orderId = search.get('order_id');
  const [order, setOrder] = useState<Order|null>(null);
  const [error, setError] = useState<string|null>(null);

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
      {order.line_items.map((li: any) => (
    <div key={li.id} className="flex items-center border-b py-2">
      {li.image?.src && (            // ili li.image[0]?.src po format
        <img
          src={li.image.src || li.image[0]?.src}
          alt={li.name}
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

      <p className="font-semibold">Dostava: {order.shipping_total} {order.currency}</p>
      <p className="font-bold">Ukupno: {order.total} {order.currency}</p>

      <h2 className="mt-6 font-semibold">Podaci o naplati:</h2>
      <p>{order.billing.first_name} {order.billing.last_name}</p>
      <p>{order.billing.address_1}, {order.billing.city}</p>
      <p>{order.billing.email}</p>

      <Link href="/" className="text-blue-600 hover:underline">
        Nastavi s kupovinom
      </Link>
    </div>
  );
}
