// app/checkout/page.tsx
'use client';

import { useCart } from '@/store/cart';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    const line_items = items.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
    }));

    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line_items }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      return;
    }

    // Uspjeh: isprazni košaricu i preusmjeri na WooCommerce plaćanje
    clearCart();
    const paymentUrl: string | undefined = data.payment_url || data.data?.payment_url;
    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      router.push('/success');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded w-full disabled:opacity-50"
      >
        {loading ? 'Obrađujem...' : 'Završi kupovinu'}
      </button>
      {error && <p className="mt-4 text-red-600">Greška pri kreiranju narudžbe: {error}</p>}
    </div>
  );
}
