# Tollgate

**Bot-economics payment infrastructure on Arc.**

> Cloudflare for AI bots that pays publishers instead of blocking them. Every AI scrape becomes a transaction, not a theft.

Tollgate turns HTTP 402 + USDC on Arc into the first payment rail where sub-cent per-request pricing is mathematically profitable.

- **Protocol:** x402 (Coinbase / Cloudflare / Linux Foundation)
- **Chain:** Arc L1 (Circle's stablecoin-native chain, USDC as gas)
- **Backend:** Convex (reactive DB, functions, cron, vector, search, R2 bridge)
- **Auth:** Clerk (JWT template `convex`)
- **Frontend:** Next.js 16 (App Router, React 19, Tailwind 4, Shadcn/ui)
- **Edge:** Cloudflare Workers (hosted gateway + telemetry)
- **Reputation:** ERC-8004 (Vyper, via Circle-titanoboa SDK)
- **Dogfood upstream:** AIsa Nanopayment APIs

Built for the **Agentic Economy on Arc** hackathon (Circle, SF, April 2026).

## Why this exists

Marc Andreessen: *"The grand unification of AI and crypto is about to happen."* HTTP 402 sat reserved for thirty years. Agents need to pay programmatically. Arc is the only chain where sub-cent per-request math closes (96% margin vs Ethereum's -99,900%).

## Quick start

```bash
pnpm install
pnpm convex dev
pnpm dev
```

See [`docs/ARCHITECTURE.pdf`](docs/ARCHITECTURE.pdf) for the full system design, 11-table Convex schema, 24 functions, 7-endpoint public API, and 5-day build plan.

## Repo layout

```
apps/
  dashboard/       Next.js 16 publisher dashboard
  demo-site/       demo-news.brianmwai.com, protected by middleware
packages/
  middleware-express/
  middleware-hono/
  middleware-cfw/
  agent-sdk-node/
  shared/          shared types, constants, pricing helpers
convex/            schema, queries, mutations, actions, cron, httpActions
docs/
  ARCHITECTURE.pdf
  research-topics.md   study list for every layer
  system-design.md     compressed spec
.claude/
  agents/          12 specialist agent definitions
```

## Agent orchestration

Twelve agents code Tollgate. See [`.claude/agents/`](.claude/agents/) for the full roster. One source of truth per concern: only `arc-chain-agent` touches Arc RPC, only `circle-integration-agent` touches Circle APIs, only `x402-protocol-agent` touches 402 + receipts.

## License

MIT. See [`LICENSE`](LICENSE).

## Hackathon submission

- **Event:** [Agentic Economy on Arc](https://lablab.ai/ai-hackathons/nano-payments-arc) — Circle / LabLab / Arc House / Google DeepMind, April 20-26, 2026
- **Primary track:** Per-API Monetization Engine
- **Secondary track:** Agent-to-Agent Payment Loop (see `apps/bot-simulator`)
- **Gemini track:** Gemini 3 Flash Function Calling powers every quote (see `convex/gemini.ts`)
- **Circle products used:** Arc L1, USDC, Circle Nanopayments + Gateway x402, Circle Wallets (developer-controlled), Circle CCTP (Bridge Kit) for off-ramp, x402 standard end-to-end
- **Required-evidence endpoints:**
  - `/app/realtime` — live traffic + provider health + unit economics + streaming event feed with per-quote Gemini reasoning and arcscan links
  - `/app/wallet` — Circle Wallets live balance + Arc explorer link
  - `/app/withdrawals` — Circle Transfer execute button + CCTP destination chain picker
  - `/app/sites/[id]` — per-site quote history w/ Gemini pricing trace
- **Demo script:**
  1. `pnpm install && pnpm convex:dev`
  2. Seed: `npx convex run dev:seedDemo` → returns `siteId`, `apiKey`, `hmacSecret` for `.env.local`
  3. Run demo-news: `pnpm -C apps/demo-news dev` (http://localhost:4001)
  4. Run simulator: `pnpm -C apps/bot-simulator burst` → 60 onchain settles
  5. Verify on `https://testnet.arcscan.app` via any tx hash link on `/app/realtime`
- **Margin proof:** see [`docs/MARGIN.md`](docs/MARGIN.md)
- **Circle feedback (for $500 bonus):** see [`docs/CIRCLE-FEEDBACK.md`](docs/CIRCLE-FEEDBACK.md)
- **Author:** Brian Mwai ([brianmwai.com](https://brianmwai.com))
- **Demo:** [tollgate.brianmwai.com](https://tollgate.brianmwai.com)
