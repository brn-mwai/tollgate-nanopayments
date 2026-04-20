import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { SearchModal } from "@/components/search-modal";
import { ShellProvider } from "@/components/shell-context";

export const dynamic = "force-dynamic";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <ShellProvider>
      <div className="dashboard">
        <Sidebar />
        <main className="main">
          <Topbar />
          <div className="page-content">{children}</div>
        </main>
        <SearchModal />
      </div>
    </ShellProvider>
  );
}
