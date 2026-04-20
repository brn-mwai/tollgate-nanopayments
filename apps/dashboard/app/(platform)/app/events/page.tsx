"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { relativeTime, shortHash } from "@/lib/format";

export default function EventsPage() {
  const events = useQuery(api.events.recent, { limit: 100 });

  return (
    <div>
      <div
        style={{
          fontFamily: "Instrument Serif, serif",
          fontSize: 38,
          fontWeight: 400,
          marginBottom: 4,
        }}
      >
        Events
      </div>
      <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>
        Every 402, payment, cache hit, and webhook · indexed by site and agent
      </div>

      {events === undefined && <Hint text="Loading..." />}
      {events && events.length === 0 && <Hint text="No events yet. First request will appear here live." />}

      {events && events.length > 0 && (
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 10,
            overflow: "hidden",
            background: "var(--bg-card)",
          }}
        >
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
                  <Td>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-3)" }}>
                      {relativeTime(e.occurredAt)}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>
                      {shortHash(e.agentWallet)}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
                      {e.path}
                    </span>
                  </Td>
                  <Td>
                    {e.priceMicroUsdc > 0 ? (
                      <span
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 12,
                          color: "var(--green)",
                        }}
                      >
                        +{e.priceMicroUsdc} uUSDC
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-3)" }}>—</span>
                    )}
                  </Td>
                  <Td>
                    <span
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 11,
                        color: "var(--arc-bright)",
                      }}
                    >
                      {shortHash(e.txHash ?? "—")}
                    </span>
                  </Td>
                  <Td>
                    <StatusPill status={e.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "11px 18px", fontSize: 13, color: "var(--text-2)" }}>{children}</td>;
}

function Hint({ text }: { text: string }) {
  return (
    <div
      style={{
        border: "1px dashed var(--border)",
        borderRadius: 10,
        padding: "60px 24px",
        textAlign: "center",
        color: "var(--text-3)",
        fontSize: 13,
      }}
    >
      {text}
    </div>
  );
}
