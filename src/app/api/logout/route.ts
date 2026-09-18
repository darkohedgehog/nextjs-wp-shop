import { NextRequest } from 'next/server';
import { privateJson } from '@/lib/commerce-server';
export async function POST(req: NextRequest) {
  const res = privateJson({ ok: true });
  for (const name of ['wpToken', 'wpUserEmail', 'wp_jwt']) res.cookies.set(name, '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production' || req.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 0,
  });
  return res;
}
