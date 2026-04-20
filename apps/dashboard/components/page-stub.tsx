import type { ReactNode } from "react";

export function PageStub({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Instrument Serif, serif",
              fontSize: 38,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              marginBottom: 6,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>{subtitle}</div>
        </div>
        {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
      </div>
      {children ?? (
        <div
          style={{
            border: "1px dashed var(--border)",
            borderRadius: 10,
            padding: "80px 24px",
            textAlign: "center",
            color: "var(--text-3)",
          }}
        >
          <div style={{ fontSize: 14, marginBottom: 6, color: "var(--text-2)" }}>
            Live data arrives when the Convex queries for this section go live.
          </div>
          <div style={{ fontSize: 12 }}>
            Design preview in{" "}
            <code style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>
              docs/dashboard-preview.html
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
