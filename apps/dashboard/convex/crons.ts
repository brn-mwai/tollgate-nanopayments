// Scheduled background jobs per ARCHITECTURE.pdf Section 5.2.
// All work goes through internal functions; cron entries are thin triggers.

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Hourly: aggregate last hour of events into hourlyRollup per site.
crons.cron("rollup-hourly", "5 * * * *", internal.hourlyRollup.rollOne);

// Daily at 00:00 UTC: reputation EMA + batched ERC-8004 push.
crons.daily(
  "reputation-roll",
  { hourUTC: 0, minuteUTC: 0 },
  internal.reputation.rollDaily,
);

// Every 10 minutes: trim nonceLog older than 24h. Nonce window at the edge is
// 1 minute; Convex retains 24h for audit before cron trims.
crons.cron("cleanup-nonces", "*/10 * * * *", internal.nonces.cleanup);

// Every 5 minutes: Gemini 3 Pro scans recent agent activity for abuse patterns
// and adjusts reputation scores. No-op when GEMINI_API_KEY is unset.
crons.cron("gemini-abuse-review", "*/5 * * * *", internal.gemini.reviewAbuse);

// Every minute: backfill onchain txHash for any settled quote whose Circle
// webhook hasn't landed. Without this the dashboard event stream shows the
// Circle UUID but not the basescan link until manual reconcile is run.
crons.cron("reconcile-settlements", "* * * * *", internal.quotes.reconcileSettlements, {
  limit: 50,
});

export default crons;
