import { NextRequest, NextResponse } from 'next/server';

const WP_REST_ROOT = process.env.WP_REST_ROOT;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

export async function GET(req: NextRequest) {
  if (!WP_REST_ROOT || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    console.error('WooCommerce credencijali nisu podešeni u .env');
    return NextResponse.json(
      { error: 'WooCommerce credentials missing' },
      { status: 500 }
    );
  }

  const search  = req.nextUrl.searchParams;
  const include = search.get('include') ?? '';
  const perPage = search.get('per_page') ?? '10';

  const url = new URL(`${WP_REST_ROOT}/wc/v3/products`);

  if (include) url.searchParams.set('include', include);
  url.searchParams.set('per_page', perPage);

  // Basic auth sa ck/cs — isto kao u [id] ruti
  const authHeader =
    'Basic ' +
    Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: authHeader,
    },
    cache: 'no-store',
  });

  const text = await res.text();

  if (!res.ok) {
    console.error('Woo products error:', text);
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(text, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}