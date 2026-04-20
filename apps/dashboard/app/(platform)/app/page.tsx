"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMemo } from "react";
import { Receipt, CurrencyDollar, Robot, Gauge } from "@phosphor-icons/react";
import { OnboardingCard } from "@/components/onboarding";
import { KpiCard } from "@/components/kpi-card";
import { ActivityChart } from "@/components/charts/activity-chart";
import { StatusDonut } from "@/components/charts/status-donut";
import { bucketByTime, bucketSumByTime, delta } from "@/lib/delta";
import { relativeTime, shortAddr, shortHash } from "@/lib/format";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export default function OverviewPage() {
  const { user } = useUser();
  const publisher = useQuery(api.publishers.getMine);
  const sites = useQuery(api.sites.list, publisher ? {} : "skip");
  const events = useQuery(api.events.recent, publisher ? { limit: 500 } : "skip");

  const first = user?.firstName ?? user?.username ?? "there";
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const analytics = useMemo(() => {
    const evs = events ?? [];
    const now = Date.now();
    const paid = evs.filter(
      (e) => e.status === "paid_onchain" || e.status === "paid_cached",
    );

    // Current window (last 24h) + previous window (24-48h ago) for deltas.
    const in24h = (e: { occurredAt: number }) => e.occurredAt > now - DAY;
    const in24to48h = (e: { occurredAt: number }) =>
      e.occurredAt > now - 2 * DAY && e.occurredAt <= now - DAY;

    const paidNow = paid.filter(in24h);
    const paidPrev = paid.filter(in24to48h);
    const earnedNow = paidNow.reduce((a, e) => a + e.priceMicroUsdc, 0);
    const earnedPrev = paidPrev.reduce((a, e) => a + e.priceMicroUsdc, 0);
    const botsNow = new Set(paidNow.map((e) => e.agentWallet)).size;
    const botsPrev = new Set(paidPrev.map((e) => e.agentWallet)).size;

    // Sparklines: per-hour buckets over last 24h.
    const sparkPaid = bucketByTime(paid, (e) => e.occurredAt, 24, DAY, now);
    const sparkEarn = bucketSumByTime(
      paid,
      (e) => e.occurredAt,
      (e) => e.priceMicroUsdc,
      24,
      DAY,
      now,
    );
    const sparkBots = sparkPaid.map((_, i) => {
      const start = now - DAY + i * HOUR;
      const end = start + HOUR;
      return new Set(
        paid
          .filter((e) => e.occurredAt >= start && e.occurredAt < end)
          .map((e) => e.agentWallet),
      ).size;
    });
    const sparkMargin = sparkPaid.map((n) => (n > 0 ? 96 : 0));

    // Status breakdown for donut.
    const counts = evs.reduce<Record<string, number>>(
      (acc, e) => {
        acc[e.status] = (acc[e.status] ?? 0) + 1;
        return acc;
      },
      { paid_onchain: 0, paid_cached: 0, unpaid_402: 0 },
    );

    return {
      paidCountDelta: delta(paidNow.length, paidPrev.length),
      earnedDelta: delta(earnedNow, earnedPrev),
      botsDelta: delta(botsNow, botsPrev),
      earnedUsd: (earnedNow / 1_000_000).toFixed(4),
      botsNow,
      sparkPaid,
      sparkEarn,
      sparkBots,
      sparkMargin,
      statusCounts: counts,
      totalEvents: evs.length,
    };
  }, [events]);

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
        <h1 className="page-title">Welcome, {first}</h1>
        <p className="page-subtitle">{date}</p>
        <OnboardingCard suggestedSlug={suggested} />
      </>
    );
  }

  return (
    <div>
      <div className="page-title">Good to see you, {first}</div>
      <div className="page-subtitle">
        {date} · {sites?.length ?? 0} site{sites?.length === 1 ? "" : "s"} · Arc testnet
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <KpiCard
          Icon={Receipt}
          color="pink"
          label="Paid TX · 24h"
          value={analytics.paidCountDelta.current.toLocaleString()}
          delta={analytics.paidCountDelta}
          sub="vs prior 24h"
          spark={analytics.sparkPaid}
        />
        <KpiCard
          Icon={CurrencyDollar}
          color="green"
          label="Earnings · 24h"
          value={`$${analytics.earnedUsd}`}
          delta={analytics.earnedDelta}
          sub="500 uUSDC / TX"
          spark={analytics.sparkEarn}
        />
        <KpiCard
          Icon={Robot}
          color="arc"
          label="Active bots · 24h"
          value={analytics.botsNow.toLocaleString()}
          delta={analytics.botsDelta}
          sub="unique wallets"
          spark={analytics.sparkBots}
        />
        <KpiCard
          Icon={Gauge}
          color="gold"
          label="Margin"
          value="96%"
          sub="Gas $0.00002 / TX"
          spark={analytics.sparkMargin}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <Panel
          title="Paid TX · last 24 hours"
          desc="hourly buckets · all sites"
        >
          <ActivityChart data={analytics.sparkPaid} />
        </Panel>

        <Panel title="Status breakdown" desc={`${analytics.totalEvents} events`}>
          <StatusDonut
            centerValue={String(analytics.totalEvents)}
            centerLabel="events"
            segments={[
              { name: "Onchain", value: analytics.statusCounts.paid_onchain || 0, color: "#06A77D" },
              { name: "Cached", value: analytics.statusCounts.paid_cached || 0, color: "#2775CA" },
              { name: "402", value: analytics.statusCounts.unpaid_402 || 0, color: "#F2A541" },
            ]}
          />
        </Panel>
      </div>

      <RecentEvents events={(events ?? []).slice(0, 10)} />

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 32,
          background: "var(--bg-card)",
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
          Arc denominates gas in USDC. Gas cost is fixed at design time, not probabilistic at
          runtime. Every other chain&apos;s native-token gas wipes the margin before the article
          loads.
        </div>
      </div>
    </div>
  );
}

function RecentEvents({ events }: { events: Array<{
  _id: string; agentWallet: string; path: string; priceMicroUsdc: number;
  txHash?: string; occurredAt: number; status: string;
}> }) {
  return (
    <div
      className="panel"
      style={{ marginBottom: 28 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>
          Recent events
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>
          last {events.length || 0} across all sites
        </div>
        <Link
          href="/app/events"
          style={{
            marginLeft: "auto",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--pink-bright)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          View all <ArrowRight size={12} weight="bold" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            fontSize: 13,
            color: "var(--text-3)",
          }}
        >
          No events yet. Install the SDK on a site to see live requests here.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Time</Th>
              <Th>Agent</Th>
              <Th>Path</Th>
              <Th>Amount</Th>
              <Th>Tx hash</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e._id} style={{ borderTop: "1px solid var(--border-s)" }}>
                <Td mono muted>{relativeTime(e.occurredAt)}</Td>
                <Td mono>{shortAddr(e.agentWallet)}</Td>
                <Td mono>{e.path}</Td>
                <Td mono accent>
                  {e.priceMicroUsdc > 0 ? `+${e.priceMicroUsdc} uUSDC` : "—"}
                </Td>
                <Td mono link>{shortHash(e.txHash ?? "—")}</Td>
                <Td>
                  <StatusPill status={e.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        fontSize: 10.5,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "var(--text-3)",
        fontWeight: 500,
        padding: "10px 18px",
        borderBottom: "1px solid var(--border-s)",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  muted,
  accent,
  link,
}: {
  children: React.ReactNode;
  mono?: boolean;
  muted?: boolean;
  accent?: boolean;
  link?: boolean;
}) {
  const color = accent
    ? "var(--green)"
    : link
      ? "var(--arc-bright)"
      : muted
        ? "var(--text-3)"
        : "var(--text-2)";
  return (
    <td
      style={{
        padding: "11px 18px",
        fontSize: mono ? 12 : 13,
        color,
        fontFamily: mono ? "JetBrains Mono, monospace" : undefined,
      }}
    >
      {children}
    </td>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid_onchain: "pill-green",
    paid_cached: "pill-arc",
    unpaid_402: "pill-gold",
    rejected: "pill-red",
    failed_verify: "pill-red",
  };
  const label = status.replace("paid_", "").replace("_", " ");
  return <span className={`pill ${map[status] ?? "pill-arc"} badge-3d`}>{label}</span>;
}

function Panel({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        background: "var(--bg-card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: "var(--text-3)" }}>{desc}</div>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
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
