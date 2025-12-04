'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LiaUserCheckSolid } from 'react-icons/lia';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { AuthLayout } from '@/components/auth/AuthLayout';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/store-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.data?.token) {
      setError(data?.message || 'Greška pri prijavi.');
      return;
    }

    localStorage.setItem('wpToken', data.data.token);
    localStorage.setItem('wpUser', JSON.stringify(data.data));
    router.push('/my-account');
  };

  return (
    <AuthLayout
      title="Prijava"
      subtitle="Prijavi se svojim korisničkim računom za pregled narudžbi i bržu kupovinu."
      icon={<LiaUserCheckSolid />}
    >
      <form
        onSubmit={handle}
        className="space-y-6 md:space-y-7"
      >
        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-500/50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Username / Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-200">
            Korisničko ime ili email
          </label>
          <input
            type="text"
            required
            placeholder="Npr. ivan.korisnik ili email"
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

        {/* Password + oko */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-200">
            Lozinka
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Tvoja lozinka"
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
                px-3.5 py-2.5 pr-10
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
              Prijavljujem...
            </>
          ) : (
            <>Prijavi se</>
          )}
        </button>

        {/* Links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 text-xs md:text-sm text-zinc-400">
          <a
            href="/lost-password"
            className="text-[#66b2ff] hover:text-[#99ccff] underline-offset-4 hover:underline"
          >
            Zaboravljena lozinka?
          </a>

          <span>
            Nemaš račun?{' '}
            <Link
              href="/my-account/register"
              className="text-[#66b2ff] hover:text-[#99ccff] underline-offset-4 hover:underline"
            >
              Registriraj se
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}