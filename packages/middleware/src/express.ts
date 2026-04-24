// Express adapter. Mount globally or per-route.
//
//   import express from "express";
//   import { tollgate } from "@tollgate/middleware/express";
//
//   const app = express();
//   app.use("/api", tollgate({
//     siteId: "site_xxx",
//     chain: "arc-testnet",
//     hmacSecret: process.env.TOLLGATE_HMAC_SECRET!,
//     convexUrl: process.env.CONVEX_URL!,
//     convexSiteKey: process.env.TOLLGATE_SITE_KEY!,
//   }));

import type { Request, Response, NextFunction } from "express";
import { MiddlewareConfigSchema, runTollgate, type MiddlewareConfig } from "./core";

export function tollgate(input: Partial<MiddlewareConfig>) {
  const cfg = MiddlewareConfigSchema.parse(input);

  return async function tollgateHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const result = await runTollgate(cfg, {
      method: req.method,
      path: req.originalUrl || req.url,
      url: `${req.protocol}://${req.get("host")}${req.originalUrl || req.url}`,
      headerReceipt: headerString(req.headers["x-tollgate-receipt"]),
      headerPayment: headerString(req.headers["x-payment"]),
      headerBotClass: headerString(req.headers["x-bot-class"]),
      headerAgentWallet: headerString(req.headers["x-agent-wallet"]),
    });

    if (result.kind === "allow") {
      if (result.receiptToSet) {
        res.setHeader("x-tollgate-receipt-set", result.receiptToSet);
      }
      if (result.txHash) {
        res.setHeader("x-tollgate-tx", result.txHash);
      }
      (req as Request & { tollgate?: { tier: string; agent: string } }).tollgate = {
        tier: result.tier,
        agent: result.agentWallet,
      };
      next();
      return;
    }

    if (result.kind === "402") {
      for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v);
      res.status(result.status).json(result.body);
      return;
    }

    // fail
    res.status(result.status).json(result.body);
  };
}

function headerString(h: string | string[] | undefined): string | undefined {
  if (Array.isArray(h)) return h[0];
  return h;
}
