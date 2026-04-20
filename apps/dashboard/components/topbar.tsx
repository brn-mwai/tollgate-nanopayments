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
    <div className="topbar">
      <button type="button" className="collapse-btn" aria-label="Toggle sidebar">
        <SidebarSimple size={17} />
      </button>
      <div className="topbar-divider" />
      <div className="topbar-breadcrumb">
        <span className="crumb">{title}</span>
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
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        <button type="button" className="topbar-action">
          <MagnifyingGlass size={15} />
          Search
          <span className="topbar-kbd">Ctrl K</span>
        </button>
        <button type="button" className="topbar-action">
          <Sparkle size={15} color="var(--pink-bright)" />
          Ask Tollgate
        </button>
      </div>
    </div>
  );
}
