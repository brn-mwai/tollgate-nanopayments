// Fail-fast env validation. Imported by server-only code.
// Client-side env reads NEXT_PUBLIC_* directly via process.env.

import { z } from "zod";

const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  CONVEX_DEPLOY_KEY: z.string().optional(),

  ARC_RPC_URL: z.string().url().optional(),
  ARC_CHAIN_ID: z.string().optional(),
  ARC_EXPLORER_URL: z.string().url().optional(),
  ARC_USDC_CONTRACT: z.string().optional(),

  CIRCLE_API_KEY: z.string().optional(),
  CIRCLE_ENTITY_SECRET: z.string().optional(),
  CIRCLE_WALLET_SET_ID: z.string().optional(),

  X402_FACILITATOR_URL: z.string().url().optional(),
  X402_FACILITATOR_NETWORK: z.string().optional(),

  TOLLGATE_HMAC_SECRET: z.string().min(32).optional(),
  AISA_API_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CONVEX_URL: z.string().url(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

let cachedServer: ServerEnv | null = null;
let cachedClient: ClientEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cachedServer) return cachedServer;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid server env:\n${issues}`);
  }
  cachedServer = parsed.data;
  return cachedServer;
}

export function clientEnv(): ClientEnv {
  if (cachedClient) return cachedClient;
  const source = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  };
  const parsed = clientSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid client env:\n${issues}`);
  }
  cachedClient = parsed.data;
  return cachedClient;
}
