"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowSquareOut, Copy, ArrowClockwise } from "@phosphor-icons/react";
import { uUsdcToUsd } from "@/lib/format";
import { ChainIcon } from "@/components/chain-icon";

// Base Sepolia explorer — our Circle blockchain default is BASE-SEPOLIA.
// When Circle enables ARC-SEPOLIA on Wallets, swap to testnet.arcscan.app.
const EXPLORER = "https://sepolia.basescan.org";

export default function WalletPage() {
  const wallet = useQuery(api.wallets.get);
  const provision = useAction(api.wallets.provision);
  const refresh = useAction(api.wallets.balance);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function onProvision() {
    setBusy(true);
    try {
      await provision();
    } finally {
      setBusy(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } catch (e) {
      console.error("balance refresh failed", e);
    } finally {
      setRefreshing(false);
    }
  }

  // Auto-refresh balance when the wallet page first loads with a provisioned
  // wallet. Avoids the "I faucet-dripped but nothing shows" moment.
  useEffect(() => {
    if (wallet?.walletId && !refreshing) {
      onRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.walletId]);

  return (
    <div>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 28, flexWrap: "wrap" }}
      >
        <div>
          <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, marginBottom: 4, fontWeight: 400 }}>
            Wallet
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Circle-custodied programmable wallet on Arc · zero key management
          </p>
        </div>
        {wallet?.address && (
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" style={ghostBtn} onClick={onRefresh} disabled={refreshing}>
              <ArrowClockwise size={15} className={refreshing ? "spin" : undefined} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <a
              href={`${EXPLORER}/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              style={ghostBtn}
            >
              <ArrowSquareOut size={15} /> Explorer
            </a>
            <Link href="/app/withdrawals" style={primaryBtn}>
              <ArrowUpRight size={15} /> Withdraw
            </Link>
          </div>
        )}
      </div>

      {wallet === undefined && <Hint text="Loading..." />}

      {wallet && !wallet.address && (
        <div style={heroStyle}>
          <div style={kickerStyle}>Not provisioned</div>
          <div style={headlineStyle}>
            Set up your Circle Wallet on Arc in one click.
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55, marginBottom: 16 }}>
            A Circle-custodied wallet is created on Arc testnet. Zero key management. You'll receive
            payments from AI agents and can off-ramp via CCTP any time.
          </div>
          <button type="button" style={primaryBtn} onClick={onProvision} disabled={busy}>
            {busy ? "Provisioning..." : "Provision wallet"}
          </button>
        </div>
      )}

      {wallet?.address && (
        <>
          <div style={heroStyle}>
            <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Available balance
            </div>
            <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 56, lineHeight: 1, marginBottom: 10 }}>
              {uUsdcToUsd(wallet.cachedBalanceUuUsdc)}
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12,
                color: "var(--text-2)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {wallet.cachedBalanceUuUsdc} uUSDC <span style={{ opacity: 0.4 }}>·</span>
              <ChainIcon chain="arc-testnet" size={14} /> Arc testnet
            </div>
            <AddressRow label="Address" value={wallet.address} />
            {wallet.walletId && <AddressRow label="Circle ID" value={wallet.walletId} />}
          </div>
        </>
      )}
    </div>
  );
}

function AddressRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        marginTop: 14,
        borderRadius: 8,
        border: "1px solid var(--border-s)",
        background: "var(--bg-sub)",
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          minWidth: 64,
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 12.5,
          color: "var(--arc-bright)",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(value)}
        style={copyBtn}
        title="Copy"
      >
        <Copy size={13} />
      </button>
    </div>
  );
}

const heroStyle = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "32px",
  background: "var(--bg-card)",
  marginBottom: 16,
  position: "relative" as const,
  overflow: "hidden" as const,
};
const kickerStyle = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 10.5,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "var(--pink-bright)",
  marginBottom: 8,
};
const headlineStyle = {
  fontFamily: "Instrument Serif, serif",
  fontSize: 26,
  lineHeight: 1.1,
  marginBottom: 10,
};
const primaryBtn = {
  display: "inline-flex",
  alignItems: "center" as const,
  gap: 6,
  padding: "8px 16px",
  fontSize: 13,
  fontWeight: 600,
  color: "#FFFFFF",
  background: "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
  border: "1px solid #B3007D",
  borderRadius: 6,
  cursor: "pointer",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 1px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.20)",
  textShadow: "0 1px 0 rgba(0,0,0,0.2)",
  fontFamily: "inherit",
};
const ghostBtn = {
  display: "inline-flex",
  alignItems: "center" as const,
  gap: 6,
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text-2)",
  background: "var(--bg-shell)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: "inherit",
};
const copyBtn = {
  width: 28,
  height: 28,
  display: "inline-flex",
  alignItems: "center" as const,
  justifyContent: "center" as const,
  background: "none",
  border: "1px solid var(--border-s)",
  color: "var(--text-3)",
  cursor: "pointer",
  borderRadius: 5,
};

function Hint({ text }: { text: string }) {
  return (
    <div
      style={{
        border: "1px dashed var(--border)",
        borderRadius: 10,
        padding: "60px 24px",
        textAlign: "center",
        color: "var(--text-3)",
        fontSize: 13,
      }}
    >
      {text}
    </div>
  );
}
