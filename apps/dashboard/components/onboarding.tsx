"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";

export function OnboardingCard({ suggestedSlug }: { suggestedSlug: string }) {
  const create = useMutation(api.publishers.create);
  const [slug, setSlug] = useState(suggestedSlug);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await create({ orgSlug: slug.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 32,
        background: "var(--bg-card)",
        maxWidth: 560,
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
        One more step
      </div>
      <h2
        style={{
          fontFamily: "Instrument Serif, serif",
          fontSize: 26,
          marginBottom: 10,
          fontWeight: 400,
        }}
      >
        Pick a name for your organisation
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20, lineHeight: 1.55 }}>
        Used as your URL slug (<code style={{ fontFamily: "JetBrains Mono" }}>app.tollgate.brianmwai.com/<b>{slug || "example"}</b></code>)
        and on referral links.
      </p>

      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
        placeholder="your-org"
        style={{
          width: "100%",
          padding: "10px 12px",
          fontSize: 14,
          fontFamily: "JetBrains Mono, monospace",
          color: "var(--text-1)",
          background: "var(--bg-input)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          outline: "none",
          marginBottom: 12,
        }}
      />

      {error && (
        <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 12 }}>{error}</div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!slug || busy}
        style={{
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 600,
          color: "#FFFFFF",
          background: busy
            ? "rgba(255,0,170,0.5)"
            : "linear-gradient(155deg, #FF3CC0 0%, #FF00AA 55%, #E60098 100%)",
          border: "1px solid #B3007D",
          borderRadius: 6,
          cursor: busy || !slug ? "not-allowed" : "pointer",
          opacity: !slug ? 0.5 : 1,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 1px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.20)",
          textShadow: "0 1px 0 rgba(0,0,0,0.2)",
        }}
      >
        {busy ? "Creating..." : "Create organisation"}
      </button>
    </div>
  );
}
