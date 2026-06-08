import { NextResponse } from "next/server";
import type {
  SubmitWithdrawalRequest,
  WithdrawalScope,
} from "@/types/contract-withdrawal";
import {
  DEV_TOKEN,
  isLocalDev,
  isRecord,
  jsonError,
  localDevErrorResponse,
  mockSubmitWithdrawalResponse,
  proxyPost,
  safeParseJson,
} from "../_shared";

const COMMENT_LIMIT = 1000;

function isWithdrawalScope(value: unknown): value is WithdrawalScope {
  return value === "order" || value === "items";
}

function parseItemIds(value: unknown): number[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const itemIds: number[] = [];

  for (const item of value) {
    if (typeof item !== "number" || !Number.isInteger(item) || item <= 0) {
      return null;
    }

    itemIds.push(item);
  }

  return itemIds;
}

export async function POST(req: Request) {
  const body = await safeParseJson(req);

  if (!isRecord(body)) {
    return jsonError("Neispravan JSON zahtjev.", 400);
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const scope = body.scope;
  const itemIds = parseItemIds(body.item_ids);
  const comment =
    typeof body.comment === "string"
      ? body.comment.trim().slice(0, COMMENT_LIMIT)
      : "";
  const confirmed = body.confirmed === true;

  if (!token) {
    return jsonError("Nedostaje sigurni token.", 400);
  }

  if (!isWithdrawalScope(scope)) {
    return jsonError("Odaberite vrstu odustanka.", 400);
  }

  if (scope === "items" && (!itemIds || itemIds.length === 0)) {
    return jsonError("Odaberite barem jednu stavku narudžbe.", 400);
  }

  if (!confirmed) {
    return jsonError("Potvrdite da želite odustati od ugovora.", 400);
  }

  const selectedItemIds: number[] = scope === "items" ? itemIds ?? [] : [];

  const payload: SubmitWithdrawalRequest = {
    token,
    scope,
    item_ids: selectedItemIds,
    comment,
    confirmed,
  };

  if (isLocalDev()) {
    if (payload.token === DEV_TOKEN) {
      return NextResponse.json(mockSubmitWithdrawalResponse);
    }

    return localDevErrorResponse();
  }

  return proxyPost("submit", payload);
}
