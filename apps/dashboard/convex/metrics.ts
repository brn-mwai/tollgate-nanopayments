// Aggregate metrics for /app/realtime: onchain settlement count, revenue,
// unique agent count, receipt-cache compression ratio, per-chain margin
// derivation, and a tool-usage summary for the provider-health strip.
//
// All queries are auth-scoped to the current publisher's sites.

import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentPublisher } from "./lib/helpers";

const DAY_MS = 24 * 60 * 60 * 1000;
const ETHEREUM_GAS_USD_PER_TX = 0.5; // typical L1 transfer 2026 estimate
const ARC_GAS_USD_PER_TX = 0.00002; // USDC-native gas, Arc testnet actuals

type Summary = {
  totalEvents: number;
  totalOnchainTx: number;
  totalCachedHits: number;
  total402s: number;
  uniqueAgents: number;
  totalEarnedUuUsdc: number;
  avgPriceUuUsdc: number;
  cachedHitRatioPct: number;
  compressionRatio: number; // cached + onchain ÷ onchain
  arcGasUsd: number;
  ethereumGasUsdHypothetical: number;
  marginPctOnArc: number;
  marginPctOnEthereum: number;
  last24hOnchain: number;
  last24hEarnedUuUsdc: number;
  rpsAvg24h: number;
};

function summarize(events: Array<{ status: string; priceMicroUsdc: number; agentWallet: string; occurredAt: number; txHash?: string }>): Summary {
  const now = Date.now();
  const onchain = events.filter((e) => e.status === "paid_onchain");
  const cached = events.filter((e) => e.status === "paid_cached");
  const four02 = events.filter((e) => e.status === "unpaid_402");
  const paid = [...onchain, ...cached];
  const earnedUu = paid.reduce((a, e) => a + e.priceMicroUsdc, 0);
  const agents = new Set(paid.map((e) => e.agentWallet));
  const onchainCount = onchain.length;
  const cachedCount = cached.length;
  const compressionRatio = onchainCount > 0 ? (onchainCount + cachedCount) / onchainCount : 0;

  const arcGasUsd = onchainCount * ARC_GAS_USD_PER_TX;
  const ethereumGasUsd = onchainCount * ETHEREUM_GAS_USD_PER_TX;
  const earnedUsd = earnedUu / 1_000_000;
  const marginArc = earnedUsd > 0 ? ((earnedUsd - arcGasUsd) / earnedUsd) * 100 : 0;
  const marginEth = earnedUsd > 0 ? ((earnedUsd - ethereumGasUsd) / earnedUsd) * 100 : 0;

  const in24 = (e: { occurredAt: number }) => e.occurredAt > now - DAY_MS;
  const onchain24 = onchain.filter(in24);
  const earned24Uu = [...onchain.filter(in24), ...cached.filter(in24)].reduce((a, e) => a + e.priceMicroUsdc, 0);
  const rps = onchain24.length > 0 ? onchain24.length / (DAY_MS / 1000) : 0;

  return {
    totalEvents: events.length,
    totalOnchainTx: onchainCount,
    totalCachedHits: cachedCount,
    total402s: four02.length,
    uniqueAgents: agents.size,
    totalEarnedUuUsdc: earnedUu,
    avgPriceUuUsdc: paid.length > 0 ? Math.round(earnedUu / paid.length) : 0,
    cachedHitRatioPct: paid.length > 0 ? Math.round((cachedCount / paid.length) * 100) : 0,
    compressionRatio: Math.round(compressionRatio * 10) / 10,
    arcGasUsd: Math.round(arcGasUsd * 1e6) / 1e6,
    ethereumGasUsdHypothetical: Math.round(ethereumGasUsd * 100) / 100,
    marginPctOnArc: Math.round(marginArc * 10) / 10,
    marginPctOnEthereum: Math.round(marginEth * 10) / 10,
    last24hOnchain: onchain24.length,
    last24hEarnedUuUsdc: earned24Uu,
    rpsAvg24h: Math.round(rps * 1000) / 1000,
  };
}

// Per-publisher summary. Used by /app/realtime for the signed-in publisher.
export const summary = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 2000 }): Promise<Summary> => {
    const pub = await getCurrentPublisher(ctx);
    if (!pub) return summarize([]);
    const sites = await ctx.db
      .query("sites")
      .withIndex("by_publisher", (q) => q.eq("publisherId", pub._id))
      .collect();
    if (sites.length === 0) return summarize([]);
    const rows = (
      await Promise.all(
        sites.map((s) =>
          ctx.db
            .query("events")
            .withIndex("by_site_time", (q) => q.eq("siteId", s._id))
            .order("desc")
            .take(limit),
        ),
      )
    ).flat();
    return summarize(rows);
  },
});

// Feed for /app/realtime: last N events enriched with their quote's Gemini
// reasoning. One query, publisher-scoped. Designed for reactive polling — the
// judge watches the counter tick while the simulator runs.
export const feed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (
    ctx,
    { limit = 25 },
  ): Promise<
    Array<{
      _id: string;
      occurredAt: number;
      agentWallet: string;
      path: string;
      priceMicroUsdc: number;
      status: string;
      txHash?: string;
      arcTxHash?: string;
      nonce: string;
      pricerTrace: string | null;
      siteDomain: string;
    }>
  > => {
    const pub = await getCurrentPublisher(ctx);
    if (!pub) return [];
    const sites = await ctx.db
      .query("sites")
      .withIndex("by_publisher", (q) => q.eq("publisherId", pub._id))
      .collect();
    if (sites.length === 0) return [];
    const domains = new Map(sites.map((s) => [s._id.toString(), s.domain]));

    const events = (
      await Promise.all(
        sites.map((s) =>
          ctx.db
            .query("events")
            .withIndex("by_site_time", (q) => q.eq("siteId", s._id))
            .order("desc")
            .take(limit),
        ),
      )
    ).flat();
    events.sort((a, b) => b.occurredAt - a.occurredAt);
    const slice = events.slice(0, limit);

    const enriched = await Promise.all(
      slice.map(async (e) => {
        const quote = await ctx.db
          .query("quotes")
          .withIndex("by_nonce", (q) => q.eq("nonce", e.nonce))
          .unique();
        return {
          _id: e._id,
          occurredAt: e.occurredAt,
          agentWallet: e.agentWallet,
          path: e.path,
          priceMicroUsdc: e.priceMicroUsdc,
          status: e.status,
          txHash: e.txHash,
          arcTxHash: quote?.arcTxHash,
          nonce: e.nonce,
          pricerTrace: quote?.pricerTrace ?? null,
          siteDomain: domains.get(e.siteId.toString()) ?? "unknown",
        };
      }),
    );
    return enriched;
  },
});

// Public landing-page snapshot. No auth required — aggregates the whole
// deployment so anonymous visitors to tollgate.brianmwai.com see the rail
// tick without needing to sign in. Only non-PII counts + truncated tx hashes.
export const publicSnapshot = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    totalOnchainTx: number;
    totalEarnedUuUsdc: number;
    recent: Array<{ id: string; at: number; priceUuUsdc: number; domain: string; txHash: string | null }>;
  }> => {
    const allQuotes = await ctx.db
      .query("quotes")
      .withIndex("by_status_expiry", (q) => q.eq("status", "settled"))
      .order("desc")
      .take(400);
    const totalOnchainTx = allQuotes.length;
    const totalEarnedUuUsdc = allQuotes.reduce((a, q) => a + q.priceMicroUsdc, 0);

    const sites = await ctx.db.query("sites").collect();
    const siteDomains = new Map(sites.map((s) => [s._id.toString(), s.domain]));

    const recent = allQuotes.slice(0, 8).map((q) => ({
      id: q._id as unknown as string,
      at: q._creationTime,
      priceUuUsdc: q.priceMicroUsdc,
      domain: siteDomains.get(q.siteId.toString()) ?? "unknown",
      txHash: q.txHash ?? null,
    }));

    return { totalOnchainTx, totalEarnedUuUsdc, recent };
  },
});

// Wallet pair snapshot for the Realtime page and the demo walkthrough. Pulls
// live Circle balances for both the bot fleet (who pays) and the publisher
// (who receives) so the UI can render "money moving" in real time.
export const walletPair = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    publisher: { walletId: string | null; address: string | null; uUsdc: string };
    botFleet: { walletId: string | null; address: string | null };
  }> => {
    const pub = await getCurrentPublisher(ctx);
    return {
      publisher: {
        walletId: pub?.circleWalletId ?? null,
        address: pub?.arcAddress ?? null,
        uUsdc: pub?.balanceUsdc ?? "0",
      },
      botFleet: {
        walletId: process.env.TOLLGATE_BOT_FLEET_WALLET_ID ?? null,
        address: process.env.TOLLGATE_BOT_FLEET_ADDRESS ?? null,
      },
    };
  },
});

// Tool-usage proof for the hackathon track. Returns which integrations
// produced data in the current publisher's feed — so the judges page can
// render green pills ("Arc ✓", "Circle Gateway ✓", "Gemini ✓") only when
// backed by real rows.
export const toolsUsed = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    arcSettlesSeen: number;
    circleGatewayCalls: number;
    geminiPricerCalls: number;
    circleWalletProvisioned: boolean;
    ercDeploymentAddress: string | null;
  }> => {
    const pub = await getCurrentPublisher(ctx);
    if (!pub) {
      return {
        arcSettlesSeen: 0,
        circleGatewayCalls: 0,
        geminiPricerCalls: 0,
        circleWalletProvisioned: false,
        ercDeploymentAddress: null,
      };
    }
    const sites = await ctx.db
      .query("sites")
      .withIndex("by_publisher", (q) => q.eq("publisherId", pub._id))
      .collect();
    const events = (
      await Promise.all(
        sites.map((s) =>
          ctx.db
            .query("events")
            .withIndex("by_site_time", (q) => q.eq("siteId", s._id))
            .order("desc")
            .take(500),
        ),
      )
    ).flat();
    const arcSettles = events.filter((e) => e.status === "paid_onchain").length;
    // Gateway call count ≈ settle attempts. We do not store pricerTrace on
    // events, so approximate Gemini calls by unique quotes w/ "gemini" in trace.
    const quotes = (
      await Promise.all(
        sites.map((s) =>
          ctx.db
            .query("quotes")
            .withIndex("by_site_time", (q) => q.eq("siteId", s._id))
            .order("desc")
            .take(500),
        ),
      )
    ).flat();
    const geminiCalls = quotes.filter((q) => (q.pricerTrace ?? "").includes("[gemini")).length;

    return {
      arcSettlesSeen: arcSettles,
      circleGatewayCalls: arcSettles, // 1:1 in current architecture
      geminiPricerCalls: geminiCalls,
      circleWalletProvisioned: Boolean(pub.circleWalletId && pub.arcAddress),
      ercDeploymentAddress: process.env.ARC_REPUTATION_CONTRACT ?? null,
    };
  },
});
