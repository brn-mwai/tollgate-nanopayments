#!/usr/bin/env node
// Provision a second Circle Wallet under the existing wallet set, to act
// as the "bot fleet" treasury. Per-request settlement flows from this wallet
// → the publisher's wallet, mirroring how a real x402 agent operator would
// pay a publisher.
//
// Usage:
//   CIRCLE_API_KEY=TEST_API_KEY:... CIRCLE_ENTITY_SECRET=<hex> \
//     CIRCLE_WALLET_SET_ID=<uuid> node scripts/circle-create-bot-wallet.mjs

import { randomUUID, createPublicKey, publicEncrypt, constants } from "node:crypto";

const API = "https://api.circle.com/v1/w3s";
const apiKey = process.env.CIRCLE_API_KEY;
const entitySecretHex = process.env.CIRCLE_ENTITY_SECRET;
const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
const blockchain = process.env.CIRCLE_BLOCKCHAIN ?? "BASE-SEPOLIA";

for (const [name, val] of Object.entries({
  CIRCLE_API_KEY: apiKey,
  CIRCLE_ENTITY_SECRET: entitySecretHex,
  CIRCLE_WALLET_SET_ID: walletSetId,
})) {
  if (!val) {
    console.error(`missing ${name}`);
    process.exit(1);
  }
}

async function encryptSecret() {
  const r = await fetch(`${API}/config/entity/publicKey`, {
    headers: { authorization: `Bearer ${apiKey}` },
  });
  const { data } = await r.json();
  const key = createPublicKey(data.publicKey);
  const enc = publicEncrypt(
    { key, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    Buffer.from(entitySecretHex, "hex"),
  );
  return enc.toString("base64");
}

async function main() {
  const ciphertext = await encryptSecret();
  const body = {
    idempotencyKey: randomUUID(),
    entitySecretCiphertext: ciphertext,
    walletSetId,
    blockchains: [blockchain],
    count: 1,
    accountType: "EOA",
    refId: "tollgate-bot-fleet",
  };
  const r = await fetch(`${API}/developer/wallets`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await r.json();
  console.log(JSON.stringify(json, null, 2));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
