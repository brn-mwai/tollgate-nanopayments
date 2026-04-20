# Research Topics for Coding Tollgate

Search queries to pull transcripts from YouTube, podcasts, and conference talks so every layer of the system design is grounded in first-party primary sources. Copy any query into YouTube, Spotify, X (Twitter) search, or Google. Paste the resulting transcript into a coding session before starting the matching module.

One section per stack concern. Use the table to map research to the file(s) and agent that will consume it.

Last updated: 2026-04-20.

---

## 1. Agentic Economy Framing (pitch and thesis grounding)

**Why:** to open the README, pitch deck, and Product Feedback essay with crisp problem framing instead of generic copy.

**Who uses this:** `documentation-generator`, pitch and demo script.

### Queries

- `Marc Andreessen Latent Space podcast AI crypto grand unification`
- `Marc Andreessen a16z AI agents payment infrastructure`
- `Marc Andreessen HTTP 402 Payment Required`
- `Chris Dixon a16z agentic economy stablecoins`
- `Coinbase Brian Armstrong x402 agentic commerce`
- `Cloudflare Matthew Prince AI crawlers pay-per-crawl`
- `Balaji Srinivasan micropayments agent internet`
- `AEI HTTP 402 Payment Required 30 years`

### Must-watch minimums

- One Andreessen long-form interview (a16z podcast, Latent Space, Lex Fridman) where he says "grand unification".
- One Cloudflare talk on pay-per-crawl and HTTP 402.
- One Coinbase x402 launch talk or walkthrough.

---

## 2. x402 Protocol (core rail we sit on)

**Why:** Tollgate's middleware and agent SDK must conform to x402 semantics exactly. Wrong bytes in the `X-Payment` header = rejected by facilitator.

**Who uses this:** `x402-protocol-agent` (primary), middleware packages, agent SDK.

### Queries

- `x402 protocol explained Coinbase developers`
- `x402 specification HTTP 402 Payment Required`
- `x402 facilitator verify endpoint integration`
- `x402 SDK Node TypeScript tutorial`
- `x402 Cloudflare Workers integration`
- `x402 Linux Foundation governance announcement`
- `x402 Foundation Cloudflare Coinbase launch`
- `x402 Google Agentic Payments Protocol integration`
- `x402 Stellar Solana Base multi-chain`
- `x402 v2 December 2025 changes`
- `Stripe MPP micropayments protocol 2026`

### Must-read docs

- https://docs.cdp.coinbase.com/x402/welcome
- https://x402.org
- https://blog.cloudflare.com/x402/
- https://github.com/coinbase/x402 (repo)

---

## 3. Arc L1 (settlement chain)

**Why:** Arc is new. RPC URLs, chain ID, gas semantics, USDC-as-native-gas all need first-party confirmation before wiring `viem`.

**Who uses this:** `arc-chain-agent`, `packages/shared/chain/`.

### Queries

- `Arc network Circle L1 blockchain announcement`
- `Arc testnet RPC endpoint faucet`
- `Arc chain ID USDC native gas`
- `Arc explorer block finality`
- `Arc vs Base Ethereum gas comparison stablecoin`
- `Circle Arc mainnet launch date`
- `Arc EVM compatibility viem ethers`
- `ETHGlobal HackMoney 2026 Arc track winners`
- `Arc network agentic commerce architecture`

### Must-read docs

- https://arc.network/docs
- https://community.arc.network/
- Latest Arc-track hackathon winner repos for reference implementations

---

## 4. Circle Wallets (publisher custody)

**Why:** Zero-key onboarding is the publisher conversion trick. Must use Circle Developer-controlled wallets correctly, including idempotency and webhook flows.

**Who uses this:** `circle-integration-agent`, `packages/shared/circle/`.

### Queries

- `Circle Wallets API developer-controlled provisioning tutorial`
- `Circle Wallets entity secret authentication Node`
- `Circle Wallets webhook HMAC verification`
- `Circle Wallets idempotency key best practice`
- `Circle Wallets vs MetaMask custody comparison`
- `Circle programmable wallets SDK TypeScript`
- `Circle Wallets Arc chain integration`

### Must-read docs

- https://developers.circle.com/w3s/programmable-wallets
- https://developers.circle.com/w3s/reference
- https://github.com/circlefin

---

## 5. Circle Gateway and CCTP (cross-chain)

**Why:** Gateway = agent-side unified USDC. CCTP = publisher off-ramp to Base or Ethereum. Both are optional on Day 4 but T2 must-win material.

**Who uses this:** `circle-integration-agent`, Publisher withdraw flow, Agent SDK multi-chain balance.

### Queries

- `Circle Gateway unified USDC balance agents`
- `Circle CCTP cross-chain transfer protocol tutorial`
- `Circle Bridge Kit integration guide`
- `CCTP attestation flow burn mint`
- `Circle Gateway SDK TypeScript example`
- `CCTP v2 release changes`

### Must-read docs

- https://developers.circle.com/stablecoins/cctp-getting-started
- https://developers.circle.com/w3s/gateway

---

## 6. Circle Nanopayments (core billing primitive)

**Why:** Submission gate requires "Circle Nanopayments used". Every 402 resolves to a Nanopayment.

**Who uses this:** `circle-integration-agent`, `x402-protocol-agent`, margin table, Product Feedback essay.

### Queries

- `Circle Nanopayments launch announcement 2025`
- `Circle Nanopayments API reference`
- `Nanopayments vs traditional stablecoin transfer fees`
- `Circle Nanopayments x402 integration`
- `Nanopayments use cases AI agents`

### Must-read docs

- https://developers.circle.com/nanopayments

---

## 7. ERC-8004 (agent reputation)

**Why:** Differentiator. Most teams skip this. Tollgate ships it = judge signal.

**Who uses this:** `arc-chain-agent` (deploy + call), `x402-protocol-agent` (tiered pricing).

### Queries

- `ERC-8004 agent reputation standard EIP`
- `ERC-8004 Vyper implementation`
- `ERC-8004 vs ENS agent identity`
- `onchain reputation agents x402 integration`

### Must-read docs

- https://eips.ethereum.org/EIPS/eip-8004
- https://github.com/circlefin (search for erc-8004-vyper)

---

## 8. Vyper and Circle-titanoboa

**Why:** Circle wants Vyper alignment. titanoboa lets us simulate locally before deploying to testnet.

**Who uses this:** `arc-chain-agent` (deploy pipeline), contract tests.

### Queries

- `Vyper language introduction Python smart contracts`
- `titanoboa Vyper simulation tutorial`
- `Vyper vs Solidity gas security`
- `Circle titanoboa SDK release`
- `Vyper ERC-8004 deployment`

### Must-read docs

- https://docs.vyperlang.org
- https://github.com/vyperlang/titanoboa

---

## 9. Convex Patterns (backend)

**Why:** Convex is the entire service layer. Right patterns = reactive dashboard for free + cron + vector + search + R2 in one platform.

**Who uses this:** every Convex file, `architecture-mapper`, `code-auditor`, `performance-profiler`.

### Queries

- `Convex tutorial schema mutations queries actions`
- `Convex reactive subscriptions React Next.js`
- `Convex internalMutation vs mutation trust boundary`
- `Convex pagination opts indexed query`
- `Convex scheduler runAfter cron`
- `Convex httpAction webhook HMAC`
- `Convex search index label search`
- `Convex vector index embeddings cluster`
- `Convex R2 bridge storage archive`
- `Convex components multi-tenant sharding`
- `Convex ConvexProviderWithClerk Next.js 16`

### Must-read docs

- https://docs.convex.dev
- https://docs.convex.dev/auth/clerk
- Convex stack blog posts on pagination and indexing

---

## 10. Next.js 16 + React 19 + App Router

**Why:** Dashboard runs on the latest. Clerk middleware replaced by "proxy" convention. SSG breaks Clerk components unless `force-dynamic`.

**Who uses this:** `apps/dashboard`.

### Queries

- `Next.js 16 App Router release changes`
- `Next.js 16 proxy convention middleware deprecated`
- `Next.js 16 React 19 server components`
- `Next.js force-dynamic Clerk SSR`
- `Next.js 16 Vercel deployment ConvexProviderWithClerk`
- `Tailwind 4 Next.js 16 setup postcss`
- `Shadcn ui Next.js 16 App Router`

### Must-read docs

- https://nextjs.org/docs
- https://ui.shadcn.com

---

## 11. Clerk Authentication (+ Convex)

**Why:** Publisher auth. JWT template `convex` is the one wiring detail every new Clerk+Convex project gets wrong.

**Who uses this:** `apps/dashboard`, `convex/users.ts`, `convex/http.ts` (Clerk webhook).

### Queries

- `Clerk Convex integration JWT template tutorial`
- `Clerk Next.js App Router protecting routes`
- `Clerk webhook signing verification Node`
- `Clerk organizations multi-tenant publishers`
- `Clerk users.upsertFromClerk pattern Convex`

### Must-read docs

- https://clerk.com/docs/integrations/databases/convex
- https://clerk.com/docs/references/nextjs/overview

---

## 12. Cloudflare Workers + KV + Durable Objects

**Why:** Hosted gateway, edge KV for nonce dedup, Durable Objects when we scale to S3.

**Who uses this:** `packages/middleware-cfw`, hosted gateway Worker.

### Queries

- `Cloudflare Workers KV best practices low latency`
- `Cloudflare Workers request response body pattern`
- `Cloudflare Durable Objects nonce deduplication`
- `Cloudflare pay-per-crawl x402 integration`
- `Cloudflare Workers x402 Foundation announcement`
- `wrangler deployment pipeline secrets`

### Must-read docs

- https://developers.cloudflare.com/workers/
- https://developers.cloudflare.com/kv/
- https://blog.cloudflare.com/x402/

---

## 13. HMAC, Nonce, Replay, Payment Security

**Why:** Receipts and nonces are the whole reason the product has 96% margin. Get these wrong and the margin collapses or the system gets exploited.

**Who uses this:** `x402-protocol-agent`, `security-scanner`, middleware runtimes.

### Queries

- `HMAC-SHA256 receipt token design`
- `timingSafeEqual constant-time compare Node`
- `nonce replay attack prevention LRU TTL`
- `Stripe idempotency key pattern`
- `payment webhook HMAC verify pattern`
- `API key hashing storage SHA-256 bcrypt`
- `JWT vs HMAC receipt tradeoffs short lived`

### Must-read references

- OWASP payment security cheat sheet
- Stripe blog on idempotency

---

## 14. Agent SDK Design (Node + Python patterns)

**Why:** Publisher + agent SDK ergonomics determine adoption. Same `tollgate(config)` signature across all runtimes.

**Who uses this:** `packages/agent-sdk-node`, `packages/middleware-*`.

### Queries

- `Stripe Node SDK design internals`
- `OpenAI Node SDK retry middleware`
- `fetch interceptor pattern auto-retry`
- `SDK design idempotent request sign-retry`
- `x402 Node client example`

---

## 15. AIsa API (upstream dogfood)

**Why:** Consumer-side Nanopayment demo. Our demo agents call AIsa through the same 402 flow to show both sides of the market.

**Who uses this:** Agent SDK demo script, `demo-orchestrator-agent`.

### Queries

- `AIsa Nanopayment API tutorial`
- `AIsa xyz agent data endpoint`
- `AIsa Karen Sheng CPO interview`

### Must-read docs

- https://github.com/aisa-xyz

---

## 16. Demo Production and Recording

**Why:** Hackathon submission = a video. Bad recording = bad score regardless of product quality.

**Who uses this:** `demo-orchestrator-agent`, Day 5 recording.

### Queries

- `OBS Studio hackathon demo recording scenes`
- `hackathon 90 second demo script pacing`
- `how to record terminal and browser side by side macOS`
- `Vercel Preview deployment for demo day`
- `Loom vs OBS hackathon demo upload`

---

## 17. Reference Implementations to Study

Pull latest code from these repos and read their middleware, 402 response shape, and facilitator integration before writing our own:

- `https://github.com/coinbase/x402` — canonical spec implementation
- `https://github.com/circlefin` — Circle's official SDKs
- `https://github.com/cloudflare/workers-sdk` — x402-integrated Worker samples
- `https://github.com/aisa-xyz` — AIsa API clients
- ETHGlobal HackMoney 2026 Arc track winner repos (see `arc.network/blog`) — prior art from this exact ecosystem

---

## Research intake protocol

1. Pick a section that matches the next task you are starting.
2. Run 3-5 queries into YouTube or Google and capture the best transcript into a scratch file.
3. Summarise the transcript into `docs/notes/<topic>.md` before writing any code for that module.
4. Cite back to the source URL in the code comment that establishes the invariant the source taught you.

Rule: no new module code without at least one primary-source reference file in `docs/notes/`.
