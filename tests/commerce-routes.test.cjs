/* eslint-disable @typescript-eslint/no-require-imports -- isolated CommonJS loader for real TypeScript route tests. */
/* Integration of actual route handlers with a closed, in-memory WordPress transport. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const originalLoad = Module._load;
Module._load = function (id, parent, main) {
  if (id === 'server-only') return {};
  if (id.startsWith('@/')) id = path.join(root, 'src', id.slice(2));
  return originalLoad.call(this, id, parent, main);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
const { NextRequest } = require('next/server');
const route = name => require(path.join(root, 'src/app/api', name, 'route.ts'));
const customer = route('customer/[id]'); const orders = route('orders'); const order = route('orders/[id]');
const checkout = route('create-order'); const product = route('products/[id]'); const b2b = route('b2b-prices'); const login = route('store-login');
process.env.WC_BASE_URL = 'https://fixture.invalid'; process.env.WC_KEY = 'test-key'; process.env.WC_SECRET = 'test-secret';
process.env.WC_CONSUMER_KEY = 'test-key'; process.env.WC_CONSUMER_SECRET = 'test-secret'; process.env.WOO_INTERNAL_BASE_URL = 'https://fixture.invalid';
let calls, writes, failProduct, productOverrides, variationOverrides, failLogin, failIdentity;
const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
test.beforeEach(() => {
  calls = []; writes = []; failProduct = false; productOverrides = {}; variationOverrides = {}; failLogin = false; failIdentity = false;
  global.fetch = async (input, init = {}) => {
    const url = new URL(input); assert.equal(url.origin, 'https://fixture.invalid');
    calls.push(url.pathname);
    if (url.pathname.endsWith('/users/me')) {
      if (failIdentity) return response({ secret: 'upstream-secret' }, 500);
      const token = init.headers.Authorization;
      return token === 'Bearer buyer' ? response({ id: 7, email: 'buyer@example.invalid' }) : token === 'Bearer b2b' ? response({ id: 8 }) : response({}, 401);
    }
    if (url.pathname.endsWith('/jwt-auth/v1/token')) return failLogin ? response({ token: 'upstream-secret' }, 401) : response({ data: { token: 'buyer' } });
    if (init.method === 'POST' && url.pathname.endsWith('/customers')) {
      assert.equal(url.searchParams.has('consumer_key'), false);
      assert.match(init.headers.Authorization, /^Basic /);
      writes.push(JSON.parse(init.body)); return response({ id: 99, meta_data: ['private'] }, 201);
    }
    if (init.method === 'POST' && url.pathname.endsWith('/orders')) { writes.push(JSON.parse(init.body)); return response({ id: 10, order_key: 'wc_order_testkey', private: 'secret' }); }
    if (url.pathname.match(/\/customers\/[78]$/)) {
      if (init.method === 'PUT') writes.push(JSON.parse(init.body));
      return response({ id: Number(url.pathname.slice(-1)), billing: { first_name: 'Test' }, meta_data: url.pathname.endsWith('/8') ? [{ key: 'b2bking_b2buser', value: 'yes' }, { key: 'b2bking_customergroup', value: 308 }] : [] });
    }
    if (url.pathname.endsWith('/orders/10')) return response({ id: 10, customer_id: 7, order_key: 'wc_order_testkey', billing: { first_name: 'Test' }, line_items: [], meta_data: ['secret'] });
    if (url.pathname.endsWith('/orders')) { assert.equal(url.searchParams.get('customer'), '7'); return response([{ id: 10, order_key: 'secret' }]); }
    if (/\/products\/1\/variations\/[23]$/.test(url.pathname)) return response({ id: Number(url.pathname.slice(-1)), status: 'publish', price: '20', manage_stock: 'parent', stock_status: 'instock', ...variationOverrides });
    if (url.pathname.endsWith('/products')) return response([{ id: 1, status: 'publish', meta_data: [{ key: 'b2bking_regular_product_price_group_308', value: '15' }] }]);
    if (url.pathname.endsWith('/products/1')) return failProduct ? response({}, 500) : response({ id: 1, name: 'Product', slug: 'product', type: 'simple', status: 'publish', price: '20', regular_price: '20', stock_status: 'instock', meta_data: [{ key: 'b2bking_regular_product_price_group_308', value: '15' }], ...productOverrides });
    throw new Error(`Unexpected fixture endpoint ${url.pathname}`);
  };
});
const req = (url, token, body, extra = {}) => new NextRequest(`http://localhost:3000/api/${url}`, {
  method: body ? 'POST' : 'GET', headers: { ...(token ? { cookie: `wpToken=${token}` } : {}), ...(body ? { 'Content-Type': 'application/json', origin: 'http://localhost:3000' } : {}), ...extra }, ...(body ? { body: JSON.stringify(body) } : {}),
});
const params = id => ({ params: Promise.resolve({ id: String(id) }) });
const address = { first_name: 'Test', last_name: 'Buyer', address_1: 'Test 1', city: 'Zagreb', postcode: '10000', country: 'HR', email: 'test@example.invalid', phone: '000' };
const body = { accepted_terms: true, payment_method: 'cod', billing: address, shipping: address, line_items: [{ product_id: 1, quantity: 2, total: '0', subtotal: '0', meta_data: ['evil'] }], shipping_lines: [{ total: '0' }] };
test('customer access denies absent, forged and other-user sessions before privileged reads', async () => {
  assert.equal((await customer.GET(req('customer/7'), params(7))).status, 401);
  assert.equal((await customer.GET(req('customer/7', 'fake'), params(7))).status, 401);
  assert.equal((await customer.GET(req('customer/9', 'buyer'), params(9))).status, 403);
  assert.ok(!calls.some(p => p.includes('/customers/')));
  const own = await customer.GET(req('customer/7', 'buyer'), params(7)); assert.equal(own.status, 200);
  assert.equal((await own.json()).id, 7);
});
test('customer writes require owner and same origin, and ignore permission metadata', async () => {
  assert.equal((await customer.PUT(req('customer/9', 'buyer', { first_name: 'Other' }), params(9))).status, 403);
  assert.equal((await customer.PUT(req('customer/7', 'buyer', address, { origin: 'https://evil.invalid' }), params(7))).status, 403);
  assert.equal(writes.length, 0);
  assert.equal((await customer.PUT(req('customer/7', 'buyer', { ...address, role: 'administrator', meta_data: [{ key: 'b2bking_customergroup', value: 308 }] }), params(7))).status, 200);
  assert.equal(writes[0].role, undefined); assert.deepEqual(writes[0].meta_data, []);
});
test('order lists enforce owner and details require owner or order key', async () => {
  assert.equal((await orders.GET(req('orders?customer=9', 'buyer'))).status, 403);
  assert.equal((await orders.GET(req('orders?customer=7', 'buyer'))).status, 200);
  assert.equal((await order.GET(req('orders/10'), params(10))).status, 401);
  assert.equal((await order.GET(req('orders/10', 'b2b'), params(10))).status, 404);
  assert.equal((await order.GET(req('orders/10?key=wrong'), params(10))).status, 404);
  for (const request of [req('orders/10', 'buyer'), req('orders/10?key=wc_order_testkey')]) {
    const res = await order.GET(request, params(10)); assert.equal(res.status, 200);
    assert.ok(!(await res.text()).includes('order_key'));
  }
});
test('checkout rejects forged identity, invalid quantity and product failure without write', async () => {
  assert.equal((await checkout.POST(req('create-order', null, { ...body, customer_id: 8 }))).status, 403);
  assert.equal((await checkout.POST(req('create-order', 'fake', body))).status, 401);
  for (const quantity of [0, -1, 1.5, '2']) assert.equal((await checkout.POST(req('create-order', null, { ...body, line_items: [{ product_id: 1, quantity }] }))).status, 400);
  failProduct = true;
  assert.equal((await checkout.POST(req('create-order', null, body))).status, 502);
  assert.equal(writes.length, 0);
});
test('retail guest checkout strips prices and preserves agreed COD and delivery behavior', async () => {
  const res = await checkout.POST(req('create-order', null, body)); assert.equal(res.status, 201);
  assert.deepEqual(writes[0].line_items, [{ product_id: 1, quantity: 2 }]);
  assert.equal(writes[0].shipping_lines[0].total, '5.50'); assert.equal(writes[0].set_paid, true);
  assert.equal(writes[0].status, 'processing'); assert.equal(writes[0].customer_id, 0);
  assert.deepEqual(await res.json(), { id: 10, order_key: 'wc_order_testkey' });
});
test('B2B checkout derives group amount and free delivery; BACS stays unpaid', async () => {
  const res = await checkout.POST(req('create-order', 'b2b', { ...body, payment_method: 'bacs' })); assert.equal(res.status, 201);
  assert.equal(writes[0].line_items[0].total, '30.00'); assert.equal(writes[0].shipping_lines[0].total, '0.00');
  assert.equal(writes[0].set_paid, false); assert.equal(writes[0].customer_id, 8);
});
test('forged email cannot select B2B price and group override is rejected', async () => {
  const res = await product.GET(req('products/1', null, null, { cookie: 'wpUserEmail=victim@example.invalid' }), params(1));
  assert.equal((await res.json()).zvo_effective_price, 20);
  assert.equal((await b2b.GET(req('b2b-prices?ids=1&groupId=309', 'b2b'))).status, 403);
  assert.equal((await b2b.GET(req('b2b-prices?ids=1&groupId=308'))).status, 401);
});
test('login verifies upstream identity and only returns a profile, not a bearer token', async () => {
  const res = await login.POST(req('store-login', null, { username: 'fixture', password: 'fixture' }));
  assert.equal(res.status, 200); assert.deepEqual(await res.json(), { data: { id: 7, email: 'buyer@example.invalid' } });
  assert.match(res.headers.get('set-cookie'), /HttpOnly/i);
});
test('variation inventory aggregates parent-managed stock and permits backorders', async () => {
  productOverrides = { type: 'variable', manage_stock: true, stock_quantity: 3, backorders_allowed: false };
  const variants = { ...body, line_items: [{ product_id: 1, variation_id: 2, quantity: 2 }, { product_id: 1, variation_id: 3, quantity: 2 }] };
  assert.equal((await checkout.POST(req('create-order', null, variants))).status, 400);
  assert.equal(writes.length, 0);
  productOverrides.backorders_allowed = true;
  assert.equal((await checkout.POST(req('create-order', null, variants))).status, 201);
  assert.equal(writes[0].line_items[1].variation_id, 3);
});
test('unpublished, unpurchasable and insufficient-stock products never create orders', async () => {
  for (const overrides of [{ status: 'draft' }, { purchasable: false }, { manage_stock: true, stock_quantity: 1, backorders_allowed: false }]) {
    productOverrides = overrides;
    assert.equal((await checkout.POST(req('create-order', null, body))).status, 400);
  }
  assert.equal(writes.length, 0);
});
test('verified B2B product and batch pricing controls', async () => {
  const p = await product.GET(req('products/1', 'b2b'), params(1));
  assert.equal((await p.json()).zvo_effective_price, 15);
  const prices = await b2b.GET(req('b2b-prices?ids=1&groupId=308', 'b2b'));
  assert.equal(prices.status, 200); assert.deepEqual(await prices.json(), { 1: { regular: '15' } });
});
test('login and identity upstream failures never disclose raw responses or issue cookies', async () => {
  for (const failure of ['login', 'identity']) {
    failLogin = failure === 'login'; failIdentity = failure === 'identity';
    const res = await login.POST(req('store-login', null, { username: 'fixture', password: 'fixture' }));
    assert.ok(res.status >= 400); assert.equal(res.headers.get('set-cookie'), null);
    assert.ok(!(await res.text()).includes('upstream-secret'));
  }
});
test('price-list falls back from unavailable internal origin without sending credentials', async () => {
  const { getPriceLists } = require('../src/lib/price-lists-server.ts');
  const previous = { internal: process.env.WP_INTERNAL_BASE_URL, public: process.env.NEXT_PUBLIC_WP_BASE_URL };
  process.env.WP_INTERNAL_BASE_URL = 'http://127.0.0.1:8080';
  process.env.NEXT_PUBLIC_WP_BASE_URL = 'https://public.invalid';
  const origins = [];
  try {
    global.fetch = async (input, init) => {
      const url = new URL(input); origins.push(url.origin);
      assert.deepEqual(init.headers, { Accept: 'application/json' });
      if (url.hostname === '127.0.0.1') throw new Error('connection refused');
      return response({ version: 1, currency: 'EUR', store: { name: 'Test', address: '', code: '' }, publications: [] });
    };
    const result = await getPriceLists();
    assert.equal(result.status, 'ready'); assert.equal(result.manifest.publications.length, 0);
    assert.deepEqual(origins, ['http://127.0.0.1:8080', 'https://public.invalid']);
    global.fetch = async () => response({ invalid: true });
    assert.equal((await getPriceLists()).status, 'unavailable');
  } finally {
    if (previous.internal === undefined) delete process.env.WP_INTERNAL_BASE_URL; else process.env.WP_INTERNAL_BASE_URL = previous.internal;
    if (previous.public === undefined) delete process.env.NEXT_PUBLIC_WP_BASE_URL; else process.env.NEXT_PUBLIC_WP_BASE_URL = previous.public;
  }
});
test('B2B registration retains the explicitly agreed group assignment', async () => {
  const registration = route('store-register');
  const res = await registration.POST(req('store-register', null, { email: 'test@example.invalid', username: 'test', password: 'fixture', first_name: 'Test', last_name: 'Buyer', isB2B: true }));
  assert.equal(res.status, 201);
  assert.deepEqual(writes[0].meta_data.slice(0, 2), [{ key: 'b2bking_b2buser', value: 'yes' }, { key: 'b2bking_customergroup', value: 308 }]);
  assert.deepEqual(await res.json(), { id: 99 });
});
test('production public origins pass validation behind an internal HTTP proxy', async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const handlers = [login, route('lost-password'), route('store-register')];
    for (const origin of ['https://www.zivic-elektro.shop', 'https://zivic-elektro.shop']) {
      for (const handler of handlers) {
        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST', headers: { origin, 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' }, body: '{}',
        });
        // Empty input must reach field validation without contacting WordPress.
        const res = await handler.POST(request);
        assert.equal(res.status, 400);
        assert.notEqual((await res.json()).error, 'Zahtjev nije dopušten.');
      }
    }
    assert.equal(calls.length, 0);
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous;
  }
});
test('production origin check rejects lookalikes, insecure origins and spoofed proxy headers', async () => {
  const { checkMutation } = require('../src/lib/commerce-server.ts');
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    for (const origin of ['https://evil.invalid', 'https://www.zivic-elektro.shop.evil.invalid', 'http://www.zivic-elektro.shop', 'http://localhost:3000', 'null']) {
      const request = new NextRequest('http://localhost:3000/api/store-login', {
        method: 'POST', headers: { origin, 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', 'x-forwarded-host': origin.replace(/^https?:\/\//, ''), 'x-forwarded-proto': 'https' }, body: '{}',
      });
      assert.throws(() => checkMutation(request), error => error.status === 403);
    }
    assert.throws(() => checkMutation(new NextRequest('http://localhost:3000/api/store-login', {
      method: 'POST', headers: { origin: 'https://www.zivic-elektro.shop', 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' }, body: '{}',
    })), error => error.status === 403);
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous;
  }
});
