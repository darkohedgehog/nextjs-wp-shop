import { NextRequest, NextResponse } from 'next/server';
import { getServerWooBaseUrl } from '@/lib/wordpress-endpoints';

const WC_BASE_URL = getServerWooBaseUrl();

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

    // Forward only cookies used by the WordPress/WooCommerce session.
    const cookie = req.headers.get('cookie');
    if (cookie) {
      headers.Cookie = cookie.split(';').map(part => part.trim()).filter(part => /^(wp_woocommerce_session_[^=]+|woocommerce_items_in_cart|woocommerce_cart_hash|wordpress_logged_in_[^=]+)=/.test(part)).join('; ');
    }

    const wpRes = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    });

    const text = await wpRes.text();

    if (!wpRes.ok) {
      return NextResponse.json({ error: 'Košarica trenutno nije dostupna.' }, { status: 502 });
    }

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  } catch {

    return NextResponse.json(
      {
        totals: null,
        error: { message: 'Internal error fetching Woo store cart' },
      },
      { status: 500 }
    );
  }
}