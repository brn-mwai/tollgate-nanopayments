---
title: x402 Protocol Agent (Tollgate)
type: agent
domain: protocol
created: 2026-04-20
tags: [agent, x402, 402, facilitator, hmac, receipt, nonce, tollgate]
---

# x402 Protocol Agent — Tollgate

**Sole owner of the 402 response builder, facilitator client, nonce generator, and receipt HMAC sign/verify.** This is the heart of Tollgate. No other file implements 402 semantics.

## Activation

User says: "402", "facilitator", "HMAC receipt", "nonce", "x402", "payment header", "cached receipt".

## Canonical surface (must live under `packages/shared/x402/`)

```ts
export function build402Response(args: {
  priceMicroUsdc: number
  recipient: string
  chain: 'arc-testnet' | 'arc-mainnet'
  expiresInSec?: number
}): { status: 402, headers: Record<string,string>, body: { price, nonce, recipient, chain, expires } }

export async function verifyPayment(args: {
  xPaymentHeader: string
  expected: { priceMicroUsdc: number, recipient: string }
}): Promise<{ ok: true, txHash: string, nonce: string } | { ok: false, reason: string }>

export function issueReceipt(args: {
  siteId: string
  agentWallet: string
  ttlSec?: number
}): string  // base64(`v1.${payload}.${hmac}`)

export function verifyReceipt(receipt: string, siteSecret: string):
  | { ok: true, agentWallet: string, expiresAt: number }
  | { ok: false, reason: string }

export function rotateSecret(siteId: string): Promise<string>  // writes `receipts` table
```

## x402 protocol (per Coinbase spec + Linux Foundation)

1. Client GET without `X-Payment` → server returns `402` with `{price, nonce, recipient, chain, expires}`.
2. Client signs a USDC transfer on Arc, gets `txHash`.
3. Client retries GET with `X-Payment: <network>:<txHash>:<nonce>`.
4. Middleware posts `X-Payment` to facilitator at `X402_FACILITATOR_URL/v1/verify`.
5. Facilitator returns `{ ok: true }` iff TX exists, amount matches, recipient matches, nonce not seen.
6. Middleware logs event, issues `X-Tollgate-Receipt: <hmac>`, serves 200.
7. Subsequent requests with a valid receipt skip the facilitator and the chain.

## Receipt format (Tollgate-specific, on top of x402)

```
X-Tollgate-Receipt: v1.<base64url(payload)>.<hex(hmac_sha256)>
payload = {
  site: <siteId>,
  agent: <0xwallet>,
  exp: <unix seconds>,
  tier: <'free' | 'pro' | 'enterprise'>
}
hmac = HMAC-SHA256(secret, payload-bytes)
```

- TTL default: 300 seconds (5 min).
- Secret stored in Convex `receipts` table, rotatable via `rotateSecret`.
- Compare with `timingSafeEqual`. Never `===`.

## Nonce handling

- Generate: `crypto.randomUUID()` (v4). 16+ bytes entropy.
- Edge LRU dedupe: in-process Map with 1-minute TTL, capped at 10k entries.
- Durable dedupe: `nonceLog` table, `by_nonce` index, cron-cleaned every 10 minutes.
- If a nonce is seen twice at the edge, respond 402 with a fresh nonce — never 403 (that leaks dedupe state).

## Responsibilities

1. Implement the three functions above with tests.
2. Provide a middleware adapter for each runtime (Express, Hono, CFW) that calls into these.
3. Expose a CLI `tollgate receipt issue` / `verify` for demo scripts.
4. Align with the open x402 spec so Coinbase / Linux Foundation integrations keep working.

## Hard rules

- No 402 response built anywhere except through `build402Response`.
- No HMAC verify except through `verifyReceipt`.
- No nonce compare except through the dedupe helper.
- Every protocol change bumps the `v1.` prefix to `v2.` and documents the upgrade path.
