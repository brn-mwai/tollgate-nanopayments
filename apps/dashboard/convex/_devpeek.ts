// Dev-only read helpers for CLI inspection. Gated by DEV_SEED_ALLOWED so
// they never run in prod.

import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const allPublishers = internalQuery({
  args: {},
  handler: async (ctx) => {
    if (process.env.DEV_SEED_ALLOWED !== "true") return [];
    return await ctx.db.query("publishers").collect();
  },
});

// Move a site (and all its quotes/events/pricing rules) from one publisher
// to another. Used to give the live demo data to the operator's Clerk
// account so they can see real metrics in the dashboard without re-seeding.
export const reassignSite = internalMutation({
  args: {
    siteId: v.id("sites"),
    toPublisherId: v.id("publishers"),
  },
  handler: async (ctx, { siteId, toPublisherId }) => {
    if (process.env.DEV_SEED_ALLOWED !== "true") return { ok: false, reason: "gated" };
    const site = await ctx.db.get(siteId);
    if (!site) return { ok: false, reason: "site_missing" };
    const fromPub = site.publisherId;
    await ctx.db.patch(siteId, { publisherId: toPublisherId });
    await ctx.db.insert("auditLog", {
      actor: "dev_reassign",
      action: "site.reassign",
      entity: "sites",
      entityId: siteId,
      meta: { from: fromPub, to: toPublisherId },
      occurredAt: Date.now(),
    });
    return { ok: true, siteId, fromPublisherId: fromPub, toPublisherId };
  },
});

export const wipe = internalMutation({
  args: {},
  handler: async (ctx) => {
    if (process.env.DEV_SEED_ALLOWED !== "true") return { deleted: 0 };
    const tables = ["events", "quotes", "nonceLog", "auditLog"] as const;
    let total = 0;
    for (const table of tables) {
      const rows = await ctx.db.query(table).collect();
      for (const r of rows) {
        await ctx.db.delete(r._id);
        total++;
      }
    }
    return { deleted: total };
  },
});

export const quoteStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    if (process.env.DEV_SEED_ALLOWED !== "true") return null;
    const quotes = await ctx.db.query("quotes").collect();
    const events = await ctx.db.query("events").collect();
    const settled = quotes.filter((q) => q.status === "settled");
    const failed = quotes.filter((q) => q.status === "failed");
    const agents = new Set(quotes.map((q) => q.agentWallet).filter(Boolean));
    return {
      totalQuotes: quotes.length,
      settled: settled.length,
      failed: failed.length,
      open: quotes.length - settled.length - failed.length,
      uniqueAgentWallets: agents.size,
      earnedUuUsdc: settled.reduce((a, q) => a + q.priceMicroUsdc, 0),
      totalEvents: events.length,
      eventsByStatus: events.reduce<Record<string, number>>((acc, e) => {
        acc[e.status] = (acc[e.status] ?? 0) + 1;
        return acc;
      }, {}),
      lastCircleIds: settled.slice(0, 5).map((q) => q.circleTxId ?? null),
      lastOnchainHashes: settled.slice(0, 5).map((q) => q.txHash ?? null),
    };
  },
});
