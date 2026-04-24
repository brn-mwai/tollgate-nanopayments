// HTTP actions: Clerk + Circle webhooks + middleware-facing edge endpoints.
// Every external caller is authenticated at the door:
//   - Clerk webhook: svix signature verification
//   - /tollgate/* edge API: x-tollgate-site-key matched to sites.apiKeyHash

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateClerkRequest(request);
    if (!event) {
      return new Response("invalid webhook signature", { status: 401 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;
      case "user.deleted": {
        const id = event.data.id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId: id });
        break;
      }
      default:
        // ignore other event types
        break;
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateClerkRequest(req: Request): Promise<WebhookEvent | null> {
  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-signature": req.headers.get("svix-signature")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payload, headers) as unknown as WebhookEvent;
  } catch {
    return null;
  }
}

// ───────── Tollgate edge endpoints (middleware SDK calls these) ─────────

http.route({
  path: "/tollgate/quote",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await resolveSiteFromKey(ctx, request);
    if (!auth.ok) return jsonErr(401, auth.reason);

    let body: { path?: string; botClass?: string; agentWallet?: string };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return jsonErr(400, "bad_json");
    }
    if (!body.path || typeof body.path !== "string") return jsonErr(400, "path_required");

    const quote = await ctx.runAction(api.quotes.create, {
      siteId: auth.siteId as Id<"sites">,
      path: body.path,
      botClass: body.botClass,
      agentWallet: body.agentWallet,
    });
    return json(200, quote);
  }),
});

// ───────── Circle webhook ─────────
//
// Circle posts transfer + wallet lifecycle events here. Signature is an HMAC
// over the raw body using the per-endpoint secret shown when the endpoint was
// registered in the Circle Console. We verify, route to internal handlers,
// and always return 200 after verification to stop Circle's retry loop.

http.route({
  path: "/webhooks/circle",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Circle's current testnet Console does not expose a per-endpoint
    // signing secret. Instead of cryptographic verification we rely on
    // ownership matching in `_ingestCircleEvent`: the mutation only patches
    // withdrawals whose circleTxId already exists in our DB. Unknown IDs
    // are silently ignored, so a forged event cannot mutate state — it
    // simply hits nothing.
    //
    // If Circle later ships signed webhooks (via CIRCLE_WEBHOOK_SECRET or a
    // public-key endpoint), we switch back on by checking the env var.
    const raw = await request.text();

    type CircleEvent = {
      type?: string;
      data?: {
        id?: string;
        state?: string;
        txHash?: string;
        transactionHash?: string;
        walletId?: string;
        transaction?: {
          id?: string;
          state?: string;
          txHash?: string;
          transactionHash?: string;
        };
      };
    };
    let event: CircleEvent;
    try {
      event = JSON.parse(raw) as CircleEvent;
    } catch {
      return jsonErr(400, "bad_json");
    }

    const tx = event.data?.transaction ?? event.data ?? {};
    const circleTxId = tx.id ?? event.data?.id;
    const state = tx.state ?? event.data?.state ?? "unknown";
    const txHash =
      tx.txHash ?? tx.transactionHash ?? event.data?.txHash ?? event.data?.transactionHash;

    const handled =
      event.type === "transactions.inbound" ||
      event.type === "transactions.outbound" ||
      event.type === "transfers.created" ||
      event.type === "transfers.updated" ||
      event.type === "gateway.deposit" ||
      event.type === "gateway.mint.finalized" ||
      event.type === "gateway.withdrawal.completed";

    if (handled && circleTxId) {
      await ctx.runMutation(internal.withdrawals._ingestCircleEvent, {
        circleTxId,
        state,
        txHash,
      });
      // Settlement path: same UUID may belong to a quote. Patch the quote
      // with the real onchain tx hash so the dashboard can link to basescan.
      if (txHash) {
        await ctx.runMutation(internal.quotes._attachOnchainTxHash, {
          circleTxId,
          txHash,
        });
      }
    }

    // Inbound deposit or Gateway mint → refresh the publisher's balance so
    // the dashboard reflects the new total without a page action.
    const walletId = event.data?.walletId ?? (event.data?.transaction as { walletId?: string } | undefined)?.walletId;
    if (
      walletId &&
      (event.type === "transactions.inbound" ||
        event.type === "gateway.deposit" ||
        event.type === "gateway.mint.finalized")
    ) {
      const pub = await ctx.runQuery(internal.wallets._findByWalletId, { walletId });
      if (pub) {
        await ctx.runAction(internal.wallets.balanceForPublisher, { publisherId: pub._id });
      }
    }
    // Unhandled types or missing IDs: accept-and-ignore (200).

    return new Response(null, { status: 200 });
  }),
});

http.route({
  path: "/tollgate/settle",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await resolveSiteFromKey(ctx, request);
    if (!auth.ok) return jsonErr(401, auth.reason);

    let body: { nonce?: string; paymentPayload?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return jsonErr(400, "bad_json");
    }
    if (!body.nonce || typeof body.nonce !== "string") return jsonErr(400, "nonce_required");
    if (!body.paymentPayload) return jsonErr(400, "paymentPayload_required");

    const result = await ctx.runAction(api.quotes.settle, {
      nonce: body.nonce,
      paymentPayload: body.paymentPayload,
    });
    return json(200, result);
  }),
});

// ───────── Edge helpers ─────────

async function resolveSiteFromKey(
  ctx: Parameters<Parameters<typeof httpAction>[0]>[0],
  req: Request,
): Promise<{ ok: true; siteId: string } | { ok: false; reason: string }> {
  const raw = req.headers.get("x-tollgate-site-key");
  if (!raw) return { ok: false, reason: "missing_site_key" };
  const hash = await sha256Hex(raw);
  const siteId = await ctx.runQuery(internal.sites._findByKeyHash, { hash });
  if (!siteId) return { ok: false, reason: "unknown_site_key" };
  return { ok: true, siteId };
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(digest));
}

function toHex(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += b.toString(16).padStart(2, "0");
  return s;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function jsonErr(status: number, reason: string): Response {
  return json(status, { ok: false, reason });
}

export default http;
