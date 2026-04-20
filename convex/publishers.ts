import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { ensureCurrentUser } from "./lib/helpers";

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return await ctx.db
      .query("publishers")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .unique();
  },
});

export const create = mutation({
  args: { orgSlug: v.string() },
  handler: async (ctx, { orgSlug }) => {
    // Upsert the user on-demand if the Clerk webhook hasn't fired yet.
    const user = await ensureCurrentUser(ctx);

    const existing = await ctx.db
      .query("publishers")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .unique();
    if (existing) return existing._id;

    const slugTaken = await ctx.db
      .query("publishers")
      .withIndex("by_slug", (q) => q.eq("orgSlug", orgSlug))
      .unique();
    if (slugTaken) throw new Error("slug already taken");

    return await ctx.db.insert("publishers", {
      ownerId: user._id,
      orgSlug,
      plan: "free",
      balanceUsdc: "0",
      platformFeeBps: 0,
    });
  },
});
