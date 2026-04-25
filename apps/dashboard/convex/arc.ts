// Arc Sepolia settle leg.
//
// Mirrors every Circle Wallet settle (which is forced onto BASE-SEPOLIA
// because Circle Wallets does not yet expose ARC-SEPOLIA in their
// blockchain enum) with a real ERC-20 USDC transfer on Arc Sepolia from
// our operator hot wallet. Lets the demo show on-chain settlement on
// testnet.arcscan.app — the actual Arc Block Explorer the hackathon
// requires — without waiting for Circle to ship the enum value.
//
// Operator wallet must hold USDC on Arc Sepolia (gas is paid in USDC on
// Arc). Fund via faucet.circle.com → Arc Testnet → paste the
// TOLLGATE_ARC_OPERATOR_ADDRESS value.

"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { createWalletClient, createPublicClient, http, encodeFunctionData, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";

const ARC_SEPOLIA = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
    public: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
} as const;

const ERC20_TRANSFER_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// Send a USDC ERC-20 transfer on Arc Sepolia from the operator hot wallet
// to an arbitrary destination address. Amount is the human-decimal USDC
// amount (e.g. "0.001"). Returns the on-chain tx hash, suitable for a
// testnet.arcscan.app/tx/{hash} URL.
export const transferUsdc = internalAction({
  args: {
    destinationAddress: v.string(),
    amountUsdc: v.string(),
  },
  handler: async (
    _ctx,
    { destinationAddress, amountUsdc },
  ): Promise<{ ok: boolean; txHash?: string; reason?: string }> => {
    const operatorKey = process.env.TOLLGATE_ARC_OPERATOR_KEY as Hex | undefined;
    const usdcAddress = process.env.TOLLGATE_ARC_USDC as Hex | undefined;
    const rpcUrl = process.env.TOLLGATE_ARC_RPC ?? "https://rpc.testnet.arc.network";
    if (!operatorKey || !usdcAddress) {
      return { ok: false, reason: "arc_env_missing" };
    }

    const account = privateKeyToAccount(operatorKey);
    const client = createWalletClient({
      account,
      chain: ARC_SEPOLIA,
      transport: http(rpcUrl),
    });

    const amount = parseUnits(amountUsdc, 6);
    const data = encodeFunctionData({
      abi: ERC20_TRANSFER_ABI,
      functionName: "transfer",
      args: [destinationAddress as Hex, amount],
    });

    try {
      const txHash = await client.sendTransaction({
        to: usdcAddress,
        data,
        value: 0n,
      });
      return { ok: true, txHash };
    } catch (err) {
      return {
        ok: false,
        reason: err instanceof Error ? err.message.slice(0, 200) : "send_failed",
      };
    }
  },
});

// Read-only: USDC balance of the operator wallet on Arc Sepolia. Used by
// dev:arcStatus + the smoke test before recording so we can confirm the
// operator is funded.
export const operatorBalance = internalAction({
  args: {},
  handler: async (): Promise<{ usdc: string; address: string | null }> => {
    const operatorAddr = process.env.TOLLGATE_ARC_OPERATOR_ADDRESS;
    const usdcAddress = process.env.TOLLGATE_ARC_USDC as Hex | undefined;
    const rpcUrl = process.env.TOLLGATE_ARC_RPC ?? "https://rpc.testnet.arc.network";
    if (!operatorAddr || !usdcAddress) return { usdc: "0", address: null };

    const client = createPublicClient({
      chain: ARC_SEPOLIA,
      transport: http(rpcUrl),
    });
    const balance = await client.readContract({
      address: usdcAddress,
      abi: [
        {
          type: "function",
          name: "balanceOf",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "", type: "uint256" }],
        },
      ] as const,
      functionName: "balanceOf",
      args: [operatorAddr as Hex],
    });
    const human = (Number(balance) / 1_000_000).toFixed(6);
    return { usdc: human, address: operatorAddr };
  },
});
