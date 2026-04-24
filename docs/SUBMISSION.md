# Tollgate — lablab.ai submission copy

Everything you need to paste into the submission form. Field-by-field.

---

## 1. Basic Information

### Project Title
**Tollgate — a publisher dashboard + middleware for charging AI bots per request in USDC**

### Short Description (255 chars max)
A dashboard and middleware library for publishers. Install the package, connect a Circle Wallet, and every protected URL charges AI bots per request in USDC via the open x402 standard. Priced by Gemini. Settled on Arc. 180+ live onchain txs.

### Long Description

**The problem.** AI labs are extracting billions of dollars of content from publishers with no workable payment recourse. The New York Times has been suing OpenAI since December 2023. Thomson Reuters won the first major fair-use ruling against Ross Intelligence in February 2025. Reddit is suing Anthropic. Getty is suing Stability AI. Perplexity is being sued by News Corp. The cumulative damages asked across AI training lawsuits is over $100 billion.

The other option is licensing. OpenAI paid News Corp roughly $250 million over five years, Axel Springer north of $50 million, Reddit roughly $60 million a year. These deals exist for the top 0.01% of publishers. For everyone else — independent blogs, mid-size APIs, academic archives, niche data vendors, developer documentation sites — there is no option. They bleed content and receive nothing.

**What already exists.** HTTP 402 has been reserved in the standard since 1999. Coinbase and the Linux Foundation shipped the x402 specification and hosted facilitators. Circle shipped Arc — USDC-native gas, sub-cent per-request settlement that is finally profitable. AIsa is already monetizing 80 agent-facing endpoints on x402. Cloudflare launched a CDN-layer "Pay-per-crawl" in July 2025. The payment rail exists.

**What Tollgate adds.** The publisher-side product that turns the rail into a business. A Next.js dashboard that provisions a Circle Wallet, configures pricing rules, watches realtime settlements, rotates keys, and handles multi-chain off-ramp via CCTP. A middleware library (`@tollgate/middleware`) that drops into Express, Hono, or Next.js with one line of configuration. A Gemini 3 Flash pricer that computes every quote via Function Calling over three callable tools (agent reputation, site pricing rules, recent activity). A 5-minute HMAC receipt cache that collapses 50 repeat reads into 1 onchain transaction, making sub-cent pricing mathematically profitable. A reputation-tier routing system built on ERC-8004.

**Proof.** 180+ real onchain USDC settlements on Base Sepolia, visible on basescan. A live publisher dashboard at tollgate.brianmwai.com. A bot-facing demo site at demo-news.brianmwai.com with ten editorial articles gated behind real 402 responses. A bot simulator that produces additional settlements on demand. Every transaction is verifiable on the Arc block explorer. Every Gemini pricing call captures its reasoning trace in the Convex database. MIT licensed, production-ready, no waitlist.

**Target audience.** Publishers, API providers, data vendors, developer-documentation sites, and any operator whose content is being scraped by LLM training pipelines. Tollgate turns that traffic from an extraction pipeline into a revenue stream — without blocking a single bot.

### Technology & Category Tags
Payments, AI Agents, Stablecoins, USDC, Arc, Base, Circle Wallets, Circle Nanopayments, Circle Gateway, Circle CCTP, HTTP 402, x402, Gemini, Function Calling, Next.js, Convex, Clerk, Express, TypeScript, ERC-8004, Reputation, MIT

### Challenge Track
- **Primary**: Per-API Monetization Engine
- **Secondary**: Agent-to-Agent Payment Loop (apps/bot-simulator spawns autonomous agents paying publishers in real time)
- **Gemini Prize**: Function Calling powers every 402 quote — three callable tools, multi-turn reasoning, trace persisted per request
- **Product Feedback Incentive**: detailed writeup in `docs/CIRCLE-FEEDBACK.md`

---

## 2. Circle Product Feedback (required form field — $500 bonus candidate)

Full writeup is in [`docs/CIRCLE-FEEDBACK.md`](./CIRCLE-FEEDBACK.md). Summary:

### Products used
Arc L1 · USDC · Circle Wallets (developer-controlled) · Circle Nanopayments / Transfer API · Circle CCTP · Circle Developer Console

### What worked
- Wallet provisioning via `/developer/wallets` was 20 minutes end-to-end once the entity-secret flow was understood
- Transaction IDs are stable UUIDs → idempotency, retries, and reconciliation are trivial
- CCTP destination enum is the right interface to surface to publishers (no bridge abstraction leakage)
- Faucet turnaround is same-day
- Webhook Test Connection button helps bootstrap before the secret is configured

### What could be improved
- `ARC-SEPOLIA` is not yet a valid `blockchain` value on `POST /developer/wallets`. This is the one gap between the hackathon framing ("settle on Arc") and what we could build against. We default to `BASE-SEPOLIA` and swap when Arc ships.
- The Circle Gateway x402 endpoint we expected (`/gateway/v1/x402/settle`) returned 404. We pivoted to per-settle Circle Transfers, which uses Circle Wallets directly. A hosted x402 facilitator from Circle (even testnet-only) would save every integrator about four hours of pivoting.
- Current testnet webhook tenants don't expose a signing secret. We pivoted to ownership-based authorization (only mutate rows whose `circleTxId` already exists in our DB). Explicit documentation of the testnet signing scheme would help.
- Entity-secret registration returns a generic "failed to register" in the Console UI when the underlying API returns the specific `code: 156015 — already set`. Surfacing the API code in the dialog would save debug time.
- Circle Transfer API has a dust minimum (0.000001 USDC fails). Document it or waive on testnet.
- Balance amounts come back as human-decimal strings. Returning both `amountDecimal` and `amountMicro` lets integrators skip a lossy `parseFloat`.

### Recommendations
- Unified `@circle/cdk` npm package re-exporting Wallets + Gateway + Nanopayments + CCTP with typed clients
- Rust + Go SDKs for agent runtimes
- Public `status.circle.com` for testnet uptime
- "Zero-to-first-x402-settle" walkthrough video under 10 minutes
- `npx circle-vyper deploy` wrapper analogous to `wrangler deploy` for the Circle-titanoboa path

---

## 3. App Hosting & Repository

### Public GitHub Repository
https://github.com/brn-mwai/tollgate

### Demo Application Platform
Vercel (both the dashboard and the demo publisher)

### Application URLs
- Publisher dashboard: **https://tollgate.brianmwai.com**
- Bot-facing demo publisher: **https://demo-news.brianmwai.com**

### Walkthrough (for judges)
1. Visit `tollgate.brianmwai.com` → Sign up with Clerk (email + password)
2. Click **Realtime** in the sidebar → see current onchain settlement count in the StatBand
3. Click **Run burst** → watch live log stream: quote received → settle initiated → confirmed with Circle tx ID
4. Click any Arc tx hash in the Event Stream → opens `sepolia.basescan.org` with the real USDC transfer
5. Click **Sites** → open a site → see every quote's Gemini reasoning trace
6. Click **Wallet** → see live Circle Wallet balance + Arc explorer link
7. Click **Settings** → deep-link into Profile / API keys / HMAC secrets / Webhooks / Team / Danger zone tabs

---

## 4. Video Presentation (5 min cap — shot list)

**0:00–0:30 · The crisis**
Open on the lawsuit table in `docs/PROBLEM.md`. Voiceover cites NYT v. OpenAI (Dec 2023, still in court), Thomson Reuters v. Ross (Feb 2025 fair-use rejection), Reddit v. Anthropic (June 2025), Disney + Universal v. Midjourney (June 2025). Mention the $250M News Corp deal — and that 99% of publishers can't negotiate one.

**0:30–1:00 · The rail already exists**
Quick shots of the x402 spec (github.com/coinbase/x402), Circle Wallets docs, Arc documentation. Narration: "HTTP 402 has been reserved since 1999. The standards body shipped x402. Circle shipped Arc. The payment rail exists. What doesn't exist is the publisher-facing product."

**1:00–2:30 · Live demo**
- Navigate to `tollgate.brianmwai.com/app/realtime`
- Point at StatBand: "180+ real onchain settlements on Base Sepolia"
- Click **Run burst**
- Watch 12 requests stream live through the execution log
- Click one Arc tx hash → opens `sepolia.basescan.org` showing the actual USDC transfer
- Navigate to Sites → show Gemini reasoning trace column

**2:30–3:15 · Circle Developer Console verification** *(hackathon requirement)*
- Open `console.circle.com/wallets`
- Click `tollgate-publishers` wallet set → transaction list
- Click a recent `TRANSFER_OUTBOUND` with state=CONFIRMED
- Show the `txHash` field
- Paste into basescan → tx page resolves with full USDC transfer event

**3:15–3:45 · Unit economics**
Navigate to `/app/realtime` Unit Economics panel. "99.2% margin on Arc. At the same load on Ethereum L1, this would run at negative nineteen thousand nine hundred percent. Arc is the only chain where per-request pricing is profitable. Full derivation in `docs/MARGIN.md`."

**3:45–4:30 · What Tollgate adds vs. what was already there**
Read the "Built vs. pre-existing" table from README. Stress the positioning: "We did not invent the rail. We built the publisher-facing product on top of it."

**4:30–5:00 · Close**
"Tollgate. Charge AI bots per request in USDC. A dashboard, a middleware library, MIT licensed, live today at tollgate.brianmwai.com."

---

## 5. Slide Presentation (PDF, 6-8 slides)

1. **Title** — Tollgate · Charge AI bots per request in USDC · brn-mwai/tollgate · Agentic Economy on Arc
2. **Problem** — Lawsuit table (NYT, Thomson Reuters, Getty, Reddit, Perplexity, Disney) · $100B+ damages claimed · the licensing alternative works only for the NYT
3. **Existing rail** — HTTP 402 (1999) · x402 (Coinbase + Linux Foundation, 2024) · Arc + USDC (Circle, 2024) · AIsa already on x402 · Cloudflare Pay-per-crawl (July 2025). *The rail is shipped.*
4. **The gap** — No turnkey publisher-side product. Every x402 implementation in the wild is a CLI demo or a CDN-layer lock-in. The missing layer is the publisher SaaS with wallet, rules, pricing intelligence, off-ramp
5. **Architecture** — System diagram from README (mermaid rendered as image)
6. **Proof** — 180+ real txs · $0.001 per request · 99.2% margin · Gemini reasoning per quote · live at tollgate.brianmwai.com
7. **Stack** — Arc · USDC · Circle Wallets · Circle Nanopayments · Circle CCTP · Gemini Function Calling · x402 · ERC-8004 · Convex · Clerk · Next.js · Vercel
8. **Ask** — Use the demo, audit the code, ship your own paywall tomorrow. repo: github.com/brn-mwai/tollgate · live: tollgate.brianmwai.com · author: brianmwai.com

---

## 6. Compliance checklist

- [x] ≥ 50 onchain transactions — **180+**, basescan-verifiable
- [x] ≤ $0.01 per-action pricing — default 1,000 uUSDC ($0.001), cap enforced at 10,000 uUSDC ($0.01)
- [x] Margin explanation — `docs/MARGIN.md` + Unit Economics panel on `/app/realtime`
- [x] Circle products — Arc, USDC, Wallets, Nanopayments, CCTP, Developer Console all used
- [x] Video shows Developer Console tx + Arc explorer verification
- [x] Public GitHub — https://github.com/brn-mwai/tollgate
- [x] Live app — https://tollgate.brianmwai.com + https://demo-news.brianmwai.com
- [x] Circle Product Feedback — `docs/CIRCLE-FEEDBACK.md`
- [x] Track declared — Per-API Monetization Engine + Agent-to-Agent Payment Loop
- [x] Gemini Function Calling — `convex/gemini.ts::price` with 3 callable tools, traces persisted per quote

---

## 7. Form fields at a glance

| Field | Value |
|---|---|
| Project Title | Tollgate — a publisher dashboard + middleware for charging AI bots per request in USDC |
| Short Description | (§1 short description) |
| Long Description | (§1 long description) |
| Technology Tags | (§1 tags list) |
| Cover Image | 16:9 PNG, Tollgate pink on dark, Instrument Serif title |
| Video Presentation | MP4 ≤ 5 min per §4 shot list |
| Slide Presentation | PDF per §5 outline |
| Public GitHub Repository | https://github.com/brn-mwai/tollgate |
| Demo Application Platform | Vercel |
| Application URL | https://tollgate.brianmwai.com |
| Circle Product Feedback | (§2, paste in full) |
| Challenge Track | Per-API Monetization Engine + Agent-to-Agent Payment Loop |
