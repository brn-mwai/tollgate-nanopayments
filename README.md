<p align="center">
  <img src="docs/images/banner.png" alt="Tollgate — Charge AI bots per request in USDC" />
</p>

<p align="center">
  <strong>A dashboard and middleware library that lets any website charge AI bots per request in USDC.</strong>
</p>

<p align="center">
  <a href="https://tollgate.brianmwai.com">
    <img alt="Live dashboard" src="https://img.shields.io/badge/dashboard-tollgate.brianmwai.com-FF00AA?style=for-the-badge&labelColor=0A0B10" />
  </a>
  <a href="https://demo-news.brianmwai.com">
    <img alt="Demo publisher" src="https://img.shields.io/badge/demo-demo--news.brianmwai.com-FF00AA?style=for-the-badge&labelColor=0A0B10" />
  </a>
  <a href="https://github.com/brn-mwai/tollgate">
    <img alt="Source" src="https://img.shields.io/badge/source-MIT-06A77D?style=for-the-badge&labelColor=0A0B10" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/coinbase/x402"><img alt="x402" src="https://img.shields.io/badge/standard-x402-2775CA?style=flat-square&labelColor=1F2937" /></a>
  <a href="https://docs.arc.network"><img alt="Arc" src="https://img.shields.io/badge/chain-Arc%20%2F%20Base%20Sepolia-2775CA?style=flat-square&labelColor=1F2937" /></a>
  <a href="https://developers.circle.com/w3s"><img alt="Circle Wallets" src="https://img.shields.io/badge/wallets-Circle-06A77D?style=flat-square&labelColor=1F2937" /></a>
  <a href="https://ai.google.dev/gemini-api/docs/function-calling"><img alt="Gemini" src="https://img.shields.io/badge/pricing-Gemini%203%20Flash-FF3CC0?style=flat-square&labelColor=1F2937" /></a>
  <a href="https://convex.dev"><img alt="Convex" src="https://img.shields.io/badge/backend-Convex-EE342F?style=flat-square&labelColor=1F2937" /></a>
  <a href="https://nextjs.org"><img alt="Next.js" src="https://img.shields.io/badge/web-Next.js%2016-000?style=flat-square&labelColor=1F2937" /></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/lang-TypeScript-3178C6?style=flat-square&labelColor=1F2937" /></a>
</p>

<p align="center">
  <img alt="Onchain settlements" src="https://img.shields.io/badge/onchain%20settlements-66%2B-06A77D?style=flat-square&labelColor=1F2937" />
  <img alt="Per-request" src="https://img.shields.io/badge/per--request-%240.001-FF3CC0?style=flat-square&labelColor=1F2937" />
  <img alt="Margin" src="https://img.shields.io/badge/margin%20on%20Arc-99.2%25-06A77D?style=flat-square&labelColor=1F2937" />
  <img alt="Compression" src="https://img.shields.io/badge/receipt%20compression-50%3A1-2775CA?style=flat-square&labelColor=1F2937" />
  <img alt="Hackathon" src="https://img.shields.io/badge/built%20for-Agentic%20Economy%20on%20Arc-FF00AA?style=flat-square&labelColor=1F2937" />
</p>

---

Built on the open [x402](https://github.com/coinbase/x402) standard, Circle Wallets, and Arc. Dynamic pricing via Google Gemini Function Calling. HMAC receipt caching makes sub-cent pricing profitable.

---

## The problem

Publishers are losing billions to AI scraping with no payment recourse. The only current options are to **sue** (years in court) or to **license** (only available to the top 0.01% of publishers like the NYT, News Corp, Reddit). Everyone else has nothing.

See [docs/PROBLEM.md](docs/PROBLEM.md) for the full lawsuit + licensing-deal evidence, with dates and stakes.

**HTTP already has a status code for this**: `402 Payment Required`, reserved in RFC 2616 since 1999. The x402 standard by Coinbase + the Linux Foundation finally ships it — HTTP 402 response body format, `X-PAYMENT` header, EIP-3009 signing. Combined with Arc's USDC-native gas, per-request pricing is now mathematically profitable for the first time.

**What's missing is the publisher layer.** If you're a publisher today and you want to use x402, you write a middleware from scratch, integrate Circle APIs, price every request by hand, track revenue in a spreadsheet, and handle reputation manually. Tollgate fills that gap.

## What Tollgate actually is

Two deliverables:

1. **`packages/middleware/`** — a drop-in Express / Hono / Next.js package. One line of config and every protected route starts emitting x402-compliant 402 responses and processing payments.
2. **`apps/dashboard/`** — a Next.js dashboard where publishers connect a Circle Wallet, configure pricing rules, watch realtime settlements, rotate API keys, and off-ramp USDC via Circle CCTP.

Three supporting pieces:

3. **`convex/`** — the reactive backend. Stores sites, quotes, events, agent reputations, and the live metrics the dashboard reads.
4. **`apps/demo-news/`** — a sample publisher ("The Nanopayer Times") running the middleware in production, showing the end-to-end flow with 10 editorial articles.
5. **`apps/bot-simulator/`** — a Node.js agent that hits demo-news, signs x402 payments, and produces real onchain settlements. 66+ verifiable transactions so far.

## What we built vs. what was already there

| Already existed | What Tollgate adds |
|---|---|
| HTTP 402 status code (RFC 2616, 1999) | Publisher middleware for Express, Hono, Next.js |
| x402 standard (Coinbase + Linux Foundation) | Publisher dashboard (wallet, withdrawals, realtime, pricing rules, audit log, settings) |
| Circle Wallets + Transfer API | Gemini 3 Flash Function Calling pricer with three callable tools |
| Circle Arc + USDC native gas | 5-minute HMAC receipt cache (5:1 to 50:1 onchain compression) |
| Hosted facilitators (x402.org, Coinbase CDP) | Convex reactive backend: 13 tables, 60+ functions |
| AIsa's 80 endpoints running on x402 | Node agent SDK + bot-simulator for provable end-to-end demo |
| ERC-8004 reputation draft | Reputation-tier discount routing on top of it |

**We did not invent the rail.** We built the building at the end of it.

---

## System architecture

```mermaid
flowchart LR
    subgraph Agent["Bot / AI Agent"]
        SDK["@tollgate/sdk-node<br/>(signs payments)"]
    end

    subgraph Publisher["Publisher site"]
        MW["@tollgate/middleware<br/>(Express / Hono / Next.js)"]
        Content["Article JSON<br/>(paywalled)"]
    end

    subgraph Backend["Tollgate Convex backend"]
        Quotes["quotes<br/>(pricing, settlement)"]
        Events["events<br/>(audit trail)"]
        Agents["agents<br/>(reputation)"]
        Gemini["Gemini 3 Flash<br/>Function Calling"]
    end

    subgraph Circle["Circle"]
        Wallets["Circle Wallets<br/>(publisher custody)"]
        Gateway["Circle Nanopayments<br/>(settlement)"]
    end

    subgraph Chain["Arc / Base Sepolia"]
        Arc["USDC settlement<br/>(onchain)"]
    end

    subgraph Dashboard["Publisher Dashboard"]
        App["tollgate.brianmwai.com<br/>/app/*"]
    end

    SDK -->|"GET + X-PAYMENT"| MW
    MW -->|"verify + settle"| Quotes
    Quotes -->|"price quote"| Gemini
    Gemini -->|"tools: reputation, rules, activity"| Agents
    Quotes -->|"Transfer"| Wallets
    Wallets --> Gateway
    Gateway --> Arc
    MW -->|"200 + receipt"| SDK
    MW -->|"ingest"| Events
    App -->|"reactive queries"| Events
    App -->|"reactive queries"| Quotes
    App -->|"provision, withdraw"| Wallets
```

## Data flow (single request)

```mermaid
sequenceDiagram
    autonumber
    participant Bot as AI Agent
    participant MW as Middleware
    participant Cv as Convex
    participant Gem as Gemini 3 Flash
    participant Cw as Circle Wallets
    participant Arc as Base Sepolia

    Bot->>MW: GET /api/articles/arc-primer
    MW->>Cv: quotes:create (siteId, path, agentWallet)
    Cv->>Gem: price() with tools
    Gem->>Cv: getAgentReputation(wallet)
    Gem->>Cv: listSitePricingRules(siteId)
    Gem->>Cv: recentPaymentActivity(wallet)
    Gem-->>Cv: priceMicroUsdc + reasoning trace
    Cv-->>MW: { nonce, price, payTo, asset, network }
    MW-->>Bot: HTTP 402 + x402 body
    Bot->>Bot: sign payment authorization
    Bot->>MW: GET same URL + X-PAYMENT header
    MW->>Cv: quotes:settle (nonce, paymentPayload)
    Cv->>Cw: createTransfer (0.001 USDC, idempotencyKey)
    Cw->>Arc: submit onchain USDC transfer
    Arc-->>Cw: tx confirmed (txHash)
    Cw-->>Cv: Circle tx ID
    Cv-->>MW: { ok: true, txId }
    MW-->>Bot: HTTP 200 + article JSON + X-Tollgate-Receipt-Set
    Note over Bot,MW: Next 50 reads from this agent<br/>present the receipt → skip onchain<br/>(5-minute HMAC cache)
```

## Receipt caching compression

```mermaid
flowchart TB
    subgraph naive["Naive per-request paywall"]
        N1["1000 requests"]
        N2["1000 onchain txs"]
        N3["Gas: 1000 × $0.00002<br/>= $0.02"]
        N1 --> N2 --> N3
    end

    subgraph cached["Tollgate (5-min HMAC receipts)"]
        C1["1000 requests<br/>from 20 agents<br/>on 3 URLs"]
        C2["60 onchain txs<br/>(first hit per agent+URL)"]
        C3["940 cache hits<br/>(receipt short-circuit)"]
        C4["Gas: 60 × $0.00002<br/>= $0.0012<br/>16× cheaper"]
        C1 --> C2 --> C4
        C1 --> C3
    end
```

## Repo layout

```
apps/
  dashboard/              Next.js 16 publisher dashboard (tollgate.brianmwai.com)
  demo-news/              Next.js publisher running the middleware (demo-news.brianmwai.com)
  bot-simulator/          Node agent that produces real settlements
packages/
  middleware/             Framework-agnostic core + Express + Hono adapters
  sdk-node/               Node agent SDK (viem-based)
  shared/                 Types, constants, x402 helpers
convex/                   Reactive backend (13 tables, 60+ functions)
  schema.ts               Table definitions
  quotes.ts               Pricing + settlement lifecycle
  circle.ts               Circle Wallets + Transfer API client
  gemini.ts               Function Calling pricer
  metrics.ts              Public + auth-scoped aggregates
  bots.ts                 Dashboard "Run burst" orchestration
  http.ts                 Clerk + Circle webhooks + edge quote/settle routes
scripts/                  One-shot Node helpers (entity secret setup, etc.)
docs/
  PROBLEM.md              Lawsuits + licensing-deal evidence
  MARGIN.md               Unit economics derivation
  SUBMISSION.md           Copy-paste-ready submission form answers
  CIRCLE-FEEDBACK.md      Product feedback writeup (for $500 bonus)
  GO-LIVE.md              Production env + keys checklist
```

## Try the live demo

You can run the entire flow against the production deployment without installing anything.
Every step works against `tollgate.brianmwai.com` (publisher dashboard) and
`demo-news.brianmwai.com` (a sample publisher running the middleware).

### 1. Visit the demo publisher

Open [demo-news.brianmwai.com](https://demo-news.brianmwai.com) in your browser.
You'll see "The Nanopayer Times", a fake newspaper with 10 long-form articles.
The articles render normally for humans — no paywall blocks the page.

### 2. See the 402

Visit the same site as a bot would, by hitting the API directly:

```
https://demo-news.brianmwai.com/api/articles/arc-primer
```

You'll get back an HTTP `402 Payment Required` with an x402-compliant body:

```json
{
  "x402Version": 1,
  "accepts": [
    {
      "amount": "1000",
      "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "network": "eip155:84532",
      "payTo": "0x7f3fa02d63779354f51b172d3f4a29b73763fbd4",
      "extra": {
        "nonce": "n_moe...",
        "reasoning": "matched rule \"/api/articles/*\"; price=1000uUSDC"
      }
    }
  ]
}
```

The `reasoning` field is the Gemini 3 Flash trace. Every quote carries one.

### 3. Pay the 402 with the bot CLI

```bash
git clone https://github.com/brn-mwai/tollgate.git
cd tollgate
pnpm install
```

Read one article (random):

```bash
pnpm -C apps/bot-simulator read
```

Or pick a specific article:

```bash
pnpm -C apps/bot-simulator read --article arc-primer
```

Or walk every article in one go:

```bash
pnpm -C apps/bot-simulator read-all
```

Each invocation spawns a fresh keypair, hits demo-news, gets the 402, signs
the payment proof, sends it back, and prints the article body. The bot's
private key only signs the nonce — actual USDC moves from a Circle-custodied
bot fleet wallet, server-side, so no wallet funding is required.

The bot prints each step:

```
▸ GET https://demo-news.brianmwai.com/api/articles/arc-primer
▸ 402 Payment Required
  nonce    n_moebvab1_45edaf15d2def71d10fda82e18598643
  price    1000 uUSDC  (0.001000 USDC)
  payTo    0x7f3fa02d63779354f51b172d3f4a29b73763fbd4
  reason   matched rule "/api/articles/*"; price=1000uUSDC
▸ signing payment proof
▸ re-requesting with X-Payment header
▸ paid · HTTP 200 in 2007ms
  circleTx dd3b41e8-2ca8-5f46-85c6-a23a70f1475d
```

### 4. Watch the publisher dashboard react

Open [tollgate.brianmwai.com/app/realtime](https://tollgate.brianmwai.com/app/realtime).
Sign in with Clerk. Within a few seconds you'll see your bot's wallet appear
in the event stream with status `paid_onchain`, the price you paid, and the
on-chain tx hash linking out to basescan.

The "Money path" panel at the top shows the bot fleet wallet on the left
sending to the publisher wallet on the right. The publisher's USDC balance
ticks up in real time.

### 5. Trigger a burst from the dashboard

On `/app/realtime`, set iterations to 12 and click **Run burst**.
Twelve agent requests fire at once, each one quoted, signed, and settled
on chain. The live execution log shows every step:

```
run_started        Spawning 12 agent requests against demo-news.brianmwai.com
agent_request      Agent GET /api/articles/arc-primer
quote_received     402 · 1000 uUSDC · n_moea967c_cf8b341caaaa0a1ef1c8535a5ffda3b7
settle_initiated   Calling Circle Transfer
settle_confirmed   Settled · circleTxId dd3b41e8…
...
run_complete       Done · 12 settled · 0 failed
```

The four StatBand cards at the top tick up: onchain settlements, USDC earned,
unique agents, margin percentage.

### 6. Add your own site

On [tollgate.brianmwai.com/app/sites](https://tollgate.brianmwai.com/app/sites),
click **Add a real domain** and enter your domain (e.g. `mysite.com`).
The dashboard generates an `apiKeyHash`, a `verifyToken`, and a default
pricing rule (`/* → 500 uUSDC`).

To verify ownership, your site must serve the verify token at
`/.well-known/tollgate-verify.txt` as plain text. The token is shown in the
site card. Once it's serving, click **Verify ownership**. The dashboard
fetches the URL, compares the body to the stored token, and flips the site
to **active**.

For a sandbox site without a real domain, add anything ending in `.local`,
`.test`, `.example`, `.demo`, or `.localhost` — those skip the verify step
and boot straight to active.

### 7. Delete a site (resetting between takes)

Every site card has a red **Delete** button. Clicking it removes the site
and cascades the delete across `pricingRules`, `events`, `hourlyRollup`,
`receipts`, `nonceLog`, `quotes`, `botRuns`, and `botRunSteps`. There is
no undo. After delete you can immediately re-add the same domain — the
verify token endpoint pulls live from Convex, so the new token is served
without a redeploy.

---

## Quick start (local dev)

To run the dashboard, demo publisher, and bot-simulator against your own
Convex deployment:

```bash
pnpm install
pnpm convex:dev            # boots Convex dev deployment
pnpm -C apps/dashboard dev # dashboard on :3000
pnpm -C apps/demo-news dev # publisher on :4001

# Seed the demo publisher, then fire a burst against localhost
npx convex run dev:seedDemo
DEMO_PUBLISHER_URL=http://localhost:4001 \
  pnpm -C apps/bot-simulator burst
```

You'll need to set these Convex environment variables before settles will
succeed — see [docs/GO-LIVE.md](docs/GO-LIVE.md) for the full list:

| Variable | Source |
|---|---|
| `CIRCLE_API_KEY` | Circle Console → Keys |
| `CIRCLE_ENTITY_SECRET` | Circle Console → Wallets → Configurator |
| `CIRCLE_WALLET_SET_ID` | Circle Console → Wallets → Wallet Sets |
| `TOLLGATE_BOT_FLEET_WALLET_ID` | Circle wallet to fund the bot fleet from |
| `TOLLGATE_BOT_FLEET_ADDRESS` | The same wallet's onchain address |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk dashboard → JWT templates |
| `CLERK_WEBHOOK_SECRET` | Clerk dashboard → Webhooks |
| `GEMINI_API_KEY` | aistudio.google.com/apikey (optional; fallback pricer) |
| `DEV_SEED_ALLOWED` | `true` (gates dev-only seeders + helpers) |

## Proof points

- **66+ real onchain USDC settlements** on Base Sepolia, Circle wallet `0x7f3fa02d63779354f51b172d3f4a29b73763fbd4`
- **Price per request**: 1,000 uUSDC ($0.001). Cap enforced at 10,000 uUSDC ($0.01)
- **Margin math** documented in [docs/MARGIN.md](docs/MARGIN.md): 99.2% on Arc, −19,900% on Ethereum L1 at the same load
- **Every tx** is clickable from the dashboard's `/app/realtime` feed → basescan.org
- **Every quote** carries a Gemini reasoning string persisted in `quotes.pricerTrace`

## Circle products used

- Arc L1 (conceptually; settlement currently on Base Sepolia until Circle Wallets ships `ARC-SEPOLIA` enum value)
- USDC
- Circle Wallets (developer-controlled custodial)
- Circle Nanopayments / Transfer API
- Circle CCTP / Bridge Kit (multi-chain off-ramp)
- Circle Developer Console (setup + verification)

See [docs/CIRCLE-FEEDBACK.md](docs/CIRCLE-FEEDBACK.md) for integration notes, what worked, and what could be improved (eligible for the $500 feedback bonus).

## Hackathon track alignment

- **Primary**: Per-API Monetization Engine — we charge per request in USDC on Arc
- **Secondary**: Agent-to-Agent Payment Loop — the bot-simulator has 20+ autonomous agents paying publishers in real time, no custodial control on the agent side
- **Gemini track**: Function Calling powers every quote; three callable tools; reasoning persisted per-quote

## License

MIT. See [LICENSE](LICENSE).

## Author

Brian Mwai · [brianmwai.com](https://brianmwai.com) · [@brn-mwai](https://github.com/brn-mwai)
