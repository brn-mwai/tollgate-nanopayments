// Single source of truth for explorer + chain URLs. All rows rendering a tx
// hash must link via these helpers so the "verify on Arc" judge path stays
// consistent across pages.

const ARC_TESTNET_EXPLORER = "https://testnet.arcscan.app";

export function arcTxUrl(hash?: string | null): string | null {
  if (!hash) return null;
  if (!/^0x[a-fA-F0-9]{8,}$/.test(hash)) return null;
  return `${ARC_TESTNET_EXPLORER}/tx/${hash}`;
}

export function arcAddressUrl(addr?: string | null): string | null {
  if (!addr) return null;
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return null;
  return `${ARC_TESTNET_EXPLORER}/address/${addr}`;
}

export const CIRCLE_DOCS = "https://developers.circle.com/w3s";
export const ARC_DOCS = "https://docs.arc.network";
export const X402_SPEC = "https://github.com/coinbase/x402";
export const GEMINI_DOCS = "https://ai.google.dev/gemini-api/docs/function-calling";
