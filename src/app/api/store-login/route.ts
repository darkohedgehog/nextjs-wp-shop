// app/api/store-login/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = new URL('/wp-json/jwt-auth/v1/token', process.env.WC_BASE_URL!);

  const wpRes = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await wpRes.json();
  return NextResponse.json(data, { status: wpRes.status });
}