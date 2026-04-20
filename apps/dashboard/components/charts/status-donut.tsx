"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Segment = { name: string; value: number; color: string };

type Props = {
  segments: Segment[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
};

// Donut chart for status breakdown (onchain / cached / 402 / rejected).
// Center shows totals, legend at the bottom.
export function StatusDonut({ segments, height = 240, centerLabel, centerValue }: Props) {
  const option = useMemo<EChartsOption>(() => {
    return {
      animation: true,
      tooltip: {
        trigger: "item",
        backgroundColor: "#12131A",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        textStyle: { color: "#E8E9F0", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
        padding: [8, 12],
      },
      legend: {
        bottom: 0,
        textStyle: { color: "#8A8CA0", fontSize: 11 },
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 14,
      },
      series: [
        {
          name: "Status",
          type: "pie",
          radius: ["62%", "82%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: true,
          label: {
            show: Boolean(centerLabel || centerValue),
            position: "center",
            formatter: () => {
              if (!centerLabel && !centerValue) return "";
              return [
                centerValue
                  ? `{v|${centerValue}}`
                  : "",
                centerLabel
                  ? `{l|${centerLabel}}`
                  : "",
              ]
                .filter(Boolean)
                .join("\n");
            },
            rich: {
              v: {
                fontSize: 24,
                fontWeight: 600,
                color: "#E8E9F0",
                fontFamily: "JetBrains Mono, monospace",
                lineHeight: 28,
              },
              l: {
                fontSize: 10,
                color: "#555770",
                fontFamily: "JetBrains Mono, monospace",
                textTransform: "uppercase",
                letterSpacing: 0.08,
                lineHeight: 14,
              },
            },
          },
          labelLine: { show: false },
          data: segments.map((s) => ({
            name: s.name,
            value: s.value,
            itemStyle: { color: s.color, borderColor: "#12131A", borderWidth: 2 },
          })),
        },
      ],
    };
  }, [segments, centerLabel, centerValue]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      opts={{ renderer: "canvas" }}
      notMerge
    />
  );
}
