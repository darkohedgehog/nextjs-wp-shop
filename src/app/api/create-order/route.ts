// app/api/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';

const WC_BASE_URL         = process.env.WC_BASE_URL;      // npr. https://wp.zivic-elektro.shop
const WC_CONSUMER_KEY     = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET  = process.env.WC_CONSUMER_SECRET;

// Mali sanity logovi
if (!WC_BASE_URL)        console.warn('[create-order] WC_BASE_URL nije definisan u .env');
if (!WC_CONSUMER_KEY)    console.warn('[create-order] WC_CONSUMER_KEY nije definisan u .env');
if (!WC_CONSUMER_SECRET) console.warn('[create-order] WC_CONSUMER_SECRET nije definisan u .env');

export async function GET() {
  console.log('🟢 [/api/create-order] GET handler');
  return NextResponse.json({
    ok: true,
    route: '/api/create-order',
    method: 'GET',
  });
}

export async function POST(req: NextRequest) {
  console.log('🔥 [/api/create-order] POST handler START');

  if (!WC_BASE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    console.error('[create-order] Missing env vars');
    return NextResponse.json(
      { error: 'Woo env vars missing (WC_BASE_URL / CK / CS)' },
      { status: 500 },
    );
  }

  // 1) Učitaj frontend body
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    console.error('[create-order] Cannot parse JSON body:', err);
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  console.log('[create-order] Received payload:', JSON.stringify(body, null, 2));

  // 2) Pripremi URL → *eksplicitno* /wp-json/wc/v3/orders
  const url = new URL('/wp-json/wc/v3/orders', WC_BASE_URL);
  const authHeader =
    'Basic ' +
    Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

  // 🔥 Nova logika:
  // - B2B (Direct Bank Transfer / `bacs`) → set_paid = true + status = processing
  // - ostali (npr. COD) → set_paid = false, bez statusa → Woo ih ostavlja kao pending
  const isBacs = body.payment_method === 'bacs';

  const wooPayload = {
    ...body,
    set_paid: isBacs ? true : false,
    ...(isBacs ? { status: 'processing' } : {}),
  };

  console.log('[create-order] Sending to Woo:', url.toString());
  console.log('[create-order] Woo payload:', JSON.stringify(wooPayload, null, 2));

  try {
    const wpRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(wooPayload),
    });

    const text = await wpRes.text();

    if (!wpRes.ok) {
      console.error(
        '[create-order] Woo create order error:',
        wpRes.status,
        text,
      );

      return NextResponse.json(
        {
          error: `Woo create order failed (status ${wpRes.status})`,
          wooStatus: wpRes.status,
          wooBody: text,
        },
        { status: 500 },
      );
    }

    let order: any;
    try {
      order = JSON.parse(text);
    } catch {
      order = text;
    }

    console.log(
      '[create-order] Woo order created OK, id =',
      order?.id,
      'status =',
      order?.status,
    );

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error('[create-order] Unexpected error calling Woo:', err);
    return NextResponse.json(
      { error: 'Unexpected error calling Woo', details: String(err) },
      { status: 500 },
    );
  }
}