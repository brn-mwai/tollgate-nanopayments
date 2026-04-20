"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { User, Key, ShieldCheck, WebhooksLogo, UsersThree, WarningOctagon } from "@phosphor-icons/react";

type Tab = "profile" | "keys" | "hmac" | "webhooks" | "team" | "danger";

export default function SettingsPage() {
  const { user } = useUser();
  const publisher = useQuery(api.publishers.getMine);
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div>
      <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, marginBottom: 4, fontWeight: 400 }}>
        Settings
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>
        Account, keys, secrets, webhooks, team
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

      {tab === "profile" && (
        <Panel title="Profile">
          <Field label="Name" value={user?.fullName ?? ""} readOnly hint="Edit in Clerk profile" />
          <Field label="Email" value={user?.primaryEmailAddress?.emailAddress ?? ""} readOnly hint="Edit in Clerk profile" />
          <Field label="Organisation slug" value={publisher?.orgSlug ?? ""} readOnly />
          <Field label="Plan" value={publisher?.plan ?? ""} readOnly />
        </Panel>
      )}

      {tab === "keys" && <KeysTab />}
      {tab === "hmac" && <Panel title="HMAC receipt secrets" description="Per-site. Rotated daily by cron, or manually here.">
        <HmacInstructions />
      </Panel>}
      {tab === "webhooks" && <Panel title="Webhooks" description="Coming Day 3 with the facilitator." />}
      {tab === "team" && <Panel title="Team" description="Single-tenant for MVP. Invites ship in Y1." />}
      {tab === "danger" && <DangerTab />}
    </div>
  );
}

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
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        background: "rgba(255,255,255,0.025)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        {description && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ padding: "20px 22px" }}>{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  readOnly,
  hint,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 16, maxWidth: 520 }}>
      <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      <input
        value={value}
        readOnly={readOnly}
        style={{
          width: "100%",
          padding: "9px 12px",
          fontSize: 13,
          fontFamily: "inherit",
          color: "var(--text-1)",
          background: "#101420",
          border: "1px solid var(--border)",
          borderRadius: 6,
          outline: "none",
          opacity: readOnly ? 0.7 : 1,
        }}
      />
      {hint && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function KeysTab() {
  const sites = useQuery(api.sites.list);
  return (
    <Panel title="API keys" description="One key per site. SHA-256 hashed at rest. Rotate from the site detail page.">
      {sites === undefined && <div style={{ fontSize: 13, color: "var(--text-3)" }}>Loading...</div>}
      {sites && sites.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>No sites yet. Create one from the Sites tab.</div>
      )}
      {sites && sites.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Domain", "Key hash", "Status", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    fontSize: 10.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-3)",
                    fontWeight: 500,
                    padding: "8px 12px",
                    borderBottom: "1px solid var(--border-s)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s._id} style={{ borderTop: "1px solid var(--border-s)" }}>
                <td style={{ padding: "10px 12px", fontSize: 13 }}>{s.domain}</td>
                <td style={{ padding: "10px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--text-2)" }}>
                  {s.apiKeyHash.slice(0, 12)}…
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span className={s.status === "active" ? "pill pill-green badge-3d" : "pill pill-gold badge-3d"}>
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function HmacInstructions() {
  return (
    <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
      HMAC receipt secrets sign every 402-bypass receipt. They are rotated automatically every 24
      hours via the <code style={{ fontFamily: "JetBrains Mono, monospace" }}>reputation-roll</code> cron.
      Manual rotation lands Day 3 alongside the x402 facilitator wiring.
    </div>
  );
}

function DangerTab() {
  return (
    <div
      style={{
        border: "1px solid rgba(198,40,40,0.4)",
        borderRadius: 10,
        background: "rgba(198,40,40,0.06)",
        padding: "20px 22px",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--red)", marginBottom: 8 }}>
        Danger zone
      </div>
      <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
        Delete organisation, reset all HMAC secrets, purge event history. None of these are wired
        yet — they ship with the migration + CCTP off-ramp flow in Day 4.
      </p>
    </div>
  );
}
