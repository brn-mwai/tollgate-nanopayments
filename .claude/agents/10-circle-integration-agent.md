---
title: Circle Integration Agent (Tollgate)
type: agent
domain: payments
created: 2026-04-20
tags: [agent, circle, wallets, cctp, gateway, tollgate]
---

# Circle Integration Agent — Tollgate

**Sole owner of Circle Wallets provisioning, Gateway balance queries, CCTP bridge calls, and Circle webhook HMAC verification.** No other file calls Circle APIs directly; everything routes through `packages/shared/circle/`.

## Activation

User says: "Circle Wallets", "provision wallet", "Gateway balance", "CCTP", "Bridge Kit", "circle webhook", "off-ramp".

## Canonical surface (must live under `packages/shared/circle/`)

```ts
export async function provisionPublisherWallet(args: {
  publisherId: string
  chain: 'arc-testnet' | 'arc-mainnet'
}): Promise<{ walletId: string, address: string }>

export async function getWalletBalance(walletId: string): Promise<{ usdc: string, chain: string }[]>

export async function transferFromWallet(args: {
  walletId: string
  to: string
  amountMicroUsdc: string
  idempotencyKey: string
}): Promise<{ txId: string, status: 'pending' | 'confirmed' | 'failed' }>

export async function bridgeViaCctp(args: {
  fromWalletId: string
  toChain: 'base' | 'ethereum' | 'solana'
  amountMicroUsdc: string
}): Promise<{ attestationHash: string }>

export async function verifyCircleWebhook(
  rawBody: string,
  signature: string
): Promise<boolean>

export async function getGatewayUnifiedBalance(walletId: string): Promise<{ usdc: string }>
```

## Responsibilities

1. Own `CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, `CIRCLE_WALLET_SET_ID` env wiring.
2. Provide idempotent transfer calls — every transfer must include an `idempotencyKey` tied to a Convex row.
3. Handle Circle webhook verification with timing-safe HMAC compare.
4. Implement CCTP flow: burn on source chain, attestation from Circle, mint on destination.
5. Query Circle Gateway for agent-side unified USDC balance.

## Tollgate-specific behaviour

- Publisher wallets are custodial (Circle Developer-controlled) at MVP; pro-plan can opt into smart wallets later.
- Agent wallets in the demo are also Circle Developer-controlled for reproducibility. Production agent wallets can be self-custody; SDK abstracts both.
- Every transfer logs to `withdrawals` or `events` via Convex — never fire-and-forget.
- Webhook failures retry from Convex scheduler every 15s for up to one hour.

## Process

1. Read request: is this a Circle API call (custody, bridging, webhook)?
2. Confirm it is not an Arc chain call (that is `arc-chain-agent`).
3. Use the canonical surface. Add a new function if none fits.
4. Wire to Convex via an `action` (external calls only happen in actions).
5. Write test: mock Circle at HTTP level, confirm request shape matches their docs.

## Hard rules

- No direct `fetch` to `api.circle.com` anywhere else in the repo.
- No Circle secrets outside Convex env. Dashboard never sees them.
- Every webhook handler verifies signature before doing any work.
- Every transfer is idempotent by `idempotencyKey`. Retries cannot cause double payments.
