"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type ShellState = {
  collapsed: boolean;
  toggle: () => void;
  set: (v: boolean) => void;
};

const ShellCtx = createContext<ShellState | null>(null);
const LS_KEY = "tollgate-sidebar-collapsed";

export function ShellProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Restore preference on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored === "1") setCollapsed(true);
    } catch {}
  }, []);

  function set(v: boolean) {
    setCollapsed(v);
    try {
      localStorage.setItem(LS_KEY, v ? "1" : "0");
    } catch {}
  }

  return (
    <ShellCtx.Provider value={{ collapsed, toggle: () => set(!collapsed), set }}>
      {children}
    </ShellCtx.Provider>
  );
}

export function useShell(): ShellState {
  const v = useContext(ShellCtx);
  if (!v) {
    // Fail-safe so components don't crash outside a provider (e.g. during
    // storybook-style isolated tests).
    return { collapsed: false, toggle: () => {}, set: () => {} };
  }
  return v;
}
