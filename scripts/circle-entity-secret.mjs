#!/usr/bin/env node
// One-shot Circle Entity Secret bootstrapper.
//
// Generates a fresh 32-byte secret, fetches Circle's public key using
// CIRCLE_API_KEY, encrypts the secret with RSA-OAEP-SHA256, and prints the
// two values you need:
//   - The plaintext hex (64 chars) → paste into Convex env CIRCLE_ENTITY_SECRET
//   - The base64 ciphertext       → paste into the Circle Console "Reset Entity
//                                      Secret" dialog
//
// Usage:
//   CIRCLE_API_KEY=TEST_API_KEY:xxxx node scripts/circle-entity-secret.mjs
//
// Safety:
//   - The plaintext hex ONLY prints to stdout. Copy it and close your terminal.
//   - Also write it to a password manager IMMEDIATELY; if you lose it, every
//     wallet owned by that secret becomes unrecoverable.
//   - The recovery file Circle offers in their UI is an alternative backup.

import { randomBytes, createPublicKey, publicEncrypt, constants } from "node:crypto";

const API_KEY = process.env.CIRCLE_API_KEY;
if (!API_KEY) {
  console.error("CIRCLE_API_KEY env var missing. Run with:");
  console.error("  CIRCLE_API_KEY=TEST_API_KEY:... node scripts/circle-entity-secret.mjs");
  process.exit(1);
}

const API_BASE = "https://api.circle.com/v1/w3s";

async function main() {
  // 1. Generate a fresh 32-byte secret.
  const secretBytes = randomBytes(32);
  const secretHex = secretBytes.toString("hex");

  // 2. Fetch Circle's public key.
  const res = await fetch(`${API_BASE}/config/entity/publicKey`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${API_KEY}`,
      accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Circle returned ${res.status}: ${text}`);
  }
  const json = await res.json();
  const pem = json?.data?.publicKey;
  if (!pem) throw new Error("Circle response missing data.publicKey");

  // 3. Encrypt the 32-byte secret with RSA-OAEP-SHA256.
  const key = createPublicKey(pem);
  const encrypted = publicEncrypt(
    { key, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    secretBytes,
  );
  const ciphertextB64 = encrypted.toString("base64");

  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(" Circle Entity Secret generated.");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("");
  console.log("1) Paste into Convex env CIRCLE_ENTITY_SECRET:");
  console.log("");
  console.log("   " + secretHex);
  console.log("");
  console.log("2) Paste into Circle Console 'Reset Entity Secret' dialog:");
  console.log("");
  console.log("   " + ciphertextB64);
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(" SAVE the plaintext hex to a password manager NOW.");
  console.log(" Losing it means every wallet owned by this secret is gone.");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("");
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
