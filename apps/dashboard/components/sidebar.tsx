"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  SquaresFour,
  GlobeHemisphereWest,
  ListMagnifyingGlass,
  Wallet,
  ArrowSquareOut,
  UsersThree,
  Code,
  Gear,
  Plus,
  Star,
} from "@phosphor-icons/react";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; weight?: "duotone" | "regular" | "fill" }>;
  badge?: { text: string; variant: "arc" | "gold" | "green" | "pink" };
};

const NAV: { section: NavItem[] }[] = [
  {
    section: [
      { href: "/app", label: "Overview", Icon: SquaresFour },
      { href: "/app/sites", label: "Sites", Icon: GlobeHemisphereWest, badge: { text: "2", variant: "arc" } },
      { href: "/app/events", label: "Events", Icon: ListMagnifyingGlass, badge: { text: "47", variant: "arc" } },
    ],
  },
  {
    section: [
      { href: "/app/wallet", label: "Wallet", Icon: Wallet },
      { href: "/app/withdrawals", label: "Withdrawals", Icon: ArrowSquareOut },
    ],
  },
  {
    section: [
      { href: "/app/agents", label: "Agents", Icon: UsersThree, badge: { text: "ERC-8004", variant: "gold" } },
      { href: "/app/install", label: "Install SDK", Icon: Code },
    ],
  },
  {
    section: [{ href: "/app/settings", label: "Settings", Icon: Gear }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        minWidth: "var(--sidebar-w)",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", minHeight: 52 }}>
        <Link
          href="/app"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 129 155" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 21.5L0 38V116.5L15.5 133.5V21.5Z" fill="#fff" />
            <path d="M63.5 21.5L32 38V116.5L63.5 133.5V21.5Z" fill="#fff" />
            <path d="M129 21.5L80 38V116.5L129 133.5V21.5Z" fill="#fff" />
          </svg>
          <span
            style={{
              fontFamily: "Instrument Sans, sans-serif",
              fontWeight: 700,
              fontSize: 19,
              letterSpacing: "0.01em",
              color: "var(--text-1)",
            }}
          >
            Tollgate
          </span>
          <span className="pill pill-pink badge-3d" style={{ fontSize: 9 }}>
            Beta
          </span>
        </Link>
      </div>

      <button
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 12px",
          margin: "0 10px 6px",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text-2)",
          background: "#101420",
          border: "1px solid var(--border)",
          borderRadius: 6,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <Plus size={15} /> Add site
      </button>

      <nav style={{ flex: 1, padding: "4px 0", overflowY: "auto" }} className="no-scrollbar">
        {NAV.map((group, i) => (
          <div
            key={i}
            style={{
              padding: "0 10px",
              marginTop: i > 0 ? 6 : 0,
              paddingTop: i > 0 ? 6 : 0,
              borderTop: i > 0 ? "1px solid var(--border-s)" : "none",
              marginInline: i > 0 ? 22 : 0,
              paddingInline: i > 0 ? 0 : 10,
            }}
          >
            {group.section.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 8px",
                    fontSize: 13.5,
                    fontWeight: active ? 500 : 400,
                    color: active ? "var(--text-1)" : "var(--text-2)",
                    background: active ? "#101420" : "transparent",
                    border: active ? "1px solid var(--border)" : "1px solid transparent",
                    borderRadius: 6,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  <item.Icon size={17} weight="duotone" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`pill pill-${item.badge.variant} badge-3d`}
                      style={{ marginLeft: "auto", fontSize: 10 }}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div
        style={{
          margin: "0 10px 8px",
          padding: 12,
          background: "var(--bg-card)",
          border: "1px solid var(--border-s)",
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div className="tile tile-pink badge-3d">
            <Star size={14} weight="fill" color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.2 }}>Current plan</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>Free</div>
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            lineHeight: 1.4,
          }}
        >
          Upgrade to Pro for unlimited TX, 5 sites, priority facilitator, and CCTP off-ramp.
        </div>
      </div>

      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid var(--border-s)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <UserButton afterSignOutUrl="/" />
        <div style={{ fontSize: 12, color: "var(--text-2)" }}>Account</div>
      </div>
    </aside>
  );
}
