import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getCurrentPublisher, requirePublisher } from "./lib/helpers";

export const listMine = query({
  args: { paginationOpts: v.any() },
  handler: async (ctx, { paginationOpts }) => {
    const pub = await getCurrentPublisher(ctx);
    if (!pub) {
      return { page: [], isDone: true, continueCursor: "" };
    }
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
  handler: async (ctx, { withdrawalId }): Promise<{ circleTxId: string; state: string }> => {
    const w = await ctx.runQuery(internal.withdrawals._get, { withdrawalId });
    if (!w) throw new Error("withdrawal not found");
    if (w.status !== "pending") throw new Error(`cannot execute ${w.status}`);

    const publisher = await ctx.runQuery(internal.withdrawals._publisher, {
      publisherId: w.publisherId,
    });
    if (!publisher) throw new Error("publisher missing");
    if (!publisher.circleWalletId) throw new Error("no Circle wallet provisioned");

    // Circle requires a UUID-format idempotencyKey. Convex document IDs are
    // 32 alphanumerics, not UUID-shaped — so we generate a UUID once and
    // persist it. Retries reuse the same key → Circle treats them as a
    // single attempt.
    let idempotencyKey = w.circleIdempotencyKey;
    if (!idempotencyKey) {
      idempotencyKey = crypto.randomUUID();
      await ctx.runMutation(internal.withdrawals._setIdempotencyKey, {
        withdrawalId,
        idempotencyKey,
      });
    }

    // uUSDC (string) → human USDC decimal with 6 decimals. BigInt-safe.
    const amt = BigInt(w.amountMicroUsdc);
    const whole = amt / 1_000_000n;
    const frac = (amt % 1_000_000n).toString().padStart(6, "0");
    const amountUsdc = `${whole}.${frac}`.replace(/\.?0+$/, "") || "0";

    // Look up the USDC token id on this wallet's chain. Circle's transfer
    // API needs an explicit tokenId (not symbol). The helper inspects the
    // wallet's balances and returns the USDC entry.
    const tokenId = await ctx.runAction(internal.circle.getUsdcTokenId, {
      walletId: publisher.circleWalletId,
    });
    if (!tokenId) throw new Error("wallet has no USDC token entry — fund it first");

    const tx = await ctx.runAction(internal.circle.createTransfer, {
      fromWalletId: publisher.circleWalletId,
      destinationAddress: w.destination,
      amountUsdc,
      tokenId,
      idempotencyKey,
    });

    await ctx.runMutation(internal.withdrawals._attachCircleTx, {
      withdrawalId,
      circleTxId: tx.id,
    });
    return { circleTxId: tx.id, state: tx.state };
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

export const _publisher = internalQuery({
  args: { publisherId: v.id("publishers") },
  handler: async (ctx, { publisherId }) => ctx.db.get(publisherId),
});

export const _attachCircleTx = internalMutation({
  args: { withdrawalId: v.id("withdrawals"), circleTxId: v.string() },
  handler: async (ctx, { withdrawalId, circleTxId }) => {
    await ctx.db.patch(withdrawalId, { circleTxId });
  },
});

export const _setIdempotencyKey = internalMutation({
  args: { withdrawalId: v.id("withdrawals"), idempotencyKey: v.string() },
  handler: async (ctx, { withdrawalId, idempotencyKey }) => {
    await ctx.db.patch(withdrawalId, { circleIdempotencyKey: idempotencyKey });
  },
});

// Webhook sink. Circle posts transfers.created / transfers.updated events;
// we collapse them onto our three-state withdrawal status.
//   COMPLETE | CONFIRMED → sent
//   FAILED  | DENIED     → failed
//   anything else         → pending (no-op)
export const _ingestCircleEvent = internalMutation({
  args: {
    circleTxId: v.string(),
    state: v.string(),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, { circleTxId, state, txHash }) => {
    const w = await ctx.db
      .query("withdrawals")
      .filter((q) => q.eq(q.field("circleTxId"), circleTxId))
      .first();
    if (!w) return;

    const normalized = state.toUpperCase();
    const next: "sent" | "failed" | null =
      normalized === "COMPLETE" || normalized === "CONFIRMED"
        ? "sent"
        : normalized === "FAILED" || normalized === "DENIED"
          ? "failed"
          : null;
    if (!next) return;

    await ctx.db.patch(w._id, { status: next });
    await ctx.db.insert("auditLog", {
      actor: "circle-webhook",
      action: `withdrawal.${next}`,
      entity: "withdrawals",
      entityId: w._id,
      meta: { circleTxId, state, txHash: txHash ?? null },
      occurredAt: Date.now(),
    });
  },
});
