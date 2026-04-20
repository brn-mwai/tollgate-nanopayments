import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requirePublisher, requireSiteOwnedByMe } from "./lib/helpers";

// Public read: dashboard paginated event stream, scoped to owned sites.
export const listForSite = query({
  args: { siteId: v.id("sites"), paginationOpts: v.any() },
  handler: async (ctx, { siteId, paginationOpts }) => {
    await requireSiteOwnedByMe(ctx, siteId);
    return await ctx.db
      .query("events")
      .withIndex("by_site_time", (q) => q.eq("siteId", siteId))
      .order("desc")
      .paginate(paginationOpts);
  },
});

// Cross-site list for the Events page: merges every site the publisher owns.
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const pub = await requirePublisher(ctx);
    const sites = await ctx.db
      .query("sites")
      .withIndex("by_publisher", (q) => q.eq("publisherId", pub._id))
      .collect();

    const events = (
      await Promise.all(
        sites.map((s) =>
          ctx.db
            .query("events")
            .withIndex("by_site_time", (q) => q.eq("siteId", s._id))
            .order("desc")
            .take(limit),
        ),
      )
    ).flat();

    events.sort((a, b) => b.occurredAt - a.occurredAt);
    return events.slice(0, limit);
  },
});

// Edge gateway calls this via httpAction. Batched.
export const ingestBatch = internalMutation({
  args: {
    items: v.array(
      v.object({
        siteId: v.id("sites"),
        agentWallet: v.string(),
        path: v.string(),
        status: v.union(
          v.literal("paid_onchain"),
          v.literal("paid_cached"),
          v.literal("unpaid_402"),
          v.literal("rejected"),
          v.literal("failed_verify"),
        ),
        priceMicroUsdc: v.number(),
        txHash: v.optional(v.string()),
        nonce: v.string(),
        occurredAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, { items }) => {
    // Nonce dedup within the batch first, then against `nonceLog`.
    for (const item of items) {
      const seen = await ctx.db
        .query("nonceLog")
        .withIndex("by_nonce", (q) => q.eq("nonce", item.nonce))
        .unique();
      if (seen) continue;
      await ctx.db.insert("nonceLog", {
        nonce: item.nonce,
        siteId: item.siteId,
        seenAt: item.occurredAt,
      });
      await ctx.db.insert("events", item);
    }
  },
});
