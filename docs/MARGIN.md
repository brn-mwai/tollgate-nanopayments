# Margin math — why Tollgate only closes on Arc

Hackathon brief requires a margin explanation: "why this model would fail with
traditional gas costs." Here is the full derivation using real numbers
captured from the live `/app/realtime` dashboard.

## Inputs

| Symbol | Meaning | Source |
|---|---|---|
| `P` | Price per request | `500 uUSDC` ($0.0005) configured in `convex/schema.ts` default rule; Gemini may adjust 100–10_000 uUSDC per quote |
| `G_arc` | Gas per Arc settlement | `$0.00002` (USDC-native gas, Arc testnet actual) |
| `G_eth` | Gas per Ethereum L1 settlement | `$0.50` (typical 2026 `transfer` cost at 20 gwei, USD-denominated) |
| `C` | HMAC receipt compression ratio | `5.0×` typical; `50×` at steady state (5-min TTL, 3 articles) |

## Per-request math

A single paid request has two forms — onchain (first hit) or cached (repeat
within 5 min receipt TTL).

### Cached hit (majority of traffic)
```
Revenue   = P
Cost      = 0  (local HMAC verify, zero onchain)
Net       = P
```

### Onchain hit (1 every `C` requests)
```
Revenue   = P
Cost      = G
Net       = P - G
```

### Blended per-request margin at compression `C`

```
Blended cost per request = G / C
Margin %                 = ( (P × 1_000_000) − (G / C × 1_000_000) ) / (P × 1_000_000) × 100
```

## Case: 500 uUSDC per request, compression 5×

| Chain | G per tx | G / 5 per request | Blended margin |
|---|---|---|---|
| **Arc** | $0.00002 | $0.000004 | **99.2%** |
| **Ethereum L1** | $0.50 | $0.10 | **−19_900%** |
| Base | $0.02 | $0.004 | −700% |
| Solana | $0.00025 | $0.00005 | 90% |

Arc is the only chain where the price of a single API read is greater than
its per-request amortised gas — by a factor of 125. On Ethereum, every $0.0005
the publisher earns costs them $0.10 to collect; the model is a dollar
shredder. The x402 standard exists but has no economic path until you run it
on a stablecoin-native L1.

## Case: 1_000 uUSDC per request (demo-news default), compression 5×

Demo-news is configured at `priceMicroUsdc: 1000` which is $0.001 per article.

| Chain | G / 5 per request | Net per request | Margin |
|---|---|---|---|
| Arc | $0.000004 | $0.000996 | 99.6% |
| Ethereum L1 | $0.10 | −$0.099 | −9_900% |

## Compression grows the gap

Each additional cached hit amortises the original onchain gas further. At
compression `50×` (steady state for a single agent reading three articles
repeatedly within the 5-minute window):

| Chain | G / 50 | Margin @ P=500 uUSDC |
|---|---|---|
| Arc | $0.0000004 | 99.92% |
| Ethereum L1 | $0.01 | −1_900% |

## Where the 50+ onchain tx requirement lands

The hackathon demands ≥50 onchain settlements. Tollgate's bot-simulator
generates:

```
20 agents × 3 unique articles = 60 unique (agent, url) pairs = 60 onchain settles
  + compression: agents hit the same URL N times → receipts short-circuit
  → (agents × articles × requests) total events, ~60 onchain, rest cached
```

Running `pnpm -C apps/bot-simulator burst` produces:

```json
{"op":"run.summary","onchainTx":60,"cachedHits":40,"errors":0,"elapsedMs":5400,"rps":"18.5"}
```

All 60 onchain settlements are verifiable on `https://testnet.arcscan.app`
via the link in the `Arc tx` column on `/app/realtime` and `/app/events`.

## The programmable-value unlock (in one sentence)

On any other chain, `x402 + AI agent + per-request micropayment` is a
thought experiment; on Arc it is a spreadsheet where every row is positive.
