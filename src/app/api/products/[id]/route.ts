import { NextRequest } from 'next/server';
import { customerGroup, positiveId, productPricing, record } from '@/lib/commerce-security';
import { commerceError, CommerceError, privateJson, session, woo } from '@/lib/commerce-server';
import { sanitizeWooProduct } from '@/lib/woocommerce-products';
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = positiveId((await params).id);
    if (!id) throw new CommerceError(404, 'Artikl nije pronađen.');
    const user = await session(req, false);
    const group = user ? customerGroup(await woo(`customers/${user.id}`)) : null;
    const product = record(await woo(`products/${id}`));
    if (product.status !== 'publish' || product.catalog_visibility === 'hidden') throw new CommerceError(404, 'Artikl nije pronađen.');
    const price = productPricing(product, group);
    const result = sanitizeWooProduct({ ...product, zvo_regular_price: price.regular, zvo_effective_price: price.effective, zvo_discount_percent: price.discountPercent }, { includeCustomerPricing: true });
    if (!result) throw new Error('Invalid product');
    return privateJson(result);
  } catch (error) { return commerceError(error); }
}
