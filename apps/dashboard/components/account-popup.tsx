"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import {
  CaretUp,
  User,
  CreditCard,
  Key,
  BookOpenText,
  SunDim,
  Monitor,
  Moon,
  SignOut,
} from "@phosphor-icons/react";

type Theme = "light" | "system" | "dark";

export function AccountPopup() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Init theme from html[data-theme]
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as Theme | null;
    if (current) setTheme(current);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  function applyTheme(mode: Theme) {
    setTheme(mode);
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.dataset.theme = prefersDark ? "dark" : "light";
    } else {
      document.documentElement.dataset.theme = mode;
    }
  }

  const initials = (user?.fullName ?? user?.username ?? "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const displayName = user?.fullName ?? user?.username ?? "Account";

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: 0,
            right: 0,
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 6,
            background: "#12131A",
            zIndex: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <MenuItem onClick={() => openUserProfile()} Icon={User}>View profile</MenuItem>
          <MenuItem Icon={CreditCard}>Billing</MenuItem>
          <MenuItem Icon={Key}>API keys</MenuItem>
          <MenuItem Icon={BookOpenText} onClick={() => window.open("https://github.com/brn-mwai/tollgate", "_blank")}>
            Docs
          </MenuItem>
          <Separator />
          <ThemeOpt current={theme} mode="light" Icon={SunDim} onClick={() => applyTheme("light")}>Light</ThemeOpt>
          <ThemeOpt current={theme} mode="system" Icon={Monitor} onClick={() => applyTheme("system")}>System</ThemeOpt>
          <ThemeOpt current={theme} mode="dark" Icon={Moon} onClick={() => applyTheme("dark")}>Dark</ThemeOpt>
          <Separator />
          <MenuItem danger Icon={SignOut} onClick={() => signOut({ redirectUrl: "/" })}>
            Sign out
          </MenuItem>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "10px 12px",
          background: open ? "var(--bg-hover)" : "transparent",
          border: "none",
          cursor: "pointer",
          borderRadius: 6,
          color: "inherit",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF00AA 0%, #2775CA 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-1)" }}>
            {displayName}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {email}
          </div>
        </div>
        <CaretUp
          size={14}
          style={{ color: "var(--text-3)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s ease", flexShrink: 0 }}
        />
      </button>
    </div>
  );
}

function MenuItem({
  children,
  Icon,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  Icon: React.ComponentType<{ size?: number }>;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 10px",
        fontSize: 13,
        color: danger ? "var(--red)" : "var(--text-2)",
        cursor: "pointer",
        borderRadius: 5,
        border: "none",
        background: "none",
        width: "100%",
        fontFamily: "inherit",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget.style.background = danger ? "rgba(198,40,40,0.08)" : "var(--bg-hover)");
        if (!danger) e.currentTarget.style.color = "var(--text-1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
        e.currentTarget.style.color = danger ? "var(--red)" : "var(--text-2)";
      }}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

function ThemeOpt({
  mode,
  current,
  children,
  Icon,
  onClick,
}: {
  mode: Theme;
  current: Theme;
  children: React.ReactNode;
  Icon: React.ComponentType<{ size?: number }>;
  onClick: () => void;
}) {
  const active = current === mode;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 10px",
        fontSize: 13,
        color: active ? "var(--text-1)" : "var(--text-2)",
        fontWeight: active ? 500 : 400,
        cursor: "pointer",
        borderRadius: 5,
        border: "none",
        background: "none",
        width: "100%",
        fontFamily: "inherit",
        textAlign: "left",
      }}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

function Separator() {
  return <div style={{ height: 1, background: "var(--border-s)", margin: "4px 10px" }} />;
}
