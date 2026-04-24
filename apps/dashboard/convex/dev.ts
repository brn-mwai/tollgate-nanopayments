// Dev-only seed helpers. Provision a demo publisher + site without going
// through the Clerk sign-up flow. Safe to keep deployed — every mutation
// checks that DEV_SEED_ALLOWED=true is set as a Convex env var before writing.
//
// Usage:
//   npx convex env set DEV_SEED_ALLOWED true
//   npx convex run dev:seedDemo
//
// Returns { siteId, apiKey, verifyToken, hmacSecret } — paste these into
// apps/demo-news/.env.local.

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { generateApiKey, randomHex } from "./lib/apiKey";

const DEMO_EMAIL = "demo@tollgate.brianmwai.com";
const DEMO_SLUG = "demo";
const DEMO_DOMAIN = "demo-news.local";
const DEMO_ARC_ADDRESS = "0x000000000000000000000000000000000000dEaD";

export const seedDemo = internalMutation({
  args: { arcAddress: v.optional(v.string()), circleWalletId: v.optional(v.string()) },
  handler: async (ctx, { arcAddress, circleWalletId }) => {
    if (process.env.DEV_SEED_ALLOWED !== "true") {
      throw new Error("DEV_SEED_ALLOWED must be set to true in Convex env");
    }

    const tokenIdentifier = `dev-seed|${DEMO_EMAIL}`;
    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        tokenIdentifier,
        email: DEMO_EMAIL,
        name: "Demo Publisher",
        role: "publisher",
      });
      user = await ctx.db.get(userId);
      if (!user) throw new Error("failed to insert demo user");
    }

    let publisher = await ctx.db
      .query("publishers")
      .withIndex("by_owner", (q) => q.eq("ownerId", user!._id))
      .unique();
    if (!publisher) {
      const pubId = await ctx.db.insert("publishers", {
        ownerId: user._id,
        orgSlug: DEMO_SLUG,
        plan: "free",
        balanceUsdc: "0",
        platformFeeBps: 0,
        arcAddress: arcAddress ?? DEMO_ARC_ADDRESS,
        circleWalletId,
      });
      publisher = await ctx.db.get(pubId);
      if (!publisher) throw new Error("failed to insert demo publisher");
    } else {
      // Patch whichever optional fields the caller passed.
      const patch: Partial<Doc<"publishers">> = {};
      if (arcAddress) patch.arcAddress = arcAddress;
      else if (!publisher.arcAddress) patch.arcAddress = DEMO_ARC_ADDRESS;
      if (circleWalletId) patch.circleWalletId = circleWalletId;
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(publisher._id, patch);
      }
    }

    let site = await ctx.db
      .query("sites")
      .withIndex("by_domain", (q) => q.eq("domain", DEMO_DOMAIN))
      .unique();
    const { plaintext, hash } = await generateApiKey("test");
    const verifyToken = `tg_verify_${await randomHex(16)}`;
    if (!site) {
      const siteId = await ctx.db.insert("sites", {
        publisherId: publisher._id,
        domain: DEMO_DOMAIN,
        apiKeyHash: hash,
        status: "active", // skip domain-verify for dev
        verifyToken,
        failOpenOnFacilitator: false,
      });
      await ctx.db.insert("pricingRules", {
        siteId,
        pathPattern: "/api/articles/*",
        priceMicroUsdc: 1000,
        priority: 100,
      });
      site = await ctx.db.get(siteId);
      if (!site) throw new Error("failed to insert demo site");
    } else {
      await ctx.db.patch(site._id, {
        apiKeyHash: hash,
        status: "active",
        verifyToken,
      });
    }

    const hmacBytes = new Uint8Array(32);
    crypto.getRandomValues(hmacBytes);
    let hmacSecret = "";
    for (const b of hmacBytes) hmacSecret += b.toString(16).padStart(2, "0");

    return {
      siteId: site._id,
      apiKey: plaintext,
      verifyToken,
      hmacSecret,
      domain: DEMO_DOMAIN,
      arcAddress: publisher.arcAddress ?? DEMO_ARC_ADDRESS,
    };
  },
});
