import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requirePublisher, requireSiteOwnedByMe } from "./lib/helpers";
import { generateApiKey, randomHex } from "./lib/apiKey";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const pub = await requirePublisher(ctx);
    return await ctx.db
      .query("sites")
      .withIndex("by_publisher", (q) => q.eq("publisherId", pub._id))
      .collect();
  },
});

export const get = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }) => {
    return await requireSiteOwnedByMe(ctx, siteId);
  },
});

export const create = mutation({
  args: { domain: v.string() },
  handler: async (ctx, { domain }) => {
    const pub = await requirePublisher(ctx);

    const normalized = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(normalized)) {
      throw new Error("invalid domain");
    }

    const existing = await ctx.db
      .query("sites")
      .withIndex("by_domain", (q) => q.eq("domain", normalized))
      .unique();
    if (existing) throw new Error("domain already registered");

    const { plaintext, hash } = await generateApiKey("live");
    const verifyToken = `tg_verify_${await randomHex(16)}`;

    const siteId = await ctx.db.insert("sites", {
      publisherId: pub._id,
      domain: normalized,
      apiKeyHash: hash,
      status: "unverified",
      verifyToken,
      failOpenOnFacilitator: false,
    });

    // Default pricing rule: everything at 500 uUSDC
    await ctx.db.insert("pricingRules", {
      siteId,
      pathPattern: "/*",
      priceMicroUsdc: 500,
      priority: 100,
    });

    await ctx.db.insert("auditLog", {
      actor: pub._id,
      action: "site.create",
      entity: "sites",
      entityId: siteId,
      meta: { domain: normalized },
      occurredAt: Date.now(),
    });

    // Plaintext API key is returned ONCE and never stored.
    return { siteId, apiKey: plaintext, verifyToken };
  },
});

export const rotateKey = mutation({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }) => {
    const site = await requireSiteOwnedByMe(ctx, siteId);
    const { plaintext, hash } = await generateApiKey("live");
    await ctx.db.patch(site._id, { apiKeyHash: hash });
    await ctx.db.insert("auditLog", {
      actor: site.publisherId,
      action: "site.rotateKey",
      entity: "sites",
      entityId: site._id,
      meta: {},
      occurredAt: Date.now(),
    });
    return { apiKey: plaintext };
  },
});

export const verify = action({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }): Promise<{ ok: boolean; reason?: string }> => {
    const site = await ctx.runQuery(internal.sites._internalGet, { siteId });
    if (!site) return { ok: false, reason: "site not found" };

    const url = `https://${site.domain}/.well-known/tollgate-verify.txt`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return { ok: false, reason: `fetch ${res.status}` };
      const body = (await res.text()).trim();
      if (body !== site.verifyToken) return { ok: false, reason: "token mismatch" };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : "fetch failed" };
    }

    await ctx.runMutation(internal.sites._markActive, { siteId });
    return { ok: true };
  },
});

export const _internalGet = internalQuery({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }) => ctx.db.get(siteId),
});

export const _markActive = internalMutation({
  args: { siteId: v.id("sites") },
  handler: async (ctx, { siteId }) => {
    await ctx.db.patch(siteId, { status: "active" });
  },
});
