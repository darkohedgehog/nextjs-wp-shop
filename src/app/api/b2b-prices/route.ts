// app/api/b2b-prices/route.ts
import { NextRequest, NextResponse } from 'next/server';

const WC_BASE_URL        = process.env.WC_BASE_URL;
const WC_CONSUMER_KEY    = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

if (!WC_BASE_URL)        console.warn('[b2b-prices] WC_BASE_URL nije definisan');
if (!WC_CONSUMER_KEY)    console.warn('[b2b-prices] WC_CONSUMER_KEY nije definisan');
if (!WC_CONSUMER_SECRET) console.warn('[b2b-prices] WC_CONSUMER_SECRET nije definisan');

function basicAuthHeader() {
  const token = Buffer.from(
    `${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`
  ).toString('base64');
  return `Basic ${token}`;
}

export async function GET(req: NextRequest) {
  try {
    if (!WC_BASE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      return NextResponse.json(
        { error: 'Woo env vars missing' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids');      // npr. "2295,123,456"
    const groupId  = searchParams.get('groupId');  // npr. "308"

    if (!idsParam || !groupId) {
      return NextResponse.json(
        { error: 'ids i groupId su obavezni (?ids=1,2,3&groupId=308)' },
        { status: 400 }
      );
    }

    const ids = idsParam
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));

    if (!ids.length) {
      return NextResponse.json(
        { error: 'Nijedan validan product ID' },
        { status: 400 }
      );
    }

    const url = new URL('/wp-json/wc/v3/products', WC_BASE_URL);
    url.searchParams.set('include', ids.join(','));
    url.searchParams.set('per_page', String(ids.length));

    const wpRes = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: basicAuthHeader(),
      },
      cache: 'no-store',
    });

    const text = await wpRes.text();

    if (!wpRes.ok) {
      console.error('[b2b-prices] Woo error:', wpRes.status, text);
      return new NextResponse(text, {
        status: wpRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let products: any[] = [];
    try {
      products = JSON.parse(text);
    } catch (e) {
      console.error('[b2b-prices] JSON parse error:', e);
      return NextResponse.json(
        { error: 'Ne mogu parsirati Woo response' },
        { status: 500 }
      );
    }

    const regularKey = `b2bking_regular_product_price_group_${groupId}`;
    const saleKey    = `b2bking_sale_product_price_group_${groupId}`;

    const result: Record<
      number,
      { regular?: string; sale?: string }
    > = {};

    for (const p of products) {
      const pid = p.id;
      const meta = Array.isArray(p.meta_data) ? p.meta_data : [];

      const regMeta  = meta.find((m: any) => m.key === regularKey);
      const saleMeta = meta.find((m: any) => m.key === saleKey);

      if (regMeta || saleMeta) {
        result[pid] = {
          regular: regMeta?.value ?? undefined,
          sale:    saleMeta?.value ?? undefined,
        };
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[b2b-prices] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Unexpected error', details: String(err) },
      { status: 500 }
    );
  }
}