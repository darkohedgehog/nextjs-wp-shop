'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type OrderItem = {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
};

export default function MyAccountPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem('wpUser');
    if (!raw) {
      setLoading(false);
      setError('Niste prijavljeni. Molimo prijavite se da biste vidjeli narudžbe.');
      return;
    }

    try {
      const user = JSON.parse(raw);
      const id = user?.id || user?.data?.id;
      if (!id) {
        setLoading(false);
        setError('Ne mogu da pronađem ID korisnika.');
        return;
      }

      setCustomerId(Number(id));

      (async () => {
        try {
          const res = await fetch(`/api/orders?customer=${id}`, {
            method: 'GET',
            cache: 'no-store',
          });

          if (!res.ok) {
            const txt = await res.text();
            console.error('MyAccount orders error:', res.status, txt);
            setError('Greška pri dohvaćanju narudžbi.');
            setLoading(false);
            return;
          }

          const data: any[] = await res.json();

          const mapped: OrderItem[] = (Array.isArray(data) ? data : []).map((o) => ({
            id: o.id,
            number: o.number,
            status: o.status,
            date_created: o.date_created,
            total: o.total,
            currency: o.currency,
          }));

          setOrders(mapped);
          setLoading(false);
        } catch (err) {
          console.error('MyAccount fetch error:', err);
          setError('Greška pri dohvaćanju narudžbi.');
          setLoading(false);
        }
      })();
    } catch (e) {
      console.error('Neispravan wpUser u localStorage-u:', e);
      setError('Greška sa prijavom korisnika.');
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
      console.error('Greška pri pozivu /api/logout:', e);
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('wpUser');
    }

    router.push('/'); // ili /login ako imaš posebnu login stranicu
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 my-16 text-center text-zinc-300">
        Učitavanje vaših narudžbi…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4 my-16 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 my-16 space-y-6">
      {/* Header sa logout-om */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-zinc-200">
          Moj račun{' '}
          {customerId && (
            <span className="text-sm text-zinc-500 ml-2">ID: {customerId}</span>
          )}
        </h1>

        <button
          type="button"
          onClick={handleLogout}
          className="bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer px-4 py-2 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] text-[#007bff] text-sm font-semibold"
        >
          Odjava
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-zinc-300">
          Još nemate narudžbi.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#adb5bd] bg-gradient-custom shadow-lg shadow-[#adb5bd]">
          <table className="min-w-full text-sm text-left text-zinc-200">
            <thead className="bg-white/10 text-xs uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-4 py-3">Narudžba</th>
                <th className="px-4 py-3">Datum</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ukupno</th>
                <th className="px-4 py-3 text-right">Detalji</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const date = new Date(order.date_created);
                const formatted = date.toLocaleString('hr-HR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const statusLabel = order.status;

                return (
                  <tr
                    key={order.id}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold">#{order.number}</td>
                    <td className="px-4 py-3">{formatted}</td>
                    <td className="px-4 py-3 capitalize">{statusLabel}</td>
                    <td className="px-4 py-3">
                      {order.total} {order.currency}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/order-success?order_id=${order.id}`}
                        className="text-[#007bff] hover:underline text-xs font-semibold"
                      >
                        Pogledaj
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}