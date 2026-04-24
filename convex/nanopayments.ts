// x402 facilitator settle client. Public x402.org facilitator on testnet,
// Coinbase CDP on mainnet. Speaks x402 v2 exact scheme with an EIP-3009
// TransferWithAuthorization payload. Circle Wallets come into the flow
// when the agent's USDC is custodied by Circle; in our demo the agent
// signs directly from an EOA and the publisher receives via their Circle
// wallet address.
//
// Spec: https://github.com/coinbase/x402
// Shape: { paymentPayload, paymentRequirements } → { success, transaction, ... }
//
// OWNER: x402-protocol-agent.

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const FACILITATOR = {
  testnet: "https://www.x402.org/facilitator",
  mainnet: "https://www.x402.org/facilitator",
} as const;

const PATH = "/settle";
const DEFAULT_TIMEOUT_MS = 8_000;

// Internal action — callable from other Convex actions via runAction.
// Not exposed to the browser.
export const settleX402 = internalAction({
  args: {
    chain: v.union(v.literal("arc-testnet"), v.literal("arc-mainnet")),
    paymentPayload: v.any(),
    paymentRequirements: v.any(),
  },
  handler: async (_ctx, { chain, paymentPayload, paymentRequirements }) => {
    // Dev-only short-circuit: when no Circle key is configured and
    // TOLLGATE_DEV_FAKE_SETTLE is set, emit a deterministic mock tx so the
    // local demo path completes without hitting Circle's testnet gateway.
    // Production MUST set CIRCLE_API_KEY; mock is gated behind the env flag.
    const apiKey = process.env.CIRCLE_API_KEY;
    if (!apiKey && process.env.TOLLGATE_DEV_FAKE_SETTLE === "true") {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      let hex = "0x";
      for (const b of bytes) hex += b.toString(16).padStart(2, "0");
      const payer =
        (paymentPayload as { payload?: { from?: string } } | null)?.payload?.from ??
        "0x0000000000000000000000000000000000000000";
      return {
        ok: true as const,
        status: 200,
        body: {
          success: true,
          transaction: hex,
          network: chain,
          payer,
        },
      };
    }

    const base = chain === "arc-testnet" ? FACILITATOR.testnet : FACILITATOR.mainnet;
    const url = base + PATH;

    // x402.org hosted facilitator requires no auth on testnet. Mainnet
    // flips to Coinbase CDP where the Bearer API key is required.
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (apiKey && chain === "arc-mainnet") headers["authorization"] = `Bearer ${apiKey}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ paymentPayload, paymentRequirements }),
        signal: controller.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        return {
          ok: false as const,
          status: res.status,
          error: "http_error",
          body: text,
        };
      }
      const body = JSON.parse(text) as {
        success: boolean;
        transaction: string;
        network: string;
        errorReason?: string;
        payer?: string;
      };
      return { ok: true as const, status: 200, body };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false as const, status: 0, error: "network", body: msg };
    } finally {
      clearTimeout(timer);
    }
  },
});
