// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  // napravi JSON response
  const res = NextResponse.json({ ok: true });

  // obriši wpToken cookie
  res.cookies.set('wpToken', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return res;
}