// Domain ownership proof. sites.verify fetches this plain-text value and
// compares against the stored verifyToken.
//
// Tries the live Convex deployment first (so re-adding the site in the
// dashboard generates a new token and the verify still succeeds without
// touching env vars). Falls back to TOLLGATE_VERIFY_TOKEN if Convex is
// unreachable.

import { getConfig } from "../../../lib/config";

export const dynamic = "force-dynamic";

const SELF_DOMAIN = "demo-news.brianmwai.com";

export async function GET(): Promise<Response> {
  const cfg = getConfig();
  const live = await tokenFromConvex(cfg.convexUrl, SELF_DOMAIN);
  const token = live ?? cfg.verifyToken;
  return new Response(token, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function tokenFromConvex(convexUrl: string, domain: string): Promise<string | null> {
  try {
    const res = await fetch(convexUrl.replace(/\/$/, "") + "/api/query", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        path: "sites:publicVerifyToken",
        args: { domain },
        format: "json",
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { status?: string; value?: string | null };
    if (data.status !== "success" || typeof data.value !== "string") return null;
    return data.value;
  } catch {
    return null;
  }
}
