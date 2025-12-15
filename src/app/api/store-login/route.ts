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
  const res = NextResponse.json(data, { status: wpRes.status });

  const token = data?.data?.token;
  const email = data?.data?.email;

  if (wpRes.ok && token) {
    // httpOnly JWT cookie
    res.cookies.set('wpToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dana
    });
  }

  if (wpRes.ok && email) {
    // email usera – isto httpOnly, da ga server može čitati
    res.cookies.set('wpUserEmail', email, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return res;
}