'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LuBriefcase } from 'react-icons/lu';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';

type B2BForm = {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name: string;
  company_vat: string;
  company_oib: string;
  company_phone: string;
  company_address: string;
  company_city: string;
  company_postcode: string;
  company_country: string;
};

export default function B2BRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<B2BForm>({
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
    company_postcode: '',
    company_country: 'HR',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // minimalna validacija
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('Ime i prezime su obavezni.');
      return;
    }
    if (!form.company_name.trim()) {
      setError('Naziv firme je obavezan.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Unesi ispravan email.');
      return;
    }
    if (!form.username.trim()) {
      setError('Korisničko ime je obavezno.');
      return;
    }
    if (form.password.length < 8) {
      setError('Lozinka mora imati najmanje 8 znakova.');
      return;
    }
    if (!form.company_phone.trim()) {
      setError('Telefon je obavezan.');
      return;
    }
    if (!form.company_address.trim() || !form.company_city.trim()) {
      setError('Adresa i grad su obavezni.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/store-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          isB2B: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || 'Došlo je do greške pri registraciji.');
        return;
      }

      // ovde ideš na login i možeš pokazati info da čeka odobrenje
      router.push('/my-account/login?pendingApproval=1');
    } catch (err) {
      console.error(err);
      setError('Došlo je do greške. Pokušajte kasnije.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="B2B registracija"
      subtitle="Popuni podatke o sebi i svojoj firmi. Nakon pregleda, administrator će odobriti tvoj B2B račun."
      icon={<LuBriefcase />}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 md:space-y-7 max-w-2xl mx-auto"
      >
        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-500/50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Osobni podaci */}
        <div className="space-y-3">
          <h2 className="text-sm md:text-base font-semibold text-zinc-200">
            Osobni podaci
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="first_name"
              placeholder="Ime"
              required
              value={form.first_name}
              onChange={handleChange}
              className="
                border border-[#adb5bd]
                bg-zinc-900/70
                text-zinc-100
                rounded-lg
                px-3.5 py-2.5
                shadow-sm shadow-[#adb5bd]/40
                placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                text-sm md:text-base
              "
            />
            <input
              name="last_name"
              placeholder="Prezime"
              required
              value={form.last_name}
              onChange={handleChange}
              className="
                border border-[#adb5bd]
                bg-zinc-900/70
                text-zinc-100
                rounded-lg
                px-3.5 py-2.5
                shadow-sm shadow-[#adb5bd]/40
                placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                text-sm md:text-base
              "
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="email"
              type="email"
              placeholder="Poslovni email"
              required
              value={form.email}
              onChange={handleChange}
              className="
                border border-[#adb5bd]
                bg-zinc-900/70
                text-zinc-100
                rounded-lg
                px-3.5 py-2.5
                shadow-sm shadow-[#adb5bd]/40
                placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                text-sm md:text-base
              "
            />
            <input
              name="username"
              placeholder="Korisničko ime"
              required
              value={form.username}
              onChange={handleChange}
              className="
                border border-[#adb5bd]
                bg-zinc-900/70
                text-zinc-100
                rounded-lg
                px-3.5 py-2.5
                shadow-sm shadow-[#adb5bd]/40
                placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                text-sm md:text-base
              "
            />
          </div>

          {/* Lozinka */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-200">
              Lozinka
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Lozinka (min. 8 znakova)"
                required
                value={form.password}
                onChange={handleChange}
                className="
                  w-full
                  border border-[#adb5bd]
                  bg-zinc-900/70
                  text-zinc-100
                  rounded-lg
                  px-3.5 py-2.5
                  pr-10
                  shadow-sm shadow-[#adb5bd]/40
                  placeholder:text-zinc-500
                  focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                  text-sm md:text-base
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="
                  absolute inset-y-0 right-0
                  flex items-center pr-3
                  text-zinc-400 hover:text-zinc-200
                "
                aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Firma */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h2 className="text-sm md:text-base font-semibold text-zinc-200">
            Podaci o firmi
          </h2>

          <input
            name="company_name"
            placeholder="Naziv firme"
            required
            value={form.company_name}
            onChange={handleChange}
            className="
              w-full
              border border-[#adb5bd]
              bg-zinc-900/70
              text-zinc-100
              rounded-lg
              px-3.5 py-2.5
              shadow-sm shadow-[#adb5bd]/40
              placeholder:text-zinc-500
              focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
              text-sm md:text-base
            "
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="company_oib"
              placeholder="OIB"
              required
              value={form.company_oib}
              onChange={handleChange}
              className="
                border border-[#adb5bd]
                bg-zinc-900/70
                text-zinc-100
                rounded-lg
                px-3.5 py-2.5
                shadow-sm shadow-[#adb5bd]/40
                placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                text-sm md:text-base
              "
            />
            <input
              name="company_vat"
              placeholder="VAT broj (ako postoji)"
              value={form.company_vat}
              onChange={handleChange}
              className="
                border border-[#adb5bd]
                bg-zinc-900/70
                text-zinc-100
                rounded-lg
                px-3.5 py-2.5
                shadow-sm shadow-[#adb5bd]/40
                placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                text-sm md:text-base
              "
            />
            <input
              name="company_phone"
              placeholder="Telefon"
              required
              value={form.company_phone}
              onChange={handleChange}
              className="
                border border-[#adb5bd]
                bg-zinc-900/70
                text-zinc-100
                rounded-lg
                px-3.5 py-2.5
                shadow-sm shadow-[#adb5bd]/40
                placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                text-sm md:text-base
              "
            />
          </div>

          <input
            name="company_address"
            placeholder="Adresa"
            required
            value={form.company_address}
            onChange={handleChange}
            className="
              w-full
              border border-[#adb5bd]
              bg-zinc-900/70
              text-zinc-100
              rounded-lg
              px-3.5 py-2.5
              shadow-sm shadow-[#adb5bd]/40
              placeholder:text-zinc-500
              focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
              text-sm md:text-base
            "
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="company_city"
              placeholder="Grad"
              required
              value={form.company_city}
              onChange={handleChange}
              className="
                border border-[#adb5bd]
                bg-zinc-900/70
                text-zinc-100
                rounded-lg
                px-3.5 py-2.5
                shadow-sm shadow-[#adb5bd]/40
                placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                text-sm md:text-base
              "
            />
            <input
             name="company_postcode"
             placeholder="Poštanski broj"
             required
             value={form.company_postcode}
             onChange={handleChange}
             className="
                border border-[#adb5bd]
                bg-zinc-900/70
                text-zinc-100
                rounded-lg
                px-3.5 py-2.5
                shadow-sm shadow-[#adb5bd]/40
                placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                text-sm md:text-base
              "
            />
            <input
              name="company_country"
              placeholder="Država"
              required
              value={form.company_country}
              onChange={handleChange}
              className="
                border border-[#adb5bd]
                bg-zinc-900/70
                text-zinc-100
                rounded-lg
                px-3.5 py-2.5
                shadow-sm shadow-[#adb5bd]/40
                placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                text-sm md:text-base
              "
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            mt-2
            inline-flex items-center justify-center
            gap-2
            w-full
            rounded-3xl
            border-2 border-[#adb5bd]
            bg-[#f8f9fa]
            text-[#007bff]
            font-semibold
            px-4 py-2.5
            shadow-lg shadow-[#adb5bd]
            hover:bg-[#dee2e6]
            disabled:opacity-60 disabled:cursor-not-allowed
            transition
            text-sm md:text-base
          "
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-[#007bff] border-t-transparent rounded-full animate-spin" />
              Šaljem zahtjev...
            </>
          ) : (
            <>Pošalji zahtjev za B2B nalog</>
          )}
        </button>

        <div className="pt-2 text-center text-xs md:text-sm text-zinc-400">
          Već imaš račun?{' '}
          <Link
            href="/my-account/login"
            className="text-[#66b2ff] hover:text-[#99ccff] underline-offset-4 hover:underline"
          >
            Prijavi se
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}