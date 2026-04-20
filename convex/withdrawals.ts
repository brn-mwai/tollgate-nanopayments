import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requirePublisher } from "./lib/helpers";

export const listMine = query({
  args: { paginationOpts: v.any() },
  handler: async (ctx, { paginationOpts }) => {
    const pub = await requirePublisher(ctx);
    return await ctx.db
      .query("withdrawals")
      .withIndex("by_publisher_time", (q) => q.eq("publisherId", pub._id))
      .order("desc")
      .paginate(paginationOpts);
  },
});

export const request = mutation({
  args: {
    amountMicroUsdc: v.string(),
    destination: v.string(),
    destChain: v.union(
      v.literal("arc"),
      v.literal("base"),
      v.literal("ethereum"),
      v.literal("solana"),
    ),
  },
  handler: async (ctx, { amountMicroUsdc, destination, destChain }) => {
    const pub = await requirePublisher(ctx);
    const amt = BigInt(amountMicroUsdc);
    const available = BigInt(pub.balanceUsdc);
    if (amt <= 0n) throw new Error("amount must be positive");
    if (amt > available) throw new Error("insufficient balance");
    if (!/^0x[a-fA-F0-9]{40}$|^[A-HJ-NP-Za-km-z1-9]{32,44}$/.test(destination)) {
      throw new Error("invalid destination address");
    }

    const withdrawalId = await ctx.db.insert("withdrawals", {
      publisherId: pub._id,
      amountMicroUsdc,
      destination,
      destChain,
      status: "pending",
      requestedAt: Date.now(),
    });

    await ctx.db.insert("auditLog", {
      actor: pub._id,
      action: "withdraw.request",
      entity: "withdrawals",
      entityId: withdrawalId,
      meta: { amountMicroUsdc, destination, destChain },
      occurredAt: Date.now(),
    });

    return withdrawalId;
  },
});

// Action: executes the Circle transfer + (optionally) CCTP bridge.
// Webhook confirms and transitions to `sent` or `failed`.
export const execute = action({
  args: { withdrawalId: v.id("withdrawals") },
  handler: async (ctx, { withdrawalId }): Promise<{ circleTxId: string }> => {
    const w = await ctx.runQuery(internal.withdrawals._get, { withdrawalId });
    if (!w) throw new Error("withdrawal not found");
    if (w.status !== "pending") throw new Error(`cannot execute ${w.status}`);

    // TODO: Circle Wallets transfer + optional CCTP bridge via
    // packages/shared/circle. Idempotency key = withdrawal id.
    const circleTxId = `tx_pending_${withdrawalId}`;
    await ctx.runMutation(internal.withdrawals._attachCircleTx, {
      withdrawalId,
      circleTxId,
    });
    return { circleTxId };
  },
});

// Webhook target: Circle confirms the transfer.
export const _markSent = internalMutation({
  args: { circleTxId: v.string() },
  handler: async (ctx, { circleTxId }) => {
    const w = await ctx.db
      .query("withdrawals")
      .filter((q) => q.eq(q.field("circleTxId"), circleTxId))
      .first();
    if (!w) return;
    await ctx.db.patch(w._id, { status: "sent" });
  },
});

export const _markFailed = internalMutation({
  args: { circleTxId: v.string() },
  handler: async (ctx, { circleTxId }) => {
    const w = await ctx.db
      .query("withdrawals")
      .filter((q) => q.eq(q.field("circleTxId"), circleTxId))
      .first();
    if (!w) return;
    await ctx.db.patch(w._id, { status: "failed" });
  },
});

// ───────── internal ─────────

export const _get = internalQuery({
  args: { withdrawalId: v.id("withdrawals") },
  handler: async (ctx, { withdrawalId }) => ctx.db.get(withdrawalId),
});

export const _attachCircleTx = internalMutation({
  args: { withdrawalId: v.id("withdrawals"), circleTxId: v.string() },
  handler: async (ctx, { withdrawalId, circleTxId }) => {
    await ctx.db.patch(withdrawalId, { circleTxId });
  },
});
