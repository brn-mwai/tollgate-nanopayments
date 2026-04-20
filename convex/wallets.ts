import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getCurrentPublisher, requirePublisher } from "./lib/helpers";

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

// Action: calls Circle Wallets API to provision the publisher's wallet on Arc.
// Internal mutation does the Convex write after we have Circle's response.
export const provision = action({
  args: {},
  handler: async (ctx): Promise<{ walletId: string; address: string }> => {
    const pub = await ctx.runQuery(internal.wallets._me);
    if (!pub) throw new Error("publisher missing");
    if (pub.circleWalletId && pub.arcAddress) {
      return { walletId: pub.circleWalletId, address: pub.arcAddress };
    }

    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
    const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
    if (!apiKey || !entitySecret || !walletSetId) {
      throw new Error("Circle env not configured");
    }

    // NOTE: Circle's full provisioning requires an entity secret ciphertext
    // computed at request time. For the hackathon we surface what the
    // circle-integration-agent owns — implementation lives in
    // packages/shared/circle once imported server-side.
    // Stub: create deterministic placeholder values for UI testing before
    // the SDK wiring lands.
    const walletId = `wallet_pending_${pub._id}`;
    const address = "0x0000000000000000000000000000000000000000";

    await ctx.runMutation(internal.wallets._persist, {
      publisherId: pub._id,
      walletId,
      address,
    });

    return { walletId, address };
  },
});

// Action: Live balance (skeleton — calls Circle Wallets + caches).
export const balance = action({
  args: {},
  handler: async (ctx): Promise<{ uUsdc: string; chain: "arc-testnet" | "arc-mainnet" }> => {
    const pub = await ctx.runQuery(internal.wallets._me);
    if (!pub || !pub.circleWalletId) throw new Error("wallet not provisioned");
    // TODO: call Circle API GET /v1/w3s/wallets/{id}/balances
    return { uUsdc: pub.balanceUsdc, chain: "arc-testnet" };
  },
});

// ───────── internal helpers ─────────

export const _me = internalQuery({
  args: {},
  handler: async (ctx) => requirePublisher(ctx),
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
