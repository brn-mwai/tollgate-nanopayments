import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export const dynamic = "force-dynamic";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
