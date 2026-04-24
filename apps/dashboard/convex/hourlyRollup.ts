import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireSiteOwnedByMe } from "./lib/helpers";

const HOUR_MS = 60 * 60 * 1000;

export const forSite = query({
  args: { siteId: v.id("sites"), hours: v.optional(v.number()) },
  handler: async (ctx, { siteId, hours = 24 }) => {
    await requireSiteOwnedByMe(ctx, siteId);
    const since = Math.floor((Date.now() - hours * HOUR_MS) / HOUR_MS);
    return await ctx.db
      .query("hourlyRollup")
      .withIndex("by_site_hour", (q) => q.eq("siteId", siteId).gte("hourBucket", since))
      .collect();
  },
});

// Cron target: aggregate the last hour of events into `hourlyRollup`.
export const rollOne = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const hourBucket = Math.floor(now / HOUR_MS) - 1;
    const windowStart = hourBucket * HOUR_MS;
    const windowEnd = windowStart + HOUR_MS;

    const sites = await ctx.db.query("sites").collect();
    for (const site of sites) {
      const events = await ctx.db
        .query("events")
        .withIndex("by_site_time", (q) =>
          q.eq("siteId", site._id).gte("occurredAt", windowStart).lt("occurredAt", windowEnd),
        )
        .collect();

      if (events.length === 0) continue;

      const paid = events.filter((e) => e.status === "paid_onchain" || e.status === "paid_cached");
      const earned = paid.reduce((acc, e) => acc + e.priceMicroUsdc, 0);
      const uniqueAgents = new Set(events.map((e) => e.agentWallet)).size;

      const existing = await ctx.db
        .query("hourlyRollup")
        .withIndex("by_site_hour", (q) => q.eq("siteId", site._id).eq("hourBucket", hourBucket))
        .unique();

      const doc = {
        siteId: site._id,
        hourBucket,
        totalRequests: events.length,
        paidRequests: paid.length,
        earnedMicroUsdc: earned,
        uniqueAgents,
      };

      if (existing) {
        await ctx.db.patch(existing._id, doc);
      } else {
        await ctx.db.insert("hourlyRollup", doc);
      }
    }
  },
});
