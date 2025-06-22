'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  email: string;
  nicename: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

export default function MyAccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Provera tokena i usera
    const token = localStorage.getItem('wpToken');
    const userData = localStorage.getItem('wpUser');
    if (!token || !userData) {
      // Ako nema tokena, preusmeri na login
      router.push('/my-account/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  if (!user) {
    return <div>Učitavanje...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 text-pink-500">
      <h2 className="text-2xl font-bold mb-2">Moj nalog</h2>
      <div className="bg-gray-100 p-4 rounded shadow">
        <p><b>ID:</b> {user.id}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Korisničko ime:</b> {user.nicename}</p>
        <p><b>Ime:</b> {user.firstName || '-'}</p>
        <p><b>Prezime:</b> {user.lastName || '-'}</p>
        <p><b>Prikazano ime:</b> {user.displayName || '-'}</p>
      </div>
    </div>
  );
}