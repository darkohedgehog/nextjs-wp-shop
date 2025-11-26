import { NextRequest, NextResponse } from 'next/server';

const WP_REST_ROOT = process.env.WP_REST_ROOT;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!WP_REST_ROOT || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    console.error('WooCommerce credencijali nisu podešeni u .env');
    return NextResponse.json(
      { error: 'WooCommerce credentials missing' },
      { status: 500 }
    );
  }

  const { id } = await ctx.params;

  // ❌ OVO NE:
  // const url = new URL(`/wc/v3/products/${id}`, WP_REST_ROOT);

  // ✅ VARIJANTA 1 – najjednostavnije:
  const url = new URL(`${WP_REST_ROOT}/wc/v3/products/${id}`);

  // ✅ (alternativa bi bila bez leading slasha, isto OK)
  // const url = new URL(`wc/v3/products/${id}`, WP_REST_ROOT);

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
    console.error('Woo single product error:', text);
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