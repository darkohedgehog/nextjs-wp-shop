import { NextRequest } from 'next/server';
import { checkMutation, commerceError, CommerceError, privateJson, verifyToken } from '@/lib/commerce-server';
import { record } from '@/lib/commerce-security';
import { getServerWooBaseUrl } from '@/lib/wordpress-endpoints';
export async function POST(req: NextRequest) {
  try {
    checkMutation(req);
    const body = record(await req.json());
    if (typeof body.username !== 'string' || typeof body.password !== 'string' || !body.username || !body.password || body.username.length > 254 || body.password.length > 4096) throw new CommerceError(400, 'Unesite korisničko ime i lozinku.');
    const upstream = await fetch(new URL('/wp-json/jwt-auth/v1/token', getServerWooBaseUrl()), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: body.username, password: body.password }),
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) throw new CommerceError(401, 'Prijava nije uspjela. Provjerite podatke.');
    const data = record(await upstream.json());
    const token = record(data.data).token ?? data.token;
    if (typeof token !== 'string') throw new CommerceError(502, 'Prijava trenutno nije dostupna.');
    const user = await verifyToken(token);
    const res = privateJson({ data: user });
    res.cookies.set('wpToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' || req.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    res.cookies.set('wpUserEmail', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production' || req.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 0 });
    return res;
  } catch (error) { return commerceError(error); }
}
