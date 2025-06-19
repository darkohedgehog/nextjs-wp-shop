'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await fetch('/api/wp-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',            // <— važno!
      body: JSON.stringify(creds),
    });

    if (!res.ok) {
      const { message } = await res.json().catch(() => ({}));
      setError(message || 'Neispravni podaci');
      return;
    }

    // uspjeh → redirect
    router.push('/my-account');
  };

  return (
    <form onSubmit={handle} className="max-w-md mx-auto p-4 space-y-4">
      {error && <p className="text-red-600">{error}</p>}
      <input
        type="text"
        required
        placeholder="Korisničko ime ili email"
        value={creds.username}
        onChange={(e) => setCreds((c) => ({ ...c, username: e.target.value }))}
        className="border p-2 rounded w-full"
      />
      <input
        type="password"
        required
        placeholder="Lozinka"
        value={creds.password}
        onChange={(e) => setCreds((c) => ({ ...c, password: e.target.value }))}
        className="border p-2 rounded w-full"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Prijavi se
      </button>
    </form>
  );
}
