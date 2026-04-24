#!/usr/bin/env node
// Sends USDC from the publisher's Circle wallet to the bot-simulator's
// agent wallet so the agent can sign valid EIP-3009 TransferWithAuth.
// One-shot bootstrap for the demo.

import { randomUUID, createPublicKey, publicEncrypt, constants } from "node:crypto";

const API = "https://api.circle.com/v1/w3s";
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY;
const CIRCLE_ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET;
const FROM_WALLET_ID = process.env.FROM_WALLET_ID;
const TO_ADDRESS = process.env.TO_ADDRESS;
const AMOUNT = process.env.AMOUNT ?? "5";

for (const [name, val] of Object.entries({ CIRCLE_API_KEY, CIRCLE_ENTITY_SECRET, FROM_WALLET_ID, TO_ADDRESS })) {
  if (!val) { console.error(`missing ${name}`); process.exit(1); }
}

async function encryptSecret() {
  const r = await fetch(`${API}/config/entity/publicKey`, {
    headers: { authorization: `Bearer ${CIRCLE_API_KEY}` },
  });
  const { data } = await r.json();
  const key = createPublicKey(data.publicKey);
  const enc = publicEncrypt(
    { key, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    Buffer.from(CIRCLE_ENTITY_SECRET, "hex"),
  );
  return enc.toString("base64");
}

async function usdcTokenId() {
  const r = await fetch(`${API}/wallets/${FROM_WALLET_ID}/balances`, {
    headers: { authorization: `Bearer ${CIRCLE_API_KEY}` },
  });
  const { data } = await r.json();
  const usdc = (data?.tokenBalances ?? []).find((b) => b.token.symbol === "USDC");
  if (!usdc) throw new Error("publisher wallet has no USDC token entry");
  return usdc.token.id;
}

async function main() {
  const [ciphertext, tokenId] = await Promise.all([encryptSecret(), usdcTokenId()]);
  const body = {
    idempotencyKey: randomUUID(),
    entitySecretCiphertext: ciphertext,
    amounts: [AMOUNT],
    destinationAddress: TO_ADDRESS,
    walletId: FROM_WALLET_ID,
    tokenId,
    feeLevel: "MEDIUM",
  };
  const r = await fetch(`${API}/developer/transactions/transfer`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${CIRCLE_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await r.json();
  console.log(JSON.stringify(json, null, 2));
}

main().catch((e) => { console.error(e.message); process.exit(1); });
