import { internalMutation } from "./_generated/server";

const DAY_MS = 24 * 60 * 60 * 1000;

export const cleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - DAY_MS;
    const old = await ctx.db
      .query("nonceLog")
      .filter((q) => q.lt(q.field("seenAt"), cutoff))
      .take(1000); // cap per tick to avoid long transactions
    for (const row of old) await ctx.db.delete(row._id);
    return { deleted: old.length };
  },
});
