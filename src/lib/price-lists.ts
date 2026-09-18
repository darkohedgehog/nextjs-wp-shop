export type PriceListPublication = {
  id: string;
  filename: string;
  publishedAt: string;
  productCount: number;
  url: string;
};

export type PriceListManifest = {
  version: 1;
  currency: "EUR";
  store: { name: string; address: string; code: string };
  publications: PriceListPublication[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 300;
}

/** Only allow public CSV files from the configured WordPress upload directory. */
function isDownloadUrl(value: unknown, wordpressBase: string): value is string {
  if (typeof value !== "string" || value.length > 2048 || /[\\\s]/.test(value)) return false;
  try {
    const url = new URL(value);
    const base = new URL(wordpressBase);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
    return url.origin === base.origin && (url.protocol === "https:" || (local && url.protocol === "http:")) &&
      !url.username && !url.password && !url.search && !url.hash &&
      /^\/.*wp-content\/uploads\/(?:sites\/\d+\/)?zivic-price-lists\/[a-zA-Z0-9_-]+\.csv$/.test(url.pathname) &&
      !value.includes("/../") && !value.includes("/./");
  } catch {
    return false;
  }
}

export function parsePriceListManifest(value: unknown, wordpressBase: string): PriceListManifest | null {
  if (!isRecord(value) || value.version !== 1 || value.currency !== "EUR" ||
      !isRecord(value.store) || !Array.isArray(value.publications) || value.publications.length > 5000) return null;
  const { name, address, code } = value.store;
  if (!isText(name) || typeof address !== "string" || address.length > 300 || typeof code !== "string" || code.length > 100) return null;
  const publications: PriceListPublication[] = [];
  const ids = new Set<string>();
  for (const item of value.publications) {
    if (!isRecord(item) || !isText(item.id) || ids.has(item.id) ||
        typeof item.filename !== "string" || !/^[a-zA-Z0-9_-]{1,240}\.csv$/.test(item.filename) ||
        typeof item.publishedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(item.publishedAt) ||
        !Number.isFinite(Date.parse(item.publishedAt)) ||
        typeof item.productCount !== "number" || !Number.isSafeInteger(item.productCount) || item.productCount < 1 ||
        !isDownloadUrl(item.url, wordpressBase)) return null;
    ids.add(item.id);
    publications.push({ id: item.id, filename: item.filename, publishedAt: item.publishedAt, productCount: item.productCount, url: item.url });
  }
  publications.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return { version: 1, currency: "EUR", store: { name, address, code }, publications };
}
