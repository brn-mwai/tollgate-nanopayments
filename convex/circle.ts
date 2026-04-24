// Circle Programmable Wallets client. Node-runtime only (RSA ciphertext +
// fetch). Exposed as internal actions so wallets.ts can call them via
// ctx.runAction without pulling the Node runtime into its own file.
//
// Docs: https://developers.circle.com/w3s/developer-controlled-create-your-first-wallet
//
// Every mutating request needs a fresh RSA-OAEP-SHA256 ciphertext of the
// plaintext entity secret. We fetch Circle's public key per-request (cached
// 5 min) and encrypt locally. Plaintext never leaves this process.

"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { randomUUID, createPublicKey, publicEncrypt, constants } from "node:crypto";

const API_BASE = "https://api.circle.com/v1/w3s";
const PUBLIC_KEY_TTL_MS = 5 * 60_000;

type PublicKeyCache = { pem: string; fetchedAt: number };
let publicKeyCache: PublicKeyCache | null = null;

export const createWallet = internalAction({
  args: { blockchain: v.string(), refId: v.optional(v.string()) },
  handler: async (_ctx, { blockchain, refId }): Promise<{ id: string; address: string }> => {
    const { apiKey, walletSetId, entitySecret } = readEnv();
    const ciphertext = encryptEntitySecret(entitySecret, await getPublicKeyPem(apiKey));

    const body = {
      idempotencyKey: randomUUID(),
      entitySecretCiphertext: ciphertext,
      walletSetId,
      blockchains: [blockchain],
      count: 1,
      accountType: "EOA",
      ...(refId ? { refId } : {}),
    };

    const res = await circleFetch("/developer/wallets", {
      method: "POST",
      apiKey,
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { data?: { wallets?: Array<{ id: string; address: string }> } };
    const wallet = json.data?.wallets?.[0];
    if (!wallet) throw new Error("Circle returned no wallet");
    return { id: wallet.id, address: wallet.address };
  },
});

// USDC transfer from a publisher-owned Circle Wallet to an arbitrary
// destination address. Used by withdrawals.execute. Idempotency key is the
// withdrawal id so replaying the action is safe.
// Docs: https://developers.circle.com/w3s/reference/createdevelopertransaction
export const createTransfer = internalAction({
  args: {
    fromWalletId: v.string(),
    destinationAddress: v.string(),
    amountUsdc: v.string(), // human amount e.g. "1.23" — Circle expects decimal
    tokenId: v.optional(v.string()),
    idempotencyKey: v.string(),
  },
  handler: async (
    _ctx,
    { fromWalletId, destinationAddress, amountUsdc, tokenId, idempotencyKey },
  ): Promise<{ id: string; state: string }> => {
    const { apiKey, entitySecret } = readEnv();
    const ciphertext = encryptEntitySecret(entitySecret, await getPublicKeyPem(apiKey));

    const body: Record<string, unknown> = {
      idempotencyKey,
      entitySecretCiphertext: ciphertext,
      amounts: [amountUsdc],
      destinationAddress,
      walletId: fromWalletId,
      feeLevel: "MEDIUM",
    };
    if (tokenId) body.tokenId = tokenId;

    const res = await circleFetch("/developer/transactions/transfer", {
      method: "POST",
      apiKey,
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      data?: { id?: string; state?: string };
    };
    const id = json.data?.id;
    if (!id) throw new Error("Circle returned no transaction id");
    return { id, state: json.data?.state ?? "INITIATED" };
  },
});

// Fetch a single Circle transaction by UUID. Used by the reconciliation
// action to backfill onchain txHashes on settled quotes.
export const getTransaction = internalAction({
  args: { id: v.string() },
  handler: async (_ctx, { id }): Promise<{ state: string; txHash: string | null } | null> => {
    const { apiKey } = readEnv();
    try {
      const res = await circleFetch(`/transactions/${encodeURIComponent(id)}`, {
        method: "GET",
        apiKey,
      });
      const json = (await res.json()) as {
        data?: { transaction?: { state?: string; txHash?: string } };
      };
      const tx = json.data?.transaction;
      if (!tx) return null;
      return { state: tx.state ?? "unknown", txHash: tx.txHash ?? null };
    } catch {
      return null;
    }
  },
});

export const getUsdcBalance = internalAction({
  args: { walletId: v.string(), usdcTokenAddress: v.optional(v.string()) },
  handler: async (_ctx, { walletId, usdcTokenAddress }): Promise<string> => {
    const { apiKey } = readEnv();
    const res = await circleFetch(`/wallets/${encodeURIComponent(walletId)}/balances`, {
      method: "GET",
      apiKey,
    });
    const json = (await res.json()) as {
      data?: {
        tokenBalances?: Array<{ token: { symbol: string; tokenAddress?: string }; amount: string }>;
      };
    };
    const balances = json.data?.tokenBalances ?? [];
    const match = balances.find((b) =>
      usdcTokenAddress
        ? b.token.tokenAddress?.toLowerCase() === usdcTokenAddress.toLowerCase()
        : b.token.symbol === "USDC",
    );
    if (!match) return "0";
    return String(Math.round(Number(match.amount) * 1_000_000));
  },
});

// Looks up the USDC tokenId for a given wallet by reading its balance sheet.
// Circle's transfer API needs an explicit tokenId; we derive it on each call
// rather than maintaining a per-chain map so it stays correct when we add
// chains. Returns null if the wallet has no USDC token entry (typically
// because it has never received or been funded with USDC).
export const getUsdcTokenId = internalAction({
  args: { walletId: v.string() },
  handler: async (_ctx, { walletId }): Promise<string | null> => {
    const { apiKey } = readEnv();
    const res = await circleFetch(`/wallets/${encodeURIComponent(walletId)}/balances`, {
      method: "GET",
      apiKey,
    });
    const json = (await res.json()) as {
      data?: {
        tokenBalances?: Array<{ token: { id?: string; symbol: string } }>;
      };
    };
    const match = json.data?.tokenBalances?.find((b) => b.token.symbol === "USDC");
    return match?.token.id ?? null;
  },
});

// ───────── internals ─────────

async function circleFetch(
  path: string,
  init: { method: "GET" | "POST"; apiKey: string; body?: string },
): Promise<Response> {
  const res = await fetch(API_BASE + path, {
    method: init.method,
    headers: {
      authorization: `Bearer ${init.apiKey}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: init.body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Circle ${init.method} ${path} ${res.status}: ${truncate(text, 200)}`);
  }
  return res;
}

function readEnv(): { apiKey: string; entitySecret: string; walletSetId: string } {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
  if (!apiKey) throw new Error("CIRCLE_API_KEY missing");
  if (!entitySecret) throw new Error("CIRCLE_ENTITY_SECRET missing");
  if (!walletSetId) throw new Error("CIRCLE_WALLET_SET_ID missing");
  return { apiKey, entitySecret, walletSetId };
}

function encryptEntitySecret(entitySecretHex: string, pem: string): string {
  const key = createPublicKey(pem);
  const plaintext = Buffer.from(entitySecretHex, "hex");
  if (plaintext.length !== 32) {
    throw new Error("CIRCLE_ENTITY_SECRET must be 32 bytes (64 hex chars)");
  }
  const encrypted = publicEncrypt(
    { key, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    plaintext,
  );
  return encrypted.toString("base64");
}

async function getPublicKeyPem(apiKey: string): Promise<string> {
  const now = Date.now();
  if (publicKeyCache && now - publicKeyCache.fetchedAt < PUBLIC_KEY_TTL_MS) {
    return publicKeyCache.pem;
  }
  const res = await circleFetch("/config/entity/publicKey", { method: "GET", apiKey });
  const json = (await res.json()) as { data?: { publicKey?: string } };
  const pem = json.data?.publicKey;
  if (!pem) throw new Error("Circle public key missing from response");
  publicKeyCache = { pem, fetchedAt: now };
  return pem;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
