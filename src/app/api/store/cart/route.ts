// app/api/store/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';

const WC_BASE_URL =
  process.env.NEXT_PUBLIC_WC_BASE_URL ??
  process.env.WC_BASE_URL ??
  process.env.WP_REST_ROOT?.replace('/wp-json', '') ?? '';

export async function GET(req: NextRequest) {
  try {
    if (!WC_BASE_URL) {
      console.error('WC_BASE_URL nije podešen u .env');
      return NextResponse.json(
        { error: 'WC_BASE_URL missing' },
        { status: 500 }
      );
    }

    // npr. https://wp.zivic-elektro.shop/wp-json/wc/store/v1/cart
    const url = `${WC_BASE_URL.replace(/\/$/, '')}/wp-json/wc/store/v1/cart`;

    const headers: Record<string, string> = {};

    // najbitnije: PROSLEDI ORIGINALNE COOKIE-E (Woo session)
    const cookie = req.headers.get('cookie');
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const wpRes = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const text = await wpRes.text();

    if (!wpRes.ok) {
      console.error('Woo store cart error:', wpRes.status, text);
      // prosledi raw response od WP
      return new NextResponse(text, {
        status: wpRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Greška u /api/store/cart:', err);

    return NextResponse.json(
      {
        totals: null,
        error: { message: 'Internal error fetching Woo store cart' },
      },
      { status: 500 }
    );
  }
}