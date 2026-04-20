# Go-live checklist

Every integration Tollgate needs to work end-to-end, in order. Each
block lists: who does it, what it unlocks, what breaks if it is
missing.

Legend:
- **USER** — account creation, paying for services, approving
  interactive prompts
- **CLAUDE** — writing code, configuring files, committing, pushing

## 1. Clerk — authentication

Status: **keys in `.env.local`, UI customized**. Still missing: JWT
template + webhook.

### 1a. JWT template `convex` [USER, 1 minute]

1. https://dashboard.clerk.com → Tollgate app → **JWT templates**
2. **New template** → pick **Convex** preset
3. Save unchanged
4. Copy the **Issuer URL** (the value under "Issuer")

**Unlocks:** Convex can verify Clerk-issued JWTs. Without it, every
`ctx.auth.getUserIdentity()` returns `null` and no mutation/query
scoped to the current user works.

### 1b. Webhook signing secret [USER + CLAUDE, 3 minutes]

Run `pnpm convex:dev` first (step 2 below) so the Convex URL exists.
Then:

1. Clerk dashboard → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://<your-convex-deployment>.convex.site/clerk-webhook`
3. Subscribe: `user.created`, `user.updated`, `user.deleted`
4. **Create**, copy the **Signing Secret** (starts `whsec_`)
5. Paste into Convex dashboard env: `CLERK_WEBHOOK_SECRET`

**Unlocks:** When a user signs up in Clerk, a row appears in the
Convex `users` table automatically. Without it, sign-up works in
Clerk but the user never materialises in Convex and every protected
page shows "publisher not set up".

## 2. Convex — backend [USER, 5 minutes]

Status: **schema + 24 functions shipped, stubs in `_generated/`**.
Still missing: live deployment.

```bash
pnpm convex:dev
```

Interactive prompts:
- Log into Convex (GitHub OAuth)
- Create project named `tollgate`
- Pick your team

The CLI then:
- Writes `NEXT_PUBLIC_CONVEX_URL` into `apps/dashboard/.env.local`
- Regenerates `convex/_generated/` with real typed `api` + `dataModel`
- Pushes the schema and 24 functions to Convex Cloud
- Watches for changes — leave this terminal open alongside `pnpm dev`

After it finishes, add two env vars on the Convex dashboard
(Settings → Environment variables):

- `CLERK_JWT_ISSUER_DOMAIN` = Issuer URL from step 1a
- `CLERK_WEBHOOK_SECRET` = signing secret from step 1b

**Unlocks:** Every reactive query lights up. Sign-up triggers
Clerk webhook → `users.upsertFromClerk` → the Overview page flips
from "Loading..." to the onboarding card (pick an org slug) to the
real dashboard.

## 3. Arc L1 — settlement chain [USER, 10 minutes]

Status: **viem client in `packages/shared/src/chain.ts`**, no live
connection.

1. https://arc.network/docs → find testnet RPC URL + chain ID
2. https://arc.network → request faucet access (email form on the
   docs page, usually approved within a business day)
3. Paste into `apps/dashboard/.env.local`:
   ```
   ARC_RPC_URL=https://rpc.testnet.arc.network
   ARC_CHAIN_ID=<from docs>
   ARC_EXPLORER_URL=https://explorer.testnet.arc.network
   ARC_USDC_CONTRACT=<from docs>
   ```

**Unlocks:** `arc-chain-agent` can sign transactions, read balances,
deploy the ERC-8004 contract. Without it the wallet page balance is
always the cached value from Convex and withdrawals fail.

## 4. Circle — wallets, nanopayments, CCTP [USER, 15 minutes]

Status: **client skeletons in `packages/shared/src/circle.ts`**, no
API key.

### 4a. Developer account

1. https://developers.circle.com → sign up, verify email
2. Create an API key (test environment)
3. Create an entity secret (download the PEM, store in a password
   manager; you need the encrypted ciphertext at request time)
4. Create a Wallet Set named `tollgate-publishers`

### 4b. Paste into `.env.local`:

```
CIRCLE_API_KEY=<api key>
CIRCLE_ENTITY_SECRET=<pem content>
CIRCLE_WALLET_SET_ID=<wallet set id>
```

### 4c. Webhook endpoint

Circle dashboard → **Webhooks** → point at
`https://<your-convex>.convex.site/circle-webhook` (we add this
route in Day 2's next chunk).

**Unlocks:** Clicking "Provision wallet" on the dashboard actually
creates a custodial wallet on Arc. Withdrawals execute via Circle's
transfer API. The `wallets.balance` action returns real USDC.

## 5. x402 facilitator [USER, 2 minutes]

Status: **Coinbase hosts this for free**. Nothing to do beyond
pasting the URL:

```
X402_FACILITATOR_URL=https://facilitator.x402.org
X402_FACILITATOR_NETWORK=arc-testnet
```

**Unlocks:** Payment proof verification between middleware and Arc.

## 6. HMAC receipt secret [CLAUDE, automatic]

Generated locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste into `.env.local` as `TOLLGATE_HMAC_SECRET`.

**Unlocks:** Receipt signing. Without it the warm-cache path is
disabled and every request goes onchain (margin drops).

## 7. Cloudflare — edge gateway [USER, 10 minutes]

Status: **middleware package not yet scaffolded** (Day 3).

1. https://cloudflare.com → sign up (free tier is fine for MVP)
2. Install `wrangler`:
   ```bash
   pnpm add -g wrangler
   wrangler login
   ```
3. Create a Workers KV namespace:
   ```bash
   wrangler kv:namespace create TOLLGATE_NONCE
   ```
   Save the `id` from the output.
4. Create an R2 bucket named `tollgate-events` for cold archives.

**Unlocks:** Hosted gateway for publishers who don't run their own
server. Nonce deduplication at the edge. Cold event archive beyond
Convex's 7-day retention.

## 8. AIsa — upstream data [USER, 5 minutes, optional T2]

Status: **not wired**. Optional for Day 4.

1. https://github.com/aisa-xyz → request API key (Discord or email)
2. Paste into `.env.local`: `AISA_API_KEY=<key>`

**Unlocks:** Dogfood narrative for the demo: our demo agents pay
AIsa via the same 402 flow they pay publishers with. Two-sided
market on screen in the 90-second video.

## 9. ERC-8004 — agent reputation [CLAUDE, Day 4]

Status: **not yet deployed**. Vyper contract lives at
`contracts/erc8004.vy` (ship Day 4). Deploy via Circle-titanoboa:

```bash
pnpm -C contracts deploy --network arc-testnet
```

Capture the contract address into `.env.local`:
`ARC_REPUTATION_CONTRACT=<0x...>`

**Unlocks:** The `reputation.rollDaily` cron stops simulating and
writes real scores onchain. Verified/trusted/preferred tiers apply
real discounts via `pricingRules` lookup.

## 10. DNS — public domains [USER, 15 minutes]

Status: **not wired**. Needed for the demo to render on real URLs.

At your registrar (presumably where `brianmwai.com` is hosted):

| Subdomain | Record | Target |
|---|---|---|
| `tollgate.brianmwai.com` | CNAME | Vercel project |
| `demo-news.brianmwai.com` | CNAME | Vercel project (separate app) |
| `api.tollgate.brianmwai.com` | CNAME | Cloudflare Worker route |

**Unlocks:** Demo video URLs feel real. Judges can visit the
published site.

## 11. Vercel — hosting [USER, 10 minutes]

Status: **not deployed**.

1. https://vercel.com → sign up via GitHub
2. Import `brn-mwai/tollgate`
3. Root directory: `apps/dashboard`
4. Framework preset: Next.js
5. Environment variables: paste every `NEXT_PUBLIC_*` + server-side
   key from `.env.local`

**Unlocks:** Preview per PR. Production deploy on push to main.
Live URL for the demo.

## 12. Observability — Sentry + Axiom + PostHog [USER, optional]

Status: **not wired**, documented in `docs/integrations.md`. Ship
post-hackathon. Stubs added to code when ready.

## Order of operations

Minimum path to "sign up and see the dashboard":

1. Clerk JWT template (step 1a) → **you do this now**
2. `pnpm convex:dev` (step 2) → provisions Convex, generates types,
   regenerates `_generated/`
3. Set Convex env vars (Issuer Domain + webhook secret from step 1)
4. Clerk webhook pointing at Convex site (step 1b)

That gets auth + Convex fully live. Every page renders with real
data (empty tables at first).

Next: Arc + Circle (steps 3 + 4) → wallet + withdrawals work.

Then: Cloudflare + ERC-8004 + demo site → demo-ready.

Finally: DNS + Vercel → publicly accessible.

## Current env checklist

Ticked when the value in `apps/dashboard/.env.local` is real
(not a placeholder).

- [x] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [x] `CLERK_SECRET_KEY`
- [ ] `CLERK_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_CONVEX_URL`
- [ ] `CONVEX_DEPLOY_KEY` (only needed for CI)
- [ ] `ARC_RPC_URL`
- [ ] `ARC_CHAIN_ID`
- [ ] `ARC_USDC_CONTRACT`
- [ ] `CIRCLE_API_KEY`
- [ ] `CIRCLE_ENTITY_SECRET`
- [ ] `CIRCLE_WALLET_SET_ID`
- [x] `X402_FACILITATOR_URL` (Coinbase default, no account needed)
- [ ] `TOLLGATE_HMAC_SECRET` (generated locally)
- [ ] `AISA_API_KEY` (T2, optional)
- [ ] `DEMO_SITE_DOMAIN` and the four demo wallet addresses
