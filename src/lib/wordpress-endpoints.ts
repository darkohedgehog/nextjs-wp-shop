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

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function getRestRootBaseUrl(): string | undefined {
  return process.env.WP_REST_ROOT?.replace(/\/wp-json\/?$/, "");
}

function firstSafePublicHttpsUrl(values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (value && isHttpsUrl(value) && !isLoopbackUrl(value)) {
      return withoutTrailingSlash(value);
    }
  }

  return undefined;
}

function protocolAndHost(value: string): string {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "invalid-url";
  }
}

export type WooRestCredentialPresence = {
  consumerKey: boolean;
  consumerSecret: boolean;
};

export function getWooRestLogContext(
  url: URL,
  credentialsPresent: WooRestCredentialPresence,
  statusCode?: number,
): {
  endpointPath: string;
  statusCode?: number;
  baseUrl: string;
  credentialsPresent: WooRestCredentialPresence;
} {
  return {
    endpointPath: url.pathname,
    statusCode,
    baseUrl: `${url.protocol}//${url.host}`,
    credentialsPresent,
  };
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
  // Server-only internal URLs keep browser/public URLs unchanged and avoid public Nginx hops.
  return withoutTrailingSlash(
    process.env.WP_INTERNAL_BASE_URL ||
      getRestRootBaseUrl() ||
      process.env.WP_BASE_URL ||
      getPublicWordPressBaseUrl()
  );
}

export function getPublicWooBaseUrl(): string {
  return (
    firstSafePublicHttpsUrl([
      process.env.NEXT_PUBLIC_WC_BASE_URL,
      process.env.WC_BASE_URL,
      getRestRootBaseUrl(),
      process.env.WP_BASE_URL,
      process.env.NEXT_PUBLIC_WP_BASE_URL,
      process.env.NEXT_PUBLIC_WP_URL,
    ]) || DEFAULT_PUBLIC_WORDPRESS_BASE_URL
  );
}

export function getServerWooBaseUrl(): string {
  const internalBaseUrl = process.env.WOO_INTERNAL_BASE_URL;

  if (internalBaseUrl) {
    if (isHttpsUrl(internalBaseUrl)) {
      return withoutTrailingSlash(internalBaseUrl);
    }

    console.warn(
      "[woocommerce] Ignoring WOO_INTERNAL_BASE_URL for Woo REST Basic Auth because it is not HTTPS",
      { baseUrl: protocolAndHost(internalBaseUrl) },
    );
  }

  return getPublicWooBaseUrl();
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
