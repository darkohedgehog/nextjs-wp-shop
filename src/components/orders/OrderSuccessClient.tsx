'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LottieAnimation from './LottieAnimation';
import { MdOutlineShoppingCart } from 'react-icons/md';

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Tipovi za narudžbu i stavke
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
  customer_note?: string | null;
  shipping_total: string | number;
  total: string | number;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    email: string;
    phone: string | number;
    company?: string; // 👈 dodato
  };
};

const formatMoney = (value: string | number, currency: string) => {
  const num =
    typeof value === "string"
      ? parseFloat(value.replace(",", "."))
      : value;

  if (Number.isNaN(num)) return `${value} ${currency}`;

  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(num);
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();

  const map: Record<string, string> = {
    processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    "on-hold": "bg-blue-100 text-blue-800 border-blue-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    failed: "bg-red-100 text-red-800 border-red-200",
    pending: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const cls = map[s] ?? "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  );
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

  const toNumber = (v: string | number) => {
    const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : v;
    return Number.isFinite(n) ? n : 0;
  };

  const itemsSubtotal = useMemo(() => {
    if (!order) return 0;
    return order.line_items.reduce((acc, li) => acc + toNumber(li.total), 0);
  }, [order]);

  if (error) {
    return <p className="p-4 text-red-600 flex items-center justify-center">Greška: {error}</p>;
  }

  if (!order) {
    return (
      <p className="p-4 flex items-center justify-center text-lg text-zinc-300">
        Učitavanje narudžbe…
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      {/* Success header */}
      <div className="mb-6 rounded-2xl border border-[#adb5bd] shadow-sm shadow-[#adb5bd] bg-gradient-custom p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="w-[180px] md:w-[320px] shrink-0">
          <LottieAnimation />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-200">
              Hvala na narudžbi #{order.id}!
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm md:text-base text-zinc-600">
            Potvrda o narudžbi je uspješno kreirana. Detalje možete vidjeti ispod.
          </p>

          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff] px-5 py-2 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              Nastavi s kupovinom
              <span><MdOutlineShoppingCart /></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: items + billing */}
        <div className="lg:col-span-8 space-y-6">
          {/* Items card */}
          <div className="border border-[#adb5bd] shadow-sm shadow-[#adb5bd] bg-gradient-custom p-4 md:p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4 text-zinc-200">Stavke narudžbe</h2>

            <div className="divide-y">
              {order.line_items.map((li) => {
                const imgSrc =
                  li.image &&
                  (Array.isArray(li.image) ? li.image[0]?.src : li.image.src);

                return (
                  <div key={li.id} className="py-4 flex items-center gap-4">
                    {/* Product image */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden bg-gray-50 border">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={li.name}
                          fill
                          sizes="80px"
                          priority
                          className="object-cover"
                        />
                      ) : (
                        <Image
                          src="/placeholder.png"
                          alt="placeholder"
                          fill
                          sizes="80px"
                          priority
                          className="object-cover opacity-60"
                        />
                      )}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-base truncate text-zinc-300">
                        {li.name}
                      </p>
                      <p className="text-xs md:text-sm text-zinc-600">
                        Količina: <span className="font-medium">{li.quantity}</span>
                      </p>
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      <p className="text-sm md:text-base font-semibold primary-color">
                        {formatMoney(li.total, order.currency)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Billing card */}
          <div className="rounded-2xl border border-[#adb5bd] shadow-sm shadow-[#adb5bd] bg-gradient-custom p-4 md:p-6">
            <h2 className="text-lg font-bold mb-4 text-zinc-200">Podaci o naplati</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-zinc-300">Kupac</p>
                {order.billing.company?.trim() ? (
                  <>
                    <p className="font-semibold text-zinc-200">
                      {order.billing.company}
                    </p>
                    <p className="text-sm text-zinc-300">
                      {order.billing.first_name} {order.billing.last_name}
                    </p>
                  </>
                ) : (
                  <p className="font-semibold text-zinc-200">
                    {order.billing.first_name} {order.billing.last_name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-zinc-300">Email</p>
                <p className="font-semibold break-all text-zinc-200">
                  {order.billing.email}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className="text-zinc-300">Adresa</p>
                <p className="font-semibold text-zinc-200">
                  {order.billing.address_1}, {order.billing.city}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className="text-zinc-300">Telefon</p>
                <p className="font-semibold text-zinc-200">
                  {order.billing.phone}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className="text-zinc-300">Napomena:</p>
                {order.customer_note?.trim() ? (
                  <p className="font-semibold text-zinc-200">
                    {order.customer_note}
                  </p>
                ) : (
                  <p className="text-zinc-500 italic">Nema napomene.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: sticky summary */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="rounded-2xl border border-[#adb5bd] shadow-sm shadow-[#adb5bd] bg-gradient-custom p-4 md:p-6">
              <h2 className="text-lg font-bold mb-4 text-zinc-200">Sažetak</h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Međuzbir</span>
                  <span className="font-semibold text-zinc-200">
                    {formatMoney(itemsSubtotal, order.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Dostava</span>
                  <span className="font-semibold text-zinc-200">
                    {formatMoney(order.shipping_total, order.currency)}
                    {toNumber(order.shipping_total) === 0 &&
                      ' (B2B besplatna dostava)'}
                  </span>
                </div>

                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="text-base font-bold text-blue-500">Ukupno</span>
                  <span className="text-base font-extrabold text-blue-600">
                    {formatMoney(order.total, order.currency)}
                  </span>
                </div>
              </div>

              <div className="mt-5 text-xs text-zinc-100">
                Ako imate pitanja oko narudžbe, slobodno nas kontaktirajte na prodaja@zivic-elektro.com
              </div>

              <div className="mt-4">
                <Link
                  href="/products"
                  className="w-full inline-flex items-center justify-center rounded-full bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff] px-4 py-2 text-sm font-semibold transition"
                >
                  Nazad na trgovinu
                  <span><MdOutlineShoppingCart /></span>
                </Link>
              </div>
            </div>

            {/* Optional info mini-card */}
            <div className="rounded-2xl border border-[#adb5bd] shadow-sm shadow-[#adb5bd] bg-gradient-custom p-4 md:p-5 text-sm">
              <p className="font-semibold mb-1 text-zinc-200">Status narudžbe</p>
              <p className="text-zinc-300">
                Trenutni status: <span className="font-semibold">{order.status}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}