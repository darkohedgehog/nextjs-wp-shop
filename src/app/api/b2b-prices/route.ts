import { NextRequest } from 'next/server';
import { customerGroup, positiveId, record } from '@/lib/commerce-security';
import { commerceError, CommerceError, privateJson, session, woo } from '@/lib/commerce-server';
export async function GET(req: NextRequest) {
  try {
    const user = (await session(req))!;
    const group = customerGroup(await woo(`customers/${user.id}`));
    const requested = req.nextUrl.searchParams.get('groupId');
    if (!group || (requested !== null && requested !== group)) throw new CommerceError(403, 'Pristup nije dopušten.');
    const ids = req.nextUrl.searchParams.get('ids')?.split(',').map(positiveId);
    if (!ids?.length || ids.length > 100 || ids.some(id => id === null)) throw new CommerceError(400, 'Neispravni artikli.');
    const products = await woo(`products?status=publish&include=${ids.join(',')}&per_page=${ids.length}`);
    if (!Array.isArray(products)) throw new Error('Invalid products');
    const result: Record<string, { regular?: string; sale?: string }> = {};
    for (const value of products) {
      const product = record(value);
      if (product.status !== 'publish' || product.catalog_visibility === 'hidden') continue;
      const meta = Array.isArray(product.meta_data) ? product.meta_data.map(record) : [];
      const regular = meta.find(m => m.key === `b2bking_regular_product_price_group_${group}`)?.value;
      const sale = meta.find(m => m.key === `b2bking_sale_product_price_group_${group}`)?.value;
      result[String(product.id)] = { regular: regular == null ? undefined : String(regular), sale: sale == null ? undefined : String(sale) };
    }
    return privateJson(result);
  } catch (error) { return commerceError(error); }
}
