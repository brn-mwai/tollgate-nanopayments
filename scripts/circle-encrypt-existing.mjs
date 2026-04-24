#!/usr/bin/env node
// Re-encrypts an EXISTING entity secret hex for the Circle Console.
// Unlike circle-entity-secret.mjs which generates a new secret, this reuses
// the hex we already registered. OAEP padding is randomised, so each run
// produces a different ciphertext that decrypts to the same 32 bytes.
//
// Usage:
//   CIRCLE_API_KEY=... CIRCLE_ENTITY_SECRET=<hex> node scripts/circle-encrypt-existing.mjs

import { createPublicKey, publicEncrypt, constants } from "node:crypto";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const API_KEY = process.env.CIRCLE_API_KEY;
const HEX = process.env.CIRCLE_ENTITY_SECRET;
const OUT = process.env.OUT ?? "circle-ciphertext.txt";

if (!API_KEY || !HEX) {
  console.error("CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET env vars required");
  process.exit(1);
}
if (HEX.length !== 64) {
  console.error("CIRCLE_ENTITY_SECRET must be 64 hex chars");
  process.exit(1);
}

const res = await fetch("https://api.circle.com/v1/w3s/config/entity/publicKey", {
  headers: { authorization: `Bearer ${API_KEY}`, accept: "application/json" },
});
if (!res.ok) {
  console.error(`publicKey fetch failed: ${res.status}`);
  process.exit(1);
}
const { data } = await res.json();
const pem = data?.publicKey;
if (!pem) { console.error("no public key in response"); process.exit(1); }

const key = createPublicKey(pem);
const secretBytes = Buffer.from(HEX, "hex");
const encrypted = publicEncrypt(
  { key, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
  secretBytes,
);
const ciphertext = encrypted.toString("base64");

const outPath = resolve(process.cwd(), OUT);
writeFileSync(outPath, ciphertext, "utf8");

console.log(`wrote ${outPath}`);
console.log(`length: ${ciphertext.length} (must be 684)`);
