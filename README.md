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

- **Track:** [Agentic Economy on Arc](https://lablab.ai/ai-hackathons/nano-payments-arc) (Circle / LabLab / Arc House / Google DeepMind, April 20-26, 2026, $10K prize pool)
- **Circle products used:** Arc L1, USDC, Nanopayments, Wallets, Gateway, Bridge Kit (CCTP), x402, Circle-titanoboa, Developer Console, Developer Blog
- **Author:** Brian Mwai ([brianmwai.com](https://brianmwai.com))
- **Demo:** [tollgate.brianmwai.com](https://tollgate.brianmwai.com)
