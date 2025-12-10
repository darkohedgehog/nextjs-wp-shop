// app/my-account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useLocalToast } from '@/components/ui/useLocalToast';
import { LiaUserCheckSolid } from 'react-icons/lia';

type OrderItem = {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
};

type ProfileForm = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  // 👇 B2B meta polja koja će ići u meta_data
  company_oib: string;
  company_vat: string;
};

// --- Tipovi za Woo customer / meta / orders ---

type CustomerMeta = {
  key?: string;
  value?: unknown;
};

type CustomerBilling = {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
};

type Customer = {
  id?: number;
  email?: string;
  billing?: CustomerBilling;
  meta_data?: CustomerMeta[];
};

type RawOrder = {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
};

type StoredUser = {
  id?: number;
  data?: { id?: number };
  email?: string;
};

export default function MyAccountPage() {
  const router = useRouter();
  const { showToast, ToastComponent } = useLocalToast();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [isB2B, setIsB2B] = useState<boolean>(false);

  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem('wpUser');

    // Nije prijavljen
    if (!raw) {
      setLoading(false);
      setError('Niste prijavljeni.');

      showToast(
        'Niste prijavljeni. Prijavite se da biste vidjeli svoje narudžbe.',
        'error',
      );

      router.push('/my-account/login');
      return;
    }

    try {
      const user = JSON.parse(raw) as StoredUser;
      const id = user?.id ?? user?.data?.id;

      if (!id) {
        setLoading(false);
        setError('Ne mogu da pronađem ID korisnika.');

        showToast(
          'Ne mogu pronaći ID korisnika. Pokušajte ponovo s prijavom.',
          'error',
        );

        router.push('/my-account/login');
        return;
      }

      const numericId = Number(id);
      setCustomerId(numericId);

      (async () => {
        try {
          setProfileLoading(true);

          // Učitaj customer + narudžbe paralelno
          const [customerRes, ordersRes] = await Promise.all([
            fetch(`/api/customer/${numericId}`, {
              method: 'GET',
              cache: 'no-store',
            }),
            fetch(`/api/orders?customer=${numericId}`, {
              method: 'GET',
              cache: 'no-store',
            }),
          ]);

          // --- Customer / B2B / profil ---
          if (customerRes.ok) {
            try {
              const customer = (await customerRes.json()) as Customer;

              // B2B meta + ACF polja
              let company_oib = '';
              let company_vat = '';

              if (Array.isArray(customer.meta_data)) {
                for (const m of customer.meta_data) {
                  if (!m) continue;

                  if (
                    m.key === 'b2bking_b2buser' &&
                    String(m.value ?? '').toLowerCase() === 'yes'
                  ) {
                    setIsB2B(true);
                  }

                  if (m.key === 'company_oib' && m.value) {
                    company_oib = String(m.value);
                  }

                  if (m.key === 'company_vat' && m.value) {
                    company_vat = String(m.value);
                  }
                }
              }

              const b = customer.billing ?? {};
              const p: ProfileForm = {
                first_name: b.first_name ?? '',
                last_name: b.last_name ?? '',
                company: b.company ?? '',
                address_1: b.address_1 ?? '',
                address_2: b.address_2 ?? '',
                city: b.city ?? '',
                postcode: b.postcode ?? '',
                country: b.country ?? '',
                phone: b.phone ?? '',
                email: b.email ?? user.email ?? '',
                company_oib,
                company_vat,
              };
              setProfile(p);
            } catch (err) {
              console.error('Greška pri parsiranju customer responsa:', err);
            }
          } else {
            console.warn(
              'MyAccount: customer fetch nije OK, status =',
              customerRes.status,
            );
          }

          // --- Orders ---
          if (!ordersRes.ok) {
            const txt = await ordersRes.text();
            console.error('MyAccount orders error:', ordersRes.status, txt);
            setError('Greška pri dohvaćanju narudžbi.');
            showToast(
              'Došlo je do greške pri dohvaćanju narudžbi.',
              'error',
            );
            setLoading(false);
            setProfileLoading(false);
            return;
          }

          const data = (await ordersRes.json()) as unknown;

          const rawOrders: RawOrder[] = Array.isArray(data)
            ? (data as RawOrder[])
            : [];

          const mapped: OrderItem[] = rawOrders.map((o) => ({
            id: o.id,
            number: o.number,
            status: o.status,
            date_created: o.date_created,
            total: o.total,
            currency: o.currency,
          }));

          setOrders(mapped);
          setLoading(false);
          setProfileLoading(false);
        } catch (err) {
          console.error('MyAccount fetch error:', err);
          setError('Greška pri dohvaćanju narudžbi.');

          showToast(
            'Došlo je do greške pri dohvaćanju narudžbi.',
            'error',
          );

          setLoading(false);
          setProfileLoading(false);
        }
      })();
    } catch (e) {
      console.error('Neispravan wpUser u localStorage-u:', e);
      setError('Greška sa prijavom korisnika.');

      showToast(
        'Došlo je do greške pri učitavanju korisničkih podataka. Pokušaj ponovo s prijavom.',
        'error',
      );

      router.push('/my-account/login');
      setLoading(false);
      setProfileLoading(false);
    }
  }, [router, showToast]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
      console.error('Greška pri pozivu /api/logout:', e);
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('wpUser');
      localStorage.removeItem('wpToken');
    }

    showToast('Uspješno ste se odjavili.', 'success');

    router.push('/');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !profile) return;

    // Minimalna validacija
    if (!profile.first_name.trim() || !profile.last_name.trim()) {
      showToast('Ime i prezime su obavezni.', 'error');
      return;
    }

    if (!profile.email.trim() || !profile.email.includes('@')) {
      showToast('Unesi ispravan email.', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch(`/api/customer/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // 👇 šaljemo sve, uključujući company_oib / company_vat
        body: JSON.stringify(profile),
      });

      const data = await res.json().catch(() => ({} as { error?: string }));

      if (!res.ok) {
        console.error('Greška pri ažuriranju profila:', data);
        showToast(
          data?.error ||
            'Došlo je do greške pri spremanju podataka. Pokušaj ponovo.',
          'error',
        );
      } else {
        showToast('Podaci su uspješno spremljeni.', 'success');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      showToast(
        'Došlo je do greške pri spremanju podataka. Pokušaj ponovo.',
        'error',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // 🔄 Loading state
  if (loading) {
    return (
      <AuthLayout
        title="Moj račun"
        subtitle="Učitavanje podataka o narudžbama..."
        icon={<LiaUserCheckSolid />}
      >
        <div className="flex justify-center py-10">
          <span className="inline-block w-6 h-6 border-2 border-[#007bff] border-t-transparent rounded-full animate-spin" />
        </div>
        {ToastComponent}
      </AuthLayout>
    );
  }

  // ❌ Error fallback
  if (error) {
    return (
      <AuthLayout
        title="Moj račun"
        subtitle="Nije moguće dohvatiti podatke o narudžbama."
        icon={<LiaUserCheckSolid />}
      >
        <div className="text-center text-sm md:text-base text-red-400 bg-red-950/40 border border-red-500/50 rounded-lg px-3 py-3">
          {error}
        </div>
        {ToastComponent}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Moj račun"
      subtitle="Pregled tvojih narudžbi i postavki profila."
      icon={<LiaUserCheckSolid />}
    >
      <div className="space-y-6 md:space-y-7 max-w-5xl mx-auto">
        {/* Header sa ID-em, badge-om i logoutom */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex flex-col gap-1">
            <span className="text-lg md:text-xl font-semibold text-zinc-100">
              Dobrodošli nazad
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              {customerId && (
                <span className="text-zinc-500">
                  ID korisnika:{' '}
                  <span className="font-medium">{customerId}</span>
                </span>
              )}
              <span
                className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] md:text-xs font-semibold
                  border
                  ${
                    isB2B
                      ? 'bg-amber-500/10 border-amber-400/70 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-400/70 text-emerald-300'
                  }
                `}
              >
                {isB2B ? 'B2B kupac' : 'B2C kupac'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="
              inline-flex items-center justify-center
              px-4 py-2
              rounded-3xl
              border-2 border-[#adb5bd]
              bg-[#f8f9fa]
              text-[#007bff]
              text-sm md:text-base
              font-semibold
              shadow-lg shadow-[#adb5bd]
              hover:bg-[#dee2e6]
              transition
            "
          >
            Odjava
          </button>
        </div>

        {/* 🧍 Sekcija: Moj profil */}
        <div
          className="
            w-full
            border border-[#adb5bd]/70
            bg-linear-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-800/80
            rounded-2xl
            shadow-[0_16px_50px_rgba(0,0,0,0.45)]
            backdrop-blur-md
            p-5 md:p-7
          "
        >
          <h2 className="text-lg md:text-xl font-semibold text-zinc-100 mb-1">
            Moj profil
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mb-5">
            Ovdje možeš ažurirati svoje kontakt i adresne podatke. Ovi podaci se
            koriste za naplatu i dostavu.
          </p>

          {profileLoading || !profile ? (
            <div className="flex justify-center py-6">
              <span className="inline-block w-5 h-5 border-2 border-[#007bff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form
              onSubmit={handleProfileSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 text-sm md:text-base"
            >
              {/* Ime / prezime */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Ime
                </label>
                <input
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleProfileChange}
                  className="
                    w-full
                    border border-[#adb5bd]
                    bg-zinc-900/70
                    text-zinc-100
                    rounded-lg
                    px-3 py-2
                    shadow-sm shadow-[#adb5bd]/40
                    placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                  "
                  placeholder="Ime"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Prezime
                </label>
                <input
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleProfileChange}
                  className="
                    w-full
                    border border-[#adb5bd]
                    bg-zinc-900/70
                    text-zinc-100
                    rounded-lg
                    px-3 py-2
                    shadow-sm shadow-[#adb5bd]/40
                    placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                  "
                  placeholder="Prezime"
                />
              </div>

              {/* Firma */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-medium text-zinc-300">
                  Naziv firme (R1)
                </label>
                <input
                  name="company"
                  value={profile.company}
                  onChange={handleProfileChange}
                  className="
                    w-full
                    border border-[#adb5bd]
                    bg-zinc-900/70
                    text-zinc-100
                    rounded-lg
                    px-3 py-2
                    shadow-sm shadow-[#adb5bd]/40
                    placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                  "
                  placeholder="Npr. Živić-elektro j.d.o.o."
                />
              </div>

              {/* B2B polja – OIB / VAT */}
              {isB2B && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                      OIB (tvrtke)
                    </label>
                    <input
                      name="company_oib"
                      value={profile.company_oib}
                      onChange={handleProfileChange}
                      className="
                        w-full
                        border border-[#adb5bd]
                        bg-zinc-900/70
                        text-zinc-100
                        rounded-lg
                        px-3 py-2
                        shadow-sm shadow-[#adb5bd]/40
                        placeholder:text-zinc-500
                        focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                      "
                      placeholder="OIB"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                      VAT broj (ako postoji)
                    </label>
                    <input
                      name="company_vat"
                      value={profile.company_vat}
                      onChange={handleProfileChange}
                      className="
                        w-full
                        border border-[#adb5bd]
                        bg-zinc-900/70
                        text-zinc-100
                        rounded-lg
                        px-3 py-2
                        shadow-sm shadow-[#adb5bd]/40
                        placeholder:text-zinc-500
                        focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                      "
                      placeholder="VAT broj"
                    />
                  </div>
                </>
              )}

              {/* Adrese */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-medium text-zinc-300">
                  Adresa
                </label>
                <input
                  name="address_1"
                  value={profile.address_1}
                  onChange={handleProfileChange}
                  className="
                    w-full
                    border border-[#adb5bd]
                    bg-zinc-900/70
                    text-zinc-100
                    rounded-lg
                    px-3 py-2
                    shadow-sm shadow-[#adb5bd]/40
                    placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                  "
                  placeholder="Ulica i broj"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-medium text-zinc-300">
                  Adresa (opcionalno)
                </label>
                <input
                  name="address_2"
                  value={profile.address_2}
                  onChange={handleProfileChange}
                  className="
                    w-full
                    border border-[#adb5bd]
                    bg-zinc-900/70
                    text-zinc-100
                    rounded-lg
                    px-3 py-2
                    shadow-sm shadow-[#adb5bd]/40
                    placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                  "
                  placeholder="Stan, kat, ulaz…"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Grad
                </label>
                <input
                  name="city"
                  value={profile.city}
                  onChange={handleProfileChange}
                  className="
                    w-full
                    border border-[#adb5bd]
                    bg-zinc-900/70
                    text-zinc-100
                    rounded-lg
                    px-3 py-2
                    shadow-sm shadow-[#adb5bd]/40
                    placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                  "
                  placeholder="Grad"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Poštanski broj
                </label>
                <input
                  name="postcode"
                  value={profile.postcode}
                  onChange={handleProfileChange}
                  className="
                    w-full
                    border border-[#adb5bd]
                    bg-zinc-900/70
                    text-zinc-100
                    rounded-lg
                    px-3 py-2
                    shadow-sm shadow-[#adb5bd]/40
                    placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                  "
                  placeholder="Poštanski broj"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Država
                </label>
                <input
                  name="country"
                  value={profile.country}
                  onChange={handleProfileChange}
                  className="
                    w-full
                    border border-[#adb5bd]
                    bg-zinc-900/70
                    text-zinc-100
                    rounded-lg
                    px-3 py-2
                    shadow-sm shadow-[#adb5bd]/40
                    placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                  "
                  placeholder="Npr. HR ili Hrvatska"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Telefon
                </label>
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="
                    w-full
                    border border-[#adb5bd]
                    bg-zinc-900/70
                    text-zinc-100
                    rounded-lg
                    px-3 py-2
                    shadow-sm shadow-[#adb5bd]/40
                    placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                  "
                  placeholder="+385..."
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-medium text-zinc-300">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="
                    w-full
                    border border-[#adb5bd]
                    bg-zinc-900/70
                    text-zinc-100
                    rounded-lg
                    px-3 py-2
                    shadow-sm shadow-[#adb5bd]/40
                    placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-[#007bff]
                  "
                  placeholder="email@example.com"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  * Email se koristi za komunikaciju i obavijesti o narudžbama.
                </p>
              </div>

              <div className="md:col-span-2 flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="
                    inline-flex items-center justify-center
                    px-4 py-2.5
                    rounded-3xl
                    border-2 border-[#adb5bd]
                    bg-[#f8f9fa]
                    text-[#007bff]
                    text-sm md:text-base
                    font-semibold
                    shadow-lg shadow-[#adb5bd]
                    hover:bg-[#dee2e6]
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition
                  "
                >
                  {savingProfile ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-[#007bff] border-t-transparent rounded-full animate-spin mr-2" />
                      Spremam promjene...
                    </>
                  ) : (
                    <>Spremi promjene</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 📦 Narudžbe */}
        {orders.length === 0 ? (
          <div
            className="
              w-full
              border border-[#adb5bd]/70
              bg-linear-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-800/80
              rounded-2xl
              shadow-[0_16px_50px_rgba(0,0,0,0.45)]
              backdrop-blur-md
              p-5 md:p-7
              text-zinc-300
              text-sm md:text-base
            "
          >
            Još nemate narudžbi.
            <br />
            <span className="text-zinc-400">
              Krenite u kupovinu i Vaša prva narudžba pojaviti će se ovdje.
            </span>
            <div className="mt-4">
              <Link
                href="/products"
                className="
                  inline-flex items-center justify-center
                  px-4 py-2
                  rounded-3xl
                  border-2 border-[#adb5bd]
                  bg-[#f8f9fa]
                  text-[#007bff]
                  text-sm font-semibold
                  shadow-lg shadow-[#adb5bd]
                  hover:bg-[#dee2e6]
                  transition
                "
              >
                Idi u trgovinu
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="
              w-full
              border border-[#adb5bd]/70
              bg-linear-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-800/80
              rounded-2xl
              shadow-[0_16px_50px_rgba(0,0,0,0.45)]
              backdrop-blur-md
              p-4 md:p-6
              overflow-x-auto
            "
          >
            <div className="flex items-center justify-center text-zinc-400 my-6 font-semibold text-xl">
              Vaše narudžbe
            </div>
            <table className="min-w-full text-sm text-left text-zinc-200">
              <thead className="bg-white/10 text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Narudžba</th>
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ukupno</th>
                  <th className="px-4 py-3 text-right">Detalji</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const date = new Date(order.date_created);
                  const formatted = date.toLocaleString('hr-HR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const statusLabel = order.status;

                  return (
                    <tr
                      key={order.id}
                      className="border-t border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold">
                        #{order.number}
                      </td>
                      <td className="px-4 py-3">{formatted}</td>
                      <td className="px-4 py-3 capitalize">
                        {statusLabel}
                      </td>
                      <td className="px-4 py-3">
                        {order.total} {order.currency}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/order-success?order_id=${order.id}`}
                          className="text-[#66b2ff] hover:text-[#99ccff] hover:underline text-xs font-semibold"
                        >
                          Pogledaj
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p className="mt-3 text-[11px] md:text-xs text-zinc-500">
              * Status i iznos narudžbi preuzeti su direktno iz WooCommerce
              sustava.
            </p>
          </div>
        )}

        {ToastComponent}
      </div>
    </AuthLayout>
  );
}