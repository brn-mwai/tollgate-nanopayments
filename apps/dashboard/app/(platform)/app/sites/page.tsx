"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { Plus, Check, Copy, Key, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

export default function SitesPage() {
  const sites = useQuery(api.sites.list);
  const create = useMutation(api.sites.create);
  const [adding, setAdding] = useState(false);
  const [domain, setDomain] = useState("");
  const [issued, setIssued] = useState<{ apiKey: string; domain: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    try {
      const res = await create({ domain });
      setIssued({ apiKey: res.apiKey, domain });
      setDomain("");
      setAdding(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    }
  }

  return (
    <div>
      <div style={headerRow}>
        <div>
          <h1 style={pageTitle}>Sites</h1>
          <p style={pageSubtitle}>
            {sites?.length ?? 0} configured · per-path pricing lives inside each site
          </p>
        </div>
        <button type="button" style={primaryBtn} onClick={() => setAdding((v) => !v)}>
          <Plus size={15} /> Add site
        </button>
      </div>

      {adding && (
        <div style={panelStyle}>
          <div style={panelHead}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Add a site</div>
          </div>
          <div style={{ padding: 18, maxWidth: 520 }}>
            <label style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6, display: "block" }}>
              Domain
            </label>
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="demo-news.brianmwai.com"
              style={inputStyle}
            />
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6, lineHeight: 1.5 }}>
              Apex or subdomain. Protocol, path, and port are stripped automatically.
              {domain && previewDomain(domain) && previewDomain(domain) !== domain.trim().toLowerCase() && (
                <div style={{ marginTop: 4, fontFamily: "JetBrains Mono, monospace", color: "var(--text-2)" }}>
                  → saved as <span style={{ color: "#FF3CC0" }}>{previewDomain(domain)}</span>
                </div>
              )}
            </div>
            {err && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 8 }}>{err}</div>}
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button type="button" style={primaryBtn} onClick={submit} disabled={!domain || !previewDomain(domain)}>
                Create
              </button>
              <button type="button" style={ghostBtn} onClick={() => setAdding(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {issued && <ApiKeyCallout apiKey={issued.apiKey} domain={issued.domain} onClose={() => setIssued(null)} />}

      {sites === undefined && <EmptyHint text="Loading sites..." />}
      {sites && sites.length === 0 && !adding && (
        <EmptyHint text="No sites yet. Add your first to start monetising bot traffic." />
      )}

      {sites && sites.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {sites.map((s) => (
            <div key={s._id} style={siteCardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={faviconStyle}>{s.domain.slice(0, 2).toUpperCase()}</div>
                <div style={{ fontSize: 14, fontWeight: 600, flex: 1, wordBreak: "break-all" }}>
                  {s.domain}
                </div>
                <span className={s.status === "active" ? "pill pill-green badge-3d" : "pill pill-gold badge-3d"}>
                  {s.status}
                </span>
              </div>
              <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 14 }}>
                <MetaItem label="Status" value={s.status} />
                <MetaItem label="Fail-open" value={s.failOpenOnFacilitator ? "yes" : "no"} />
                <MetaItem label="Token" value={s.verifyToken.slice(0, 12) + "…"} muted />
              </div>
              <div style={{ display: "flex", gap: 6, borderTop: "1px solid var(--border-s)", paddingTop: 12, alignItems: "center" }}>
                {s.status === "unverified" ? (
                  <VerifyBtn siteId={s._id} />
                ) : (
                  <RotateKeyBtn siteId={s._id} domain={s.domain} onRotated={(k) => setIssued({ apiKey: k, domain: s.domain })} />
                )}
                <Link
                  href={`/app/sites/${s._id}`}
                  style={{
                    marginLeft: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--pink-bright)",
                    textDecoration: "none",
                  }}
                >
                  Open <ArrowRight size={12} weight="bold" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VerifyBtn({ siteId }: { siteId: Id<"sites"> }) {
  const verify = useAction(api.sites.verify);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await verify({ siteId });
      setMsg(res.ok ? "Verified." : `Failed: ${res.reason ?? "unknown"}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "verify failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button type="button" style={primaryBtn} onClick={onClick} disabled={busy}>
        <Check size={15} /> {busy ? "Verifying…" : "Verify ownership"}
      </button>
      {msg && <span style={{ fontSize: 11, color: "var(--text-3)" }}>{msg}</span>}
    </div>
  );
}

function RotateKeyBtn({
  siteId,
  domain,
  onRotated,
}: {
  siteId: Id<"sites">;
  domain: string;
  onRotated: (apiKey: string) => void;
}) {
  const rotate = useMutation(api.sites.rotateKey);
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!confirm(`Rotate API key for ${domain}? The current key stops working immediately.`)) return;
    setBusy(true);
    try {
      const res = await rotate({ siteId });
      onRotated(res.apiKey);
    } catch (e) {
      alert(e instanceof Error ? e.message : "rotate failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" style={ghostBtn} onClick={onClick} disabled={busy}>
      <Key size={15} /> {busy ? "Rotating…" : "Rotate key"}
    </button>
  );
}

function ApiKeyCallout({ apiKey, domain, onClose }: { apiKey: string; domain: string; onClose: () => void }) {
  return (
    <div
      style={{
        border: "1px solid #B3007D",
        background: "linear-gradient(155deg, rgba(255,60,192,0.12), rgba(230,0,152,0.08))",
        borderRadius: 10,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
        API key for {domain} — shown once
      </div>
      <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 10 }}>
        Copy it now. We only store a SHA-256 hash. If you lose it, rotate from the site detail page.
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          background: "var(--bg-shell)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "10px 12px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 12,
          alignItems: "center",
        }}
      >
        <code style={{ flex: 1, wordBreak: "break-all" }}>{apiKey}</code>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(apiKey)}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            color: "var(--text-2)",
            padding: "4px 8px",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          <Copy size={13} />
        </button>
      </div>
      <button type="button" onClick={onClose} style={{ ...ghostBtn, marginTop: 12 }}>
        I copied it
      </button>
    </div>
  );
}

function MetaItem({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span
        style={{
          fontSize: 10,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 13,
          fontWeight: 500,
          color: muted ? "var(--text-2)" : "var(--text-1)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// Client-side mirror of the server-side normalizer in convex/sites.ts.
// Keep in sync.
function previewDomain(input: string): string | null {
  let s = input.trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  s = s.replace(/^[^@/]+@/, "");
  s = s.split(/[\/?#]/)[0] ?? s;
  s = s.split(":")[0] ?? s;
  if (!s) return null;
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(s)) {
    return null;
  }
  return s;
}

function EmptyHint({ text }: { text: string }) {
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

// ── shared styles (inline to avoid CSS sprawl before tailwind migration) ──

const headerRow = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 28,
  flexWrap: "wrap" as const,
};
const pageTitle = {
  fontFamily: "Instrument Serif, serif",
  fontSize: 38,
  fontWeight: 400,
  letterSpacing: "-0.01em",
  marginBottom: 6,
};
const pageSubtitle = { fontSize: 13, color: "var(--text-3)" as string };
const panelStyle = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  background: "var(--bg-card)",
  marginBottom: 16,
  overflow: "hidden",
};
const panelHead = { padding: "14px 18px", borderBottom: "1px solid var(--border)" };
const siteCardStyle = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "18px 20px",
  background: "var(--bg-card)",
};
const faviconStyle = {
  width: 32,
  height: 32,
  borderRadius: 6,
  background: "linear-gradient(155deg, rgba(255,0,170,0.2), rgba(39,117,202,0.2))",
  border: "1px solid var(--border)",
  display: "inline-flex",
  alignItems: "center" as const,
  justifyContent: "center" as const,
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 13,
  fontWeight: 600 as const,
  color: "var(--text-1)",
};
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  fontFamily: "JetBrains Mono, monospace",
  color: "var(--text-1)",
  background: "var(--bg-shell)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  outline: "none",
};
const primaryBtn = {
  display: "inline-flex",
  alignItems: "center" as const,
  gap: 6,
  padding: "8px 16px",
  fontSize: 13,
  fontWeight: 600,
  color: "#FFFFFF",
  background: "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
  border: "1px solid #B3007D",
  borderRadius: 6,
  cursor: "pointer",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 1px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.20)",
  textShadow: "0 1px 0 rgba(0,0,0,0.2)",
  fontFamily: "inherit",
};
const ghostBtn = {
  display: "inline-flex",
  alignItems: "center" as const,
  gap: 6,
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
