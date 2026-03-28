import { type ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.12),_transparent_28%),linear-gradient(180deg,#f8fffd_0%,#eef7f5_100%)]">
      <div className="mx-auto flex max-w-[1600px]">
        <AppSidebar />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 xl:px-10">
          <div className="space-y-8">
            <Topbar />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
