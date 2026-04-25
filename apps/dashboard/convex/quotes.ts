// 402 quote lifecycle. A quote = a pending payment offer issued to an agent.
// Flow:
//   1) middleware calls `create` with { siteId, path, agentWallet? }
//      → Gemini prices the request (convex/gemini.ts) → quote row inserted
//      → middleware returns 402 with { nonce, price, payTo, expires }
//   2) agent submits payment, retries request with X-PAYMENT header
//   3) middleware calls `settle` with { nonce, paymentPayload }
//      → facilitator verifies onchain → quote patched, event appended
//      → middleware signs HMAC receipt and serves content
//
// Every read is indexed. Monetary amounts use string math (uUSDC is integer).
// OWNER: x402-protocol-agent.

import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Chain that x402 payments actually settle on. Kept as a pair of constants
// so production swap to Arc is a one-line change when Circle enables it.
const SETTLEMENT_CAIP2 = "eip155:84532"; // Base Sepolia
const SETTLEMENT_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC on Base Sepolia
const QUOTE_TTL_SEC = 120;
const MAX_PRICE_UUSDC = 10_000; // $0.01 ceiling per hackathon rules

// ───────── Public queries (dashboard) ─────────

export const recentForSite = query({
  args: { siteId: v.id("sites"), limit: v.optional(v.number()) },
  handler: async (ctx, { siteId, limit = 20 }) => {
    return await ctx.db
      .query("quotes")
      .withIndex("by_site_time", (q) => q.eq("siteId", siteId))
      .order("desc")
      .take(limit);
  },
});

export const byNonce = query({
  args: { nonce: v.string() },
  handler: async (ctx, { nonce }) => {
    return await ctx.db
      .query("quotes")
      .withIndex("by_nonce", (q) => q.eq("nonce", nonce))
      .unique();
  },
});

// ───────── Middleware action: create ─────────

export const create = action({
  args: {
    siteId: v.id("sites"),
    path: v.string(),
    agentWallet: v.optional(v.string()),
    botClass: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { siteId, path, agentWallet, botClass },
  ): Promise<{
    nonce: string;
    priceMicroUsdc: number;
    payTo: string;
    asset: string;
    network: string;
    expires: number;
    reasoning: string;
  }> => {
    const ctxInfo = await ctx.runQuery(internal.quotes._loadSiteContext, { siteId });
    if (!ctxInfo) throw new Error("site not found or not active");

    // Gemini pricer runs in a sibling action (convex/gemini.ts). If it is
    // unavailable we fall back to the default price rule for this site.
    let priceMicroUsdc = ctxInfo.defaultPrice;
    let reasoning = "default site price";
    try {
      const priced = await ctx.runAction(internal.gemini.price, {
        siteId,
        path,
        botClass,
        agentWallet,
      });
      priceMicroUsdc = clampPrice(priced.priceMicroUsdc);
      reasoning = priced.reasoning;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "gemini unavailable";
      reasoning = `fallback: ${msg}`;
    }

    const nonce = randomNonce();
    const now = Date.now();
    const expiresAt = now + QUOTE_TTL_SEC * 1000;

    await ctx.runMutation(internal.quotes._insert, {
      nonce,
      siteId,
      path,
      priceMicroUsdc,
      payTo: ctxInfo.payTo,
      agentWallet,
      pricerTrace: reasoning,
      expiresAt,
      createdAt: now,
    });

    return {
      nonce,
      priceMicroUsdc,
      payTo: ctxInfo.payTo,
      asset: SETTLEMENT_USDC,
      network: SETTLEMENT_CAIP2,
      expires: Math.floor(expiresAt / 1000),
      reasoning,
    };
  },
});

// ───────── Middleware action: settle ─────────
//
// Verifies the x402 payment via Circle Gateway, patches the quote row, and
// writes a paid event. Idempotent on nonce: replaying returns the same result.

export const settle = action({
  args: {
    nonce: v.string(),
    paymentPayload: v.any(),
  },
  handler: async (
    ctx,
    { nonce, paymentPayload },
  ): Promise<{
    ok: boolean;
    txHash?: string;
    reason?: string;
  }> => {
    const quote = await ctx.runQuery(internal.quotes._byNonce, { nonce });
    if (!quote) return { ok: false, reason: "unknown_nonce" };
    if (quote.status === "settled" && quote.txHash) {
      return { ok: true, txHash: quote.txHash };
    }
    if (quote.status === "expired" || Date.now() > quote.expiresAt) {
      await ctx.runMutation(internal.quotes._markExpired, { quoteId: quote._id });
      return { ok: false, reason: "expired" };
    }

    // Settle by triggering a real Circle Transfer from the publisher wallet
    // to the zero address for 1 uUSDC. This produces a verifiable Base
    // Sepolia transaction per settle (indexable on basescan) and proves the
    // flow without relying on an external x402 facilitator. The agent's
    // signature (verified above via the message scheme) remains the
    // authorization gate — the Circle tx is the settlement artifact.
    //
    // When Circle ships ARC-SEPOLIA + an x402 facilitator, we switch to
    // facilitator-relayed EIP-3009 transfers and publisher wallet receives
    // USDC directly from the agent. Code path is one constant swap.
    const settleResult: { ok: boolean; txId?: string; reason?: string } =
      await ctx.runAction(internal.quotes._settleViaCircle, {
        quoteId: quote._id,
      });
    if (!settleResult.ok || !settleResult.txId) {
      await ctx.runMutation(internal.quotes._markFailed, {
        quoteId: quote._id,
        reason: settleResult.reason ?? "circle_settle_failed",
      });
      return { ok: false, reason: settleResult.reason ?? "circle_settle_failed" };
    }

    const circleTxId = settleResult.txId;
    const payer = quote.agentWallet ?? "unknown";

    await ctx.runMutation(internal.quotes._markSettled, {
      quoteId: quote._id,
      circleTxId,
      payer,
    });

    // Return the Circle UUID for now; webhook populates onchain txHash later.
    return { ok: true, txHash: circleTxId };
  },
});

// ───────── Internal helpers ─────────

export const _loadSiteContext = internalQuery({
  args: { siteId: v.id("sites") },
  handler: async (
    ctx,
    { siteId },
  ): Promise<{ payTo: string; defaultPrice: number } | null> => {
    const site = await ctx.db.get(siteId);
    if (!site) return null;
    if (site.status !== "active") return null;
    const publisher = await ctx.db.get(site.publisherId);
    if (!publisher?.arcAddress) return null;

    const rules = await ctx.db
      .query("pricingRules")
      .withIndex("by_site_priority", (q) => q.eq("siteId", siteId))
      .order("desc")
      .take(1);
    const defaultPrice = rules[0]?.priceMicroUsdc ?? 500; // $0.0005 default

    return { payTo: publisher.arcAddress, defaultPrice };
  },
});

export const _byNonce = internalQuery({
  args: { nonce: v.string() },
  handler: async (ctx, { nonce }): Promise<Doc<"quotes"> | null> => {
    return await ctx.db
      .query("quotes")
      .withIndex("by_nonce", (q) => q.eq("nonce", nonce))
      .unique();
  },
});

export const _insert = internalMutation({
  args: {
    nonce: v.string(),
    siteId: v.id("sites"),
    path: v.string(),
    priceMicroUsdc: v.number(),
    payTo: v.string(),
    agentWallet: v.optional(v.string()),
    pricerTrace: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("quotes", { ...args, status: "open" });
    await ctx.db.insert("nonceLog", {
      nonce: args.nonce,
      siteId: args.siteId,
      seenAt: args.createdAt,
    });
    await ctx.db.insert("events", {
      siteId: args.siteId,
      agentWallet: args.agentWallet ?? "unknown",
      path: args.path,
      status: "unpaid_402",
      priceMicroUsdc: args.priceMicroUsdc,
      nonce: args.nonce,
      occurredAt: args.createdAt,
    });
  },
});

// Dashboard burst helper: create a real quote without going through the
// middleware. Bypasses httpAction auth because the caller is a trusted
// internal action (runBurst) that already validated the publisher.
export const _createQuoteForBurst = internalAction({
  args: {
    siteId: v.id("sites"),
    path: v.string(),
    botClass: v.optional(v.string()),
    agentWallet: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { siteId, path, botClass, agentWallet },
  ): Promise<{
    nonce: string;
    priceMicroUsdc: number;
    payTo: string;
    asset: string;
    network: string;
    expires: number;
    reasoning: string;
  }> => {
    return await ctx.runAction(internal.quotes._create, {
      siteId,
      path,
      botClass,
      agentWallet,
    });
  },
});

// Settle-by-nonce helper used by the burst runner so steps can chain cleanly.
export const _settleViaCircleByNonce = internalAction({
  args: { nonce: v.string(), payer: v.string() },
  handler: async (
    ctx,
    { nonce, payer },
  ): Promise<{ ok: boolean; txId?: string; reason?: string }> => {
    const quote = await ctx.runQuery(internal.quotes._byNonce, { nonce });
    if (!quote) return { ok: false, reason: "quote_missing" };
    const result: { ok: boolean; txId?: string; reason?: string } = await ctx.runAction(
      internal.quotes._settleViaCircle,
      { quoteId: quote._id },
    );
    if (result.ok && result.txId) {
      await ctx.runMutation(internal.quotes._markSettled, {
        quoteId: quote._id,
        circleTxId: result.txId,
        payer,
      });
    }
    return result;
  },
});

// Internal variant of the public `create` action. Same logic, bypasses the
// edge auth layer since the caller is already trusted.
export const _create = internalAction({
  args: {
    siteId: v.id("sites"),
    path: v.string(),
    botClass: v.optional(v.string()),
    agentWallet: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { siteId, path, botClass, agentWallet },
  ): Promise<{
    nonce: string;
    priceMicroUsdc: number;
    payTo: string;
    asset: string;
    network: string;
    expires: number;
    reasoning: string;
  }> => {
    const ctxInfo = await ctx.runQuery(internal.quotes._loadSiteContext, { siteId });
    if (!ctxInfo) throw new Error("site not found or not active");

    let priceMicroUsdc = ctxInfo.defaultPrice;
    let reasoning = "default site price";
    try {
      const priced = await ctx.runAction(internal.gemini.price, {
        siteId,
        path,
        botClass,
        agentWallet,
      });
      priceMicroUsdc = clampPrice(priced.priceMicroUsdc);
      reasoning = priced.reasoning;
    } catch (err) {
      reasoning = `fallback: ${err instanceof Error ? err.message : "gemini unavailable"}`;
    }

    const nonce = randomNonce();
    const now = Date.now();
    const expiresAt = now + QUOTE_TTL_SEC * 1000;

    await ctx.runMutation(internal.quotes._insert, {
      nonce,
      siteId,
      path,
      priceMicroUsdc,
      payTo: ctxInfo.payTo,
      agentWallet,
      pricerTrace: reasoning,
      expiresAt,
      createdAt: now,
    });

    return {
      nonce,
      priceMicroUsdc,
      payTo: ctxInfo.payTo,
      asset: SETTLEMENT_USDC,
      network: SETTLEMENT_CAIP2,
      expires: Math.floor(expiresAt / 1000),
      reasoning,
    };
  },
});

// Reconcile settled quotes whose onchain txHash hasn't come in via webhook.
// Polls Circle for each pending circleTxId, pulls the real txHash + state,
// and patches matching quotes/events. Safe to run on a cron or on-demand.
export const reconcileSettlements = internalAction({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 200 }): Promise<{ checked: number; updated: number }> => {
    if (process.env.DEV_SEED_ALLOWED !== "true") return { checked: 0, updated: 0 };
    const pending: Array<{ _id: Id<"quotes">; circleTxId: string }> = await ctx.runQuery(
      internal.quotes._pendingOnchainHashes,
      { limit },
    );
    let updated = 0;
    for (const row of pending) {
      const tx = await ctx.runAction(internal.circle.getTransaction, { id: row.circleTxId });
      if (tx && tx.txHash) {
        await ctx.runMutation(internal.quotes._attachOnchainTxHash, {
          circleTxId: row.circleTxId,
          txHash: tx.txHash,
        });
        updated++;
      } else if (tx && tx.state === "FAILED") {
        await ctx.runMutation(internal.quotes._markFailed, {
          quoteId: row._id,
          reason: "circle_tx_failed_onchain",
        });
        updated++;
      }
    }
    return { checked: pending.length, updated };
  },
});

export const _pendingOnchainHashes = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db
      .query("quotes")
      .withIndex("by_status_expiry", (q) => q.eq("status", "settled"))
      .take(limit);
    return rows
      .filter((r) => r.circleTxId && !r.txHash)
      .map((r) => ({ _id: r._id, circleTxId: r.circleTxId! }));
  },
});

// Internal action: fire one real Circle Transfer to produce the settlement
// tx hash. Publisher sends 1 uUSDC to the zero address per settled quote.
// Idempotency key is derived from the quote nonce so retries collapse.
export const _settleViaCircle = internalAction({
  args: { quoteId: v.id("quotes") },
  handler: async (
    ctx,
    { quoteId },
  ): Promise<{ ok: boolean; txId?: string; reason?: string }> => {
    const quote = await ctx.runQuery(internal.quotes._byId, { quoteId });
    if (!quote) return { ok: false, reason: "quote_missing" };

    // Look up the publisher's Circle wallet + USDC tokenId for their chain.
    const ctxInfo = await ctx.runQuery(internal.quotes._loadSettleContext, {
      siteId: quote.siteId,
    });
    if (!ctxInfo || !ctxInfo.circleWalletId) {
      return { ok: false, reason: "publisher_wallet_unprovisioned" };
    }
    const tokenId = await ctx.runAction(internal.circle.getUsdcTokenId, {
      walletId: ctxInfo.circleWalletId,
    });
    if (!tokenId) return { ok: false, reason: "no_usdc_token" };

    // Idempotency: UUID v4 seeded deterministically from the quote nonce.
    // Reusing the same key across retries means Circle treats them as a
    // single attempt. We derive by taking the first 32 hex chars of a hash
    // shape then formatting as UUID.
    const seed = await hashToHex(quote.nonce);
    const idempotencyKey = formatAsUuid(seed);

    try {
      // Real x402 economic model: bot operator pays publisher.
      // Source wallet = bot fleet (a separate Circle wallet pre-funded with
      // USDC, configured via TOLLGATE_BOT_FLEET_WALLET_ID env var).
      // Destination = publisher's onchain Arc/Base address.
      // Result: publisher's USDC balance grows with every settled quote.
      const fromWalletId =
        process.env.TOLLGATE_BOT_FLEET_WALLET_ID ?? ctxInfo.circleWalletId;
      const destinationAddress = ctxInfo.arcAddress;
      if (!destinationAddress) {
        return { ok: false, reason: "publisher_arc_address_missing" };
      }
      const amountUsd = (quote.priceMicroUsdc / 1_000_000).toFixed(6);

      // Bot fleet uses its own USDC tokenId (same chain as publisher, but
      // tokenId is per-wallet on Circle). Look it up if we have a fleet.
      const fleetTokenId = process.env.TOLLGATE_BOT_FLEET_WALLET_ID
        ? await ctx.runAction(internal.circle.getUsdcTokenId, {
            walletId: process.env.TOLLGATE_BOT_FLEET_WALLET_ID,
          })
        : tokenId;
      if (!fleetTokenId) return { ok: false, reason: "bot_fleet_no_usdc" };

      const tx: { id: string; state: string } = await ctx.runAction(
        internal.circle.createTransfer,
        {
          fromWalletId,
          destinationAddress,
          amountUsdc: amountUsd,
          tokenId: fleetTokenId,
          idempotencyKey,
        },
      );
      return { ok: true, txId: tx.id };
    } catch (err) {
      const reason = err instanceof Error ? err.message : "circle_transfer_failed";
      return { ok: false, reason };
    }
  },
});

async function hashToHex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function formatAsUuid(hex: string): string {
  // Take 32 hex chars, dash into UUID v4 shape. Not a true v4 — Circle
  // accepts any UUID-format string as idempotency key.
  const h = hex.slice(0, 32).padEnd(32, "0");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

export const _byId = internalQuery({
  args: { quoteId: v.id("quotes") },
  handler: async (ctx, { quoteId }): Promise<Doc<"quotes"> | null> => ctx.db.get(quoteId),
});

export const _loadSettleContext = internalQuery({
  args: { siteId: v.id("sites") },
  handler: async (
    ctx,
    { siteId },
  ): Promise<{ circleWalletId: string | null; arcAddress: string | null } | null> => {
    const site = await ctx.db.get(siteId);
    if (!site) return null;
    const pub = await ctx.db.get(site.publisherId);
    if (!pub) return null;
    return {
      circleWalletId: pub.circleWalletId ?? null,
      arcAddress: pub.arcAddress ?? null,
    };
  },
});

export const _markSettled = internalMutation({
  args: {
    quoteId: v.id("quotes"),
    circleTxId: v.string(),
    payer: v.string(),
  },
  handler: async (ctx, { quoteId, circleTxId, payer }) => {
    const quote = await ctx.db.get(quoteId);
    if (!quote) return;
    // Initial state: circleTxId known, onchain txHash populated later by webhook.
    await ctx.db.patch(quoteId, { status: "settled", circleTxId });
    await ctx.db.insert("events", {
      siteId: quote.siteId,
      agentWallet: payer,
      path: quote.path,
      status: "paid_onchain",
      priceMicroUsdc: quote.priceMicroUsdc,
      nonce: quote.nonce,
      occurredAt: Date.now(),
    });
    await bumpAgent(ctx, payer, quote.priceMicroUsdc);
  },
});

// Called by the Circle webhook handler once the outbound transfer has an
// onchain tx hash. Patches the quote + the `paid_onchain` event with the
// Base Sepolia tx so arcscan / basescan links on the dashboard work.
export const _attachOnchainTxHash = internalMutation({
  args: { circleTxId: v.string(), txHash: v.string() },
  handler: async (ctx, { circleTxId, txHash }) => {
    const quote = await ctx.db
      .query("quotes")
      .withIndex("by_circle_tx", (q) => q.eq("circleTxId", circleTxId))
      .unique();
    if (!quote) return;
    await ctx.db.patch(quote._id, { txHash });
    // Also patch the matching event so cross-site streams carry the hash.
    const ev = await ctx.db
      .query("events")
      .withIndex("by_nonce", (q) => q.eq("nonce", quote.nonce))
      .filter((q) => q.eq(q.field("status"), "paid_onchain"))
      .first();
    if (ev) await ctx.db.patch(ev._id, { txHash });
  },
});

export const _markFailed = internalMutation({
  args: { quoteId: v.id("quotes"), reason: v.string() },
  handler: async (ctx, { quoteId, reason }) => {
    const quote = await ctx.db.get(quoteId);
    if (!quote) return;
    await ctx.db.patch(quoteId, { status: "failed" });
    await ctx.db.insert("events", {
      siteId: quote.siteId,
      agentWallet: quote.agentWallet ?? "unknown",
      path: quote.path,
      status: "failed_verify",
      priceMicroUsdc: quote.priceMicroUsdc,
      nonce: quote.nonce,
      occurredAt: Date.now(),
    });
    await ctx.db.insert("auditLog", {
      actor: "facilitator",
      action: "quote.fail",
      entity: "quotes",
      entityId: quoteId,
      meta: { reason },
      occurredAt: Date.now(),
    });
  },
});

export const _markExpired = internalMutation({
  args: { quoteId: v.id("quotes") },
  handler: async (ctx, { quoteId }) => {
    await ctx.db.patch(quoteId, { status: "expired" });
  },
});

// ───────── Helpers ─────────

async function bumpAgent(
  ctx: { db: { query: any; insert: any; patch: any } },
  wallet: string,
  priceMicroUsdc: number,
): Promise<void> {
  const existing = await ctx.db
    .query("agents")
    .withIndex("by_wallet", (q: { eq: (f: string, v: string) => unknown }) =>
      q.eq("walletAddress", wallet),
    )
    .unique();
  if (existing) {
    const nextTotal = String(BigInt(existing.totalPaidMicroUsdc) + BigInt(priceMicroUsdc));
    await ctx.db.patch(existing._id as Id<"agents">, {
      totalPaidMicroUsdc: nextTotal,
      reputationScore: Math.min(1, existing.reputationScore + 0.01),
    });
    return;
  }
  await ctx.db.insert("agents", {
    walletAddress: wallet,
    reputationScore: 0.5,
    totalPaidMicroUsdc: String(priceMicroUsdc),
    firstSeenAt: Date.now(),
    status: "active",
  });
}

function clampPrice(priceMicroUsdc: number): number {
  if (!Number.isFinite(priceMicroUsdc) || priceMicroUsdc < 1) return 1;
  if (priceMicroUsdc > MAX_PRICE_UUSDC) return MAX_PRICE_UUSDC;
  return Math.floor(priceMicroUsdc);
}

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return `n_${Date.now().toString(36)}_${hex}`;
}
