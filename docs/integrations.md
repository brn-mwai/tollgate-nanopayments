# Integrations

Every external service, SDK, and key that Tollgate depends on. Organised by layer, with account-provisioning notes and the minimum set required to boot.

Last updated: 2026-04-20.

## Layer 1 — Auth

| Service | Package | Purpose | Needs account |
|---|---|---|---|
| Clerk | `@clerk/nextjs`, `@clerk/backend` | Publisher login, org mgmt | Yes — dashboard.clerk.com |
| JWT template `convex` | (Clerk config) | Bridges Clerk identity into Convex | Yes — set up in Clerk app |
| Clerk webhooks | (httpAction in Convex) | `user.created` / `user.updated` / `user.deleted` lifecycle | Yes — webhook URL + signing secret |

## Layer 2 — Backend + Data + Realtime

| Service | Package | Purpose | Needs account |
|---|---|---|---|
| Convex | `convex` | Queries / mutations / actions / cron / httpActions / search / vector / R2 bridge | Yes — dashboard.convex.dev |
| ConvexProviderWithClerk | `convex/react-clerk` | Wires Clerk JWT to Convex client | Uses Clerk + Convex accounts |

## Layer 3 — Frontend

- Next.js 16 (App Router, React 19)
- Tailwind 4 + PostCSS
- Shadcn/ui (copy-paste components, not a dep)
- Phosphor Icons `@phosphor-icons/web`
- Google Fonts: DM Sans, Instrument Serif, JetBrains Mono, Instrument Sans

## Layer 4 — Chain + Onchain

| Service | Package | Purpose | Needs account |
|---|---|---|---|
| Arc L1 (testnet + mainnet) | `viem` | EVM client for Arc | No account, just RPC URL |
| USDC on Arc | (native gas) | Payment + fee token | No |
| ERC-8004-vyper | `titanoboa` (Python) | Agent reputation contract — we deploy | No |
| Circle-titanoboa SDK | `pip install titanoboa` | Local Vyper simulation | No |

## Layer 5 — Payments (Circle)

| Service | Package | Purpose | Needs account |
|---|---|---|---|
| Circle Wallets API | `@circle-fin/developer-controlled-wallets` | Publisher custody, zero-key onboarding | Yes — developers.circle.com |
| Circle Nanopayments | (via x402 + Circle Wallets) | Billing primitive | Uses Circle account |
| Circle Gateway | `@circle-fin/gateway-sdk` | Agent-side unified USDC across chains | Uses Circle account |
| Circle CCTP / Bridge Kit | `@circle-fin/cctp-sdk` | Off-ramp Arc → Base / ETH / Solana | Uses Circle account |
| Circle webhooks | (httpAction in Convex, HMAC verify) | Asynchronous TX confirmations | Set up webhook URL in Circle |
| Circle Developer Console | (web UI) | Judge-visible demo artifact | Uses Circle account |

## Layer 6 — x402 Protocol

| Service | Package | Purpose | Needs account |
|---|---|---|---|
| x402 Facilitator | (Coinbase-hosted) | Verify onchain payment proofs | No (URL only: `facilitator.x402.org`) |
| @x402/core | `@x402/core` | 402 response builder | npm only |
| @x402/facilitator-client | `@x402/facilitator-client` | Client to call the facilitator | npm only |
| Tollgate HMAC receipts | `packages/shared/x402/` | Custom, in-repo | Ours |
| Tollgate nonce dedup | `nonceLog` table + edge KV | Custom, in-repo | Ours |

## Layer 7 — Edge + CDN

| Service | Package | Purpose | Needs account |
|---|---|---|---|
| Cloudflare Workers | `wrangler` | Hosted gateway for non-technical publishers | Yes — cloudflare.com |
| Cloudflare Workers KV | (binding) | Nonce dedup + pricing cache at the edge | Uses CF account |
| Cloudflare R2 | (binding) | Cold event archive (> 7 days) | Uses CF account |

## Layer 8 — Upstream data (dogfood)

| Service | Purpose | Needs account |
|---|---|---|
| AIsa Nanopayment APIs | Demo agents consume AIsa through the same 402 flow (proves both sides of the market) | Yes — github.com/aisa-xyz |

## Layer 9 — Observability

| Service | Package | Purpose | Hackathon? |
|---|---|---|---|
| Sentry | `@sentry/nextjs` | Error tracking | Stub MVP, wire post-submission |
| Axiom | `axiom-node` | Log aggregation | Stub MVP |
| PostHog | `posthog-node` | Product analytics | Stub MVP |
| Convex dashboard | (built-in) | Function metrics | MVP (free) |

## Layer 10 — Hosting + CI/CD

| Service | Purpose | Needs account |
|---|---|---|
| Vercel | Next.js hosting, PR previews | Yes — vercel.com |
| Convex Cloud | Backend deploys (`npx convex deploy`) | Uses Convex account |
| GitHub Actions | CI: lint, typecheck, test | Free (public repo) |

## Layer 11 — Domains + DNS

- `tollgate.brianmwai.com` — dashboard (Vercel)
- `demo-news.brianmwai.com` — paid demo publisher (Vercel)
- `api.tollgate.brianmwai.com` — hosted gateway (Cloudflare Worker)
- `/.well-known/tollgate-verify.txt` — site ownership verification

## Layer 12 — SDK packages we publish

- `@tollgate/express`
- `@tollgate/hono`
- `@tollgate/cloudflare-worker`
- `@tollgate/next`
- `@tollgate/agent` (Node bot SDK)
- `@tollgate/shared` (internal)

## Layer 13 — Dev tooling

- pnpm (workspace manager)
- TypeScript 5.6+
- ESLint + Prettier
- Zod (runtime validation at HTTP / webhook boundaries)
- Vitest (unit tests)

## Minimum keys to boot Day 1

| # | Name | Where | Blocks what |
|---|---|---|---|
| 1 | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk app settings | Login |
| 2 | `CLERK_SECRET_KEY` | Clerk app settings | Server-side verify |
| 3 | `CLERK_WEBHOOK_SECRET` | Clerk webhooks UI | User lifecycle into Convex |
| 4 | `NEXT_PUBLIC_CONVEX_URL` | `npx convex dev` output | Frontend → Convex |
| 5 | `CONVEX_DEPLOY_KEY` | Convex dashboard | CI/CD deploy |

Day 2+ additions:

| # | Name | Where | Blocks what |
|---|---|---|---|
| 6 | `CIRCLE_API_KEY` | developers.circle.com | Wallet provisioning |
| 7 | `CIRCLE_ENTITY_SECRET` | developers.circle.com | Wallet signing |
| 8 | `CIRCLE_WALLET_SET_ID` | created via Circle API | Publisher wallet grouping |
| 9 | `ARC_RPC_URL` | arc.network/docs | Every onchain call |
| 10 | `ARC_CHAIN_ID` | arc.network/docs | viem chain config |
| 11 | `ARC_USDC_CONTRACT` | arc.network/docs or Explorer | Transfer verify |
| 12 | `X402_FACILITATOR_URL` | `facilitator.x402.org` | 402 verify |
| 13 | `TOLLGATE_HMAC_SECRET` | generated locally (32 bytes) | Receipt signing |

Day 3+ additions:

| # | Name | Where | Blocks what |
|---|---|---|---|
| 14 | Cloudflare account + `wrangler login` | cloudflare.com | Hosted gateway |
| 15 | Cloudflare Workers KV namespace | wrangler create | Nonce cache |
| 16 | `AISA_API_KEY` | aisa-xyz | Dogfood upstream demo |

Day 5 additions:

| # | Name | Where | Blocks what |
|---|---|---|---|
| 17 | Vercel project link | vercel.com | Production deploy |
| 18 | DNS records for three subdomains | domain registrar | Public URLs |

## Ordering

- Day 1: Layers 1 + 2 + 3 (auth + backend + frontend scaffold)
- Day 2: Layer 4 + 5 (Arc + Circle Wallets)
- Day 3: Layer 6 + 7 (x402 + Cloudflare)
- Day 4: Layer 8 + full 5 (AIsa + Gateway + CCTP + ERC-8004)
- Day 5: Layer 10 + 11 (deploy + DNS) + record demo

## Post-hackathon (documented, not built)

- Self-hosted x402 facilitator (Stage 2)
- Cloudflare Durable Objects for nonce dedup at scale (Stage 3)
- ClickHouse warehouse for cold analytics (Stage 4)
- Self-hosted Arc validator (Stage 4)
- SOC 2 Type II compliance (Y1)
- Vanta or Drata for evidence collection (Y1)
