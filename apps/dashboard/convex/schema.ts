// 11 tables per docs/ARCHITECTURE.pdf Section 5.1.
// Every query is backed by an index. Monetary amounts stored as strings for
// onchain precision (uUSDC is 6-decimal; never use JS number).

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("publisher"), v.literal("admin")),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  publishers: defineTable({
    ownerId: v.id("users"),
    orgSlug: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    circleWalletId: v.optional(v.string()),
    arcAddress: v.optional(v.string()),
    balanceUsdc: v.string(), // "0" on create. uUSDC as a string.
    platformFeeBps: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["orgSlug"])
    .index("by_address", ["arcAddress"]),

  sites: defineTable({
    publisherId: v.id("publishers"),
    domain: v.string(),
    apiKeyHash: v.string(),
    status: v.union(
      v.literal("unverified"),
      v.literal("active"),
      v.literal("suspended"),
    ),
    verifyToken: v.string(),
    failOpenOnFacilitator: v.boolean(),
  })
    .index("by_publisher", ["publisherId"])
    .index("by_domain", ["domain"])
    .index("by_keyhash", ["apiKeyHash"]),

  pricingRules: defineTable({
    siteId: v.id("sites"),
    pathPattern: v.string(),
    priceMicroUsdc: v.number(),
    botClass: v.optional(v.string()),
    priority: v.number(),
  }).index("by_site_priority", ["siteId", "priority"]),

  agents: defineTable({
    walletAddress: v.string(),
    label: v.optional(v.string()),
    reputationScore: v.number(),
    totalPaidMicroUsdc: v.string(),
    firstSeenAt: v.number(),
    status: v.union(v.literal("active"), v.literal("flagged"), v.literal("banned")),
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_score", ["reputationScore"])
    .searchIndex("search_label", { searchField: "label" }),

  events: defineTable({
    siteId: v.id("sites"),
    agentWallet: v.string(),
    path: v.string(),
    status: v.union(
      v.literal("paid_onchain"),
      v.literal("paid_cached"),
      v.literal("unpaid_402"),
      v.literal("rejected"),
      v.literal("failed_verify"),
    ),
    priceMicroUsdc: v.number(),
    txHash: v.optional(v.string()),
    nonce: v.string(),
    occurredAt: v.number(),
  })
    .index("by_site_time", ["siteId", "occurredAt"])
    .index("by_agent_time", ["agentWallet", "occurredAt"])
    .index("by_txhash", ["txHash"])
    .index("by_nonce", ["nonce"]),

  hourlyRollup: defineTable({
    siteId: v.id("sites"),
    hourBucket: v.number(),
    totalRequests: v.number(),
    paidRequests: v.number(),
    earnedMicroUsdc: v.number(),
    uniqueAgents: v.number(),
  }).index("by_site_hour", ["siteId", "hourBucket"]),

  withdrawals: defineTable({
    publisherId: v.id("publishers"),
    amountMicroUsdc: v.string(),
    destination: v.string(),
    destChain: v.union(
      v.literal("arc"),
      v.literal("base"),
      v.literal("ethereum"),
      v.literal("solana"),
    ),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    circleTxId: v.optional(v.string()),
    circleIdempotencyKey: v.optional(v.string()),
    requestedAt: v.number(),
  }).index("by_publisher_time", ["publisherId", "requestedAt"]),

  receipts: defineTable({
    hmacKey: v.string(),
    siteId: v.id("sites"),
    rotatedAt: v.number(),
  }).index("by_site", ["siteId"]),

  nonceLog: defineTable({
    nonce: v.string(),
    siteId: v.id("sites"),
    seenAt: v.number(),
  }).index("by_nonce", ["nonce"]),

  auditLog: defineTable({
    actor: v.string(),
    action: v.string(),
    entity: v.string(),
    entityId: v.string(),
    meta: v.any(),
    occurredAt: v.number(),
  })
    .index("by_actor_time", ["actor", "occurredAt"])
    .index("by_entity_time", ["entity", "entityId", "occurredAt"]),

  // Active 402 offers. Row lives from quote creation until settle or expiry.
  // nonce is the stable quote id emitted in the 402 response.
  quotes: defineTable({
    nonce: v.string(),
    siteId: v.id("sites"),
    path: v.string(),
    priceMicroUsdc: v.number(),
    payTo: v.string(),
    agentWallet: v.optional(v.string()),
    pricerTrace: v.optional(v.string()), // Gemini reasoning captured at quote time
    expiresAt: v.number(),
    status: v.union(
      v.literal("open"),
      v.literal("settled"),
      v.literal("failed"),
      v.literal("expired"),
    ),
    circleTxId: v.optional(v.string()), // Circle transaction UUID (immediate)
    txHash: v.optional(v.string()), // Base Sepolia tx hash (after Circle webhook)
    arcTxHash: v.optional(v.string()), // Arc Sepolia tx hash (mirrored settle leg)
    createdAt: v.number(),
  })
    .index("by_nonce", ["nonce"])
    .index("by_circle_tx", ["circleTxId"])
    .index("by_site_time", ["siteId", "createdAt"])
    .index("by_status_expiry", ["status", "expiresAt"]),

  // Dashboard-initiated bot burst runs — the publisher's "run a demo" button.
  // One row per run; botRunSteps rows below carry the per-step execution log.
  botRuns: defineTable({
    publisherId: v.id("publishers"),
    siteId: v.id("sites"),
    iterations: v.number(),
    settled: v.number(),
    failed: v.number(),
    status: v.union(v.literal("running"), v.literal("complete"), v.literal("failed")),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
  }).index("by_publisher_time", ["publisherId", "startedAt"]),

  botRunSteps: defineTable({
    runId: v.id("botRuns"),
    kind: v.string(),
    message: v.string(),
    meta: v.any(),
    occurredAt: v.number(),
  }).index("by_run_time", ["runId", "occurredAt"]),
});
