// src/app/my-account/reset-password/page.tsx  (ili odgovarajuća ruta)
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { LuKeyRound } from 'react-icons/lu';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const key   = searchParams.get('key') ?? '';
  const login = searchParams.get('login') ?? '';

  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!key || !login) {
      setError('Link za reset je neispravan ili je istekao.');
      return;
    }

    if (password.length < 8) {
      setError('Lozinka mora imati najmanje 8 znakova.');
      return;
    }

    if (password !== password2) {
      setError('Lozinke se ne podudaraju.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, login, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Greška pri promjeni lozinke.');
      } else {
        setSuccess(true);
        // kratka pauza pa redirect na login
        setTimeout(() => router.push('/my-account/login'), 2000);
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
      title="Postavi novu zaporku"
      subtitle="Upiši novu zaporku za svoj račun. Nakon spremanja bićeš preusmjeren na stranicu za prijavu."
      icon={<LuKeyRound />}
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

        {success && (
          <p className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-500/50 rounded-lg px-3 py-2">
            Lozinka je uspješno promijenjena. Preusmjeravam na prijavu…
          </p>
        )}

        {/* Nova lozinka */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-200">
            Nova zaporka
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nova zaporka (min. 8 znakova)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
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

        {/* Ponovi lozinku */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-200">
            Ponovi zaporku
          </label>
          <div className="relative">
            <input
              type={showPassword2 ? 'text' : 'password'}
              placeholder="Ponovi novu zaporku"
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
              required
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
              Spremam novu zaporku...
            </>
          ) : (
            <>Spremi novu zaporku</>
          )}
        </button>

        {/* Link nazad na login */}
        <div className="pt-2 text-center text-xs md:text-sm text-zinc-400">
          Znaš staru zaporku?{' '}
          <Link
            href="/my-account/login"
            className="text-[#66b2ff] hover:text-[#99ccff] underline-offset-4 hover:underline"
          >
            Vrati se na prijavu
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}