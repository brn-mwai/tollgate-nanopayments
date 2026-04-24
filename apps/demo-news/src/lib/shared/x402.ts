// 402 response builder + HMAC receipt sign/verify + nonce generator.
// OWNER: x402-protocol-agent (see .claude/agents/11-x402-protocol-agent.md).
// No other file may implement 402 semantics. Import from here.

import { RECEIPT_TTL_SEC, RECEIPT_VERSION } from "./constants";
import type { Response402, SupportedChain } from "./types";

export function build402Response(args: {
  priceUuUsdc: number;
  recipient: string;
  chain: SupportedChain;
  expiresInSec?: number;
  nonce?: string;
}): { status: 402; headers: Record<string, string>; body: Response402 } {
  const nonce = args.nonce ?? generateNonce();
  const ttl = args.expiresInSec ?? 120;
  const body: Response402 = {
    price: { uUsdc: args.priceUuUsdc },
    nonce,
    recipient: args.recipient,
    chain: args.chain,
    expires: Math.floor(Date.now() / 1000) + ttl,
  };
  return {
    status: 402,
    headers: {
      "content-type": "application/json",
      "x-tollgate-version": RECEIPT_VERSION,
      "cache-control": "no-store",
    },
    body,
  };
}

export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `n_${Date.now().toString(36)}_${toHex(bytes)}`;
}

// ── HMAC receipts ──────────────────────────────────────────────
// Format: v1.<base64url(payload)>.<hex(hmacSha256)>
// Payload: { site, agent, exp, tier }

export type ReceiptPayload = {
  site: string;
  agent: string;
  exp: number; // unix seconds
  tier: "free" | "pro" | "enterprise";
};

export async function issueReceipt(args: {
  secret: string;
  payload: Omit<ReceiptPayload, "exp"> & { ttlSec?: number };
}): Promise<string> {
  const payload: ReceiptPayload = {
    site: args.payload.site,
    agent: args.payload.agent,
    tier: args.payload.tier,
    exp: Math.floor(Date.now() / 1000) + (args.payload.ttlSec ?? RECEIPT_TTL_SEC),
  };
  const encoded = base64url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacHex(args.secret, encoded);
  return `${RECEIPT_VERSION}.${encoded}.${sig}`;
}

export type ReceiptVerifyResult =
  | { ok: true; payload: ReceiptPayload }
  | { ok: false; reason: string };

export async function verifyReceipt(
  receipt: string,
  secret: string,
): Promise<ReceiptVerifyResult> {
  const parts = receipt.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  const [version, encoded, sig] = parts as [string, string, string];
  if (version !== RECEIPT_VERSION) return { ok: false, reason: "bad version" };

  const expected = await hmacHex(secret, encoded);
  if (!constantTimeEqualHex(sig, expected)) return { ok: false, reason: "bad signature" };

  let payload: ReceiptPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(fromBase64url(encoded)));
  } catch {
    return { ok: false, reason: "bad payload" };
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) return { ok: false, reason: "expired" };
  return { ok: true, payload };
}

// ── HMAC primitives ────────────────────────────────────────────

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(new Uint8Array(sig));
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(s: string): Uint8Array {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
