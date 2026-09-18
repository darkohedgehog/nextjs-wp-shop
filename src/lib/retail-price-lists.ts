export type RetailPriceList = {
  kind: "current" | "anchor";
  date: string;
  publishedAt: string;
  filename: string;
  format: "xls" | "xlsx" | "csv";
  url: string;
};
export type RetailPriceListManifest = {
  version: 1;
  store: { name: string; address: string };
  files: RetailPriceList[];
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validDownload(value: string, base: string, format: string): boolean {
  try {
    if (value.length > 2048 || /[\\\s]/.test(value)) return false;
    const url = new URL(value);
    const origin = new URL(base);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    const path = decodeURIComponent(url.pathname);
    return url.origin === origin.origin && (url.protocol === "https:" || (local && url.protocol === "http:")) &&
      !url.username && !url.password && !url.search && !url.hash &&
      !/[\\%\x00-\x1f\x7f]/.test(path) && !/(?:^|\/)\.{1,2}(?:\/|$)/.test(decodeURIComponent(value)) &&
      /^\/.*wp-content\/uploads\/(?:[^/]+\/)*[^/]+\.(xls|xlsx|csv)$/i.test(path) &&
      path.toLowerCase().endsWith(`.${format}`);
  } catch { return false; }
}

export function parseRetailPriceListManifest(value: unknown, wordpressBase: string): RetailPriceListManifest | null {
  if (!record(value) || value.version !== 1 || !record(value.store) || !Array.isArray(value.files) || value.files.length > 2) return null;
  const { name, address } = value.store;
  if (typeof name !== "string" || !name.trim() || name.length > 300 || typeof address !== "string" || address.length > 300) return null;
  const files: RetailPriceList[] = [];
  const kinds = new Set<string>();
  for (const entry of value.files) {
    if (!record(entry) || (entry.kind !== "current" && entry.kind !== "anchor") || kinds.has(entry.kind) ||
        typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) ||
        !Number.isFinite(Date.parse(entry.date)) || new Date(entry.date).toISOString().slice(0, 10) !== entry.date ||
        typeof entry.publishedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(entry.publishedAt) || !Number.isFinite(Date.parse(entry.publishedAt)) ||
        typeof entry.filename !== "string" || !entry.filename || entry.filename.length > 255 || /[\/\\\x00-\x1f\x7f]/.test(entry.filename) ||
        (entry.format !== "xls" && entry.format !== "xlsx" && entry.format !== "csv") ||
        !entry.filename.toLowerCase().endsWith(`.${entry.format}`) ||
        typeof entry.url !== "string" || !validDownload(entry.url, wordpressBase, entry.format)) return null;
    kinds.add(entry.kind);
    files.push({ kind: entry.kind, date: entry.date, publishedAt: entry.publishedAt, filename: entry.filename, format: entry.format, url: entry.url });
  }
  files.sort((a, b) => a.kind === b.kind ? 0 : a.kind === "current" ? -1 : 1);
  return { version: 1, store: { name, address }, files };
}
