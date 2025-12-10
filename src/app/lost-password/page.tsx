'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LiaUserCheckSolid } from 'react-icons/lia';
import { BsSendCheckFill } from 'react-icons/bs';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function LostPasswordPage() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.includes('@')) {
      setError('Unesi ispravnu email adresu.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/lost-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log('Lost-password response:', data);

      if (!res.ok || !data.success) {
        setError(
          data?.message ||
            'Došlo je do greške pri slanju zahtjeva za reset lozinke.'
        );
        return;
      }

      setSuccess(
        'Ako email postoji u sustavu, poslan je link za resetiranje lozinke.'
      );
    } catch (err) {
      console.error('Lost-password error:', err);
      setError('Došlo je do greške. Pokušaj ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Zaboravljena zaporka"
      subtitle="Upiši email adresu povezanu s tvojim računom. Poslat ćemo ti link za resetiranje zaporke."
      icon={<LiaUserCheckSolid />}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 md:space-y-7 max-w-xl mx-auto"
      >
        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-500/50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-500/50 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-200">
            Email adresa
          </label>
          <input
            type="email"
            required
            placeholder="npr. ivan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        {/* Info tekst */}
        <p className="text-xs md:text-sm text-zinc-500">
          * Iz sigurnosnih razloga uvijek šaljemo istu poruku, bez obzira
          postoji li korisnik s tom email adresom.
        </p>

        {/* Submit dugme */}
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
              Slanje u tijeku...
            </>
          ) : (
            <>
              Pošalji link za reset
              <span className="w-5 h-5">
                <BsSendCheckFill />
              </span>
            </>
          )}
        </button>

        {/* Back to login */}
        <div className="pt-2 text-center text-xs md:text-sm text-zinc-400">
          Sjećaš se zaporke?{' '}
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