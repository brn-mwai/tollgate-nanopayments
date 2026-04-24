// API key generation + hashing. Plaintext is returned once on creation and
// never stored. Verification hashes the incoming candidate and compares.
// Uses Web Crypto (SubtleCrypto) so it runs in Convex's V8 isolate.

const PREFIX_LIVE = "tg_live_";
const PREFIX_TEST = "tg_test_";

export async function generateApiKey(mode: "live" | "test" = "live"): Promise<{
  plaintext: string;
  hash: string;
  prefix: string;
}> {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const body = bytesToBase62(bytes);
  const prefix = mode === "live" ? PREFIX_LIVE : PREFIX_TEST;
  const plaintext = `${prefix}${body}`;
  const hash = await sha256Hex(plaintext);
  return { plaintext, hash, prefix: plaintext.slice(0, 12) };
}

export async function hashApiKey(plaintext: string): Promise<string> {
  return await sha256Hex(plaintext);
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bytesToBase62(bytes: Uint8Array): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  let out = "";
  while (n > 0n) {
    out = alphabet[Number(n % 62n)] + out;
    n /= 62n;
  }
  return out.padStart(32, "0");
}

export async function randomHex(byteLength: number): Promise<string> {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
