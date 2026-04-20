import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export const dynamic = "force-dynamic";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        background:
          "linear-gradient(160deg, #101420 0%, transparent 35%, transparent 65%, #101420 100%), linear-gradient(160deg, rgba(230,0,126,0.05) 0%, rgba(39,117,202,0.05) 50%, rgba(230,0,126,0.05) 100%), #101420",
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          margin: "8px 8px 8px 0",
          borderRadius: 12,
          border: "1px solid var(--border)",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          background: "#12131A",
        }}
      >
        <Topbar />
        <div style={{ flex: 1, padding: "40px 44px", overflowY: "auto" }}>{children}</div>
      </main>
    </div>
  );
}
