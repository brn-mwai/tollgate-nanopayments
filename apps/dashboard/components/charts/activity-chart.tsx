"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { useThemeTokens } from "@/lib/theme-tokens";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Props = {
  data: number[];
  hoursShown?: number;
  height?: number;
};

// Main activity chart: 24 hourly buckets of paid TX count.
// Theme-reactive — re-renders when html[data-theme] flips.
export function ActivityChart({ data, hoursShown = 24, height = 240 }: Props) {
  const t = useThemeTokens();
  const option = useMemo<EChartsOption>(() => {
    const labels = data.map((_, i) => {
      const hoursAgo = data.length - 1 - i;
      const d = new Date(Date.now() - hoursAgo * 3600_000);
      return d.getHours().toString().padStart(2, "0") + ":00";
    });

    return {
      animation: true,
      animationDuration: 600,
      tooltip: {
        trigger: "axis",
        backgroundColor: t.bgMain,
        borderColor: t.border,
        borderWidth: 1,
        textStyle: { color: t.text1, fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
        padding: [8, 12],
        axisPointer: {
          type: "line",
          lineStyle: { color: t.pink, width: 1, type: "dashed", opacity: 0.7 },
        },
        formatter: (params: any) => {
          const point = Array.isArray(params) ? params[0] : params;
          return `${point.name}<br/><strong style="color:${t.pinkBright}">${point.value}</strong> paid TX`;
        },
      },
      grid: { left: 36, right: 12, top: 16, bottom: 28 },
      xAxis: {
        type: "category",
        data: labels,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: t.text3,
          fontSize: 10,
          fontFamily: "JetBrains Mono, monospace",
          interval: Math.floor(hoursShown / 6),
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: t.gridLine, type: "dashed" } },
        axisLabel: {
          color: t.text3,
          fontSize: 10,
          fontFamily: "JetBrains Mono, monospace",
        },
      },
      series: [
        {
          name: "Paid TX",
          type: "line",
          data,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: t.pink, width: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: t.mode === "light" ? "rgba(255,0,170,0.22)" : "rgba(255,0,170,0.25)" },
                { offset: 1, color: "rgba(255,0,170,0.00)" },
              ],
            },
          },
          emphasis: {
            focus: "series",
            itemStyle: { color: t.pinkBright, borderColor: t.bgMain, borderWidth: 2 },
          },
        },
      ],
    };
  }, [data, hoursShown, t]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      opts={{ renderer: "canvas" }}
      notMerge
    />
  );
}
