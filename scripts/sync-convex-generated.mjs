#!/usr/bin/env node
// Sync root convex/_generated/ → apps/dashboard/convex/_generated/ so the
// dashboard build has up-to-date generated types. Run as a prebuild step
// on Vercel (where the parent convex/ dir is present in the clone but
// path aliases don't reach upward).

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const from = resolve(repoRoot, "convex", "_generated");
const to = resolve(repoRoot, "apps", "dashboard", "convex", "_generated");

if (!existsSync(from)) {
  console.error(`[sync-convex] source missing: ${from}`);
  process.exit(0); // non-fatal — allow builds when convex isn't being run here
}

function copyTree(src, dst) {
  if (!existsSync(dst)) mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src)) {
    const sp = join(src, entry);
    const dp = join(dst, entry);
    if (statSync(sp).isDirectory()) copyTree(sp, dp);
    else copyFileSync(sp, dp);
  }
}

copyTree(from, to);
console.log(`[sync-convex] ${from} → ${to}`);
