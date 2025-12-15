import { NextRequest, NextResponse } from 'next/server';

const WC_BASE_URL = process.env.WC_BASE_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

if (!WC_BASE_URL) console.warn('[orders] WC_BASE_URL nije definisan');
if (!WC_CONSUMER_KEY) console.warn('[orders] WC_CONSUMER_KEY nije definisan');
if (!WC_CONSUMER_SECRET) console.warn('[orders] WC_CONSUMER_SECRET nije definisan');

export async function GET(req: NextRequest) {
  if (!WC_BASE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    return NextResponse.json(
      { error: 'Woo env vars missing (WC_BASE_URL / CK / CS)' },
      { status: 500 },
    );
  }

  const search = req.nextUrl.searchParams;
  const customerId = search.get('customer');

  if (!customerId) {
    return NextResponse.json(
      { error: 'Missing customer query param ?customer=' },
      { status: 400 },
    );
  }

  try {
    // npr: https://wp.zivic-elektro.shop/wp-json/wc/v3/orders?customer=2&orderby=date&order=desc
    const url = new URL('/wp-json/wc/v3/orders', WC_BASE_URL);
    url.searchParams.set('customer', customerId);
    url.searchParams.set('orderby', 'date');
    url.searchParams.set('order', 'desc');
    url.searchParams.set('per_page', '20');

    const authHeader =
      'Basic ' +
      Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

    const wpRes = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const text = await wpRes.text();

    if (!wpRes.ok) {
      console.error('[orders] Woo list orders error:', wpRes.status, text);
      return NextResponse.json(
        {
          error: `Woo list orders failed (status ${wpRes.status})`,
          wooStatus: wpRes.status,
          wooBody: text,
        },
        { status: 500 },
      );
    }

    let orders: unknown;
    try {
      orders = JSON.parse(text);
    } catch {
      // ako nije validan JSON, vrati raw string (npr. ako Woo vrati nešto neočekivano)
      orders = text;
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (err) {
    console.error('[orders] Unexpected error:', err);
    return NextResponse.json(
      {
        error: 'Unexpected error calling Woo list orders',
        details: String(err),
      },
      { status: 500 },
    );
  }
}