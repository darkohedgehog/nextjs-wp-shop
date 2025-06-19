import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // 1. Parsiraj username i password iz body-a
  const { username, password } = await request.json();

  // 2. Pozivi WooCommerce Store API authenticate ruti
  const res = await fetch(
    `${process.env.WC_BASE_URL}/wp-json/wc/store/v1/customer/authenticate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // send + receive cookies
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    }
  );

  // 3. Vratimo response točno onako kako je stigao iz WooCommercea
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
