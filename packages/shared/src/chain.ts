// Arc RPC client. OWNER: arc-chain-agent.
// No other file in the repo calls Arc RPC directly; always import from here.

import { createPublicClient, createWalletClient, http, defineChain, parseAbi, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export function arcChain(args: { chainId: number; rpcUrl: string }) {
  return defineChain({
    id: args.chainId,
    name: "Arc",
    nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
    rpcUrls: { default: { http: [args.rpcUrl] } },
  });
}

export function publicClient(args: { chainId: number; rpcUrl: string }) {
  return createPublicClient({
    chain: arcChain(args),
    transport: http(args.rpcUrl, { retryCount: 3, timeout: 5000 }),
  });
}

export function walletClientFromPrivateKey(args: {
  chainId: number;
  rpcUrl: string;
  privateKey: Hex;
}) {
  return createWalletClient({
    account: privateKeyToAccount(args.privateKey),
    chain: arcChain(args),
    transport: http(args.rpcUrl, { retryCount: 3, timeout: 5000 }),
  });
}

// Minimal ERC-20 ABI for USDC transfers + balance reads.
export const usdcAbi = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
]);

// ERC-8004 reputation — minimal surface we call.
export const reputationAbi = parseAbi([
  "function setScores(address[] wallets, uint256[] scores)",
  "function scoreOf(address wallet) view returns (uint256)",
]);

export async function readTx(args: {
  chainId: number;
  rpcUrl: string;
  hash: Hex;
}) {
  const client = publicClient(args);
  const receipt = await client.getTransactionReceipt({ hash: args.hash });
  const tx = await client.getTransaction({ hash: args.hash });
  return { receipt, tx };
}
