// Dev-only read helpers for CLI inspection. Gated by DEV_SEED_ALLOWED so
// they never run in prod.

import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { generateApiKey } from "./lib/apiKey";

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

export const siteByDomain = internalQuery({
  args: { domain: v.string() },
  handler: async (ctx, { domain }) => {
    if (process.env.DEV_SEED_ALLOWED !== "true") return null;
    const site = await ctx.db
      .query("sites")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .unique();
    if (!site) return null;
    return {
      _id: site._id,
      domain: site.domain,
      status: site.status,
      verifyToken: site.verifyToken,
      publisherId: site.publisherId,
    };
  },
});

// Dev-only: rotate the API key for a site by domain, returning the
// fresh plaintext so we can re-sync the publisher app's env var.
// Used to recover from key drift between Convex and the demo-news
// TOLLGATE_SITE_KEY env after dashboard activity.
export const rotateSiteKeyByDomain = internalAction({
  args: { domain: v.string() },
  handler: async (
    ctx,
    { domain },
  ): Promise<{ ok: boolean; apiKey?: string; reason?: string }> => {
    if (process.env.DEV_SEED_ALLOWED !== "true") {
      return { ok: false, reason: "DEV_SEED_ALLOWED not set" };
    }
    const site = await ctx.runQuery(internal._devpeek._siteByDomainInternal, {
      domain,
    });
    if (!site) return { ok: false, reason: "site not found" };
    const { plaintext, hash } = await generateApiKey("live");
    await ctx.runMutation(internal._devpeek._patchSiteKeyHash, {
      siteId: site._id,
      hash,
    });
    return { ok: true, apiKey: plaintext };
  },
});

export const _siteByDomainInternal = internalQuery({
  args: { domain: v.string() },
  handler: async (ctx, { domain }) => {
    const site = await ctx.db
      .query("sites")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .unique();
    if (!site) return null;
    return { _id: site._id, domain: site.domain };
  },
});

export const _patchSiteKeyHash = internalMutation({
  args: { siteId: v.id("sites"), hash: v.string() },
  handler: async (ctx, { siteId, hash }) => {
    await ctx.db.patch(siteId, { apiKeyHash: hash });
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
