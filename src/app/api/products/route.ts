import { NextRequest } from 'next/server';
import { customerGroup, positiveId, productPricing, record } from '@/lib/commerce-security';
import { commerceError, CommerceError, privateJson, session, woo } from '@/lib/commerce-server';
import { sanitizeWooProducts } from '@/lib/woocommerce-products';
export async function GET(req: NextRequest) {
  try {
    const include = req.nextUrl.searchParams.get('include');
    const ids = include?.split(',').map(positiveId);
    const count = positiveId(req.nextUrl.searchParams.get('per_page') ?? '10');
    if (!count || count > 100 || (ids && (ids.length > 100 || ids.some(id => id === null)))) throw new CommerceError(400, 'Neispravni artikli.');
    const user = await session(req, false);
    const group = user ? customerGroup(await woo(`customers/${user.id}`)) : null;
    const products = await woo(`products?status=publish&per_page=${count}${ids ? `&include=${ids.join(',')}` : ''}`);
    if (!Array.isArray(products)) throw new Error('Invalid products');
    const result = products.map(record).filter(p => p.status === 'publish' && p.catalog_visibility !== 'hidden').map(p => {
      const price = productPricing(p, group);
      return { ...p, zvo_regular_price: price.regular, zvo_effective_price: price.effective, zvo_discount_percent: price.discountPercent };
    });
    return privateJson(sanitizeWooProducts(result, { includeCustomerPricing: true }));
  } catch (error) { return commerceError(error); }
}
