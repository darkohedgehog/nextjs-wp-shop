import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { CreateOrderRequest } from '@/types/order';
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const {
      billing,
      shipping,
      payment_method,
      payment_method_title,
      line_items,
      customer_note,
      shipping_lines,
    }: CreateOrderRequest = await req.json();

    const base = process.env.WC_BASE_URL!;
    const key  = process.env.WC_KEY!;
    const sec  = process.env.WC_SECRET!;

    const url = new URL('/wp-json/wc/v3/orders', base);
    const auth = Buffer.from(`${key}:${sec}`).toString('base64');

    const payload: CreateOrderRequest & { status: string } = {
      payment_method,
      payment_method_title,
      billing,
      shipping,
      line_items,
      customer_note,
      shipping_lines,
      status: 'processing',
    };

    const wpRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
  } catch (e) {
    // “e” je unknown tip, pa moramo kastovati kad koristimo message
    const errorMessage =
      typeof e === "object" && e !== null && "message" in e
        ? (e as { message: string }).message
        : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}