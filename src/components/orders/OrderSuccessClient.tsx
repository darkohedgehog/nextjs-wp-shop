"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LottieAnimation from "./LottieAnimation";
import { MdOutlineShoppingCart } from "react-icons/md";
import { HiCheckCircle } from "react-icons/hi";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Tipovi za narudžbu i stavke
type OrderLineItem = {
  id: number | string;
  product_id?: number; // 👈 bitno za B2B logiku
  name: string;
  quantity: number;
  total: string | number;
  image?: { src?: string } | Array<{ src: string }>;
  sku?: string;
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
    company?: string;
  };
};

type PriceInfo = {
  effective: number; // stvarna (B2B) cijena
  regular: number; // redovna cijena
  discountPercent: number; // popust u %
};

const formatMoney = (value: string | number, currency: string) => {
  const num =
    typeof value === "string" ? parseFloat(value.replace(",", ".")) : value;

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
    processing: "bg-amber-500/10 text-amber-300 border-amber-500/40",
    completed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
    "on-hold": "bg-sky-500/10 text-sky-300 border-sky-500/40",
    cancelled: "bg-red-500/10 text-red-300 border-red-500/40",
    failed: "bg-red-500/10 text-red-300 border-red-500/40",
    pending: "bg-zinc-500/10 text-zinc-300 border-zinc-500/40",
  };

  const cls = map[s] ?? "bg-zinc-700/30 text-zinc-200 border-zinc-500/40";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {status}
    </span>
  );
};

export default function OrderSuccessClient() {
  const search = useSearchParams();
  const orderId = search.get("order_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 👇 mapa product_id → B2B/B2C info (iz /api/products/[id])
  const [priceMap, setPriceMap] = useState<Record<number, PriceInfo>>({});

  const toNumber = (v: string | number) => {
    const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : v;
    return Number.isFinite(n) ? n : 0;
  };

  // 1) Učitaj narudžbu
  useEffect(() => {
    if (!orderId) {
      setError("Nema ID narudžbe");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Ne može doći do narudžbe");
        }

        const data = await res.json();
        setOrder(data);
      } catch (e: any) {
        setError(e?.message ?? "Greška pri dohvaćanju narudžbe");
      }
    })();
  }, [orderId]);

  // 2) Na osnovu narudžbe, povuci B2B / group cijene po product_id
  useEffect(() => {
    if (!order || !Array.isArray(order.line_items)) return;

    const uniqueProductIds = Array.from(
      new Set(
        order.line_items
          .map((li) => li.product_id)
          .filter((id): id is number => typeof id === "number")
      )
    );

    if (uniqueProductIds.length === 0) return;

    (async () => {
      try {
        const results = await Promise.all(
          uniqueProductIds.map(async (pid) => {
            try {
              const res = await fetch(`/api/products/${pid}`, {
                cache: "no-store",
              });
              if (!res.ok) {
                console.warn(
                  "OrderSuccess: ne mogu dohvatiti proizvod",
                  pid,
                  await res.text()
                );
                return { pid, info: null as PriceInfo | null };
              }

              const p = await res.json();

              // očekujemo da backend već može postaviti zvo_effective_price / zvo_regular_price
              const basePrice = Number(p.price ?? p.regular_price ?? 0) || 0;
              const baseRegular = Number(p.regular_price ?? p.price ?? 0) || 0;

              const regular =
                typeof p.zvo_regular_price === "number"
                  ? p.zvo_regular_price
                  : baseRegular || basePrice;

              const effective =
                typeof p.zvo_effective_price === "number"
                  ? p.zvo_effective_price
                  : basePrice || baseRegular;

              let discountPercent =
                typeof p.zvo_discount_percent === "number"
                  ? p.zvo_discount_percent
                  : 0;

              if (!discountPercent && regular > 0 && effective < regular) {
                discountPercent = Math.round(
                  ((regular - effective) / regular) * 100
                );
              }

              const info: PriceInfo = {
                effective,
                regular,
                discountPercent,
              };

              return { pid, info };
            } catch (err) {
              console.error(
                "OrderSuccess: greška pri dohvaćanju proizvoda",
                pid,
                err
              );
              return { pid, info: null as PriceInfo | null };
            }
          })
        );

        const map: Record<number, PriceInfo> = {};
        for (const r of results) {
          if (r.info) {
            map[r.pid] = r.info;
          }
        }
        setPriceMap(map);
      } catch (err) {
        console.error(
          "OrderSuccess: neočekivana greška pri dohvaćanju B2B cijena",
          err
        );
      }
    })();
  }, [order]);

  // 3) Međuzbir na osnovu B2B cijena kad god je moguće
  const itemsSubtotal = useMemo(() => {
    if (!order) return 0;

    return order.line_items.reduce((acc, li) => {
      const quantity = li.quantity || 1;
      const pid = li.product_id;

      const info = pid ? priceMap[pid] : undefined;

      // Ako imamo B2B info -> effective * qty
      if (info) {
        return acc + info.effective * quantity;
      }

      // fallback: Woo total (može biti regular) – ali da barem ne pukne
      return acc + toNumber(li.total);
    }, 0);
  }, [order, priceMap]);

  // 4) UI

  if (error) {
    return (
      <p className="p-4 text-red-500 flex items-center justify-center">
        Greška: {error}
      </p>
    );
  }

  if (!order) {
    return (
      <p className="p-4 flex items-center justify-center text-lg text-zinc-300">
        Učitavanje narudžbe…
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10 space-y-6">
      {/* Mini meta header + success badge gore */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.25em] text-emerald-300/80">
            Narudžba potvrđena
          </span>
          <span className="text-[11px] text-zinc-500">
            Web shop · Živić elektro materijal
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
          <HiCheckCircle className="h-3.5 w-3.5 text-emerald-300" />
          <span>Uspješna narudžba</span>
        </span>
      </div>

      {/* Success header card */}
      <div className="mb-2 rounded-3xl border border-cyan-500/60 bg-zinc-800/50 backdrop-blur-xl shadow-[0_0_60px_rgba(56,189,248,0.3)] px-5 py-6 md:px-6 md:py-7 flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="w-[180px] md:w-[320px] shrink-0">
          <LottieAnimation />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-50">
              Hvala na narudžbi #{order.id}!
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm md:text-base text-zinc-400">
            Potvrda o narudžbi je uspješno kreirana. Detalje možete vidjeti
            ispod.
          </p>

          <div className="pt-1.5">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full border border-cyan-500/60 bg-zinc-900/80 hover:bg-zinc-800/90 cursor-pointer shadow-[0_0_25px_rgba(15,23,42,0.9)] gap-2 text-cyan-100 px-5 py-2 text-sm font-semibold transition-colors"
            >
              Nastavi s kupovinom
              <span>
                <MdOutlineShoppingCart className="text-cyan-300" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: items + billing */}
        <div className="lg:col-span-8 space-y-6">
          {/* Items card */}
          <div className="rounded-3xl border border-cyan-500/50 bg-zinc-800/50 backdrop-blur-xl shadow-[0_0_45px_rgba(15,23,42,0.9)] p-4 md:p-6">
            <h2 className="text-lg font-semibold mb-4 text-cyan-400 tracking-tight">
              Stavke narudžbe
            </h2>

            <div className="divide-y divide-zinc-800/80">
              {order.line_items.map((li) => {
                const imgSrc =
                  li.image &&
                  (Array.isArray(li.image) ? li.image[0]?.src : li.image.src);

                const quantity = li.quantity || 1;
                const pid = li.product_id;

                const info = pid ? priceMap[pid] : undefined;

                const unitEffective =
                  info?.effective ??
                  (quantity > 0
                    ? toNumber(li.total) / quantity
                    : toNumber(li.total));

                const unitRegular =
                  info?.regular && info.regular > 0
                    ? info.regular
                    : unitEffective;

                const discountPercent =
                  info?.discountPercent ??
                  (unitRegular > 0 && unitEffective < unitRegular
                    ? Math.round(
                        ((unitRegular - unitEffective) / unitRegular) * 100
                      )
                    : 0);

                const lineTotal = unitEffective * quantity;
                const lineRegularTotal = unitRegular * quantity;

                return (
                  <div key={li.id} className="py-4 flex items-center gap-4">
                    {/* Product image */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden bg-zinc-950/90 border border-zinc-700/80">
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
                      <p className="font-semibold text-sm md:text-base truncate text-zinc-100">
                        {li.name}
                      </p>

                      {li.sku && (
                        <p className="text-[11px] md:text-xs text-zinc-400">
                          SKU:{" "}
                          <span className="font-medium text-zinc-200">
                            {li.sku}
                          </span>
                        </p>
                      )}

                      <p className="text-xs md:text-sm text-zinc-400 mt-1">
                        Količina:{" "}
                        <span className="font-medium text-zinc-100">
                          {quantity}
                        </span>
                      </p>
                    </div>

                    {/* Line total (B2B aware) */}
                    <div className="text-right">
                      {discountPercent > 0 && (
                        <p className="text-[11px] line-through text-zinc-500">
                          {formatMoney(lineRegularTotal, order.currency)}
                        </p>
                      )}

                      <p className="text-sm md:text-base font-semibold text-cyan-300">
                        {formatMoney(lineTotal, order.currency)}
                      </p>

                      {discountPercent > 0 && (
                        <p className="text-[10px] text-fuchsia-200 mt-0.5">
                          -{discountPercent.toFixed(0)}% B2B cijena
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Billing card */}
          <div className="rounded-3xl border border-cyan-500/40 bg-zinc-800/50 backdrop-blur-xl shadow-[0_0_35px_rgba(15,23,42,0.85)] p-4 md:p-6">
            <h2 className="text-lg font-semibold mb-4 text-cyan-400 tracking-tight">
              Podaci o naplati
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-cyan-500">Kupac</p>
                {order.billing.company?.trim() ? (
                  <>
                    <p className="font-semibold text-zinc-100">
                      {order.billing.company}
                    </p>
                    <p className="text-sm text-zinc-300">
                      {order.billing.first_name} {order.billing.last_name}
                    </p>
                  </>
                ) : (
                  <p className="font-semibold text-zinc-100">
                    {order.billing.first_name} {order.billing.last_name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-cyan-500">Email</p>
                <p className="font-semibold break-all text-zinc-100">
                  {order.billing.email}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className="text-cyan-500">Adresa</p>
                <p className="font-semibold text-zinc-100">
                  {order.billing.address_1}, {order.billing.city}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className="text-cyan-500">Telefon</p>
                <p className="font-semibold text-zinc-100">
                  {order.billing.phone}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className="text-cyan-500">Napomena:</p>
                {order.customer_note?.trim() ? (
                  <p className="font-semibold text-zinc-100">
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
            <div className="rounded-3xl border border-cyan-500/50 bg-zinc-800/50 backdrop-blur-xl p-4 md:p-6 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
              <h2 className="text-lg font-semibold mb-4 text-cyan-400 tracking-tight">
                Sažetak
              </h2>

              {(() => {
                const shippingNumber = toNumber(order.shipping_total);
                const computedTotal = itemsSubtotal + shippingNumber;

                return (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Međuzbir</span>
                      <span className="font-semibold text-zinc-100">
                        {formatMoney(itemsSubtotal, order.currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Dostava</span>
                      <span className="font-semibold text-zinc-100">
                        {formatMoney(order.shipping_total, order.currency)}
                        {shippingNumber === 0 && " (B2B besplatna dostava)"}
                      </span>
                    </div>

                    <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
                      <span className="text-base font-semibold text-cyan-300">
                        Ukupno
                      </span>
                      <span className="text-base font-extrabold text-cyan-400">
                        {formatMoney(computedTotal, order.currency)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-5 text-sm font-semibold text-zinc-100 tracking-tight">
                Ako imate pitanja oko narudžbe, slobodno nas kontaktirajte na{" "}
                <span className="text-cyan-300">prodaja@zivic-elektro.com</span>
              </div>

              <div className="mt-4">
                <Link
                  href="/products"
                  className="w-full inline-flex items-center justify-center rounded-full bg-cyan-500/90 hover:bg-cyan-400 cursor-pointer border border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.6)] gap-2 text-cyan-950 px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Nazad na trgovinu
                  <span>
                    <MdOutlineShoppingCart />
                  </span>
                </Link>
              </div>
            </div>

            {/* Optional info mini-card */}
            <div className="rounded-3xl border border-cyan-500/30 bg-zinc-800/50 backdrop-blur-xl p-4 md:p-5 text-sm shadow-[0_0_30px_rgba(15,23,42,0.8)]">
              <p className="font-semibold mb-1 text-cyan-400">
                Status narudžbe
              </p>
              <p className="text-zinc-300">
                Trenutni status:{" "}
                <span className="font-semibold">{order.status}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
