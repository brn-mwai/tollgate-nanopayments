#!/usr/bin/env node
// Creates the tollgate-publishers Circle Wallet Set.
// Uses CIRCLE_API_KEY + CIRCLE_ENTITY_SECRET from the env.

import { randomUUID, createPublicKey, publicEncrypt, constants } from "node:crypto";

const API_KEY = process.env.CIRCLE_API_KEY;
const ENTITY_SECRET_HEX = process.env.CIRCLE_ENTITY_SECRET;
const NAME = process.env.WALLET_SET_NAME ?? "tollgate-publishers";

if (!API_KEY || !ENTITY_SECRET_HEX) {
  console.error("CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET must both be set");
  process.exit(1);
}
if (ENTITY_SECRET_HEX.length !== 64) {
  console.error("CIRCLE_ENTITY_SECRET must be 64 hex chars");
  process.exit(1);
}

const API_BASE = "https://api.circle.com/v1/w3s";

async function encryptEntitySecret() {
  const res = await fetch(`${API_BASE}/config/entity/publicKey`, {
    headers: { authorization: `Bearer ${API_KEY}`, accept: "application/json" },
  });
  const json = await res.json();
  const pem = json?.data?.publicKey;
  if (!pem) throw new Error("missing public key");
  const key = createPublicKey(pem);
  const secretBytes = Buffer.from(ENTITY_SECRET_HEX, "hex");
  const encrypted = publicEncrypt(
    { key, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    secretBytes,
  );
  return encrypted.toString("base64");
}

async function main() {
  const ciphertext = await encryptEntitySecret();
  const body = {
    idempotencyKey: randomUUID(),
    entitySecretCiphertext: ciphertext,
    name: NAME,
  };
  const res = await fetch(`${API_BASE}/developer/walletSets`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("Circle error:", JSON.stringify(json, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(json, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
