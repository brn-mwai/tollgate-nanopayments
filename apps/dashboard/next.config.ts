import type { NextConfig } from "next";
import path from "node:path";

const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["convex"],
  // On Vercel the deployment tree is scoped to apps/dashboard; convex is
  // synced locally via the prebuild script so no upward tracing is needed.
  // Locally we keep the tracing root at the monorepo root for a cleaner
  // turbopack workspace scan.
  ...(isVercel
    ? {}
    : {
        outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
      }),
  turbopack: {
    root: isVercel ? process.cwd() : path.resolve(process.cwd(), "../.."),
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
