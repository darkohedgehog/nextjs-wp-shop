import { NextRequest } from 'next/server';
import { checkMutation, commerceError, CommerceError, privateJson } from '@/lib/commerce-server';
import { positiveId, record } from '@/lib/commerce-security';
import { getServerWooBaseUrl } from '@/lib/wordpress-endpoints';
export async function POST(req: NextRequest) {
  try {
    checkMutation(req);
    const body = record(await req.json());
    const id = positiveId(body.id);
    if (!id || typeof body.quantity !== 'number' || !Number.isSafeInteger(body.quantity) || body.quantity < 1 || body.quantity > 10000) throw new CommerceError(400, 'Neispravan artikl ili količina.');
    const token = req.cookies.get('wpToken')?.value;
    const res = await fetch(new URL('/wp-json/wc/store/v1/cart/add-item', getServerWooBaseUrl()), {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ id, quantity: body.quantity }), cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new CommerceError(502, 'Dodavanje u košaricu nije uspjelo.');
    return privateJson(await res.json());
  } catch (error) { return commerceError(error); }
}
