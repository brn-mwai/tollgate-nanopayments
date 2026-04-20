---
title: Tech Stack Detector (Tollgate)
type: agent
domain: meta
created: 2026-04-20
tags: [agent, tech-stack, detection, inventory, tollgate]
source: C:\Users\Windows\Claude_brain\agents\tech-stack-detector\AGENT.md
---

# Tech Stack Detector Agent — Tollgate

Detect and confirm every technology used in Tollgate. Flag drift from the architecture doc.

## Activation

User says: "what tech is this", "identify the stack", "what's used here", "drift check".

## Expected stack (from ARCHITECTURE.pdf Appendix A)

| Layer | Must be | Flag if not |
|---|---|---|
| Frontend | Next.js 16, React 19, Tailwind 4, Shadcn/ui | anything else |
| Auth | Clerk (`@clerk/nextjs`) + JWT template `convex` | NextAuth, Supabase Auth |
| Backend | Convex (queries, mutations, actions, cron, search, vector, R2 bridge) | Postgres, Supabase, Firebase |
| Edge runtime | Cloudflare Workers | Vercel Edge, Deno Deploy |
| Middleware | `@tollgate/express`, `@tollgate/hono`, `@tollgate/cloudflare-worker` | Fastify, Koa |
| Agent libs | `@tollgate/agent` (Node) | |
| Chain | Arc L1 testnet + mainnet | Base, Ethereum, Solana (except as documented alternatives) |
| Payment | USDC via Circle Nanopayments + x402 | native ETH, SOL |
| Custody | Circle Wallets (publisher), self-custody agents | MetaMask only, Coinbase Wallet only |
| Bridging | Circle Gateway + Bridge Kit (CCTP) | LayerZero, Wormhole |
| Smart contracts | ERC-8004-vyper via titanoboa | Solidity, custom ABI |
| Observability | Sentry + Axiom + PostHog + Convex dashboard | Datadog (cost), New Relic |
| CI/CD | GitHub Actions → Vercel preview / Convex on main | CircleCI, Jenkins |

## Process

1. Scan `package.json` at root and each workspace (`apps/*`, `packages/*`).
2. Scan `convex/` for Convex version, schema, indexes.
3. Scan `.github/workflows/` for CI/CD drift.
4. Scan contracts/ (if present) for Vyper + titanoboa.
5. Scan `.env.example` for required env vars coverage.
6. Compare against the expected stack table above.
7. Emit `REPORT-TEMPLATE.md`-style report: FOUND vs EXPECTED vs DRIFT.

## Exit criteria

- All expected stack items found.
- No unexpected tech added without a listed justification.
- No duplicated stack (e.g., both Clerk and NextAuth).
