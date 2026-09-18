import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerWooBaseUrl } from './wordpress-endpoints';
import { positiveId, record } from './commerce-security';

export class CommerceError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function privateJson(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie', 'Referrer-Policy': 'no-referrer' } });
}
export function commerceError(error: unknown) {
  if (error instanceof SyntaxError) return privateJson({ error: 'Neispravan JSON zahtjev.' }, 400);
  return privateJson({ error: error instanceof CommerceError ? error.message : 'Usluga trenutno nije dostupna. Pokušajte ponovno.' }, error instanceof CommerceError ? error.status : 502);
}
export function checkMutation(req: NextRequest) {
  const origin = req.headers.get('origin');
  // TLS terminates at the production proxy; nextUrl may contain its internal HTTP origin.
  // Trust explicit shop origins, never client-supplied Host/X-Forwarded-* headers.
  const allowedOrigins = new Set(['https://www.zivic-elektro.shop', 'https://zivic-elektro.shop']);
  if (process.env.NODE_ENV !== 'production') allowedOrigins.add(req.nextUrl.origin);
  if ((origin && !allowedOrigins.has(origin)) || req.headers.get('sec-fetch-site') === 'cross-site') throw new CommerceError(403, 'Zahtjev nije dopušten.');
  if (!req.headers.get('content-type')?.startsWith('application/json')) throw new CommerceError(415, 'Potreban je JSON zahtjev.');
}
export async function woo(path: string, init: RequestInit = {}): Promise<unknown> {
  const key = process.env.WC_CONSUMER_KEY || process.env.WC_KEY;
  const secret = process.env.WC_CONSUMER_SECRET || process.env.WC_SECRET;
  if (!key || !secret) throw new CommerceError(503, 'Usluga trenutno nije dostupna.');
  const res = await fetch(new URL(`/wp-json/wc/v3/${path}`, getServerWooBaseUrl()), {
    ...init, headers: { 'Content-Type': 'application/json', Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}` },
    cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new CommerceError(res.status === 404 ? 404 : 502, res.status === 404 ? 'Podatak nije pronađen.' : 'WooCommerce zahtjev nije uspio.');
  return res.json();
}
export async function verifyToken(token: string): Promise<{ id: number; email?: string }> {
  const res = await fetch(new URL('/wp-json/wp/v2/users/me?context=edit', getServerWooBaseUrl()), {
    headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new CommerceError(res.status === 401 || res.status === 403 ? 401 : 502, 'Prijava je istekla ili nije dostupna. Prijavite se ponovno.');
  const data = record(await res.json());
  const id = positiveId(data.id);
  if (!id) throw new CommerceError(401, 'Prijavite se ponovno.');
  return { id, ...(typeof data.email === 'string' ? { email: data.email } : {}) };
}
export async function session(req: NextRequest, required = true) {
  const token = req.cookies.get('wpToken')?.value;
  if (!token) {
    if (required) throw new CommerceError(401, 'Potrebna je prijava.');
    return null;
  }
  return verifyToken(token);
}
export async function ownCustomer(req: NextRequest, id: unknown) {
  const user = await session(req);
  if (positiveId(id) !== user!.id) throw new CommerceError(403, 'Pristup nije dopušten.');
  return user!.id;
}
export function validOrderKey(supplied: string | null, expected: unknown) {
  if (!supplied || typeof expected !== 'string' || expected.length < 10 || supplied.length > 200) return false;
  const a = Buffer.from(supplied); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
