const DEFAULT_PUBLIC_WORDPRESS_BASE_URL = "https://wp.zivic-elektro.shop";

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function joinUrl(baseUrl: string, path: string): string {
  return `${withoutTrailingSlash(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
}

function isLoopbackUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname;
    return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1";
  } catch {
    return false;
  }
}

export function getPublicWordPressBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_WP_BASE_URL || process.env.NEXT_PUBLIC_WP_URL;

  if (configured && !isLoopbackUrl(configured)) {
    return withoutTrailingSlash(configured);
  }

  return DEFAULT_PUBLIC_WORDPRESS_BASE_URL;
}

export function getPublicGraphqlUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL;

  if (configured && !isLoopbackUrl(configured)) {
    return configured;
  }

  return joinUrl(getPublicWordPressBaseUrl(), "/graphql");
}

export function getServerWordPressBaseUrl(): string {
  const restRoot = process.env.WP_REST_ROOT;
  const restRootBase = restRoot?.replace(/\/wp-json\/?$/, "");

  // Server-only internal URLs keep browser/public URLs unchanged and avoid public Nginx hops.
  return withoutTrailingSlash(
    process.env.WP_INTERNAL_BASE_URL ||
      restRootBase ||
      process.env.WP_BASE_URL ||
      getPublicWordPressBaseUrl()
  );
}

export function getServerGraphqlUrl(): string {
  // Do not use WP_INTERNAL_* in browser/client code; these are server-only fallbacks.
  if (process.env.WP_INTERNAL_GRAPHQL_URL) return process.env.WP_INTERNAL_GRAPHQL_URL;
  if (process.env.WP_GRAPHQL_URL) return process.env.WP_GRAPHQL_URL;

  if (process.env.WP_INTERNAL_BASE_URL || process.env.WP_BASE_URL) {
    return joinUrl(getServerWordPressBaseUrl(), "/graphql");
  }

  return getPublicGraphqlUrl();
}
