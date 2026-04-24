"use client";

// Every tab is wired to live Convex state. Tab selection is URL-synced via
// ?tab=<id> so each tab is deep-linkable and bookmarkable.

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  ArrowSquareOut,
  Check,
  Copy,
  Eye,
  EyeSlash,
  Key,
  PaperPlaneTilt,
  ShieldCheck,
  Sparkle,
  Trash,
  User,
  UsersThree,
  WarningOctagon,
  WebhooksLogo,
} from "@phosphor-icons/react";
import { arcAddressUrl, CIRCLE_DOCS } from "@/lib/links";
import { relativeTime, shortHash } from "@/lib/format";

type Tab = "profile" | "keys" | "hmac" | "webhooks" | "team" | "danger";
const TABS: Tab[] = ["profile", "keys", "hmac", "webhooks", "team", "danger"];

export default function SettingsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SettingsInner />
    </Suspense>
  );
}

function SettingsInner() {
  const router = useRouter();
  const search = useSearchParams();
  const rawTab = search.get("tab");
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "profile";

  function setTab(next: Tab) {
    const url = next === "profile" ? "/app/settings" : `/app/settings?tab=${next}`;
    router.replace(url, { scroll: false });
  }

  return (
    <div>
      <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, marginBottom: 4, fontWeight: 400 }}>
        Settings
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>
        Account · keys · secrets · webhooks · team · danger zone
      </p>

      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--border)", marginBottom: 24, flexWrap: "wrap" }}>
        <TabBtn active={tab === "profile"} onClick={() => setTab("profile")} Icon={User}>
          Profile
        </TabBtn>
        <TabBtn active={tab === "keys"} onClick={() => setTab("keys")} Icon={Key}>
          API keys
        </TabBtn>
        <TabBtn active={tab === "hmac"} onClick={() => setTab("hmac")} Icon={ShieldCheck}>
          HMAC secrets
        </TabBtn>
        <TabBtn active={tab === "webhooks"} onClick={() => setTab("webhooks")} Icon={WebhooksLogo}>
          Webhooks
        </TabBtn>
        <TabBtn active={tab === "team"} onClick={() => setTab("team")} Icon={UsersThree}>
          Team
        </TabBtn>
        <TabBtn active={tab === "danger"} onClick={() => setTab("danger")} Icon={WarningOctagon}>
          Danger zone
        </TabBtn>
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "keys" && <KeysTab />}
      {tab === "hmac" && <HmacTab />}
      {tab === "webhooks" && <WebhooksTab />}
      {tab === "team" && <TeamTab />}
      {tab === "danger" && <DangerTab />}
    </div>
  );
}

// ───────── Profile ─────────

function ProfileTab() {
  const { user } = useUser();
  const publisher = useQuery(api.publishers.getMine);
  const wallet = useQuery(api.wallets.get);
  const rename = useMutation(api.publishers.renameOrg);

  const [editing, setEditing] = useState(false);
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSave() {
    setErr(null);
    setBusy(true);
    try {
      await rename({ orgSlug: slug });
      setEditing(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "rename failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Panel title="Identity" description="Clerk manages name + email.">
        <Field label="Name" value={user?.fullName ?? ""} readOnly hint="Edit in Clerk account settings" />
        <Field label="Email" value={user?.primaryEmailAddress?.emailAddress ?? ""} readOnly />
        <Field label="Clerk ID" value={user?.id ?? ""} readOnly mono />
      </Panel>
      <Panel title="Organisation" description="Publisher row on Convex. Rename keeps all sites + keys.">
        {!editing ? (
          <>
            <Field label="Org slug" value={publisher?.orgSlug ?? ""} readOnly mono />
            <button type="button" style={ghostBtn} onClick={() => { setSlug(publisher?.orgSlug ?? ""); setEditing(true); }} disabled={!publisher}>
              Rename
            </button>
          </>
        ) : (
          <>
            <Field label="New slug" value={slug} onChange={setSlug} mono hint="3-32 chars · lowercase · hyphens" />
            {err && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 10 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" style={primaryBtn} onClick={onSave} disabled={busy || !slug}>
                {busy ? "Saving…" : "Save"}
              </button>
              <button type="button" style={ghostBtn} onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </>
        )}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-s)" }}>
          <Field label="Publisher ID" value={publisher?._id ?? ""} readOnly mono />
          <Field label="Plan" value={publisher?.plan ?? ""} readOnly />
          <Field label="Platform fee" value={publisher ? `${publisher.platformFeeBps} bps` : ""} readOnly />
        </div>
      </Panel>
      <Panel title="Arc address & Circle wallet" description="Provision at /app/wallet, appears here once live." colspan>
        <Field label="Arc address" value={wallet?.address ?? ""} readOnly mono />
        <Field label="Circle wallet ID" value={wallet?.walletId ?? ""} readOnly mono />
        <Field label="Cached balance" value={wallet ? `${wallet.cachedBalanceUuUsdc} uUSDC` : ""} readOnly mono />
        {wallet?.address && arcAddressUrl(wallet.address) && (
          <a
            href={arcAddressUrl(wallet.address) ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", marginTop: 6 }}
          >
            <ArrowSquareOut size={13} /> View on Arc explorer
          </a>
        )}
      </Panel>
    </div>
  );
}

// ───────── API keys ─────────

function KeysTab() {
  const sites = useQuery(api.sites.list);
  const rotate = useMutation(api.sites.rotateKey);
  const [revealed, setRevealed] = useState<{ apiKey: string; domain: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onRotate(siteId: Id<"sites">, domain: string) {
    if (!confirm(`Rotate API key for ${domain}? The current key stops working immediately.`)) return;
    setErr(null);
    setBusyId(siteId);
    try {
      const res = await rotate({ siteId });
      setRevealed({ apiKey: res.apiKey, domain });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "rotate failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Panel title="API keys" description="One per site. SHA-256 hashed at rest. Rotate = plaintext shown once.">
      {err && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 12 }}>{err}</div>}
      {revealed && <RevealCallout label={`New key for ${revealed.domain}`} secret={revealed.apiKey} onClose={() => setRevealed(null)} />}

      {sites === undefined && <Muted>Loading…</Muted>}
      {sites && sites.length === 0 && <Muted>No sites yet. Create one under Sites first.</Muted>}

      {sites && sites.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Domain", "Key hash", "Status", ""].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s._id} style={{ borderTop: "1px solid var(--border-s)" }}>
                <Td>{s.domain}</Td>
                <Td mono muted>{s.apiKeyHash.slice(0, 12)}…{s.apiKeyHash.slice(-4)}</Td>
                <Td>
                  <span className={s.status === "active" ? "pill pill-green badge-3d" : "pill pill-gold badge-3d"}>
                    {s.status}
                  </span>
                </Td>
                <Td>
                  <button type="button" style={ghostBtnSm} onClick={() => onRotate(s._id, s.domain)} disabled={busyId === s._id}>
                    <Key size={12} /> {busyId === s._id ? "Rotating…" : "Rotate"}
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

// ───────── HMAC secrets ─────────

function HmacTab() {
  const sites = useQuery(api.sites.list);
  const [activeSite, setActiveSite] = useState<Id<"sites"> | null>(null);
  const firstSiteId = (sites && sites[0]?._id) ?? null;
  const siteId = activeSite ?? firstSiteId;

  return (
    <Panel
      title="HMAC receipt secrets"
      description="One per site. Signs the 5-minute receipt that short-circuits repeat requests. Rotating invalidates in-flight receipts at the next middleware boot."
    >
      {sites === undefined && <Muted>Loading…</Muted>}
      {sites && sites.length === 0 && <Muted>No sites yet. Create one under Sites to see HMAC history.</Muted>}
      {sites && sites.length > 0 && siteId && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
            {sites.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => setActiveSite(s._id)}
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: siteId === s._id ? 600 : 500,
                  color: siteId === s._id ? "var(--text-1)" : "var(--text-2)",
                  background: siteId === s._id ? "var(--bg-card)" : "var(--bg-shell)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {s.domain}
              </button>
            ))}
          </div>
          <HmacForSite siteId={siteId} />
        </>
      )}
    </Panel>
  );
}

function HmacForSite({ siteId }: { siteId: Id<"sites"> }) {
  const history = useQuery(api.hmac.listForSite, { siteId });
  const rotate = useMutation(api.hmac.rotate);
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onRotate() {
    if (!confirm("Rotate HMAC secret for this site? Middleware must be redeployed with the new value.")) return;
    setErr(null);
    setBusy(true);
    try {
      const res = await rotate({ siteId });
      setRevealed(res.secret);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "rotate failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {revealed && (
        <RevealCallout
          label="New HMAC secret — paste into TOLLGATE_HMAC_SECRET and redeploy"
          secret={revealed}
          onClose={() => setRevealed(null)}
          envKey="TOLLGATE_HMAC_SECRET"
        />
      )}
      {err && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 12 }}>{err}</div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>
          {history?.length ?? 0} key{history?.length === 1 ? "" : "s"} in history
        </div>
        <button type="button" style={primaryBtnSm} onClick={onRotate} disabled={busy}>
          <ShieldCheck size={13} /> {busy ? "Rotating…" : "Rotate now"}
        </button>
      </div>

      {history && history.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Rotated", "Fingerprint"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={h._id} style={{ borderTop: "1px solid var(--border-s)" }}>
                <Td mono muted>{relativeTime(h.rotatedAt)}</Td>
                <Td mono>
                  {h.fingerprint}
                  {i === 0 && (
                    <span className="pill pill-green badge-3d" style={{ marginLeft: 8, fontSize: 10 }}>
                      active
                    </span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(!history || history.length === 0) && (
        <div
          style={{
            border: "1px dashed var(--border)",
            borderRadius: 8,
            padding: 18,
            fontSize: 12.5,
            color: "var(--text-3)",
            lineHeight: 1.55,
          }}
        >
          No HMAC secrets yet. The middleware currently signs with whatever{" "}
          <code style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-2)" }}>TOLLGATE_HMAC_SECRET</code>{" "}
          you gave it at boot. Click <strong>Rotate now</strong> to generate a managed secret here, then update the env var.
        </div>
      )}
    </>
  );
}

// ───────── Webhooks ─────────

function WebhooksTab() {
  const endpoints = useQuery(api.webhookAudit.endpoints);
  const audit = useQuery(api.webhookAudit.recent, { limit: 20 });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
      <Panel title="Inbound endpoints" description="Paste these URLs into Clerk + Circle dashboards so they can deliver events.">
        {endpoints === undefined && <Muted>Loading…</Muted>}
        {endpoints && (
          <>
            <EndpointRow
              label="Clerk user lifecycle"
              url={endpoints.clerk}
              dashLink="https://dashboard.clerk.com"
              events={["user.created", "user.updated", "user.deleted"]}
            />
            <EndpointRow
              label="Circle transfer events"
              url={endpoints.circle}
              dashLink={`${CIRCLE_DOCS}/developer-controlled-create-your-first-wallet`}
              events={["transfers.created", "transfers.updated"]}
            />
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border-s)" }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6 }}>Middleware edge endpoints (SDK → Convex)</div>
              <EndpointRow label="Tollgate quote" url={endpoints.tollgateQuote} events={["POST / 402 build"]} compact />
              <EndpointRow label="Tollgate settle" url={endpoints.tollgateSettle} events={["POST / x402 settle"]} compact />
            </div>
          </>
        )}
      </Panel>

      <Panel
        title="Recent inbound traffic"
        description="Every signed webhook Convex has verified in the last window. Audit-log sourced, never mutated."
      >
        {audit === undefined && <Muted>Loading…</Muted>}
        {audit && audit.clerk.length === 0 && audit.circle.length === 0 && (
          <div style={{ fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.55 }}>
            No webhooks received yet. After pointing Clerk + Circle at the endpoints above, events land here within seconds.
          </div>
        )}
        {audit && (audit.clerk.length > 0 || audit.circle.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <WebhookColumn title="Clerk" rows={audit.clerk} />
            <WebhookColumn title="Circle" rows={audit.circle} />
          </div>
        )}
      </Panel>
    </div>
  );
}

function EndpointRow({
  label,
  url,
  dashLink,
  events,
  compact,
}: {
  label: string;
  url: string | null;
  dashLink?: string;
  events: string[];
  compact?: boolean;
}) {
  return (
    <div style={{ marginBottom: compact ? 8 : 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: compact ? 4 : 6 }}>
        <div style={{ fontSize: compact ? 12 : 13, fontWeight: 600 }}>{label}</div>
        {dashLink && (
          <a
            href={dashLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: "var(--pink-bright)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            Configure <ArrowSquareOut size={11} />
          </a>
        )}
        <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--text-3)", fontFamily: "JetBrains Mono, monospace" }}>
          {events.join(" · ")}
        </span>
      </div>
      <UrlCopyRow url={url} />
    </div>
  );
}

function UrlCopyRow({ url }: { url: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!url) return <Muted>(not configured)</Muted>;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 12px",
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: "var(--bg-shell)",
      }}
    >
      <code style={{ flex: 1, fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis" }}>
        {url}
      </code>
      <button
        type="button"
        onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
        style={iconBtn}
        title="Copy"
      >
        {copied ? <Check size={13} color="#06A77D" /> : <Copy size={13} />}
      </button>
    </div>
  );
}

function WebhookColumn({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ _id: string; action: string; occurredAt: number; meta: unknown }>;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {rows.length === 0 ? (
        <Muted>No events</Muted>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {rows.map((r) => (
            <div
              key={r._id}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid var(--border-s)",
                background: "var(--bg-shell)",
              }}
            >
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--text-1)" }}>{r.action}</span>
              <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: "auto" }}>{relativeTime(r.occurredAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────── Team ─────────

function TeamTab() {
  const { user } = useUser();
  const publisher = useQuery(api.publishers.getMine);

  return (
    <Panel title="Team" description="Single-tenant today. Multi-user invites on the roadmap.">
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 8, border: "1px solid var(--border-s)", background: "var(--bg-shell)", marginBottom: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(155deg, rgba(255,0,170,0.3), rgba(39,117,202,0.3))",
            border: "1px solid var(--border)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
            color: "#FFF",
          }}
        >
          {(user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "?").slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.fullName ?? "—"}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{user?.primaryEmailAddress?.emailAddress ?? ""}</div>
        </div>
        <span className="pill pill-pink badge-3d">owner</span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input placeholder="teammate@company.com" style={{ ...inputStyle, flex: 1 }} disabled />
        <button type="button" style={{ ...primaryBtn, opacity: 0.6, cursor: "not-allowed" }} disabled title="Multi-user on the roadmap">
          <PaperPlaneTilt size={13} /> Invite
        </button>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
        Owner-managed RBAC rolls out with the Cloudflare Worker edge gateway.
      </div>

      {publisher && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border-s)", display: "flex", gap: 24, fontSize: 12 }}>
          <Stat label="Publisher ID" value={publisher._id} mono />
          <Stat label="Plan" value={publisher.plan} />
          <Stat label="Owner Clerk ID" value={user?.id ?? "—"} mono />
        </div>
      )}
    </Panel>
  );
}

// ───────── Danger zone ─────────

function DangerTab() {
  const publisher = useQuery(api.publishers.getMine);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PurgeEventsCard />
      <ResetHmacCard />
      <DeleteOrgCard orgSlug={publisher?.orgSlug ?? null} />
    </div>
  );
}

function PurgeEventsCard() {
  const purge = useMutation(api.publishers.purgeEvents);
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ deleted: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    if (!confirm(`Permanently delete every event older than ${days} days? Quotes + tx hashes stay.`)) return;
    setErr(null);
    setResult(null);
    setBusy(true);
    try {
      const r = await purge({ olderThanDays: days });
      setResult(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "purge failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DangerCard
      title="Purge old events"
      body="Delete events older than the cutoff. Frees Convex storage; quotes + withdrawals + audit log are preserved."
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ fontSize: 12, color: "var(--text-2)" }}>Older than</label>
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{ ...inputStyle, width: 80 }}
          min={1}
          max={365}
        />
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>days</span>
        <button type="button" style={dangerBtn} onClick={onClick} disabled={busy}>
          <Trash size={13} /> {busy ? "Purging…" : "Purge"}
        </button>
      </div>
      {result && <div style={{ fontSize: 12, color: "var(--green)", marginTop: 10 }}>Deleted {result.deleted.toLocaleString()} events.</div>}
      {err && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 10 }}>{err}</div>}
    </DangerCard>
  );
}

function ResetHmacCard() {
  const rotateAll = useMutation(api.hmac.rotateAll);
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState<Array<{ domain: string; secret: string }> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    if (!confirm("Rotate HMAC secret for EVERY site? Every middleware deployment must be updated.")) return;
    setErr(null);
    setBusy(true);
    try {
      const list = await rotateAll();
      setRevealed(list.map((r) => ({ domain: r.domain, secret: r.secret })));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "rotate failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DangerCard
      title="Reset all HMAC secrets"
      body="Rotates every site's receipt secret at once. Useful after a key leak. Every middleware must redeploy."
    >
      {revealed && (
        <div style={{ marginBottom: 12 }}>
          {revealed.map((r, i) => (
            <RevealCallout
              key={r.domain + i}
              label={`${r.domain}`}
              secret={r.secret}
              onClose={() => setRevealed((prev) => prev?.filter((x) => x.domain !== r.domain) ?? null)}
              envKey="TOLLGATE_HMAC_SECRET"
            />
          ))}
        </div>
      )}
      <button type="button" style={dangerBtn} onClick={onClick} disabled={busy}>
        <ShieldCheck size={13} /> {busy ? "Rotating…" : "Rotate all"}
      </button>
      {err && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 10 }}>{err}</div>}
    </DangerCard>
  );
}

function DeleteOrgCard({ orgSlug }: { orgSlug: string | null }) {
  const del = useMutation(api.publishers.deleteOrg);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const matches = typed === orgSlug && Boolean(orgSlug);

  async function onClick() {
    if (!matches) return;
    if (!confirm("Last chance. Delete the org, all sites, all events, all withdrawals?")) return;
    setErr(null);
    setBusy(true);
    try {
      await del({ confirmOrgSlug: typed });
      window.location.href = "/app";
    } catch (e) {
      setErr(e instanceof Error ? e.message : "delete failed");
      setBusy(false);
    }
  }

  return (
    <DangerCard
      title="Delete organisation"
      body="Removes the publisher row, every site, every pricing rule, every quote, every event, every withdrawal. The Clerk user remains."
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={`Type "${orgSlug ?? "org-slug"}" to enable`}
          style={{ ...inputStyle, flex: 1, maxWidth: 280 }}
        />
        <button type="button" style={dangerBtn} onClick={onClick} disabled={!matches || busy}>
          <WarningOctagon size={13} /> {busy ? "Deleting…" : "Delete org"}
        </button>
      </div>
      {err && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 10 }}>{err}</div>}
    </DangerCard>
  );
}

// ───────── Shared bits ─────────

function TabBtn({
  active,
  onClick,
  Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ size?: number; weight?: "duotone" }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "10px 14px",
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--text-1)" : "var(--text-2)",
        background: "none",
        border: "none",
        borderBottom: active ? "2px solid #FF00AA" : "2px solid transparent",
        marginBottom: -1,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "inherit",
      }}
    >
      <Icon size={15} weight="duotone" />
      {children}
    </button>
  );
}

function Panel({
  title,
  description,
  children,
  colspan,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  colspan?: boolean;
}) {
  return (
    <div
      style={{
        gridColumn: colspan ? "1 / -1" : undefined,
        border: "1px solid var(--border)",
        borderRadius: 10,
        background: "var(--bg-card)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        {description && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

function DangerCard({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(232,74,83,0.4)",
        borderRadius: 10,
        background: "rgba(232,74,83,0.05)",
        padding: "18px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <WarningOctagon size={15} weight="fill" color="#E84A53" />
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--red)" }}>{title}</div>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55, marginBottom: 14 }}>{body}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  readOnly,
  hint,
  mono,
  onChange,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  hint?: string;
  mono?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          ...inputStyle,
          fontFamily: mono ? "JetBrains Mono, monospace" : "inherit",
          opacity: readOnly ? 0.75 : 1,
        }}
      />
      {hint && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function RevealCallout({
  label,
  secret,
  onClose,
  envKey,
}: {
  label: string;
  secret: string;
  onClose: () => void;
  envKey?: string;
}) {
  const [show, setShow] = useState(true);
  const [copied, setCopied] = useState(false);
  const displayed = useMemo(() => (show ? secret : "•".repeat(Math.min(60, secret.length))), [show, secret]);

  return (
    <div
      style={{
        border: "1px solid #B3007D",
        background: "linear-gradient(155deg, rgba(255,60,192,0.12), rgba(230,0,152,0.06))",
        borderRadius: 10,
        padding: 16,
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Sparkle size={14} weight="fill" color="#FF3CC0" />
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label} — shown once</div>
      </div>
      {envKey && (
        <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>
          Paste as <code style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-1)" }}>{envKey}</code>.
        </div>
      )}
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
        <code style={{ flex: 1, wordBreak: "break-all", color: "var(--text-1)" }}>{displayed}</code>
        <button type="button" onClick={() => setShow((v) => !v)} style={iconBtn} title={show ? "Hide" : "Show"}>
          {show ? <EyeSlash size={13} /> : <Eye size={13} />}
        </button>
        <button
          type="button"
          onClick={() => { navigator.clipboard.writeText(secret); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
          style={iconBtn}
          title="Copy"
        >
          {copied ? <Check size={13} color="#06A77D" /> : <Copy size={13} />}
        </button>
      </div>
      <button type="button" onClick={onClose} style={{ ...ghostBtn, marginTop: 12 }}>
        I copied it
      </button>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-3)" }}>{label}</span>
      <span style={{ fontSize: 12, color: "var(--text-1)", fontFamily: mono ? "JetBrains Mono, monospace" : undefined }}>{value}</span>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, color: "var(--text-3)" }}>{children}</div>;
}

function Loader() {
  return <div style={{ padding: 80, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>Loading…</div>;
}

// ───────── shared styles ─────────

const thStyle: React.CSSProperties = {
  textAlign: "left",
  fontSize: 10.5,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--text-3)",
  fontWeight: 500,
  padding: "10px 12px",
  borderBottom: "1px solid var(--border-s)",
};
function Td({
  children,
  mono,
  muted,
}: {
  children: React.ReactNode;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      style={{
        padding: "11px 12px",
        fontSize: 12.5,
        color: muted ? "var(--text-3)" : "var(--text-2)",
        fontFamily: mono ? "JetBrains Mono, monospace" : undefined,
      }}
    >
      {children}
    </td>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 13,
  fontFamily: "inherit",
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
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 600,
  color: "#FFFFFF",
  background: "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
  border: "1px solid #B3007D",
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: "inherit",
};
const primaryBtnSm: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  color: "#FFFFFF",
  background: "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
  border: "1px solid #B3007D",
  borderRadius: 5,
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
const ghostBtnSm: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "5px 10px",
  fontSize: 11.5,
  fontWeight: 500,
  color: "var(--text-2)",
  background: "var(--bg-shell)",
  border: "1px solid var(--border)",
  borderRadius: 5,
  cursor: "pointer",
  fontFamily: "inherit",
};
const iconBtn: React.CSSProperties = {
  width: 26,
  height: 26,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg-shell)",
  border: "1px solid var(--border-s)",
  color: "var(--text-2)",
  borderRadius: 5,
  cursor: "pointer",
};
const dangerBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 14px",
  fontSize: 12.5,
  fontWeight: 600,
  color: "#FFFFFF",
  background: "linear-gradient(155deg, #E84A53, #C82840)",
  border: "1px solid #8B1F2C",
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: "inherit",
};
