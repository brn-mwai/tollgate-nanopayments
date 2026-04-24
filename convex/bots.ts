// In-dashboard bot burst runner. Lets the publisher trigger a live demo
// burst from the UI and watch onchain settlements stream into the event
// feed without touching a terminal. Every step is logged to the botRuns
// table so /app/realtime can render a cinematic execution timeline.

import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { requirePublisher } from "./lib/helpers";

type StepKind =
  | "run_started"
  | "agent_request"
  | "quote_received"
  | "settle_initiated"
  | "settle_confirmed"
  | "settle_failed"
  | "receipt_cached"
  | "run_complete";

// Publisher-triggered burst. Runs N iterations, each invoking the real
// Circle Transfer settle path and emitting structured log steps.
export const runBurst = action({
  args: {
    siteId: v.id("sites"),
    iterations: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { siteId, iterations = 12 },
  ): Promise<{ runId: Id<"botRuns">; settled: number; failed: number }> => {
    const pub = await ctx.runQuery(internal.bots._mePublisher);
    if (!pub) throw new Error("publisher not set up");

    const site = await ctx.runQuery(internal.bots._siteById, { siteId });
    if (!site || site.publisherId !== pub._id) throw new Error("not your site");

    const runId = await ctx.runMutation(internal.bots._createRun, {
      publisherId: pub._id,
      siteId,
      iterations,
    });

    await ctx.runMutation(internal.bots._logStep, {
      runId,
      kind: "run_started",
      message: `Spawning ${iterations} agent requests against ${site.domain}`,
    });

    const PATHS = [
      "/api/articles/arc-primer",
      "/api/articles/x402-revival",
      "/api/articles/agent-economy",
      "/api/articles/gemini-pricing",
      "/api/articles/receipt-compression",
      "/api/articles/reputation-tiers",
    ];

    let settled = 0;
    let failed = 0;

    for (let i = 0; i < iterations; i++) {
      const path = PATHS[i % PATHS.length]!;
      await ctx.runMutation(internal.bots._logStep, {
        runId,
        kind: "agent_request",
        message: `Agent GET ${path}`,
        meta: { iteration: i + 1, path },
      });

      // Issue a real quote server-side — same path the middleware uses.
      const quote: {
        nonce: string;
        priceMicroUsdc: number;
        payTo: string;
        asset: string;
        network: string;
        expires: number;
        reasoning: string;
      } = await ctx.runAction(internal.quotes._createQuoteForBurst, {
        siteId,
        path,
        botClass: "dashboard-burst",
        agentWallet: pub.arcAddress ?? undefined,
      });

      await ctx.runMutation(internal.bots._logStep, {
        runId,
        kind: "quote_received",
        message: `402 · ${quote.priceMicroUsdc} uUSDC · ${quote.nonce}`,
        meta: {
          nonce: quote.nonce,
          priceMicroUsdc: quote.priceMicroUsdc,
          reasoning: quote.reasoning,
        },
      });

      await ctx.runMutation(internal.bots._logStep, {
        runId,
        kind: "settle_initiated",
        message: "Calling Circle Transfer",
        meta: { nonce: quote.nonce },
      });

      const settleResult: { ok: boolean; txId?: string; reason?: string } =
        await ctx.runAction(internal.quotes._settleViaCircleByNonce, {
          nonce: quote.nonce,
          payer: pub.arcAddress ?? "unknown",
        });

      if (settleResult.ok && settleResult.txId) {
        settled++;
        await ctx.runMutation(internal.bots._logStep, {
          runId,
          kind: "settle_confirmed",
          message: `Settled · circleTxId ${settleResult.txId.slice(0, 8)}…`,
          meta: { circleTxId: settleResult.txId, nonce: quote.nonce },
        });
      } else {
        failed++;
        await ctx.runMutation(internal.bots._logStep, {
          runId,
          kind: "settle_failed",
          message: `Settle failed · ${settleResult.reason ?? "unknown"}`,
          meta: { nonce: quote.nonce, reason: settleResult.reason },
        });
      }

      // Light pacing so the UI gets visible timestamps between steps.
      await new Promise((r) => setTimeout(r, 80));
    }

    await ctx.runMutation(internal.bots._finalizeRun, {
      runId,
      settled,
      failed,
    });
    await ctx.runMutation(internal.bots._logStep, {
      runId,
      kind: "run_complete",
      message: `Done · ${settled} settled · ${failed} failed`,
      meta: { settled, failed, iterations },
    });

    return { runId, settled, failed };
  },
});

// Reactive query: /app/realtime subscribes and watches steps stream in.
export const recentRuns = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 5 }) => {
    const pub = await ctx.db
      .query("publishers")
      .withIndex("by_owner")
      .first()
      .catch(() => null);
    if (!pub) return [];
    return await ctx.db
      .query("botRuns")
      .withIndex("by_publisher_time", (q) => q.eq("publisherId", pub._id))
      .order("desc")
      .take(limit);
  },
});

export const stepsForRun = query({
  args: { runId: v.id("botRuns"), limit: v.optional(v.number()) },
  handler: async (ctx, { runId, limit = 200 }) => {
    return await ctx.db
      .query("botRunSteps")
      .withIndex("by_run_time", (q) => q.eq("runId", runId))
      .order("asc")
      .take(limit);
  },
});

export const latestRun = query({
  args: {},
  handler: async (ctx) => {
    const pub = await (async () => {
      try {
        const user = await ctx.auth.getUserIdentity();
        if (!user) return null;
        const u = await ctx.db
          .query("users")
          .withIndex("by_token", (q) => q.eq("tokenIdentifier", user.tokenIdentifier))
          .unique();
        if (!u) return null;
        return await ctx.db
          .query("publishers")
          .withIndex("by_owner", (q) => q.eq("ownerId", u._id))
          .unique();
      } catch {
        return null;
      }
    })();
    if (!pub) return null;
    const run = await ctx.db
      .query("botRuns")
      .withIndex("by_publisher_time", (q) => q.eq("publisherId", pub._id))
      .order("desc")
      .first();
    if (!run) return null;
    const steps = await ctx.db
      .query("botRunSteps")
      .withIndex("by_run_time", (q) => q.eq("runId", run._id))
      .order("asc")
      .take(200);
    return { run, steps };
  },
});

// ───────── internals ─────────

export const _mePublisher = internalQuery({
  args: {},
  handler: async (ctx): Promise<Doc<"publishers"> | null> => {
    try {
      return await requirePublisher(ctx);
    } catch {
      return null;
    }
  },
});

export const _siteById = internalQuery({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }) => ctx.db.get(siteId),
});

export const _createRun = internalMutation({
  args: {
    publisherId: v.id("publishers"),
    siteId: v.id("sites"),
    iterations: v.number(),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert("botRuns", {
      publisherId: args.publisherId,
      siteId: args.siteId,
      iterations: args.iterations,
      settled: 0,
      failed: 0,
      status: "running",
      startedAt: Date.now(),
    }),
});

export const _logStep = internalMutation({
  args: {
    runId: v.id("botRuns"),
    kind: v.string(),
    message: v.string(),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("botRunSteps", {
      runId: args.runId,
      kind: args.kind as StepKind,
      message: args.message,
      meta: args.meta ?? null,
      occurredAt: Date.now(),
    });
  },
});

export const _finalizeRun = internalMutation({
  args: {
    runId: v.id("botRuns"),
    settled: v.number(),
    failed: v.number(),
  },
  handler: async (ctx, { runId, settled, failed }) => {
    await ctx.db.patch(runId, {
      settled,
      failed,
      status: "complete",
      finishedAt: Date.now(),
    });
  },
});
