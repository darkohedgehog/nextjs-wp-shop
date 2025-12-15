import { NextRequest, NextResponse } from 'next/server';

// ⭐ Dodaj tip OVDE — izvan funkcija, na vrhu fajla
type LostPasswordBody = {
  email?: string;
};

// Osnovni WP URL (bez /wp-json na kraju)
const WP_BASE_URL =
  process.env.WC_BASE_URL ??
  process.env.NEXT_PUBLIC_WP_BASE_URL ??
  process.env.WP_REST_ROOT?.replace('/wp-json', '') ??
  '';

if (!WP_BASE_URL) {
  console.warn('[lost-password] WP_BASE_URL nije definisan u .env (WC_BASE_URL / WP_REST_ROOT)');
}

console.log('🟢 [/api/lost-password] route.ts LOADED');

export async function GET() {
  console.log('🔥 [/api/lost-password] GET handler');
  return NextResponse.json({
    ok: true,
    route: '/api/lost-password',
    method: 'GET',
  });
}

export async function POST(req: NextRequest) {
  console.log('🔥 [/api/lost-password] POST handler START');

  if (!WP_BASE_URL) {
    return NextResponse.json(
      { error: 'WP_BASE_URL missing in env' },
      { status: 500 },
    );
  }

  // 🔹 1) Učitaj i tipiziraj body bez any
  let body: LostPasswordBody | null = null;

  try {
    body = (await req.json()) as LostPasswordBody;
  } catch (err) {
    console.error('[lost-password] Cannot parse JSON body:', err);
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const email = typeof body?.email === 'string' ? body.email.trim() : '';

  if (!email) {
    return NextResponse.json(
      { error: 'Email je obavezan.' },
      { status: 400 },
    );
  }

  console.log('[lost-password] Received email:', email);

  const url = `${WP_BASE_URL.replace(/\/$/, '')}/wp-login.php?action=lostpassword`;

  console.log('[lost-password] Calling WP lostpassword form:', url);

  const formBody = new URLSearchParams();
  formBody.set('user_login', email);
  formBody.set('redirect_to', '');
  formBody.set('wp-submit', 'Reset password');

  try {
    const wpRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
      cache: 'no-store',
    });

    const text = await wpRes.text();

    if (!wpRes.ok) {
      console.error(
        '[lost-password] WP lostpassword HTTP error:',
        wpRes.status,
        text.slice(0, 500),
      );
      return NextResponse.json(
        { error: 'WP lostpassword failed', wpStatus: wpRes.status },
        { status: 500 },
      );
    }

    console.log('[lost-password] WP lostpassword OK:', text.length);

    return NextResponse.json(
      {
        ok: true,
        message:
          'Ako postoji korisnik sa tim emailom, poslat je link za reset lozinke.',
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[lost-password] Unexpected error calling WP lostpassword:', err);
    return NextResponse.json(
      {
        error: 'Unexpected error calling WP lostpassword',
        details: String(err),
      },
      { status: 500 },
    );
  }
}