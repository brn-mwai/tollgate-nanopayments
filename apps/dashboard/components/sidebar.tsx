"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountPopup } from "./account-popup";
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

type BadgeVariant = "arc" | "gold" | "green" | "pink";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; weight?: "duotone" | "regular" | "fill" }>;
  badge?: { text: string; variant: BadgeVariant };
};

const NAV: NavItem[][] = [
  [
    { href: "/app", label: "Overview", Icon: SquaresFour },
    { href: "/app/sites", label: "Sites", Icon: GlobeHemisphereWest, badge: { text: "2", variant: "arc" } },
    { href: "/app/events", label: "Events", Icon: ListMagnifyingGlass, badge: { text: "47", variant: "arc" } },
  ],
  [
    { href: "/app/wallet", label: "Wallet", Icon: Wallet },
    { href: "/app/withdrawals", label: "Withdrawals", Icon: ArrowSquareOut },
  ],
  [
    { href: "/app/agents", label: "Agents", Icon: UsersThree, badge: { text: "ERC-8004", variant: "gold" } },
    { href: "/app/install", label: "Install SDK", Icon: Code },
  ],
  [{ href: "/app/settings", label: "Settings", Icon: Gear }],
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sb-header">
        <Link href="/app" className="sb-logo">
          <span className="sb-logo-icon">
            <svg viewBox="0 0 129 155" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 21.5L0 38V116.5L15.5 133.5V21.5Z" fill="#fff" />
              <path d="M63.5 21.5L32 38V116.5L63.5 133.5V21.5Z" fill="#fff" />
              <path d="M129 21.5L80 38V116.5L129 133.5V21.5Z" fill="#fff" />
            </svg>
          </span>
          <span className="sb-logo-text">Tollgate</span>
          <span className="pill pill-pink badge-3d" style={{ fontSize: 9 }}>Beta</span>
        </Link>
      </div>

      <button type="button" className="sb-create">
        <Plus size={15} weight="bold" />
        <span>Add site</span>
      </button>

      <nav className="sb-nav">
        {NAV.map((section, i) => (
          <div key={i} className="nav-sec">
            {section.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "nav-item active" : "nav-item"}
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

      <div className="sb-plan">
        <div className="sb-plan-header">
          <div className="tile tile-pink badge-3d">
            <Star size={14} weight="fill" />
          </div>
          <div>
            <div className="sb-plan-label">Current plan</div>
            <div className="sb-plan-name">Free</div>
          </div>
        </div>
        <div className="sb-plan-msg">
          Upgrade to Pro for unlimited TX, 5 sites, priority facilitator, and CCTP off-ramp.
        </div>
      </div>

      <div className="sb-footer" style={{ padding: "8px 10px" }}>
        <AccountPopup />
      </div>
    </aside>
  );
}
