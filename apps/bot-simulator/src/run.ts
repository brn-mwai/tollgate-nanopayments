// Spawn N simulated agents that pay a Tollgate publisher for content.
// Each agent uses @tollgate/sdk-node to handle the 402 → sign → retry loop
// transparently. This driver just fans out requests and counts outcomes for
// the "50+ onchain transactions" hackathon gate.

import { createAgent, type Agent } from "@tollgate/sdk-node";
import { generatePrivateKey } from "viem/accounts";
import type { Hex } from "viem";

const ARTICLES = [
  "arc-primer",
  "x402-revival",
  "agent-economy",
  "gemini-pricing",
  "receipt-compression",
  "reputation-tiers",
] as const;

type Args = { publisher: string; agents: number; requests: number };

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  log("run.start", args);

  // If TOLLGATE_AGENT_PRIVATE_KEY is set, every virtual agent signs with the
  // same funded wallet — cheapest way to prove real onchain settlement
  // without rate-limiting the Circle faucet per wallet. The facilitator
  // doesn't care that the payer is the same — each settle is its own tx.
  const sharedKey = (process.env.TOLLGATE_AGENT_PRIVATE_KEY ?? "").trim() as Hex | "";
  const usingShared = sharedKey.startsWith("0x") && sharedKey.length === 66;

  const agents = Array.from({ length: args.agents }, () =>
    createAgent({
      privateKey: usingShared ? (sharedKey as Hex) : generatePrivateKey(),
      chain: "arc-testnet",
      botClass: "demo-simulator",
    }),
  );
  log("agents.spawned", {
    count: agents.length,
    sharedSigner: usingShared,
    wallets: usingShared ? [agents[0]?.address] : agents.map((a) => a.address),
  });

  let onchain = 0;
  let cached = 0;
  let errors = 0;
  const startedAt = Date.now();

  for (let round = 0; round < args.requests; round++) {
    const results = await Promise.all(agents.map((a) => hit(a, args.publisher)));
    for (const r of results) {
      if (r.kind === "onchain") onchain++;
      else if (r.kind === "cached") cached++;
      else errors++;
      log(`agent.${r.kind}`, r);
    }
    await sleep(250 + Math.random() * 750);
  }

  const elapsedMs = Date.now() - startedAt;
  log("run.summary", {
    onchainTx: onchain,
    cachedHits: cached,
    errors,
    elapsedMs,
    rps: ((onchain + cached) / (elapsedMs / 1000)).toFixed(2),
  });
}

type HitResult =
  | { kind: "onchain"; agent: string; path: string; txHash: string | null; durMs: number }
  | { kind: "cached"; agent: string; path: string; durMs: number }
  | { kind: "error"; agent: string; path: string; error: string };

// Per-agent round-robin over the article list for the first pass guarantees
// that every (agent, url) pair is hit at least once — so `agents × articles`
// onchain settles are a floor. Random picks take over once all slugs are
// warmed, so receipt-cache hits accumulate naturally after that.
const agentCursor = new WeakMap<Agent, number>();

async function hit(agent: Agent, baseUrl: string): Promise<HitResult> {
  const seen = agentCursor.get(agent) ?? 0;
  const slug =
    seen < ARTICLES.length
      ? ARTICLES[seen]!
      : ARTICLES[Math.floor(Math.random() * ARTICLES.length)]!;
  agentCursor.set(agent, seen + 1);
  const path = `/api/articles/${slug}`;
  const startedAt = Date.now();
  try {
    const res = await agent.fetch(baseUrl + path);
    if (!res.ok) {
      return { kind: "error", agent: agent.address, path, error: `status ${res.status}` };
    }
    const txHash = res.headers.get("x-tollgate-tx");
    const receiptSet = res.headers.get("x-tollgate-receipt-set");
    if (receiptSet || txHash) {
      return { kind: "onchain", agent: agent.address, path, txHash, durMs: Date.now() - startedAt };
    }
    return { kind: "cached", agent: agent.address, path, durMs: Date.now() - startedAt };
  } catch (err) {
    return {
      kind: "error",
      agent: agent.address,
      path,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const publisher = get("--publisher") ?? process.env.DEMO_PUBLISHER_URL ?? "http://localhost:4001";
  const agents = Number(get("--agents") ?? "10");
  const requests = Number(get("--requests") ?? "15");
  return { publisher, agents, requests };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function log(op: string, data: unknown): void {
  console.log(JSON.stringify({ t: new Date().toISOString(), op, ...(data as object) }));
}

main().catch((err) => {
  console.error(
    JSON.stringify({ level: "fatal", op: "run.crash", err: err instanceof Error ? err.message : String(err) }),
  );
  process.exit(1);
});
