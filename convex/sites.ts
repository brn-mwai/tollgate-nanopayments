import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getCurrentPublisher, requirePublisher, requireSiteOwnedByMe } from "./lib/helpers";
import { generateApiKey, randomHex } from "./lib/apiKey";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const pub = await getCurrentPublisher(ctx);
    if (!pub) return [];
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

    const normalized = normalizeDomain(domain);
    if (!normalized) {
      throw new Error(
        `invalid domain: "${domain.trim()}". expected example.com, www.example.com, or sub.example.co.uk (no paths, no ports).`,
      );
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

// Edge authentication: middleware SDK sends the plaintext site key in
// x-tollgate-site-key; the router hashes it and calls this to resolve the
// siteId. Returns null when the key is unknown.
export const _findByKeyHash = internalQuery({
  args: { hash: v.string() },
  handler: async (ctx, { hash }) => {
    const site = await ctx.db
      .query("sites")
      .withIndex("by_keyhash", (q) => q.eq("apiKeyHash", hash))
      .unique();
    return site?._id ?? null;
  },
});

// ───────── domain normalization ─────────
// Accepts:
//   example.com
//   https://example.com
//   https://sub.example.com/path/segment
//   example.com:8080
//   https://WWW.Example.COM/?query=1
// Returns the lowercase host or null if unparseable.

function normalizeDomain(input: string): string | null {
  let s = input.trim().toLowerCase();
  if (!s) return null;

  // Strip protocol.
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  // Strip credentials.
  s = s.replace(/^[^@/]+@/, "");
  // Strip path, query, fragment.
  s = s.split(/[\/?#]/)[0] ?? s;
  // Strip port.
  s = s.split(":")[0] ?? s;
  // Strip www. if caller typed it; canonical form is bare apex or named sub.
  // We keep it if user explicitly typed a non-www subdomain.

  if (!s) return null;
  // Basic host validation: must have at least one dot, alphanum labels, TLD
  // with 2+ letters. IDN punycode (xn--) allowed.
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(s)) {
    return null;
  }
  return s;
}
