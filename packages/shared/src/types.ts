// Shared runtime types consumed by SDKs, edge middleware, and the dashboard.
// Validated with zod at every trust boundary (see each SDK's adapter).

import { z } from "zod";
import type { SupportedChain } from "./constants";

export const Price = z
  .string()
  .regex(/^\d+uUSDC$/, "price must be like '500uUSDC'")
  .transform((s) => ({ uUsdc: Number(s.replace("uUSDC", "")) }));

export const TollgateConfigSchema = z.object({
  siteId: z.string().min(1),
  price: z.union([z.string(), z.number()]), // "500uUSDC" or 500 (uUSDC integer)
  chain: z.enum(["arc-testnet", "arc-mainnet"]),
  facilitatorUrl: z.string().url().optional(),
  hmacSecret: z.string().min(32).optional(), // server-only
  receipt: z
    .object({
      ttl: z.number().int().positive().default(300),
    })
    .default({ ttl: 300 }),
  failOpenOnFacilitator: z.boolean().default(false),
});
export type TollgateConfig = z.infer<typeof TollgateConfigSchema>;

export const Response402 = z.object({
  price: z.object({ uUsdc: z.number().int().nonnegative() }),
  nonce: z.string().min(8),
  recipient: z.string(),
  chain: z.enum(["arc-testnet", "arc-mainnet"]),
  expires: z.number().int().positive(),
});
export type Response402 = z.infer<typeof Response402>;

export const XPaymentHeader = z
  .string()
  .regex(/^[a-z0-9-]+:[0-9a-fx]+:[A-Za-z0-9_\-]+$/, "expected '<network>:<txHash>:<nonce>'");

export const FacilitatorVerifyRequest = z.object({
  network: z.string(),
  txHash: z.string(),
  nonce: z.string(),
  expected: z.object({
    priceUuUsdc: z.number().int().nonnegative(),
    recipient: z.string(),
  }),
});

export const FacilitatorVerifyResponse = z.object({
  ok: z.boolean(),
  reason: z.string().optional(),
});
export type FacilitatorVerifyResponse = z.infer<typeof FacilitatorVerifyResponse>;

export type TollgateEvent = {
  siteId: string;
  agentWallet: string;
  path: string;
  status:
    | "paid_onchain"
    | "paid_cached"
    | "unpaid_402"
    | "rejected"
    | "failed_verify";
  priceMicroUsdc: number;
  txHash?: string;
  nonce: string;
  occurredAt: number;
};

export type { SupportedChain };
