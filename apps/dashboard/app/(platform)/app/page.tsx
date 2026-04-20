"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Receipt, CurrencyDollar, Robot, Gauge, ArrowUp } from "@phosphor-icons/react";

export default function OverviewPage() {
  const { user } = useUser();
  const publisher = useQuery(api.publishers.getMine);

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const first = user?.firstName ?? user?.username ?? "there";

  return (
    <div>
      <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, fontWeight: 400, marginBottom: 4, letterSpacing: "-0.01em" }}>
        Good morning, {first}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 32 }}>
        {date} &middot; {publisher ? "Publisher active" : "Setting up your account..."} &middot; Arc testnet
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        <StatCard
          Icon={Receipt}
          color="pink"
          label="Paid TX today"
          value="0"
          sub="waiting for first request"
        />
        <StatCard
          Icon={CurrencyDollar}
          color="green"
          label="Earnings today"
          value="$0.0000"
          sub="500 uUSDC / TX"
        />
        <StatCard
          Icon={Robot}
          color="arc"
          label="Active bots (24h)"
          value="0"
          sub="install the SDK to start"
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
          Every other chain's native-token gas wipes the margin before the article loads.
        </div>
      </div>
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
