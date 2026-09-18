import assert from 'node:assert/strict';
import test from 'node:test';
const { parseAnchorPrice } = await import(new URL('./anchor-price.ts', import.meta.url).href) as typeof import('./anchor-price');
const recorded = { status: 'recorded', amount: '23.50', referenceDate: '2026-09-10', currency: 'EUR' };
test('only a valid recorded anchor is displayed, without guessing history', () => {
  assert.deepEqual(parseAnchorPrice(recorded), recorded);
  for (const value of [undefined, { ...recorded, status: 'unknown' }, { ...recorded, status: 'not_offered' }, { ...recorded, amount: '-1.00' }, { ...recorded, referenceDate: '2026-02-30' }]) assert.equal(parseAnchorPrice(value), undefined);
});
