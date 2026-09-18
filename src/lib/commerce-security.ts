/** Pure boundary helpers; client identity and prices are never authoritative. */
export function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}
export function positiveId(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (!/^[1-9]\d*$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
export function pick(value: unknown, keys: readonly string[]): Record<string, unknown> {
  const input = record(value);
  return Object.fromEntries(keys.filter(key => input[key] !== undefined).map(key => [key, input[key]]));
}
export const ADDRESS_FIELDS = ['first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'email', 'phone'] as const;
export function address(value: unknown): Record<string, string> {
  const input = record(value);
  const result: Record<string, string> = {};
  for (const key of ADDRESS_FIELDS) {
    if (input[key] === undefined) continue;
    if (typeof input[key] !== 'string' || input[key].length > 250) throw new Error('Invalid address');
    result[key] = input[key].trim();
  }
  return result;
}
export function customerView(value: unknown) {
  const customer = record(value);
  const allowedMeta = ['b2bking_b2buser', 'b2bking_customergroup', 'company_oib', 'company_vat', 'default_note'];
  return { ...pick(customer, ['id', 'email', 'first_name', 'last_name']),
    billing: pick(customer.billing, ADDRESS_FIELDS), shipping: pick(customer.shipping, ADDRESS_FIELDS),
    meta_data: Array.isArray(customer.meta_data) ? customer.meta_data.map(record)
      .filter(m => allowedMeta.includes(String(m.key))).map(m => pick(m, ['key', 'value'])) : [] };
}
export function customerGroup(value: unknown): string | null {
  const data = record(value);
  const meta = Array.isArray(data.meta_data) ? data.meta_data.map(record) : [];
  const flag = meta.find(m => m.key === 'b2bking_b2buser')?.value;
  const group = meta.find(m => m.key === 'b2bking_customergroup')?.value;
  return String(flag).toLowerCase() === 'yes' && positiveId(group) ? String(group) : null;
}
export function productPricing(value: unknown, group: string | null) {
  const p = record(value);
  let regular = Number(p.regular_price || p.price);
  let effective = Number(p.price);
  const meta = Array.isArray(p.meta_data) ? p.meta_data.map(record) : [];
  if (group) {
    const groupRegular = Number(meta.find(m => m.key === `b2bking_regular_product_price_group_${group}`)?.value);
    const groupSale = Number(meta.find(m => m.key === `b2bking_sale_product_price_group_${group}`)?.value);
    if (groupRegular > 0) regular = effective = groupRegular;
    if (groupSale > 0) effective = groupSale;
  }
  return { regular, effective, discountPercent: regular > effective && regular > 0 ? Math.round((regular - effective) / regular * 100) : 0 };
}
export function orderView(value: unknown, summary = false) {
  const order = record(value);
  const base = pick(order, ['id', 'number', 'status', 'date_created', 'total', 'currency']);
  if (summary) return base;
  return { ...base, ...pick(order, ['payment_method', 'customer_note', 'shipping_total']),
    billing: pick(order.billing, ADDRESS_FIELDS),
    line_items: Array.isArray(order.line_items) ? order.line_items.map(item => pick(item, ['id', 'product_id', 'variation_id', 'name', 'quantity', 'total', 'image', 'sku'])) : [] };
}
export function checkoutLines(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) throw new Error('Invalid items');
  const seen = new Set<string>();
  return value.map(item => {
    const line = record(item);
    const product_id = positiveId(line.product_id);
    const variation_id = line.variation_id === undefined || line.variation_id === 0 ? undefined : positiveId(line.variation_id);
    const quantity = line.quantity;
    if (!product_id || variation_id === null || typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) throw new Error('Invalid item');
    const key = `${product_id}:${variation_id ?? 0}`;
    if (seen.has(key)) throw new Error('Duplicate item');
    seen.add(key);
    return { product_id, ...(variation_id ? { variation_id } : {}), quantity };
  });
}
export const BASE_SHIPPING = 5.5;
