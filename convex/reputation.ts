import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const tierFor = query({
  args: { score: v.number() },
  handler: (_ctx, { score }) => {
    if (score < 0.5) return { tier: "unverified", discountBps: 0 } as const;
    if (score < 0.8) return { tier: "verified", discountBps: 2500 } as const;
    if (score < 0.95) return { tier: "trusted", discountBps: 5000 } as const;
    return { tier: "preferred", discountBps: 8000 } as const;
  },
});

// Cron target: compute score per agent from the last 24h of events and
// batch-push to the ERC-8004 contract on Arc.
export const rollDaily = internalAction({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.runQuery(internal.reputation._listAgents);

    const batch: { wallet: string; score: number }[] = [];
    const DAY_MS = 24 * 60 * 60 * 1000;
    const since = Date.now() - DAY_MS;

    for (const agent of agents) {
      const events = await ctx.runQuery(internal.reputation._eventsForAgent, {
        wallet: agent.walletAddress,
        since,
      });
      const paidRate =
        events.length === 0
          ? agent.reputationScore
          : events.filter((e) => e.status === "paid_onchain" || e.status === "paid_cached").length /
            events.length;
      // EMA so reputation adapts gradually.
      const score = Math.min(1, 0.8 * agent.reputationScore + 0.2 * paidRate);
      batch.push({ wallet: agent.walletAddress, score });
    }

    await ctx.runMutation(internal.reputation._persistScores, { batch });

    // TODO: call arc-chain-agent to push `batch` onchain via ERC-8004.
    return { updated: batch.length };
  },
});

// ───────── internal ─────────

export const _listAgents = internalQuery({
  args: {},
  handler: async (ctx) => ctx.db.query("agents").collect(),
});

export const _eventsForAgent = internalQuery({
  args: { wallet: v.string(), since: v.number() },
  handler: async (ctx, { wallet, since }) =>
    ctx.db
      .query("events")
      .withIndex("by_agent_time", (q) => q.eq("agentWallet", wallet).gte("occurredAt", since))
      .collect(),
});

export const _persistScores = internalMutation({
  args: { batch: v.array(v.object({ wallet: v.string(), score: v.number() })) },
  handler: async (ctx, { batch }) => {
    for (const { wallet, score } of batch) {
      const agent = await ctx.db
        .query("agents")
        .withIndex("by_wallet", (q) => q.eq("walletAddress", wallet))
        .unique();
      if (!agent) continue;
      await ctx.db.patch(agent._id, { reputationScore: score });
    }
  },
});
