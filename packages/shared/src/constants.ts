// System-wide constants. One source of truth. Import everywhere.

export const RECEIPT_TTL_SEC = 300; // 5-minute HMAC cache
export const NONCE_EDGE_TTL_MS = 60_000; // 1-minute LRU at the edge
export const NONCE_EDGE_MAX = 10_000;

export const TELEMETRY_BATCH_FLUSH_MS = 5_000;
export const TELEMETRY_BATCH_MAX = 100;

export const FACILITATOR_TIMEOUT_MS = 5_000;
export const CHAIN_RPC_TIMEOUT_MS = 5_000;
export const CHAIN_RPC_MAX_RETRIES = 3;

export const DEFAULT_PRICE_UUSDC = 500; // $0.0005 — architecture doc demo default
export const HMAC_SECRET_BYTES = 32;
export const RECEIPT_VERSION = "v1" as const;

export type SupportedChain = "arc-testnet" | "arc-mainnet";

export const CHAINS: Record<
  SupportedChain,
  { id: number; name: string; explorer: string; usdc: string }
> = {
  "arc-testnet": {
    id: 0, // set from ARC_CHAIN_ID env at boot; this file only defines shape
    name: "Arc Testnet",
    explorer: "https://explorer.testnet.arc.network",
    usdc: "",
  },
  "arc-mainnet": {
    id: 0,
    name: "Arc",
    explorer: "https://explorer.arc.network",
    usdc: "",
  },
};

export const AGENT_TIERS = [
  { tier: "unverified", min: 0, max: 0.5, discountBps: 0 },
  { tier: "verified", min: 0.5, max: 0.8, discountBps: 2500 },
  { tier: "trusted", min: 0.8, max: 0.95, discountBps: 5000 },
  { tier: "preferred", min: 0.95, max: 1.01, discountBps: 8000 },
] as const;

export type AgentTier = (typeof AGENT_TIERS)[number]["tier"];
