"use client";

// Realtime operations view. Live traffic, provider health, unit economics,
// and a streaming event feed with per-quote Gemini reasoning. Everything
// here reads from Convex reactive queries — values tick as traffic lands.

import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowSquareOut,
  CheckCircle,
  Circle,
  Cube,
  Gauge,
  Lightning,
  Play,
  Pulse,
  Receipt,
} from "@phosphor-icons/react";
import { relativeTime, shortAddr, shortHash, uUsdcToUsd } from "@/lib/format";
import { ARC_DOCS, CIRCLE_DOCS, GEMINI_DOCS, X402_SPEC, arcAddressUrl, arcTxUrl } from "@/lib/links";

export default function RealtimePage() {
  const summary = useQuery(api.metrics.summary, { limit: 3000 });
  const feed = useQuery(api.metrics.feed, { limit: 30 });
  const tools = useQuery(api.metrics.toolsUsed);
  const wallet = useQuery(api.wallets.get);
  const pair = useQuery(api.metrics.walletPair);

  const ready = summary && feed && tools;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.01em", marginBottom: 4 }}>
            Realtime
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Live traffic, provider health, unit economics — as requests land.
          </p>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--text-3)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#06A77D", boxShadow: "0 0 6px #06A77D" }} />
          convex reactive
        </div>
      </div>

      {!ready && <Hint text="Loading metrics…" />}

      {ready && (
        <>
          <StatBand
            totalOnchain={summary.totalOnchainTx}
            totalEarnedUu={summary.totalEarnedUuUsdc}
            uniqueAgents={summary.uniqueAgents}
            compression={summary.compressionRatio}
            marginArc={summary.marginPctOnArc}
            marginEth={summary.marginPctOnEthereum}
            avgPriceUu={summary.avgPriceUuUsdc}
          />
          <WalletPair pair={pair} />
          <BurstControl />
          <ProviderHealth tools={tools} walletAddress={wallet?.address ?? null} />
          <UnitEconomics
            onchainTx={summary.totalOnchainTx}
            earnedUu={summary.totalEarnedUuUsdc}
            arcGasUsd={summary.arcGasUsd}
            ethGasUsd={summary.ethereumGasUsdHypothetical}
            marginArc={summary.marginPctOnArc}
            marginEth={summary.marginPctOnEthereum}
          />
          <EventStream feed={feed} />
        </>
      )}
    </div>
  );
}

function WalletPair({
  pair,
}: {
  pair:
    | {
        publisher: { walletId: string | null; address: string | null; uUsdc: string };
        botFleet: { walletId: string | null; address: string | null };
      }
    | undefined;
}) {
  if (!pair || !pair.botFleet.address) return null;
  const publisherUsd = (Number(pair.publisher.uUsdc) / 1_000_000).toFixed(4);
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "var(--bg-card)",
        padding: 18,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Money path</div>
        <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "JetBrains Mono, monospace" }}>
          bot fleet → publisher · every settled quote
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 18, alignItems: "center" }}>
        <WalletCell
          label="Bot fleet"
          sub="(the agent operator)"
          address={pair.botFleet.address}
          walletId={pair.botFleet.walletId ?? undefined}
          tone="#F2A541"
          uUsdcLive
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            color: "var(--pink-bright)",
          }}
        >
          <ArrowRight size={28} weight="bold" color="#FF3CC0" />
          <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "JetBrains Mono, monospace" }}>
            0.001 USDC
          </span>
        </div>
        <WalletCell
          label="Publisher"
          sub="(you, receiving)"
          address={pair.publisher.address ?? "—"}
          walletId={pair.publisher.walletId ?? undefined}
          tone="#06A77D"
          cachedUsd={publisherUsd}
        />
      </div>
    </div>
  );
}

function WalletCell({
  label,
  sub,
  address,
  walletId,
  tone,
  cachedUsd,
  uUsdcLive,
}: {
  label: string;
  sub: string;
  address: string;
  walletId?: string;
  tone: string;
  cachedUsd?: string;
  uUsdcLive?: boolean;
}) {
  const liveBal = useLiveBalance(uUsdcLive ? walletId : null);
  return (
    <div
      style={{
        padding: 16,
        border: `1px solid ${tone}33`,
        borderRadius: 10,
        background: `${tone}0A`,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: tone }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--text-3)" }}>{sub}</div>
      </div>
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11.5,
          color: "var(--text-2)",
          marginBottom: 10,
          wordBreak: "break-all",
        }}
      >
        {address.slice(0, 10)}…{address.slice(-6)}
      </div>
      {cachedUsd !== undefined && (
        <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 26, color: tone }}>
          ${cachedUsd}
        </div>
      )}
      {uUsdcLive && (
        <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 26, color: tone }}>
          {liveBal ?? "—"}
        </div>
      )}
      {address !== "—" && (
        <a
          href={`https://sepolia.basescan.org/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11,
            color: tone,
            textDecoration: "none",
            fontFamily: "JetBrains Mono, monospace",
            display: "inline-flex",
            gap: 4,
            alignItems: "center",
          }}
        >
          basescan <ArrowSquareOut size={10} />
        </a>
      )}
    </div>
  );
}

function useLiveBalance(walletId: string | null | undefined): string | null {
  const [bal, setBal] = useState<string | null>(null);
  useEffect(() => {
    if (!walletId) return;
    let stopped = false;
    const fetchBal = async () => {
      try {
        const res = await fetch(`/api/wallet-balance?id=${walletId}`);
        if (!res.ok) return;
        const { usdc } = (await res.json()) as { usdc: string };
        if (!stopped) setBal(`$${usdc}`);
      } catch {
        /* ignore */
      }
    };
    fetchBal();
    const t = setInterval(fetchBal, 5000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [walletId]);
  return bal;
}

function BurstControl() {
  const sites = useQuery(api.sites.list);
  const runBurst = useAction(api.bots.runBurst);
  const latest = useQuery(api.bots.latestRun);
  const [busy, setBusy] = useState(false);
  const [iterations, setIterations] = useState(12);
  const [err, setErr] = useState<string | null>(null);

  const defaultSite = sites && sites.find((s) => s.status === "active");

  async function onRun() {
    if (!defaultSite) {
      setErr("No active site yet. Verify one under Sites first.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await runBurst({ siteId: defaultSite._id, iterations });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "burst failed");
    } finally {
      setBusy(false);
    }
  }

  const run = latest?.run;
  const steps = latest?.steps ?? [];
  const running = run?.status === "running" || busy;

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        background: "var(--bg-card)",
        marginBottom: 20,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Play size={15} weight="fill" color="#FF3CC0" />
        <div style={{ fontSize: 13, fontWeight: 600 }}>Live bot burst</div>
        <div style={{ fontSize: 11, color: "var(--text-3)" }}>
          One-click demo · quote → Circle Transfer → basescan tx, live
        </div>
        <div style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "JetBrains Mono, monospace" }}>iterations</label>
          <input
            type="number"
            min={1}
            max={60}
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
            disabled={running}
            style={{
              width: 64,
              padding: "5px 8px",
              fontSize: 12,
              fontFamily: "JetBrains Mono, monospace",
              color: "var(--text-1)",
              background: "var(--bg-shell)",
              border: "1px solid var(--border)",
              borderRadius: 5,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={onRun}
            disabled={running || !defaultSite}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#fff",
              background: running
                ? "var(--bg-shell)"
                : "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
              border: "1px solid " + (running ? "var(--border)" : "#B3007D"),
              borderRadius: 6,
              cursor: running ? "default" : "pointer",
              opacity: running ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            <Play size={13} weight="fill" />
            {running ? "Running…" : "Run burst"}
          </button>
        </div>
      </div>

      {err && <div style={{ padding: "10px 18px", fontSize: 12, color: "var(--red)" }}>{err}</div>}

      {run && (
        <>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border-s)", display: "flex", gap: 20, fontSize: 11.5, color: "var(--text-3)", flexWrap: "wrap" }}>
            <Stat label="Status" value={run.status} accent={run.status === "running" ? "#F2A541" : "#06A77D"} />
            <Stat label="Settled" value={String(run.settled)} accent="#06A77D" />
            <Stat label="Failed" value={String(run.failed)} accent={run.failed > 0 ? "#E84A53" : undefined} />
            <Stat label="Iterations" value={String(run.iterations)} />
            <Stat label="Started" value={relativeTime(run.startedAt)} />
            {run.finishedAt && <Stat label="Finished" value={relativeTime(run.finishedAt)} />}
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto", background: "rgba(0,0,0,0.25)", fontFamily: "JetBrains Mono, monospace", fontSize: 11.5 }}>
            {steps.map((s) => (
              <StepLine key={s._id} step={s} />
            ))}
            {running && <div style={{ padding: "10px 18px", color: "var(--text-3)" }}>▋</div>}
          </div>
        </>
      )}

      {!run && !running && (
        <div style={{ padding: "32px 18px", fontSize: 12.5, color: "var(--text-3)", textAlign: "center" }}>
          No bot runs yet. Click <strong style={{ color: "#FF3CC0" }}>Run burst</strong> above — 12 agent requests will execute, each settles as a real USDC transfer on Base Sepolia, each step shows up here live.
        </div>
      )}
    </div>
  );
}

function StepLine({
  step,
}: {
  step: { _id: string; kind: string; message: string; meta: unknown; occurredAt: number };
}) {
  const color =
    step.kind === "settle_confirmed"
      ? "#06A77D"
      : step.kind === "settle_failed"
        ? "#E84A53"
        : step.kind === "quote_received"
          ? "#F2A541"
          : step.kind === "run_started" || step.kind === "run_complete"
            ? "#FF3CC0"
            : "#2775CA";
  const time = new Date(step.occurredAt).toLocaleTimeString(undefined, { hour12: false });
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 150px 1fr",
        gap: 12,
        padding: "6px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.03)",
      }}
    >
      <span style={{ color: "var(--text-3)" }}>{time}</span>
      <span style={{ color }}>{step.kind}</span>
      <span style={{ color: "var(--text-1)" }}>{step.message}</span>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-3)" }}>{label}</span>
      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: accent ?? "var(--text-1)" }}>{value}</span>
    </div>
  );
}

function StatBand(props: {
  totalOnchain: number;
  totalEarnedUu: number;
  uniqueAgents: number;
  compression: number;
  marginArc: number;
  marginEth: number;
  avgPriceUu: number;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        background: "var(--bg-card)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
        <BigStat
          Icon={Receipt}
          color="#2775CA"
          label="Onchain settlements"
          value={props.totalOnchain.toLocaleString()}
          sub={`${uUsdcToUsd(props.totalEarnedUu)} settled across ${props.uniqueAgents} agent wallet${props.uniqueAgents === 1 ? "" : "s"}`}
        />
        <BigStat
          Icon={Lightning}
          color="#FF3CC0"
          label="Avg price per request"
          value={`${props.avgPriceUu.toLocaleString()} uUSDC`}
          sub={props.avgPriceUu > 0 ? `${(props.avgPriceUu / 1_000_000).toFixed(4)} USD` : "no paid requests yet"}
        />
        <BigStat
          Icon={Gauge}
          color="#06A77D"
          label="Margin · Arc"
          value={`${props.marginArc.toFixed(1)}%`}
          sub={`${props.marginEth.toFixed(0)}% on Ethereum L1 at the same load`}
        />
        <BigStat
          Icon={Cube}
          color="#2775CA"
          label="Receipt compression"
          value={`${props.compression.toFixed(1)}×`}
          sub="cached + onchain ÷ onchain"
        />
      </div>
    </div>
  );
}

function BigStat({
  Icon,
  color,
  label,
  value,
  sub,
}: {
  Icon: React.ComponentType<{ size?: number; weight?: "fill" | "duotone" | "regular"; color?: string }>;
  color: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon size={14} weight="duotone" color={color} />
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
          lineHeight: 1.1,
          marginBottom: 4,
          color: "var(--text-1)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>{sub}</div>
    </div>
  );
}

function ProviderHealth({
  tools,
  walletAddress,
}: {
  tools: {
    arcSettlesSeen: number;
    circleGatewayCalls: number;
    geminiPricerCalls: number;
    circleWalletProvisioned: boolean;
    ercDeploymentAddress: string | null;
  };
  walletAddress: string | null;
}) {
  const items: Array<{
    name: string;
    state: string;
    ok: boolean;
    href?: string;
    chipColor: string;
  }> = [
    {
      name: "Arc L1",
      state: tools.arcSettlesSeen > 0 ? `${tools.arcSettlesSeen.toLocaleString()} settlements` : "awaiting first tx",
      ok: tools.arcSettlesSeen > 0,
      href: ARC_DOCS,
      chipColor: "#2775CA",
    },
    {
      name: "USDC",
      state: tools.arcSettlesSeen > 0 ? "native gas · 6-decimal" : "no transfers yet",
      ok: tools.arcSettlesSeen > 0,
      href: "https://www.circle.com/usdc",
      chipColor: "#2775CA",
    },
    {
      name: "Circle Gateway",
      state: tools.circleGatewayCalls > 0 ? `${tools.circleGatewayCalls.toLocaleString()} x402 settles` : "connected · idle",
      ok: tools.circleGatewayCalls > 0,
      href: `${CIRCLE_DOCS}/gateway`,
      chipColor: "#06A77D",
    },
    {
      name: "Circle Wallets",
      state: tools.circleWalletProvisioned ? "provisioned" : "not provisioned",
      ok: tools.circleWalletProvisioned,
      href: walletAddress ? arcAddressUrl(walletAddress) ?? "/app/wallet" : "/app/wallet",
      chipColor: "#06A77D",
    },
    {
      name: "Gemini · pricing",
      state: tools.geminiPricerCalls > 0 ? `${tools.geminiPricerCalls.toLocaleString()} priced quotes` : "fallback pricer active",
      ok: tools.geminiPricerCalls > 0,
      href: GEMINI_DOCS,
      chipColor: "#FF3CC0",
    },
    {
      name: "x402",
      state: "402 body + X-PAYMENT header",
      ok: true,
      href: X402_SPEC,
      chipColor: "#F2A541",
    },
    {
      name: "ERC-8004 reputation",
      state: tools.ercDeploymentAddress ? `${tools.ercDeploymentAddress.slice(0, 8)}…` : "managed in Convex",
      ok: true,
      href: "/app/agents",
      chipColor: "#F2A541",
    },
  ];
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg-card)", padding: 18, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <Pulse size={14} weight="duotone" />
        <div style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>Provider health</div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginLeft: "auto" }}>
          derived from live Convex state
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {items.map((it) => (
          <ProviderChip key={it.name} {...it} />
        ))}
      </div>
    </div>
  );
}

function ProviderChip({
  name,
  state,
  ok,
  href,
  chipColor,
}: {
  name: string;
  state: string;
  ok: boolean;
  href?: string;
  chipColor: string;
}) {
  const body = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 8,
        border: `1px solid ${ok ? chipColor + "55" : "var(--border)"}`,
        background: ok ? `${chipColor}0D` : "var(--bg-shell)",
      }}
    >
      {ok ? (
        <CheckCircle size={18} weight="fill" color={chipColor} />
      ) : (
        <Circle size={18} weight="regular" color="var(--text-3)" />
      )}
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-1)" }}>{name}</div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{state}</div>
      </div>
    </div>
  );
  if (!href) return body;
  return href.startsWith("/") ? (
    <Link href={href} style={{ textDecoration: "none" }}>
      {body}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      {body}
    </a>
  );
}

function UnitEconomics({
  onchainTx,
  earnedUu,
  arcGasUsd,
  ethGasUsd,
  marginArc,
  marginEth,
}: {
  onchainTx: number;
  earnedUu: number;
  arcGasUsd: number;
  ethGasUsd: number;
  marginArc: number;
  marginEth: number;
}) {
  const earnedUsd = earnedUu / 1_000_000;
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        background: "var(--bg-card)",
        padding: 20,
        marginBottom: 20,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Unit economics</div>
      <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 14, lineHeight: 1.5 }}>
        Margin on this publisher's actual settled traffic, contrasted with the same load on Ethereum L1.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <EconColumn
          title="Arc (live)"
          tx={onchainTx}
          revenueUsd={earnedUsd}
          gasUsd={arcGasUsd}
          marginPct={marginArc}
          good
        />
        <EconColumn
          title="Ethereum L1 (same load)"
          tx={onchainTx}
          revenueUsd={earnedUsd}
          gasUsd={ethGasUsd}
          marginPct={marginEth}
        />
      </div>
    </div>
  );
}

function EconColumn({
  title,
  tx,
  revenueUsd,
  gasUsd,
  marginPct,
  good,
}: {
  title: string;
  tx: number;
  revenueUsd: number;
  gasUsd: number;
  marginPct: number;
  good?: boolean;
}) {
  const color = good ? "#06A77D" : "#E84A53";
  const netUsd = revenueUsd - gasUsd;
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 8,
        border: `1px solid ${good ? "rgba(6,167,125,0.35)" : "rgba(232,74,83,0.35)"}`,
        background: good ? "rgba(6,167,125,0.05)" : "rgba(232,74,83,0.05)",
      }}
    >
      <div style={{ fontSize: 11.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        {title}
      </div>
      <Row k="Transactions" v={tx.toLocaleString()} />
      <Row k="Revenue" v={`$${revenueUsd.toFixed(6)}`} />
      <Row k="Gas (total)" v={`$${gasUsd.toFixed(6)}`} />
      <Row k="Net" v={`$${netUsd.toFixed(6)}`} accent={color} />
      <Row k="Margin" v={`${marginPct.toFixed(1)}%`} accent={color} big />
    </div>
  );
}

function Row({
  k,
  v,
  accent,
  big,
}: {
  k: string;
  v: string;
  accent?: string;
  big?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: big ? 14 : 12.5 }}>
      <span style={{ color: "var(--text-3)" }}>{k}</span>
      <span style={{ fontFamily: "JetBrains Mono, monospace", color: accent ?? "var(--text-1)", fontWeight: big ? 600 : 500 }}>
        {v}
      </span>
    </div>
  );
}

function EventStream({
  feed,
}: {
  feed: Array<{
    _id: string;
    occurredAt: number;
    agentWallet: string;
    path: string;
    priceMicroUsdc: number;
    status: string;
    txHash?: string;
    nonce: string;
    pricerTrace: string | null;
    siteDomain: string;
  }>;
}) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg-card)", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#06A77D", boxShadow: "0 0 6px #06A77D" }} />
        <div style={{ fontSize: 13, fontWeight: 600 }}>Event stream</div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginLeft: "auto" }}>
          every 402 · settle · cache hit · enriched with the quote's Gemini reasoning
        </div>
      </div>
      {feed.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>
          No events yet. Send a request to a middleware-protected path to see rows stream in.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Time", "Agent", "Site · path", "Status", "Price", "Arc tx", "Pricing trace"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    fontSize: 10.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-3)",
                    fontWeight: 500,
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--border-s)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {feed.map((e) => (
              <tr key={e._id} style={{ borderTop: "1px solid var(--border-s)", verticalAlign: "top" }}>
                <Td mono muted>{relativeTime(e.occurredAt)}</Td>
                <Td mono>{shortAddr(e.agentWallet)}</Td>
                <Td mono>
                  <span style={{ color: "var(--text-3)" }}>{e.siteDomain}</span>
                  <br />
                  {e.path}
                </Td>
                <Td>
                  <StatusPill status={e.status} />
                </Td>
                <Td mono accent>
                  {e.priceMicroUsdc > 0 ? `${e.priceMicroUsdc} uUSDC` : "—"}
                </Td>
                <Td>
                  {e.txHash ? (
                    <a
                      href={arcTxUrl(e.txHash) ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--arc-bright)", textDecoration: "none", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      {shortHash(e.txHash)}
                      <ArrowSquareOut size={11} />
                    </a>
                  ) : (
                    <span style={{ color: "var(--text-3)" }}>—</span>
                  )}
                </Td>
                <Td>
                  <span style={{ fontSize: 11, color: "var(--text-2)", display: "inline-block", maxWidth: 320, lineHeight: 1.4 }}>
                    {e.pricerTrace ?? <em style={{ color: "var(--text-3)" }}>—</em>}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-3)" }}>
        Window total: <code style={{ color: "var(--text-2)" }}>{uUsdcToUsd(
          feed.reduce((a, e) => a + (e.status.startsWith("paid") ? e.priceMicroUsdc : 0), 0),
        )}</code>
      </div>
    </div>
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

function Td({
  children,
  mono,
  muted,
  accent,
}: {
  children: React.ReactNode;
  mono?: boolean;
  muted?: boolean;
  accent?: boolean;
}) {
  const color = accent ? "var(--green)" : muted ? "var(--text-3)" : "var(--text-2)";
  return (
    <td
      style={{
        padding: "12px 14px",
        fontSize: 12.5,
        color,
        fontFamily: mono ? "JetBrains Mono, monospace" : undefined,
      }}
    >
      {children}
    </td>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <div style={{ border: "1px dashed var(--border)", borderRadius: 10, padding: "60px 24px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
      {text}
    </div>
  );
}
