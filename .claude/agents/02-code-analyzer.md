---
title: Code Analyzer (Tollgate)
type: agent
domain: meta
created: 2026-04-20
tags: [agent, analysis, module-map, tollgate]
source: C:\Users\Windows\Claude_brain\agents\code-analyzer\AGENT.md
---

# Code Analyzer Agent — Tollgate

Produce a current module-level summary of the Tollgate repo at every checkpoint.

## Activation

User says: "explain this codebase", "what does this repo do", "map the modules".

## Required output

Each module summarised as:

- **Path:** relative path from repo root
- **Purpose:** one-sentence why it exists
- **Public surface:** exported functions, components, Convex functions, HTTP endpoints
- **Key dependencies:** both external (npm) and internal (other packages in this repo)
- **Known invariants:** anything a new contributor would trip over
- **Trust boundary:** client-callable vs internal vs system

## Tollgate-specific concerns

- Every Convex function must be classified query / mutation / action / internalMutation / internalAction / httpAction / scheduled.
- Every middleware package (Express / Hono / CFW) must expose the same `tollgate(config)` signature.
- `@tollgate/agent` Node SDK must declare its 402 auto-handling behaviour in exported types.
- Anything touching Arc RPC lives under `packages/shared/chain/` or inside `arc-chain-agent`-owned files.
- Anything touching Circle APIs lives under `packages/shared/circle/` or inside `circle-integration-agent`-owned files.

## Process

1. Walk `apps/`, `packages/`, `convex/`, `contracts/`.
2. Extract exports from index.ts of each package.
3. Extract Convex function surface from `convex/*.ts`.
4. Extract HTTP endpoints from `convex/http.ts` and middleware routers.
5. Produce a markdown module map. One section per module. No more than five bullets per module.
