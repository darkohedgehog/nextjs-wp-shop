import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('wpToken')?.value || null;
  const body = await req.json();

  const url = new URL(
    '/wp-json/wc/store/v1/cart/add-item',
    process.env.WC_BASE_URL!,
  );

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const wpRes = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await wpRes.json();
  return NextResponse.json(data, { status: wpRes.status });
}