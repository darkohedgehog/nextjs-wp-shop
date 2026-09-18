import { NextRequest } from 'next/server';
import { orderView, positiveId } from '@/lib/commerce-security';
import { commerceError, CommerceError, privateJson, session, woo } from '@/lib/commerce-server';
export async function GET(req: NextRequest) {
  try {
    const user = (await session(req))!;
    const requested = req.nextUrl.searchParams.get('customer');
    if (requested !== null && positiveId(requested) !== user.id) throw new CommerceError(403, 'Pristup nije dopušten.');
    const orders = await woo(`orders?customer=${user.id}&orderby=date&order=desc&per_page=20`);
    if (!Array.isArray(orders)) throw new Error('Invalid orders');
    return privateJson(orders.map(order => orderView(order, true)));
  } catch (error) { return commerceError(error); }
}
