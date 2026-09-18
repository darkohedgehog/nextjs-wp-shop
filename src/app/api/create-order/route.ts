import { NextRequest } from 'next/server';
import { address, BASE_SHIPPING, checkoutLines, customerGroup, positiveId, productPricing, record } from '@/lib/commerce-security';
import { checkMutation, commerceError, CommerceError, privateJson, session, woo } from '@/lib/commerce-server';

export async function POST(req: NextRequest) {
  try {
    checkMutation(req);
    const body = record(await req.json());
    if (body.accepted_terms !== true) throw new CommerceError(400, 'Morate prihvatiti uvjete korištenja.');
    if (body.payment_method !== 'cod' && body.payment_method !== 'bacs') throw new CommerceError(400, 'Neispravan način plaćanja.');
    const user = await session(req, false);
    const customerId = user?.id ?? 0;
    if (body.customer_id !== undefined && body.customer_id !== 0 && positiveId(body.customer_id) !== customerId) throw new CommerceError(403, 'Prijavite se ponovno prije narudžbe.');
    const group = user ? customerGroup(await woo(`customers/${user.id}`)) : null;
    let billing, shipping, lines;
    try {
      billing = address(body.billing); shipping = address(body.shipping); lines = checkoutLines(body.line_items);
    } catch { throw new CommerceError(400, 'Provjerite artikle, količine i adresu.'); }
    for (const a of [billing, shipping]) {
      if (a.country !== 'HR' || ['first_name', 'last_name', 'address_1', 'city', 'postcode'].some(key => !a[key])) throw new CommerceError(400, 'Unesite potpunu adresu u Hrvatskoj.');
    }
    if (!billing.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email) || !billing.phone) throw new CommerceError(400, 'Unesite email i telefon.');
    if (body.customer_note !== undefined && (typeof body.customer_note !== 'string' || body.customer_note.length > 2000)) throw new CommerceError(400, 'Napomena je preduga.');
    const line_items = [];
    const stockUsage = new Map<number, number>();
    for (const line of lines) {
      const parent = record(await woo(`products/${line.product_id}`));
      if (parent.status !== 'publish' || parent.catalog_visibility === 'hidden') throw new CommerceError(400, 'Artikl nije dostupan.');
      if (!line.variation_id && parent.type !== 'simple') throw new CommerceError(400, 'Odaberite dostupnu varijantu artikla.');
      if (line.variation_id && parent.type !== 'variable') throw new CommerceError(400, 'Neispravna varijanta.');
      const product = line.variation_id ? record(await woo(`products/${line.product_id}/variations/${line.variation_id}`)) : parent;
      if (product.status !== 'publish' || product.purchasable === false || product.stock_status === 'outofstock') throw new CommerceError(400, 'Artikl nije dostupan.');
      const usesParentStock = Boolean(line.variation_id && parent.manage_stock === true && product.manage_stock !== true);
      const stockOwner = usesParentStock ? parent : product;
      const stockId = usesParentStock ? line.product_id : (line.variation_id ?? line.product_id);
      const requestedStock = (stockUsage.get(stockId) ?? 0) + line.quantity;
      stockUsage.set(stockId, requestedStock);
      if (stockOwner.stock_status === 'outofstock' || (stockOwner.manage_stock === true && stockOwner.backorders_allowed !== true && typeof stockOwner.stock_quantity === 'number' && requestedStock > stockOwner.stock_quantity)) throw new CommerceError(400, 'Tražena količina nije dostupna.');
      const { effective } = productPricing(product, group);
      if (!Number.isFinite(effective) || effective <= 0) throw new CommerceError(400, 'Cijena artikla nije dostupna.');
      // Retail totals are calculated by WooCommerce from the product. Group amounts
      // come exclusively from verified customer/product metadata, never the request.
      line_items.push({ ...line, ...(group ? { subtotal: (effective * line.quantity).toFixed(2), total: (effective * line.quantity).toFixed(2) } : {}) });
    }
    const order = record(await woo('orders', { method: 'POST', body: JSON.stringify({
      customer_id: customerId, payment_method: body.payment_method,
      payment_method_title: body.payment_method === 'cod' ? 'Plaćanje pouzećem' : 'Direct Bank Transfer',
      status: 'processing', set_paid: body.payment_method === 'cod',
      billing, shipping, customer_note: body.customer_note ?? '', line_items,
      shipping_lines: [{ method_id: 'flat_rate', method_title: 'Flat Rate', total: (group ? 0 : BASE_SHIPPING).toFixed(2) }],
      meta_data: [{ key: '_accepted_terms', value: 'yes' }],
    }) }));
    return privateJson({ id: order.id, order_key: order.order_key }, 201);
  } catch (error) { return commerceError(error); }
}
