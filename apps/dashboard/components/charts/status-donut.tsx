"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { useThemeTokens } from "@/lib/theme-tokens";

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
  const t = useThemeTokens();
  const option = useMemo<EChartsOption>(() => {
    return {
      animation: true,
      tooltip: {
        trigger: "item",
        backgroundColor: t.bgMain,
        borderColor: t.border,
        borderWidth: 1,
        textStyle: { color: t.text1, fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
        padding: [8, 12],
      },
      legend: {
        bottom: 0,
        textStyle: { color: t.text2, fontSize: 11 },
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
                centerValue ? `{v|${centerValue}}` : "",
                centerLabel ? `{l|${centerLabel}}` : "",
              ]
                .filter(Boolean)
                .join("\n");
            },
            rich: {
              v: {
                fontSize: 24,
                fontWeight: 600,
                color: t.text1,
                fontFamily: "JetBrains Mono, monospace",
                lineHeight: 28,
              },
              l: {
                fontSize: 10,
                color: t.text3,
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
            itemStyle: { color: s.color, borderColor: t.bgMain, borderWidth: 2 },
          })),
        },
      ],
    };
  }, [segments, centerLabel, centerValue, t]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      opts={{ renderer: "canvas" }}
      notMerge
    />
  );
}
