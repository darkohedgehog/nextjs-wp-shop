'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({ username:'', email:'', password:'' });
  const [error, setError] = useState<string|null>(null);
  const router = useRouter();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/store-register', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.message || 'Greška pri registraciji');
    } else {
      router.push('/my-account/login');
    }
  };

  return (
    <form onSubmit={handle} className="max-w-md mx-auto p-4 space-y-4">
      {error && <p className="text-red-600">{error}</p>}
      <input
        type="text" required placeholder="Korisničko ime"
        value={form.username}
        onChange={e=>setForm(f=>({ ...f, username:e.target.value }))}
        className="border p-2 rounded w-full"
      />
      <input
        type="email" required placeholder="Email"
        value={form.email}
        onChange={e=>setForm(f=>({ ...f, email:e.target.value }))}
        className="border p-2 rounded w-full"
      />
      <input
        type="password" required placeholder="Lozinka"
        value={form.password}
        onChange={e=>setForm(f=>({ ...f, password:e.target.value }))}
        className="border p-2 rounded w-full"
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Registriraj se
      </button>
    </form>
  );
}
