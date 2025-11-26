// app/my-account/b2b-register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function B2BRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    company_name: '',
    company_vat: '',
    company_oib: '',
    company_phone: '',
    company_address: '',
    company_city: '',
    company_country: 'HR',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/store-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        isB2B: true,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data?.message || 'Došlo je do greške pri registraciji.');
      return;
    }

    // ovde možeš prikazati poruku tipa:
    // "Nalog je kreiran, čeka odobrenje admina"
    router.push('/my-account/login?pendingApproval=1');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto px-4 py-8 space-y-4 bg-white shadow-lg rounded-xl"
    >
      <h1 className="text-2xl font-bold">B2B registracija</h1>

      {error && <p className="text-red-600">{error}</p>}

      {/* osnovni podaci */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="first_name"
          placeholder="Ime"
          required
          value={form.first_name}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          name="last_name"
          placeholder="Prezime"
          required
          value={form.last_name}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />
      <input
        name="username"
        placeholder="Korisničko ime"
        required
        value={form.username}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />
      <input
        name="password"
        type="password"
        placeholder="Lozinka"
        required
        value={form.password}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />

      {/* podaci o firmi */}
      <input
        name="company_name"
        placeholder="Naziv firme"
        required
        value={form.company_name}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          name="company_oib"
          placeholder="OIB"
          required
          value={form.company_oib}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          name="company_vat"
          placeholder="VAT broj (ako postoji)"
          value={form.company_vat}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          name="company_phone"
          placeholder="Telefon"
          required
          value={form.company_phone}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>
      <input
        name="company_address"
        placeholder="Adresa"
        required
        value={form.company_address}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="company_city"
          placeholder="Grad"
          required
          value={form.company_city}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          name="company_country"
          placeholder="Država"
          required
          value={form.company_country}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-60"
      >
        {loading ? 'Slanje...' : 'Pošalji zahtev za B2B nalog'}
      </button>
    </form>
  );
}