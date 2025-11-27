// app/api/lost-password/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Osnovni WP URL (bez /wp-json na kraju)
const WP_BASE_URL =
  process.env.WC_BASE_URL ??          // npr. https://wp.zivic-elektro.shop
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

  // 1) Učitaj body
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    console.error('[lost-password] Cannot parse JSON body:', err);
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const email = String(body?.email || '').trim();
  if (!email) {
    return NextResponse.json(
      { error: 'Email je obavezan.' },
      { status: 400 },
    );
  }

  console.log('[lost-password] Received email:', email);

  // 2) Klasičan WP endpoint za reset lozinke
  // npr. https://wp.zivic-elektro.shop/wp-login.php?action=lostpassword
  const url = `${WP_BASE_URL.replace(/\/$/, '')}/wp-login.php?action=lostpassword`;

  console.log('[lost-password] Calling WP lostpassword form:', url);

  // WordPress očekuje form-encoded body:
  //  - user_login = email
  //  - redirect_to (može prazno)
  //  - wp-submit (labela dugmeta, nije preterano bitno ali stavimo)
  const formBody = new URLSearchParams();
  formBody.set('user_login', email);
  formBody.set('redirect_to', '');
  formBody.set('wp-submit', 'Reset password');

  try {
    const wpRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
      // ne keširamo
      cache: 'no-store',
    });

    const text = await wpRes.text();

    // WP obično vraća 200 sa HTML-om (ili sa greškom ili sa porukom "If that email exists...")
    if (!wpRes.ok) {
      console.error(
        '[lost-password] WP lostpassword HTTP error:',
        wpRes.status,
        text.slice(0, 500), // da ne spamujemo ceo HTML
      );
      return NextResponse.json(
        {
          error: 'WP lostpassword failed',
          wpStatus: wpRes.status,
        },
        { status: 500 },
      );
    }

    console.log('[lost-password] WP lostpassword OK (HTML response length):', text.length);

    // Ne curimo korisniku detalje – standardna "ako postoji user" poruka
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