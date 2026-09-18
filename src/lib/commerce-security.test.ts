import assert from 'node:assert/strict';
import test from 'node:test';
const helpers = await import(new URL('./commerce-security.ts', import.meta.url).href) as typeof import('./commerce-security');
const { checkoutLines, positiveId, productPricing, customerView, orderView, customerGroup } = helpers;
test('IDs and quantities reject coercion, fractions, negative and malformed values', () => {
  for (const id of [true, [], {}, '1e2', '1/foo', -1, 1.1, '01', Number.MAX_SAFE_INTEGER + 1]) assert.equal(positiveId(id), null);
  for (const quantity of [0, -1, 1.1, '2', NaN, 10001]) assert.throws(() => checkoutLines([{ product_id: 1, quantity }]));
  assert.throws(() => checkoutLines([]));
  assert.throws(() => checkoutLines([{ product_id: 1, quantity: 1 }, { product_id: 1, quantity: 2 }]));
});
test('checkout items discard all client financial and metadata fields', () => {
  assert.deepEqual(checkoutLines([{ product_id: 1, quantity: 2, variation_id: 3, price: 0, total: '0', subtotal: '0', tax_class: 'zero', meta_data: [{ key: 'evil' }] }]), [{ product_id: 1, variation_id: 3, quantity: 2 }]);
});
test('group regular price is effective without sale; sale and retail controls', () => {
  const product = { price: '20', regular_price: '25', meta_data: [{ key: 'b2bking_regular_product_price_group_308', value: '15' }] };
  assert.equal(productPricing(product, null).effective, 20);
  assert.equal(productPricing(product, '308').effective, 15);
  assert.equal(productPricing({ ...product, meta_data: [...product.meta_data, { key: 'b2bking_sale_product_price_group_308', value: '12' }] }, '308').effective, 12);
  assert.equal(customerGroup({ meta_data: [{ key: 'b2bking_customergroup', value: 308 }] }), null);
});
test('customer and order responses do not expose privileged metadata or keys', () => {
  assert.deepEqual(customerView({ id: 1, password: 'private', meta_data: [{ key: 'secret', value: 'private' }] }).meta_data, []);
  const order = orderView({ id: 1, order_key: 'secret', customer_ip_address: 'private', line_items: [{ id: 2, meta_data: ['secret'] }] });
  assert.ok(!JSON.stringify(order).includes('secret'));
  assert.ok(!JSON.stringify(order).includes('private'));
});
