// Single-bot narrative read. Spawns one agent with a fresh testnet wallet,
// targets one article on demo-news, and prints each phase of the x402
// payment flow (cold request, 402 quote, signing, paid response, onchain
// tx). Use this to walk a viewer through what the dashboard is reflecting.

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";

const ARTICLES = [
  "arc-primer",
  "x402-revival",
  "agent-economy",
  "gemini-pricing",
  "receipt-compression",
  "reputation-tiers",
] as const;

const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  pink: "\x1b[95m",
};

type Args = { publisher: string; article: string; loop: number; all: boolean };

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const sharedKey = (process.env.TOLLGATE_AGENT_PRIVATE_KEY ?? "").trim() as Hex | "";
  const usingShared = sharedKey.startsWith("0x") && sharedKey.length === 66;
  const privateKey = usingShared ? (sharedKey as Hex) : generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  banner(`Tollgate single-bot read · ${args.publisher}`);
  line("agent", account.address, c.cyan);
  line("wallet", usingShared ? "shared (TOLLGATE_AGENT_PRIVATE_KEY)" : "fresh keypair", c.dim);
  line("dashboard", "https://tollgate.brianmwai.com/app/realtime", c.dim);
  console.log();

  const slugs = args.all
    ? [...ARTICLES]
    : Array.from({ length: args.loop }, () =>
        args.article === "random" ? randomArticle() : args.article,
      );

  let paid = 0;
  let cached = 0;
  let failed = 0;
  let totalUu = 0;
  const startedAt = Date.now();

  for (let i = 0; i < slugs.length; i++) {
    if (slugs.length > 1) {
      console.log(`${c.dim}─── ${i + 1}/${slugs.length} · ${slugs[i]} ───${c.reset}`);
    }
    const r = await read(args.publisher, slugs[i]!, account);
    if (r.kind === "paid") {
      paid++;
      totalUu += r.priceUu;
    } else if (r.kind === "cached") cached++;
    else failed++;
    console.log();
    if (i < slugs.length - 1) await sleep(800);
  }

  if (slugs.length > 1) {
    const elapsedMs = Date.now() - startedAt;
    console.log(`${c.bold}summary${c.reset}`);
    kv("paid", `${paid} requests`, c.green);
    if (cached > 0) kv("cached", `${cached} requests`, c.blue);
    if (failed > 0) kv("failed", `${failed} requests`, c.red);
    kv("spent", `${totalUu} uUSDC  (${(totalUu / 1_000_000).toFixed(6)} USDC)`, c.green);
    kv("elapsed", `${elapsedMs}ms`, c.dim);
    console.log();
  }

  console.log(`${c.dim}check the dashboard event stream — your wallet ${shortAddr(account.address)} should appear in the latest rows.${c.reset}`);
}

type ReadResult =
  | { kind: "paid"; priceUu: number }
  | { kind: "cached" }
  | { kind: "failed" };

async function read(
  publisher: string,
  slug: string,
  account: ReturnType<typeof privateKeyToAccount>,
): Promise<ReadResult> {
  const url = `${publisher}/api/articles/${slug}`;
  step(`GET ${url}`, c.bold);

  const cold = await fetch(url, {
    headers: {
      "x-agent-wallet": account.address,
      "x-bot-class": "narrative-bot",
    },
  });

  if (cold.status === 200) {
    const cachedSet = cold.headers.get("x-tollgate-receipt-set");
    step(`200 OK (no paywall hit)`, c.blue);
    if (cachedSet) kv("receipt", "served from cache", c.blue);
    return { kind: "cached" };
  }
  if (cold.status !== 402) {
    step(`unexpected cold status ${cold.status}`, c.red);
    return { kind: "failed" };
  }

  const quote = (await cold.json()) as {
    accepts?: Array<{
      amount: string;
      asset: string;
      network: string;
      payTo: string;
      extra?: { nonce?: string; reasoning?: string };
    }>;
  };
  const accepted = quote.accepts?.[0];
  if (!accepted || !accepted.extra?.nonce) {
    step("malformed 402 (no accepts[0].extra.nonce)", c.red);
    return { kind: "failed" };
  }

  step(`402 Payment Required`, c.yellow);
  kv("nonce", accepted.extra.nonce, c.dim);
  kv("price", `${accepted.amount} uUSDC  (${(Number(accepted.amount) / 1_000_000).toFixed(6)} USDC)`, c.green);
  kv("asset", accepted.asset, c.dim);
  kv("network", accepted.network, c.dim);
  kv("payTo", accepted.payTo, c.cyan);
  if (accepted.extra.reasoning) kv("reason", accepted.extra.reasoning, c.magenta);

  step(`signing payment proof`, c.cyan);
  const message = `tollgate-x402:${accepted.extra.nonce}:${accepted.amount}:${accepted.payTo}`;
  const signature = await account.signMessage({ message });
  kv("sig", signature.slice(0, 22) + "..." + signature.slice(-10), c.dim);

  const paymentBody = {
    x402Version: 1,
    accepted,
    payload: {
      from: account.address,
      to: accepted.payTo,
      amount: accepted.amount,
      asset: accepted.asset,
      signature,
      nonce: accepted.extra.nonce,
    },
  };
  const xPayment = Buffer.from(JSON.stringify(paymentBody), "utf8").toString("base64");

  step(`re-requesting with X-Payment header`, c.cyan);
  const startedAt = Date.now();
  const paid = await fetch(url, {
    headers: {
      "x-agent-wallet": account.address,
      "x-bot-class": "narrative-bot",
      "x-payment": xPayment,
    },
  });
  const elapsedMs = Date.now() - startedAt;

  if (!paid.ok) {
    step(`paid response failed: HTTP ${paid.status}`, c.red);
    const text = await paid.text().catch(() => "");
    if (text) console.log(`${c.dim}${text.slice(0, 240)}${c.reset}`);
    return { kind: "failed" };
  }

  const txRef = paid.headers.get("x-tollgate-tx");
  const receiptSet = paid.headers.get("x-tollgate-receipt-set");
  step(`paid · HTTP ${paid.status} in ${elapsedMs}ms`, c.green);
  let kind: ReadResult = { kind: "paid", priceUu: Number(accepted.amount) };
  if (txRef) {
    const looksLikeHash = txRef.startsWith("0x") && txRef.length === 66;
    if (looksLikeHash) {
      kv("base", `https://sepolia.basescan.org/tx/${txRef}`, c.green);
    } else {
      kv("circleTx", txRef, c.dim);
      const { baseHash, arcHash } = await pollForSettleHashes(txRef);
      if (baseHash) kv("base", `https://sepolia.basescan.org/tx/${baseHash}`, c.green);
      if (arcHash) kv("arc", `https://testnet.arcscan.app/tx/${arcHash}`, c.green);
      if (!baseHash && !arcHash) {
        kv("onchain", "settled async (watch dashboard for resolved hashes)", c.dim);
      }
    }
  } else if (receiptSet) {
    kv("receipt", "cached (no new onchain tx)", c.blue);
    kind = { kind: "cached" };
  }

  const article = (await paid.json()) as { title?: string; body?: string };
  if (article.title) {
    console.log();
    console.log(`${c.bold}${c.pink}${article.title}${c.reset}`);
  }
  if (article.body) {
    const snippet = article.body.replace(/\s+/g, " ").trim().slice(0, 280);
    console.log(`${c.dim}${snippet}${article.body.length > 280 ? "..." : ""}${c.reset}`);
  }
  return kind;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const publisher =
    get("--publisher") ?? process.env.DEMO_PUBLISHER_URL ?? "https://demo-news.brianmwai.com";
  const article = get("--article") ?? "random";
  const loop = Number(get("--loop") ?? "1");
  const all = argv.includes("--all");
  return { publisher, article, loop, all };
}

function randomArticle(): string {
  return ARTICLES[Math.floor(Math.random() * ARTICLES.length)]!;
}

function banner(text: string): void {
  const pad = "─".repeat(Math.max(0, text.length + 2));
  console.log(`${c.dim}╭${pad}╮${c.reset}`);
  console.log(`${c.dim}│ ${c.reset}${c.bold}${text}${c.reset}${c.dim} │${c.reset}`);
  console.log(`${c.dim}╰${pad}╯${c.reset}`);
}

function step(text: string, color: string): void {
  console.log(`${color}▸${c.reset} ${color}${text}${c.reset}`);
}

function kv(k: string, v: string, valueColor: string): void {
  console.log(`  ${c.dim}${k.padEnd(8)}${c.reset} ${valueColor}${v}${c.reset}`);
}

function line(k: string, v: string, color: string): void {
  console.log(`${c.dim}${k.padEnd(10)}${c.reset} ${color}${v}${c.reset}`);
}

function shortAddr(a: string): string {
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Resolve both on-chain tx hashes (Base Sepolia via Circle + Arc Sepolia
// via operator hot wallet) via the public Convex action. Polls every 2s
// up to 30s. Returns whichever hashes have resolved by then; either or
// both can be null if the chain leg is still pending.
async function pollForSettleHashes(
  circleTxId: string,
): Promise<{ baseHash: string | null; arcHash: string | null }> {
  const convexUrl =
    process.env.TOLLGATE_CONVEX_URL?.replace(/\/$/, "") ??
    "https://hallowed-ram-675.convex.cloud";
  const url = `${convexUrl}/api/action`;
  const body = JSON.stringify({
    path: "quotes:resolveSettleHashes",
    args: { circleTxId },
    format: "json",
  });
  let last: { baseHash: string | null; arcHash: string | null } = {
    baseHash: null,
    arcHash: null,
  };
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      });
      if (res.ok) {
        const data = (await res.json()) as {
          status?: string;
          value?: { baseHash: string | null; arcHash: string | null };
        };
        if (data.status === "success" && data.value) {
          last = data.value;
          if (last.baseHash && last.arcHash) return last;
        }
      }
    } catch {
      /* ignore, retry */
    }
    await sleep(2000);
  }
  return last;
}

main().catch((err) => {
  console.error(`${c.red}fatal:${c.reset} ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
