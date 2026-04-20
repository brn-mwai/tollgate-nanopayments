import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["convex"],
  turbopack: {
    // Pin the workspace root to the monorepo root so Turbopack doesn't
    // surface lockfiles from parent directories. Uses process.cwd() which
    // is apps/dashboard when `next dev` runs.
    root: path.resolve(process.cwd(), "../.."),
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
