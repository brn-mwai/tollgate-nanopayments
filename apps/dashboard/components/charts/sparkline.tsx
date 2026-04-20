"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type Props = {
  data: number[];
  color: string;
  height?: number;
  width?: number | string;
};

// Tiny line chart for KPI cards. No axes, no tooltip, no grid. Area
// gradient under the line for depth. Zero DOM bloat.
export function Sparkline({ data, color, height = 32, width = "100%" }: Props) {
  const option = useMemo<EChartsOption>(() => {
    const max = Math.max(1, ...data);
    return {
      animation: false,
      grid: { left: 0, right: 0, top: 2, bottom: 2 },
      xAxis: {
        type: "category",
        show: false,
        boundaryGap: false,
        data: data.map((_, i) => i.toString()),
      },
      yAxis: { type: "value", show: false, min: 0, max: max * 1.1 },
      series: [
        {
          type: "line",
          data,
          smooth: true,
          showSymbol: false,
          lineStyle: { color, width: 1.5 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: color + "55" },
                { offset: 1, color: color + "00" },
              ],
            },
          },
        },
      ],
    };
  }, [data, color]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width }}
      opts={{ renderer: "canvas" }}
      notMerge
    />
  );
}
