// Paywalled bot-facing endpoint. Each GET goes through the Tollgate
// middleware pipeline: receipt fast-path, payment settle, or fresh 402 issue.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { runTollgate, MiddlewareConfigSchema } from "../../../../lib/middleware/core";
import { ARTICLES } from "../../../../lib/articles-data";
import { getConfig } from "../../../../lib/config";

export const dynamic = "force-dynamic";

function resolveCfg() {
  const c = getConfig();
  return MiddlewareConfigSchema.parse({
    siteId: c.siteId,
    chain: "arc-testnet",
    hmacSecret: c.hmacSecret,
    convexUrl: c.convexUrl,
    convexSiteKey: c.siteKey,
    resourceBaseUrl: c.baseUrl,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const cfg = resolveCfg();
  const url = new URL(req.url);
  const result = await runTollgate(cfg, {
    method: "GET",
    path: url.pathname,
    url: req.url,
    headerReceipt: req.headers.get("x-tollgate-receipt") ?? undefined,
    headerPayment: req.headers.get("x-payment") ?? undefined,
    headerBotClass: req.headers.get("x-bot-class") ?? undefined,
    headerAgentWallet: req.headers.get("x-agent-wallet") ?? undefined,
  });

  if (result.kind === "402") {
    const res = NextResponse.json(result.body, { status: 402 });
    for (const [k, v] of Object.entries(result.headers)) {
      res.headers.set(k, v);
    }
    return res;
  }

  if (result.kind === "fail") {
    return NextResponse.json(result.body, { status: result.status });
  }

  // allow
  const res = NextResponse.json({
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    author: article.author,
    published: article.published,
    readingTimeMin: article.readingTimeMin,
    tags: article.tags,
    body: article.body,
    _tollgate: { tier: result.tier, agent: result.agentWallet, tx: result.txHash ?? null },
  });
  if (result.receiptToSet) res.headers.set("x-tollgate-receipt-set", result.receiptToSet);
  if (result.txHash) res.headers.set("x-tollgate-tx", result.txHash);
  return res;
}
