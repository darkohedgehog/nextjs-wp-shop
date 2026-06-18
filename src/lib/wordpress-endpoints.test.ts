import assert from "node:assert/strict";
import test from "node:test";

const endpoints = (await import(
  new URL("./wordpress-endpoints.ts", import.meta.url).href
)) as typeof import("./wordpress-endpoints");

const {
  getPublicWooBaseUrl,
  getServerGraphqlUrl,
  getServerWooBaseUrl,
} = endpoints;

const DEFAULT_PUBLIC_WP_URL = "https://wp.zivic-elektro.shop";

const ENDPOINT_ENV_KEYS = [
  "NEXT_PUBLIC_WC_BASE_URL",
  "NEXT_PUBLIC_WP_BASE_URL",
  "NEXT_PUBLIC_WP_URL",
  "WP_BASE_URL",
  "WP_GRAPHQL_URL",
  "WP_INTERNAL_BASE_URL",
  "WP_INTERNAL_GRAPHQL_URL",
  "WP_REST_ROOT",
  "WC_BASE_URL",
  "WOO_INTERNAL_BASE_URL",
] as const;

type EndpointEnvKey = (typeof ENDPOINT_ENV_KEYS)[number];

function withEndpointEnv(
  values: Partial<Record<EndpointEnvKey, string>>,
  callback: () => void,
): void {
  const previousValues = new Map<EndpointEnvKey, string | undefined>();

  for (const key of ENDPOINT_ENV_KEYS) {
    previousValues.set(key, process.env[key]);
    const value = values[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    callback();
  } finally {
    for (const [key, value] of previousValues) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function captureWarnings(callback: () => void): unknown[][] {
  const originalWarn = console.warn;
  const warnings: unknown[][] = [];

  console.warn = (...args: unknown[]) => {
    warnings.push(args);
  };

  try {
    callback();
  } finally {
    console.warn = originalWarn;
  }

  return warnings;
}

test("server Woo REST ignores the generic WordPress internal base URL", () => {
  withEndpointEnv(
    {
      WP_INTERNAL_BASE_URL: "http://127.0.0.1:8080",
      WP_INTERNAL_GRAPHQL_URL: "http://127.0.0.1:8080/graphql",
    },
    () => {
      assert.equal(getServerWooBaseUrl(), DEFAULT_PUBLIC_WP_URL);
      assert.equal(getServerGraphqlUrl(), "http://127.0.0.1:8080/graphql");
    },
  );
});

test("server Woo REST can use a dedicated HTTPS internal base URL", () => {
  withEndpointEnv(
    {
      WOO_INTERNAL_BASE_URL: "https://woo-internal.example.test/",
    },
    () => {
      assert.equal(getServerWooBaseUrl(), "https://woo-internal.example.test");
    },
  );
});

test("server Woo REST refuses a dedicated plain-http internal base URL", () => {
  withEndpointEnv(
    {
      WOO_INTERNAL_BASE_URL: "http://127.0.0.1:8080",
    },
    () => {
      const warnings = captureWarnings(() => {
        assert.equal(getServerWooBaseUrl(), DEFAULT_PUBLIC_WP_URL);
      });

      assert.equal(warnings.length, 1);
    },
  );
});

test("public Woo REST base URL ignores loopback values", () => {
  withEndpointEnv(
    {
      NEXT_PUBLIC_WC_BASE_URL: "http://127.0.0.1:8080",
      WC_BASE_URL: "https://wp-public.example.test/",
    },
    () => {
      assert.equal(getPublicWooBaseUrl(), "https://wp-public.example.test");
    },
  );
});
