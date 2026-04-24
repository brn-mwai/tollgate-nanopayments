// Hono adapter. Works on Node, Bun, Cloudflare Workers.
//
//   import { Hono } from "hono";
//   import { tollgate } from "@tollgate/middleware/hono";
//
//   const app = new Hono();
//   app.use("/api/*", tollgate({ siteId, chain, hmacSecret, convexUrl, convexSiteKey }));

import type { MiddlewareHandler } from "hono";
import { MiddlewareConfigSchema, runTollgate, type MiddlewareConfig } from "./core.js";

export function tollgate(input: Partial<MiddlewareConfig>): MiddlewareHandler {
  const cfg = MiddlewareConfigSchema.parse(input);

  return async (c, next) => {
    const result = await runTollgate(cfg, {
      method: c.req.method,
      path: new URL(c.req.url).pathname,
      url: c.req.url,
      headerReceipt: c.req.header("x-tollgate-receipt"),
      headerPayment: c.req.header("x-payment"),
      headerBotClass: c.req.header("x-bot-class"),
      headerAgentWallet: c.req.header("x-agent-wallet"),
    });

    if (result.kind === "allow") {
      if (result.receiptToSet) c.res.headers.set("x-tollgate-receipt-set", result.receiptToSet);
      if (result.txHash) c.res.headers.set("x-tollgate-tx", result.txHash);
      c.set("tollgate", { tier: result.tier, agent: result.agentWallet });
      await next();
      return;
    }

    if (result.kind === "402") {
      return c.json(result.body as Record<string, unknown>, 402, result.headers);
    }

    return c.json(result.body as Record<string, unknown>, result.status as 400 | 402 | 500 | 502);
  };
}
