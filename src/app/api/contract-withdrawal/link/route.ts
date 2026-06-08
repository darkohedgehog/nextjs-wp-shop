import { NextResponse } from "next/server";
import type { LinkWithdrawalRequest } from "@/types/contract-withdrawal";
import {
  DEV_TOKEN,
  isLocalDev,
  isRecord,
  jsonError,
  localDevErrorResponse,
  mockLinkWithdrawalResponse,
  proxyPost,
  safeParseJson,
} from "../_shared";

export async function POST(req: Request) {
  const body = await safeParseJson(req);

  if (!isRecord(body)) {
    return jsonError("Neispravan JSON zahtjev.", 400);
  }

  const orderId = typeof body.order_id === "number" ? body.order_id : 0;
  const orderKey = typeof body.order_key === "string" ? body.order_key.trim() : "";

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return jsonError("Nedostaje ispravan ID narudžbe.", 400);
  }

  if (!orderKey) {
    return jsonError("Nedostaje ključ narudžbe.", 400);
  }

  const payload: LinkWithdrawalRequest = {
    order_id: orderId,
    order_key: orderKey,
  };

  if (isLocalDev()) {
    if (payload.order_key === DEV_TOKEN) {
      return NextResponse.json(mockLinkWithdrawalResponse);
    }

    return localDevErrorResponse();
  }

  return proxyPost("link", payload);
}
