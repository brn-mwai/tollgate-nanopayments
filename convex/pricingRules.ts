import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireSiteOwnedByMe } from "./lib/helpers";

export const listForSite = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }) => {
    await requireSiteOwnedByMe(ctx, siteId);
    return await ctx.db
      .query("pricingRules")
      .withIndex("by_site_priority", (q) => q.eq("siteId", siteId))
      .collect();
  },
});

export const upsert = mutation({
  args: {
    siteId: v.id("sites"),
    ruleId: v.optional(v.id("pricingRules")),
    pathPattern: v.string(),
    priceMicroUsdc: v.number(),
    botClass: v.optional(v.string()),
    priority: v.number(),
  },
  handler: async (ctx, { siteId, ruleId, ...fields }) => {
    await requireSiteOwnedByMe(ctx, siteId);

    if (fields.priceMicroUsdc < 0 || fields.priceMicroUsdc > 1_000_000_000) {
      throw new Error("price out of range");
    }
    if (!fields.pathPattern.startsWith("/")) throw new Error("path must start with /");

    if (ruleId) {
      const existing = await ctx.db.get(ruleId);
      if (!existing || existing.siteId !== siteId) throw new Error("rule not found");
      await ctx.db.patch(ruleId, fields);
      return ruleId;
    }
    return await ctx.db.insert("pricingRules", { siteId, ...fields });
  },
});

export const remove = mutation({
  args: { ruleId: v.id("pricingRules") },
  handler: async (ctx, { ruleId }) => {
    const rule = await ctx.db.get(ruleId);
    if (!rule) return;
    await requireSiteOwnedByMe(ctx, rule.siteId);
    await ctx.db.delete(ruleId);
  },
});
