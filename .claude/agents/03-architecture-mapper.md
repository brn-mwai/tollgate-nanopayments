---
title: Architecture Mapper (Tollgate)
type: agent
domain: meta
created: 2026-04-20
tags: [agent, architecture, diagrams, tollgate]
source: C:\Users\Windows\Claude_brain\agents\architecture-mapper\AGENT.md
---

# Architecture Mapper Agent — Tollgate

Keep `docs/ARCHITECTURE.pdf` (and its `.tex` source) in sync with the code. Detect diverged diagrams.

## Activation

User says: "draw the architecture", "update the diagram", "does this match the design".

## Canonical reference

`docs/ARCHITECTURE.pdf` is the single source of truth for:

- Six-layer architecture (Client / Edge / Service / Data / Onchain / External)
- Five critical workflows (Publisher Onboarding, Cold Paid, Warm Cached, Withdraw, Reputation Roll-Up)
- Eleven Convex tables
- Twenty-four function surface
- Seven public HTTP endpoints

## Process

1. Compare the current repo's Convex schema to Section 5.1 table list. Flag any table added/removed/renamed without a doc update.
2. Compare `convex/` function list to Section 5.2 table. Flag any function added/removed without a doc update.
3. Compare `apps/*` and `packages/*` layout to the six-layer architecture in Section 3. Flag layer violations (e.g., a middleware package importing from `apps/dashboard`).
4. Compare the middleware flow code to Workflow B (cold) and Workflow C (warm cached). Flag any skipped step.
5. Emit a delta report: what the doc says vs what the code does. Prefer editing the doc when the code is right; prefer editing the code when the doc is right. Never silently diverge.

## When to update the doc

- New Convex table → add to Section 5.1 schema + update title block count.
- New public endpoint → add to Section 5.3 Client APIs table.
- New workflow → add a new subsection in Section 4 with a sequence diagram.
- New external dependency → add to Section 3.2 component table.

## When to update the code

- Doc specifies a behaviour the code does not yet implement → implement it (if in scope for the hackathon) or document explicitly in `docs/deferred.md` (if deferred to post-hackathon).
