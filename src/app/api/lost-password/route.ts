import { NextRequest } from 'next/server';
import { checkMutation, commerceError, CommerceError, privateJson } from '@/lib/commerce-server';
import { record } from '@/lib/commerce-security';
import { getServerWooBaseUrl } from '@/lib/wordpress-endpoints';
export async function POST(req: NextRequest) {
  try {
    checkMutation(req);
    const body = record(await req.json());
    if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) throw new CommerceError(400, 'Unesite ispravan email.');
    const res = await fetch(new URL('/wp-login.php?action=lostpassword', getServerWooBaseUrl()), {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ user_login: body.email, redirect_to: '', 'wp-submit': 'Reset password' }),
      cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new CommerceError(502, 'Slanje zahtjeva trenutno nije dostupno.');
    return privateJson({ ok: true, message: 'Ako postoji korisnik s tim emailom, poslan je link za reset lozinke.' });
  } catch (error) { return commerceError(error); }
}
