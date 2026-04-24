import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getCurrentPublisher, requirePublisher } from "./lib/helpers";

// Arc is not yet in Circle's public blockchain enum. Configure via env;
// default to BASE-SEPOLIA so provisioning works without tweaks. Swap to
// ARC-SEPOLIA once Circle exposes it.
function circleBlockchain(): string {
  return process.env.CIRCLE_BLOCKCHAIN ?? "BASE-SEPOLIA";
}

const ARC_TESTNET_USDC = "0x3600000000000000000000000000000000000000";

// Read: dashboard shows wallet address + last-known balance from Convex.
// Live balance is fetched through `balance` action on demand.
export const get = query({
  args: {},
  handler: async (ctx) => {
    const pub = await getCurrentPublisher(ctx);
    if (!pub) return null;
    return {
      walletId: pub.circleWalletId ?? null,
      address: pub.arcAddress ?? null,
      cachedBalanceUuUsdc: pub.balanceUsdc,
    };
  },
});

// Provisions a Circle-custodied wallet for the current publisher. Idempotent.
export const provision = action({
  args: {},
  handler: async (ctx): Promise<{ walletId: string; address: string }> => {
    const pub = await ctx.runQuery(internal.wallets._me);
    if (!pub) throw new Error("publisher missing");
    if (pub.circleWalletId && pub.arcAddress) {
      return { walletId: pub.circleWalletId, address: pub.arcAddress };
    }

    const wallet = await ctx.runAction(internal.circle.createWallet, {
      blockchain: circleBlockchain(),
      refId: pub._id,
    });

    await ctx.runMutation(internal.wallets._persist, {
      publisherId: pub._id,
      walletId: wallet.id,
      address: wallet.address,
    });

    return { walletId: wallet.id, address: wallet.address };
  },
});

// Live balance read. Calls Circle, caches on the publisher row.
// Matches USDC by token symbol rather than address so we work across Arc,
// Base Sepolia, Ethereum Sepolia, and future Circle-supported chains without
// maintaining a per-chain USDC address map.
export const balance = action({
  args: {},
  handler: async (ctx): Promise<{ uUsdc: string; chain: "arc-testnet" | "arc-mainnet" }> => {
    const pub = await ctx.runQuery(internal.wallets._me);
    if (!pub || !pub.circleWalletId) throw new Error("wallet not provisioned");
    const uUsdc = await ctx.runAction(internal.circle.getUsdcBalance, {
      walletId: pub.circleWalletId,
    });
    await ctx.runMutation(internal.wallets._cacheBalance, {
      publisherId: pub._id,
      balanceUsdc: uUsdc,
    });
    return { uUsdc, chain: "arc-testnet" };
  },
});

// Internal variant: callable from webhook handler (no auth context).
export const balanceForPublisher = internalAction({
  args: { publisherId: v.id("publishers") },
  handler: async (ctx, { publisherId }): Promise<string> => {
    const pub = await ctx.runQuery(internal.wallets._byId, { publisherId });
    if (!pub || !pub.circleWalletId) return "0";
    const uUsdc = await ctx.runAction(internal.circle.getUsdcBalance, {
      walletId: pub.circleWalletId,
    });
    await ctx.runMutation(internal.wallets._cacheBalance, {
      publisherId: pub._id,
      balanceUsdc: uUsdc,
    });
    return uUsdc;
  },
});

// ───────── internal ─────────

export const _me = internalQuery({
  args: {},
  handler: async (ctx) => requirePublisher(ctx),
});

export const _byId = internalQuery({
  args: { publisherId: v.id("publishers") },
  handler: async (ctx, { publisherId }) => ctx.db.get(publisherId),
});

export const _findByWalletId = internalQuery({
  args: { walletId: v.string() },
  handler: async (ctx, { walletId }) => {
    return await ctx.db
      .query("publishers")
      .filter((q) => q.eq(q.field("circleWalletId"), walletId))
      .unique();
  },
});

export const _persist = internalMutation({
  args: { publisherId: v.id("publishers"), walletId: v.string(), address: v.string() },
  handler: async (ctx, { publisherId, walletId, address }) => {
    await ctx.db.patch(publisherId, {
      circleWalletId: walletId,
      arcAddress: address,
    });
    await ctx.db.insert("auditLog", {
      actor: publisherId,
      action: "wallet.provision",
      entity: "publishers",
      entityId: publisherId,
      meta: { walletId, address },
      occurredAt: Date.now(),
    });
  },
});

export const _cacheBalance = internalMutation({
  args: { publisherId: v.id("publishers"), balanceUsdc: v.string() },
  handler: async (ctx, { publisherId, balanceUsdc }) => {
    await ctx.db.patch(publisherId, { balanceUsdc });
  },
});
