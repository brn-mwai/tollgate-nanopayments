"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { shortAddr } from "@/lib/format";

export default function AgentsPage() {
  // Paginated query — initial 50 for the hackathon.
  const res = useQuery(api.agents.listAll, { paginationOpts: { numItems: 50, cursor: null } });
  const agents = res?.page;

  return (
    <div>
      <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, marginBottom: 4, fontWeight: 400 }}>
        Agents
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>
        Wallet-based identity · ERC-8004 reputation · tiered discount pricing
      </p>

      <ReputationTiers />

      <div
        style={{
          marginTop: 24,
          border: "1px solid var(--border)",
          borderRadius: 10,
          background: "var(--bg-card)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Agent directory</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            Sorted by reputation score (descending)
          </div>
        </div>

        {agents === undefined && <Pad>Loading...</Pad>}
        {agents && agents.length === 0 && <Pad>No agents yet. They&apos;ll appear the first time a wallet pays a 402.</Pad>}

        {agents && agents.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Wallet", "First seen", "Total paid", "Reputation", "Tier", "Status"].map((h) => (
                  <th
                    key={h}
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
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a._id} style={{ borderTop: "1px solid var(--border-s)" }}>
                  <Td mono>{shortAddr(a.walletAddress)}</Td>
                  <Td>{new Date(a.firstSeenAt).toLocaleDateString()}</Td>
                  <Td mono>{a.totalPaidMicroUsdc} uUSDC</Td>
                  <Td mono>{a.reputationScore.toFixed(2)}</Td>
                  <Td>
                    <TierPill score={a.reputationScore} />
                  </Td>
                  <Td>
                    <StatusPill status={a.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TierPill({ score }: { score: number }) {
  if (score < 0.5) return <span className="pill pill-gold badge-3d">unverified</span>;
  if (score < 0.8) return <span className="pill pill-arc badge-3d">verified</span>;
  if (score < 0.95) return <span className="pill pill-green badge-3d">trusted</span>;
  return <span className="pill pill-pink badge-3d">preferred</span>;
}

function StatusPill({ status }: { status: string }) {
  const cls = status === "banned" ? "pill-red" : status === "flagged" ? "pill-gold" : "pill-green";
  return <span className={`pill ${cls} badge-3d`}>{status}</span>;
}

function ReputationTiers() {
  const TIERS = [
    { name: "unverified", range: "< 0.5", discount: "0%", price: "500 uUSDC (full)", pill: "pill-gold" },
    { name: "verified", range: "0.5 – 0.8", discount: "25% off", price: "375 uUSDC", pill: "pill-arc" },
    { name: "trusted", range: "0.8 – 0.95", discount: "50% off", price: "250 uUSDC", pill: "pill-green" },
    { name: "preferred", range: "> 0.95", discount: "80% off", price: "100 uUSDC", pill: "pill-pink" },
  ];
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg-card)", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Reputation tiers</div>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
          ERC-8004 onchain · tiered discount by score
        </div>
      </div>
      {TIERS.map((t) => (
        <div
          key={t.name}
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr 160px 200px",
            gap: 16,
            padding: "12px 18px",
            borderBottom: "1px solid var(--border-s)",
            alignItems: "center",
            fontSize: 13,
          }}
        >
          <span className={`pill ${t.pill} badge-3d`}>{t.name}</span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-2)" }}>{t.range}</span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--green)", fontWeight: 600 }}>
            {t.discount}
          </span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-2)" }}>{t.price}</span>
        </div>
      ))}
    </div>
  );
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td
      style={{
        padding: "11px 18px",
        fontSize: 13,
        color: "var(--text-2)",
        fontFamily: mono ? "JetBrains Mono, monospace" : undefined,
      }}
    >
      {children}
    </td>
  );
}

function Pad({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
      {children}
    </div>
  );
}
