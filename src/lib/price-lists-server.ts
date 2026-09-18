import "server-only";
import { getPublicWordPressBaseUrl, getServerWordPressBaseUrl } from "./wordpress-endpoints";
import { parsePriceListManifest, type PriceListManifest } from "./price-lists";

export type PriceListResult = { status: "ready"; manifest: PriceListManifest } | { status: "unavailable" };

export async function getPriceLists(): Promise<PriceListResult> {
  const publicBase = getPublicWordPressBaseUrl();
  const bases = new Set([getServerWordPressBaseUrl(), publicBase]);
  for (const base of bases) {
    try {
      // The internal VPS address may be unavailable during local development.
      // This endpoint is public: never forward credentials to either origin.
      const response = await fetch(`${base}/wp-json/zivic-price-lists/v1/publications`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
        redirect: "error",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) continue;
      const manifest = parsePriceListManifest(await response.json(), publicBase);
      // A malformed manifest is rejected, not replaced by partial data.
      return manifest ? { status: "ready", manifest } : { status: "unavailable" };
    } catch {
      // Try the configured public origin after an internal transport failure.
    }
  }
  return { status: "unavailable" };
}
