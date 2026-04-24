"use client";

import { useState } from "react";
import { Flame, TreeStructure, Cloud, Rocket, Copy, Check, Terminal } from "@phosphor-icons/react";
import { CodeBlock } from "@/components/code-block";

type Snippet = {
  label: string;
  install: string;
  code: string;
  Icon: React.ComponentType<{ size?: number }>;
};

const SNIPPETS: Record<string, Snippet> = {
  express: {
    label: "Express",
    Icon: TreeStructure,
    install: "pnpm add @tollgate/middleware express",
    code: `import express from "express";
import { tollgate } from "@tollgate/middleware/express";

const app = express();

// 402-gate every path under /api/articles.
// Middleware calls Tollgate for pricing + Circle Gateway for settlement.
app.use(
  "/api/articles",
  tollgate({
    siteId: process.env.TOLLGATE_SITE_ID!,
    chain: "arc-testnet",
    hmacSecret: process.env.TOLLGATE_HMAC_SECRET!,
    convexUrl: process.env.CONVEX_URL!,
    convexSiteKey: process.env.TOLLGATE_SITE_KEY!,
  })
);

app.get("/api/articles/:slug", (req, res) => {
  res.json({ body: "Paid content here." });
});

app.listen(4001);`,
  },
  hono: {
    label: "Hono",
    Icon: Flame,
    install: "pnpm add @tollgate/middleware hono",
    code: `import { Hono } from "hono";
import { tollgate } from "@tollgate/middleware/hono";

const app = new Hono();

// Works on Node, Bun, Cloudflare Workers - same middleware.
app.use(
  "/api/articles/*",
  tollgate({
    siteId: process.env.TOLLGATE_SITE_ID!,
    chain: "arc-testnet",
    hmacSecret: process.env.TOLLGATE_HMAC_SECRET!,
    convexUrl: process.env.CONVEX_URL!,
    convexSiteKey: process.env.TOLLGATE_SITE_KEY!,
  })
);

app.get("/api/articles/:slug", (c) => {
  return c.json({ body: "Paid content here." });
});

export default app;`,
  },
  nextjs: {
    label: "Next.js",
    Icon: Rocket,
    install: "pnpm add @tollgate/middleware",
    code: `// app/api/articles/[slug]/route.ts
import { NextResponse } from "next/server";
import { runTollgate } from "@tollgate/middleware";

const cfg = {
  siteId: process.env.TOLLGATE_SITE_ID!,
  chain: "arc-testnet" as const,
  hmacSecret: process.env.TOLLGATE_HMAC_SECRET!,
  convexUrl: process.env.CONVEX_URL!,
  convexSiteKey: process.env.TOLLGATE_SITE_KEY!,
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const result = await runTollgate(cfg, {
    method: "GET",
    path: url.pathname,
    url: req.url,
    headerReceipt: req.headers.get("x-tollgate-receipt") ?? undefined,
    headerPayment: req.headers.get("x-payment") ?? undefined,
    headerAgentWallet: req.headers.get("x-agent-wallet") ?? undefined,
  });
  if (result.kind === "402") {
    return NextResponse.json(result.body, { status: 402, headers: result.headers });
  }
  if (result.kind === "fail") {
    return NextResponse.json(result.body, { status: result.status });
  }
  const res = NextResponse.json({ body: "Paid content here." });
  if (result.receiptToSet) res.headers.set("x-tollgate-receipt-set", result.receiptToSet);
  return res;
}`,
  },
  bot: {
    label: "Bot client",
    Icon: Terminal,
    install: "pnpm add @tollgate/sdk-node viem",
    code: `import { createAgent } from "@tollgate/sdk-node";
import { generatePrivateKey } from "viem/accounts";

// One agent = one wallet + 402-aware fetch.
const agent = createAgent({
  privateKey: generatePrivateKey(),
  chain: "arc-testnet",
  botClass: "crawler",
  maxPricePerRequestUu: 1000,  // $0.001 ceiling, optional
});

// No manual 402 loop. SDK signs the x402 payment, retries, caches the
// HMAC receipt for 5 minutes — subsequent hits skip onchain entirely.
const res = await agent.fetch("https://demo-news.brianmwai.com/api/articles/arc-primer");
const article = await res.json();

console.log(article);                                  // full body
console.log(res.headers.get("x-tollgate-tx"));         // Arc tx hash (first hit)
console.log(res.headers.get("x-tollgate-receipt-set"));// cache token`,
  },
};

export default function InstallPage() {
  const [tab, setTab] = useState<keyof typeof SNIPPETS>("express");
  const snippet = SNIPPETS[tab]!;

  return (
    <div>
      <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, marginBottom: 4, fontWeight: 400 }}>
        Install the SDK
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>
        One package. Four frameworks. Start charging AI bots per request in under five minutes.
      </p>

      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--border)", marginBottom: 24, flexWrap: "wrap" }}>
        {(Object.entries(SNIPPETS) as Array<[keyof typeof SNIPPETS, Snippet]>).map(([key, s]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: tab === key ? 600 : 500,
              color: tab === key ? "var(--text-1)" : "var(--text-2)",
              background: "none",
              border: "none",
              borderBottom: tab === key ? "2px solid #FF00AA" : "2px solid transparent",
              marginBottom: -1,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
            }}
          >
            <s.Icon size={15} />
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6 }}>
          1 · Install
        </div>
        <CodeCopyPanel code={snippet.install} lang="bash" />
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6 }}>
          2 · Drop in {snippet.label}
        </div>
        <CodeCopyPanel code={snippet.code} lang="ts" />
      </div>

      <EnvPanel />
      <RouteReferencePanel />
    </div>
  );
}

function CodeCopyPanel({ code, lang }: { code: string; lang: "ts" | "bash" }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        background: "var(--bg-card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          background: "linear-gradient(180deg, rgba(255,60,192,0.02), transparent)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            fontSize: 11,
            color: copied ? "#06A77D" : "var(--text-2)",
            background: "var(--bg-shell)",
            border: "1px solid var(--border)",
            borderRadius: 5,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <CodeBlock code={code} lang={lang} />
    </div>
  );
}

function EnvPanel() {
  const env = `TOLLGATE_SITE_ID=site_abc123
TOLLGATE_SITE_KEY=tg_live_...   # from the Sites page, shown once
TOLLGATE_HMAC_SECRET=...         # 32+ bytes, generate per-site
CONVEX_URL=https://hallowed-ram-675.convex.cloud`;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6 }}>
        3 · Environment variables
      </div>
      <CodeCopyPanel code={env} lang="bash" />
      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8, lineHeight: 1.55 }}>
        Generate <code style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-2)" }}>TOLLGATE_HMAC_SECRET</code>
        {" "}with <code style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-2)" }}>
          node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(32).toString(&apos;hex&apos;))&quot;
        </code>.
      </div>
    </div>
  );
}

function RouteReferencePanel() {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        background: "var(--bg-card)",
        padding: "18px 20px",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>HTTP wire format</div>
      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.65 }}>
        <div style={{ marginBottom: 10 }}>
          <RouteLabel method="GET" tone="neutral" /> your protected path returns
          <Pill>402</Pill> with
          <code style={snippetCode}>{`{ accepts: [{ scheme, network, asset, amount, payTo, extra: { nonce } }] }`}</code>
        </div>
        <div style={{ marginBottom: 10 }}>
          Bot signs <code style={snippetCode}>tollgate-x402:NONCE:AMOUNT:PAY_TO</code>, base64-encodes a JSON payload, retries with
          <code style={snippetCode}>X-PAYMENT:</code> header.
        </div>
        <div>
          On success you receive <Pill>200</Pill> plus
          <code style={snippetCode}>X-Tollgate-Receipt-Set:</code> (HMAC, 5-minute TTL) and
          <code style={snippetCode}>X-Tollgate-Tx:</code> (Arc transaction hash). Subsequent reads present
          <code style={snippetCode}>X-Tollgate-Receipt:</code> and short-circuit to 200 with no onchain TX.
        </div>
      </div>
    </div>
  );
}

function RouteLabel({ method, tone }: { method: string; tone: "neutral" }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 11,
        padding: "2px 7px",
        borderRadius: 4,
        marginRight: 6,
        background: tone === "neutral" ? "rgba(255,60,192,0.12)" : "rgba(6,167,125,0.12)",
        color: tone === "neutral" ? "#FF3CC0" : "#06A77D",
        border: `1px solid ${tone === "neutral" ? "rgba(255,60,192,0.3)" : "rgba(6,167,125,0.3)"}`,
      }}
    >
      {method}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 11,
        padding: "1px 6px",
        borderRadius: 4,
        margin: "0 6px",
        background: "rgba(255,60,192,0.1)",
        color: "#FF3CC0",
      }}
    >
      {children}
    </span>
  );
}

const snippetCode: React.CSSProperties = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 11,
  padding: "1px 6px",
  margin: "0 4px",
  borderRadius: 4,
  background: "var(--bg-shell)",
  color: "var(--text-1)",
  border: "1px solid var(--border)",
};
