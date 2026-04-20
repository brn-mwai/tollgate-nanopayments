"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Receipt, CurrencyDollar, Robot, Gauge } from "@phosphor-icons/react";
import { OnboardingCard } from "@/components/onboarding";

export default function OverviewPage() {
  const { user } = useUser();
  const publisher = useQuery(api.publishers.getMine);
  const sites = useQuery(api.sites.list, publisher ? {} : "skip");
  const events = useQuery(api.events.recent, publisher ? { limit: 50 } : "skip");

  const first = user?.firstName ?? user?.username ?? "there";
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Undefined = loading, null = confirmed absent
  if (publisher === undefined) return <Loading />;

  if (publisher === null) {
    const suggested =
      (user?.username ??
        user?.primaryEmailAddress?.emailAddress.split("@")[0] ??
        "my-org")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");
    return (
      <>
        <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, marginBottom: 4 }}>
          Welcome, {first}
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 32 }}>{date}</p>
        <OnboardingCard suggestedSlug={suggested} />
      </>
    );
  }

  const paidToday = (events ?? []).filter((e) => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return e.occurredAt > dayAgo && (e.status === "paid_onchain" || e.status === "paid_cached");
  });
  const earnedUuUsdc = paidToday.reduce((acc, e) => acc + e.priceMicroUsdc, 0);
  const earnedUsd = (earnedUuUsdc / 1_000_000).toFixed(4);
  const uniqueBots = new Set(paidToday.map((e) => e.agentWallet)).size;

  return (
    <div>
      <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, fontWeight: 400, marginBottom: 4, letterSpacing: "-0.01em" }}>
        Good to see you, {first}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 32 }}>
        {date} &middot; {sites?.length ?? 0} site{sites?.length === 1 ? "" : "s"} &middot; Arc testnet
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        <StatCard
          Icon={Receipt}
          color="pink"
          label="Paid TX today"
          value={paidToday.length.toString()}
          sub={paidToday.length === 0 ? "waiting for first request" : "past 24h"}
        />
        <StatCard
          Icon={CurrencyDollar}
          color="green"
          label="Earnings today"
          value={`$${earnedUsd}`}
          sub="uUSDC on Arc"
        />
        <StatCard
          Icon={Robot}
          color="arc"
          label="Active bots (24h)"
          value={uniqueBots.toString()}
          sub={uniqueBots === 0 ? "install the SDK to start" : "unique wallets"}
        />
        <StatCard
          Icon={Gauge}
          color="gold"
          label="Margin"
          value="96%"
          sub="Gas $0.00002 / TX · Arc L1"
        />
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 32,
          background: "rgba(255,255,255,0.025)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10.5,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--pink-bright)",
            marginBottom: 8,
          }}
        >
          Why Arc
        </div>
        <div
          style={{
            fontFamily: "Instrument Serif, serif",
            fontSize: 26,
            lineHeight: 1.1,
            marginBottom: 10,
          }}
        >
          The only chain where sub-cent per-request math closes.
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55, maxWidth: 680 }}>
          Arc denominates gas in USDC. Gas cost is fixed at design time, not probabilistic at runtime.
          Every other chain&apos;s native-token gas wipes the margin before the article loads.
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding: 80, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
      Loading...
    </div>
  );
}

function StatCard({
  Icon,
  color,
  label,
  value,
  sub,
}: {
  Icon: React.ComponentType<{ size?: number; weight?: "duotone" | "fill" }>;
  color: "pink" | "green" | "arc" | "gold";
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div className={`tile tile-${color} badge-3d`}>
          <Icon size={15} weight="duotone" />
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--text-2)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          marginBottom: 2,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-3)" }}>{sub}</div>
    </div>
  );
}
