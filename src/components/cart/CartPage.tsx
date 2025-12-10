'use client';

import { useCart } from '@/store/cart';
import Link from 'next/link';
import Image from 'next/image';
import CartQty from './CartQty';
import { TiShoppingCart } from 'react-icons/ti';
import BackButton from '../ui/BackButton';
import { GiPayMoney } from 'react-icons/gi';
import { TbMoodSad } from 'react-icons/tb';
import { useEffect, useState } from 'react';

const SHIPPING_FALLBACK = 5.5;

// Tipovi za customer response iz Woo
type CustomerMeta = {
  key?: string;
  value?: unknown;
};

type CustomerResponse = {
  meta_data?: CustomerMeta[];
};

export default function CartPage() {
  const items = useCart((s) => s.items);
  const image = '/assets/Add-to-Cart-amico.svg';

  // B2B flag – određuje shipping = 0 ili 5.5
  const [isB2B, setIsB2B] = useState(false);

  // Detekcija B2B korisnika
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem('wpUser');
      if (!raw) {
        // već je false po defaultu, nema potrebe da ga setujemo
        return;
      }

      const user = JSON.parse(raw);
      const userId = user?.id ?? user?.data?.id;

      if (!userId) {
        // opet: default je false
        return;
      }

      (async () => {
        try {
          const res = await fetch(`/api/customer/${userId}`);
          if (!res.ok) {
            // neuspeh → ostaje false
            return;
          }

          const customer: CustomerResponse = await res.json();

          let userIsB2B = false;
          if (Array.isArray(customer.meta_data)) {
            const flagMeta = customer.meta_data.find(
              (m) => m.key === 'b2bking_b2buser'
            );

            const flag = String(flagMeta?.value ?? '').toLowerCase();

            userIsB2B =
              flag === 'yes' ||
              flag === '1' ||
              flag === 'true';
          }

          if (userIsB2B) {
            setIsB2B(true);
          } else {
            // ako hoćeš baš eksplicitno reset, može i ovde:
            setIsB2B(false);
          }
        } catch (err) {
          console.error('Greška pri dohvaćanju kupca za CartPage:', err);
          // greška → ostavi false
        }
      })();
    } catch (err) {
      console.error('Nevažeći wpUser u localStorage-u (CartPage)', err);
      // parsing fail → ostavi false
    }
  }, []);

  // Lokalni total – cijene u items već dolaze kao effective price
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const shipping = isB2B ? 0 : SHIPPING_FALLBACK;
  const grandTotal = itemsTotal + shipping;

  // --- EMPTY STATE u saas stilu ---
  if (!items.length) {
    return (
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-20 flex flex-col items-center gap-6">
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400/70">
              Košarica
            </span>
            <span className="text-xs text-zinc-500">
              Web shop · Živić elektro materijal
            </span>
          </div>
          <BackButton />
        </div>

        <div className="w-full max-w-xl rounded-3xl border border-cyan-500/80 bg-zinc-900/60 backdrop-blur-xl shadow-[0_0_60px_rgba(56,189,248,0.18)] shadow-cyan-500/30 px-6 py-10 flex flex-col items-center gap-6">
          <Image
            src={image}
            alt="Prazna košarica"
            width={220}
            height={220}
            priority
            className="h-auto object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]"
          />
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="flex items-center gap-2 text-2xl md:text-3xl font-semibold text-zinc-50">
              Vaša košarica je prazna
              <span className="text-zinc-300">
                <TbMoodSad />
              </span>
            </p>
            <p className="text-sm text-zinc-400 max-w-sm">
              Dodajte proizvode u košaricu kako biste nastavili na plaćanje.
            </p>
          </div>

          <Link href="/categories">
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-cyan-500/60 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/20 hover:border-cyan-300 transition-colors"
            >
              <TiShoppingCart className="text-cyan-300" />
              Pogledaj proizvode
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // --- NORMALAN CART VIEW ---
  return (
    <div className="max-w-5xl mx-auto px-4 pb-16 pt-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.2em] text-cyan-400/70">
            Košarica
          </span>
          <span className="text-xs text-zinc-500">
            Web shop · Živić elektro materijal
          </span>
        </div>
        <BackButton />
      </div>

      {/* Naslov */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50 flex items-center gap-2">
          Vaša košarica
          <TiShoppingCart className="text-cyan-300" />
        </h1>
        <span className="text-xs text-zinc-300 mt-1">
          ({items.length} {items.length === 1 ? 'stavka' : 'stavki'})
        </span>
      </div>

      {/* Glavni grid: lijevo stavke, desno sažetak */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        {/* LEFT: items card */}
        <div className="rounded-3xl border border-cyan-500/50 bg-zinc-900/50 backdrop-blur-xl shadow-[0_0_45px_rgba(15,23,42,0.9)] px-4 py-4 md:px-6 md:py-6">
          <div className="space-y-4">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;

              return (
                <div
                  key={item.product_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-cyan-500/50 rounded-2xl bg-zinc-900/60 px-3 py-3 md:px-4 md:py-4"
                >
                  {/* LEFT SIDE: image + info */}
                  <div className="flex items-start gap-3 sm:gap-4 w-full">
                    {item.image && item.image.length > 0 && (
                      <div className="shrink-0">
                        <Image
                          src={item.image}
                          alt={item.imageAlt || item.name}
                          width={80}
                          height={80}
                          priority
                          className="object-contain rounded-xl w-20 h-20 bg-zinc-950/80 border border-zinc-800"
                        />
                      </div>
                    )}

                    {/* INFO + mobile qty */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <h2 className="font-semibold text-zinc-50 leading-snug wrap-break-word">
                        {item.name}
                      </h2>

                      {item.sku && (
                        <p className="text-[11px] text-zinc-400">
                          SKU:{' '}
                          <span className="text-zinc-200 font-medium">
                            {item.sku}
                          </span>
                        </p>
                      )}
                      {item.ean && (
                        <p className="text-[11px] text-zinc-400">
                          Barcode:{' '}
                          <span className="text-zinc-200 font-medium">
                            {item.ean}
                          </span>
                        </p>
                      )}

                      <p className="text-sm text-cyan-200">
                        {item.price.toFixed(2)} € × {item.quantity} ={' '}
                        <span className="font-semibold text-cyan-300">
                          {lineTotal.toFixed(2)} €
                        </span>
                      </p>

                      {/* MOBILE CartQty (ispod info) */}
                      <div className="mt-2 sm:hidden">
                        <CartQty product_id={item.product_id} />
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP CartQty (desno) */}
                  <div className="hidden sm:block">
                    <CartQty product_id={item.product_id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: totals + CTA */}
        <div className="space-y-4">
          {/* Sažetak */}
          <div className="rounded-3xl border border-cyan-500/50 bg-zinc-900/60 backdrop-blur-xl px-4 py-5 md:px-5 md:py-6 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-500 mb-4">
              Sažetak narudžbe
            </h2>

            <div className="space-y-2 text-sm text-zinc-200">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Stavke</span>
                <span>{itemsTotal.toFixed(2)} €</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Dostava</span>
                <span>
                  {shipping.toFixed(2)} €
                  {isB2B && (
                    <span className="ml-1 text-[11px] text-emerald-300">
                      (B2B besplatna dostava)
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-800 mt-2 font-semibold">
                <span className="text-zinc-200">Ukupno</span>
                <span className="text-cyan-300">
                  {grandTotal.toFixed(2)} €
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 mt-2">
                * PDV je uključen u cijenu.
              </p>
            </div>
          </div>

          {/* Dugme ka checkout-u */}
          <div className="rounded-3xl border border-cyan-500/50 bg-cyan-500/10 px-4 py-4 flex flex-col gap-3">
            <p className="text-xs text-cyan-100/80">
              Spremni ste za plaćanje? Pregledajte narudžbu na sljedećem
              koraku.
            </p>
            <Link href="/checkout" className="w-full">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500/90 hover:bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-cyan-950 shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-colors"
              >
                <GiPayMoney className="w-5 h-5" />
                Plaćanje
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}