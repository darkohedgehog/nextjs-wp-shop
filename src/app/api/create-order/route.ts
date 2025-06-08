import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const {
      billing, shipping,
      payment_method, payment_method_title,
      line_items, shipping_lines,
    } = await req.json();

    const base = process.env.WC_BASE_URL!;
    const key  = process.env.WC_KEY!;
    const sec  = process.env.WC_SECRET!;

    const url = new URL('/wp-json/wc/v3/orders', base);
    const auth = Buffer.from(`${key}:${sec}`).toString('base64');

    const payload: any = {
      payment_method,
      payment_method_title,
      billing,
      shipping,
      line_items,
      shipping_lines, // forward
      status: 'processing',
    };

    const wpRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await wpRes.text();
    const data = JSON.parse(text);
    if (!wpRes.ok) {
      return NextResponse.json({ error: data }, { status: wpRes.status });
    }
    return NextResponse.json(data, { status: wpRes.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
