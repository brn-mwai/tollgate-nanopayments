# The Problem: AI scraping without payment

Publishers are losing billions to AI scraping with no workable payment
recourse. This document collects the public-record lawsuits, licensing
deals, and market signals that define the problem Tollgate addresses.

All facts below are cite-able to court filings, SEC disclosures, or
published press announcements. Monetary figures are what the plaintiffs
**ask for** unless a ruling has been issued; deal values are what both
parties have disclosed.

---

## Active litigation: publishers vs. AI labs

| Filed | Plaintiff | Defendant | Claim | Status |
|---|---|---|---|---|
| Dec 2023 | **The New York Times Company** | OpenAI + Microsoft | Millions of articles used to train GPT models without license. Seeks "billions" in damages + destruction of models trained on Times content. | Active. Exhibits show ChatGPT reproducing near-verbatim NYT paragraphs. |
| Feb 2025 | **Thomson Reuters** | Ross Intelligence | Westlaw legal headnotes used to train AI legal-research product. | **First major summary judgment for publishers.** Fair-use defense rejected. Precedent-setting. Ross shut down. |
| Jan 2023 | **Getty Images** | Stability AI | 12 million images (including Getty watermarks) scraped for Stable Diffusion training. | UK + US cases. Getty won partial summary motion 2025. |
| Sept 2023 | **Authors Guild** (Grisham, Martin, Picoult, Gerritsen, et al.) | OpenAI | Class action: copyrighted books used for training. | Consolidated with Silverman v. OpenAI, Chabon v. OpenAI. Trial scheduled. |
| July 2023 | **Sarah Silverman + Richard Kadrey + Christopher Golden** | Meta + OpenAI | Books3 dataset — pirated books used to train LLaMA / GPT. | Active. |
| Oct 2023 | **Universal Music Group + Concord + ABKCO** | Anthropic | Copyrighted lyrics reproduced verbatim in Claude outputs. Statutory damages $150K per work × thousands of works. | Partial settlement on output reproduction, training-data claim active. |
| Oct 2024 | **News Corp (Wall Street Journal, NY Post, Barron's, MarketWatch)** | Perplexity AI | Systematic scraping + content reproduction under Perplexity's "Pro Search" branding. | Filed in SDNY. Preceded by cease-and-desist from NYT. |
| 2024 | **Forbes Media** | Perplexity AI | Article reproduction + attribution failure. | Active. |
| June 2025 | **Reddit** | Anthropic | Alleges 100,000+ unauthorized bot scrapes of Reddit content despite Reddit having paid licensing deals with OpenAI and Google. | Active. |
| June 2025 | **Disney + Universal Studios** | Midjourney | Image generation reproducing studio-owned characters (Darth Vader, Spider-Man, Shrek). | Active. |
| 2025 | **Ziff Davis (PCMag, IGN, Mashable, Everyday Health)** | OpenAI | Training data + output reproduction. | Active. |
| July 2024 | **Mumsnet** (UK) | OpenAI | UK forum content scraped for training. | Active under UK GDPR + copyright claims. |
| Sept 2024 | **Intercept Media** | OpenAI | Content reproduction + DMCA claims. | Active. |

**Cumulative damages asked across AI training lawsuits**: over $100 billion,
based on plaintiff filings.

---

## Licensing deals: only the top 0.01% can play

When publishers don't sue, they license. Deal values disclosed publicly:

| Deal | Value | Date |
|---|---|---|
| OpenAI × Axel Springer (Politico, Business Insider) | $50M+ over 3 years | Dec 2023 |
| OpenAI × News Corp (WSJ, NY Post, Barron's, Times UK) | ~$250M over 5 years | May 2024 |
| OpenAI × Reddit | ~$60M / year | May 2024 |
| Google × Reddit | ~$60M / year | Feb 2024 |
| OpenAI × Financial Times | undisclosed | Apr 2024 |
| OpenAI × The Atlantic | undisclosed | 2024 |
| OpenAI × Associated Press | undisclosed | July 2023 |
| OpenAI × Le Monde + Prisa | undisclosed | Mar 2024 |
| OpenAI × Dotdash Meredith (People, Food & Wine, Travel + Leisure) | undisclosed | May 2024 |
| OpenAI × Vox Media | undisclosed | May 2024 |
| OpenAI × Hearst (Cosmopolitan, Esquire, Men's Health) | undisclosed | Oct 2024 |
| OpenAI × Time | undisclosed | June 2024 |
| OpenAI × Condé Nast | undisclosed | Aug 2024 |

**Combined disclosed deal value: $500M+ and climbing.**

## The bottleneck

Every licensing deal above has three preconditions:
1. The publisher is large enough to negotiate individually
2. Legal departments on both sides spend months drafting terms
3. The AI lab chooses you — 99% of the web does not get a phone call

For independent blogs, mid-size APIs, academic archives, niche data vendors,
developer documentation sites, and every creator without enterprise legal
support, there is **no option**. They bleed content, pay for hosting, and
receive nothing.

---

## The infrastructure answer (already shipping)

The standards body and payment infrastructure for per-request billing now
exist. The open pieces:

### HTTP 402 + x402 standard
- `402 Payment Required` — reserved in RFC 2616, 1999
- x402 specification: [github.com/coinbase/x402](https://github.com/coinbase/x402) — Coinbase + Linux Foundation
- Hosted facilitators: `x402.org/facilitator`, Coinbase CDP
- Reference SDKs in TypeScript, Python

### Circle payment rail
- Arc L1: USDC as native gas, sub-cent per-action settlement
- Circle Wallets: developer-controlled custodial + user-controlled
- Circle Nanopayments: infrastructure for high-frequency sub-cent transactions
- Circle CCTP: multi-chain USDC bridging
- Documentation: `developers.circle.com`

### Adjacent infrastructure
- **AIsa**: already monetizes ~80 agent-facing API endpoints via x402 (this hackathon)
- **Cloudflare Pay-per-crawl** (July 2025): CDN-layer implementation charging AI crawlers
- **ERC-8004** (draft): onchain agent reputation primitive
- **Coinbase Bazaar**: demo x402 marketplace

---

## What's still missing: the publisher-facing product

All the plumbing above exists. **What does not exist** is a turnkey product
that:

1. Lets a publisher connect a Circle Wallet in one click
2. Ships framework middleware (Express, Hono, Next.js) they install in a line
3. Runs dynamic per-request pricing instead of a flat cap
4. Caches receipts so repeat reads don't each settle onchain
5. Tracks revenue, agent reputation, and audit trail in a reactive dashboard
6. Handles off-ramp, withdrawal, and multi-chain routing via Circle CCTP
7. Exposes it all as MIT-licensed open source the publisher owns

That is the gap Tollgate fills.

---

## Citations

- NYT v. OpenAI: S.D.N.Y. Case No. 1:23-cv-11195
- Thomson Reuters v. Ross Intelligence: D. Del. Case No. 1:20-cv-00613, Feb 11 2025 summary judgment
- Getty Images v. Stability AI: UK High Court [2023] EWHC 3090 (Ch); D. Del. Case No. 1:23-cv-00135
- Authors Guild v. OpenAI: S.D.N.Y. Case No. 1:23-cv-08292
- UMG et al. v. Anthropic: M.D. Tenn. Case No. 3:23-cv-01092
- News Corp v. Perplexity: S.D.N.Y. Case No. 1:24-cv-07984
- Reddit v. Anthropic: N.D. Cal. June 2025 filing
- Disney + Universal v. Midjourney: C.D. Cal. June 11 2025

Licensing deal values sourced from company press releases and reporting in
The New York Times, The Wall Street Journal, The Information, Axios, and
Bloomberg between December 2023 and October 2024.
