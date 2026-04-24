// Tollgate agent SDK. One function: createAgent. Returns a fetch that
// transparently handles HTTP 402 payment on Arc.
//
// Usage:
//   const agent = createAgent({ privateKey: "0x...", chain: "arc-testnet" });
//   const res = await agent.fetch("https://publisher/api/article/1");
//   const body = await res.json();
//
// The agent caches HMAC receipts per-resource for 5 min (issued by the
// publisher's middleware). Repeat requests skip the payment round-trip.

import { privateKeyToAccount } from "viem/accounts";
import type { Hex, Address } from "viem";


export type Chain = "arc-testnet" | "arc-mainnet";

export type AgentConfig = {
  privateKey: Hex;
  chain?: Chain;
  botClass?: string;
  receiptTtlSec?: number;
  maxPricePerRequestUu?: number;
};

export type Agent = {
  address: Address;
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
};

type CachedReceipt = { token: string; expires: number };

type Accepted = {
  scheme: string;
  network: string;
  asset: string;
  amount: string;
  payTo: string;
  extra?: { nonce?: string };
};

type QuoteBody = {
  x402Version: number;
  accepts: Accepted[];
  resource?: { url: string };
};

export function createAgent(cfg: AgentConfig): Agent {
  const account = privateKeyToAccount(cfg.privateKey);
  const receipts = new Map<string, CachedReceipt>();
  const ttlSec = cfg.receiptTtlSec ?? 300;
  const priceCeil = cfg.maxPricePerRequestUu ?? Number.POSITIVE_INFINITY;

  async function agentFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const baseHeaders = {
      "x-agent-wallet": account.address,
      ...(cfg.botClass ? { "x-bot-class": cfg.botClass } : {}),
    };
    const cached = receipts.get(url);
    if (cached && cached.expires > nowSec()) {
      const res = await fetch(url, {
        ...init,
        headers: mergeHeaders(init.headers, baseHeaders, {
          "x-tollgate-receipt": cached.token,
        }),
      });
      if (res.ok) return res;
      receipts.delete(url);
    }

    const cold = await fetch(url, {
      ...init,
      headers: mergeHeaders(init.headers, baseHeaders),
    });
    if (cold.status !== 402) return cold;

    const quote = (await cold.json()) as QuoteBody;
    const accepted = quote.accepts?.[0];
    if (!accepted) throw new Error("tollgate: 402 body missing accepts[0]");
    if (Number(accepted.amount) > priceCeil) {
      throw new Error(
        `tollgate: price ${accepted.amount}uUSDC exceeds maxPricePerRequestUu ${priceCeil}`,
      );
    }

    const paymentHeader = await buildPayment(account, accepted);
    const paid = await fetch(url, {
      ...init,
      headers: mergeHeaders(init.headers, baseHeaders, {
        "x-payment": paymentHeader,
      }),
    });
    if (!paid.ok) return paid;

    const set = paid.headers.get("x-tollgate-receipt-set");
    if (set) receipts.set(url, { token: set, expires: nowSec() + ttlSec });
    return paid;
  }

  return { address: account.address, fetch: agentFetch };
}

// ── Payment encoding ──────────────────────────────────────────────
// The agent signs a deterministic message binding the quote nonce, amount,
// and recipient. The publisher's Convex action verifies this signature
// then fires a real Circle Transfer (publisher → burn address, 1 uUSDC)
// to produce the onchain settlement proof. The signature protects the
// publisher against replay attacks — only the agent that holds the private
// key could have produced a matching signature for this nonce.
//
// In production with Circle-custody agent wallets or a compatible x402
// facilitator we swap the settle-side to a real EIP-3009 relay; the
// agent-side signing scheme stays unchanged.

async function buildPayment(
  account: ReturnType<typeof privateKeyToAccount>,
  accepted: Accepted,
): Promise<string> {
  const nonce = accepted.extra?.nonce;
  if (!nonce) throw new Error("tollgate: 402 accepts[0].extra.nonce missing");

  const message = `tollgate-x402:${nonce}:${accepted.amount}:${accepted.payTo}`;
  const signature = await account.signMessage({ message });

  const body = {
    x402Version: 1,
    accepted,
    payload: {
      from: account.address,
      to: accepted.payTo,
      amount: accepted.amount,
      asset: accepted.asset,
      signature,
      nonce,
    },
  };
  return toBase64(JSON.stringify(body));
}

// ── Helpers ──────────────────────────────────────────────────────

function mergeHeaders(
  a: HeadersInit | undefined,
  ...more: Record<string, string>[]
): Headers {
  const h = new Headers(a);
  for (const m of more) for (const [k, v] of Object.entries(m)) h.set(k, v);
  return h;
}

function toBase64(s: string): string {
  return Buffer.from(s, "utf8").toString("base64");
}

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}
