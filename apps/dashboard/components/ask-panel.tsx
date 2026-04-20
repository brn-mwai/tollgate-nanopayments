"use client";

import { useEffect, useState } from "react";
import { Sparkle, X, ArrowUp } from "@phosphor-icons/react";

const SUGGESTIONS = [
  "How do I install the SDK on Cloudflare Workers?",
  "Why is my margin 96% and not 100%?",
  "How do HMAC receipts cache 50 requests into 1 TX?",
  "How do I rotate my HMAC secret?",
  "When does CCTP off-ramp settle on Base?",
];

export function AskPanel() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener("tg:open-ask", handler);
    return () => document.removeEventListener("tg:open-ask", handler);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "var(--overlay-panel)",
          zIndex: 100,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "opacity 0.2s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          maxWidth: "92vw",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          zIndex: 101,
          background: "var(--bg-main)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Sparkle size={17} color="var(--pink-bright)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Ask Tollgate</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "var(--text-3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-3)" }}>
            <Sparkle size={36} weight="duotone" color="var(--pink-bright)" style={{ opacity: 0.4, marginBottom: 12, display: "inline-block" }} />
            <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 16 }}>
              Ask anything about Tollgate, 402, or Arc
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  marginBottom: 6,
                  fontSize: 12,
                  color: "var(--text-2)",
                  border: "1px solid var(--border-s)",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: "var(--bg-shell)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-1)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-2)";
                  e.currentTarget.style.borderColor = "var(--border-s)";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 18px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <input
            type="text"
            placeholder="Ask a question..."
            style={{
              flex: 1,
              border: "1px solid var(--border)",
              outline: "none",
              padding: "8px 12px",
              fontSize: 13,
              fontFamily: "inherit",
              color: "var(--text-1)",
              borderRadius: 6,
              background: "#101420",
            }}
          />
          <button
            type="button"
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--border)",
              background: "#101420",
              color: "var(--text-2)",
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </>
  );
}

// Fires Ask panel open from anywhere in the app
export function openAskPanel() {
  document.dispatchEvent(new Event("tg:open-ask"));
}
