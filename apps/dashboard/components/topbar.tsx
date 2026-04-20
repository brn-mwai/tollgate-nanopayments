"use client";

import { usePathname } from "next/navigation";
import { MagnifyingGlass, Sparkle, SidebarSimple } from "@phosphor-icons/react";
import { ChainIcon } from "./chain-icon";

const TITLES: Record<string, string> = {
  "/app": "Overview",
  "/app/sites": "Sites",
  "/app/events": "Events",
  "/app/wallet": "Wallet",
  "/app/withdrawals": "Withdrawals",
  "/app/agents": "Agents",
  "/app/install": "Install SDK",
  "/app/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Overview";

  return (
    <div
      style={{
        height: 52,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        flexShrink: 0,
        gap: 0,
      }}
    >
      <button
        type="button"
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          background: "none",
          color: "var(--text-2)",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <SidebarSimple size={17} />
      </button>
      <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 12px", flexShrink: 0 }} />
      <div style={{ fontSize: 13, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "var(--text-1)", fontWeight: 500 }}>{title}</span>
      </div>
      <span
        className="pill pill-arc badge-3d"
        style={{ marginLeft: 10, display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <ChainIcon chain="arc-testnet" size={14} />
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--green)",
            boxShadow: "0 0 6px var(--green)",
          }}
        />
        Arc Testnet
      </span>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            border: "1px solid var(--border)",
            background: "#101420",
            color: "var(--text-2)",
            cursor: "pointer",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <MagnifyingGlass size={15} /> Search
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              color: "var(--text-3)",
              padding: "1px 5px",
              border: "1px solid var(--border-s)",
              borderRadius: 3,
              marginLeft: 6,
              lineHeight: 1.4,
            }}
          >
            Ctrl K
          </span>
        </button>
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            border: "1px solid var(--border)",
            background: "#101420",
            color: "var(--text-2)",
            cursor: "pointer",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <Sparkle size={15} color="var(--pink-bright)" /> Ask Tollgate
        </button>
      </div>
    </div>
  );
}
