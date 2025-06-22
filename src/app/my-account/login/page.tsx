'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await fetch('/api/store-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    console.log('Login response:', data);

    // token se nalazi u data.data.token prema JWT Auth strukturi!
    if (!res.ok || !data.data?.token) {
      setError(data?.message || 'Greška pri loginu');
    } else {
      localStorage.setItem('wpToken', data.data.token);
      localStorage.setItem('wpUser', JSON.stringify(data.data));
      router.push('/my-account');
    }
  };

  return (
    <form onSubmit={handle} className="max-w-md mx-auto p-4 space-y-4">
      {error && <p className="text-red-600">{error}</p>}
      <input
        type="text"
        required
        placeholder="Korisničko ime ili Email"
        value={form.username}
        onChange={e =>
          setForm(f => ({ ...f, username: e.target.value }))
        }
        className="border p-2 rounded w-full"
      />
      <input
        type="password"
        required
        placeholder="Lozinka"
        value={form.password}
        onChange={e =>
          setForm(f => ({ ...f, password: e.target.value }))
        }
        className="border p-2 rounded w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Prijavi se
      </button>
    </form>
  );
}