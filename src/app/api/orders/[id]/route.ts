import { NextRequest } from 'next/server';
import { orderView, positiveId, record } from '@/lib/commerce-security';
import { commerceError, CommerceError, privateJson, session, validOrderKey, woo } from '@/lib/commerce-server';
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = positiveId((await params).id);
    if (!id) throw new CommerceError(404, 'Narudžba nije pronađena.');
    const key = req.nextUrl.searchParams.get('key');
    // Without a key, authenticate before issuing any privileged lookup.
    const user = key ? null : await session(req);
    const order = record(await woo(`orders/${id}`));
    if (!validOrderKey(key, order.order_key) && !(user && positiveId(order.customer_id) === user.id)) {
      throw new CommerceError(404, 'Narudžba nije pronađena.');
    }
    return privateJson(orderView(order));
  } catch (error) { return commerceError(error); }
}
