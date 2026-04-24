"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { Plus, PaperPlaneTilt } from "@phosphor-icons/react";
import { relativeTime, shortHash, uUsdcToUsd } from "@/lib/format";
import { ChainIcon, chainLabel } from "@/components/chain-icon";

type DestChain = "arc" | "base" | "ethereum" | "solana";

export default function WithdrawalsPage() {
  const res = useQuery(api.withdrawals.listMine, {
    paginationOpts: { numItems: 50, cursor: null },
  });
  const wallet = useQuery(api.wallets.get);
  const withdrawals = res?.page;

  const [formOpen, setFormOpen] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, marginBottom: 4, fontWeight: 400 }}>
            Withdrawals
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Off-ramp USDC via Circle CCTP or direct transfer on Arc
          </p>
        </div>
        <button type="button" style={primaryBtn} onClick={() => setFormOpen((v) => !v)} disabled={!wallet?.address}>
          <Plus size={15} /> Request withdrawal
        </button>
      </div>

      {formOpen && wallet?.address && (
        <WithdrawForm
          availableUu={wallet.cachedBalanceUuUsdc}
          onClose={() => setFormOpen(false)}
        />
      )}

      {withdrawals === undefined && <Hint>Loading...</Hint>}

      {withdrawals && withdrawals.length === 0 && (
        <Hint>
          No withdrawals yet. Once your balance passes your threshold, withdraw directly on Arc or
          bridge to Base, Ethereum, or Solana via Circle CCTP.
        </Hint>
      )}

      {withdrawals && withdrawals.length > 0 && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--bg-card)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Date", "Amount", "Destination", "Chain", "Circle tx", "Status", ""].map((h) => (
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
                  <Td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <ChainIcon chain={w.destChain} size={16} />
                      {chainLabel(w.destChain)}
                    </span>
                  </Td>
                  <Td mono>{w.circleTxId ? shortHash(w.circleTxId) : "—"}</Td>
                  <Td>
                    <StatusPill status={w.status} />
                  </Td>
                  <Td>
                    {w.status === "pending" && !w.circleTxId ? (
                      <ExecuteBtn withdrawalId={w._id} />
                    ) : (
                      <span style={{ color: "var(--text-3)", fontSize: 11 }}>—</span>
                    )}
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

function WithdrawForm({
  availableUu,
  onClose,
}: {
  availableUu: string;
  onClose: () => void;
}) {
  const request = useMutation(api.withdrawals.request);
  const [amountUsd, setAmountUsd] = useState("");
  const [destination, setDestination] = useState("");
  const [destChain, setDestChain] = useState<DestChain>("arc");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr(null);
    const uu = parseUsdToUu(amountUsd);
    if (!uu) {
      setErr("enter a positive USD amount");
      return;
    }
    if (BigInt(uu) > BigInt(availableUu)) {
      setErr("amount exceeds available balance");
      return;
    }
    setBusy(true);
    try {
      await request({ amountMicroUsdc: uu, destination: destination.trim(), destChain });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg-card)", marginBottom: 16, padding: 20, maxWidth: 560 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Request withdrawal</div>

      <Label>Amount (USD)</Label>
      <input
        value={amountUsd}
        onChange={(e) => setAmountUsd(e.target.value)}
        placeholder="10.00"
        style={inputStyle}
        inputMode="decimal"
      />
      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
        Available: {uUsdcToUsd(availableUu)} ({availableUu} uUSDC)
      </div>

      <Label>Destination address</Label>
      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="0x… (EVM) or Solana pubkey"
        style={inputStyle}
      />

      <Label>Chain</Label>
      <select
        value={destChain}
        onChange={(e) => setDestChain(e.target.value as DestChain)}
        style={inputStyle}
      >
        <option value="arc">Arc (native, no bridge)</option>
        <option value="base">Base (CCTP)</option>
        <option value="ethereum">Ethereum (CCTP)</option>
        <option value="solana">Solana (CCTP)</option>
      </select>

      {err && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 10 }}>{err}</div>}

      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        <button type="button" style={primaryBtn} onClick={submit} disabled={busy || !amountUsd || !destination}>
          {busy ? "Submitting…" : "Submit"}
        </button>
        <button type="button" style={ghostBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function parseUsdToUu(usd: string): string | null {
  const n = Number(usd);
  if (!Number.isFinite(n) || n <= 0) return null;
  return String(Math.round(n * 1_000_000));
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 12, color: "var(--text-2)", marginTop: 10, marginBottom: 6, display: "block" }}>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 13,
  fontFamily: "JetBrains Mono, monospace",
  color: "var(--text-1)",
  background: "var(--bg-shell)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  outline: "none",
};
const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 16px",
  fontSize: 13,
  fontWeight: 600,
  color: "#FFFFFF",
  background: "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
  border: "1px solid #B3007D",
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: "inherit",
};
const ghostBtn: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text-2)",
  background: "var(--bg-shell)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: "inherit",
};

function ExecuteBtn({ withdrawalId }: { withdrawalId: Id<"withdrawals"> }) {
  const execute = useAction(api.withdrawals.execute);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    if (!confirm("Submit this withdrawal to Circle now?")) return;
    setBusy(true);
    setErr(null);
    try {
      await execute({ withdrawalId });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "execute failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button type="button" onClick={onClick} disabled={busy} style={executeBtnStyle} title="Send via Circle Wallets">
        <PaperPlaneTilt size={12} /> {busy ? "Sending…" : "Execute"}
      </button>
      {err && <span style={{ color: "var(--red)", fontSize: 10.5 }}>{err}</span>}
    </div>
  );
}

const executeBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 10px",
  fontSize: 11.5,
  fontWeight: 600,
  color: "#FFFFFF",
  background: "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
  border: "1px solid #B3007D",
  borderRadius: 5,
  cursor: "pointer",
  fontFamily: "inherit",
};

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
