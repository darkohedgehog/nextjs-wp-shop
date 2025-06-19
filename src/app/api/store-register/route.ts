import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // body: { email, first_name, last_name, username, password }
  const url = new URL('/wp-json/wc/v3/customers', process.env.WC_BASE_URL!);
  url.searchParams.set('consumer_key', process.env.WC_KEY!);
  url.searchParams.set('consumer_secret', process.env.WC_SECRET!);

  const wpRes = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body),
  });
  const data = await wpRes.json();
  return NextResponse.json(data, { status: wpRes.status });
}
