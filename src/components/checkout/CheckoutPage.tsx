'use client';

import { useCart } from '@/store/cart';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BackButton from '../ui/BackButton';
import { TbEyeCheck, TbMoodSad, TbTruckDelivery } from 'react-icons/tb';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { GiPayMoney } from 'react-icons/gi';
import { LuPackageCheck } from 'react-icons/lu';

// Tip za billing i shipping
type BillingShipping = {
  first_name: string;
  last_name:  string;
  address_1:  string;
  address_2:  string;
  city:       string;
  state:      string;
  postcode:   string;
  country:    string;
  email:      string;
  phone:      string;
};

export default function CheckoutPage() {
  const image = '/assets/Add-to-Cart-amico.svg'
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


  // Inicijalno prazni billing i shipping
  const [billing, setBilling] = useState<BillingShipping>({
    first_name: '', last_name: '', address_1: '', address_2: '',
    city: '', state: '', postcode: '', country: '', email: '', phone: '',
  });
  const [shipping, setShipping] = useState<BillingShipping>({ ...billing });
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Fiksna cijena dostave
  const shippingCost = 4.5;

  // Handleri
  const handleSame = (e: ChangeEvent<HTMLInputElement>) => {
    const chk = e.target.checked;
    setSameAsBilling(chk);
    if (chk) {
      setShipping({ ...billing });
    } else {
      setShipping({
        first_name: '', last_name: '', address_1: '', address_2: '',
        city: '', state: '', postcode: '', country: '', email: '', phone: '',
      });
    }
  };

  const handleBillingChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBilling((b) => ({ ...b, [name]: value }));
    if (sameAsBilling) {
      setShipping((s) => ({ ...s, [name]: value }));
    }
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

    const line_items = items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }));
    const payload = {
      payment_method: paymentMethod,
      payment_method_title: paymentTitleMap[paymentMethod],    
      billing,
      shipping,
      line_items,
      shipping_lines: [
        { method_id: 'flat_rate', method_title: 'Flat Rate', total: shippingCost.toFixed(2) },
      ],
    };

    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      return;
    }

    // uspjeh
    clearCart();
    const orderId = data.id;
    router.push(`/order-success?order_id=${orderId}`);
  };

  if (!items.length) {
    return <div className="p-4 flex flex-col items-center justify-center my-28 gap-3">
      <Image
      src={image}
      alt='Prazna košarica'
      width={200}
      height={200}
      priority 
      className='max-w-2xl h-auto object-cover'/>
      <div className='text-3xl paragraph-color my-24 flex items-center justify-center gap-3'>
        Vaša košarica je prazna
        <span className='text-zinc-300'><TbMoodSad /></span>
      </div>
    <BackButton />
    </div>;
  }

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const grandTotal = itemsTotal + shippingCost;

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
      {/* GRID WRAPPER */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        
        {/* LEFT COLUMN — FORMA */}
        <div
          className="
            space-y-6
            border border-[#adb5bd]
            shadow-lg shadow-[#adb5bd]
            bg-gradient-custom
            rounded-xl
            p-4
            lg:col-span-2
          "
        >
          <div className="text-center text-2xl font-semibold tracking-tight text-zinc-300 md:text-3xl lg:text-3xl flex items-center justify-center gap-2">
            Podaci o naplati
            <span className='primary-color'><IoMdInformationCircleOutline /></span>
          </div>
  
          <div className="grid grid-cols-2 gap-4">
            <input
              name="first_name"
              value={billing.first_name}
              onChange={handleBillingChange}
              required
              placeholder="Ime"
              className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
            />
            <input
              name="last_name"
              value={billing.last_name}
              onChange={handleBillingChange}
              required
              placeholder="Prezime"
              className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
            />
            <input
              name="email"
              type="email"
              value={billing.email}
              onChange={handleBillingChange}
              required
              placeholder="Email"
              className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600 col-span-2"
            />
            <input
              name="phone"
              type="tel"
              value={billing.phone}
              onChange={handleBillingChange}
              required
              placeholder="Telefon"
              className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600 col-span-2"
            />
            <input
              name="address_1"
              value={billing.address_1}
              onChange={handleBillingChange}
              required
              placeholder="Adresa"
              className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600 col-span-2"
            />
            <input
              name="address_2"
              value={billing.address_2}
              onChange={handleBillingChange}
              placeholder="Adresa 2 (opcionalno)"
              className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600 col-span-2"
            />
            <input
              name="city"
              value={billing.city}
              onChange={handleBillingChange}
              required
              placeholder="Grad"
              className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
            />
            <input
              name="state"
              value={billing.state}
              onChange={handleBillingChange}
              required
              placeholder="Županija/Država"
              className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
            />
            <input
              name="postcode"
              value={billing.postcode}
              onChange={handleBillingChange}
              required
              placeholder="Poštanski broj"
              className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
            />
            <input
              name="country"
              value={billing.country}
              onChange={handleBillingChange}
              required
              placeholder="Država (npr. HR)"
              className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
            />
          </div>
  
          <div className="flex items-center space-x-2 text-zinc-900">
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
                <span className='primary-color'><TbTruckDelivery /></span>
              </div>
  
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="first_name"
                  value={shipping.first_name}
                  onChange={handleShippingChange}
                  required
                  placeholder="Ime (dostava)"
                  className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
                />
                <input
                  name="last_name"
                  value={shipping.last_name}
                  onChange={handleShippingChange}
                  required
                  placeholder="Prezime (dostava)"
                  className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
                />
                <input
                  name="address_1"
                  value={shipping.address_1}
                  onChange={handleShippingChange}
                  required
                  placeholder="Adresa (dostava)"
                  className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600 col-span-2"
                />
                <input
                  name="address_2"
                  value={shipping.address_2}
                  onChange={handleShippingChange}
                  placeholder="Adresa 2 (dostava)"
                  className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600 col-span-2"
                />
                <input
                  name="city"
                  value={shipping.city}
                  onChange={handleShippingChange}
                  required
                  placeholder="Grad (dostava)"
                  className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
                />
                <input
                  name="state"
                  value={shipping.state}
                  onChange={handleShippingChange}
                  required
                  placeholder="Županija/Država (dostava)"
                  className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
                />
                <input
                  name="postcode"
                  value={shipping.postcode}
                  onChange={handleShippingChange}
                  required
                  placeholder="Poštanski broj (dostava)"
                  className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
                />
                <input
                  name="country"
                  value={shipping.country}
                  onChange={handleShippingChange}
                  required
                  placeholder="Država (dostava)"
                  className="border p-2 rounded-lg w-full border-[#adb5bd] shadow-sm shadow-[#adb5bd] placeholder:text-zinc-600"
                />
              </div>
            </>
          )}
  
          <div className="text-center text-xl font-semibold tracking-tight text-zinc-300 md:text-2xl lg:text-2xl flex items-center justify-center gap-3 mt-6">
            Način plaćanja
            <span className='primary-color'><GiPayMoney /></span>
          </div>
  
          <div className="space-y-2">
            <label className="inline-flex items-center mr-2 text-zinc-900">
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
          {/* Ako hoćeš da aktiviraš metodu zameni hidden sa inline-flex */}
            <label className="items-center text-zinc-900 hidden">
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
          </div>
        </div>
  
        {/* RIGHT COLUMN — STICKY SUMMARY + BUTTON */}
        <div className="mt-6 lg:mt-0 lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-4">
            
            {/* Summary (tvoj postojeći blok) */}
            <div className="border border-[#adb5bd] shadow-lg shadow-[#adb5bd] bg-gradient-custom rounded-xl p-4 text-blue-600 space-y-3 bg-white/5">
              
              <div className="text-center text-lg font-semibold text-zinc-200 gap-2 flex items-center justify-center">
                Pregled narudžbe
                <span className='primary-color'><TbEyeCheck /></span>
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
                      <p className="text-sm font-semibold text-zinc-100 leading-snug wrap-break-word">
                        {item.name}
                      </p>
  
                      {item.sku && (
                        <p className="text-xs text-zinc-300 mt-0.5">
                          SKU: {item.sku}
                        </p>
                      )}
  
                      <div className="flex items-center justify-between mt-1 text-sm text-zinc-200">
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
                <div className="flex items-center justify-between text-blue-500">
                  <span>Stavke:</span>
                  <span>{itemsTotal.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between text-blue-500">
                  <span>Dostava:</span>
                  <span>{shippingCost.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between font-bold text-base text-primary-color pt-1 border-t border-white/20">
                  <span>Ukupno:</span>
                  <span>{grandTotal.toFixed(2)} €</span>
                </div>
  
                <p className="text-xs text-zinc-400 pt-1">
                  *PDV uključen u cijenu
                </p>
              </div>
            </div>
  
            {/* Submit button */}
            <div className='mt-6'>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#f8f9fa] hover:bg-[#dee2e6] cursor-pointer flex items-center justify-center px-4 py-3 rounded-3xl transition border-2 border-[#adb5bd] shadow-lg shadow-[#adb5bd] gap-2 text-[#007bff] w-full disabled:opacity-50 font-semibold"
            >
              <span><LuPackageCheck /></span>
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
    <div className='mb-10'>
    <BackButton />
    </div>
    </>
  );
}
