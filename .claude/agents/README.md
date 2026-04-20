# Tollgate Agent Roster

Twelve specialist agents build Tollgate. Eight general-purpose (sourced from `C:\Users\Windows\Claude_brain\agents\`, adapted) and four Tollgate-specific.

## Activation rule

Before acting on any Tollgate task, read the matching agent's file:

| Task signal | Agent |
|---|---|
| "what tech is used" | [01-tech-stack-detector.md](01-tech-stack-detector.md) |
| "map the repo" / "summarise modules" | [02-code-analyzer.md](02-code-analyzer.md) |
| "draw architecture" / "diagram sync" | [03-architecture-mapper.md](03-architecture-mapper.md) |
| "review this PR" / "audit code" | [04-code-auditor.md](04-code-auditor.md) |
| "security check" | [05-security-scanner.md](05-security-scanner.md) |
| "optimize" / "p95" / "latency" | [06-performance-profiler.md](06-performance-profiler.md) |
| "check dependencies" | [07-dependency-auditor.md](07-dependency-auditor.md) |
| "write docs" / "README" / "SDK docs" | [08-documentation-generator.md](08-documentation-generator.md) |
| "Arc RPC" / "USDC transfer" / "chain call" | [09-arc-chain-agent.md](09-arc-chain-agent.md) |
| "Circle Wallets" / "CCTP" / "Gateway" | [10-circle-integration-agent.md](10-circle-integration-agent.md) |
| "402" / "facilitator" / "HMAC receipt" / "nonce" | [11-x402-protocol-agent.md](11-x402-protocol-agent.md) |
| "record demo" / "60 TX" / "demo site" | [12-demo-orchestrator-agent.md](12-demo-orchestrator-agent.md) |

## Handoff rules

1. **Read before act.** Every agent reads its own file before starting. Output uses the `REPORT-TEMPLATE.md` format.
2. **One source of truth per concern.** Only `arc-chain-agent` touches Arc RPC. Only `circle-integration-agent` touches Circle APIs. Only `x402-protocol-agent` touches 402 and receipt formats. Prevents duplicate or conflicting client code.
3. **No merge without audit.** `code-auditor`, `security-scanner`, and `dependency-auditor` must all pass on every PR before merge.
4. **Performance gates are code gates.** `performance-profiler` runs on every PR that touches middleware or facilitator. Regression blocks merge.
5. **Demo owner.** `demo-orchestrator-agent` owns Day 5. No code changes on Day 5 except from this agent.
6. **Feedback loop.** Monitoring reports feed new requirements, not ad-hoc fixes. Coherence over speed.
