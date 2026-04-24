// Framework-agnostic middleware core. Express + Hono wrappers glue this into
// their respective request shapes. OWNER: middleware-sdk-agent.
//
// Responsibilities:
//   1. Check X-Tollgate-Receipt header → if valid, short-circuit to `next()`.
//   2. Check X-PAYMENT header (x402 standard) → if present, call quotes.settle.
//   3. Otherwise issue a 402 by calling quotes.create + render the x402 body.
//
// Convex is the source of truth for pricing and settlement. The middleware
// holds only the HMAC receipt secret + the siteId it was issued to. It NEVER
// touches Circle APIs directly — everything goes through Convex actions.

import { z } from "zod";
import { issueReceipt, verifyReceipt } from "../shared/x402";
import { RECEIPT_TTL_SEC } from "../shared/constants";

export const MiddlewareConfigSchema = z.object({
  siteId: z.string().min(1),
  chain: z.enum(["arc-testnet", "arc-mainnet"]),
  hmacSecret: z.string().min(32, "hmacSecret must be at least 32 chars"),
  convexUrl: z.string().url(),
  convexSiteKey: z.string().min(8), // per-site key for Convex action auth
  receiptTtlSec: z.number().int().positive().default(RECEIPT_TTL_SEC),
  failOpenOnFacilitator: z.boolean().default(false),
  resourceBaseUrl: z.string().url().optional(), // used in x402 resource.url
});
export type MiddlewareConfig = z.infer<typeof MiddlewareConfigSchema>;

// ───────── Abstract request adapter ─────────

export type AdapterRequest = {
  method: string;
  path: string;
  headerReceipt?: string;
  headerPayment?: string;
  headerBotClass?: string;
  headerAgentWallet?: string;
  url: string;
};

export type AdapterResult =
  | {
      kind: "allow";
      tier: string;
      agentWallet: string;
      receiptToSet?: string;
      txHash?: string;
    }
  | { kind: "402"; status: 402; headers: Record<string, string>; body: unknown }
  | { kind: "fail"; status: number; body: unknown };

// ───────── The pipeline ─────────

export async function runTollgate(
  cfg: MiddlewareConfig,
  req: AdapterRequest,
): Promise<AdapterResult> {
  // (1) Receipt fast path.
  if (req.headerReceipt) {
    const verified = await verifyReceipt(req.headerReceipt, cfg.hmacSecret);
    if (verified.ok) {
      return {
        kind: "allow",
        tier: verified.payload.tier,
        agentWallet: verified.payload.agent,
      };
    }
    // invalid receipt → fall through to 402
  }

  // (2) Payment settle path (x402 retry).
  if (req.headerPayment) {
    const decoded = tryDecodePayment(req.headerPayment);
    if (!decoded) {
      return fail(400, "malformed_x_payment");
    }
    const settleResult = await callConvex<{ ok: boolean; txHash?: string; reason?: string }>(
      cfg,
      "quotes:settle",
      { nonce: decoded.nonce, paymentPayload: decoded.payload },
    );
    if (settleResult.kind !== "ok") {
      return fail(settleResult.status, { reason: settleResult.reason });
    }
    if (!settleResult.body.ok) {
      return fail(402, { reason: settleResult.body.reason ?? "settle_failed" });
    }
    const agentWallet = decoded.agentWallet ?? "unknown";
    const receipt = await issueReceipt({
      secret: cfg.hmacSecret,
      payload: {
        site: cfg.siteId,
        agent: agentWallet,
        tier: "free",
        ttlSec: cfg.receiptTtlSec,
      },
    });
    return {
      kind: "allow",
      tier: "free",
      agentWallet,
      receiptToSet: receipt,
      txHash: settleResult.body.txHash,
    };
  }

  // (3) No receipt, no payment → issue a quote.
  const quote = await callConvex<{
    nonce: string;
    priceMicroUsdc: number;
    payTo: string;
    asset: string;
    network: string;
    expires: number;
    reasoning: string;
  }>(cfg, "quotes:create", {
    siteId: cfg.siteId,
    path: req.path,
    botClass: req.headerBotClass,
    agentWallet: req.headerAgentWallet,
  });

  if (quote.kind !== "ok") {
    if (cfg.failOpenOnFacilitator) {
      return { kind: "allow", tier: "free", agentWallet: "fail_open" };
    }
    return fail(quote.status, { reason: quote.reason });
  }

  const body = {
    x402Version: 1,
    accepts: [
      {
        scheme: "exact",
        network: quote.body.network,
        asset: quote.body.asset,
        amount: String(quote.body.priceMicroUsdc),
        payTo: quote.body.payTo,
        maxTimeoutSeconds: quote.body.expires - Math.floor(Date.now() / 1000),
        extra: {
          nonce: quote.body.nonce,
          reasoning: quote.body.reasoning,
        },
      },
    ],
    resource: {
      url: (cfg.resourceBaseUrl ?? "") + req.path,
      description: "Tollgate paywall",
      mimeType: "application/json",
    },
    error: "payment_required",
  };

  return {
    kind: "402",
    status: 402,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-tollgate-nonce": quote.body.nonce,
      "x-tollgate-price-uusdc": String(quote.body.priceMicroUsdc),
    },
    body,
  };
}

// ───────── Receipt issuance after a successful settle ─────────
// Callers (express.ts, hono.ts) need the receipt string so they can attach it
// to the outgoing response. We expose a dedicated helper so the wrappers don't
// have to reconstruct the payload.

export async function issueReceiptForAgent(
  cfg: MiddlewareConfig,
  agentWallet: string,
  tier: "free" | "pro" | "enterprise" = "free",
): Promise<string> {
  return await issueReceipt({
    secret: cfg.hmacSecret,
    payload: {
      site: cfg.siteId,
      agent: agentWallet,
      tier,
      ttlSec: cfg.receiptTtlSec,
    },
  });
}

// ───────── Convex RPC plumbing ─────────
//
// We call Convex from the edge via its HTTP functions endpoint. The middleware
// authenticates with a per-site key that the publisher provisioned in the
// dashboard; Convex validates it in the `http.ts` router.

type ConvexOk<T> = { kind: "ok"; body: T };
type ConvexErr = { kind: "err"; status: number; reason: string };

async function callConvex<T>(
  cfg: MiddlewareConfig,
  op: string,
  args: unknown,
): Promise<ConvexOk<T> | ConvexErr> {
  // op is "quotes:create" or "quotes:settle" → map to the edge HTTP route.
  const path = op === "quotes:create" ? "/tollgate/quote" : "/tollgate/settle";
  const payload =
    op === "quotes:create"
      ? {
          path: (args as { path: string }).path,
          botClass: (args as { botClass?: string }).botClass,
          agentWallet: (args as { agentWallet?: string }).agentWallet,
        }
      : {
          nonce: (args as { nonce: string }).nonce,
          paymentPayload: (args as { paymentPayload: unknown }).paymentPayload,
        };
  const url = siteUrlFor(cfg.convexUrl) + path;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tollgate-site-key": cfg.convexSiteKey,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) {
      return { kind: "err", status: res.status, reason: `convex ${res.status}: ${text}` };
    }
    const body = JSON.parse(text) as { ok?: boolean; reason?: string } & T;
    if ((body as { ok?: boolean }).ok === false) {
      return { kind: "err", status: 502, reason: body.reason ?? "convex returned ok:false" };
    }
    return { kind: "ok", body: body as T };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "convex exception";
    return { kind: "err", status: 502, reason };
  }
}

// Convex exposes httpAction routes on its `.convex.site` host, not
// `.convex.cloud`. Translate the public URL for the middleware.
function siteUrlFor(convexUrl: string): string {
  return convexUrl.replace(".convex.cloud", ".convex.site").replace(/\/$/, "");
}

// ───────── x402 header decoding ─────────
//
// The x402 standard sends the full payment payload base64-encoded in
// X-PAYMENT. We expose a minimal decode that expects our quote's nonce to be
// present in `payload.extra.nonce`.

function tryDecodePayment(header: string): {
  nonce: string;
  payload: unknown;
  agentWallet?: string;
} | null {
  try {
    const json = JSON.parse(
      typeof atob === "function"
        ? atob(header)
        : Buffer.from(header, "base64").toString("utf8"),
    ) as {
      x402Version?: number;
      accepted?: { extra?: { nonce?: string }; payTo?: string };
      payload?: { from?: string } & Record<string, unknown>;
    };
    const nonce = json.accepted?.extra?.nonce;
    if (!nonce) return null;
    return {
      nonce,
      payload: json,
      agentWallet: json.payload?.from,
    };
  } catch {
    return null;
  }
}

function fail(status: number, body: unknown): AdapterResult {
  return { kind: "fail", status, body };
}
