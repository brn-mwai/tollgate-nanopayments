"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useMemo } from "react";
import { AccountPopup } from "./account-popup";
import { useShell } from "./shell-context";
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
  Pulse,
} from "@phosphor-icons/react";

type BadgeVariant = "arc" | "gold" | "green" | "pink";
type Badge = { text: string; variant: BadgeVariant };

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; weight?: "duotone" | "regular" | "fill" }>;
  badge?: Badge;
};

// Free-tier daily paid-TX ceiling. Keep in sync with pricing page.
const FREE_TIER_DAILY_TX_LIMIT = 100;

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useShell();

  const publisher = useQuery(api.publishers.getMine);
  const sites = useQuery(api.sites.list);
  const events = useQuery(api.events.recent, { limit: 500 });

  const plan = publisher?.plan ?? "free";
  const isFree = plan === "free";
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  // Usage: paid TX in the last 24h vs the Free tier ceiling.
  const usage = useMemo(() => {
    if (!events) return { paid: 0, pct: 0, tier: "green" as const };
    const dayAgo = Date.now() - 24 * 3600_000;
    const paid = events.filter(
      (e) =>
        e.occurredAt > dayAgo &&
        (e.status === "paid_onchain" || e.status === "paid_cached"),
    ).length;
    const pct = Math.min(100, Math.round((paid / FREE_TIER_DAILY_TX_LIMIT) * 100));
    const tier: "green" | "amber" | "red" =
      pct >= 90 ? "red" : pct >= 75 ? "amber" : "green";
    return { paid, pct, tier };
  }, [events]);

  const nav: NavItem[][] = [
    [
      { href: "/app", label: "Overview", Icon: SquaresFour },
      { href: "/app/realtime", label: "Realtime", Icon: Pulse },
      {
        href: "/app/sites",
        label: "Sites",
        Icon: GlobeHemisphereWest,
        badge:
          sites && sites.length > 0
            ? { text: String(sites.length), variant: "arc" }
            : undefined,
      },
      {
        href: "/app/events",
        label: "Events",
        Icon: ListMagnifyingGlass,
        badge:
          events && events.length > 0
            ? { text: String(events.length), variant: "arc" }
            : undefined,
      },
    ],
    [
      { href: "/app/wallet", label: "Wallet", Icon: Wallet },
      { href: "/app/withdrawals", label: "Withdrawals", Icon: ArrowSquareOut },
    ],
    [
      {
        href: "/app/agents",
        label: "Agents",
        Icon: UsersThree,
        badge: { text: "ERC-8004", variant: "gold" },
      },
      { href: "/app/install", label: "Install SDK", Icon: Code },
    ],
    [{ href: "/app/settings", label: "Settings", Icon: Gear }],
  ];

  return (
    <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
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

      <Link href="/app/sites" className="sb-create" style={{ textDecoration: "none" }}>
        <Plus size={15} weight="bold" />
        <span>Add site</span>
      </Link>

      <nav className="sb-nav">
        {nav.map((section, i) => (
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
          <div className={`tile ${isFree ? "tile-pink" : "tile-green"} badge-3d`}>
            <Star size={14} weight="fill" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sb-plan-label">Current plan</div>
            <div className="sb-plan-name">{planLabel}</div>
          </div>
        </div>

        {isFree ? (
          <>
            <div className="sb-plan-usage">
              <div className="sb-plan-bar-track">
                <div
                  className={`sb-plan-bar-fill ${usage.tier}`}
                  style={{ width: `${usage.pct}%` }}
                />
              </div>
              <div className="sb-plan-count">
                <span>
                  {usage.paid} / {FREE_TIER_DAILY_TX_LIMIT} paid TX today
                </span>
                <span>{usage.pct}%</span>
              </div>
            </div>

            <div className="sb-plan-msg">
              Upgrade to Pro for unlimited TX, 5 sites, priority facilitator, and CCTP off-ramp.
            </div>

            <button type="button" className="sb-plan-upgrade">
              <Star size={13} weight="fill" /> Upgrade to Pro
            </button>
          </>
        ) : (
          <div className="sb-plan-msg" style={{ marginTop: 0 }}>
            {plan === "pro"
              ? "Unlimited TX, 5 sites, priority facilitator, CCTP off-ramp."
              : "Enterprise: unlimited everything, white-glove support."}
          </div>
        )}
      </div>

      <div className="sb-footer" style={{ padding: "8px 10px" }}>
        <AccountPopup />
      </div>
    </aside>
  );
}
