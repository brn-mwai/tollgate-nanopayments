"use client";

import { ArrowUp, ArrowDown } from "@phosphor-icons/react";
import { Sparkline } from "./charts/sparkline";
import { fmtDelta, type Delta } from "@/lib/delta";

type Props = {
  Icon: React.ComponentType<{ size?: number; weight?: "duotone" | "fill" }>;
  color: "pink" | "green" | "arc" | "gold";
  label: string;
  value: string;
  sub?: string;
  delta?: Delta;
  spark?: number[];
};

const COLOR_HEX: Record<Props["color"], string> = {
  pink: "#FF00AA",
  green: "#06A77D",
  arc: "#2775CA",
  gold: "#F2A541",
};

export function KpiCard({ Icon, color, label, value, sub, delta, spark }: Props) {
  const deltaColor =
    delta?.direction === "up" ? "#06A77D" : delta?.direction === "down" ? "#C62828" : "#555770";
  const ArrowIcon =
    delta?.direction === "up" ? ArrowUp : delta?.direction === "down" ? ArrowDown : null;

  return (
    <div className="stat-card" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div className={`tile tile-${color} badge-3d`}>
          <Icon size={15} weight="duotone" />
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--text-2)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              marginBottom: 4,
              color: "var(--text-1)",
            }}
          >
            {value}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {delta && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: deltaColor,
                }}
              >
                {ArrowIcon && <ArrowIcon size={10} weight="bold" />}
                {fmtDelta(delta)}
              </span>
            )}
            {sub && (
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{sub}</span>
            )}
          </div>
        </div>

        {spark && spark.length > 0 && (
          <div style={{ width: 90, height: 36, flexShrink: 0 }}>
            <Sparkline data={spark} color={COLOR_HEX[color]} height={36} />
          </div>
        )}
      </div>
    </div>
  );
}
