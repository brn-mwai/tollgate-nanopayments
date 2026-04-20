"use client";

import { useState } from "react";
import { Flame, TreeStructure, Cloud, Rocket, Copy } from "@phosphor-icons/react";

const SNIPPETS: Record<string, { label: string; code: string; Icon: React.ComponentType<{ size?: number }> }> = {
  hono: {
    label: "Hono",
    Icon: Flame,
    code: `// npm i @tollgate/hono hono
import { Hono } from 'hono'
import { tollgate } from '@tollgate/hono'

const app = new Hono()

app.use('/article/*', tollgate({
  siteId:  process.env.TOLLGATE_SITE_ID,
  price:   '500uUSDC',
  chain:   'arc-testnet',
  receipt: { ttl: 300 }
}))

app.get('/article/:id', c => c.json({ body: '...' }))

export default app`,
  },
  express: {
    label: "Express",
    Icon: TreeStructure,
    code: `// npm i @tollgate/express express
import express from 'express'
import { tollgate } from '@tollgate/express'

const app = express()

app.use('/article', tollgate({
  siteId:  process.env.TOLLGATE_SITE_ID,
  price:   '500uUSDC',
  chain:   'arc-testnet',
  receipt: { ttl: 300 }
}))

app.get('/article/:id', (req, res) => res.json({ body: '...' }))

app.listen(3000)`,
  },
  cfw: {
    label: "Cloudflare Worker",
    Icon: Cloud,
    code: `// npm i @tollgate/cloudflare-worker
import { tollgate } from '@tollgate/cloudflare-worker'

export default {
  async fetch(request, env, ctx) {
    const gated = await tollgate({
      siteId:   env.TOLLGATE_SITE_ID,
      price:    '500uUSDC',
      chain:    'arc-testnet',
      receipt:  { ttl: 300 },
      kv:       env.TOLLGATE_KV   // nonce dedup
    })(request)

    if (gated) return gated
    return new Response('article body')
  }
}`,
  },
  nextjs: {
    label: "Next.js",
    Icon: Rocket,
    code: `// app/api/article/[id]/route.ts
import { tollgate } from '@tollgate/next'
import { NextResponse } from 'next/server'

export const GET = tollgate({
  price:   '500uUSDC',
  chain:   'arc-testnet',
  receipt: { ttl: 300 }
})(async (req, ctx) => {
  return NextResponse.json({ body: '...' })
})`,
  },
};

export default function InstallPage() {
  const [tab, setTab] = useState<keyof typeof SNIPPETS>("hono");
  const snippet = SNIPPETS[tab];

  return (
    <div>
      <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, marginBottom: 4, fontWeight: 400 }}>
        Install the SDK
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>
        One line of middleware. Start charging AI bots per request.
      </p>

      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
        {Object.entries(SNIPPETS).map(([key, { label, Icon }]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as keyof typeof SNIPPETS)}
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
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          background: "var(--bg-card)",
          overflow: "hidden",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600 }}>{snippet.label}</div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(snippet.code)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              fontSize: 12,
              color: "var(--text-2)",
              background: "var(--bg-shell)",
              border: "1px solid var(--border)",
              borderRadius: 5,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Copy size={13} /> Copy
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 18,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
            lineHeight: 1.55,
            color: "#E8E9F0",
            background: "#0A0B10",
            overflowX: "auto",
          }}
        >
          {snippet.code}
        </pre>
      </div>
    </div>
  );
}
