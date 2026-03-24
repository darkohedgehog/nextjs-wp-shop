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
import Link from 'next/link';

type BillingShipping = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
};

type CustomerMeta = {
  key?: string;
  value?: unknown;
};

type CustomerBilling = {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
};

type Customer = {
  id?: number;
  email?: string;
  billing?: CustomerBilling;
  meta_data?: CustomerMeta[];
};

type PaymentMethod = 'cod' | 'bacs' | 'stripe';

type CreateOrderResponse = {
  id?: number | string;
  error?: unknown;
};

const BASE_SHIPPING = 5.5;
const WC_BASE_URL = process.env.NEXT_PUBLIC_WC_BASE_URL;

const CROATIA_COUNTRIES = [{ value: 'HR', label: 'Hrvatska' }];

const CROATIA_COUNTIES = [
  { value: 'HR-01', label: 'Zagrebačka županija' },
  { value: 'HR-02', label: 'Krapinsko-zagorska županija' },
  { value: 'HR-03', label: 'Sisačko-moslavačka županija' },
  { value: 'HR-04', label: 'Karlovačka županija' },
  { value: 'HR-05', label: 'Varaždinska županija' },
  { value: 'HR-06', label: 'Koprivničko-križevačka županija' },
  { value: 'HR-07', label: 'Bjelovarsko-bilogorska županija' },
  { value: 'HR-08', label: 'Primorsko-goranska županija' },
  { value: 'HR-09', label: 'Ličko-senjska županija' },
  { value: 'HR-10', label: 'Virovitičko-podravska županija' },
  { value: 'HR-11', label: 'Požeško-slavonska županija' },
  { value: 'HR-12', label: 'Brodsko-posavska županija' },
  { value: 'HR-13', label: 'Zadarska županija' },
  { value: 'HR-14', label: 'Osječko-baranjska županija' },
  { value: 'HR-15', label: 'Šibensko-kninska županija' },
  { value: 'HR-16', label: 'Vukovarsko-srijemska županija' },
  { value: 'HR-17', label: 'Splitsko-dalmatinska županija' },
  { value: 'HR-18', label: 'Istarska županija' },
  { value: 'HR-19', label: 'Dubrovačko-neretvanska županija' },
  { value: 'HR-20', label: 'Međimurska županija' },
  { value: 'HR-21', label: 'Grad Zagreb' },
] as const;

const COUNTY_LABEL_TO_CODE = CROATIA_COUNTIES.reduce<Record<string, string>>(
  (acc, county) => {
    acc[county.label.toLowerCase()] = county.value;
    return acc;
  },
  {},
);

function normalizeCountry(value?: string | null): string {
  const raw = String(value ?? '').trim().toUpperCase();

  if (!raw) return 'HR';
  if (raw === 'HR') return 'HR';
  if (raw === 'HRVATSKA' || raw === 'CROATIA') return 'HR';

  return 'HR';
}

function normalizeState(value?: string | null): string {
  const raw = String(value ?? '').trim();

  if (!raw) return '';

  const upper = raw.toUpperCase();
  if (CROATIA_COUNTIES.some((county) => county.value === upper)) {
    return upper;
  }

  const mapped = COUNTY_LABEL_TO_CODE[raw.toLowerCase()];
  if (mapped) {
    return mapped;
  }

  return '';
}

function createEmptyAddress(): BillingShipping {
  return {
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'HR',
    email: '',
    phone: '',
  };
}

export default function CheckoutPage() {
  const image = '/assets/Add-to-Cart-amico.svg';
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const paymentTitleMap = {
    cod: 'Cash on Delivery',
    bacs: 'Direct Bank Transfer',
    stripe: 'Plaćanje karticom',
  } as const;

  const [note, setNote] = useState('');
  const [isB2B, setIsB2B] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [billing, setBilling] = useState<BillingShipping>(createEmptyAddress());
  const [shipping, setShipping] = useState<BillingShipping>(createEmptyAddress());

  const [sameAsBilling, setSameAsBilling] = useState(true);

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = isB2B ? 0 : BASE_SHIPPING;
  const grandTotal = itemsTotal + shippingCost;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem('wpUser');
    if (!raw) return;

    try {
      const user = JSON.parse(raw) as {
        id?: number;
        data?: { id?: number };
        email?: string;
      };

      const userId = user?.id ?? user?.data?.id;
      if (!userId) return;

      setCustomerId(Number(userId));

      (async () => {
        try {
          const res = await fetch(`/api/customer/${userId}`);
          if (!res.ok) return;

          const customer = (await res.json()) as Customer;
          const b = customer.billing ?? {};

          const filledBilling: BillingShipping = {
            first_name: b.first_name ?? '',
            last_name: b.last_name ?? '',
            company: b.company ?? '',
            address_1: b.address_1 ?? '',
            address_2: b.address_2 ?? '',
            city: b.city ?? '',
            state: normalizeState(b.state),
            postcode: b.postcode ?? '',
            country: normalizeCountry(b.country),
            email: b.email ?? user.email ?? '',
            phone: b.phone ?? '',
          };

          setBilling(filledBilling);

          if (sameAsBilling) {
            setShipping(filledBilling);
          }

          let userIsB2B = false;
          if (Array.isArray(customer.meta_data)) {
            const flagMeta = customer.meta_data.find(
              (m: CustomerMeta) => m.key === 'b2bking_b2buser',
            );

            const flag = String(flagMeta?.value ?? '').toLowerCase();
            userIsB2B = flag === 'yes' || flag === '1' || flag === 'true';
          }

          setIsB2B(userIsB2B);
          if (userIsB2B) {
            setPaymentMethod('bacs');
          }

          const defaultNoteMeta = customer.meta_data?.find(
            (m: CustomerMeta) => m.key === 'default_note',
          );

          const defaultNote =
            typeof defaultNoteMeta?.value === 'string'
              ? defaultNoteMeta.value
              : undefined;

          if (defaultNote && !note) {
            setNote(defaultNote);
          }
        } catch (err) {
          console.error('Greška pri dohvaćanju kupca:', err);
        }
      })();
    } catch (e) {
      console.error('Nevažeći wpUser u localStorage-u', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSame = (e: ChangeEvent<HTMLInputElement>) => {
    const chk = e.target.checked;
    setSameAsBilling(chk);

    if (chk) {
      setShipping({ ...billing });
    } else {
      setShipping(createEmptyAddress());
    }
  };

  const handleBillingChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setBilling((b) => {
      const updated: BillingShipping = { ...b, [name]: value };

      if (sameAsBilling) {
        setShipping((s) => ({ ...s, [name]: value }));
      }

      return updated;
    });
  };

  const handleShippingChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setShipping((s) => ({ ...s, [name]: value }));
  };

  const submitStripeToWordPress = () => {
    if (!WC_BASE_URL) {
      setLoading(false);
      setError('Nedostaje NEXT_PUBLIC_WC_BASE_URL.');
      return;
    }

    const payload = {
      customer_id: customerId ?? undefined,
      billing,
      shipping,
      items: items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
      customer_note: note,
      accepted_terms: acceptedTerms,
    };

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${WC_BASE_URL.replace(/\/$/, '')}/wp-admin/admin-post.php?action=wc_next_prepare_checkout`;
    form.style.display = 'none';

    const payloadInput = document.createElement('input');
    payloadInput.type = 'hidden';
    payloadInput.name = 'checkout_payload';
    payloadInput.value = JSON.stringify(payload);
    form.appendChild(payloadInput);

    document.body.appendChild(form);
    form.submit();
  };

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setError('Morate prihvatiti uvjete korištenja kako biste završili narudžbu.');
      return;
    }

    setLoading(true);
    setError(null);

    if (paymentMethod === 'stripe') {
      submitStripeToWordPress();
      return;
    }

    const line_items = items.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
    }));

    const payload = {
      customer_id: customerId ?? undefined,
      payment_method: paymentMethod,
      payment_method_title: paymentTitleMap[paymentMethod],
      billing,
      shipping,
      line_items,
      customer_note: note,
      accepted_terms: acceptedTerms,
      shipping_lines: [
        {
          method_id: 'flat_rate',
          method_title: 'Flat Rate',
          total: shippingCost.toFixed(2),
        },
      ],
    };

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as CreateOrderResponse;
      setLoading(false);

      if (!res.ok) {
        setError(
          typeof data.error === 'string'
            ? data.error
            : JSON.stringify(data.error),
        );
        return;
      }

      clearCart();
      router.push(`/order-success?order_id=${data.id}`);
    } catch (err) {
      setLoading(false);
      setError('Došlo je do greške prilikom slanja narudžbe.');
      console.error(err);
    }
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
        className="p-4 max-w-lg lg:max-w-5xl mx-2 lg:mx-auto my-20"
      >
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          <div
            className="
              space-y-6
              border border-[#adb5bd]/70
              bg-linear-to-br from-zinc-900/50 via-zinc-900/30 to-zinc-800/50
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

              <select
                name="state"
                value={billing.state}
                onChange={handleBillingChange}
                required
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] bg-zinc-900 text-cyan-200"
              >
                <option value="">Odaberite županiju</option>
                {CROATIA_COUNTIES.map((county) => (
                  <option key={county.value} value={county.value}>
                    {county.label}
                  </option>
                ))}
              </select>

              <input
                name="postcode"
                value={billing.postcode}
                onChange={handleBillingChange}
                required
                placeholder="Poštanski broj"
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
              />

              <select
                name="country"
                value={billing.country}
                onChange={handleBillingChange}
                required
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] bg-zinc-900 text-cyan-200"
              >
                {CROATIA_COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
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

                  <select
                    name="state"
                    value={shipping.state}
                    onChange={handleShippingChange}
                    required
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] bg-zinc-900 text-cyan-200"
                  >
                    <option value="">Odaberite županiju</option>
                    {CROATIA_COUNTIES.map((county) => (
                      <option key={county.value} value={county.value}>
                        {county.label}
                      </option>
                    ))}
                  </select>

                  <input
                    name="postcode"
                    value={shipping.postcode}
                    onChange={handleShippingChange}
                    required
                    placeholder="Poštanski broj (dostava)"
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400"
                  />

                  <select
                    name="country"
                    value={shipping.country}
                    onChange={handleShippingChange}
                    required
                    className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] bg-zinc-900 text-cyan-200"
                  >
                    {CROATIA_COUNTRIES.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
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
                className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-400 resize-none text-cyan-200"
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

              {!isB2B && (
                <label className="inline-flex items-center text-zinc-200">
                  <input
                    type="radio"
                    name="payment_method"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                    className="mr-2"
                  />
                  Plaćanje karticom
                </label>
              )}

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

          <div className="mt-6 lg:mt-0 lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="border border-[#adb5bd]/70 bg-linear-to-br from-zinc-900/50 via-zinc-900/30 to-zinc-800/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md p-4 text-blue-600 space-y-3">
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
                        {item.ean && (
                          <p className="text-xs text-slate-200 mt-0.5">
                            Barcode: {item.ean}
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

              <div className="border border-[#adb5bd]/70 bg-linear-to-br from-zinc-900/50 via-zinc-900/30 to-zinc-800/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md p-4">
                <div className="flex items-start gap-3 text-zinc-200">
                  <input
                    id="terms"
                    type="checkbox"
                    name="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 shrink-0"
                  />
                  <label htmlFor="terms" className="text-sm leading-6">
                    Slažem se s{' '}
                    <Link
                      href="/terms"
                      className="underline text-sky-200 hover:text-cyan-400 transition-colors"
                    >
                      uvjetima korištenja
                    </Link>
                    .
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || !acceptedTerms}
                  className="bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer flex items-center justify-center px-4 py-3 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff] w-full disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <span>
                    <LuPackageCheck />
                  </span>
                  {loading
                    ? 'Obrađujem...'
                    : paymentMethod === 'stripe'
                      ? 'Plati karticom'
                      : 'Završi narudžbu'}
                </button>
              </div>

              {error && (
                <p className="text-red-600 flex items-center justify-center text-sm text-center">
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