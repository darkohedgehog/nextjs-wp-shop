import { NextResponse } from "next/server";
import type { VerifyTokenRequest } from "@/types/contract-withdrawal";
import {
  DEV_TOKEN,
  isLocalDev,
  isRecord,
  jsonError,
  localDevErrorResponse,
  mockVerifyTokenResponse,
  proxyPost,
  safeParseJson,
} from "../_shared";

export async function POST(req: Request) {
  const body = await safeParseJson(req);

  if (!isRecord(body)) {
    return jsonError("Neispravan JSON zahtjev.", 400);
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";

  if (!token) {
    return jsonError("Nedostaje sigurni token.", 400);
  }

  const payload: VerifyTokenRequest = { token };

  if (isLocalDev()) {
    if (payload.token === DEV_TOKEN) {
      return NextResponse.json(mockVerifyTokenResponse);
    }

    return localDevErrorResponse();
  }

  return proxyPost("verify-token", payload);
}
