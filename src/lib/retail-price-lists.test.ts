import assert from "node:assert/strict";
import test from "node:test";

const { parseRetailPriceListManifest: parse } = await import(new URL("./retail-price-lists.ts", import.meta.url).href) as typeof import("./retail-price-lists");
const base = "https://wp.example.com";
const file = { kind: "current", date: "2026-09-18", publishedAt: "2026-09-18T08:00:00Z", filename: "Cjenik.xls", format: "xls", url: `${base}/wp-content/uploads/2026/09/Cjenik.xls` };
const manifest = { version: 1, store: { name: "Maloprodaja", address: "Adresa 1" }, files: [file] };

test("retail accepts independent empty, current-only and paired publications", () => {
  assert.deepEqual(parse({ ...manifest, files: [] }, base)?.files, []);
  assert.equal(parse(manifest, base)?.files.length, 1);
  const anchor = { ...file, kind: "anchor", date: "2026-09-10" };
  assert.deepEqual(parse({ ...manifest, files: [anchor, file] }, base)?.files.map(f => f.kind), ["current", "anchor"]);
  for (const format of ["xls", "xlsx", "csv"]) {
    assert.ok(parse({ ...manifest, files: [{ ...file, format, filename: `Cjenik.${format}`, url: `${base}/wp-content/uploads/sites/2/2026/09/Cjenik.${format}` }] }, base));
  }
});

test("retail rejects unsafe downloads without exposing partial data", () => {
  for (const url of ["javascript:alert(1)", "https://evil.example/a.xls", `${base}/wp-admin/a.xls`, `${base}/wp-content/uploads/../secret.xls`, `${base}/wp-content/uploads/%2e%2e/secret.xls`, `${base}/wp-content/uploads/%252e%252e/a.xls`, `${base}/wp-content/uploads/a.xls?token=secret`, `${base}/wp-content/uploads/a.xls#hash`, `${base}/wp-content/uploads/a.php`, `http://wp.example.com/wp-content/uploads/a.xls`]) {
    assert.equal(parse({ ...manifest, files: [{ ...file, url }] }, base), null, url);
  }
});

test("retail rejects duplicate slots, invalid calendar dates and mismatched file formats", () => {
  assert.equal(parse({ ...manifest, files: [file, file] }, base), null);
  for (const patch of [{ kind: "other" }, { date: "2026-02-30" }, { date: "yesterday" }, { format: "exe" }, { filename: "../a.xls" }, { format: "csv" }, { publishedAt: "invalid" }]) {
    assert.equal(parse({ ...manifest, files: [{ ...file, ...patch }] }, base), null);
  }
});
