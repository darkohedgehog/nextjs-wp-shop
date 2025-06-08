// app/checkout/page.tsx
'use client';

import { useCart } from '@/store/cart';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

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
    return <p className="p-4">Košarica je prazna.</p>;
  }

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const grandTotal = itemsTotal + shippingCost;

  return (
    <form onSubmit={handleCheckout} className="p-4 max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Podaci o naplati</h2>
      <div className="grid grid-cols-2 gap-4">
        <input
          name="first_name" value={billing.first_name} onChange={handleBillingChange}
          required placeholder="Ime" className="border p-2 rounded w-full" />
        <input
          name="last_name" value={billing.last_name} onChange={handleBillingChange}
          required placeholder="Prezime" className="border p-2 rounded w-full" />
        <input
          name="email" type="email" value={billing.email} onChange={handleBillingChange}
          required placeholder="Email" className="border p-2 rounded w-full col-span-2" />
        <input
          name="phone" type="tel" value={billing.phone} onChange={handleBillingChange}
          required placeholder="Telefon" className="border p-2 rounded w-full col-span-2" />
        <input
          name="address_1" value={billing.address_1} onChange={handleBillingChange}
          required placeholder="Adresa" className="border p-2 rounded w-full col-span-2" />
        <input
          name="address_2" value={billing.address_2} onChange={handleBillingChange}
          placeholder="Adresa 2 (opcionalno)" className="border p-2 rounded w-full col-span-2" />
        <input
          name="city" value={billing.city} onChange={handleBillingChange}
          required placeholder="Grad" className="border p-2 rounded w-full" />
        <input
          name="state" value={billing.state} onChange={handleBillingChange}
          required placeholder="Županija/Država" className="border p-2 rounded w-full" />
        <input
          name="postcode" value={billing.postcode} onChange={handleBillingChange}
          required placeholder="Poštanski broj" className="border p-2 rounded w-full" />
        <input
          name="country" value={billing.country} onChange={handleBillingChange}
          required placeholder="Država (npr. HR)" className="border p-2 rounded w-full" />
      </div>

      <div className="flex items-center space-x-2">
        <input id="sameAsBilling" type="checkbox" checked={sameAsBilling}
          onChange={handleSame} className="h-4 w-4" />
        <label htmlFor="sameAsBilling">Ista adresa za dostavu</label>
      </div>

      {!sameAsBilling && (
        <>
          <h2 className="text-2xl font-semibold mt-6">Podaci o dostavi</h2>
          <div className="grid grid-cols-2 gap-4">
            <input name="first_name" value={shipping.first_name} onChange={handleShippingChange}
              required placeholder="Ime (dostava)" className="border p-2 rounded w-full" />
            <input name="last_name" value={shipping.last_name} onChange={handleShippingChange}
              required placeholder="Prezime (dostava)" className="border p-2 rounded w-full" />
            <input name="address_1" value={shipping.address_1} onChange={handleShippingChange}
              required placeholder="Adresa (dostava)" className="border p-2 rounded w-full col-span-2" />
            <input name="address_2" value={shipping.address_2} onChange={handleShippingChange}
              placeholder="Adresa 2 (dostava)" className="border p-2 rounded w-full col-span-2" />
            <input name="city" value={shipping.city} onChange={handleShippingChange}
              required placeholder="Grad (dostava)" className="border p-2 rounded w-full" />
            <input name="state" value={shipping.state} onChange={handleShippingChange}
              required placeholder="Županija/Država (dostava)" className="border p-2 rounded w-full" />
            <input name="postcode" value={shipping.postcode} onChange={handleShippingChange}
              required placeholder="Poštanski broj (dostava)" className="border p-2 rounded w-full" />
            <input name="country" value={shipping.country} onChange={handleShippingChange}
              required placeholder="Država (dostava)" className="border p-2 rounded w-full" />
          </div>
        </>
      )}
        {/* … billing/shipping polja … */}

  <h2 className="text-xl font-semibold">Način plaćanja</h2>
  <div className="space-y-2">
    <label className="inline-flex items-center">
      <input
        type="radio"
        name="payment_method"
        value="cod"
        checked={paymentMethod === 'cod'}
        onChange={() => setPaymentMethod('cod')}
        className="mr-2"
      />
      Cash on Delivery
    </label>
    <label className="inline-flex items-center">
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

  {/* … summary i dugme … */}


      {/* Summary */}
      <div className="border p-4 rounded">
        <p>Stavke: {itemsTotal.toFixed(2)} €</p>
        <p>Dostava: {shippingCost.toFixed(2)} €</p>
        <p className="font-bold">Ukupno: {grandTotal.toFixed(2)} €</p>
      </div>

      <button type="submit" disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded w-full disabled:opacity-50">
        {loading ? 'Obrađujem...' : 'Završi narudžbu'}
      </button>
      {error && <p className="mt-4 text-red-600">Greška: {error}</p>}
    </form>
  );
}
