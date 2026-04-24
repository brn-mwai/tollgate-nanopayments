import type { NextConfig } from "next";

const config: NextConfig = {
  // demo-news is a shared workspace consumer. Transpile the middleware +
  // shared packages so Next's bundler handles them during build.
  transpilePackages: ["@tollgate/middleware", "@tollgate/shared"],
};

export default config;
