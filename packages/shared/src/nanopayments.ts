// Circle Nanopayments / Gateway x402 settle client. OWNER: circle-integration-agent.
// Thin wrapper over https://gateway-api-testnet.circle.com/gateway/v1/x402/settle
// (documented at developers.circle.com/api-reference/gateway/all/settle-x402payment).
// Circle Gateway is the ONLY facilitator that supports Arc as of 2026-04.
//
// Scheme: x402 "exact" — payer transfers an exact USDC amount to payTo.
// The facilitator verifies the onchain transaction and returns its hash.

import { CIRCLE_GATEWAY, facilitatorUrlFor, type SupportedChain } from "./constants";

export type X402Scheme = "exact";

export type PaymentRequirements = {
  scheme: X402Scheme;
  network: string; // CAIP-2 e.g. "eip155:5042002"
  asset: string; // contract address of the USDC ERC-20 interface
  amount: string; // uUSDC as string integer
  payTo: string; // recipient EVM address
  maxTimeoutSeconds: number;
  extra?: Record<string, unknown>;
};

export type PaymentPayload = {
  x402Version: number;
  resource: {
    url: string;
    description?: string;
    mimeType?: string;
  };
  accepted: PaymentRequirements;
  payload: Record<string, unknown>; // scheme-specific (exact: signed tx or Circle payment id)
  extensions?: Record<string, unknown>;
};

export type SettleRequest = {
  paymentPayload: PaymentPayload;
  paymentRequirements: PaymentRequirements;
};

export type SettleResponse =
  | {
      success: true;
      transaction: string; // onchain tx hash
      network: string;
      payer?: string;
    }
  | {
      success: false;
      transaction: string;
      network: string;
      errorReason:
        | "insufficient_funds"
        | "invalid_signature"
        | "invalid_payload"
        | "invalid_recipient"
        | "invalid_amount"
        | "invalid_network"
        | "invalid_asset"
        | "invalid_scheme"
        | "timeout"
        | "unknown";
      payer?: string;
    };

export class FacilitatorError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "FacilitatorError";
  }
}

// Build payment requirements for a given price + chain + publisher address.
export function buildRequirements(args: {
  chain: SupportedChain;
  usdcAddress: `0x${string}`;
  amountUuUsdc: string;
  payTo: `0x${string}`;
  maxTimeoutSeconds?: number;
}): PaymentRequirements {
  return {
    scheme: "exact",
    network: caip2For(args.chain),
    asset: args.usdcAddress,
    amount: args.amountUuUsdc,
    payTo: args.payTo,
    maxTimeoutSeconds: args.maxTimeoutSeconds ?? 120,
  };
}

// POST the x402 payload to Circle Gateway for verification + settlement.
// Throws FacilitatorError on network errors; returns a typed result otherwise.
export async function settleX402(args: {
  chain: SupportedChain;
  request: SettleRequest;
  timeoutMs?: number;
}): Promise<SettleResponse> {
  const url = facilitatorUrlFor(args.chain);
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), args.timeoutMs ?? 5000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(args.request),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await safeText(res);
      throw new FacilitatorError(res.status, "http_error", `settle http ${res.status}: ${body}`);
    }
    const body = (await res.json()) as SettleResponse;
    return body;
  } catch (err) {
    if (err instanceof FacilitatorError) throw err;
    const name = err instanceof Error ? err.name : "unknown";
    const msg = err instanceof Error ? err.message : String(err);
    throw new FacilitatorError(0, name, msg);
  } finally {
    clearTimeout(t);
  }
}

export function caip2For(chain: SupportedChain): string {
  return chain === "arc-testnet" ? "eip155:5042002" : "eip155:0";
}

export function baseUrlFor(chain: SupportedChain): string {
  return chain === "arc-testnet" ? CIRCLE_GATEWAY.testnet : CIRCLE_GATEWAY.mainnet;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<no body>";
  }
}
