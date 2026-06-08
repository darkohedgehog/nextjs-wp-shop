import { NextResponse } from "next/server";
import type { RequestLinkRequest } from "@/types/contract-withdrawal";
import {
  genericRequestLinkResponse,
  isLocalDev,
  isRecord,
  jsonError,
  safeParseJson,
  buildWordPressEndpoint,
} from "../_shared";

export async function POST(req: Request) {
  const body = await safeParseJson(req);

  if (!isRecord(body)) {
    return jsonError("Neispravan JSON zahtjev.", 400);
  }

  const orderNumber =
    typeof body.order_number === "string" ? body.order_number.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!orderNumber || !email || !email.includes("@")) {
    return jsonError("Unesite broj narudžbe i ispravnu e-mail adresu.", 400);
  }

  const payload: RequestLinkRequest = {
    order_number: orderNumber,
    email,
  };

  if (isLocalDev()) {
    return NextResponse.json(genericRequestLinkResponse);
  }

  const url = buildWordPressEndpoint("request-link");

  if (url) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
    } catch (err) {
      console.error("[contract-withdrawal] request-link proxy error:", err);
    }
  } else {
    console.error("[contract-withdrawal] NEXT_PUBLIC_WP_URL missing");
  }

  return NextResponse.json(genericRequestLinkResponse);
}
