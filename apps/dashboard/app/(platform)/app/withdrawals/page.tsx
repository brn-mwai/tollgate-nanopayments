"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { relativeTime, shortHash, uUsdcToUsd } from "@/lib/format";

export default function WithdrawalsPage() {
  const res = useQuery(api.withdrawals.listMine, {
    paginationOpts: { numItems: 50, cursor: null },
  });
  const withdrawals = res?.page;

  return (
    <div>
      <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, marginBottom: 4, fontWeight: 400 }}>
        Withdrawals
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>
        Off-ramp USDC via Circle CCTP or direct transfer on Arc
      </p>

      {withdrawals === undefined && <Hint>Loading...</Hint>}

      {withdrawals && withdrawals.length === 0 && (
        <Hint>
          No withdrawals yet. Once your balance passes your threshold, withdraw directly on Arc or
          bridge to Base, Ethereum, or Solana via Circle CCTP.
        </Hint>
      )}

      {withdrawals && withdrawals.length > 0 && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.025)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Date", "Amount", "Destination", "Chain", "Circle tx", "Status"].map((h) => (
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
              {withdrawals.map((w) => (
                <tr key={w._id} style={{ borderTop: "1px solid var(--border-s)" }}>
                  <Td>{relativeTime(w.requestedAt)}</Td>
                  <Td mono>{uUsdcToUsd(w.amountMicroUsdc)}</Td>
                  <Td mono>{shortHash(w.destination)}</Td>
                  <Td>{w.destChain}</Td>
                  <Td mono>{w.circleTxId ? shortHash(w.circleTxId) : "—"}</Td>
                  <Td>
                    <StatusPill status={w.status} />
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
  const cls =
    status === "sent" ? "pill-green" : status === "failed" ? "pill-red" : "pill-gold";
  return <span className={`pill ${cls} badge-3d`}>{status}</span>;
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

function Hint({ children }: { children: React.ReactNode }) {
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
      {children}
    </div>
  );
}
