// Public pricing advertisement per Tollgate architecture. Agents read this
// to learn what the site charges before hitting a paywalled path. Not
// cache-critical but 5 min CDN cache is fine.

import { NextResponse } from "next/server";
import { getConfig } from "../../../lib/config";

export const revalidate = 300; // 5 minutes

export function GET() {
  const cfg = getConfig();
  return NextResponse.json(
    {
      version: 1,
      siteId: cfg.siteId,
      chain: "arc-testnet",
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      network: "eip155:84532",
      pricing: [
        { path: "/api/articles/*", priceMicroUsdc: 1000, description: "Per-article read" },
      ],
      contact: "demo@tollgate.brianmwai.com",
    },
    {
      headers: {
        "cache-control": "public, max-age=300",
      },
    },
  );
}
