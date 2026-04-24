// HMAC receipt secret lifecycle. Each site gets a 32-byte key that signs the
// 5-minute receipt token. Rotation invalidates in-flight cached receipts at
// the next middleware boot — rotate carefully. History retained so security
// audits can trace which receipt was signed with which key.
//
// Public shape: plaintext returned ONCE on create/rotate. Convex stores the
// secret itself (not a hash) because the middleware needs the plaintext to
// verify receipts at the edge — unlike API keys where only a hash is stored.
// This trades a little blast-radius for vastly simpler edge deployment.

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requirePublisher, requireSiteOwnedByMe } from "./lib/helpers";

export const listForSite = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }) => {
    await requireSiteOwnedByMe(ctx, siteId);
    const rows = await ctx.db
      .query("receipts")
      .withIndex("by_site", (q) => q.eq("siteId", siteId))
      .order("desc")
      .collect();
    // Never expose the secret itself in the list — only fingerprints.
    return rows.map((r) => ({
      _id: r._id,
      rotatedAt: r.rotatedAt,
      fingerprint: r.hmacKey.slice(0, 12) + "…" + r.hmacKey.slice(-4),
    }));
  },
});

export const rotate = mutation({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }) => {
    const site = await requireSiteOwnedByMe(ctx, siteId);

    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    let hex = "";
    for (const b of bytes) hex += b.toString(16).padStart(2, "0");

    await ctx.db.insert("receipts", {
      hmacKey: hex,
      siteId: site._id,
      rotatedAt: Date.now(),
    });

    await ctx.db.insert("auditLog", {
      actor: site.publisherId,
      action: "hmac.rotate",
      entity: "sites",
      entityId: site._id,
      meta: { fingerprint: hex.slice(0, 12) + "…" + hex.slice(-4) },
      occurredAt: Date.now(),
    });

    // Plaintext returned once. Client must copy and paste into
    // TOLLGATE_HMAC_SECRET on the middleware host.
    return { secret: hex, rotatedAt: Date.now() };
  },
});

// Rotate HMAC secrets for every site owned by the current publisher. Used
// by the danger-zone "Reset all HMAC" action. Returns the new secrets keyed
// by siteId — client shows a one-time reveal.
export const rotateAll = mutation({
  args: {},
  handler: async (ctx) => {
    const pub = await requirePublisher(ctx);
    const sites = await ctx.db
      .query("sites")
      .withIndex("by_publisher", (q) => q.eq("publisherId", pub._id))
      .collect();

    const rotated: Array<{ siteId: string; domain: string; secret: string }> = [];
    for (const s of sites) {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      let hex = "";
      for (const b of bytes) hex += b.toString(16).padStart(2, "0");
      await ctx.db.insert("receipts", {
        hmacKey: hex,
        siteId: s._id,
        rotatedAt: Date.now(),
      });
      rotated.push({ siteId: s._id, domain: s.domain, secret: hex });
    }

    await ctx.db.insert("auditLog", {
      actor: pub._id,
      action: "hmac.rotateAll",
      entity: "publishers",
      entityId: pub._id,
      meta: { sites: rotated.length },
      occurredAt: Date.now(),
    });
    return rotated;
  },
});
