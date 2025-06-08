import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET( req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
  const base= process.env.WC_BASE_URL!;
  const key = process.env.WC_KEY!;
  const sec = process.env.WC_SECRET!;

  const url = new URL(`/wp-json/wc/v3/orders/${id}`, base);
  // Basic Auth
  const auth = Buffer.from(`${key}:${sec}`).toString('base64');

  const wpRes = await fetch(url.toString(), {
    headers: { 'Authorization': `Basic ${auth}` },
  });
  const data = await wpRes.json();
  return NextResponse.json(data, { status: wpRes.status });
}
