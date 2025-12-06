'use client';

import { useCart } from '@/store/cart';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BackButton from '../ui/BackButton';
import { TbEyeCheck, TbMoodSad, TbTruckDelivery } from 'react-icons/tb';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { GiNotebook, GiPayMoney } from 'react-icons/gi';
import { LuPackageCheck } from 'react-icons/lu';

// Tip za billing i shipping
type BillingShipping = {
  first_name: string;
  last_name:  string;
  company:    string;
  address_1:  string;
  address_2:  string;
  city:       string;
  state:      string;
  postcode:   string;
  country:    string;
  email:      string;
  phone:      string;
};

// fiksna dostava za B2C
const BASE_SHIPPING = 5.5;

export default function CheckoutPage() {
  const image     = '/assets/Add-to-Cart-amico.svg';
  const items     = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const router    = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string|null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'cod'|'bacs'>('cod');
  const paymentTitleMap = {
    cod: 'Cash on Delivery',
    bacs: 'Direct Bank Transfer',
  };

  const [note, setNote] = useState('');
  const [isB2B, setIsB2B] = useState(false);

  // ⭐ customerId – da vežemo order za usera u Woo
  const [customerId, setCustomerId] = useState<number | null>(null);

  // Inicijalno prazni billing i shipping
  const [billing, setBilling] = useState<BillingShipping>({
    first_name: '', last_name: '',company: '', address_1: '', address_2: '',
    city: '', state: '', postcode: '', country: '', email: '', phone: '',
  });

  const [shipping, setShipping] = useState<BillingShipping>({
    first_name: '', last_name: '',company: '', address_1: '', address_2: '',
    city: '', state: '', postcode: '', country: '', email: '', phone: '',
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);

  // 🔢 LOKALNI TOTALI – iz cart store-a
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = isB2B ? 0 : BASE_SHIPPING;
  const grandTotal = itemsTotal + shippingCost;

  // ❗ Prefill billing + shipping iz Woo kupca + setCustomerId + B2B flag
  useEffect(() => {
    if (typeof window === 'undefined') return;
  
    const raw = localStorage.getItem('wpUser');
    if (!raw) return;
  
    try {
      const user = JSON.parse(raw);
      const userId = user?.id || user?.data?.id;
      if (!userId) return;
  
      // zapamtimo ID korisnika za order
      setCustomerId(Number(userId));
  
      (async () => {
        try {
          const res = await fetch(`/api/customer/${userId}`);
          if (!res.ok) return;
  
          const customer: any = await res.json();
          const b = customer.billing || {};
  
          const filledBilling: BillingShipping = {
            first_name: b.first_name || '',
            last_name:  b.last_name  || '',
            company:    b.company    || '',
            address_1:  b.address_1  || '',
            address_2:  b.address_2  || '',
            city:       b.city       || '',
            state:      b.state      || '',
            postcode:   b.postcode   || '',
            country:    b.country    || '',
            email:      b.email      || user.email || '',
            phone:      b.phone      || '',
          };
  
          setBilling(filledBilling);
  
          if (sameAsBilling) {
            setShipping(filledBilling);
          }
  
          let userIsB2B = false;
          if (Array.isArray(customer.meta_data)) {
            const flagMeta = customer.meta_data.find(
              (m: any) => m.key === 'b2bking_b2buser'
            );
            const flag = String(flagMeta?.value ?? '').toLowerCase();
            userIsB2B =
              flag === 'yes' ||
              flag === '1'   ||
              flag === 'true';
          }

          setIsB2B(userIsB2B);
          if (userIsB2B) {
            setPaymentMethod('bacs');
          }

          const defaultNote = customer.meta_data?.find(
            (m: any) => m.key === 'default_note'
          )?.value;
  
          if (defaultNote && !note) {
            setNote(defaultNote);
          }
        } catch (err) {
          console.error('Greška pri dohvaćanju kupca:', err);
        }
      })();
    } catch (e) {
      console.error('Nevažeći wpUser u localStorage-u');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handleri
  const handleSame = (e: ChangeEvent<HTMLInputElement>) => {
    const chk = e.target.checked;
    setSameAsBilling(chk);
    if (chk) {
      setShipping({ ...billing });
    } else {
      setShipping({
        first_name: '', last_name: '',company: '', address_1: '', address_2: '',
        city: '', state: '', postcode: '', country: '', email: '', phone: '',
      });
    }
  };

  const handleBillingChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBilling((b) => {
      const updated = { ...b, [name]: value };
      if (sameAsBilling) {
        setShipping((s) => ({ ...s, [name]: value }));
      }
      return updated;
    });
  };

  const handleShippingChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShipping((s) => ({ ...s, [name]: value }));
  };

  // Checkout submit
  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    const line_items = items.map((i) => ({
      product_id: i.product_id,
      quantity:   i.quantity,
    }));
  
    const payload = {
      customer_id: customerId ?? undefined,
      payment_method:        paymentMethod,
      payment_method_title:  paymentTitleMap[paymentMethod],
      billing,
      shipping,
      line_items,
      customer_note: note,
      shipping_lines: [
        {
          method_id:    'flat_rate',
          method_title: 'Flat Rate',
          total:        shippingCost.toFixed(2), // 👈 B2B = 0.00, B2C = 4.50
        },
      ],
    };
  
    const res  = await fetch('/api/create-order', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
  
    const data = await res.json();
    setLoading(false);
  
    if (!res.ok) {
      setError(
        typeof data.error === 'string'
          ? data.error
          : JSON.stringify(data.error)
      );
      return;
    }
  
    clearCart();
    const orderId = data.id;
    router.push(`/order-success?order_id=${orderId}`);
  };

  if (!items.length) {
    return (
      <div className="p-4 flex flex-col items-center justify-center my-28 gap-3">
        <Image
          src={image}
          alt="Prazna košarica"
          width={200}
          height={200}
          priority
          className="max-w-2xl h-auto object-cover"
        />
        <div className="text-3xl paragraph-color my-24 flex items-center justify-center gap-3">
          Vaša košarica je prazna
          <span className="text-zinc-300">
            <TbMoodSad />
          </span>
        </div>
        <BackButton />
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleCheckout}
        className="
          p-4
          max-w-lg lg:max-w-5xl
          mx-2 lg:mx-auto
          my-20
        "
      >
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* LEFT COLUMN — FORMA */}
          <div
            className="
              space-y-6
              border border-[#adb5bd]/70
              bg-linear-to-br from-zinc-900/20 via-zinc-900/10 to-zinc-800/20
              rounded-2xl
              shadow-[0_20px_60px_rgba(0,0,0,0.45)]
              backdrop-blur-md
              p-4
              lg:col-span-2
            "
          >
            <div className="text-center text-2xl font-semibold tracking-tight text-zinc-300 md:text-3xl lg:text-3xl flex items-center justify-center gap-2">
              Podaci o naplati
              <span className="text-cyan-400">
                <IoMdInformationCircleOutline />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-cyan-200">
              <input
                name="first_name"
                value={billing.first_name}
                onChange={handleBillingChange}
                required
                placeholder="Ime"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
              />
              <input
                name="last_name"
                value={billing.last_name}
                onChange={handleBillingChange}
                required
                placeholder="Prezime"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
              />
              <input
                name="company"
                value={billing.company}
                onChange={handleBillingChange}
                placeholder="Naziv firme (R1)"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400 col-span-2"
              />
              <input
                name="email"
                type="email"
                value={billing.email}
                onChange={handleBillingChange}
                required
                placeholder="Email"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400 col-span-2"
              />
              <input
                name="phone"
                type="tel"
                value={billing.phone}
                onChange={handleBillingChange}
                required
                placeholder="Telefon"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400 col-span-2"
              />
              <input
                name="address_1"
                value={billing.address_1}
                onChange={handleBillingChange}
                required
                placeholder="Adresa"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400 col-span-2"
              />
              <input
                name="address_2"
                value={billing.address_2}
                onChange={handleBillingChange}
                placeholder="Adresa 2 (opcionalno)"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400 col-span-2"
              />
              <input
                name="city"
                value={billing.city}
                onChange={handleBillingChange}
                required
                placeholder="Grad"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
              />
              <input
                name="state"
                value={billing.state}
                onChange={handleBillingChange}
                required
                placeholder="Županija/Država"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
              />
              <input
                name="postcode"
                value={billing.postcode}
                onChange={handleBillingChange}
                required
                placeholder="Poštanski broj"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
              />
              <input
                name="country"
                value={billing.country}
                onChange={handleBillingChange}
                required
                placeholder="Država (npr. HR)"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
              />
            </div>

            <div className="flex items-center space-x-2 text-zinc-200">
              <input
                id="sameAsBilling"
                type="checkbox"
                checked={sameAsBilling}
                onChange={handleSame}
                className="h-4 w-4"
              />
              <label htmlFor="sameAsBilling">Ista adresa za dostavu</label>
            </div>

            {!sameAsBilling && (
              <>
                <div className="text-center text-xl font-semibold tracking-tight text-zinc-300 md:text-2xl lg:text-2xl flex items-center justify-center gap-3 mt-6">
                  Podaci o dostavi
                  <span className="text-cyan-400">
                    <TbTruckDelivery />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-cyan-200">
                  <input
                    name="first_name"
                    value={shipping.first_name}
                    onChange={handleShippingChange}
                    required
                    placeholder="Ime (dostava)"
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
                  />
                  <input
                    name="last_name"
                    value={shipping.last_name}
                    onChange={handleShippingChange}
                    required
                    placeholder="Prezime (dostava)"
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
                  />
                  <input
                    name="company"
                    value={shipping.company}
                    onChange={handleShippingChange}
                    placeholder="Naziv firme (R1)"
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400 col-span-2"
                  />
                  <input
                    name="address_1"
                    value={shipping.address_1}
                    onChange={handleShippingChange}
                    required
                    placeholder="Adresa (dostava)"
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400 col-span-2"
                  />
                  <input
                    name="address_2"
                    value={shipping.address_2}
                    onChange={handleShippingChange}
                    placeholder="Adresa 2 (dostava)"
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400 col-span-2"
                  />
                  <input
                    name="city"
                    value={shipping.city}
                    onChange={handleShippingChange}
                    required
                    placeholder="Grad (dostava)"
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
                  />
                  <input
                    name="state"
                    value={shipping.state}
                    onChange={handleShippingChange}
                    required
                    placeholder="Županija/Država (dostava)"
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
                  />
                  <input
                    name="postcode"
                    value={shipping.postcode}
                    onChange={handleShippingChange}
                    required
                    placeholder="Poštanski broj (dostava)"
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
                  />
                  <input
                    name="country"
                    value={shipping.country}
                    onChange={handleShippingChange}
                    required
                    placeholder="Država (dostava)"
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
                  />
                </div>
              </>
            )}

            <div className="mt-6 space-y-2">
              <div className="text-center text-xl font-semibold tracking-tight text-zinc-300 md:text-2xl lg:text-2xl flex items-center justify-center gap-3">
                Napomena uz narudžbu
                <span className="text-cyan-400">
                  <GiNotebook />
                </span>
              </div>

              <textarea
                name="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Npr. nazvati prije dostave, ostaviti paket kod susjeda, poslati R1 račun…"
                rows={4}
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400 resize-none"
              />
            </div>

            <div className="text-center text-xl font-semibold tracking-tight text-zinc-300 md:text-2xl lg:text-2xl flex items-center justify-center gap-3 mt-6">
              Način plaćanja
              <span className="text-cyan-400">
                <GiPayMoney />
              </span>
            </div>

            <div className="space-y-2">
              <label className="inline-flex items-center mr-2 text-zinc-200">
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mr-2"
                />
                Plaćanje pouzećem
              </label>

              {isB2B && (
                <label className="inline-flex items-center text-zinc-200">
                  <input
                    type="radio"
                    name="payment_method"
                    value="bacs"
                    checked={paymentMethod === 'bacs'}
                    onChange={() => setPaymentMethod('bacs')}
                    className="mr-2"
                  />
                  Direct Bank Transfer
                </label>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — STICKY SUMMARY + BUTTON */}
          <div className="mt-6 lg:mt-0 lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Summary */}
              <div className="border
              border-[#adb5bd]/70
              bg-linear-to-br from-zinc-900/20 via-zinc-900/10 to-zinc-800/20
              rounded-2xl
              shadow-[0_20px_60px_rgba(0,0,0,0.45)]
              backdrop-blur-md p-4 text-blue-600 space-y-3">
                <div className="text-center text-lg font-semibold text-slate-300 gap-2 flex items-center justify-center">
                  Pregled narudžbe
                  <span className="text-cyan-400">
                    <TbEyeCheck />
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-start gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0"
                    >
                      {item.image && item.image.length > 0 && (
                        <Image
                          src={item.image}
                          alt={item.imageAlt || item.name}
                          width={56}
                          height={56}
                          className="rounded-md w-14 h-14 object-cover shrink-0"
                          priority
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-100 leading-snug wrap-break-word">
                          {item.name}
                        </p>

                        {item.sku && (
                          <p className="text-xs text-slate-200 mt-0.5">
                            SKU: {item.sku}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-1 text-sm text-slate-100">
                          <span>
                            {item.quantity} × {item.price.toFixed(2)} €
                          </span>
                          <span className="font-semibold text-zinc-100">
                            {(item.price * item.quantity).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-1 text-sm">
                  <div className="flex items-center justify-between text-cyan-200">
                    <span>Stavke:</span>
                    <span>{itemsTotal.toFixed(2)} €</span>
                  </div>

                  <div className="flex items-center justify-between text-blue-300">
                    <span>Dostava:</span>
                    <span>
                      {shippingCost.toFixed(2)} €
                      {isB2B && ' (B2B besplatna dostava)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-bold text-base text-cyan-400 pt-1 border-t border-cyan-900/50">
                    <span>Ukupno:</span>
                    <span>{grandTotal.toFixed(2)} €</span>
                  </div>

                  <p className="text-sm text-slate-200 pt-1 font-semibold">
                    Ukupno prema cijenama u košarici.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer flex items-center justify-center px-4 py-3 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff] w-full disabled:opacity-50 font-semibold"
                >
                  <span>
                    <LuPackageCheck />
                  </span>
                  {loading ? 'Obrađujem...' : 'Završi narudžbu'}
                </button>
              </div>

              {error && (
                <p className="text-red-600 flex items-center justify-center text-sm">
                  Greška: {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
      <div className="mb-10">
        <BackButton />
      </div>
    </>
  );
}