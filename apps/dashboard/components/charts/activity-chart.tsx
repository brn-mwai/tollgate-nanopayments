"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Props = {
  data: number[];
  hoursShown?: number;
  height?: number;
};

// Main activity chart: 24 hourly buckets of paid TX count.
// Dark theme, Tollgate pink, minimal chrome.
export function ActivityChart({ data, hoursShown = 24, height = 240 }: Props) {
  const option = useMemo<EChartsOption>(() => {
    const labels = data.map((_, i) => {
      // Oldest at [0], newest at [length-1]. Label every 4th hour + last.
      const hoursAgo = data.length - 1 - i;
      const d = new Date(Date.now() - hoursAgo * 3600_000);
      return d.getHours().toString().padStart(2, "0") + ":00";
    });

    return {
      animation: true,
      animationDuration: 600,
      tooltip: {
        trigger: "axis",
        backgroundColor: "#12131A",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        textStyle: { color: "#E8E9F0", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
        padding: [8, 12],
        axisPointer: {
          type: "line",
          lineStyle: { color: "#FF00AA", width: 1, type: "dashed", opacity: 0.7 },
        },
        formatter: (params: any) => {
          const point = Array.isArray(params) ? params[0] : params;
          return `${point.name}<br/><strong style="color:#FF3CC0">${point.value}</strong> paid TX`;
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
          color: "#555770",
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
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)", type: "dashed" } },
        axisLabel: {
          color: "#555770",
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
          lineStyle: { color: "#FF00AA", width: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(255,0,170,0.25)" },
                { offset: 1, color: "rgba(255,0,170,0.00)" },
              ],
            },
          },
          emphasis: {
            focus: "series",
            itemStyle: { color: "#FF3CC0", borderColor: "#FFFFFF", borderWidth: 2 },
          },
        },
      ],
    };
  }, [data, hoursShown]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      opts={{ renderer: "canvas" }}
      notMerge
    />
  );
}
