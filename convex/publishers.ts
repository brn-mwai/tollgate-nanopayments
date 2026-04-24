import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { ensureCurrentUser, requirePublisher } from "./lib/helpers";

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

// Rename this publisher's org slug. Enforces kebab-style + uniqueness.
export const renameOrg = mutation({
  args: { orgSlug: v.string() },
  handler: async (ctx, { orgSlug }) => {
    const pub = await requirePublisher(ctx);
    const cleaned = orgSlug.trim().toLowerCase();
    if (!/^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/.test(cleaned)) {
      throw new Error("slug must be 3-32 chars, lowercase alphanumerics + hyphens, no edges");
    }
    if (cleaned === pub.orgSlug) return pub._id;

    const taken = await ctx.db
      .query("publishers")
      .withIndex("by_slug", (q) => q.eq("orgSlug", cleaned))
      .unique();
    if (taken) throw new Error("slug already taken");

    await ctx.db.patch(pub._id, { orgSlug: cleaned });
    await ctx.db.insert("auditLog", {
      actor: pub._id,
      action: "publisher.renameOrg",
      entity: "publishers",
      entityId: pub._id,
      meta: { from: pub.orgSlug, to: cleaned },
      occurredAt: Date.now(),
    });
    return pub._id;
  },
});

// Purge event history older than N days. Returns the number of rows deleted.
// Keeps quotes + withdrawals + audit log intact.
export const purgeEvents = mutation({
  args: { olderThanDays: v.number() },
  handler: async (ctx, { olderThanDays }) => {
    const pub = await requirePublisher(ctx);
    if (olderThanDays < 0 || olderThanDays > 365) throw new Error("olderThanDays out of range");
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    const sites = await ctx.db
      .query("sites")
      .withIndex("by_publisher", (q) => q.eq("publisherId", pub._id))
      .collect();

    let deleted = 0;
    for (const s of sites) {
      const rows = await ctx.db
        .query("events")
        .withIndex("by_site_time", (q) => q.eq("siteId", s._id))
        .filter((q) => q.lt(q.field("occurredAt"), cutoff))
        .collect();
      for (const r of rows) {
        await ctx.db.delete(r._id);
        deleted++;
      }
    }

    await ctx.db.insert("auditLog", {
      actor: pub._id,
      action: "publisher.purgeEvents",
      entity: "publishers",
      entityId: pub._id,
      meta: { olderThanDays, deleted },
      occurredAt: Date.now(),
    });
    return { deleted };
  },
});

// Hard delete the publisher + every owned site, pricing rule, quote, event,
// receipt, and withdrawal. Requires an exact orgSlug typed confirm from the
// client. The user row in Clerk is NOT touched — that remains with Clerk.
export const deleteOrg = mutation({
  args: { confirmOrgSlug: v.string() },
  handler: async (ctx, { confirmOrgSlug }) => {
    const pub = await requirePublisher(ctx);
    if (confirmOrgSlug !== pub.orgSlug) {
      throw new Error("confirmation slug mismatch — type your org slug exactly");
    }

    const sites = await ctx.db
      .query("sites")
      .withIndex("by_publisher", (q) => q.eq("publisherId", pub._id))
      .collect();

    let events = 0;
    let rules = 0;
    let quotes = 0;
    let receipts = 0;
    for (const s of sites) {
      const [evs, rs, qs, rcs] = await Promise.all([
        ctx.db.query("events").withIndex("by_site_time", (q) => q.eq("siteId", s._id)).collect(),
        ctx.db.query("pricingRules").withIndex("by_site_priority", (q) => q.eq("siteId", s._id)).collect(),
        ctx.db.query("quotes").withIndex("by_site_time", (q) => q.eq("siteId", s._id)).collect(),
        ctx.db.query("receipts").withIndex("by_site", (q) => q.eq("siteId", s._id)).collect(),
      ]);
      for (const row of evs) { await ctx.db.delete(row._id); events++; }
      for (const row of rs) { await ctx.db.delete(row._id); rules++; }
      for (const row of qs) { await ctx.db.delete(row._id); quotes++; }
      for (const row of rcs) { await ctx.db.delete(row._id); receipts++; }
      await ctx.db.delete(s._id);
    }

    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_publisher_time", (q) => q.eq("publisherId", pub._id))
      .collect();
    for (const w of withdrawals) await ctx.db.delete(w._id);

    await ctx.db.delete(pub._id);

    return {
      deletedPublisher: 1,
      deletedSites: sites.length,
      deletedEvents: events,
      deletedQuotes: quotes,
      deletedPricingRules: rules,
      deletedReceipts: receipts,
      deletedWithdrawals: withdrawals.length,
    };
  },
});
