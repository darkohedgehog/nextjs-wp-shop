import assert from 'node:assert/strict';
import test from 'node:test';
const { safeHtml } = await import(new URL('./safe-html.ts', import.meta.url).href) as typeof import('./safe-html');
test('editorial HTML retains formatting and removes script, events, unsafe URLs and SVG', () => {
  const html = safeHtml('<p>Opis <strong>proizvoda</strong></p><script>alert(1)</script><img src="https://example.invalid/a.jpg" onerror="alert(1)"><a href="java&#115;cript:alert(1)">link</a><svg onload="alert(1)"></svg><iframe srcdoc="evil"></iframe>');
  assert.ok(html.includes('<strong>proizvoda</strong>'));
  assert.ok(html.includes('https://example.invalid/a.jpg'));
  for (const forbidden of ['script', 'onerror', 'onload', '<svg', 'iframe', 'srcdoc']) assert.ok(!html.includes(forbidden));
});
