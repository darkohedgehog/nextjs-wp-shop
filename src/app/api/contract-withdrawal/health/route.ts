import { NextResponse } from "next/server";
import { isLocalDev, proxyGet } from "../_shared";

export async function GET() {
  if (isLocalDev()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  return proxyGet("health");
}
