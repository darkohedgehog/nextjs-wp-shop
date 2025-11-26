// app/api/customer/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ ovde unwrap-ujemo Promise

  const url = new URL(
    `/wp-json/wc/v3/customers/${id}`,
    process.env.WC_BASE_URL!,
  );

  url.searchParams.set('consumer_key', process.env.WC_KEY!);
  url.searchParams.set('consumer_secret', process.env.WC_SECRET!);

  const wpRes = await fetch(url.toString(), { method: 'GET' });
  const data = await wpRes.json();

  return NextResponse.json(data, { status: wpRes.status });
}