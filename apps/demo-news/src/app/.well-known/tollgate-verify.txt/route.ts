// Domain ownership proof. sites.verify fetches this plain-text value and
// compares against the stored verifyToken. Must stay unpaywalled.

import { getConfig } from "../../../lib/config";

export const dynamic = "force-dynamic";

export function GET() {
  const cfg = getConfig();
  return new Response(cfg.verifyToken, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
