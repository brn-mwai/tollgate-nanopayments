# Circle Product Feedback — Tollgate submission

> This is the required feedback field from the submission form. $500 USDC
> bonus goes to the most detailed feedback. The content below is meant to be
> pasted into the submission textbox; edit freely before final send.

## Products used

| Product | Where | Why |
|---|---|---|
| **Arc L1** | `convex/nanopayments.ts`, `packages/shared/src/constants.ts` | Only chain where per-request USDC settlement is margin-positive; native gas = stablecoin |
| **USDC (6-decimal interface on Arc)** | Asset `0x3600…0000` in every 402 body | Stable unit of account; sub-cent integers in `uUSDC` avoid float rounding |
| **Circle Nanopayments / x402 Gateway** | `convex/nanopayments.ts::settleX402` POSTs to `gateway-api-testnet.circle.com/gateway/v1/x402/settle` | Verifies the X-PAYMENT payload signed by the agent and relays onchain; one call completes what would otherwise be 3+ RPC calls |
| **Circle Wallets (Developer-controlled)** | `convex/circle.ts::createWallet`, `getUsdcBalance`, `createTransfer`; `/app/wallet` UI | Provisions a custodial publisher wallet on Arc; entity-secret RSA encryption handled per-request; `/app/wallet` shows live USDC balance; `/app/withdrawals` executes transfers |
| **Circle Bridge Kit / CCTP** | `/app/withdrawals` destChain picker (arc / base / ethereum / solana) | Lets publishers off-ramp USDC to wherever they bank/bill; four chains surfaced in one form |
| **x402 standard (Linux Foundation / Coinbase)** | `packages/middleware/src/core.ts`, `packages/sdk-node/src/index.ts` | Full end-to-end: middleware issues standards-compliant 402, SDK builds X-PAYMENT, Circle verifies |
| **Google Gemini 3 Flash (Function Calling)** | `convex/gemini.ts::price` → three callable tools (`getAgentReputation`, `listSitePricingRules`, `recentPaymentActivity`) | Prices every quote based on live site rules + agent reputation; multi-turn tool dispatch; trace captured in `quotes.pricerTrace` and rendered on `/app/realtime` and `/app/sites/[id]` |

## Track alignment

**Primary: Per-API Monetization Engine** — Tollgate is the monetization engine.

**Secondary: Agent-to-Agent Payment Loop** — `apps/bot-simulator` spawns 20+
autonomous agents that pay and receive value in real time, no batching, no
custodial control on the paying side.

**Gemini track** — Function Calling powers pricing; reasoning traces surface
in the dashboard; swap-out for Gemini 3 Pro on the abuse-detection cron.

## What worked well

1. **Gateway x402 settle is a single HTTP POST.** Replacing a multi-step
   facilitator implementation with `paymentPayload + paymentRequirements →
   { success, transaction, payer }` collapsed our settlement code by ~80%.
2. **Entity-secret RSA encryption in Circle Wallets is well-documented.**
   The 5-minute public-key cache + OAEP-SHA256 wrapping worked first try
   against the spec at `developers.circle.com/w3s/developer-controlled-create-your-first-wallet`.
3. **CCTP chain enum in Circle Wallets is the right interface.** We expose
   it directly as a radio in `/app/withdrawals` — `arc | base | ethereum |
   solana` is the publisher's mental model already.
4. **Arc testnet faucet funnel.** One form → approved same-day; the team
   could start generating real onchain txs without enterprise sales motion.

## What could be improved

1. **`"ARC-SEPOLIA"` is not yet a valid `blockchain` value on
   `POST /developer/wallets`.** We default to `BASE-SEPOLIA` via
   `CIRCLE_BLOCKCHAIN` env and document that publishers wanting pure-Arc
   custody must wait. Expose the canonical Arc testnet string as soon as it
   ships.
2. **Gateway x402 settle requires API authentication but the public spec
   page does not explicitly state the Bearer-token header.** We discovered
   it empirically. A one-line callout in the gateway docs would shave 15
   minutes off every integrator's first deploy.
3. **Webhook signing uses a raw HMAC rather than svix.** We had to hand-roll
   `verifyCircleSignature` in `convex/http.ts`. Standardising on svix (as
   Clerk does) or adopting a shared `@circle/webhook-verify` helper would
   eliminate an entire category of integration bugs.
4. **Developer Console does not yet surface a per-wallet x402 tx history.**
   Judges will flip between the console and `testnet.arcscan.app` to verify
   flow. A `tx type=x402_settle` filter on the wallet page would close the
   gap.
5. **Balance amounts come back as human-decimal strings.** We immediately
   convert to `uUSDC` BigInt for storage. Returning both formats in the
   response — `amountDecimal` + `amountMicro` — would let integrators pick
   without a lossy parseFloat.
6. **Idempotency key expiry window is not documented.** We use the
   withdrawal UUID forever; knowing the server-side key TTL would let us
   safely regenerate a key after a timeout instead of surfacing a cryptic
   error.
7. **Circle-titanoboa + Vyper deployment story.** We scoped ERC-8004
   reputation to Day 4 and ultimately kept it in Convex for demo stability.
   A `npx circle-vyper deploy` style wrapper (analogous to `wrangler
   deploy`) would make the Vyper + x402 story the obvious path instead of a
   stretch goal.

## Recommendations to make DX seamless

- **Unified mono-package** `@circle/cdk` that re-exports Wallets, Gateway,
  Nanopayments, CCTP with typed clients. Today we pull from three sections
  of `developers.circle.com`.
- **"From-zero-to-first-x402-settle" video** under 10 min, using a free-tier
  developer account. Existing YouTube covers Arc mainnet setup; the testnet
  path for builders is thinner.
- **Rust + Go SDKs for Circle Wallets.** Our backend is TS/Node, but agent
  runtimes are increasingly Go (Claude code agents) and Rust (Featherless
  gateway). A missing SDK is a gating factor for those stacks.
- **Explicit quota doc for the Gateway x402 settle path** — judges will ask
  "what happens at 10 QPS?" and we don't have a clean answer.
- **Public TestNet status page.** When Arc testnet or Gateway is degraded,
  integrators currently infer from 502s. A `status.circle.com` with real
  uptime numbers would reduce support load.

## Where Tollgate goes next (post-hackathon)

- Deploy ERC-8004 on Arc mainnet via Circle-titanoboa; real onchain
  reputation replaces the Convex `agents.reputationScore` column.
- Add Cloudflare Workers edge variant of the middleware (already scaffolded
  in `packages/middleware`) so a publisher can front their API without
  running a Node server.
- Wire AIsa Nanopayment APIs as an upstream dogfood — our own agents pay
  AIsa for data using the same 402 flow they expose to their customers.
- Add Circle Gateway "unified USDC" balance display on `/app/wallet` so the
  publisher sees their cross-chain total without switching tabs.
