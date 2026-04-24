"use client";

// Per-site drill-down: events, quotes with Gemini reasoning, pricing rules.
// The rule editor lets the publisher tune pricing without touching code.

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowSquareOut, Plus, Sparkle, Trash } from "@phosphor-icons/react";
import { relativeTime, shortAddr, shortHash, uUsdcToUsd } from "@/lib/format";
import { arcTxUrl } from "@/lib/links";

export default function SiteDetailPage() {
  const params = useParams<{ siteId: string }>();
  const siteId = params.siteId as Id<"sites">;
  const site = useQuery(api.sites.get, { siteId });
  const quotes = useQuery(api.quotes.recentForSite, { siteId, limit: 30 });
  const rules = useQuery(api.pricingRules.listForSite, { siteId });

  return (
    <div>
      <Link
        href="/app/sites"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: "var(--text-3)",
          textDecoration: "none",
          marginBottom: 14,
        }}
      >
        <ArrowLeft size={13} /> All sites
      </Link>
      {site === undefined && <Hint text="Loading…" />}
      {site && (
        <>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, fontWeight: 400, marginBottom: 4 }}>
                {site.domain}
              </h1>
              <div style={{ fontSize: 13, color: "var(--text-3)" }}>
                Site ID <code style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-2)" }}>{siteId}</code>
              </div>
            </div>
            <span className={`pill ${site.status === "active" ? "pill-green" : "pill-gold"} badge-3d`}>{site.status}</span>
          </div>

          <PricingRulesPanel siteId={siteId} rules={rules ?? []} />
          <QuotesPanel quotes={quotes ?? []} />
        </>
      )}
    </div>
  );
}

function PricingRulesPanel({
  siteId,
  rules,
}: {
  siteId: Id<"sites">;
  rules: Array<{ _id: Id<"pricingRules">; pathPattern: string; priceMicroUsdc: number; botClass?: string; priority: number }>;
}) {
  const upsert = useMutation(api.pricingRules.upsert);
  const remove = useMutation(api.pricingRules.remove);
  const [draft, setDraft] = useState({ pathPattern: "/api/*", priceMicroUsdc: 500, botClass: "", priority: 100 });

  async function add() {
    await upsert({
      siteId,
      pathPattern: draft.pathPattern,
      priceMicroUsdc: draft.priceMicroUsdc,
      botClass: draft.botClass ? draft.botClass : undefined,
      priority: draft.priority,
    });
    setDraft({ pathPattern: "/api/*", priceMicroUsdc: 500, botClass: "", priority: 100 });
  }

  return (
    <div style={panelStyle}>
      <div style={panelHead}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Pricing rules</div>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
          Gemini 3 Flash reads these via Function Calling on every quote — priority descending.
        </div>
      </div>
      <div style={{ padding: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Pattern", "Price", "Bot class", "Priority", ""].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r._id} style={{ borderTop: "1px solid var(--border-s)" }}>
                <Td mono>{r.pathPattern}</Td>
                <Td mono accent>{r.priceMicroUsdc} uUSDC</Td>
                <Td mono>{r.botClass ?? "any"}</Td>
                <Td mono>{r.priority}</Td>
                <Td>
                  <button type="button" onClick={() => remove({ ruleId: r._id })} style={iconBtn} title="Delete">
                    <Trash size={13} />
                  </button>
                </Td>
              </tr>
            ))}
            <tr style={{ borderTop: "1px solid var(--border-s)", background: "var(--bg-sub)" }}>
              <Td>
                <input value={draft.pathPattern} onChange={(e) => setDraft((d) => ({ ...d, pathPattern: e.target.value }))} style={inputStyle} placeholder="/api/*" />
              </Td>
              <Td>
                <input
                  type="number"
                  value={draft.priceMicroUsdc}
                  onChange={(e) => setDraft((d) => ({ ...d, priceMicroUsdc: Number(e.target.value) }))}
                  style={inputStyle}
                  min={100}
                  max={10000}
                />
              </Td>
              <Td>
                <input value={draft.botClass} onChange={(e) => setDraft((d) => ({ ...d, botClass: e.target.value }))} style={inputStyle} placeholder="(any)" />
              </Td>
              <Td>
                <input
                  type="number"
                  value={draft.priority}
                  onChange={(e) => setDraft((d) => ({ ...d, priority: Number(e.target.value) }))}
                  style={inputStyle}
                />
              </Td>
              <Td>
                <button type="button" onClick={add} style={primaryBtnSm}>
                  <Plus size={13} /> Add
                </button>
              </Td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuotesPanel({
  quotes,
}: {
  quotes: Array<{
    _id: string;
    nonce: string;
    path: string;
    priceMicroUsdc: number;
    agentWallet?: string;
    status: string;
    txHash?: string;
    pricerTrace?: string;
    createdAt: number;
  }>;
}) {
  return (
    <div style={{ ...panelStyle, marginTop: 20 }}>
      <div style={panelHead}>
        <div style={{ fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Sparkle size={14} weight="fill" color="#FF3CC0" /> Quotes · Gemini pricing trace
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
          Every 402 issued on this site with its pricing reasoning — full audit trail of every quoted request.
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Time", "Agent", "Path", "Price", "Arc tx", "Status", "Reasoning"].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {quotes.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: "48px 18px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
                No quotes yet. Run the simulator against this site's domain to populate.
              </td>
            </tr>
          )}
          {quotes.map((q) => (
            <tr key={q._id} style={{ borderTop: "1px solid var(--border-s)", verticalAlign: "top" }}>
              <Td mono muted>{relativeTime(q.createdAt)}</Td>
              <Td mono>{q.agentWallet ? shortAddr(q.agentWallet) : "—"}</Td>
              <Td mono>{q.path}</Td>
              <Td mono accent>{uUsdcToUsd(q.priceMicroUsdc)}</Td>
              <Td>
                {q.txHash ? (
                  <a href={arcTxUrl(q.txHash) ?? "#"} target="_blank" rel="noopener noreferrer" style={txLink}>
                    {shortHash(q.txHash)} <ArrowSquareOut size={10} />
                  </a>
                ) : (
                  <span style={{ color: "var(--text-3)" }}>—</span>
                )}
              </Td>
              <Td>
                <span className={`pill ${statusPillClass(q.status)} badge-3d`}>{q.status}</span>
              </Td>
              <Td>
                <span style={{ fontSize: 11, color: "var(--text-2)", maxWidth: 360, display: "inline-block", lineHeight: 1.4 }}>
                  {q.pricerTrace ?? <em style={{ color: "var(--text-3)" }}>—</em>}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function statusPillClass(status: string): string {
  if (status === "settled") return "pill-green";
  if (status === "failed") return "pill-red";
  if (status === "expired") return "pill-gold";
  return "pill-arc";
}

const panelStyle = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  background: "var(--bg-card)",
  overflow: "hidden" as const,
};
const panelHead = {
  padding: "14px 18px",
  borderBottom: "1px solid var(--border)",
};
const thStyle: React.CSSProperties = {
  textAlign: "left",
  fontSize: 10.5,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--text-3)",
  fontWeight: 500,
  padding: "10px 14px",
  borderBottom: "1px solid var(--border-s)",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  fontSize: 12,
  fontFamily: "JetBrains Mono, monospace",
  color: "var(--text-1)",
  background: "var(--bg-shell)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  outline: "none",
};
const primaryBtnSm: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "5px 10px",
  fontSize: 12,
  fontWeight: 600,
  color: "#FFFFFF",
  background: "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
  border: "1px solid #B3007D",
  borderRadius: 5,
  cursor: "pointer",
  fontFamily: "inherit",
};
const iconBtn: React.CSSProperties = {
  padding: "4px 6px",
  border: "1px solid var(--border-s)",
  background: "var(--bg-shell)",
  color: "var(--text-3)",
  borderRadius: 4,
  cursor: "pointer",
};
const txLink: React.CSSProperties = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 11,
  color: "var(--arc-bright)",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};

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
    <td style={{ padding: "11px 14px", fontSize: 12.5, color, fontFamily: mono ? "JetBrains Mono, monospace" : undefined }}>
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
