import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

// Public: middleware calls this via HTTP action to fetch per-agent pricing.
// For the dashboard we just list, paginated.
export const listAll = query({
  args: { paginationOpts: v.any() },
  handler: async (ctx, { paginationOpts }) => {
    return await ctx.db.query("agents").withIndex("by_score").order("desc").paginate(paginationOpts);
  },
});

export const lookup = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", walletAddress))
      .unique();
  },
});

export const ensure = internalMutation({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", walletAddress))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("agents", {
      walletAddress,
      reputationScore: 0,
      totalPaidMicroUsdc: "0",
      firstSeenAt: Date.now(),
      status: "active",
    });
  },
});

export const setStatus = internalMutation({
  args: {
    walletAddress: v.string(),
    status: v.union(v.literal("active"), v.literal("flagged"), v.literal("banned")),
  },
  handler: async (ctx, { walletAddress, status }) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", walletAddress))
      .unique();
    if (!agent) return;
    await ctx.db.patch(agent._id, { status });
  },
});
