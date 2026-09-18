/* eslint-disable @typescript-eslint/no-require-imports -- standalone TSX server-render harness. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const load = Module._load;
Module._load = function (id, parent, main) {
  if (id === 'server-only') return {};
  if (id.startsWith('@/')) id = path.join(root, 'src', id.slice(2));
  return load.call(this, id, parent, main);
};
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
}
const base = 'https://retail-fixture.invalid';
process.env.NEXT_PUBLIC_WP_BASE_URL = base;
process.env.WP_INTERNAL_BASE_URL = base;
process.env.WP_BASE_URL = base;
const page = require('../src/app/price-list/page.tsx').default;
const entry = { kind: 'current', date: '2026-09-18', publishedAt: '2026-09-18T08:00:00Z', filename: 'Current.xls', format: 'xls', url: `${base}/wp-content/uploads/2026/09/Current.xls` };
const retail = { version: 1, store: { name: 'Prodavaonica', address: 'Testna adresa' }, files: [entry, { ...entry, kind: 'anchor', date: '2026-09-10', filename: 'Anchor.xls', url: `${base}/wp-content/uploads/2026/09/Anchor.xls` }] };
function transport(retailData, webshopAvailable = false) {
  global.fetch = async (input, init) => {
    const url = new URL(input);
    assert.equal(url.origin, base);
    assert.equal(init.cache, 'no-store');
    assert.equal(init.headers.Authorization, undefined);
    if (url.pathname.endsWith('/retail')) return new Response(JSON.stringify(retailData));
    assert.ok(url.pathname.endsWith('/publications'));
    return new Response(JSON.stringify({ version: 1, currency: 'EUR', store: { name: 'Webshop', address: '', code: '' }, publications: [] }), { status: webshopAvailable ? 200 : 503 });
  };
}
test('retail downloads render even when webshop publication is unavailable', async () => {
  transport(retail);
  const html = renderToStaticMarkup(await page());
  assert.match(html, /Cjenik trenutačno nije dostupan/);
  assert.match(html, /Aktualni cjenik s usporedbom cijena/);
  assert.match(html, /Cijene na referentni datum/);
  assert.ok(html.includes(`href="${entry.url}"`));
  assert.match(html, /Testna adresa/);
});
test('empty and invalid retail manifests show clear states without unsafe downloads', async () => {
  transport({ ...retail, files: [] }, true);
  assert.match(renderToStaticMarkup(await page()), /Maloprodajni cjenici još nisu objavljeni/);
  transport({ ...retail, files: [{ ...entry, url: 'https://evil.invalid/file.xls' }] }, true);
  const html = renderToStaticMarkup(await page());
  assert.match(html, /Maloprodajni cjenici trenutačno nisu dostupni/);
  assert.equal(html.includes('evil.invalid'), false);
  assert.match(html, /Cjenik još nije objavljen/);
});
