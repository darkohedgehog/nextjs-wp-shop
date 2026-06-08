import "server-only";

import { NextResponse } from "next/server";
import type {
  LinkWithdrawalResponse,
  RequestLinkResponse,
  SubmitWithdrawalResponse,
  VerifyTokenResponse,
} from "@/types/contract-withdrawal";

export const DEV_TOKEN = "dev-token";

export const GENERIC_REQUEST_LINK_MESSAGE =
  "Ako se podaci podudaraju, poslat ćemo sigurni link na e-mail adresu korištenu pri kupnji.";

const LOCAL_DEV_ERROR =
  "Lokalni razvoj koristi mock podatke. Otvorite /withdrawal?t=dev-token za testiranje bez pozivanja produkcijskog WordPressa.";

const API_NAMESPACE = "/wp-json/contract-withdrawal/v1";

export const isLocalDev = () => process.env.NODE_ENV !== "production";

export function getWpBaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, "") || null;
}

export function buildWordPressEndpoint(endpoint: string): string | null {
  const wpBaseUrl = getWpBaseUrl();

  if (!wpBaseUrl) {
    return null;
  }

  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  return `${wpBaseUrl}${API_NAMESPACE}/${cleanEndpoint}`;
}

export async function safeParseJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

async function readResponsePayload(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return { ok: response.ok };
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export function localDevErrorResponse() {
  return jsonError(LOCAL_DEV_ERROR, 400);
}

export async function proxyGet(endpoint: string) {
  const url = buildWordPressEndpoint(endpoint);

  if (!url) {
    return jsonError("NEXT_PUBLIC_WP_URL nije podešen.", 500);
  }

  try {
    const wpRes = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });
    const payload = await readResponsePayload(wpRes);

    return NextResponse.json(payload, { status: wpRes.status });
  } catch (err) {
    console.error(`[contract-withdrawal] GET ${endpoint} error:`, err);
    return jsonError("Greška pri komunikaciji s WordPressom.", 500);
  }
}

export async function proxyPost(endpoint: string, body: unknown) {
  const url = buildWordPressEndpoint(endpoint);

  if (!url) {
    return jsonError("NEXT_PUBLIC_WP_URL nije podešen.", 500);
  }

  try {
    const wpRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = await readResponsePayload(wpRes);

    return NextResponse.json(payload, { status: wpRes.status });
  } catch (err) {
    console.error(`[contract-withdrawal] POST ${endpoint} error:`, err);
    return jsonError("Greška pri komunikaciji s WordPressom.", 500);
  }
}

export const mockVerifyTokenResponse: VerifyTokenResponse = {
  ok: true,
  order: {
    id: 12345,
    order_number: "12345",
    status: "processing",
    created_at: "2026-06-05T12:00:00+02:00",
    customer_email_masked: "k***@example.com",
    customer_name: "Test Kupac",
    withdrawal_requested: false,
    withdrawal_request_id: "",
    window_days: 14,
    items: [
      { item_id: 1, product_id: 101, name: "Test proizvod A", quantity: 1 },
      { item_id: 2, product_id: 102, name: "Test proizvod B", quantity: 2 },
    ],
  },
};

export const mockSubmitWithdrawalResponse: SubmitWithdrawalResponse = {
  ok: true,
  request_id: "WD-DEV-12345",
  submitted_at: "05.06.2026. 12:30",
  customer_email_masked: "k***@example.com",
};

export const mockLinkWithdrawalResponse: LinkWithdrawalResponse = {
  ok: true,
  withdrawal_url: "/withdrawal?t=dev-token",
};

export const genericRequestLinkResponse: RequestLinkResponse = {
  ok: true,
  message: GENERIC_REQUEST_LINK_MESSAGE,
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
