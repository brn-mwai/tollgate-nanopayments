---
title: Dependency Auditor (Tollgate)
type: agent
domain: meta
created: 2026-04-20
tags: [agent, dependencies, supply-chain, tollgate]
source: C:\Users\Windows\Claude_brain\agents\dependency-auditor\AGENT.md
---

# Dependency Auditor Agent — Tollgate

Audit every npm, Python, and onchain dependency. Block merges that introduce supply-chain risk.

## Activation

User says: "audit deps", "check dependencies", "are these packages safe".

## Tollgate-specific dependencies (approved list)

| Package | Justification |
|---|---|
| `convex` | Backend platform |
| `@clerk/nextjs`, `@clerk/backend` | Auth |
| `next`, `react`, `react-dom` | Dashboard |
| `tailwindcss`, `@tailwindcss/postcss` | Styling |
| `hono`, `express` | Middleware runtimes |
| `@cloudflare/workers-types` | Worker typing |
| `viem`, `ethers` | EVM client for Arc |
| `@x402/core`, `@x402/facilitator-client` | 402 protocol |
| `@circle/wallets-sdk`, `@circle/cctp-sdk` | Circle |
| `titanoboa` (Python) | Vyper simulation |
| `zod` or `valibot` | Input validation at HTTP boundary |
| `@sentry/nextjs`, `axiom`, `posthog-node` | Observability |

## Rejected / flagged

| Package | Reason |
|---|---|
| `lodash` | use native ES2022+ or small per-function imports |
| `moment` | use `date-fns` or native `Intl` |
| any `*-mock-*` for production | mock-only libs do not ship in prod deps |
| abandoned packages (>2 years no release) | supply-chain risk |
| packages with <10 weekly downloads introduced to prod code | supply-chain risk |

## Process

1. `pnpm audit` — no high/critical left unpatched.
2. Check every `dependencies` entry against the approved/rejected list.
3. For each new dep not in the list, require a justification comment in the PR.
4. Check `pnpm why <package>` for unused transitive bloat.
5. Compare `package.json` versions against `pnpm outdated` — call out majors behind.
6. Output structured report: approved / flagged / rejected.
