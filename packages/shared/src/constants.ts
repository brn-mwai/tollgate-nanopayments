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

// Tollgate advertises "Arc" as its conceptual chain brand, but at the
// onchain layer we currently settle on Base Sepolia because:
//   1. Circle Wallets' `blockchains` enum does not yet expose ARC-SEPOLIA
//   2. The hosted x402 facilitator at x402.org supports Base Sepolia today
// Flipping to real Arc is a two-constant change once Circle + Arc ship the
// last pieces — no application code will need to move.
//
// CAIP-2 IDs from https://chainagnostic.org/CAIPs/caip-2 references:
//   Base Sepolia     eip155:84532
//   Base Mainnet     eip155:8453
//   Arc Sepolia      eip155:5042002 (pending Circle enablement)
// USDC contract addresses (6-decimal ERC-20 interface everywhere):
//   Base Sepolia     0x036CbD53842c5426634e7929541eC2318f3dCF7e
//   Base Mainnet     0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
//   Arc (testnet)    0x3600000000000000000000000000000000000000
export const CHAINS: Record<
  SupportedChain,
  {
    id: number;
    caip2: string;
    name: string;
    rpcUrl: string;
    wsUrl: string;
    explorer: string;
    usdc: `0x${string}`;
    faucet: string;
  }
> = {
  "arc-testnet": {
    id: 84532,
    caip2: "eip155:84532",
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    wsUrl: "wss://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    faucet: "https://faucet.circle.com",
  },
  "arc-mainnet": {
    id: 8453,
    caip2: "eip155:8453",
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    wsUrl: "wss://mainnet.base.org",
    explorer: "https://basescan.org",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    faucet: "",
  },
};

// Public x402 facilitator hosted by the x402 Foundation. Supports Base
// Sepolia + Solana + Algorand + Aptos (GET /supported for full list).
// Requires no authentication on testnet. Switch to Coinbase CDP for
// mainnet where auth is required.
export const X402_FACILITATOR = {
  testnet: "https://www.x402.org/facilitator",
  mainnet: "https://www.x402.org/facilitator",
} as const;

export function facilitatorUrlFor(chain: SupportedChain): string {
  const base = chain === "arc-testnet" ? X402_FACILITATOR.testnet : X402_FACILITATOR.mainnet;
  return base;
}

export const AGENT_TIERS = [
  { tier: "unverified", min: 0, max: 0.5, discountBps: 0 },
  { tier: "verified", min: 0.5, max: 0.8, discountBps: 2500 },
  { tier: "trusted", min: 0.8, max: 0.95, discountBps: 5000 },
  { tier: "preferred", min: 0.95, max: 1.01, discountBps: 8000 },
] as const;

export type AgentTier = (typeof AGENT_TIERS)[number]["tier"];
