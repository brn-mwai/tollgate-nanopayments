// Public endpoint that reads a Circle wallet's USDC balance.
// Called by the Realtime page's live bot-fleet balance widget. The Circle
// API key is held server-side; only the USDC decimal string leaves this
// handler.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CIRCLE = "https://api.circle.com/v1/w3s";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const walletId = url.searchParams.get("id");
  if (!walletId) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "no_server_key" }, { status: 503 });
  }
  try {
    const res = await fetch(
      `${CIRCLE}/wallets/${encodeURIComponent(walletId)}/balances`,
      { headers: { authorization: `Bearer ${apiKey}`, accept: "application/json" } },
    );
    if (!res.ok) {
      return NextResponse.json({ error: `circle_${res.status}` }, { status: 502 });
    }
    const json = (await res.json()) as {
      data?: { tokenBalances?: Array<{ token: { symbol: string }; amount: string }> };
    };
    const usdc = json.data?.tokenBalances?.find((b) => b.token.symbol === "USDC");
    return NextResponse.json(
      { usdc: usdc?.amount ?? "0.00" },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch_failed" },
      { status: 502 },
    );
  }
}
