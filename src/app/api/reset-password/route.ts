import { NextRequest } from 'next/server';
import { checkMutation, commerceError, CommerceError, privateJson } from '@/lib/commerce-server';
import { record } from '@/lib/commerce-security';
import { getServerWooBaseUrl } from '@/lib/wordpress-endpoints';
export async function POST(req: NextRequest) {
  try {
    checkMutation(req);
    const { key, login, password } = record(await req.json());
    if ([key, login, password].some(value => typeof value !== 'string' || !value || value.length > 4096)) throw new CommerceError(400, 'Provjerite link i novu lozinku.');
    const res = await fetch(new URL('/wp-json/zvo/v1/reset-password', getServerWooBaseUrl()), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, login, password }),
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new CommerceError(400, 'Promjena lozinke nije uspjela. Zatražite novi link.');
    return privateJson({ success: true });
  } catch (error) { return commerceError(error); }
}
