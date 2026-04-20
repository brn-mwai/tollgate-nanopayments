"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlass, GlobeHemisphereWest, Robot, Receipt } from "@phosphor-icons/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { shortAddr } from "@/lib/format";

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const sites = useQuery(api.sites.list);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => document.getElementById("tg-search-input")?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const filtered = (sites ?? []).filter((s) =>
    q ? s.domain.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "15vh",
      }}
    >
      <div
        style={{
          width: 560,
          maxWidth: "90vw",
          maxHeight: 480,
          border: "1px solid var(--border)",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#12131A",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <MagnifyingGlass size={18} color="var(--text-3)" />
          <input
            id="tg-search-input"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sites, agents, events…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "none",
              fontSize: 14,
              fontFamily: "inherit",
              color: "var(--text-1)",
            }}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              color: "var(--text-3)",
              padding: "2px 6px",
              border: "1px solid var(--border-s)",
              borderRadius: 3,
              cursor: "pointer",
              background: "none",
            }}
          >
            Esc
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {filtered.length > 0 && (
            <>
              <GroupLabel>Sites</GroupLabel>
              {filtered.map((s) => (
                <ResultRow
                  key={s._id}
                  Icon={GlobeHemisphereWest}
                  text={s.domain}
                  meta={`${s.status}`}
                  onClick={() => setOpen(false)}
                />
              ))}
            </>
          )}
          {filtered.length === 0 && (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: "var(--text-3)",
                fontSize: 13,
              }}
            >
              {q ? "No matches." : "Start typing to search sites, agents, or events."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--text-3)",
        padding: "8px 10px 4px",
      }}
    >
      {children}
    </div>
  );
}

function ResultRow({
  Icon,
  text,
  meta,
  onClick,
}: {
  Icon: React.ComponentType<{ size?: number }>;
  text: string;
  meta?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 13,
        color: "var(--text-2)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-hover)";
        e.currentTarget.style.color = "var(--text-1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-2)";
      }}
    >
      <Icon size={15} />
      <span style={{ flex: 1 }}>{text}</span>
      {meta && <span style={{ fontSize: 11, color: "var(--text-3)" }}>{meta}</span>}
    </div>
  );
}
