// app/api/create-order/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { line_items } = await request.json();

    const baseUrl = process.env.WC_BASE_URL;
    const key     = process.env.WC_KEY;
    const secret  = process.env.WC_SECRET;

    if (!baseUrl || !key || !secret) {
      return NextResponse.json(
        { error: 'Missing WC_BASE_URL, WC_KEY or WC_SECRET in environment' },
        { status: 500 }
      );
    }

    // Construct the REST URL (no query string auth)
    const url = new URL('/wp-json/wc/v3/orders', baseUrl);

    // Create Basic Auth header
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');

    // Send server-to-server call
    const wpRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({ line_items }),
    });

    const text = await wpRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    console.log('WooCommerce order response', wpRes.status, data);

    if (!wpRes.ok) {
      return NextResponse.json({ error: data }, { status: wpRes.status });
    }
    return NextResponse.json(data, { status: wpRes.status });
  } catch (err: any) {
    console.error('Error in create-order API route:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}
