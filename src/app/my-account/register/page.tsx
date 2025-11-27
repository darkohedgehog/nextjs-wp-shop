// src/app/register/page.tsx  (ili gde već držiš register rutu)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuUserPlus } from 'react-icons/lu';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [password2, setPassword2] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Minimalna validacija
    if (!form.username.trim()) {
      setError('Korisničko ime je obavezno.');
      return;
    }

    if (!form.email.trim()) {
      setError('Email je obavezan.');
      return;
    }

    if (form.password.length < 8) {
      setError('Lozinka mora imati najmanje 8 znakova.');
      return;
    }

    if (form.password !== password2) {
      setError('Lozinke se ne podudaraju.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/store-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Greška pri registraciji.');
      } else {
        // posle uspešne registracije ideš na login
        router.push('/my-account/login');
      }
    } catch (err) {
      console.error(err);
      setError('Došlo je do greške. Pokušajte kasnije.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Registracija"
      subtitle="Kreiraj novi korisnički račun kako bi mogao pratiti narudžbe i brže naručivati."
      icon={<LuUserPlus />}
    >
      <form
        onSubmit={handle}
        className="space-y-6 md:space-y-7 max-w-xl mx-auto"
      >
        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-500/50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Username */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-200">
            Korisničko ime
          </label>
          <input
            type="text"
            required
            placeholder="Npr. ivan.korisnik"
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value }))
            }
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
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-200">
            Email
          </label>
          <input
            type="email"
            required
            placeholder="tvoj.email@example.com"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
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
        </div>

        {/* Lozinka */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-200">
            Lozinka
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Lozinka (min. 8 znakova)"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
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
              onClick={() => setShowPassword((prev) => !prev)}
              className="
                absolute inset-y-0 right-0
                flex items-center pr-3
                text-zinc-400 hover:text-zinc-200
              "
              aria-label={
                showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'
              }
            >
              {showPassword ? (
                <FiEyeOff className="w-5 h-5" />
              ) : (
                <FiEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Potvrda lozinke */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-200">
            Potvrdi lozinku
          </label>
          <div className="relative">
            <input
              type={showPassword2 ? 'text' : 'password'}
              required
              placeholder="Ponovi lozinku"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
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
              onClick={() => setShowPassword2((prev) => !prev)}
              className="
                absolute inset-y-0 right-0
                flex items-center pr-3
                text-zinc-400 hover:text-zinc-200
              "
              aria-label={
                showPassword2 ? 'Sakrij lozinku' : 'Prikaži lozinku'
              }
            >
              {showPassword2 ? (
                <FiEyeOff className="w-5 h-5" />
              ) : (
                <FiEye className="w-5 h-5" />
              )}
            </button>
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
              Kreiram račun...
            </>
          ) : (
            <>Registriraj se</>
          )}
        </button>

        {/* Link na login */}
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