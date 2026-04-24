import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["convex"],
  // Pin the workspace root to the monorepo root so standalone traces
  // include `../../convex/_generated/*` which is path-aliased as `@convex/*`.
  // Without this, Vercel's Next build reports "Module not found" for the
  // alias because file tracing stays scoped to apps/dashboard.
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  turbopack: {
    root: path.resolve(process.cwd(), "../.."),
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
