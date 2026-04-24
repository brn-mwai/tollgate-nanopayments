// Demo publisher site. Three long-form articles, each 402-gated at $0.001.
// Agents pay per read; receipts cache for 5 minutes. Publisher = this server;
// payment settles onchain to the publisher's Arc wallet via Circle Gateway.

import express from "express";
import { tollgate } from "@tollgate/middleware/express";
import { ARTICLES, type Article } from "./articles.js";

const PORT = Number(process.env.PORT ?? 4001);
const SITE_ID = requireEnv("TOLLGATE_SITE_ID");
const HMAC_SECRET = requireEnv("TOLLGATE_HMAC_SECRET");
const CONVEX_URL = requireEnv("CONVEX_URL");
const SITE_KEY = requireEnv("TOLLGATE_SITE_KEY");
const VERIFY_TOKEN = requireEnv("TOLLGATE_VERIFY_TOKEN");
const BASE_URL = process.env.DEMO_BASE_URL ?? `http://localhost:${PORT}`;

const app = express();

// Landing page: unpaid. Lists articles with price tags so a human can see the
// model without ever getting a 402.
app.get("/", (_req, res) => {
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.send(renderIndex());
});

// Domain ownership proof. sites.verify fetches this and compares plain text
// against site.verifyToken. Keep this route public and unpaywalled.
app.get("/.well-known/tollgate-verify.txt", (_req, res) => {
  res.setHeader("content-type", "text/plain; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.send(VERIFY_TOKEN);
});

// Public pricing advertisement. Per architecture spec; agents read this to
// learn what a site charges before ever hitting a paywalled path.
app.get("/.well-known/tollgate.json", (_req, res) => {
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "public, max-age=300");
  res.json({
    version: 1,
    siteId: SITE_ID,
    chain: "arc-testnet",
    asset: "0x3600000000000000000000000000000000000000",
    network: "eip155:5042002",
    pricing: [
      { path: "/api/articles/*", priceMicroUsdc: 1000, description: "Per-article read" },
    ],
    contact: "demo@tollgate.brianmwai.com",
  });
});

// Every /api/articles/:slug is 402-gated.
app.use(
  "/api",
  tollgate({
    siteId: SITE_ID,
    chain: "arc-testnet",
    hmacSecret: HMAC_SECRET,
    convexUrl: CONVEX_URL,
    convexSiteKey: SITE_KEY,
    resourceBaseUrl: BASE_URL,
  }),
);

app.get("/api/articles/:slug", (req, res) => {
  const slug = req.params.slug;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    author: article.author,
    published: article.published,
    readingTimeMin: article.readingTimeMin,
    tags: article.tags,
    body: article.body,
    _tollgate: (req as { tollgate?: unknown }).tollgate ?? null,
  });
});

// Human-readable article page (free). Humans can browse, bots pay for the
// JSON. Demonstrates the dual-audience model.
app.get("/read/:slug", (req, res) => {
  const slug = req.params.slug;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) {
    res.status(404).setHeader("content-type", "text/html").send("<h1>Not found</h1>");
    return;
  }
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.send(renderArticle(article));
});

app.listen(PORT, () => {
  console.log(JSON.stringify({
    level: "info",
    op: "demo-news.start",
    port: PORT,
    siteId: SITE_ID,
    convexUrl: CONVEX_URL,
  }));
});

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(JSON.stringify({ level: "fatal", op: "env.missing", name }));
    process.exit(1);
  }
  return v;
}

function renderIndex(): string {
  const articleList = ARTICLES.map(
    (a: Article) => `
    <li>
      <div class="row">
        <div class="meta">
          <div class="tags">${a.tags.map((t: string) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
          <a href="/read/${a.slug}" class="title">${escapeHtml(a.title)}</a>
          <p class="dek">${escapeHtml(a.dek)}</p>
          <div class="byline">By <strong>${escapeHtml(a.author)}</strong> · ${a.published} · ${a.readingTimeMin} min read</div>
        </div>
        <div class="price">
          <span class="amt">$0.001</span>
          <span class="sub">per bot read</span>
        </div>
      </div>
    </li>`,
  ).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>The Nanopayer Times — AI-era journalism, priced per read</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  :root {
    --bg: #0B0B12;
    --fg: #F5F3EE;
    --fg-2: #B8B5AE;
    --fg-3: #7A766E;
    --pink: #FF3CC0;
    --pink-soft: rgba(255,60,192,0.08);
    --arc: #2775CA;
    --border: rgba(245,243,238,0.08);
    --border-s: rgba(245,243,238,0.04);
  }
  * { box-sizing: border-box; }
  body {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
    background: var(--bg);
    color: var(--fg);
    max-width: 820px;
    margin: 0 auto;
    padding: 48px 24px 96px;
    line-height: 1.6;
  }
  header { border-bottom: 1px solid var(--border); padding-bottom: 22px; margin-bottom: 32px; }
  .masthead { font-family: "Instrument Serif", Georgia, serif; font-size: 44px; font-weight: 400; letter-spacing: -0.02em; margin: 0; }
  .masthead-sub { color: var(--fg-3); font-size: 13px; margin-top: 6px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .masthead-sub .dot { width: 4px; height: 4px; border-radius: 50%; background: var(--fg-3); }
  .pill { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; font-size: 11px; font-weight: 500; background: var(--pink-soft); border: 1px solid rgba(255,60,192,0.3); color: var(--pink); border-radius: 999px; font-family: "JetBrains Mono", monospace; }
  .pill.green { background: rgba(6,167,125,0.08); border-color: rgba(6,167,125,0.3); color: #06A77D; }
  .intro { color: var(--fg-2); font-size: 15px; margin-bottom: 40px; max-width: 560px; }
  ul { list-style: none; padding: 0; margin: 0; }
  li { padding: 22px 0; border-bottom: 1px solid var(--border-s); }
  .row { display: flex; gap: 24px; align-items: flex-start; }
  .meta { flex: 1; min-width: 0; }
  .tags { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
  .tag { font-size: 10.5px; font-family: "JetBrains Mono", monospace; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-3); padding: 2px 8px; border: 1px solid var(--border); border-radius: 4px; }
  a.title { font-family: "Instrument Serif", Georgia, serif; font-size: 26px; font-weight: 400; line-height: 1.2; color: var(--fg); text-decoration: none; display: block; margin-bottom: 8px; }
  a.title:hover { color: var(--pink); }
  .dek { color: var(--fg-2); font-size: 14px; margin: 0 0 10px; line-height: 1.55; }
  .byline { color: var(--fg-3); font-size: 12px; font-family: "JetBrains Mono", monospace; }
  .price { text-align: right; min-width: 100px; }
  .amt { display: block; font-family: "Instrument Serif", Georgia, serif; font-size: 24px; color: var(--pink); }
  .sub { display: block; font-size: 10.5px; color: var(--fg-3); font-family: "JetBrains Mono", monospace; text-transform: uppercase; letter-spacing: 0.08em; }
  .footer { margin-top: 56px; padding-top: 24px; border-top: 1px solid var(--border); font-size: 12px; color: var(--fg-3); line-height: 1.7; }
  code { background: rgba(245,243,238,0.06); padding: 2px 7px; border-radius: 4px; font-family: "JetBrains Mono", monospace; font-size: 12px; color: var(--fg); }
  pre { background: rgba(245,243,238,0.04); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; overflow-x: auto; font-size: 12px; line-height: 1.55; }
  .footer a { color: var(--pink); text-decoration: none; }
  .footer a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <header>
    <h1 class="masthead">The Nanopayer Times</h1>
    <div class="masthead-sub">
      <span>AI-era journalism · priced per read</span>
      <span class="dot"></span>
      <span class="pill green">Live on Base Sepolia</span>
      <span class="pill">Powered by Tollgate</span>
    </div>
  </header>
  <p class="intro">
    Every article below is HTTP 402-gated. Humans read for free on the <code>/read</code> URLs.
    Bots, LLM trainers, and research agents pay <strong>$0.001</strong> per API call in USDC, settled
    onchain by Circle, priced live by Google Gemini, and cached for 5 minutes so 50 repeat
    reads collapse into 1 transaction. This page is the first publisher to run on the rail.
  </p>
  <ul>${articleList}</ul>
  <div class="footer">
    <p><strong>For engineers</strong> &mdash; fetch any article programmatically:</p>
    <pre>curl -i ${BASE_URL}/api/articles/arc-primer</pre>
    <p>
      You'll get a 402 with a quote (nonce, price, payTo). Sign the payment payload and retry with
      the <code>X-PAYMENT</code> header. The response includes <code>X-Tollgate-Receipt-Set</code> —
      present that on subsequent reads within 5 minutes to skip onchain settlement entirely.
    </p>
    <p style="margin-top: 20px">
      Want to gate your own site? <a href="https://github.com/brn-mwai/tollgate">brn-mwai/tollgate</a>
      on GitHub. Built for the <a href="https://lablab.ai/ai-hackathons/nano-payments-arc">Agentic Economy on Arc</a>
      hackathon.
    </p>
  </div>
</body>
</html>`;
}

function renderArticle(article: Article): string {
  const paragraphs = article.body
    .split("\n\n")
    .map((p: string) => `<p>${escapeHtml(p)}</p>`)
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(article.title)} · The Nanopayer Times</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  :root {
    --bg: #0B0B12;
    --fg: #F5F3EE;
    --fg-2: #B8B5AE;
    --fg-3: #7A766E;
    --pink: #FF3CC0;
    --border: rgba(245,243,238,0.08);
  }
  * { box-sizing: border-box; }
  body {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
    background: var(--bg);
    color: var(--fg);
    max-width: 680px;
    margin: 0 auto;
    padding: 48px 24px 96px;
    line-height: 1.75;
  }
  a.back { color: var(--fg-3); font-size: 12px; text-decoration: none; font-family: "JetBrains Mono", monospace; margin-bottom: 28px; display: inline-block; }
  a.back:hover { color: var(--pink); }
  .tags { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
  .tag { font-size: 10.5px; font-family: "JetBrains Mono", monospace; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-3); padding: 2px 8px; border: 1px solid var(--border); border-radius: 4px; }
  h1 { font-family: "Instrument Serif", Georgia, serif; font-size: 42px; font-weight: 400; line-height: 1.15; margin: 0 0 16px; letter-spacing: -0.015em; }
  .dek { color: var(--fg-2); font-size: 18px; font-family: "Instrument Serif", Georgia, serif; font-style: italic; margin: 0 0 28px; line-height: 1.45; }
  .byline { color: var(--fg-3); font-size: 13px; font-family: "JetBrains Mono", monospace; padding-bottom: 28px; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
  p { color: var(--fg); font-size: 16px; margin: 0 0 22px; }
  .paywall { margin-top: 56px; padding: 24px 26px; border: 1px solid rgba(255,60,192,0.3); background: rgba(255,60,192,0.05); border-radius: 10px; font-size: 13.5px; color: var(--fg-2); line-height: 1.6; }
  .paywall strong { color: var(--pink); }
  code { background: rgba(245,243,238,0.06); padding: 2px 7px; border-radius: 4px; font-family: "JetBrains Mono", monospace; font-size: 12px; color: var(--fg); }
</style>
</head>
<body>
  <a href="/" class="back">← The Nanopayer Times</a>
  <div class="tags">${article.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
  <h1>${escapeHtml(article.title)}</h1>
  <p class="dek">${escapeHtml(article.dek)}</p>
  <div class="byline">By <strong>${escapeHtml(article.author)}</strong> &nbsp;&middot;&nbsp; ${article.published} &nbsp;&middot;&nbsp; ${article.readingTimeMin} min read</div>
  <div class="tags">${article.tags.map((t: string) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
  ${paragraphs}
  <div class="paywall">
    <strong>For bots:</strong> the JSON version of this article is paywalled at $0.001 per read via
    HTTP 402 &amp; Circle Nanopayments on Base Sepolia. Humans read free on this URL.
    Try: <code>curl -i ${BASE_URL}/api/articles/${article.slug}</code>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
