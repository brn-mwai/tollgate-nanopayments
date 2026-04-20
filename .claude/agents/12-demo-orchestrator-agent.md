---
title: Demo Orchestrator Agent (Tollgate)
type: agent
domain: demo
created: 2026-04-20
tags: [agent, demo, hackathon, recording, tollgate]
---

# Demo Orchestrator Agent — Tollgate

Own the Day-5 demo. Fund wallets, launch parallel scrapers, capture TX hashes, produce Arc Explorer bookmarks, record the video. No code changes on Day 5 except from this agent.

## Activation

User says: "record demo", "run the demo", "60 TX", "prep the scrape", "capture explorer", "submit".

## Submission gates (hard rules from Circle hackathon brief)

1. Demonstrate real per-action pricing at or under $0.01.
2. Produce at least **50 onchain TX**. Tollgate target: **60 TX from 3 wallets in 90 seconds**.
3. Include a margin explanation: why this model fails with traditional gas.
4. Submit by Apr 25, 2026 (online phase); on-site demo Apr 26.
5. Circle Product Feedback field filled (owned by `documentation-generator`).

## Three-agent cast

| Agent | Wallet env var | Pace | Pages | TX |
|---|---|---|---|---|
| FoundationCrawler | `DEMO_AGENT_1_WALLET_ADDRESS` | 1.5 s / req | 30 | 30 |
| ResearchAgent | `DEMO_AGENT_2_WALLET_ADDRESS` | 2.0 s / req | 20 | 20 |
| IndieAgent | `DEMO_AGENT_3_WALLET_ADDRESS` | 3.0 s / req | 10 | 10 |
| **Total** | | parallel + staggered | 60 | **60** |

## Pre-demo checklist

- [ ] All 4 wallets funded with ≥ 0.05 USDC on Arc testnet (enough for 60 TX plus headroom).
- [ ] `demo-news.brianmwai.com` protected by middleware with 60 unique paths, each priced at 500 uUSDC ($0.0005).
- [ ] Dashboard live at `tollgate.brianmwai.com/app/sites/<siteId>` with live counters.
- [ ] Arc Explorer bookmarked to `ARC_EXPLORER_URL?address=<publisher>`.
- [ ] Circle Developer Console open showing all 4 wallets in one view.
- [ ] All receipts purged before recording (force cold path for first TX per agent).

## Screen composition (captured in OBS)

```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│ FoundationCrawler    │ ResearchAgent        │ IndieAgent           │
│ ✓ paid $0.0005 /1    │ ✓ paid $0.0005 /1    │ ✓ paid $0.0005 /1    │
│ ✓ paid $0.0005 /2    │ ✓ paid $0.0005 /2    │ ✓ paid $0.0005 /2    │
├──────────────────────┴──────────────────────┴──────────────────────┤
│ Tollgate Dashboard (live)                                          │
│ Total TX: 47   Earnings: $0.0235   Active Bots: 3                  │
├────────────────────────────────┬───────────────────────────────────┤
│ Arc Block Explorer (live feed) │ Circle Developer Console          │
│ 0xabc… • 1 s ago • $0.0005     │ Publisher: 500,032 uUSDC ▲        │
│ 0xdef… • 2 s ago • $0.0005     │ Bot1: 499,501 uUSDC ▼             │
└────────────────────────────────┴───────────────────────────────────┘
```

## Margin reveal (show at 1:15)

| 60 TX | Arc | Ethereum | Polygon |
|---|---|---|---|
| Revenue | $0.0300 | $0.0300 | $0.0300 |
| Gas spent | $0.00120 | $30.00 | $0.60 |
| Net profit | $0.02880 | -$29.97 | -$0.57 |
| Margin | **96%** | **-99,900%** | **-1,900%** |

Close on: *"Arc denominates gas in USDC. This is the only chain where the math closes."*

## Process

1. Day 4: run full rehearsal. Record to `/dev/null` but measure timing.
2. Day 5 morning: rotate HMAC secrets; re-fund wallets; verify all three agents complete dry runs.
3. Day 5 afternoon: record final take in one shot; OBS scene preset saved.
4. Export: 1080p, <2 min, upload to YouTube unlisted, link in Lablab submission.
5. Hand off to `documentation-generator` for the Product Feedback write-up.

## Hard rules

- No code changes on Day 5 except revert commits.
- If the demo fails, reset all nonces + receipts and re-run. Do not hot-patch.
- Every TX hash visible in the recording is preserved in `docs/demo-tx-hashes.md` for post-submission verification.
