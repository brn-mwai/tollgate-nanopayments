// Read-only audit of inbound webhook traffic. Powers the Settings →
// Webhooks tab. Records are written elsewhere (http.ts handlers insert into
// auditLog with actor="clerk-webhook" or "circle-webhook"). We don't create
// new rows here; we only read them back for the dashboard.

import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentPublisher } from "./lib/helpers";

export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const pub = await getCurrentPublisher(ctx);
    if (!pub) return { clerk: [], circle: [] };

    const [clerk, circle] = await Promise.all([
      ctx.db
        .query("auditLog")
        .withIndex("by_actor_time", (q) => q.eq("actor", "clerk-webhook"))
        .order("desc")
        .take(limit),
      ctx.db
        .query("auditLog")
        .withIndex("by_actor_time", (q) => q.eq("actor", "circle-webhook"))
        .order("desc")
        .take(limit),
    ]);

    const shape = (r: { _id: string; action: string; occurredAt: number; meta: unknown }) => ({
      _id: r._id,
      action: r.action,
      occurredAt: r.occurredAt,
      meta: r.meta,
    });
    return { clerk: clerk.map(shape), circle: circle.map(shape) };
  },
});

// Surface the exact Convex webhook URLs the publisher needs to paste into
// Clerk + Circle dashboards. Pulled from env rather than hardcoded so the
// prod + preview deploys each expose their own URL.
export const endpoints = query({
  args: {},
  handler: async () => {
    // Derive the .convex.site URL from the Convex deployment's cloud URL if
    // the explicit env var is not set. Both expose the same httpActions.
    const explicit = process.env.CONVEX_SITE_URL;
    const cloudUrl = process.env.CONVEX_CLOUD_URL;
    const site = explicit
      ? explicit
      : cloudUrl
        ? cloudUrl.replace(".convex.cloud", ".convex.site").replace(/\/$/, "")
        : "";
    return {
      clerk: site ? `${site}/clerk-webhook` : null,
      circle: site ? `${site}/webhooks/circle` : null,
      tollgateQuote: site ? `${site}/tollgate/quote` : null,
      tollgateSettle: site ? `${site}/tollgate/settle` : null,
    };
  },
});
