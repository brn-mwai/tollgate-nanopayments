"use client";

// Theme-aware token reader for client components that can't use CSS variables
// directly (ECharts option objects, canvas renderers). Subscribes to
// html[data-theme] changes so charts re-render on theme switch.

import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

export type ThemeTokens = {
  mode: ThemeMode;
  bgMain: string;
  bgCard: string;
  border: string;
  borderSoft: string;
  text1: string;
  text2: string;
  text3: string;
  pink: string;
  pinkBright: string;
  arc: string;
  arcBright: string;
  green: string;
  gold: string;
  red: string;
  gridLine: string;
};

const DARK: ThemeTokens = {
  mode: "dark",
  bgMain: "#12131A",
  bgCard: "rgba(255,255,255,0.025)",
  border: "rgba(255,255,255,0.1)",
  borderSoft: "rgba(255,255,255,0.06)",
  text1: "#E8E9F0",
  text2: "#8A8CA0",
  text3: "#555770",
  pink: "#FF00AA",
  pinkBright: "#FF3CC0",
  arc: "#2775CA",
  arcBright: "#4F96E0",
  green: "#06A77D",
  gold: "#F2A541",
  red: "#C62828",
  gridLine: "rgba(255,255,255,0.05)",
};

const LIGHT: ThemeTokens = {
  mode: "light",
  bgMain: "#FFFFFF",
  bgCard: "#FFFFFF",
  border: "#E6E6E2",
  borderSoft: "#EFEFEB",
  text1: "#1A1A1A",
  text2: "#5A5A5A",
  text3: "#8E8E93",
  pink: "#FF00AA",
  pinkBright: "#FF3CC0",
  arc: "#2775CA",
  arcBright: "#4F96E0",
  green: "#06A77D",
  gold: "#F2A541",
  red: "#C62828",
  gridLine: "rgba(10,11,16,0.06)",
};

function read(): ThemeTokens {
  if (typeof document === "undefined") return DARK;
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? LIGHT : DARK;
}

export function useThemeTokens(): ThemeTokens {
  const [tokens, setTokens] = useState<ThemeTokens>(() => (typeof document === "undefined" ? DARK : read()));

  useEffect(() => {
    const obs = new MutationObserver(() => setTokens(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  return tokens;
}
