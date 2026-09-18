import assert from "node:assert/strict";
import test from "node:test";

const { parsePriceListManifest } = await import(new URL("./price-lists.ts", import.meta.url).href) as typeof import("./price-lists");
const origin = "https://wp.example.com";
const entry = {
  id: "a1", filename: "webshop_zagreb_web_1_20260916T050000Z.csv",
  publishedAt: "2026-09-16T05:00:00Z", productCount: 2,
  url: `${origin}/wp-content/uploads/zivic-price-lists/cjenik.csv`,
};
const payload = { version: 1, currency: "EUR", store: { name: "Webshop", address: "Zagreb", code: "web" }, publications: [entry] };

test("accepts empty and populated manifests and drops unrelated internal fields", () => {
  assert.equal(parsePriceListManifest({ ...payload, publications: [] }, origin)?.publications.length, 0);
  const result = parsePriceListManifest({ ...payload, secret: "private" }, origin);
  assert.equal(result?.publications[0].filename, entry.filename);
  assert.ok(result);
  assert.equal("secret" in result, false);
});

test("rejects unsafe or cross-origin file links and traversal", () => {
  for (const url of ["javascript:alert(1)", "https://evil.example/a.csv", `${origin}/wp-admin/a.csv`, `${origin}/wp-content/uploads/zivic-price-lists/../secret.csv`, `${origin}/wp-content/uploads/zivic-price-lists/a.csv?token=secret`]) {
    assert.equal(parsePriceListManifest({ ...payload, publications: [{ ...entry, url }] }, origin), null);
  }
});

test("rejects invalid contract without presenting a partial price list", () => {
  for (const patch of [{ productCount: -1 }, { publishedAt: "yesterday" }, { filename: "../x.csv" }, { id: "" }]) {
    assert.equal(parsePriceListManifest({ ...payload, publications: [{ ...entry, ...patch }] }, origin), null);
  }
  assert.equal(parsePriceListManifest({ ...payload, currency: "USD" }, origin), null);
  assert.equal(parsePriceListManifest({ ...payload, publications: [entry, entry] }, origin), null);
});

test("sorts publications newest first without mutating the response", () => {
  const older = { ...entry, id: "old", publishedAt: "2026-09-15T05:00:00Z" };
  const publications = [older, entry];
  const parsed = parsePriceListManifest({ ...payload, publications }, origin);
  assert.equal(parsed?.publications[0].id, "a1");
  assert.equal(publications[0].id, "old");
});
