import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { SearchModal } from "@/components/search-modal";
import { AskPanel } from "@/components/ask-panel";

export const dynamic = "force-dynamic";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="page-content">{children}</div>
      </main>
      <SearchModal />
      <AskPanel />
    </div>
  );
}
