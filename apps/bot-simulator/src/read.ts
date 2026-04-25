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

type Args = { publisher: string; article: string; loop: number };

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

  for (let i = 0; i < args.loop; i++) {
    const slug = args.article === "random" ? randomArticle() : args.article;
    if (args.loop > 1) {
      console.log(`${c.dim}─── round ${i + 1}/${args.loop} ───${c.reset}`);
    }
    await read(args.publisher, slug, account);
    console.log();
    if (i < args.loop - 1) await sleep(800);
  }

  console.log(`${c.dim}check the dashboard event stream — your wallet ${shortAddr(account.address)} should appear in the latest row.${c.reset}`);
}

async function read(
  publisher: string,
  slug: string,
  account: ReturnType<typeof privateKeyToAccount>,
): Promise<void> {
  const url = `${publisher}/api/articles/${slug}`;
  step(`GET ${url}`, c.bold);

  const cold = await fetch(url, {
    headers: {
      "x-agent-wallet": account.address,
      "x-bot-class": "narrative-bot",
    },
  });

  if (cold.status !== 402) {
    step(`unexpected cold status ${cold.status}`, c.red);
    return;
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
    return;
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
    return;
  }

  const txRef = paid.headers.get("x-tollgate-tx");
  const receiptSet = paid.headers.get("x-tollgate-receipt-set");
  step(`paid · HTTP ${paid.status} in ${elapsedMs}ms`, c.green);
  if (txRef) {
    const looksLikeHash = txRef.startsWith("0x") && txRef.length === 66;
    if (looksLikeHash) {
      kv("onchain", `https://sepolia.basescan.org/tx/${txRef}`, c.green);
    } else {
      kv("circleTx", txRef, c.green);
      kv("onchain", "settled async via Circle (watch dashboard for the resolved tx hash)", c.dim);
    }
  } else if (receiptSet) {
    kv("receipt", "cached (no new onchain tx)", c.blue);
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
  return { publisher, article, loop };
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

main().catch((err) => {
  console.error(`${c.red}fatal:${c.reset} ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
