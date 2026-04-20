// Circle Wallets client. OWNER: circle-integration-agent.
// No other file calls api.circle.com directly; always import from here.

const BASE = "https://api.circle.com";

export type CircleAuth = {
  apiKey: string;
  entitySecretCiphertext?: string; // required for write operations
  walletSetId?: string;
};

export async function provisionWallet(args: {
  auth: CircleAuth;
  blockchain: "ARC" | "ARC-TESTNET";
  idempotencyKey: string;
}): Promise<{ walletId: string; address: string }> {
  const res = await circleFetch("/v1/w3s/developer/wallets", {
    method: "POST",
    auth: args.auth,
    body: {
      idempotencyKey: args.idempotencyKey,
      entitySecretCiphertext: args.auth.entitySecretCiphertext,
      walletSetId: args.auth.walletSetId,
      blockchains: [args.blockchain],
      count: 1,
    },
  });
  const wallet = (res.data?.wallets ?? [])[0];
  if (!wallet) throw new Error("circle: no wallet in response");
  return { walletId: wallet.id, address: wallet.address };
}

export async function getBalances(args: {
  auth: CircleAuth;
  walletId: string;
}): Promise<Array<{ amount: string; tokenId: string; blockchain: string }>> {
  const res = await circleFetch(`/v1/w3s/wallets/${args.walletId}/balances`, {
    method: "GET",
    auth: args.auth,
  });
  return res.data?.tokenBalances ?? [];
}

export async function transfer(args: {
  auth: CircleAuth;
  walletId: string;
  destination: string;
  amountUuUsdc: string;
  tokenId: string;
  idempotencyKey: string;
}): Promise<{ circleTxId: string; state: string }> {
  const res = await circleFetch("/v1/w3s/developer/transactions/transfer", {
    method: "POST",
    auth: args.auth,
    body: {
      idempotencyKey: args.idempotencyKey,
      entitySecretCiphertext: args.auth.entitySecretCiphertext,
      walletId: args.walletId,
      destinationAddress: args.destination,
      tokenId: args.tokenId,
      amounts: [args.amountUuUsdc],
      feeLevel: "MEDIUM",
    },
  });
  return { circleTxId: res.data?.id, state: res.data?.state };
}

// ── Webhook verification ──

export async function verifyWebhook(args: {
  body: string;
  signature: string;
  publicKeyPem: string;
}): Promise<boolean> {
  // Circle signs webhook bodies with ECDSA P-256. We import the public key
  // from the pem and verify the signature over the raw body.
  try {
    const key = await importPublicKey(args.publicKeyPem);
    const sig = Uint8Array.from(atob(args.signature), (c) => c.charCodeAt(0));
    const data = new TextEncoder().encode(args.body);
    return await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, sig, data);
  } catch {
    return false;
  }
}

async function importPublicKey(pem: string) {
  const cleaned = pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "").replace(/\s+/g, "");
  const bin = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "spki",
    bin,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );
}

// ── Internal: fetch with auth + error handling ──

async function circleFetch(
  path: string,
  opts: { method: "GET" | "POST"; auth: CircleAuth; body?: unknown },
): Promise<Record<string, unknown> & { data?: any }> {
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${opts.auth.apiKey}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`circle ${opts.method} ${path} ${res.status}: ${await res.text()}`);
  }
  return await res.json();
}
