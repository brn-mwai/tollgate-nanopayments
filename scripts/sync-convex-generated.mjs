#!/usr/bin/env node
// Sync root convex/ → apps/dashboard/convex/ so the dashboard build has a
// local copy of every function module AND the generated types. Vercel
// deploys `apps/dashboard` as the root directory; parent dirs are not
// in the deployment tree, so we mirror convex into the subtree.

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const from = resolve(repoRoot, "convex");
const to = resolve(repoRoot, "apps", "dashboard", "convex");

if (!existsSync(from)) {
  console.error(`[sync-convex] source missing: ${from}`);
  process.exit(0);
}

function copyTree(src, dst) {
  if (!existsSync(dst)) mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src)) {
    if (entry === "tsconfig.json") continue;
    const sp = join(src, entry);
    const dp = join(dst, entry);
    if (statSync(sp).isDirectory()) copyTree(sp, dp);
    else copyFileSync(sp, dp);
  }
}

copyTree(from, to);
console.log(`[sync-convex] ${from} → ${to}`);
